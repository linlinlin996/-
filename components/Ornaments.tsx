
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, LUXURY_PALETTE, COLORS } from '../constants';
import { AppState, OrnamentData } from '../types';

interface OrnamentsProps {
  state: AppState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ state }) => {
  const ballMeshRef = useRef<THREE.InstancedMesh>(null);
  const giftMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightMeshRef = useRef<THREE.InstancedMesh>(null);
  const starMeshRef = useRef<THREE.InstancedMesh>(null);
  const bowRef = useRef<THREE.Group>(null);

  const { data, bowPos } = useMemo(() => {
    const balls: OrnamentData[] = [];
    const gifts: OrnamentData[] = [];
    const lights: OrnamentData[] = [];
    const stars: OrnamentData[] = [];

    // Standard Ornaments (Surface distribution)
    for (let i = 0; i < TREE_CONFIG.ORNAMENT_COUNT; i++) {
      const typeRoll = Math.random();
      const type: 'BALL' | 'GIFT' | 'LIGHT' = typeRoll < 0.5 ? 'BALL' : (typeRoll < 0.75 ? 'GIFT' : 'LIGHT');

      const h = Math.random() * (TREE_CONFIG.HEIGHT - 0.5);
      const progress = h / TREE_CONFIG.HEIGHT;
      const radius = (1 - progress) * TREE_CONFIG.BASE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      
      const surfaceOffset = (Math.random() - 0.5) * 0.1;
      const x = Math.cos(angle) * (radius * 0.98 + surfaceOffset);
      const z = Math.sin(angle) * (radius * 0.98 + surfaceOffset);
      const y = h + 0.2;

      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = (Math.random() + 0.5) * TREE_CONFIG.CHAOS_RADIUS;
      
      const cx = r * Math.sin(theta) * Math.cos(phi);
      const cy = r * Math.sin(theta) * Math.sin(phi) + 5;
      const cz = r * Math.cos(theta);

      const color = LUXURY_PALETTE[Math.floor(Math.random() * LUXURY_PALETTE.length)];
      
      const weight = type === 'GIFT' ? 0.7 + Math.random() * 0.3 : (type === 'BALL' ? 1.2 + Math.random() * 0.5 : 2.5 + Math.random() * 1.0);
      
      const baseSize = type === 'GIFT' ? 0.28 : (type === 'BALL' ? 0.14 : 0.07);
      const size = baseSize * (0.8 + Math.random() * 0.5);

      const ornament: OrnamentData = { chaosPos: [cx, cy, cz], targetPos: [x, y, z], size, weight, type, color };

      if (type === 'BALL') balls.push(ornament);
      else if (type === 'GIFT') gifts.push(ornament);
      else lights.push(ornament);
    }

    // Golden Flickering Stars
    for (let i = 0; i < TREE_CONFIG.STAR_COUNT; i++) {
      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const progress = h / TREE_CONFIG.HEIGHT;
      const radius = (1 - progress) * TREE_CONFIG.BASE_RADIUS;
      const angle = Math.random() * Math.PI * 2;
      
      const internalR = Math.sqrt(Math.random()) * radius;
      const x = Math.cos(angle) * internalR;
      const z = Math.sin(angle) * internalR;
      const y = h;

      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = (Math.random() + 0.5) * TREE_CONFIG.CHAOS_RADIUS;
      
      stars.push({
        chaosPos: [r * Math.sin(theta) * Math.cos(phi), r * Math.sin(theta) * Math.sin(phi) + 5, r * Math.cos(theta)],
        targetPos: [x, y, z],
        size: Math.random() * 0.03 + 0.015,
        weight: 2.0 + Math.random() * 3,
        type: 'LIGHT',
        color: COLORS.GOLD_BRIGHT
      });
    }

    // Large Bow Position
    const bowChaos: [number, number, number] = [
      (Math.random() - 0.5) * TREE_CONFIG.CHAOS_RADIUS * 2,
      Math.random() * 15,
      (Math.random() - 0.5) * TREE_CONFIG.CHAOS_RADIUS * 2
    ];
    const bowTarget: [number, number, number] = [0, TREE_CONFIG.HEIGHT * 0.92, 0];

    return { data: { balls, gifts, lights, stars }, bowPos: { chaos: bowChaos, target: bowTarget } };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progressRef = useRef(1);

  useFrame((stateContext) => {
    const delta = Math.min(stateContext.clock.getDelta(), 0.1);
    const time = stateContext.clock.elapsedTime;
    const targetVal = state === 'FORMED' ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetVal, delta * 1.8);

    // Update the Grand Bow
    if (bowRef.current) {
      const p = Math.pow(progressRef.current, 0.6); // Slightly faster weight
      bowRef.current.position.x = THREE.MathUtils.lerp(bowPos.chaos[0], bowPos.target[0], p);
      bowRef.current.position.y = THREE.MathUtils.lerp(bowPos.chaos[1], bowPos.target[1], p);
      bowRef.current.position.z = THREE.MathUtils.lerp(bowPos.chaos[2], bowPos.target[2], p);
      
      const scale = 0.2 + 0.8 * p;
      bowRef.current.scale.setScalar(scale);
      bowRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
    }

    const updateMesh = (mesh: THREE.InstancedMesh | null, list: OrnamentData[], isStar: boolean = false) => {
      if (!mesh) return;
      list.forEach((orn, i) => {
        const individualProgress = Math.pow(progressRef.current, 1 / orn.weight);
        
        const x = THREE.MathUtils.lerp(orn.chaosPos[0], orn.targetPos[0], individualProgress);
        const y = THREE.MathUtils.lerp(orn.chaosPos[1], orn.targetPos[1], individualProgress);
        const z = THREE.MathUtils.lerp(orn.chaosPos[2], orn.targetPos[2], individualProgress);
        
        dummy.position.set(x, y, z);
        
        if (isStar) {
          const flicker = Math.sin(time * 6 + i * 0.3) * 0.5 + 0.5;
          dummy.scale.setScalar(orn.size * (0.8 + flicker * 1.2) * individualProgress);
          dummy.rotation.set(time * 1.2, time * 0.8, i);
        } else {
          dummy.scale.setScalar(orn.size * (0.2 + 0.8 * individualProgress));
          if (orn.type === 'GIFT') {
              dummy.rotation.set(x * 0.2 + time * 0.1, y * 0.2, z * 0.2);
          } else if (orn.type === 'BALL') {
              dummy.rotation.set(0, time * 0.05, 0);
          }
        }

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        
        const c = new THREE.Color(orn.color);
        if (isStar) {
           const intensity = 3 + Math.sin(time * 10 + i) * 5;
           c.multiplyScalar(intensity);
        } else if (orn.type === 'LIGHT') {
           c.multiplyScalar(8);
        } else {
           c.multiplyScalar(1.2);
        }
        mesh.setColorAt(i, c);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateMesh(ballMeshRef.current, data.balls);
    updateMesh(giftMeshRef.current, data.gifts);
    updateMesh(lightMeshRef.current, data.lights);
    updateMesh(starMeshRef.current, data.stars, true);
  });

  return (
    <>
      {/* Decorative Shiny Balls */}
      <instancedMesh ref={ballMeshRef} args={[undefined, undefined, data.balls.length]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial roughness={0} metalness={1.0} envMapIntensity={2.5} />
      </instancedMesh>
      
      {/* Gift Boxes */}
      <instancedMesh ref={giftMeshRef} args={[undefined, undefined, data.gifts.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.1} metalness={0.8} envMapIntensity={1.5} />
      </instancedMesh>

      {/* Surface Sparkle Lights */}
      <instancedMesh ref={lightMeshRef} args={[undefined, undefined, data.lights.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial emissiveIntensity={15} toneMapped={false} />
      </instancedMesh>

      {/* Internal Flickering Stars */}
      <instancedMesh ref={starMeshRef} args={[undefined, undefined, data.stars.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={COLORS.GOLD_BRIGHT} emissive={COLORS.GOLD_BRIGHT} emissiveIntensity={20} toneMapped={false} />
      </instancedMesh>

      {/* Grand Luxury Bow */}
      <group ref={bowRef}>
        {/* Knot */}
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={COLORS.LUXURY_RED} roughness={0.1} metalness={0.9} envMapIntensity={2} />
        </mesh>
        {/* Loop Left */}
        <mesh position={[-0.45, 0.1, 0]} rotation={[0, 0.2, 0.3]} scale={[1.6, 1.2, 0.6]}>
          <torusGeometry args={[0.3, 0.08, 16, 48]} />
          <meshStandardMaterial color={COLORS.LUXURY_RED} roughness={0.1} metalness={0.9} envMapIntensity={2} />
        </mesh>
        {/* Loop Right */}
        <mesh position={[0.45, 0.1, 0]} rotation={[0, -0.2, -0.3]} scale={[1.6, 1.2, 0.6]}>
          <torusGeometry args={[0.3, 0.08, 16, 48]} />
          <meshStandardMaterial color={COLORS.LUXURY_RED} roughness={0.1} metalness={0.9} envMapIntensity={2} />
        </mesh>
        {/* Tail Left */}
        <mesh position={[-0.35, -0.6, 0.1]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.08, 0.15, 1.2, 16]} />
          <meshStandardMaterial color={COLORS.LUXURY_RED} roughness={0.1} metalness={0.9} envMapIntensity={2} />
        </mesh>
        {/* Tail Right */}
        <mesh position={[0.35, -0.6, 0.1]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.08, 0.15, 1.2, 16]} />
          <meshStandardMaterial color={COLORS.LUXURY_RED} roughness={0.1} metalness={0.9} envMapIntensity={2} />
        </mesh>
        {/* Gold Trim/Accent inside loops (simulated) */}
        <mesh position={[0, 0, 0.15]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color={COLORS.GOLD_BRIGHT} emissive={COLORS.GOLD_BRIGHT} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>

      {/* Top Zenith Star */}
      {state === 'FORMED' && (
        <mesh position={[0, TREE_CONFIG.HEIGHT + 0.4, 0]} rotation={[0, 0, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#ffdf00" emissive="#ffdf00" emissiveIntensity={12} toneMapped={false} />
        </mesh>
      )}
    </>
  );
};

export default Ornaments;
