# Chunk Streaming Optimization Strategy

**Save point:** Procedural world with chunk load/unload, 350-block radius, default fly mode.

## Current Implementation (Post-Save)

- **Chunk loading:** 350-block radius around players, 8 chunks/tick
- **Chunk unloading:** Beyond 420 blocks, 50 chunks/pass, every 60 ticks (~1 sec)
- **Load/unload buffer:** 70-block gap to avoid boundary thrashing

## Optimization Opportunities

### 1. **Performance Profiling**
- [ ] Add tick-time logging to find bottlenecks (chunk gen vs physics vs networking)
- [ ] Profile `TerrainGenerator` and `ProceduralChunkProvider` under load
- [ ] Measure memory per chunk and set target max chunk count

### 2. **Chunk Loading**
- [ ] **Prioritize by view direction:** Load chunks in front of player first
- [ ] **Async generation:** Move chunk generation off main tick (worker/async)
- [ ] **LOD or reduced-detail far chunks:** Optional lower-poly far chunks
- [ ] **Tune CHUNKS_PER_TICK:** Test 4/8/16 for smoothness vs load speed

### 3. **Chunk Unloading**
- [ ] **Grace period:** Delay unload for chunks recently left (reduce re-loads)
- [ ] **Batch collider removal:** Unload chunks in smaller batches to smooth physics updates
- [ ] **Background persist:** Ensure `PersistenceChunkProvider.persistChunk` is non-blocking

### 4. **Physics & Collision**
- [ ] Profile `colliderMap` and block collider updates when chunks load/unload
- [ ] Consider spatial partitioning for raycasts if many blocks
- [ ] Lazy collider creation for distant chunks (collide only when near)

### 5. **Client Sync**
- [ ] Verify client view distance aligns with server load radius (e.g. HIGH=300, ULTRA=600)
- [ ] Chunk send batching to avoid flooding the client
- [ ] Delta/dirty-only updates for modified chunks

### 6. **Memory & Caching**
- [ ] Cap `ProceduralChunkProvider` LRU size if used
- [ ] Monitor `world-data` region file growth
- [ ] Consider chunk pooling for frequently loaded/unloaded areas

## Metrics to Track

| Metric | Target |
|--------|--------|
| Avg tick time | < 16ms (60 fps) |
| Chunk load spike | < 50ms |
| Active chunks per player | ~500–800 (22² × 6 × 0.6) |
| Memory per chunk | ~50–100 KB |

## Next Steps

1. Run server and fly around; observe movement smoothness and chunk pop-in
2. Add optional debug overlay for chunk count and tick time
3. Profile and address the largest bottleneck first
