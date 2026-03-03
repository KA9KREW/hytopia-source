# Procedural Map Implementation Plan

**Full implementation plan across the SDK, Engine, World Editor, and Demo** for realistic large maps using procedural generation + sparse persistence (Minecraft/Hytale/bloxd pattern).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State](#2-current-state)
3. [Architecture Overview](#3-architecture-overview)
4. [Engine (hytopia-source/server)](#4-engine-hytopia-sourceserver)
5. [SDK (hytopia-source/sdk)](#5-sdk-hytopia-sourcesdk)
6. [World Editor (hyworldeditor)](#6-world-editor-hyworldeditor)
7. [Demo (hytopia-demo)](#7-demo-hytopia-demo)
8. [Implementation Phases](#8-implementation-phases)
9. [Testing & Validation](#9-testing--validation)

---

## 1. Executive Summary

| Component | Role | Key Changes |
|-----------|------|-------------|
| **Engine** | Chunk loading, persistence, generation | ChunkProvider abstraction, lazy loading, region files |
| **SDK** | Public API | New types, WorldOptions extensions, backward compatibility |
| **World Editor** | Map creation, export | Region export, optional shared terrain algo |
| **Demo** | Reference integration | Procedural world option, persistence demo |

**Backward compatibility:** `World.loadMap(WorldMap)` remains. New `WorldOptions.chunkProvider` and `WorldOptions.seed` enable procedural worlds.

---

## 2. Current State

### Engine (server/)

| File | Current Behavior |
|------|------------------|
| `World.ts` | `loadMap(WorldMap)` → `chunkLattice.initializeBlockEntries()` with blocks from JSON |
| `ChunkLattice.ts` | `getOrCreateChunk()` creates empty chunk if missing; no provider |
| `Chunk.ts` | 16³ blocks, Uint8Array, sparse rotations |
| `NetworkSynchronizer.ts` | Listens to `ADD_CHUNK`, `REMOVE_CHUNK`, `SET_BLOCK`; syncs all chunks to clients |

### SDK (sdk/)

- Exports `World`, `WorldMap`, `ChunkLattice`, `Chunk`, `loadMap`
- `WorldOptions.map?: WorldMap` — optional initial map
- No `ChunkProvider` or procedural APIs

### World Editor (hyworldeditor/world-editor/)

| Component | Current Behavior |
|-----------|------------------|
| `ImportExport.tsx` | Import: reads `map.json` from ZIP. Export: writes `map.json` to ZIP (WorldMap format) |
| `SeedGeneratorTool.tsx` | `generateWorldFromSeed()` → `generateHytopiaWorld()` → loads into editor |
| `generateWorldToZip()` | Generates terrain → exports to ZIP with map.json |
| `TerrainGenerator.js` | Perlin noise, biomes, caves, ores; deterministic from seed |
| `SeedDerivation.js` | `deriveWorldFromSeed(seed)`, `seedStringToNumber(seed)` |

### Demo (hytopia-demo/)

- `world.loadMap(worldMap)` from `assets/map.json`
- Custom chunk streaming in `WorldLoopEvent.TICK_END` — calls `chunk.despawn()` / `chunk.spawn(world)` by distance
- **Note:** `Chunk` in the engine does not currently expose `spawn`/`despawn`; this logic may be a no-op or target a different internal API. The plan adds `ChunkLattice.unloadChunk()` to enable proper streaming.
- Uses `@hytopia.com/examples` + `hytopia` SDK

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         NEW DATA FLOW (Procedural + Persistence)                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WorldOptions { seed?, chunkProvider?, map? }                                    │
│       │                                                                         │
│       ├── map (WorldMap) ─────────────► loadMap() ──► ChunkLattice (legacy)     │
│       │                                                                         │
│       └── chunkProvider ─────────────► ChunkLattice.getOrCreateChunk()          │
│                │                              │                                 │
│                │                              │  chunk missing?                 │
│                │                              ▼                                 │
│                │                     ChunkProvider.getChunk(origin)              │
│                │                              │                                 │
│                │              ┌───────────────┼───────────────┐                 │
│                │              │               │               │                 │
│                │              ▼               ▼               ▼                 │
│                │        PersistenceProvider  ProceduralProvider  HybridProvider │
│                │        (region .bin files)  (generate from seed)  (both)       │
│                │                                                                 │
│                └── markDirty(origin) ──► save to region file on unload          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine (hytopia-source/server)

### 4.1 New Files

| File | Purpose |
|------|---------|
| `server/src/worlds/maps/ChunkProvider.ts` | Interface + base types |
| `server/src/worlds/maps/ProceduralChunkProvider.ts` | Generate chunks from seed |
| `server/src/worlds/maps/PersistenceChunkProvider.ts` | Read/write region files, wrap inner provider |
| `server/src/worlds/maps/RegionFileFormat.ts` | Region file layout, read/write helpers |
| `server/src/worlds/maps/TerrainGenerator.ts` | Deterministic terrain from (origin, seed) |

### 4.2 ChunkProvider Interface

```typescript
// server/src/worlds/maps/ChunkProvider.ts
import type Chunk from '@/worlds/blocks/Chunk';
import type Vector3Like from '@/shared/types/math/Vector3Like';

export interface ChunkProvider {
  /** Get chunk at origin. Return null to treat as empty/air. */
  getChunk(origin: Vector3Like): Chunk | null | Promise<Chunk | null>;

  /** Mark chunk as modified (for persistence). Optional. */
  markDirty?(origin: Vector3Like): void;

  /** Flush dirty chunks to disk. Optional, async. */
  saveDirtyChunks?(): void | Promise<void>;
}
```

### 4.3 ProceduralChunkProvider

- Uses `TerrainGenerator.generateChunk(origin, seed, blockTypeRegistry)` → `{ blocks: Uint8Array, rotations?: Map<number, number> }`
- In-memory LRU cache (e.g. 256 chunks) to avoid re-generating on repeated access
- `getChunk(origin)` → if cached return; else generate, cache, return new Chunk

### 4.4 TerrainGenerator (Engine)

- Port or align with world editor's `TerrainGenerator.js` logic
- **Deterministic:** `generateChunk(origin, seed)` same for same (origin, seed)
- Output: block IDs matching `BlockTypeRegistry` (0 = air, 1–255 = types)
- Algorithm: heightmap (Perlin/Simplex) + subsurface fill + optional caves
- Keep dependencies minimal (no Node-specific deps; pure TS)

### 4.5 Region File Format

- Path: `server/src/worlds/maps/RegionFileFormat.ts`
- One file per 32×32 chunk region: `r.{regionX}.{regionZ}.bin`
- Header: magic, version, chunk offset table (1024 entries × 4 bytes)
- Payload: zstd-compressed chunk blobs (origin 12B + blocks 4096B + sparse rotations)
- Helper: `readChunk(regionDir, origin)`, `writeChunk(regionDir, chunk)`

### 4.6 PersistenceChunkProvider

- Wraps inner `ChunkProvider` (e.g. ProceduralChunkProvider)
- `getChunk(origin)`: check region file first; if found, load and return; else delegate to inner, cache result
- `markDirty(origin)`: add to dirty set
- On chunk unload (or periodic): if dirty, write to region file, remove from dirty
- Config: `regionDirectory: string`, `innerProvider: ChunkProvider`

### 4.7 ChunkLattice Changes

**File:** `server/src/worlds/blocks/ChunkLattice.ts`

- Add optional `_chunkProvider: ChunkProvider | undefined` (injected by World)
- In `getOrCreateChunk(globalCoordinate)`:
  - Compute `originCoordinate`
  - If chunk in `_chunks`, return it
  - If `_chunkProvider`:
    - `chunk = await _chunkProvider.getChunk(origin)` (or sync if not Promise)
    - If chunk non-null: add to `_chunks`, emit ADD_CHUNK, return
  - Fallback: create empty chunk (current behavior)
- No changes to `initializeBlockEntries` / `initializeBlocks` — they still work for bulk load from map
- Add `removeChunk(origin)` or equivalent for unload path (used by chunk streaming)

### 4.8 World Changes

**File:** `server/src/worlds/World.ts`

- `WorldOptions`: add `chunkProvider?: ChunkProvider`, `seed?: number`
- In constructor: if `options.chunkProvider`, pass to ChunkLattice; if `options.seed` and no chunkProvider, create default ProceduralChunkProvider with seed
- `loadMap(map)` unchanged — still supported for initial load; can clear and then chunkProvider serves subsequent requests
- If both `map` and `chunkProvider` provided: load map first (seed/spawn area), then use chunkProvider for missing chunks

### 4.9 Chunk Unload / Streaming

- **Option A (Engine-managed):** Add `ChunkLattice.unloadChunk(origin)` that removes chunk, calls `chunkProvider.markDirty?` if modified, optionally `saveDirtyChunks` periodically
- **Option B (SDK-managed):** Expose `unloadChunk` to SDK; games call it from their streaming loop (like hytopia-demo)
- Recommendation: Option B initially; engine provides the hook, SDK/demo implement policy

### 4.10 NetworkSynchronizer

- No structural changes — it already syncs ADD_CHUNK, REMOVE_CHUNK, SET_BLOCK
- When ChunkLattice adds chunk via provider, ADD_CHUNK fires → sync works
- When chunk is unloaded, REMOVE_CHUNK fires → sync works

### 4.11 Modified/Dirty Tracking

- Chunk needs `isDirty` or equivalent: set when `setBlock` is called
- `ChunkLattice.setBlock` marks chunk dirty
- PersistenceChunkProvider reads dirty flag when writing; clears after write

---

## 5. SDK (hytopia-source/sdk)

### 5.1 New Exports

**File:** `server/src/index.ts` (feeds into sdk/server.mjs, server.d.ts)

```typescript
// ChunkProvider
export type { ChunkProvider } from '@/worlds/maps/ChunkProvider';
export { ProceduralChunkProvider } from '@/worlds/maps/ProceduralChunkProvider';
export { PersistenceChunkProvider } from '@/worlds/maps/PersistenceChunkProvider';
export { TerrainGenerator } from '@/worlds/maps/TerrainGenerator';
```

### 5.2 WorldOptions Extension

```typescript
export interface WorldOptions {
  // ... existing
  map?: WorldMap;
  /** For procedural worlds. Same seed = same terrain everywhere. */
  seed?: number;
  /** Chunk source: procedural, persistence, or custom. If set, chunks are loaded on demand. */
  chunkProvider?: ChunkProvider;
}
```

### 5.3 Documentation

- `docs/server.chunkprovider.md` — interface, usage
- `docs/server.proceduralchunkprovider.md`
- `docs/server.persistencechunkprovider.md`
- `docs/server.worldoptions.seed.md`, `docs/server.worldoptions.chunkprovider.md`
- Update `server.worldoptions.md` with new fields

### 5.4 Backward Compatibility

- `map` only: current behavior (loadMap)
- `chunkProvider` only: no initial map; all chunks from provider
- `map` + `chunkProvider`: load map for initial area (e.g. spawn); provider for rest
- `seed` without chunkProvider: create default ProceduralChunkProvider(seed)

---

## 6. World Editor (hyworldeditor)

**Path:** `c:\Users\user\hyworldeditor\world-editor\`

### 6.1 Current Strengths

- `TerrainGenerator.js` — deterministic, Perlin, biomes, caves, ores
- `SeedGeneratorTool` — generate from seed, load into editor or export to ZIP
- Export produces `map.json` (WorldMap) in ZIP — compatible with engine

### 6.2 Phase 1: No Code Changes

- Editor continues to export `map.json` for curated/static maps
- Seed Generator "Generate to ZIP" continues to produce map.json
- Engine's new procedural mode is independent

### 6.3 Phase 2: Region Export (Optional)

- Add export option: "Export as region files (for procedural worlds)"
- Use same region format as engine's `RegionFileFormat`
- Tool: iterate packed regions, write `r.X.Z.bin` files
- Use case: pre-generate a region for a server without runtime procedural

### 6.4 Phase 3: Shared Terrain Algorithm (Optional)

- Extract core terrain logic to a shared package (e.g. `@hytopia.com/terrain-generator`)
- Consumed by: engine `TerrainGenerator.ts`, editor `TerrainGenerator.js` (or TS port)
- Ensures: same seed + origin → same blocks in editor preview and in-game
- Lower priority; can start with a "best effort" port in engine

### 6.5 Editor → Engine Alignment

- Block IDs: editor uses names; engine uses IDs. Editor export already maps to IDs via block types.
- Ensure editor's block type names match engine's default block palette for procedural worlds.
- Document: "For procedural worlds, use these block names in your asset library."

---

## 7. Demo (hytopia-demo)

**Path:** `c:\Users\user\hytopia-demo\`

### 7.1 Current Setup

- `world.loadMap(worldMap)` from `assets/map.json`
- Chunk streaming loop: despawn/spawn chunks by distance
- Uses `chunk.despawn()` / `chunk.spawn(world)` — requires verification (Chunk may not expose these; may be internal)

### 7.2 Phase 1: Add Procedural Mode Flag

```typescript
// gameConfig.ts or index.ts
const USE_PROCEDURAL = true; // toggle for testing

startServer(world => {
  if (USE_PROCEDURAL) {
    world.loadMap({ blockTypes: defaultBlockTypes }); // block types only
    // Attach procedural provider with seed
    // (requires engine to support setting chunkProvider after init, or pass via options)
  } else {
    world.loadMap(worldMap);
  }
  // ... rest
});
```

### 7.3 Phase 2: Full Procedural Demo

- Use `WorldManager.createWorld` with `seed` and `chunkProvider` if supported
- Or: `startServer` passes world; ensure default world can be created with procedural options
- Chunk streaming: when engine supports `ChunkLattice.unloadChunk`, demo calls it from its TICK_END loop

### 7.4 Phase 3: Persistence Demo (Optional)

- Add persistence: `PersistenceChunkProvider` with `./world-data` directory
- On chunk unload, save modified chunks
- On chunk request, load from disk if exists, else generate
- Demonstrates full Minecraft-style flow

---

## 8. Implementation Phases

### Phase 1: Engine Foundation (Weeks 1–2)

| Task | Owner | Files |
|------|-------|-------|
| Add `ChunkProvider` interface | Engine | `ChunkProvider.ts` |
| Add `TerrainGenerator` (simple port from editor) | Engine | `TerrainGenerator.ts` |
| Add `ProceduralChunkProvider` | Engine | `ProceduralChunkProvider.ts` |
| Modify `ChunkLattice.getOrCreateChunk` to use provider | Engine | `ChunkLattice.ts` |
| Add `WorldOptions.seed`, `chunkProvider` | Engine | `World.ts` |
| Wire provider from World to ChunkLattice | Engine | `World.ts`, `ChunkLattice.ts` |
| Export new types in SDK | SDK | `server/src/index.ts` |
| Update API docs | SDK | `build:api`, `build:docs` |

**Definition of done:** `startServer(world => { world.loadMap({ blockTypes }); world.chunkLattice.setChunkProvider(new ProceduralChunkProvider(seed)); })` generates terrain on first chunk access.

### Phase 2: Region Persistence (Weeks 3–4)

| Task | Owner | Files |
|------|-------|-------|
| Define region file format | Engine | `RegionFileFormat.ts` |
| Implement `PersistenceChunkProvider` | Engine | `PersistenceChunkProvider.ts` |
| Add dirty tracking to Chunk | Engine | `Chunk.ts` |
| Add `ChunkLattice.unloadChunk` | Engine | `ChunkLattice.ts` |
| Add `markDirty` on setBlock | Engine | `ChunkLattice.ts` |
| Periodic or on-unload save | Engine | `PersistenceChunkProvider.ts` |
| Export `PersistenceChunkProvider` | SDK | `index.ts` |

**Definition of done:** Modified chunks are saved to region files; reloading loads from disk.

### Phase 3: SDK Polish & Demo (Week 5)

| Task | Owner | Files |
|------|-------|-------|
| `WorldOptions.chunkProvider` constructor wiring | Engine | `World.ts` |
| `WorldOptions.seed` → auto ProceduralChunkProvider | Engine | `World.ts` |
| Demo: procedural mode | Demo | `hytopia-demo/index.ts` |
| Demo: chunk streaming with unload | Demo | `hytopia-demo/index.ts` |
| Documentation for procedural worlds | SDK | `docs/` |

### Phase 4: World Editor Enhancements (Week 6, Optional)

| Task | Owner | Files |
|------|-------|-------|
| Region export option | Editor | `ImportExport.tsx`, new util |
| Shared terrain package (optional) | New package | `terrain-generator/` |

---

## 9. Testing & Validation

### Unit Tests

- `TerrainGenerator.generateChunk(origin, seed)` is deterministic
- `ProceduralChunkProvider.getChunk` returns same chunk for same origin
- Region file round-trip: write chunk → read → equals original

### Integration Tests

- Create world with seed, request chunks at various origins, verify non-empty terrain
- Modify chunk, unload, reload from persistence, verify blocks
- NetworkSynchronizer: player joins, chunks generated, client receives them

### Manual QA

- ark-game: switch to procedural + persistence, play, verify terrain and persistence
- hytopia-demo: procedural mode, fly around, verify chunk streaming
- World Editor: export map.json, load in engine (unchanged flow)

---

## Appendix A: File Paths Quick Reference

| Component | Base Path |
|-----------|-----------|
| Engine | `c:\Users\user\hytopia-source\server\` |
| SDK (built) | `c:\Users\user\hytopia-source\sdk\` |
| World Editor | `c:\Users\user\hyworldeditor\world-editor\` |
| Demo | `c:\Users\user\hytopia-demo\` |

## Appendix B: Dependencies

- **zstd:** For region file compression. Use `@aspect-build/zstd` or Node `zlib` + optional native zstd binding.
- **fs/path:** PersistenceChunkProvider uses Node `fs`; ensure server-only (no browser).

## Appendix C: World Editor TerrainGenerator Alignment

Editor's `TerrainGenerator.js` uses:

- `mulberry32` PRNG
- `generatePerlinNoise`, `generatePerlinNoise3D` from `PerlinNoiseGenerator`
- Biome map, height map, caves, ores
- Block names → IDs via `blockTypes` lookup

Engine's `TerrainGenerator` should:

- Use same or compatible Perlin (e.g. seed-driven, same recurrence)
- Match coordinate layout: `(y & 31) << 10 | (z & 31) << 5 | x & 31` for chunk index
- Accept `BlockTypeRegistry` to resolve names to IDs, or accept a block palette config
