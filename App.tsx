
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [state, setState] = useState<'CHAOS' | 'FORMED'>('FORMED');

  const toggleState = () => {
    setState(prev => prev === 'CHAOS' ? 'FORMED' : 'CHAOS');
  };

  // Luxury Black Background Color
  const BG_COLOR = '#050505';

  return (
    <div className="w-full h-screen relative overflow-hidden" style={{ backgroundColor: BG_COLOR }}>
      {/* 3D Experience */}
      <Canvas
        shadows
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
      >
        <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={45} />
        
        <color attach="background" args={[BG_COLOR]} />
        <fog attach="fog" args={[BG_COLOR, 10, 50]} />

        <Suspense fallback={null}>
          <Scene state={state} />
          <Environment preset="night" />
        </Suspense>

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={5} 
          maxDistance={25}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* UI Controls */}
      <UIOverlay state={state} onToggle={toggleState} />

      {/* Luxury Gradient Borders */}
      <div className="fixed inset-0 pointer-events-none border-[12px] border-yellow-600/10 mix-blend-overlay"></div>
    </div>
  );
};

export default App;