
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, COLORS } from '../constants';
import { AppState } from '../types';

interface FoliageProps {
  state: AppState;
}

const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, chaosPositions, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);
    const cPos = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);
    const sz = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT);
    const cols = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);

    for (let i = 0; i < TREE_CONFIG.FOLIAGE_COUNT; i++) {
      // Target Pos (Cone shape)
      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const progress = h / TREE_CONFIG.HEIGHT;
      const radius = (1 - progress) * TREE_CONFIG.BASE_RADIUS;
      const angle = progress * Math.PI * 40 + Math.random() * 0.5; // Spiral
      
      const x = Math.cos(angle) * (radius + (Math.random() - 0.5) * 0.8);
      const z = Math.sin(angle) * (radius + (Math.random() - 0.5) * 0.8);
      const y = h;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Chaos Pos (Exploded Sphere)
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = (Math.random() + 0.5) * TREE_CONFIG.CHAOS_RADIUS;

      cPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      cPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi) + 5;
      cPos[i * 3 + 2] = r * Math.cos(theta);

      sz[i] = Math.random() * 0.15 + 0.05;

      // Deep Emerald to Bright Emerald colors
      const color = new THREE.Color(Math.random() > 0.8 ? COLORS.EMERALD_BRIGHT : COLORS.EMERALD_DARK);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return { positions: pos, chaosPositions: cPos, sizes: sz, colors: cols };
  }, []);

  useFrame((stateContext, delta) => {
    if (materialRef.current) {
      const targetVal = state === 'FORMED' ? 1 : 0;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetVal,
        delta * 2.5
      );
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  const vertexShader = `
    uniform float uProgress;
    uniform float uTime;
    attribute float size;
    attribute vec3 chaosPosition;
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
      vColor = color;
      // Morph between chaos and target tree shape
      vec3 morphedPosition = mix(chaosPosition, position, uProgress);
      
      // Add subtle swaying/jitter
      morphedPosition.x += sin(uTime * 2.0 + morphedPosition.y) * 0.02 * (1.0 - uProgress);
      morphedPosition.z += cos(uTime * 1.5 + morphedPosition.x) * 0.02 * (1.0 - uProgress);

      vec4 mvPosition = modelViewMatrix * vec4(morphedPosition, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = smoothstep(0.5, 0.2, dist);
      gl_FragColor = vec4(vColor, alpha * 0.8);
    }
  `;

  const uniforms = useMemo(() => ({
    uProgress: { value: 1.0 },
    uTime: { value: 0.0 }
  }), []);

  return (
    <points ref={pointsRef}>
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
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
};

export default Foliage;
