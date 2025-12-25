
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, LUXURY_PALETTE } from '../constants';
import { AppState } from '../types';

interface InternalParticlesProps {
  state: AppState;
}

const InternalParticles: React.FC<InternalParticlesProps> = ({ state }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, chaosPositions, colors, sizes, phases } = useMemo(() => {
    const count = TREE_CONFIG.INTERNAL_PARTICLE_COUNT;
    const pos = new Float32Array(count * 3);
    const cPos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const szs = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 1. Target Position: Uniformly distributed inside the cone
      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const progress = h / TREE_CONFIG.HEIGHT;
      const radiusAtH = (1 - progress) * TREE_CONFIG.BASE_RADIUS;
      
      // Use square root for uniform radial distribution in a circle
      const r = Math.sqrt(Math.random()) * radiusAtH * 0.9; 
      const theta = Math.random() * Math.PI * 2;

      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // 2. Chaos Position: Scattered sphere
      const phi = Math.random() * Math.PI * 2;
      const alt = Math.random() * Math.PI;
      const dist = (Math.random() + 0.3) * TREE_CONFIG.CHAOS_RADIUS * 0.8;

      cPos[i * 3] = dist * Math.sin(alt) * Math.cos(phi);
      cPos[i * 3 + 1] = dist * Math.sin(alt) * Math.sin(phi) + 5;
      cPos[i * 3 + 2] = dist * Math.cos(alt);

      // 3. Color: Choose from luxury palette
      const colorStr = LUXURY_PALETTE[Math.floor(Math.random() * LUXURY_PALETTE.length)];
      const color = new THREE.Color(colorStr);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;

      // 4. Size & Phase for flickering
      szs[i] = Math.random() * 0.08 + 0.04;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, chaosPositions: cPos, colors: cols, sizes: szs, phases: phs };
  }, []);

  useFrame((stateContext, delta) => {
    if (materialRef.current) {
      const targetVal = state === 'FORMED' ? 1 : 0;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetVal,
        delta * 2.2
      );
      materialRef.current.uniforms.uTime.value = stateContext.clock.elapsedTime;
    }
  });

  const vertexShader = `
    uniform float uProgress;
    uniform float uTime;
    attribute vec3 chaosPosition;
    attribute vec3 color;
    attribute float size;
    attribute float phase;
    varying vec3 vColor;
    varying float vFlicker;

    void main() {
      vColor = color;
      
      // Morph between chaos and target
      vec3 morphedPosition = mix(chaosPosition, position, uProgress);
      
      // Subtle floaty movement
      morphedPosition.y += sin(uTime * 0.5 + phase) * 0.1 * uProgress;
      morphedPosition.x += cos(uTime * 0.3 + phase) * 0.05 * uProgress;

      vec4 mvPosition = modelViewMatrix * vec4(morphedPosition, 1.0);
      
      // Flickering logic
      float flicker = sin(uTime * 3.0 + phase) * 0.5 + 0.5;
      vFlicker = flicker;

      gl_PointSize = size * (400.0 / -mvPosition.z) * (0.8 + flicker * 0.4);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    varying float vFlicker;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      
      // Soft circular particle
      float strength = smoothstep(0.5, 0.1, dist);
      
      // Boost color intensity for Bloom based on flicker
      vec3 finalColor = vColor * (2.0 + vFlicker * 5.0);
      
      gl_FragColor = vec4(finalColor, strength * 0.9);
    }
  `;

  const uniforms = useMemo(() => ({
    uProgress: { value: 1.0 },
    uTime: { value: 0.0 }
  }), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-chaosPosition"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-phase"
          count={phases.length}
          array={phases}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default InternalParticles;
