import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { sceneUIsSchema } from '../../schemas/SceneUIs';
import type { SceneUIsSchema } from '../../schemas/SceneUIs';
import type { WorldTick } from '../PacketCore';

export type SceneUIsPacket = IPacket<typeof PacketId.SCENE_UIS, SceneUIsSchema> & [WorldTick];

export const sceneUIsPacketDefinition = definePacket(
  PacketId.SCENE_UIS,
  sceneUIsSchema,
);
