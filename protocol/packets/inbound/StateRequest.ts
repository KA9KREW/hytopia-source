import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { stateRequestSchema } from '../../schemas/StateRequest';
import type { StateRequestSchema } from '../../schemas/StateRequest';

export type StateRequestPacket = IPacket<typeof PacketId.STATE_REQUEST, StateRequestSchema>;

export const stateRequestPacketDefinition = definePacket(
  PacketId.STATE_REQUEST,
  stateRequestSchema
);
