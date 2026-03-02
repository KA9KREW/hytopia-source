import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { uiDatasSchema } from '../../schemas/UIDatas';
import type { UIDatasSchema } from '../../schemas/UIDatas';
import type { WorldTick } from '../PacketCore';

export type UIDatasPacket = IPacket<typeof PacketId.UI_DATAS, UIDatasSchema> & [WorldTick];

export const uiDatasPacketDefinition = definePacket(
  PacketId.UI_DATAS,
  uiDatasSchema,
);