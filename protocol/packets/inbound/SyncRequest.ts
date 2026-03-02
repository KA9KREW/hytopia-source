import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { syncRequestSchema } from '../../schemas/SyncRequest';
import type { SyncRequestSchema } from '../../schemas/SyncRequest';

export type SyncRequestPacket = IPacket<typeof PacketId.SYNC_REQUEST, SyncRequestSchema>;

export const syncRequestPacketDefinition = definePacket(
  PacketId.SYNC_REQUEST,
  syncRequestSchema
);
