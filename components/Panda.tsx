
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, COLORS } from '../constants';
import { AppState } from '../types';

interface PandaProps {
  state: AppState;
}

const Panda: React.FC<PandaProps> = ({ state }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(1);

  // Define Dual Positions
  const { chaosPos, targetPos, chaosRot, targetRot } = useMemo(() => {
    // Chaos: Randomly floating in the space
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const r = (Math.random() + 0.8) * TREE_CONFIG.CHAOS_RADIUS;
    
    const cx = r * Math.sin(theta) * Math.cos(phi);
    const cy = r * Math.sin(theta) * Math.sin(phi) + 5;
    const cz = r * Math.cos(theta);

    // Target: Positioned outside the tree's foliage as a "Guardian"
    const h = TREE_CONFIG.HEIGHT * 0.4; // Mid-low height
    const progressAtH = h / TREE_CONFIG.HEIGHT;
    const radiusAtH = (1 - progressAtH) * TREE_CONFIG.BASE_RADIUS;
    const angle = -Math.PI * 0.15; // Positioned towards the front-left for better visibility
    
    // Set radius to be 1.3x the tree's radius to ensure it's outside the needles
    const tx = Math.cos(angle) * (radiusAtH * 1.35);
    const tz = Math.sin(angle) * (radiusAtH * 1.35);
    const ty = h;

    return {
      chaosPos: new THREE.Vector3(cx, cy, cz),
      targetPos: new THREE.Vector3(tx, ty, tz),
      chaosRot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      targetRot: new THREE.Euler(0, angle + Math.PI * 0.8, -0.1) // Facing the viewer/tree slightly
    };
  }, []);

  useFrame((stateContext, delta) => {
    const targetVal = state === 'FORMED' ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetVal, delta * 2.0);
    const p = progressRef.current;

    if (groupRef.current) {
      // Position Interpolation
      groupRef.current.position.lerpVectors(chaosPos, targetPos, p);
      
      // Rotation Interpolation
      groupRef.current.quaternion.slerpQuaternions(
        new THREE.Quaternion().setFromEuler(chaosRot),
        new THREE.Quaternion().setFromEuler(targetRot),
        p
      );

      // Scale pulse and subtle float when formed
      const time = stateContext.clock.elapsedTime;
      const floatY = state === 'FORMED' ? Math.sin(time * 1.5) * 0.15 : 0;
      groupRef.current.position.y += floatY * p;
      
      const pulse = state === 'FORMED' ? Math.sin(time * 2) * 0.02 : 0;
      groupRef.current.scale.setScalar((0.4 + 0.7 * p) + pulse);
    }
  });

  const blackMat = <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.8} envMapIntensity={1.5} />;
  const whiteMat = <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.5} envMapIntensity={1.5} />;
  const goldMat = <meshStandardMaterial color={COLORS.GOLD_BRIGHT} emissive={COLORS.GOLD_BRIGHT} emissiveIntensity={2} toneMapped={false} />;

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} scale={[1, 0.9, 0.9]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        {whiteMat}
      </mesh>

      {/* Head */}
      <group position={[0, 0.9, 0.1]}>
        <mesh scale={[1, 0.9, 1]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          {whiteMat}
        </mesh>
        
        {/* Ears */}
        <mesh position={[-0.25, 0.25, -0.1]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          {blackMat}
        </mesh>
        <mesh position={[0.25, 0.25, -0.1]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          {blackMat}
        </mesh>

        {/* Eyes (Black patches) */}
        <mesh position={[-0.15, 0.05, 0.28]} rotation={[0.2, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} scale={[1, 1.2, 0.5]} />
          {blackMat}
        </mesh>
        <mesh position={[0.15, 0.05, 0.28]} rotation={[0.2, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} scale={[1, 1.2, 0.5]} />
          {blackMat}
        </mesh>

        {/* Pupils (Gold) */}
        <mesh position={[-0.15, 0.05, 0.32]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          {goldMat}
        </mesh>
        <mesh position={[0.15, 0.05, 0.32]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          {goldMat}
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.05, 0.34]}>
          <sphereGeometry args={[0.04, 8, 8]} scale={[1, 0.7, 1]} />
          {blackMat}
        </mesh>

        {/* Luxury Gold Mini Santa Hat */}
        <group position={[0, 0.3, 0]} rotation={[-0.2, 0, 0]}>
           <mesh position={[0, 0.1, 0]}>
             <coneGeometry args={[0.15, 0.4, 16]} />
             {goldMat}
           </mesh>
           <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <torusGeometry args={[0.15, 0.04, 12, 24]} />
             {whiteMat}
           </mesh>
           <mesh position={[0, 0.32, 0]}>
             <sphereGeometry args={[0.06, 12, 12]} />
             {whiteMat}
           </mesh>
        </group>
      </group>

      {/* Arms */}
      <mesh position={[-0.45, 0.5, 0.2]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.12, 0.3, 4, 12]} />
        {blackMat}
      </mesh>
      <mesh position={[0.45, 0.5, 0.2]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.12, 0.3, 4, 12]} />
        {blackMat}
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, 0, 0.3]} rotation={[1.2, 0, 0.2]}>
        <capsuleGeometry args={[0.15, 0.3, 4, 12]} />
        {blackMat}
      </mesh>
      <mesh position={[0.3, 0, 0.3]} rotation={[1.2, 0, -0.2]}>
        <capsuleGeometry args={[0.15, 0.3, 4, 12]} />
        {blackMat}
      </mesh>
    </group>
  );
};

export default Panda;
