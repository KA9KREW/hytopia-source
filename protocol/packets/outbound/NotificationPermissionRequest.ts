import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { notificationPermissionRequestSchema } from '../../schemas/NotificationPermissionRequest';
import type { NotificationPermissionRequestSchema } from '../../schemas/NotificationPermissionRequest';
import type { WorldTick } from '../PacketCore';

export type NotificationPermissionRequestPacket = IPacket<typeof PacketId.NOTIFICATION_PERMISSION_REQUEST, NotificationPermissionRequestSchema> & [WorldTick];

export const notificationPermissionRequestPacketDefinition = definePacket(
  PacketId.NOTIFICATION_PERMISSION_REQUEST,
  notificationPermissionRequestSchema,
);
