import {
  startServer,
  BaseEntityControllerEvent,
  ChunkLatticeEvent,
  ColliderShape,
  DefaultPlayerEntity,
  DefaultPlayerEntityController,
  Entity,
  Player,
  PlayerEvent,
  PlayerUIEvent,
  ProceduralChunkProvider,
  PersistenceChunkProvider,
  RigidBodyType,
  World,
  WorldLoopEvent,
  type WorldMap,
} from './';

import { sampleSurfaceHeight } from './worlds/maps/TerrainGenerator';
import { sampleBiome } from './worlds/maps/Biomes';
import FlyablePlayerEntityController from './playground/FlyablePlayerEntityController';
import worldMap from '../../assets/release/maps/boilerplate-small.json';

const USE_PROCEDURAL = true; // Set true to test procedural + binary persistence
const USE_PERSISTENCE = true; // Persist modified chunks to ./world-data
const SPAWN_PRELOAD_RADIUS = 4; // chunks around spawn
const VIEW_CHUNK_OPTIONS = [4, 6, 8, 10, 12, 16, 20] as const; // chunks (4=64 blocks, 8=128, etc.)
const DEFAULT_VIEW_CHUNKS = 4; // 64 blocks radius - smooth performance
const CHUNK_UNLOAD_BUFFER_CHUNKS = 2; // unload radius = load + this
const CHUNKS_PER_TICK = 8; // max new chunks to load per tick
const UNLOAD_INTERVAL_TICKS = 60; // run unload pass every ~1 sec
const CHUNKS_PER_UNLOAD_PASS = 50; // cap unloads per pass to avoid hitches
const UNLOAD_GRACE_TICKS = 90; // chunks must be out of range this long before unload (reduces thrash)
const DEBUG_CHUNK_STATS = false; // set true to log chunk count + tick time every 5 sec
const SPAWN_X = 0;
const SPAWN_Z = 0;

const TERRAIN_OPTIONS = {
  seed: 12345,
  seaLevel: 32,
  maxHeight: 96,
  caves: true,
  ores: true,
  rivers: true,
  vegetation: true,
};

/**
 * A local running server/playground for quick testing
 * and development of server code without
 * having to build the server.
 */

startServer(defaultWorld => {
  if (USE_PROCEDURAL) {
    // Load block types: boilerplate + procedural blocks (dirt, gravel, ores, bedrock, vegetation)
    const baseBlockTypes = (worldMap as WorldMap).blockTypes;
    const proceduralBlockTypes = [
      { id: 17, name: 'dirt', textureUri: 'blocks/dirt.png', isCustom: false, isMultiTexture: false },
      { id: 18, name: 'bedrock', textureUri: 'blocks/bedrock.png', isCustom: false, isMultiTexture: false },
      { id: 19, name: 'gravel', textureUri: 'blocks/gravel.png', isCustom: false, isMultiTexture: false },
      { id: 20, name: 'iron-ore', textureUri: 'blocks/iron-ore.png', isCustom: false, isMultiTexture: false },
      { id: 21, name: 'gold-ore', textureUri: 'blocks/gold-ore.png', isCustom: false, isMultiTexture: false },
      { id: 22, name: 'diamond-ore', textureUri: 'blocks/diamond-ore.png', isCustom: false, isMultiTexture: false },
      { id: 23, name: 'snow', textureUri: 'blocks/snow.png', isCustom: false, isMultiTexture: false },
      { id: 24, name: 'grass-snow-block', textureUri: 'blocks/grass-snow-block', isCustom: false, isMultiTexture: true },
      { id: 25, name: 'cobblestone-snow', textureUri: 'blocks/cobblestone-snow', isCustom: false, isMultiTexture: true },
      { id: 26, name: 'snow-rocky', textureUri: 'blocks/snow-rocky.png', isCustom: false, isMultiTexture: false },
      { id: 27, name: 'sandstone', textureUri: 'blocks/sandstone', isCustom: false, isMultiTexture: true },
      { id: 28, name: 'mossy-cobblestone', textureUri: 'blocks/mossy-cobblestone.png', isCustom: false, isMultiTexture: false },
      { id: 29, name: 'hay-block', textureUri: 'blocks/hay-block', isCustom: false, isMultiTexture: true },
      { id: 30, name: 'birch-log', textureUri: 'blocks/birch-log', isCustom: false, isMultiTexture: true },
      { id: 31, name: 'farmland', textureUri: 'blocks/farmland', isCustom: false, isMultiTexture: true },
      { id: 32, name: 'lava', textureUri: 'blocks/lava.png', isCustom: false, isMultiTexture: false, isLiquid: true },
      { id: 33, name: 'magma-block', textureUri: 'blocks/magma-block.png', isCustom: false, isMultiTexture: false },
    ];
    const blockTypes = [...baseBlockTypes, ...proceduralBlockTypes];
    defaultWorld.loadMap({
      blockTypes,
      blocks: {},
      entities: {},
    });
    defaultWorld.setSkyboxUri('skyboxes/partly-cloudy');
    defaultWorld.setSkyboxIntensity(1);
    defaultWorld.setFogColor({ r: 200, g: 220, b: 245 });
    defaultWorld.setFogFar(72);
    defaultWorld.setFogNear(20);

    const procedural = new ProceduralChunkProvider(TERRAIN_OPTIONS);
    const provider = USE_PERSISTENCE
      ? new PersistenceChunkProvider('./world-data', procedural)
      : procedural;
    defaultWorld.chunkLattice.setChunkProvider(provider);

    // Spawn environmental entities (cactus, dry-bush, grass-tall) in procedural chunks
    const chunkEnvironmentalEntities = new Map<string, Entity[]>();
    const CACTUS_DENSITY = 0.035;
    const DRY_BUSH_DENSITY = 0.055;
    const GRASS_TALL_DENSITY = 0.10;
    const SNOWY_FIR_DENSITY = 0.03;
    const SNOWY_ROCK_DENSITY = 0.04;

    function hashEnv(gx: number, gz: number, seed: number): number {
      let h = seed;
      h = Math.imul(h ^ gx, 0x85ebca6b);
      h = Math.imul(h ^ gz, 0x27d4eb2d);
      return (h ^ (h >>> 16)) >>> 0;
    }

    function spawnEnvEntity(modelUri: string, name: string, world: World, gx: number, surfaceY: number, gz: number): Entity {
      const e = new Entity({
        name,
        modelUri,
        isEnvironmental: true,
        modelPreferredShape: ColliderShape.NONE,
        rigidBodyOptions: { type: RigidBodyType.FIXED },
      });
      e.spawn(world, { x: gx + 0.5, y: surfaceY + 1, z: gz + 0.5 });
      return e;
    }

    defaultWorld.on(ChunkLatticeEvent.ADD_CHUNK, ({ chunk }) => {
      const ox = chunk.originCoordinate.x;
      const oy = chunk.originCoordinate.y;
      const oz = chunk.originCoordinate.z;
      const chunkKey = `${ox},${oy},${oz}`;
      const entities: Entity[] = [];

      for (let lz = 0; lz < 16; lz++) {
        for (let lx = 0; lx < 16; lx++) {
          const gx = ox + lx;
          const gz = oz + lz;
          const biome = sampleBiome(gx, gz, { seed: TERRAIN_OPTIONS.seed });
          const surfaceY = sampleSurfaceHeight(gx, gz, TERRAIN_OPTIONS);
          if (surfaceY < oy || surfaceY >= oy + 16) continue;

          if (biome.id === 'desert') {
            if ((hashEnv(gx, gz, TERRAIN_OPTIONS.seed + 5555) % 100) / 100 < CACTUS_DENSITY) {
              entities.push(spawnEnvEntity('models/environment/Desert/cactus.gltf', 'cactus', defaultWorld, gx, surfaceY, gz));
            }
            if ((hashEnv(gx, gz, TERRAIN_OPTIONS.seed + 6666) % 100) / 100 < DRY_BUSH_DENSITY) {
              entities.push(spawnEnvEntity('models/environment/Desert/dry-bush.gltf', 'dry-bush', defaultWorld, gx, surfaceY, gz));
            }
          } else if (biome.id === 'plains' || biome.id === 'forest') {
            if ((hashEnv(gx, gz, TERRAIN_OPTIONS.seed + 7777) % 100) / 100 < GRASS_TALL_DENSITY) {
              entities.push(spawnEnvEntity('models/environment/Plains/grass-tall.gltf', 'grass-tall', defaultWorld, gx, surfaceY, gz));
            }
          }
        }
      }

      if (entities.length > 0) chunkEnvironmentalEntities.set(chunkKey, entities);
    });

    defaultWorld.on(ChunkLatticeEvent.REMOVE_CHUNK, ({ chunk }) => {
      const chunkKey = `${chunk.originCoordinate.x},${chunk.originCoordinate.y},${chunk.originCoordinate.z}`;
      const entities = chunkEnvironmentalEntities.get(chunkKey);
      if (entities) {
        for (const e of entities) e.despawn();
        chunkEnvironmentalEntities.delete(chunkKey);
      }
    });

    // Preload chunks around spawn (including higher for mountains/trees)
    for (let cx = -SPAWN_PRELOAD_RADIUS; cx <= SPAWN_PRELOAD_RADIUS; cx++) {
      for (let cz = -SPAWN_PRELOAD_RADIUS; cz <= SPAWN_PRELOAD_RADIUS; cz++) {
        for (let cy = 0; cy < 6; cy++) {
          defaultWorld.chunkLattice.getOrCreateChunk({
            x: cx * 16,
            y: cy * 16,
            z: cz * 16,
          });
        }
      }
    }
  } else {
    defaultWorld.loadMap(worldMap as WorldMap);
  }
  defaultWorld.simulation.enableDebugRendering(true);
  defaultWorld.on(PlayerEvent.JOINED_WORLD, playerJoinedWorld);
  defaultWorld.on(PlayerEvent.LEFT_WORLD, playerLeftWorld);

  if (USE_PROCEDURAL) {
    const viewChunks = { value: DEFAULT_VIEW_CHUNKS };
    defaultWorld.chatManager.registerCommand('/view', (player, args) => {
      if (args.length === 0) {
        defaultWorld.chatManager.sendPlayerMessage(
          player,
          `View distance: ${viewChunks.value} chunks (${viewChunks.value * 16} blocks). Use /view [4|6|8|10|12|16|20] to change.`,
          'AAAAAA'
        );
        return;
      }
      const n = parseInt(args[0], 10);
      if (!Number.isInteger(n) || !(VIEW_CHUNK_OPTIONS as readonly number[]).includes(n)) {
        defaultWorld.chatManager.sendPlayerMessage(
          player,
          `Use /view [4|6|8|10|12|16|20]. Current: ${viewChunks.value} chunks.`,
          'FF6666'
        );
        return;
      }
      viewChunks.value = n;
      defaultWorld.chatManager.sendPlayerMessage(
        player,
        `View distance set to ${n} chunks (${n * 16} blocks). Lower = less lag.`,
        '66FF66'
      );
    });

    let tickCount = 0;
    const chunkLastInRangeTick = new Map<string, number>();
    defaultWorld.on(WorldLoopEvent.TICK_END, ({ worldLoop, tickDurationMs }) => {
      const tick = worldLoop.currentTick;
      const loadRadius = viewChunks.value * 16;
      const unloadRadius = (viewChunks.value + CHUNK_UNLOAD_BUFFER_CHUNKS) * 16;
      loadChunksAroundPlayers(defaultWorld, loadRadius, CHUNKS_PER_TICK);
      tickCount++;
      if (tickCount >= UNLOAD_INTERVAL_TICKS) {
        tickCount = 0;
        unloadDistantChunks(defaultWorld, unloadRadius, CHUNKS_PER_UNLOAD_PASS, UNLOAD_GRACE_TICKS, tick, chunkLastInRangeTick);
      }
      if (DEBUG_CHUNK_STATS && tick > 0 && tick % 300 === 0) {
        const count = defaultWorld.chunkLattice.chunkCount;
        console.log(`[ChunkStats] tick=${tick} chunks=${count} view=${viewChunks.value} lastTickMs=${tickDurationMs.toFixed(2)}`);
      }
    });
  }
});

function playerJoinedWorld({ player, world }: { player: Player, world: World }) {
  const playerEntity = new DefaultPlayerEntity({
    player,
    name: 'Player',
    controller: new FlyablePlayerEntityController(),
  });

  // Spawn 1 block above terrain surface
  const surfaceY = sampleSurfaceHeight(SPAWN_X, SPAWN_Z, TERRAIN_OPTIONS);
  const spawnY = Math.max(surfaceY + 1, 32);
  playerEntity.spawn(world, { x: SPAWN_X, y: spawnY, z: SPAWN_Z });

  // Teleport via DebugPanel or UI: adjust x,y,z and send { type: 'teleport', x, y, z }
  player.ui.on(PlayerUIEvent.DATA, ({ data }) => {
    if (data?.type === 'teleport' && data.x != null && data.y != null && data.z != null) {
      const x = Number(data.x);
      const y = Number(data.y);
      const z = Number(data.z);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        playerEntity.setPosition({ x, y, z });
        playerEntity.setLinearVelocity({ x: 0, y: 0, z: 0 }); // Stop drift from carry-over velocity
      }
    }
  });

  // Block placement/removal for testing
  const controller = playerEntity.controller as DefaultPlayerEntityController;
  controller.on(BaseEntityControllerEvent.TICK_WITH_PLAYER_INPUT, ({ input }) => {
    if (!input.ml && !input.mr) return;

    const pos = playerEntity.position;
    const dir = player.camera.facingDirection;
    const origin = {
      x: pos.x + dir.x * 0.5,
      y: pos.y + dir.y * 0.5 + player.camera.offset.y,
      z: pos.z + dir.z * 0.5,
    };

    const hit = world.simulation.raycast(origin, dir, 5, {
      filterExcludeRigidBody: playerEntity.rawRigidBody,
    });

    if (!hit?.hitBlock) return;

    if (input.ml) {
      world.chunkLattice.setBlock(hit.hitBlock.globalCoordinate, 0);
      player.input.ml = false;
    }

    if (input.mr) {
      const placeCoord = hit.hitBlock.getNeighborGlobalCoordinateFromHitPoint(hit.hitPoint);
      world.chunkLattice.setBlock(placeCoord, 3);
      player.input.mr = false;
    }
  });
}

function playerLeftWorld({ player, world }: { player: Player, world: World }) {
  world.entityManager.getPlayerEntitiesByPlayer(player).forEach(entity => entity.despawn());
}

/** Load chunks within radius of all players. Prioritizes chunks in front of view direction. */
function loadChunksAroundPlayers(world: World, radiusBlocks: number, maxPerTick: number): void {
  const lattice = world.chunkLattice;
  const entities = world.entityManager.getAllPlayerEntities();
  if (entities.length === 0) return;

  const radiusChunks = Math.ceil(radiusBlocks / 16);
  const radiusSq = radiusBlocks * radiusBlocks;
  const toLoad: { origin: { x: number; y: number; z: number }; sortKey: number }[] = [];

  for (const entity of entities) {
    const pos = entity.position;
    const dir = entity.player.camera.facingDirection;
    const pcx = Math.floor(pos.x / 16);
    const pcz = Math.floor(pos.z / 16);

    for (let cx = pcx - radiusChunks; cx <= pcx + radiusChunks; cx++) {
      for (let cz = pcz - radiusChunks; cz <= pcz + radiusChunks; cz++) {
        const chunkCenterX = cx * 16 + 8;
        const chunkCenterZ = cz * 16 + 8;
        const dx = pos.x - chunkCenterX;
        const dz = pos.z - chunkCenterZ;
        const distSq = dx * dx + dz * dz;
        if (distSq > radiusSq) continue;

        const toChunkX = chunkCenterX - pos.x;
        const toChunkZ = chunkCenterZ - pos.z;
        const inFront = toChunkX * dir.x + toChunkZ * dir.z;
        const dist = Math.sqrt(distSq);
        const inFrontNorm = dist > 0 ? inFront / dist : 0;
        const viewBonus = Math.max(0, inFrontNorm) * 150;
        const sortKey = distSq - viewBonus * viewBonus;

        for (let cy = 0; cy < 6; cy++) {
          const origin = { x: cx * 16, y: cy * 16, z: cz * 16 };
          if (lattice.hasChunk(origin)) continue;
          toLoad.push({ origin, sortKey });
        }
      }
    }
  }

  toLoad.sort((a, b) => a.sortKey - b.sortKey);
  const unique = new Map<string, typeof toLoad[0]>();
  for (const t of toLoad) {
    const key = `${t.origin.x},${t.origin.y},${t.origin.z}`;
    const existing = unique.get(key);
    if (!existing || t.sortKey < existing.sortKey) unique.set(key, t);
  }
  const sorted = Array.from(unique.values()).slice(0, maxPerTick);

  for (const { origin } of sorted) {
    lattice.getOrCreateChunk(origin);
  }
}

/** Unload chunks beyond radius of ALL players. Grace period reduces thrashing. */
function unloadDistantChunks(
  world: World,
  unloadRadiusBlocks: number,
  maxPerPass: number,
  graceTicks: number,
  currentTick: number,
  lastInRangeTick: Map<string, number>
): void {
  const lattice = world.chunkLattice;
  const players = world.entityManager.getAllPlayerEntities();
  if (players.length === 0) return;

  const unloadRadiusSq = unloadRadiusBlocks * unloadRadiusBlocks;
  const toUnload: { x: number; y: number; z: number }[] = [];

  for (const chunk of lattice.getAllChunks()) {
    const origin = chunk.originCoordinate;
    const key = `${origin.x},${origin.y},${origin.z}`;
    const cx = origin.x + 8;
    const cz = origin.z + 8;

    let inRange = false;
    for (const entity of players) {
      const pos = entity.position;
      const dx = pos.x - cx;
      const dz = pos.z - cz;
      if (dx * dx + dz * dz <= unloadRadiusSq) {
        inRange = true;
        break;
      }
    }

    if (inRange) {
      lastInRangeTick.set(key, currentTick);
    } else {
      const last = lastInRangeTick.get(key);
      if (last === undefined) lastInRangeTick.set(key, currentTick);
      else if (currentTick - last >= graceTicks) {
        toUnload.push(origin);
        lastInRangeTick.delete(key);
      }
    }
  }

  for (let i = 0; i < Math.min(toUnload.length, maxPerPass); i++) {
    lattice.unloadChunk(toUnload[i]);
  }
}