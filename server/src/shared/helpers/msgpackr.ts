import { Packr, FLOAT32_OPTIONS, isNativeAccelerationEnabled } from 'msgpackr';

if (!isNativeAccelerationEnabled) {
  console.warn('Msgpackr: msgpackr native acceleration is not enabled, using fallback implementation.');
}

export default new Packr({ useFloat32: FLOAT32_OPTIONS.ALWAYS });
