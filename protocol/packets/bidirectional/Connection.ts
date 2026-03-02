import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { connectionSchema } from '../../schemas/Connection';
import type { ConnectionSchema } from '../../schemas/Connection';

export type ConnectionPacket = IPacket<typeof PacketId.CONNECTION, ConnectionSchema>;

export const connectionPacketDefinition = definePacket(
  PacketId.CONNECTION,
  connectionSchema
);
