import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { heartbeatSchema } from '../../schemas/Heartbeat';
import type { HeartbeatSchema } from '../../schemas/Heartbeat';

export type HeartbeatPacket = IPacket<typeof PacketId.HEARTBEAT, HeartbeatSchema>;

export const heartbeatPacketDefinition = definePacket(
  PacketId.HEARTBEAT,
  heartbeatSchema
);
