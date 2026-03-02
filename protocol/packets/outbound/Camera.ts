import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { cameraSchema } from '../../schemas';
import type { CameraSchema } from '../../schemas';
import type { WorldTick } from '../PacketCore';

export type CameraPacket = IPacket<typeof PacketId.CAMERA, CameraSchema> & [WorldTick];

export const cameraPacketDefinition = definePacket(
  PacketId.CAMERA,
  cameraSchema,
)