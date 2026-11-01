"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * "Red Dragon" by Tomek Zamojski (CC-BY 3.0, via poly.pizza) — a sculpted
 * static mesh, so flight is procedural. Model faces +Z; head sits near
 * (0, 3.1, 6.2) in model space. Swap MODEL_URL for any rigged glTF with a
 * `Head` bone and `Flying_Idle` clip to get skeletal animation instead.
 */
const MODEL_URL = "/models/red-dragon.glb";
const MODEL_FIT = 5.6;
/** World-space anchor: hero copy sits left, so the dragon lives right of centre. */
const ANCHOR_X = 2.9;
const HEAD_LOCAL: [number, number, number] = [0, 3.15, 6.3];

/* Pointer state lives outside React: the scene mutates it every frame. */
const pointerState = { x: 0, y: 0, energy: 0 };

/* Deterministic pseudo-random so particle seeds are stable across renders. */
function hash01(n: number) {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/* ------------------------------------------------------------------ */
/*  Fire breath — additive point sprites parented to the Head bone      */
/* ------------------------------------------------------------------ */
const FIRE_COUNT = 420;

type FireState = {
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  life: Float32Array;
  seeds: Float32Array;
};

function createFlameTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,230,1)");
  g.addColorStop(0.25, "rgba(255,200,90,0.9)");
  g.addColorStop(0.6, "rgba(255,90,20,0.45)");
  g.addColorStop(1, "rgba(120,20,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFireState(): FireState {
  const positions = new Float32Array(FIRE_COUNT * 3);
  const life = new Float32Array(FIRE_COUNT);
  const seeds = new Float32Array(FIRE_COUNT * 3);
  for (let i = 0; i < FIRE_COUNT; i += 1) {
    life[i] = hash01(i + 1);
    seeds[i * 3] = hash01(i * 3 + 11);
    seeds[i * 3 + 1] = hash01(i * 3 + 12);
    seeds[i * 3 + 2] = hash01(i * 3 + 13);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    map: createFlameTexture(),
    size: 0.55,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    color: new THREE.Color("#ffb060"),
    opacity: 0.95,
  });
  return { geometry, material, life, seeds };
}

function FireBreath() {
  const [fireState] = useState<FireState>(createFireState);
  const fire = useRef<FireState>(fireState);
  const light = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const f = fire.current;
    if (!f) return;
    const t = state.clock.elapsedTime;
    const cycle = (t % 4.5) / 4.5;
    const burst =
      THREE.MathUtils.smoothstep(cycle, 0.05, 0.2) *
      (1 - THREE.MathUtils.smoothstep(cycle, 0.45, 0.6));
    const intensity = Math.min(1, burst + pointerState.energy * 0.9);

    const pos = f.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < FIRE_COUNT; i += 1) {
      f.life[i] += delta * (0.9 + f.seeds[i * 3] * 0.8);
      if (f.life[i] > 1) f.life[i] = 0;
      const l = f.life[i];
      const spread = 0.12 + l * 0.9;
      const sx = (f.seeds[i * 3] - 0.5) * spread;
      const sy = (f.seeds[i * 3 + 1] - 0.5) * spread + l * 0.35;
      const reach =
        intensity > 0.02
          ? l * (1.6 + f.seeds[i * 3 + 2] * 1.0) * intensity
          : -10;
      pos.setXYZ(i, sx, 0.15 + sy, -0.25 - reach);
    }
    pos.needsUpdate = true;
    f.material.opacity = 0.9 * intensity;
    f.material.size = 0.14 + intensity * 0.16;
    if (light.current) light.current.intensity = 6 * intensity;
  });

  return (
    <group>
      <points
        geometry={fireState.geometry}
        material={fireState.material}
        frustumCulled={false}
      />
      <pointLight
        ref={light}
        position={[0, 0.2, -1.4]}
        color="#ff8a3d"
        distance={6}
        decay={2}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Dragon rig                                                          */
/* ------------------------------------------------------------------ */
function Dragon() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const { scene, animations, nodes } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Normalise scale/centre so the model fills a predictable footprint.
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = MODEL_FIT / Math.max(size.x, size.y, size.z);
    if (inner.current) {
      inner.current.scale.setScalar(scale);
      inner.current.position.copy(center.multiplyScalar(-scale));
    }

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.frustumCulled = false;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && "roughness" in mat) {
          // Flat matte red → lacquered crimson scales with warm under-glow.
          mat.color.set("#5a0b12");
          mat.roughness = 0.62;
          mat.metalness = 0.12;
          mat.emissive.set("#200305");
          mat.emissiveIntensity = 0.5;
          mat.needsUpdate = true;
        }
      }
    });

    const idle =
      actions["CharacterArmature|Flying_Idle"] ?? Object.values(actions)[0];
    idle?.reset().fadeIn(0.4).play();
    return () => {
      idle?.fadeOut(0.3);
    };
  }, [actions, scene]);

  const hasClips = animations.length > 0;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const { x, y } = pointerState;
    const d = THREE.MathUtils.damp;
    // Procedural glide when the mesh has no skeletal clips.
    const bob = hasClips ? 0 : Math.sin(t * 1.15) * 0.22;
    const bank = hasClips ? 0 : Math.sin(t * 0.7) * 0.08;
    const pitch = hasClips ? 0 : Math.cos(t * 1.15) * 0.05;
    g.rotation.y = d(g.rotation.y, -0.75 + x * 0.8, 3.5, delta);
    g.rotation.x = d(g.rotation.x, 0.12 - y * 0.4 + pitch, 3.5, delta);
    g.rotation.z = d(g.rotation.z, -x * 0.2 + bank, 3.5, delta);
    g.position.x = d(g.position.x, ANCHOR_X + x * 0.45, 3, delta);
    g.position.y = d(g.position.y, -0.1 - y * 0.3 + bob, 3, delta);
    pointerState.energy = Math.max(0, pointerState.energy - delta * 0.9);
  });

  const head = nodes.Head as THREE.Object3D | undefined;

  return (
    <group ref={group}>
      <group ref={inner}>
        <primitive object={scene} />
        {!head ? (
          // Model faces +Z; the emitter's cone runs along -Z, so flip it.
          <group
            position={HEAD_LOCAL}
            rotation={[-0.5, Math.PI, 0]}
            scale={1.5}
          >
            <FireBreath />
          </group>
        ) : null}
      </group>
      {head ? createPortal(<FireBreath />, head) : null}
    </group>
  );
}

useGLTF.preload(MODEL_URL);

/* ------------------------------------------------------------------ */
/*  Pointer tracking over the whole hero section                        */
/* ------------------------------------------------------------------ */
function usePointerTracking(target: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let lastX = 0;
    let lastY = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      const speed = Math.hypot(x - lastX, y - lastY);
      lastX = x;
      lastY = y;
      pointerState.x = x;
      pointerState.y = y;
      pointerState.energy = Math.min(1, pointerState.energy + speed * 2.5);
    };
    const onLeave = () => {
      pointerState.x = 0;
      pointerState.y = 0;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [target]);
}

/* ------------------------------------------------------------------ */
/*  Public component                                                    */
/* ------------------------------------------------------------------ */
export function DragonScene({
  trackRef,
}: {
  trackRef: React.RefObject<HTMLElement | null>;
}) {
  usePointerTracking(trackRef);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.6, 8.2], fov: 40 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.45} color="#8fb3ff" />
      <directionalLight position={[5, 7, 6]} intensity={2.6} color="#ffe2c0" />
      <directionalLight
        position={[-7, 3, -5]}
        intensity={2.4}
        color="#22d3ee"
      />
      <spotLight
        position={[-3, 6, 4]}
        angle={0.5}
        penumbra={0.8}
        intensity={30}
        color="#ffffff"
      />
      <pointLight
        position={[0, -4, 3]}
        intensity={2}
        color="#ff7a3d"
        distance={14}
      />
      <Dragon />
    </Canvas>
  );
}
