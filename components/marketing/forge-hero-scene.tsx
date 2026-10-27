"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

function EmberField({ count = 36 }: { count?: number }) {
  const group = useRef<Group>(null);
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const t = (index + 1) * 12.9898;
        const nx = Math.sin(t) * 0.5 + 0.5;
        const ny = Math.sin(t * 1.37) * 0.5 + 0.5;
        const nz = Math.sin(t * 2.11) * 0.5 + 0.5;
        return {
          position: [(nx - 0.5) * 8, (ny - 0.5) * 5, (nz - 0.5) * 4] as [
            number,
            number,
            number,
          ],
          scale: 0.015 + nx * 0.03,
        };
      }),
    [count],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.04;
    group.current.position.y = Math.sin(performance.now() * 0.0004) * 0.15;
  });

  return (
    <group ref={group}>
      {embers.map((ember, index) => (
        <mesh key={index} position={ember.position} scale={ember.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function ForgeCore() {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.18;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
      <mesh ref={mesh} scale={1.35}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#3b82f6"
          emissive="#0ea5e9"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.85}
          distort={0.28}
          speed={1.6}
        />
      </mesh>
      <mesh scale={1.55}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>
    </Float>
  );
}

export function ForgeHeroScene() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 3, 2]}
          intensity={1.1}
          color="#93c5fd"
        />
        <pointLight position={[-3, -1, 2]} intensity={0.8} color="#22d3ee" />
        <ForgeCore />
        <EmberField />
      </Canvas>
    </div>
  );
}
