
import React, { useMemo } from 'react';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { AppState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import InternalParticles from './InternalParticles';
import SurfaceGlares from './SurfaceGlares';
import Panda from './Panda';
import { ContactShadows, Stars } from '@react-three/drei';

interface SceneProps {
  state: AppState;
}

const Scene: React.FC<SceneProps> = ({ state }) => {
  return (
    <>
      <ambientLight intensity={0.1} />
      <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={3} color="#fbbf24" castShadow />
      <pointLight position={[-5, 5, -5]} intensity={1.5} color="#064e3b" />

      <group position={[0, -4, 0]}>
        {/* The Tree Body: Foliage & Ornaments */}
        <Foliage state={state} />
        <Ornaments state={state} />
        
        {/* Colorful Glowing Internal Particles */}
        <InternalParticles state={state} />
        
        {/* The Luxury Panda */}
        <Panda state={state} />
        
        {/* High-end Shimmering Glares on the Surface */}
        <SurfaceGlares state={state} />

        {/* Decorative elements */}
        <ContactShadows 
          opacity={0.6} 
          scale={20} 
          blur={2.4} 
          far={10} 
          resolution={256} 
          color="#000000" 
        />
      </group>

      {/* Denser and more vibrant stars for the black sky */}
      <Stars radius={150} depth={60} count={7000} factor={6} saturation={0.5} fade speed={1.5} />

      {/* Post Processing for Trump-level Luxury Glow */}
      <EffectComposer multisampling={4}>
        <Bloom 
          intensity={1.8} 
          luminanceThreshold={0.8} 
          luminanceSmoothing={0.1} 
          mipmapBlur 
        />
        <ChromaticAberration offset={[0.0008, 0.0008]} />
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.05} darkness={0.9} />
      </EffectComposer>
    </>
  );
};

export default Scene;
