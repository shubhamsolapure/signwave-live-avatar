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

// Each finger has its own MCP/PIP/DIP flexion profile. Values are deliberately
// non-uniform so the fingers do not fold like four identical hinges.
type FingerCurl = readonly [number, number, number];
type HandShape = Record<(typeof FINGERS)[number], FingerCurl>;
const CURL: Record<Pose["shape"], HandShape> = {
  open: {
    Index: [0.06, 0.08, 0.05],
    Middle: [0.08, 0.1, 0.06],
    Ring: [0.1, 0.12, 0.07],
    Pinky: [0.13, 0.14, 0.08],
  },
  fist: {
    Index: [0.95, 1.28, 0.82],
    Middle: [1.08, 1.42, 0.94],
    Ring: [1.12, 1.38, 0.98],
    Pinky: [1.18, 1.3, 0.92],
  },
  point: {
    Index: [0.04, 0.06, 0.04],
    Middle: [1.08, 1.42, 0.94],
    Ring: [1.12, 1.38, 0.98],
    Pinky: [1.18, 1.3, 0.92],
  },
  bunch: {
    Index: [0.62, 0.82, 0.54],
    Middle: [0.72, 0.94, 0.62],
    Ring: [0.78, 0.98, 0.68],
    Pinky: [0.82, 0.92, 0.64],
  },
};

// Slight natural fan when open; fingers draw closer together as they curl.
const SPREAD: Record<Pose["shape"], number[]> = {
  open: [-0.12, -0.035, 0.045, 0.14],
  fist: [-0.035, -0.012, 0.018, 0.05],
  point: [-0.12, -0.025, 0.035, 0.08],
  bunch: [-0.07, -0.02, 0.025, 0.065],
};

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
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh;
        mesh.castShadow = true; mesh.frustumCulled = false;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        // Simple attire: no hat, plain shirt and trousers.
        if (/Headwear/i.test(mat.name)) mesh.visible = false;
        const plain = /Outfit_Top/i.test(mat.name) ? "#3b5f7a" : /Outfit_Bottom/i.test(mat.name) ? "#2b2f36" : /Footwear/i.test(mat.name) ? "#1d1d1f" : null;
        if (plain) { const m = mat.clone(); m.map = null; m.color.set(plain); m.roughness = 0.85; m.needsUpdate = true; mesh.material = m; }
      }
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
      set(`${S}Arm`, down, 0, fwd * side, k);
      set(`${S}ForeArm`, 0, 0, (a[2] + de) * side * 0.9, k);
      const shape = active ? p.shape : "open";
      const curl = CURL[shape];
      const spread = SPREAD[shape];
      FINGERS.forEach((f, i) => {
        const joints = curl[f];
        // The metacarpal fans outward slightly; each knuckle then receives a
        // different flexion amount for a softer, more human-looking curl.
        set(`${S}Hand${f}1`, 0, spread[i] * side, joints[0] * side, k);
        set(`${S}Hand${f}2`, 0, 0, joints[1] * side, k);
        set(`${S}Hand${f}3`, 0, 0, joints[2] * side, k);
      });

      // Three thumb segments use a coordinated opposition arc. A relaxed
      // thumb stays slightly away from the palm; closed shapes bring it across
      // the fingers instead of simply rotating it in place.
      const thumb = shape === "fist" ? [0.48, 0.78, 0.56]
        : shape === "point" ? [0.28, 0.18, 0.12]
        : shape === "bunch" ? [0.42, 0.58, 0.4]
        : [0.12, 0.08, 0.05];
      set(`${S}HandThumb1`, 0, side * (0.24 + thumb[0] * 0.55), side * thumb[0], k);
      set(`${S}HandThumb2`, 0, side * (0.12 + thumb[1] * 0.3), side * thumb[1], k);
      set(`${S}HandThumb3`, 0, side * thumb[2] * 0.35, side * thumb[2], k);
    }
    set("Head", Math.sin(t * 0.8) * 0.03, Math.sin(t * 0.5) * 0.05, 0, 0.1);
  });

  return <primitive object={root} />;
}
useGLTF.preload(model.url);
