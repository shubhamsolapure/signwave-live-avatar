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


type MotionOffset = { dx: number; dz: number; elbow: number; wristX: number; wristY: number; wristZ: number };

// Smooth, bounded movement paths. These add motion to the prototype poses;
// they are not recordings or validated ISL sign trajectories.
function motionOffset(move: Pose["move"], time: number): MotionOffset {
  const value: MotionOffset = { dx: 0, dz: 0, elbow: 0, wristX: 0, wristY: 0, wristZ: 0 };

  if (move === "wave") {
    const wave = Math.sin(time * 4.6);
    value.dz = wave * 0.2;
    value.dx = Math.sin(time * 2.3) * 0.055;
    value.elbow = -0.08 + Math.sin(time * 4.6 + 0.55) * 0.075;
    value.wristY = wave * 0.1;
    value.wristZ = Math.cos(time * 4.6) * 0.16;
  } else if (move === "nod") {
    const nod = Math.sin(time * 4.8);
    value.dx = Math.sin(time * 2.4) * 0.035;
    value.elbow = -0.12 + nod * 0.14;
    value.wristX = nod * 0.07;
    value.wristZ = Math.cos(time * 4.8) * 0.035;
  } else if (move === "tap") {
    // A soft contact pulse with a short hold, rather than a sharp sine twitch.
    const tap = Math.pow(Math.max(0, Math.sin(time * 4.2)), 1.7);
    value.dx = -tap * 0.07;
    value.elbow = -tap * 0.22;
    value.wristX = -tap * 0.075;
  } else if (move === "circle") {
    const angle = time * 3.2;
    value.dx = Math.sin(angle) * 0.11;
    value.dz = Math.cos(angle) * 0.11;
    value.elbow = Math.sin(angle + 0.75) * 0.09;
    value.wristX = Math.sin(angle + 1) * 0.075;
    value.wristZ = Math.cos(angle) * 0.09;
  } else if (move === "forward") {
    const reach = 0.5 - Math.cos(time * 2.8) * 0.5;
    value.dx = -reach * 0.14;
    value.dz = Math.sin(time * 1.4) * 0.025;
    value.elbow = -reach * 0.12;
    value.wristX = -reach * 0.055;
  }

  return value;
}

type Rig = { bone: THREE.Bone; rest: THREE.Quaternion; position: THREE.Vector3 };

export default function HumanSigner({ pose }: { pose: Pose }) {
  const { scene } = useGLTF(model.url);
  const root = useMemo(() => clone(scene), [scene]);
  const bones = useRef<Record<string, Rig>>({});
  const poseRef = useRef(pose);
  poseRef.current = pose;
  const motionKeyRef = useRef("");
  const motionStartRef = useRef(0);
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), e: new THREE.Euler(), v: new THREE.Vector3() }), []);

  useEffect(() => {
    const modelBounds = new THREE.Box3().setFromObject(root);
    const modelHeight = modelBounds.max.y - modelBounds.min.y;

    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        const partBounds = new THREE.Box3().setFromObject(mesh);
        const centerY = partBounds.getCenter(new THREE.Vector3()).y;
        const heightRatio = modelHeight > 0 ? (centerY - modelBounds.min.y) / modelHeight : 0.5;
        const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const styledMaterials = sourceMaterials.map((source) => {
          const mat = source as THREE.MeshStandardMaterial;
          const partName = `${mesh.name} ${mat.name}`.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

          // Remove hats/headwear so the model's existing hair is not covered.
          if (/\b(?:headwear|hat|cap)\b/i.test(partName)) {
            mesh.visible = false;
          }

          // Recognise common GLB and Ready Player Me naming variants.
          const isHair = /hair|scalp|eyebrow|\bbrow\b|beard|moustache|mustache/i.test(partName);
          const isShirt = /\b(?:outfit\s+)?top\b|\b(?:t[ -]?shirt|shirt|tee|hoodie|sweater|jacket)\b|upper(?:\s+body|\s+clothing)?/i.test(partName);
          const isTrousers = /\b(?:outfit\s+)?bottom\b|\b(?:trouser|pants?|jeans?|shorts|legwear)\b|lower(?:\s+body|\s+clothing)?/i.test(partName);
          const isShoes = /footwear|shoes?|sneakers?|boots?/i.test(partName);
          const isGenericGarment = /\b(?:outfit|clothing|cloth|garment|apparel|fabric)\b/i.test(partName);

          // Some GLBs label garments only as "Outfit" or "Clothing".
          // Use the mesh's vertical position to distinguish torso from legs.
          const color = isHair ? "#24170f"
            : isShirt ? "#477b80"
            : isTrousers ? "#263442"
            : isShoes ? "#20252b"
            : isGenericGarment && heightRatio > 0.56 ? "#477b80"
            : isGenericGarment && heightRatio > 0.13 ? "#263442"
            : null;

          if (!color || !(mat instanceof THREE.MeshStandardMaterial)) return source;

          const next = mat.clone();
          // Clear the source texture so the plain outfit colour is visible.
          next.map = null;
          next.color.set(color);
          next.metalness = 0;
          next.roughness = isHair ? 0.88 : 0.92;
          next.needsUpdate = true;
          return next;
        });

        mesh.material = Array.isArray(mesh.material) ? styledMaterials : styledMaterials[0];
      }

      if ((o as THREE.Bone).isBone) {
        const bone = o as THREE.Bone;
        bones.current[bone.name.replace(/^mixamorig:?/, "")] = {
          bone,
          rest: bone.quaternion.clone(),
          position: bone.position.clone(),
        };
      }
    });

    const box = new THREE.Box3().setFromObject(root);
    const h = box.max.y - box.min.y;
    if (h > 0) {
      const scale = 1.7 / h;
      root.scale.setScalar(scale);
      root.position.y = -box.min.y * scale;
    }
  }, [root]);

  function set(name: string, x: number, y: number, z: number, blend: number) {
    const r = bones.current[name];
    if (!r) return;
    tmp.e.set(x, y, z);
    tmp.q.setFromEuler(tmp.e).premultiply(r.rest);
    r.bone.quaternion.slerp(tmp.q, blend);
  }

  function move(name: string, x: number, y: number, z: number, blend: number) {
    const r = bones.current[name];
    if (!r) return;
    tmp.v.set(x, y, z).add(r.position);
    r.bone.position.lerp(tmp.v, blend);
  }

  useFrame(({ clock }, delta) => {
    const p = poseRef.current;
    const t = clock.elapsedTime;
    const motionKey = [p.move, p.shape, p.both ? "both" : "right", ...p.r, ...p.l].join("|");
    if (motionKey !== motionKeyRef.current) {
      motionKeyRef.current = motionKey;
      motionStartRef.current = t;
    }
    const motionTime = Math.max(0, t - motionStartRef.current);

    // Exponential damping is frame-rate independent and gives every joint a
    // soft ease-in/ease-out when changing words or handshapes.
    const blend = 1 - Math.exp(-Math.min(delta, 0.05) * 11);
    const breath = Math.sin(t * 1.25);
    const idleSway = Math.sin(t * 0.55);

    // A tiny hip shift and chest expansion keep the standing body from looking frozen.
    move("Hips", Math.sin(t * 0.38) * 0.003, Math.sin(t * 1.25) * 0.004, 0, blend * 0.5);
    set("Hips", 0, idleSway * 0.012, 0, blend * 0.55);
    set("Spine", breath * 0.018, idleSway * 0.016, 0, blend * 0.8);
    set("Spine1", breath * 0.012, Math.sin(t * 0.55 + 0.25) * 0.019, 0, blend * 0.8);
    set("Spine2", breath * 0.006, Math.sin(t * 0.55 + 0.45) * 0.012, 0, blend * 0.8);

    for (const side of [1, -1] as const) {
      const S = side === 1 ? "Right" : "Left";
      const active = side === 1 || p.both;
      const a = side === 1 ? p.r : p.l;
      const m = active ? p.move : "none";
      const motion = motionOffset(m, motionTime);

      // Clavicle/shoulder follows the reach before the upper arm, when the rig has that bone.
      set(`${S}Shoulder`, motion.dz * 0.08, 0, -motion.dx * side * 0.08, blend * 0.7);

      // Shoulder, elbow and wrist now share one coordinated motion path.
      const down = ARM_DOWN - (a[1] + motion.dz);
      const forward = a[0] + motion.dx;
      set(`${S}Arm`, down, 0, forward * side, blend);
      set(`${S}ForeArm`, motion.wristX * 0.18, motion.wristY * 0.2, (a[2] + motion.elbow) * side * 0.9, blend);
      set(`${S}Hand`, motion.wristX, motion.wristY * side, motion.wristZ * side, blend);

      const shape = active ? p.shape : "open";
      const curl = CURL[shape];
      const spread = SPREAD[shape];
      FINGERS.forEach((f, i) => {
        const joints = curl[f];
        set(`${S}Hand${f}1`, 0, spread[i] * side, joints[0] * side, blend);
        set(`${S}Hand${f}2`, 0, 0, joints[1] * side, blend);
        set(`${S}Hand${f}3`, 0, 0, joints[2] * side, blend);
      });

      // Coordinated three-joint thumb opposition follows the selected handshape.
      const thumb = shape === "fist" ? [0.48, 0.78, 0.56]
        : shape === "point" ? [0.28, 0.18, 0.12]
        : shape === "bunch" ? [0.42, 0.58, 0.4]
        : [0.12, 0.08, 0.05];
      set(`${S}HandThumb1`, 0, side * (0.24 + thumb[0] * 0.55), side * thumb[0], blend);
      set(`${S}HandThumb2`, 0, side * (0.12 + thumb[1] * 0.3), side * thumb[1], blend);
      set(`${S}HandThumb3`, 0, side * thumb[2] * 0.35, side * thumb[2], blend);
    }

    // A restrained head response keeps attention near the active signing space.
    const headNod = p.move === "tap" || p.move === "nod" ? Math.sin(motionTime * 2.4) * 0.018 : 0;
    const headTurn = p.move === "wave" || p.move === "circle" ? Math.sin(motionTime * 0.55) * 0.025 : Math.sin(t * 0.35) * 0.012;
    set("Neck", headNod * 0.45, headTurn * 0.35, Math.sin(t * 0.45) * 0.008, blend * 0.65);
    set("Head", headNod, headTurn, Math.sin(t * 0.7) * 0.012, blend * 0.7);
  });

  return <primitive object={root} />;
}
useGLTF.preload(model.url);
