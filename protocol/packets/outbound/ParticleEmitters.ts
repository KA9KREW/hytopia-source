import { definePacket, PacketId } from '../PacketCore';
import type { IPacket } from '../PacketCore';
import { particleEmittersSchema } from '../../schemas/ParticleEmitters';
import type { ParticleEmittersSchema } from '../../schemas/ParticleEmitters';
import type { WorldTick } from '../PacketCore';

export type ParticleEmittersPacket = IPacket<typeof PacketId.PARTICLE_EMITTERS, ParticleEmittersSchema> & [WorldTick];

export const particleEmittersPacketDefinition = definePacket(
  PacketId.PARTICLE_EMITTERS,
  particleEmittersSchema,
);
