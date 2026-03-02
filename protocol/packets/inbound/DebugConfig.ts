import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { debugConfigSchema } from '../../schemas/DebugConfig';
import type { DebugConfigSchema } from '../../schemas/DebugConfig';

export type DebugConfigPacket = IPacket<typeof PacketId.DEBUG_CONFIG, DebugConfigSchema>;

export const debugConfigPacketDefinition = definePacket(
  PacketId.DEBUG_CONFIG,
  debugConfigSchema
);
