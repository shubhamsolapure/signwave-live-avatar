import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import model from "@/assets/signer_man.glb.asset.json";
import type { Pose } from "./Signer3D";

// Axis mapping for Mixamo rigs (bone Y runs along the limb). Tuned visually.
export const AXIS = { raise: "x", spread: "z", bend: "x", curl: "z" } as const;
export const ARM_DOWN = 1.12; // radians from T-pose to relaxed arms
const FINGERS = ["Index", "Middle", "Ring", "Pinky"] as const;
const CURL: Record<Pose["shape"], number[]> = { open: [0, 0, 0, 0], fist: [1.4, 1.4, 1.4, 1.4], point: [0, 1.4, 1.4, 1.4], bunch: [0.8, 0.8, 0.8, 0.8] };

type Rig = { bone: THREE.Bone; rest: THREE.Quaternion };

export default function HumanSigner({ pose }: { pose: Pose }) {
  const { scene } = useGLTF(model.url);
  const root = useMemo(() => clone(scene), [scene]);
  const bones = useRef<Record<string, Rig>>({});
  const poseRef = useRef(pose);
  poseRef.current = pose;
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), e: new THREE.Euler() }), []);

  useEffect(() => {
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.frustumCulled = false; }
      if ((o as THREE.Bone).isBone) bones.current[o.name.replace(/^mixamorig:?/, "")] = { bone: o as THREE.Bone, rest: o.quaternion.clone() };
    });
    const box = new THREE.Box3().setFromObject(root);
    const h = box.max.y - box.min.y;
    root.scale.setScalar(1.7 / h);
    root.position.y = -box.min.y * (1.7 / h);
  }, [root]);

  function set(name: string, x: number, y: number, z: number, k: number) {
    const r = bones.current[name];
    if (!r) return;
    tmp.e.set(x, y, z);
    tmp.q.setFromEuler(tmp.e).premultiply(r.rest);
    r.bone.quaternion.slerp(tmp.q, k);
  }

  useFrame(({ clock }) => {
    const p = poseRef.current, t = clock.elapsedTime, k = 0.16;
    for (const side of [1, -1] as const) {
      const S = side === 1 ? "Right" : "Left";
      const active = side === 1 || p.both;
      const a = side === 1 ? p.r : p.l;
      const m = active ? p.move : "none";
      let dx = 0, dz = 0, de = 0;
      if (m === "wave") dz = Math.sin(t * 9) * 0.28;
      if (m === "nod") de = Math.sin(t * 8) * 0.3;
      if (m === "tap") de = Math.abs(Math.sin(t * 7)) * -0.28;
      if (m === "circle") { dx = Math.sin(t * 5) * 0.2; dz = Math.cos(t * 5) * 0.2; }
      if (m === "forward") dx = -((Math.sin(t * 3) + 1) / 2) * 0.45;
      // Arm: from T-pose drop down, then raise forward (shoulderX) and bring inward (shoulderZ).
      const down = ARM_DOWN - (a[1] + dz);
      const fwd = (a[0] + dx);
      set(`${S}Arm`, down, 0, -fwd * side, k);
      set(`${S}ForeArm`, 0, 0, (a[2] + de) * -side * 0.9, k);
      const curl = CURL[active ? p.shape : "open"];
      FINGERS.forEach((f, i) => { for (let j = 1; j <= 3; j++) set(`${S}Hand${f}${j}`, 0, 0, (curl[i] ?? 0) * side * (j === 1 ? 0.7 : 1), k); });
      const th = active && p.shape !== "open" ? 0.6 : 0;
      for (let j = 1; j <= 3; j++) set(`${S}HandThumb${j}`, 0, th * side * 0.5, 0, k);
    }
    set("Head", Math.sin(t * 0.8) * 0.03, Math.sin(t * 0.5) * 0.05, 0, 0.1);
  });

  return <primitive object={root} />;
}
useGLTF.preload(model.url);
