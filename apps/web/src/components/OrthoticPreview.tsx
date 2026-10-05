import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { OrthoticPreviewProps } from '../types';
import { OrthoticModel } from './OrthoticModel';

// The 3D view. react-three-fiber frees the model's geometry and material, and the WebGL
// context, when this component unmounts (e.g. leaving the order page).
// frameloop="demand": the scene is only redrawn when something changes, not 60 times a second.
// The labels are given this fixed container: without it, drei attaches them to an element
// that changes while the canvas starts up, and the first label can end up empty.
export function OrthoticPreview(props: OrthoticPreviewProps) {
  // null! : React sets this ref when the div mounts, before the labels read it.
  const labelContainer = useRef<HTMLDivElement>(null!);

  return (
    <div className="preview" ref={labelContainer}>
      <Canvas frameloop="demand" camera={{ position: [2.5, 2, 3], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <OrthoticModel {...props} labelContainer={labelContainer} />
        <OrbitControls minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  );
}
