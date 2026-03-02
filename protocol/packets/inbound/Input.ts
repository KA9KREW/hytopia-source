import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { inputSchema } from '../../schemas/Input';
import type { InputSchema } from '../../schemas/Input';

export type InputPacket = IPacket<typeof PacketId.INPUT, InputSchema>;

export const inputPacketDefinition = definePacket(
  PacketId.INPUT,
  inputSchema
);
