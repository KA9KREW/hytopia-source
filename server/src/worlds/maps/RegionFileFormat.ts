/**
 * Binary region file format for chunk persistence.
 * One file per 32x32 chunk region (XZ plane), storing multiple Y-levels.
 * Uses gzip compression (Node built-in) for compatibility.
 * @internal
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import Chunk, { CHUNK_VOLUME } from '@/worlds/blocks/Chunk';
import { BLOCK_ROTATIONS } from '@/worlds/blocks/Block';
import type Vector3Like from '@/shared/types/math/Vector3Like';

const REGION_SIZE = 32;
const HEADER_ENTRIES = REGION_SIZE * REGION_SIZE * 4; // 32x32 XZ, 4 Y levels for 64-block world
const HEADER_BYTES = HEADER_ENTRIES * 4; // 4 bytes offset per entry

function chunkToRegionIndex(origin: Vector3Like): { rx: number; rz: number; idx: number } {
  const cx = Math.floor(origin.x / 16);
  const cy = Math.floor(origin.y / 16);
  const cz = Math.floor(origin.z / 16);
  const rx = Math.floor(cx / REGION_SIZE);
  const rz = Math.floor(cz / REGION_SIZE);
  const lx = ((cx % REGION_SIZE) + REGION_SIZE) % REGION_SIZE;
  const lz = ((cz % REGION_SIZE) + REGION_SIZE) % REGION_SIZE;
  const ly = Math.max(0, Math.min(3, cy)); // 0-3 for 64-block world (4 chunk layers)
  const idx = lx + REGION_SIZE * lz + REGION_SIZE * REGION_SIZE * ly;
  return { rx, rz, idx };
}

function regionPath(dir: string, rx: number, rz: number): string {
  return path.join(dir, `r.${rx}.${rz}.bin`);
}

/** Serialize chunk to buffer: 12 (origin) + 4096 (blocks) + 2 (rot count) + rot data */
function serializeChunkToBuffer(chunk: Chunk): Buffer {
  const origin = chunk.originCoordinate;
  const blocks = chunk.blocks;
  const rotations = chunk.blockRotations;

  const rotArr = Array.from(rotations.entries()).flatMap(([i, r]) => [i, r.enumIndex]);
  const rotCount = rotArr.length;
  const size = 12 + CHUNK_VOLUME + 2 + rotCount * 2;
  const buf = Buffer.alloc(size);
  let offset = 0;

  buf.writeInt32BE(origin.x, offset); offset += 4;
  buf.writeInt32BE(origin.y, offset); offset += 4;
  buf.writeInt32BE(origin.z, offset); offset += 4;
  for (let i = 0; i < CHUNK_VOLUME; i++) buf[offset++] = blocks[i];
  buf.writeUInt16BE(rotCount, offset); offset += 2;
  for (let i = 0; i < rotCount; i += 2) {
    buf.writeUInt16BE(rotArr[i], offset); offset += 2;
    buf.writeUInt16BE(rotArr[i + 1], offset); offset += 2;
  }

  return buf;
}

/** Deserialize chunk from buffer */
function deserializeChunkFromBuffer(buf: Buffer): Chunk {
  let offset = 0;
  const x = buf.readInt32BE(offset); offset += 4;
  const y = buf.readInt32BE(offset); offset += 4;
  const z = buf.readInt32BE(offset); offset += 4;
  const origin = { x, y, z };

  const chunk = new Chunk(origin);
  const blocks = new Uint8Array(CHUNK_VOLUME);
  for (let i = 0; i < CHUNK_VOLUME; i++) blocks[i] = buf[offset++];
  chunk.loadBlocks(blocks);

  const rotCount = buf.readUInt16BE(offset); offset += 2;
  const rots = Object.values(BLOCK_ROTATIONS).sort((a, b) => a.enumIndex - b.enumIndex);
  const rotEntries: [number, import('@/worlds/blocks/Block').BlockRotation][] = [];
  for (let i = 0; i < rotCount; i += 2) {
    const blockIdx = buf.readUInt16BE(offset); offset += 2;
    const rotIdx = buf.readUInt16BE(offset); offset += 2;
    const rot = rots[rotIdx];
    if (rot) rotEntries.push([blockIdx, rot]);
  }
  chunk.loadRotations(rotEntries);
  return chunk;
}

export function readChunk(regionDir: string, origin: Vector3Like): Chunk | null {
  const { rx, rz, idx } = chunkToRegionIndex(origin);
  const filePath = regionPath(regionDir, rx, rz);
  if (!fs.existsSync(filePath)) return null;

  const fd = fs.openSync(filePath, 'r');
  try {
    const headerBuf = Buffer.alloc(HEADER_BYTES);
    fs.readSync(fd, headerBuf, 0, HEADER_BYTES, 0);
    const offset = headerBuf.readUInt32BE(idx * 4);
    if (offset === 0) return null;

    const lenBuf = Buffer.alloc(4);
    fs.readSync(fd, lenBuf, 0, 4, offset);
    const payloadLen = lenBuf.readUInt32BE(0);
    const compressed = Buffer.alloc(payloadLen);
    fs.readSync(fd, compressed, 0, payloadLen, offset + 4);
    const raw = zlib.gunzipSync(compressed);
    return deserializeChunkFromBuffer(raw);
  } finally {
    fs.closeSync(fd);
  }
}

export function writeChunk(regionDir: string, chunk: Chunk): void {
  if (!fs.existsSync(regionDir)) fs.mkdirSync(regionDir, { recursive: true });

  const { rx, rz, idx } = chunkToRegionIndex(chunk.originCoordinate);
  const filePath = regionPath(regionDir, rx, rz);
  const raw = serializeChunkToBuffer(chunk);
  const compressed = zlib.gzipSync(raw);
  const payloadLen = compressed.length;

  let header: Buffer;
  let writeOffset: number;
  const fileExists = fs.existsSync(filePath);

  if (fileExists) {
    const fd = fs.openSync(filePath, 'r');
    const stat = fs.statSync(filePath);
    header = Buffer.alloc(HEADER_BYTES);
    fs.readSync(fd, header, 0, HEADER_BYTES, 0);
    fs.closeSync(fd);
    writeOffset = stat.size; // Always append (simple, no compaction)
  } else {
    header = Buffer.alloc(HEADER_BYTES);
    writeOffset = HEADER_BYTES;
  }

  header.writeUInt32BE(writeOffset, idx * 4);

  const chunkBuf = Buffer.alloc(4 + payloadLen);
  chunkBuf.writeUInt32BE(payloadLen, 0);
  compressed.copy(chunkBuf, 4);

  const fd = fs.openSync(filePath, fileExists ? 'r+' : 'w');
  try {
    fs.writeSync(fd, header, 0, HEADER_BYTES, 0);
    fs.writeSync(fd, chunkBuf, 0, chunkBuf.length, writeOffset);
  } finally {
    fs.closeSync(fd);
  }
}
