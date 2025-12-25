
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, COLORS } from '../constants';
import { AppState } from '../types';

interface StreamingFlowProps {
  state: AppState;
}

const StreamingFlow: React.FC<StreamingFlowProps> = ({ state }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, chaosPositions, colors, flowParams } = useMemo(() => {
    const count = 1500; // Number of particles in the flow ribbons
    const pos = new Float32Array(count * 3);
    const cPos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    // [ribbonIndex, tOffset, speed]
    const fParams = new Float32Array(count * 3);

    const goldColor = new THREE.Color(COLORS.GOLD_BRIGHT);
    const emeraldColor = new THREE.Color(COLORS.EMERALD_BRIGHT);

    const numRibbons = 5;

    for (let i = 0; i < count; i++) {
      const ribbonIndex = i % numRibbons;
      const tOffset = Math.random(); // Position along the spiral (0 to 1)
      const speed = 0.15 + Math.random() * 0.1;
      
      fParams[i * 3] = ribbonIndex;
      fParams[i * 3 + 1] = tOffset;
      fParams[i * 3 + 2] = speed;

      // Chaos Positions
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = (Math.random() + 0.4) * TREE_CONFIG.CHAOS_RADIUS * 0.7;
      cPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      cPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi) + 5;
      cPos[i * 3 + 2] = r * Math.cos(theta);

      // Colors
      const isGold = Math.random() > 0.3;
      const color = isGold ? goldColor : emeraldColor;
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }

    return { positions: pos, chaosPositions: cPos, colors: cols, flowParams: fParams };
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
    attribute vec3 flowParams; // [ribbonIndex, tOffset, speed]

    varying vec3 vColor;
    varying float vAlpha;

    #define PI 3.14159265359

    void main() {
      vColor = color;
      
      float ribbonIdx = flowParams.x;
      float tOffset = flowParams.y;
      float speed = flowParams.z;
      
      // Calculate normalized height progress (0 at bottom, 1 at top)
      // The flow is animated by uTime
      float t = fract(tOffset + uTime * speed);
      
      // Spiral Parameters
      float h = t * 10.0; // Height of the tree
      float spiralTightness = 8.0;
      float angle = t * spiralTightness * 2.0 * PI + (ribbonIdx * (2.0 * PI / 5.0));
      
      float radiusAtH = (1.0 - t) * 4.0; // BASE_RADIUS is 4.0
      // Push slightly outward so it floats on the surface
      radiusAtH += 0.2; 

      vec3 targetPos = vec3(
        cos(angle) * radiusAtH,
        h,
        sin(angle) * radiusAtH
      );

      // Morphing
      vec3 morphedPosition = mix(chaosPosition, targetPos, uProgress);
      
      // Fade edges of the flow for smooth ribbon look
      vAlpha = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.8, t);

      vec4 mvPosition = modelViewMatrix * vec4(morphedPosition, 1.0);
      
      // Points get larger when closer to camera and pulsing
      float pulse = sin(uTime * 5.0 + tOffset * 10.0) * 0.2 + 0.8;
      gl_PointSize = (10.0 + pulse * 15.0) * (200.0 / -mvPosition.z) * uProgress;
      
      // If in chaos, shrink points
      if (uProgress < 0.1) gl_PointSize *= 0.1;

      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      
      // Glowing core
      float strength = pow(1.0 - dist * 2.0, 2.0);
      
      // Luxury intensity for Bloom
      vec3 finalColor = vColor * 15.0;
      
      gl_FragColor = vec4(finalColor, strength * vAlpha * 0.8);
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
          attach="attributes-flowParams"
          count={flowParams.length / 3}
          array={flowParams}
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
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default StreamingFlow;
