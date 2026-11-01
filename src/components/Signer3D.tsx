import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// Arm pose: [shoulderX (neg = forward/up), shoulderZ (inward), elbowX (neg = bend)]
type Arm = [number, number, number];
type Shape = "open" | "fist" | "point" | "bunch";
export type Pose = { r: Arm; l: Arm; shape: Shape; move: "none" | "wave" | "nod" | "circle" | "tap" | "forward"; both?: boolean };

const REST: Arm = [0.05, 0.12, -0.25];
const P = (r: Arm, shape: Shape, move: Pose["move"], l: Arm = REST): Pose => ({ r, l, shape, move });
const mirror = (a: Arm): Arm => [a[0], a[1], a[2]];

const FOREHEAD: Arm = [-1.0, 0.5, -2.15];
const CHIN: Arm = [-0.65, 0.45, -2.3];
const CHEST: Arm = [-0.3, 0.5, -1.8];
const FRONT: Arm = [-0.7, 0.3, -1.25];
const POINT: Arm = [-1.25, 0.12, -0.15];

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
  Home: { ...P([-0.85, 0.65, -1.35], "open", "none", [-0.85, 0.65, -1.35]), both: true },
  House: { ...P([-0.85, 0.65, -1.35], "open", "none", [-0.85, 0.65, -1.35]), both: true },
  "I / Me": P([-0.25, 0.55, -1.95], "point", "tap"),
  My: P(CHEST, "open", "tap"),
  You: P(POINT, "point", "forward"),
  Your: P(POINT, "open", "forward"),
  Name: { ...P(FRONT, "point", "tap", mirror(FRONT)), both: true },
  What: P(FRONT, "point", "wave"),
  Where: { ...P(FRONT, "open", "wave", mirror(FRONT)), both: true },
  Good: P(FRONT, "fist", "none"),
  Bad: P(FRONT, "fist", "nod"),
  Doctor: { ...P(FRONT, "bunch", "tap", mirror(FRONT)), both: true },
  Hospital: P([-0.35, 0.85, -1.55], "point", "tap"),
  Friend: { ...P(FRONT, "point", "circle", mirror(FRONT)), both: true },
  Family: { ...P(FRONT, "open", "circle", mirror(FRONT)), both: true },
  School: { ...P(FRONT, "open", "tap", mirror(FRONT)), both: true },
  Come: P(FRONT, "open", "nod"),
  Go: P(POINT, "point", "forward"),
  Stop: { ...P(FRONT, "open", "nod", mirror(FRONT)), both: true },
  Wait: { ...P(FRONT, "open", "none", mirror(FRONT)), both: true },
  Love: { ...P(CHEST, "fist", "none", mirror(CHEST)), both: true },
  Happy: P(CHEST, "open", "nod"),
  Morning: P([-1.15, 0.25, -0.95], "open", "nod"),
  Night: P([-0.85, 0.25, -1.15], "open", "nod"),
  Today: { ...P(FRONT, "open", "nod", mirror(FRONT)), both: true },
  Understand: P([-0.85, 0.15, -2.35], "point", "tap"),
  Need: { ...P(FRONT, "open", "forward", mirror(FRONT)), both: true },
  Want: { ...P(FRONT, "bunch", "forward", mirror(FRONT)), both: true },
  "Please help": { ...P(CHEST, "open", "nod", mirror(FRONT)), both: true },
  Medicine: P(CHIN, "bunch", "tap"),
  Milk: { ...P(FRONT, "fist", "circle", mirror(FRONT)), both: true },
  Mother: { ...P(CHEST, "open", "tap", mirror(CHEST)), both: true },
  Father: { ...P(FOREHEAD, "open", "tap", mirror(FOREHEAD)), both: true },
  Bus: { ...P(FRONT, "fist", "forward", mirror(FRONT)), both: true },
  Train: { ...P(FRONT, "fist", "circle", mirror(FRONT)), both: true },
  Toilet: P(FRONT, "point", "wave"),
  Bathroom: P(FRONT, "point", "wave"),
  Tomorrow: P(POINT, "open", "forward"),
  Yesterday: P(FOREHEAD, "point", "forward"),
  Now: { ...P(FRONT, "open", "nod", mirror(FRONT)), both: true },
  Later: P(POINT, "open", "forward"),
  Safe: { ...P(CHEST, "open", "circle", mirror(CHEST)), both: true },
  Danger: { ...P(FRONT, "open", "wave", mirror(FRONT)), both: true },
  Emergency: { ...P(FRONT, "open", "wave", mirror(FRONT)), both: true },
  Call: P([-0.85, 0.7, -1.15], "bunch", "tap"),
  Phone: P([-0.85, 0.7, -1.15], "bunch", "tap"),
  Again: { ...P(FRONT, "open", "circle", mirror(FRONT)), both: true },
  Finished: { ...P(FRONT, "open", "forward", mirror(FRONT)), both: true },
  Learn: P([-0.85, 0.15, -2.15], "bunch", "tap"),
  Work: { ...P(FRONT, "fist", "tap", mirror(FRONT)), both: true },
  Play: { ...P(FRONT, "open", "circle", mirror(FRONT)), both: true },
  Open: { ...P(FRONT, "open", "forward", mirror(FRONT)), both: true },
  Close: { ...P(FRONT, "fist", "circle", mirror(FRONT)), both: true },
  Sit: P([-0.35, 0.4, -1.75], "open", "tap"),
  Stand: P(FRONT, "open", "forward"),
  Book: { ...P(FRONT, "open", "circle", mirror(FRONT)), both: true },
  Teacher: { ...P(FRONT, "bunch", "tap", mirror(FRONT)), both: true },
  Student: { ...P(CHEST, "bunch", "tap", mirror(CHEST)), both: true },
  Money: { ...P(FRONT, "bunch", "tap", mirror(FRONT)), both: true },
  Police: P(FOREHEAD, "open", "tap"),
  Ambulance: { ...P(FRONT, "open", "forward", mirror(FRONT)), both: true },
  Pain: P(CHEST, "point", "tap"),
};

export const SPELL_POSE: Pose = { ...P([-0.65, 0.25, -1.45], "point", "none", [-0.65, 0.25, -1.45]), both: true };
export const IDLE_POSE: Pose = P(REST, "open", "none");

const SKIN = "#d4a574";
const NAIL = "#e8c4a8";
const DENIM = "#3d4450";
const HAIR = "#1f1510";
const SHIRT = "#e8e0d5";

function Hand({ shapeRef, side }: { shapeRef: React.MutableRefObject<Shape>; side: 1 | -1 }) {
  const bases = useRef<THREE.Group[]>([]);
  const middle = useRef<THREE.Group[]>([]);
  const tips = useRef<THREE.Group[]>([]);
  const thumbBase = useRef<THREE.Group>(null);
  const thumbTip = useRef<THREE.Group>(null);

  const fingerData = [
    { x: -0.028, length: 0.057, radius: 0.0074 },
    { x: -0.010, length: 0.068, radius: 0.0078 },
    { x: 0.008, length: 0.064, radius: 0.0075 },
    { x: 0.026, length: 0.052, radius: 0.0068 },
  ];

  useFrame(() => {
    const shape = shapeRef.current;
    const curlFor = (i: number) =>
      shape === "fist" ? 1 :
      shape === "point" ? (i === 0 ? 0 : 1) :
      shape === "bunch" ? (i === 0 ? 0.32 : 0.7) : 0;
    for (let i = 0; i < 4; i++) {
      const curl = curlFor(i);
      const fan = shape === "open" ? (i - 1.5) * 0.13 : (i - 1.5) * 0.025;
      if (bases.current[i]) {
        bases.current[i]!.rotation.x = THREE.MathUtils.lerp(bases.current[i]!.rotation.x, -curl * 0.78, 0.18);
        bases.current[i]!.rotation.z = THREE.MathUtils.lerp(bases.current[i]!.rotation.z, fan, 0.18);
      }
      if (middle.current[i]) middle.current[i]!.rotation.x = THREE.MathUtils.lerp(middle.current[i]!.rotation.x, -curl * 1.05, 0.18);
      if (tips.current[i]) tips.current[i]!.rotation.x = THREE.MathUtils.lerp(tips.current[i]!.rotation.x, -curl * 0.78, 0.18);
    }
    const thumbCurl = shape === "fist" ? 0.95 : shape === "bunch" ? 0.62 : shape === "point" ? 0.34 : 0;
    if (thumbBase.current) {
      thumbBase.current.rotation.z = THREE.MathUtils.lerp(thumbBase.current.rotation.z, side * (0.58 + thumbCurl * 0.62), 0.18);
      thumbBase.current.rotation.x = THREE.MathUtils.lerp(thumbBase.current.rotation.x, -0.18 - thumbCurl * 0.32, 0.18);
    }
    if (thumbTip.current) thumbTip.current.rotation.x = THREE.MathUtils.lerp(thumbTip.current.rotation.x, -thumbCurl * 0.82, 0.18);
  });

  return (
    <group position={[0, -0.035, 0]} rotation={[0.08, 0, side * -0.04]}>
      {/* Rounded palm with a gently tapered wrist end */}
      <mesh position={[0, -0.005, 0]} castShadow>
        <capsuleGeometry args={[0.034, 0.045, 6, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.48} />
      </mesh>
      <mesh position={[0, -0.018, 0.001]} scale={[1.0, 0.58, 0.72]} castShadow>
        <sphereGeometry args={[0.038, 24, 18]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>
      {fingerData.map((finger, i) => (
        <group
          key={i}
          position={[finger.x, 0.018, 0.004]}
          ref={(g) => { if (g) bases.current[i] = g; }}
        >
          <mesh position={[0, finger.length * 0.28, 0]} castShadow>
            <capsuleGeometry args={[finger.radius, finger.length * 0.54, 5, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.48} />
          </mesh>
          <mesh position={[0, finger.length * 0.55, 0.001]} castShadow>
            <sphereGeometry args={[finger.radius * 1.02, 12, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.48} />
          </mesh>
          <group position={[0, finger.length * 0.55, 0]} ref={(g) => { if (g) middle.current[i] = g; }}>
            <mesh position={[0, finger.length * 0.21, 0]} castShadow>
              <capsuleGeometry args={[finger.radius * 0.91, finger.length * 0.4, 5, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.48} />
            </mesh>
            <group position={[0, finger.length * 0.41, 0]} ref={(g) => { if (g) tips.current[i] = g; }}>
              <mesh position={[0, finger.length * 0.14, 0]} castShadow>
                <capsuleGeometry args={[finger.radius * 0.82, finger.length * 0.27, 5, 10]} />
                <meshStandardMaterial color={SKIN} roughness={0.46} />
              </mesh>
              <mesh position={[0, finger.length * 0.27, 0.004]} scale={[0.72, 0.38, 0.25]}>
                <sphereGeometry args={[finger.radius, 12, 8]} />
                <meshStandardMaterial color={NAIL} roughness={0.38} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
      {/* Thumb has two articulated segments and an opposing angle */}
      <group position={[side * 0.028, -0.005, 0.008]} rotation={[0.05, 0, side * -0.62]} ref={thumbBase}>
        <mesh position={[side * 0.013, 0.012, 0]} rotation={[0, 0, side * 0.25]} castShadow>
          <capsuleGeometry args={[0.009, 0.038, 5, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.48} />
        </mesh>
        <group position={[side * 0.026, 0.025, 0]} ref={thumbTip}>
          <mesh position={[side * 0.012, 0.013, 0]} rotation={[0, 0, side * 0.2]} castShadow>
            <capsuleGeometry args={[0.0078, 0.031, 5, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.46} />
          </mesh>
          <mesh position={[side * 0.018, 0.028, 0.004]} scale={[0.7, 0.38, 0.25]}>
            <sphereGeometry args={[0.0075, 12, 8]} />
            <meshStandardMaterial color={NAIL} roughness={0.38} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function ArmRig({ side, poseRef }: { side: 1 | -1; poseRef: React.MutableRefObject<Pose> }) {
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
    if (m === "wave") dz = Math.sin(t * 8) * 0.25;
    if (m === "nod") de = Math.sin(t * 7) * 0.28;
    if (m === "tap") de = Math.abs(Math.sin(t * 6.5)) * -0.25;
    if (m === "circle") { dx = Math.sin(t * 4.5) * 0.18; dz = Math.cos(t * 4.5) * 0.18; }
    if (m === "forward") dx = -((Math.sin(t * 2.8) + 1) / 2) * 0.4;
    const k = 0.16;
    if (shoulder.current) {
      shoulder.current.rotation.x = THREE.MathUtils.lerp(shoulder.current.rotation.x, a[0] + dx, k);
      shoulder.current.rotation.z = THREE.MathUtils.lerp(shoulder.current.rotation.z, (a[1] + dz) * side, k);
    }
    if (elbow.current) elbow.current.rotation.x = THREE.MathUtils.lerp(elbow.current.rotation.x, a[2] + de, k);
    shapeRef.current = active ? p.shape : "open";
  });
  return (
    <group ref={shoulder} position={[-0.2 * side, 1.38, 0]}>
      <mesh position={[0, -0.13, 0]} castShadow>
        <capsuleGeometry args={[0.042, 0.18, 6, 12]} />
        <meshStandardMaterial color={SHIRT} roughness={0.8} />
      </mesh>
      <group ref={elbow} position={[0, -0.27, 0]}>
        <mesh position={[0, -0.025, 0]} castShadow>
          <cylinderGeometry args={[0.044, 0.04, 0.06, 16]} />
          <meshStandardMaterial color={SHIRT} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.11, 0]} castShadow>
          <capsuleGeometry args={[0.032, 0.17, 6, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        <group position={[0, -0.24, 0]}>
          <Hand shapeRef={shapeRef} side={side} />
        </group>
      </group>
    </group>
  );
}

function Body({ pose }: { pose: Pose }) {
  const poseRef = useRef(pose);
  poseRef.current = pose;
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (head.current) {
      head.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.05;
      head.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.02;
    }
  });
  return (
    <group>
      {/* Head */}
      <group ref={head} position={[0, 1.58, 0]}>
        {/* Main head shape - slightly more oval */}
        <mesh castShadow scale={[0.9, 1.05, 0.95]}>
          <sphereGeometry args={[0.115, 48, 48]} />
          <meshStandardMaterial color={SKIN} roughness={0.45} />
        </mesh>
        {/* Jaw / chin softener */}
        <mesh position={[0, -0.07, 0.01]} scale={[0.78, 0.55, 0.82]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color={SKIN} roughness={0.45} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.07, -0.02]} scale={[1.02, 0.72, 1.08]}>
          <sphereGeometry args={[0.115, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        <mesh position={[0.02, 0.11, 0.04]} rotation={[0.35, 0, -0.15]} scale={[1.2, 0.5, 0.75]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        {/* Ears */}
        {[-1, 1].map((x) => (
          <mesh key={x} position={[x * 0.105, -0.01, 0]} scale={[0.35, 0.9, 0.6]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
        ))}
        {/* Eyes */}
        {[-1, 1].map((x) => (
          <group key={x}>
            <mesh position={[x * 0.038, 0.015, 0.098]}>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshStandardMaterial color="#f8f4ef" />
            </mesh>
            <mesh position={[x * 0.038, 0.015, 0.11]}>
              <sphereGeometry args={[0.008, 12, 12]} />
              <meshStandardMaterial color="#2a1f18" />
            </mesh>
            {/* Eyebrow */}
            <mesh position={[x * 0.038, 0.038, 0.1]} rotation={[0, 0, x * -0.1]}>
              <boxGeometry args={[0.028, 0.005, 0.008]} />
              <meshStandardMaterial color={HAIR} />
            </mesh>
          </group>
        ))}
        {/* Nose */}
        <mesh position={[0, -0.01, 0.112]} rotation={[0.25, 0, 0]}>
          <coneGeometry args={[0.012, 0.035, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.055, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.005, 0.025, 4, 8]} />
          <meshStandardMaterial color="#a86b5a" roughness={0.6} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 1.46, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 0.07, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.2, 0]} scale={[1, 1, 0.6]} castShadow>
        <capsuleGeometry args={[0.155, 0.28, 8, 24]} />
        <meshStandardMaterial color={SHIRT} roughness={0.8} />
      </mesh>

      {/* Waist */}
      <mesh position={[0, 0.95, 0]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.145, 0.14, 0.08, 24]} />
        <meshStandardMaterial color="#1a1512" />
      </mesh>

      {/* Jeans */}
      <mesh position={[0, 0.88, 0]} scale={[1, 1, 0.62]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.12, 24]} />
        <meshStandardMaterial color={DENIM} roughness={0.9} />
      </mesh>
      {[-1, 1].map((x) => (
        <group key={x}>
          <mesh position={[x * 0.07, 0.42, 0]} rotation={[0, 0, x * 0.03]} castShadow>
            <capsuleGeometry args={[0.06, 0.7, 8, 16]} />
            <meshStandardMaterial color={DENIM} roughness={0.9} />
          </mesh>
          <mesh position={[x * 0.08, 0.02, 0.04]} scale={[1, 0.55, 1.8]} castShadow>
            <sphereGeometry args={[0.055, 20, 20]} />
            <meshStandardMaterial color="#25201c" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <ArmRig side={1} poseRef={poseRef} />
      <ArmRig side={-1} poseRef={poseRef} />
    </group>
  );
}

const SPELLING_SHAPES: Record<string, Shape> = {
  A: "fist", B: "open", C: "bunch", D: "point", E: "fist", F: "bunch",
  G: "point", H: "point", I: "point", J: "point", K: "point", L: "point",
  M: "fist", N: "fist", O: "bunch", P: "point", Q: "point", R: "point",
  S: "fist", T: "fist", U: "point", V: "point", W: "open", X: "point",
  Y: "open", Z: "point",
};
function spellingPose(letter: string | undefined): Pose {
  const shape = SPELLING_SHAPES[(letter ?? "").toUpperCase()] ?? "open";
  const offset = ((letter?.toUpperCase().charCodeAt(0) ?? 65) - 65) % 5;
  return {
    r: [-0.5 - offset * 0.1, 0.18 + offset * 0.07, -1.05 - offset * 0.1],
    l: [-0.5 - offset * 0.1, -0.18 - offset * 0.07, -1.05 - offset * 0.1],
    shape,
    move: offset % 2 === 0 ? "tap" : "none",
    both: true,
  };
}

export default function Signer3D({ word, spelling, letter }: { word: string | null; spelling: boolean; letter?: string }) {
  const pose = spelling ? spellingPose(letter) : (word && POSES[word]) || IDLE_POSE;
  return (
    <Canvas shadows camera={{ position: [0, 1.15, 4.4], fov: 28 }} dpr={[1, 1.5]} onCreated={({ camera }) => camera.lookAt(0, 1.18, 0)}>
      <color attach="background" args={["#f0e6d8"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[1.8, 3.2, 2.2]} intensity={1.9} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-1.6, 2.2, 1.2]} intensity={0.6} color="#dce9ff" />
      <pointLight position={[0, 1.7, 2]} intensity={0.3} distance={5} />
      <Environment>
        <Lightformer intensity={1.8} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.9} color="#ffd9b0" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <group position={[0, -0.08, 0]}>
        <Body pose={pose} />
      </group>
      <ContactShadows position={[0, -0.08, 0]} opacity={0.28} blur={2.2} />
    </Canvas>
  );
}
