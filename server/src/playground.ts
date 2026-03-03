import {
  startServer,
  BaseEntityControllerEvent,
  DefaultPlayerEntity,
  DefaultPlayerEntityController,
  Player,
  PlayerEvent,
  ProceduralChunkProvider,
  PersistenceChunkProvider,
  World,
  WorldLoopEvent,
  type WorldMap,
} from './';

import { sampleSurfaceHeight } from './worlds/maps/TerrainGenerator';
import FlyablePlayerEntityController from './playground/FlyablePlayerEntityController';
import worldMap from '../../assets/release/maps/boilerplate-small.json';

const USE_PROCEDURAL = true; // Set true to test procedural + binary persistence
const USE_PERSISTENCE = true; // Persist modified chunks to ./world-data
const SPAWN_PRELOAD_RADIUS = 4; // chunks around spawn
const CHUNK_LOAD_RADIUS_BLOCKS = 350; // load chunks within this distance of players (horizontal)
const CHUNK_UNLOAD_RADIUS_BLOCKS = 420; // unload beyond this (buffer > load to avoid thrashing)
const CHUNKS_PER_TICK = 8; // max new chunks to load per tick (keeps movement smooth)
const UNLOAD_INTERVAL_TICKS = 60; // run unload pass every ~1 sec
const CHUNKS_PER_UNLOAD_PASS = 50; // cap unloads per pass to avoid hitches
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
    ];
    const blockTypes = [...baseBlockTypes, ...proceduralBlockTypes];
    defaultWorld.loadMap({
      blockTypes,
      blocks: {},
      entities: {},
    });
    defaultWorld.setSkyboxUri('skyboxes/partly-cloudy');
    defaultWorld.setSkyboxIntensity(1);

    const procedural = new ProceduralChunkProvider(TERRAIN_OPTIONS);
    const provider = USE_PERSISTENCE
      ? new PersistenceChunkProvider('./world-data', procedural)
      : procedural;
    defaultWorld.chunkLattice.setChunkProvider(provider);

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
    let tickCount = 0;
    defaultWorld.on(WorldLoopEvent.TICK_END, () => {
      loadChunksAroundPlayers(defaultWorld, CHUNK_LOAD_RADIUS_BLOCKS, CHUNKS_PER_TICK);
      tickCount++;
      if (tickCount >= UNLOAD_INTERVAL_TICKS) {
        tickCount = 0;
        unloadDistantChunks(defaultWorld, CHUNK_UNLOAD_RADIUS_BLOCKS, CHUNKS_PER_UNLOAD_PASS);
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

/** Load chunks within radius of all players (horizontal XZ). Spreads loading across ticks. */
function loadChunksAroundPlayers(world: World, radiusBlocks: number, maxPerTick: number): void {
  const lattice = world.chunkLattice;
  const players = world.entityManager.getAllPlayerEntities();
  if (players.length === 0) return;

  const radiusChunks = Math.ceil(radiusBlocks / 16);
  const toLoad: { origin: { x: number; y: number; z: number }; distSq: number }[] = [];

  for (const entity of players) {
    const pos = entity.position;
    const pcx = Math.floor(pos.x / 16);
    const pcz = Math.floor(pos.z / 16);

    for (let cx = pcx - radiusChunks; cx <= pcx + radiusChunks; cx++) {
      for (let cz = pcz - radiusChunks; cz <= pcz + radiusChunks; cz++) {
        const chunkCenterX = cx * 16 + 8;
        const chunkCenterZ = cz * 16 + 8;
        const dx = pos.x - chunkCenterX;
        const dz = pos.z - chunkCenterZ;
        const distSq = dx * dx + dz * dz;
        if (distSq > radiusBlocks * radiusBlocks) continue;

        for (let cy = 0; cy < 6; cy++) {
          const origin = { x: cx * 16, y: cy * 16, z: cz * 16 };
          if (lattice.hasChunk(origin)) continue;
          toLoad.push({ origin, distSq });
        }
      }
    }
  }

  toLoad.sort((a, b) => a.distSq - b.distSq);
  const unique = new Map<string, typeof toLoad[0]>();
  for (const t of toLoad) {
    const key = `${t.origin.x},${t.origin.y},${t.origin.z}`;
    if (!unique.has(key)) unique.set(key, t);
  }
  const sorted = Array.from(unique.values()).slice(0, maxPerTick);

  for (const { origin } of sorted) {
    lattice.getOrCreateChunk(origin);
  }
}

/** Unload chunks beyond radius of ALL players. Keeps memory bounded and server smooth. */
function unloadDistantChunks(world: World, unloadRadiusBlocks: number, maxPerPass: number): void {
  const lattice = world.chunkLattice;
  const players = world.entityManager.getAllPlayerEntities();
  if (players.length === 0) return;

  const unloadRadiusSq = unloadRadiusBlocks * unloadRadiusBlocks;
  const toUnload: { x: number; y: number; z: number }[] = [];

  for (const chunk of lattice.getAllChunks()) {
    const origin = chunk.originCoordinate;
    const cx = origin.x + 8;
    const cz = origin.z + 8;

    let keep = false;
    for (const entity of players) {
      const pos = entity.position;
      const dx = pos.x - cx;
      const dz = pos.z - cz;
      if (dx * dx + dz * dz <= unloadRadiusSq) {
        keep = true;
        break;
      }
    }
    if (!keep) toUnload.push(origin);
  }

  for (let i = 0; i < Math.min(toUnload.length, maxPerPass); i++) {
    lattice.unloadChunk(toUnload[i]);
  }
}