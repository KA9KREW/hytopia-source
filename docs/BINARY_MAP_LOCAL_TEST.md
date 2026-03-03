# Binary Map Local Testing Guide

This guide explains how to test the procedural terrain and binary region persistence locally.

## Prerequisites

- Node.js 18+ (or Bun)
- Client and server dependencies installed

## Quick Start

**1. Start the server (Terminal 1):**

```bash
cd server && npm run dev
```

The playground uses procedural terrain with binary persistence by default:
- `USE_PROCEDURAL = true` – generates terrain via `TerrainGenerator` (Perlin noise)
- `USE_PERSISTENCE = true` – saves modified chunks to `./world-data` (region files)

**2. Start the client (Terminal 2):**

```bash
cd client && npm run dev
```

**3. Open** `http://localhost:5173` in your browser.

**4. Connect** – The client connects to `localhost:8080`; you spawn at `(0, 10, 0)` on procedural terrain.

## Testing Binary Persistence

1. Move around to load new chunks (they’re generated on demand).
2. Place blocks (right-click) or remove blocks (left-click).
3. Move far enough that modified chunks unload (they’re saved when unloaded).
4. Restart the server.
5. Return to the same area – your edits should persist from `./world-data`.

## Region File Format

- Region files: `world-data/r.{rx}.{rz}.bin`
- Each region: 32×32 chunks (512 chunks per region).
- Chunks are gzip-compressed and stored by local position within the region.

## Configuration

In `server/src/playground.ts`:

| Variable | Description |
|----------|-------------|
| `USE_PROCEDURAL` | Use procedural terrain instead of JSON map |
| `USE_PERSISTENCE` | Enable binary persistence (region files) |
| `SPAWN_PRELOAD_RADIUS` | Chunks preloaded around spawn (default: 4) |

## Troubleshooting

**Block textures not found (0 textures):** Ensure `assets/release/blocks` exists in the monorepo (or install `@hytopia.com/assets`). The server checks `../assets/release/blocks` when run from `server/`.

**Atlas write error:** The atlas is written next to the block textures directory. If you see `ENOTDIR`, the BlockTextureRegistry uses the first discovered blocks directory for output.
