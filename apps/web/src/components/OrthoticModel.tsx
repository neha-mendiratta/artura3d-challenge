import { DIMENSION_LIMITS } from '@artura/shared';
import { Html } from '@react-three/drei';
import { OrthoticModelProps } from '../types';
import { clampDimension, previewColour } from '../utils/preview';

// 1 scene unit = 100 mm, so a 260 mm orthotic is 2.6 units long.
const MM_PER_UNIT = 100;
const LABEL_GAP = 0.25;

// The orthotic as a box: length along x, thickness along y, width along z.
export function OrthoticModel({ lengthMm, widthMm, thicknessMm, colour, labelContainer }: OrthoticModelProps) {
  const length = clampDimension(lengthMm, DIMENSION_LIMITS.lengthMm);
  const width = clampDimension(widthMm, DIMENSION_LIMITS.widthMm);
  const thickness = clampDimension(thicknessMm, DIMENSION_LIMITS.thicknessMm);
  const [x, y, z] = [length / MM_PER_UNIT, thickness / MM_PER_UNIT, width / MM_PER_UNIT];

  return (
    <group>
      {/* The box geometry is created once at size 1 and resized with scale,
          so typing a new size never creates (and leaks) new geometry. */}
      <mesh scale={[x, y, z]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={previewColour(colour)} />
      </mesh>

      {/* Measurement labels: each sits next to the edge it measures. */}
      <Html portal={labelContainer} position={[0, 0, z / 2 + LABEL_GAP]} center className="dimension-label">
        {length} mm
      </Html>
      <Html portal={labelContainer} position={[x / 2 + LABEL_GAP, 0, 0]} center className="dimension-label">
        {width} mm
      </Html>
      <Html portal={labelContainer} position={[-x / 2, y / 2 + LABEL_GAP, z / 2]} center className="dimension-label">
        {thickness} mm
      </Html>
    </group>
  );
}
