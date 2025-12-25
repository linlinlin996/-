
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, COLORS } from '../constants';
import { AppState } from '../types';

interface SurfaceGlaresProps {
  state: AppState;
}

const SurfaceGlares: React.FC<SurfaceGlaresProps> = ({ state }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, chaosPositions, colors, phases, sizes, angles, radii, speeds } = useMemo(() => {
    const count = TREE_CONFIG.GLARE_COUNT;
    const pos = new Float32Array(count * 3);
    const cPos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const phs = new Float32Array(count);
    const szs = new Float32Array(count);
    const angs = new Float32Array(count);
    const rads = new Float32Array(count);
    const spds = new Float32Array(count);

    const goldColor = new THREE.Color(COLORS.GOLD_BRIGHT);
    const whiteColor = new THREE.Color(COLORS.WHITE_GLOW);

    for (let i = 0; i < count; i++) {
      // 1. Target Parameters (Orbiting on the Surface)
      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const progress = h / TREE_CONFIG.HEIGHT;
      const baseRadiusAtH = (1 - progress) * TREE_CONFIG.BASE_RADIUS;
      const surfaceOffset = 0.15; // Push slightly outward from foliage
      const radius = baseRadiusAtH + surfaceOffset;
      const angle = Math.random() * Math.PI * 2;
      
      // Store target values (even though we'll rotate them, we need y)
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // New attributes for orbiting logic
      angs[i] = angle;
      rads[i] = radius;
      // Rotation speed varies slightly for organic feel
      spds[i] = (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1);

      // 2. Chaos Position (Randomized Shell)
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = (Math.random() + 0.6) * TREE_CONFIG.CHAOS_RADIUS;

      cPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      cPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi) + 5;
      cPos[i * 3 + 2] = r * Math.cos(theta);

      // 3. Glare Properties
      const isGold = Math.random() > 0.4;
      const color = isGold ? goldColor : whiteColor;
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;

      phs[i] = Math.random() * Math.PI * 2; // Twinkle phase
      szs[i] = (Math.random() * 0.4 + 0.4); // Glint size
    }

    return { 
      positions: pos, 
      chaosPositions: cPos, 
      colors: cols, 
      phases: phs, 
      sizes: szs,
      angles: angs,
      radii: rads,
      speeds: spds
    };
  }, []);

  useFrame((stateContext, delta) => {
    if (materialRef.current) {
      const targetVal = state === 'FORMED' ? 1 : 0;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetVal,
        delta * 2.0
      );
      materialRef.current.uniforms.uTime.value = stateContext.clock.elapsedTime;
    }
  });

  const vertexShader = `
    uniform float uProgress;
    uniform float uTime;
    
    attribute vec3 chaosPosition;
    attribute vec3 color;
    attribute float phase;
    attribute float size;
    attribute float angle;
    attribute float radius;
    attribute float speed;

    varying vec3 vColor;
    varying float vTwinkle;

    void main() {
      vColor = color;
      
      // Calculate orbiting position on the tree surface
      float currentAngle = angle + uTime * speed;
      vec3 surfacePos = vec3(
        cos(currentAngle) * radius,
        position.y,
        sin(currentAngle) * radius
      );
      
      // Morphing logic: blend between chaos and the revolving surface position
      vec3 morphedPosition = mix(chaosPosition, surfacePos, uProgress);
      
      // Twinkle calculation
      float twinkle = sin(uTime * 5.0 + phase) * 0.5 + 0.5;
      vTwinkle = twinkle;

      vec4 mvPosition = modelViewMatrix * vec4(morphedPosition, 1.0);
      
      // Adjust point size based on distance and twinkle
      gl_PointSize = size * (700.0 / -mvPosition.z) * (0.6 + twinkle * 0.4);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    varying float vTwinkle;

    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float dist = length(uv);
      
      // Anamorphic Cross Flare (Luxury Lens Glint)
      float cross1 = smoothstep(0.045, 0.0, abs(uv.x) * (uv.y * uv.y * 15.0 + 0.05));
      float cross2 = smoothstep(0.045, 0.0, abs(uv.y) * (uv.x * uv.x * 15.0 + 0.05));
      
      // Core glow
      float glow = exp(-dist * 12.0);
      
      float alpha = max(cross1, cross2) * (1.0 - dist * 2.5);
      alpha = max(alpha, glow);
      
      if (alpha < 0.05) discard;

      // Color intensity specifically tuned for the Bloom pass
      // Further reduced by 30%: 5.6 * 0.7 ≈ 3.92 and 15.4 * 0.7 ≈ 10.78
      vec3 finalColor = vColor * (3.9 + vTwinkle * 10.8);
      
      gl_FragColor = vec4(finalColor, alpha * 0.95);
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
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-phase"
          count={phases.length}
          array={phases}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-angle"
          count={angles.length}
          array={angles}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-radius"
          count={radii.length}
          array={radii}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-speed"
          count={speeds.length}
          array={speeds}
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

export default SurfaceGlares;
