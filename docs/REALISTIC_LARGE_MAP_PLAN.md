# Realistic Large Map Plan

## How Minecraft, Hytale, and bloxd Actually Do It

**The central insight: None of these games store the full world.** They all use the same pattern:

1. **Procedural generation** – terrain is generated on-demand from a deterministic seed  
2. **Sparse persistence** – only save chunks that have been modified (or, in Minecraft, explored)  
3. **Lazy loading** – generate/load chunks only when players are nearby  
4. **Region files** – group chunks to reduce file count and disk overhead  

### Minecraft

| Aspect | Approach |
|--------|----------|
| World "size" | Effectively infinite (30M blocks from center in each direction) |
| Storage | Only explored chunks saved; never the full theoretical world |
| Format | Region files (`.mca`): 32×32 chunks per file, 8KB header + compressed chunk payloads |
| Typical size | **5–20 MB** (new) → **100–500 MB** (moderate play) → **1–5 GB** (extensive) → up to **50 GB** (years of play) |
| Per chunk | ~2.5 bytes/block avg after compression |
| Key point | Storage grows with *distance traveled*, not world bounds |

### Hytale

| Aspect | Approach |
|--------|----------|
| World | Procedural with curated design (density fields, biome rules) |
| Format | `region.bin` (IndexedStorageFile): 32×32 chunk columns per region |
| Sparse storage | `blob_index = 0` → chunk doesn’t exist → **generate on demand** |
| Compression | zstd per chunk blob; BSON for metadata |
| Palette | 4-bit, 8-bit, or 16-bit indices into per-chunk block palette (large savings when few block types) |
| Key point | Only generated/modified chunks are stored; rest is procedural |

### bloxd.io

| Aspect | Approach |
|--------|----------|
| World bounds | ~800k × 800k × 800k blocks (playable area) |
| Storage | **Nothing stored for unvisited areas** – world number = seed |
| Generation | Procedural terrain from seed (hills, mountains, biomes, ores) |
| Key point | 800k³ is the coordinate space, not stored data; everything is generated on-the-fly |

---

## The Pattern: Generate + Persist Only Modified

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REALISTIC WORLD STORAGE MODEL                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Player approaches chunk (cx, cy, cz)                                   │
│              │                                                          │
│              ▼                                                          │
│   ┌──────────────────────┐                                              │
│   │ Chunk in region file? │                                              │
│   └──────────┬───────────┘                                              │
│              │                                                          │
│     ┌────────┴────────┐                                                 │
│     │ YES             │ NO                                              │
│     ▼                 ▼                                                 │
│   Load from disk    Generate from seed + (cx,cy,cz)                     │
│     │                 │                                                 │
│     └────────┬────────┘                                                 │
│              ▼                                                          │
│   Chunk in memory, serve to player                                      │
│              │                                                          │
│              ▼                                                          │
│   Player modifies block? → Mark chunk dirty                             │
│              │                                                          │
│              ▼                                                          │
│   Chunk unloaded (player left) → Write to region file (if dirty)        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Realistic Storage Estimates

| Scenario | Chunks stored | Est. size (compressed) |
|----------|---------------|------------------------|
| New world (spawn only) | ~100–500 | **5–20 MB** |
| Small server (spawn + nearby) | ~5,000–20,000 | **50–200 MB** |
| Medium server (explored area) | ~50,000–100,000 | **500 MB–1 GB** |
| Large/long-running server | ~500,000+ | **5–20 GB** |
| "Infinite" 100k×100k×64 *bounds* | Only visited/modified | **MB–GB, not TB** |

**Important:** The 100k×100k×64 bounds define the *coordinate space*, not what you store. Most of it is never visited; that part is generated when needed and never written to disk.

---

## Implementation Plan for Hytopia

### Phase 1: Procedural Terrain Generator

1. **TerrainGenerator interface**
   - `generateChunk(origin: Vector3Like, seed: number): { blocks: Uint8Array, rotations?: Map<number, number> }`
   - Deterministic: same (origin, seed) → same output every time
2. **Simple implementation**
   - Heightmap (Perlin/Simplex) → surface blocks
   - Fill below with stone, optional cave generation
   - Match existing block type IDs from `BlockTypeRegistry`
3. **Integration**
   - World has a `seed` and `terrainGenerator`
   - Used when a chunk is requested and not found in storage

### Phase 2: Chunk Provider Abstraction

1. **MapProvider** (or ChunkProvider)
   ```typescript
   interface ChunkProvider {
     getChunk(origin: Vector3Like): Chunk | null | Promise<Chunk | null>;
     markDirty(origin: Vector3Like): void;
     saveDirtyChunks(): void | Promise<void>;
   }
   ```
2. **ProceduralChunkProvider**
   - `getChunk()` → generate from terrain generator if not in cache
   - In-memory cache of recently generated chunks (LRU)
3. **PersistenceChunkProvider** (wraps ProceduralChunkProvider)
   - On `getChunk()`: check region file first; if miss, delegate to procedural
   - On `markDirty()`: track modified chunks
   - On `saveDirtyChunks()`: write only dirty chunks to region files

### Phase 3: Region File Format

1. **Layout** (Minecraft/Hytale style)
   - One file per 32×32 chunk region (XZ plane; Y handled per column or as 3D regions)
   - For 64-block height: 4 chunk layers in Y → 32×4×32 = 4096 chunks max per region (or use 32×32×4 3D regions)
   - Simpler: 32×32 chunks per region file (horizontal slice), multiple files per Y band if needed
2. **Region file structure**
   - Header: location table (which chunks exist, byte offset in file)
   - Payload: chunk data (compressed with zstd or zlib)
   - Chunk data: origin (12 bytes) + blocks (4096 bytes) + optional sparse rotations
3. **Naming**
   - `r.{regionX}.{regionZ}.bin` (e.g. `r.0.0.bin` for chunks 0–31 in X and Z)

### Phase 4: Lazy Chunk Loading in ChunkLattice

1. **ChunkLattice changes**
   - `getOrCreateChunk(globalCoordinate)` currently creates empty chunk if missing
   - Change to: if missing, call `ChunkProvider.getChunk()`; if that returns null, create empty (or optionally generate via provider)
2. **Trigger**
   - When `NetworkSynchronizer` or physics needs a chunk, `getOrCreateChunk` pulls from provider
   - Provider generates from procedural or loads from region file
3. **Unload policy**
   - When no players within N chunks, unload chunk from memory
   - If chunk was modified, write to region file before dropping

### Phase 5: Migration Path

1. **Keep JSON maps**
   - `JsonMapProvider`: loads full JSON, serves from memory (current behavior)
   - Use for small/curated maps, tutorials, etc.
2. **New world creation**
   - `createWorld({ seed: 12345, useProceduralTerrain: true })` → use ProceduralChunkProvider + PersistenceChunkProvider
3. **Block types**
   - Stay in JSON or small config; load once at startup
   - Procedural generator uses same block type IDs

---

## Summary: What "Realistic" Means

| Don't Do | Do Instead |
|----------|------------|
| Store 100k×100k×64 in full | Use procedural generation; bounds are coordinate space only |
| Load entire map at startup | Lazy load chunks as players approach |
| Persist every chunk | Persist only modified (or optionally explored) chunks |
| Single monolithic file | Region files (32×32 chunks per file) |
| Raw binary | Compress each chunk (zstd) |
| 640 GB storage | **10 MB – 2 GB** for typical worlds |

**Expected storage:** Similar to Minecraft—roughly 5–20 MB for a new world, 100 MB–2 GB for active servers, scaling with how much terrain is explored and modified. The 100k×100k×64 "world size" becomes viable because you only store what players touch.
