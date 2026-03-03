export const CHUNK_BUFFER_GEOMETRY_NUM_POSITION_COMPONENTS = 3;
export const CHUNK_BUFFER_GEOMETRY_NUM_NORMAL_COMPONENTS = 3;
export const CHUNK_BUFFER_GEOMETRY_NUM_UV_COMPONENTS = 2;
export const CHUNK_BUFFER_GEOMETRY_NUM_COLOR_COMPONENTS = 4;
export const CHUNK_BUFFER_GEOMETRY_NUM_LIGHT_LEVEL_COMPONENTS = 1;
export const CHUNK_BUFFER_GEOMETRY_NUM_FOAM_LEVEL_COMPONENTS = 4;

export const CHUNK_SIZE = 16;
export const CHUNK_INDEX_RANGE = CHUNK_SIZE - 1;

// Safety cap: max total faces across all batches. When exceeded, distant batches are hidden.
export const MAX_TOTAL_FACES = 700_000;

// Safety cap: max rendered blocks. When exceeded, view distance is reduced and occlusion runs.
export const MAX_TOTAL_BLOCKS = 600_000;

// LOD distance bands (blocks, horizontal from camera). Within LOD0=full, LOD1=half detail, LOD2=quarter.
export const LOD0_DISTANCE = 56;
export const LOD1_DISTANCE = 112;
// Beyond LOD1_DISTANCE = LOD2

// Occlusion culling: run BFS every N animate frames (higher = less CPU when over limit)
export const OCCLUSION_UPDATE_INTERVAL = 20;

// LOD refresh: recompute batch LOD levels every N frames (higher = less worker traffic)
export const LOD_REFRESH_INTERVAL = 90;

// Underground batches (Y center below this): use +1 LOD for fewer polygons
export const UNDERGROUND_Y_THRESHOLD = 40;

// Batch meshing: 2x2x2 chunks batched together for reduced draw calls.
// Larger batch sizes cubically reduce draw calls (batches are 3D),
// but can have view distance granularity issues on lower quality settings. 
export const BATCH_SIZE = 2; 
export const BATCH_WORLD_SIZE = CHUNK_SIZE * BATCH_SIZE; // 32 blocks per batch dimension

export type ChunkId = `${number},${number},${number}`;
export type BatchId = `${number},${number},${number}`;
