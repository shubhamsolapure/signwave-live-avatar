import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// Arm pose: [shoulderX (neg = forward/up), shoulderZ (inward), elbowX (neg = bend)]
type Arm = [number, number, number];
type Shape = "open" | "fist" | "point" | "bunch";
export type Pose = { r: Arm; l: Arm; shape: Shape; move: "none" | "wave" | "nod" | "circle" | "tap" | "forward"; both?: boolean };

const REST: Arm = [0, 0.08, -0.15];
const P = (r: Arm, shape: Shape, move: Pose["move"], l: Arm = REST): Pose => ({ r, l, shape, move });
const mirror = (a: Arm): Arm => [a[0], a[1], a[2]];

const FOREHEAD: Arm = [-1.05, 0.55, -2.2];
const CHIN: Arm = [-0.7, 0.5, -2.35];
const CHEST: Arm = [-0.35, 0.55, -1.85];
const FRONT: Arm = [-0.75, 0.35, -1.3];
const POINT: Arm = [-1.3, 0.15, -0.2];

export const POSES: Record<string, Pose> = {
  Hello: P(FOREHEAD, "open", "forward"),
  Hi: P(FOREHEAD, "open", "forward"),
  "Thank you": P(CHIN, "open", "forward"),
  Yes: P(FRONT, "fist", "nod"),
  No: P(FRONT, "point", "wave"),
  Please: P(CHEST, "open", "circle"),
  Sorry: P(CHEST, "fist", "circle"),
  Help: { ...P(FRONT, "fist", "nod", mirror(FRONT)), both: true },
  Water: P(CHIN, "open", "tap"),
  Eat: P(CHIN, "bunch", "tap"),
  Food: P(CHIN, "bunch", "tap"),
  Drink: P(CHIN, "fist", "nod"),
  Home: { ...P([-0.9, 0.7, -1.4], "open", "none", [-0.9, 0.7, -1.4]), both: true },
  House: { ...P([-0.9, 0.7, -1.4], "open", "none", [-0.9, 0.7, -1.4]), both: true },
  "I / Me": P([-0.3, 0.6, -2.0], "point", "tap"),
  My: P(CHEST, "open", "tap"),
  You: P(POINT, "point", "forward"),
  Your: P(POINT, "open", "forward"),
  Name: { ...P(FRONT, "point", "tap", mirror(FRONT)), both: true },
  What: P(FRONT, "point", "wave"),
  Where: { ...P(FRONT, "open", "wave", mirror(FRONT)), both: true },
  Good: P(FRONT, "fist", "none"),
  Bad: P(FRONT, "fist", "nod"),
  Doctor: { ...P(FRONT, "bunch", "tap", mirror(FRONT)), both: true },
  Hospital: P([-0.4, 0.9, -1.6], "point", "tap"),
  Friend: { ...P(FRONT, "point", "circle", mirror(FRONT)), both: true },
  Family: { ...P(FRONT, "open", "circle", mirror(FRONT)), both: true },
  School: { ...P(FRONT, "open", "tap", mirror(FRONT)), both: true },
  Come: P(FRONT, "open", "nod"),
  Go: P(POINT, "point", "forward"),
  Stop: { ...P(FRONT, "open", "nod", mirror(FRONT)), both: true },
  Wait: { ...P(FRONT, "open", "none", mirror(FRONT)), both: true },
  Love: { ...P(CHEST, "fist", "none", mirror(CHEST)), both: true },
  Happy: P(CHEST, "open", "nod"),
  Morning: P([-1.2, 0.3, -1.0], "open", "nod"),
  Night: P([-0.9, 0.3, -1.2], "open", "nod"),
  Today: { ...P(FRONT, "open", "nod", mirror(FRONT)), both: true },
  Understand: P([-0.9, 0.2, -2.4], "point", "tap"),
};
export const SPELL_POSE: Pose = { ...P([-0.7, 0.3, -1.5], "point", "none", [-0.7, 0.3, -1.5]), both: true };
export const IDLE_POSE: Pose = P(REST, "open", "none");

const SKIN = "#c68a62";
const DENIM = "#4a4f57";
const HAIR = "#2b1d16";

let plaidTex: THREE.CanvasTexture | null = null;
function plaid() {
  if (plaidTex) return plaidTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9e4da"; g.fillRect(0, 0, 256, 256);
  const bands: [number, number, string][] = [[0, 70, "#2f7a68"], [90, 18, "#c0394b"], [130, 50, "#2f7a68"], [200, 10, "#3b5fa8"], [225, 14, "#e2b33c"]];
  g.globalAlpha = 0.55;
  for (const [o, w, col] of bands) { g.fillStyle = col; g.fillRect(o, 0, w, 256); g.fillRect(0, o, 256, w); }
  g.globalAlpha = 1;
  plaidTex = new THREE.CanvasTexture(c);
  plaidTex.wrapS = plaidTex.wrapT = THREE.RepeatWrapping;
  plaidTex.repeat.set(3, 3);
  plaidTex.colorSpace = THREE.SRGBColorSpace;
  return plaidTex;
}
function Shirt() { return <meshStandardMaterial map={plaid()} roughness={0.85} />; }

function Hand({ shapeRef, side }: { shapeRef: React.MutableRefObject<Shape>; side: 1 | -1 }) {
  const fingers = useRef<THREE.Group[]>([]);
  useFrame(() => {
    const s = shapeRef.current;
    fingers.current.forEach((f, i) => {
      if (!f) return;
      const curl = s === "fist" ? 1 : s === "point" ? (i === 0 ? 0 : 1) : s === "bunch" ? 0.6 : 0;
      f.rotation.x = THREE.MathUtils.lerp(f.rotation.x, -curl * 1.6, 0.25);
    });
  });
  return (
    <group position={[0, -0.05, 0]}>
      <mesh castShadow><boxGeometry args={[0.075, 0.08, 0.03]} /><meshStandardMaterial color={SKIN} roughness={0.6} /></mesh>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[(-0.027 + i * 0.018) * side, -0.04, 0]} ref={(g) => { if (g) fingers.current[i] = g; }}>
          <mesh position={[0, -0.03, 0]} castShadow><capsuleGeometry args={[0.008, 0.045, 4, 8]} /><meshStandardMaterial color={SKIN} roughness={0.6} /></mesh>
        </group>
      ))}
      <mesh position={[0.045 * side, -0.01, 0.01]} rotation={[0, 0, 0.6 * side]}><capsuleGeometry args={[0.009, 0.035, 4, 8]} /><meshStandardMaterial color={SKIN} /></mesh>
    </group>
  );
}

function ArmRig({ side, poseRef }: { side: 1 | -1; poseRef: React.MutableRefObject<Pose> }) {
  // side 1 = character's right (screen left, x negative)
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const shapeRef = useRef<Shape>("open");
  useFrame(({ clock }) => {
    const p = poseRef.current;
    const active = side === 1 || p.both;
    const a = side === 1 ? p.r : p.l;
    const t = clock.elapsedTime;
    const m = active ? p.move : "none";
    let dx = 0, dz = 0, de = 0;
    if (m === "wave") dz = Math.sin(t * 9) * 0.18;
    if (m === "nod") de = Math.sin(t * 8) * 0.22;
    if (m === "tap") de = Math.abs(Math.sin(t * 7)) * -0.2;
    if (m === "circle") { dx = Math.sin(t * 5) * 0.12; dz = Math.cos(t * 5) * 0.12; }
    if (m === "forward") dx = -((Math.sin(t * 3) + 1) / 2) * 0.35;
    const k = 0.12;
    if (shoulder.current) {
      shoulder.current.rotation.x = THREE.MathUtils.lerp(shoulder.current.rotation.x, a[0] + dx, k);
      shoulder.current.rotation.z = THREE.MathUtils.lerp(shoulder.current.rotation.z, (a[1] + dz) * side, k);
    }
    if (elbow.current) elbow.current.rotation.x = THREE.MathUtils.lerp(elbow.current.rotation.x, a[2] + de, k);
    shapeRef.current = active ? p.shape : "open";
  });
  return (
    <group ref={shoulder} position={[-0.21 * side, 1.42, 0]}>
      <mesh position={[0, -0.14, 0]} castShadow><capsuleGeometry args={[0.045, 0.2, 6, 12]} /><Shirt /></mesh>
      <group ref={elbow} position={[0, -0.29, 0]}>
        <mesh position={[0, -0.03, 0]} castShadow><cylinderGeometry args={[0.048, 0.044, 0.07, 16]} /><Shirt /></mesh>
        <mesh position={[0, -0.12, 0]} castShadow><capsuleGeometry args={[0.035, 0.19, 6, 12]} /><meshStandardMaterial color={SKIN} roughness={0.6} /></mesh>
        <group position={[0, -0.26, 0]}><Hand shapeRef={shapeRef} side={side} /></group>
      </group>
    </group>
  );
}

function Body({ pose }: { pose: Pose }) {
  const poseRef = useRef(pose);
  poseRef.current = pose;
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (head.current) head.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.06;
  });
  return (
    <group>
      <group ref={head} position={[0, 1.62, 0]}>
        <mesh castShadow scale={[0.92, 1.08, 0.98]}><sphereGeometry args={[0.11, 48, 48]} /><meshStandardMaterial color={SKIN} roughness={0.5} /></mesh>
        <mesh position={[0, -0.06, 0]} scale={[0.8, 0.5, 0.85]}><sphereGeometry args={[0.1, 32, 32]} /><meshStandardMaterial color={SKIN} roughness={0.5} /></mesh>
        {/* swept-up hair */}
        <mesh position={[0, 0.06, -0.01]} scale={[1.0, 0.75, 1.05]}><sphereGeometry args={[0.112, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={HAIR} roughness={0.85} /></mesh>
        <mesh position={[0.01, 0.1, 0.05]} rotation={[0.4, 0, -0.2]} scale={[1.3, 0.55, 0.8]}><sphereGeometry args={[0.06, 24, 24]} /><meshStandardMaterial color={HAIR} roughness={0.85} /></mesh>
        {[-1, 1].map((x) => (
          <group key={x}>
            <mesh position={[x * 0.1, -0.005, 0]} scale={[0.4, 1, 0.7]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color={SKIN} /></mesh>
            <mesh position={[x * 0.036, 0.008, 0.096]}><sphereGeometry args={[0.014, 16, 16]} /><meshStandardMaterial color="#f4efe8" /></mesh>
            <mesh position={[x * 0.036, 0.008, 0.108]}><sphereGeometry args={[0.007, 12, 12]} /><meshStandardMaterial color="#2a1c14" /></mesh>
            <mesh position={[x * 0.037, 0.035, 0.1]} rotation={[0, 0, x * -0.12]}><boxGeometry args={[0.032, 0.007, 0.01]} /><meshStandardMaterial color={HAIR} /></mesh>
          </group>
        ))}
        <mesh position={[0, -0.02, 0.11]} rotation={[0.3, 0, 0]}><coneGeometry args={[0.014, 0.04, 12]} /><meshStandardMaterial color={SKIN} /></mesh>
        <mesh position={[0, -0.065, 0.098]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.006, 0.028, 4, 8]} /><meshStandardMaterial color="#9a5a48" /></mesh>
      </group>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.045, 0.05, 0.08]} /><meshStandardMaterial color={SKIN} /></mesh>
      {/* collar */}
      {[-1, 1].map((x) => <mesh key={x} position={[x * 0.035, 1.475, 0.045]} rotation={[0.5, 0, x * 0.6]}><boxGeometry args={[0.06, 0.04, 0.008]} /><Shirt /></mesh>)}
      {/* torso: shoulders to waist */}
      <mesh position={[0, 1.24, 0]} scale={[1, 1, 0.62]} castShadow><capsuleGeometry args={[0.16, 0.26, 8, 24]} /><Shirt /></mesh>
      {[-1, 1].map((x) => <mesh key={x} position={[x * 0.075, 1.3, 0.1]}><boxGeometry args={[0.07, 0.06, 0.012]} /><Shirt /></mesh>)}
      {[1.42, 1.34, 1.26, 1.18, 1.1].map((y) => <mesh key={y} position={[0, y, 0.1 + (y > 1.3 ? 0 : 0.003)]}><sphereGeometry args={[0.007, 8, 8]} /><meshStandardMaterial color="#ddd" metalness={0.6} /></mesh>)}
      <mesh position={[0, 0.98, 0]} scale={[1, 1, 0.65]}><cylinderGeometry args={[0.155, 0.15, 0.04, 24]} /><meshStandardMaterial color="#1f1a17" /></mesh>
      {/* jeans */}
      <mesh position={[0, 0.9, 0]} scale={[1, 1, 0.65]} castShadow><cylinderGeometry args={[0.15, 0.15, 0.14, 24]} /><meshStandardMaterial color={DENIM} roughness={0.9} /></mesh>
      {[-1, 1].map((x) => (
        <group key={x}>
          <mesh position={[x * 0.075, 0.45, 0]} rotation={[0, 0, x * 0.04]} castShadow><capsuleGeometry args={[0.065, 0.75, 8, 16]} /><meshStandardMaterial color={DENIM} roughness={0.9} /></mesh>
          <mesh position={[x * 0.09, 0.03, 0.05]} scale={[1, 0.6, 1.9]} castShadow><sphereGeometry args={[0.06, 20, 20]} /><meshStandardMaterial color="#2b2622" roughness={0.7} /></mesh>
        </group>
      ))}
      <ArmRig side={1} poseRef={poseRef} />
      <ArmRig side={-1} poseRef={poseRef} />
    </group>
  );
}

export default function Signer3D({ word, spelling }: { word: string | null; spelling: boolean }) {
  const pose = spelling ? SPELL_POSE : (word && POSES[word]) || IDLE_POSE;
  return (
    <Canvas shadows camera={{ position: [0, 1.25, 1.9], fov: 34 }} dpr={[1, 2]} onCreated={({ camera }) => camera.lookAt(0, 1.22, 0)}>
      <color attach="background" args={["#f1e6d6"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[1.5, 3, 2]} intensity={1.6} castShadow />
      <Environment>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#ffd9b0" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <group position={[0, -0.05, 0]}><Body pose={pose} /></group>
      <ContactShadows position={[0, -0.05, 0]} opacity={0.3} blur={2} />
    </Canvas>
  );
}
