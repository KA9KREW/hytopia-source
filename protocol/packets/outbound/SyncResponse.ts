import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { syncResponseSchema } from '../../schemas/SyncResponse';
import type { SyncResponseSchema } from '../../schemas/SyncResponse';
import type { WorldTick } from '../PacketCore';

export type SyncResponsePacket = IPacket<typeof PacketId.SYNC_RESPONSE, SyncResponseSchema> & [WorldTick];

export const syncResponsePacketDefinition = definePacket(
  PacketId.SYNC_RESPONSE,
  syncResponseSchema,
);
