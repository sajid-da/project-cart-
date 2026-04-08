import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Edges } from "@react-three/drei";
import * as THREE from "three";

function CartMesh({ onClick, hovered, setHovered }: {
  onClick: () => void;
  hovered: boolean;
  setHovered: (v: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (hovered ? 0.9 : 0.35);
    const t = hovered ? 1.08 : 1.0;
    const s = groupRef.current.scale;
    s.x += (t - s.x) * 0.1;
    s.y += (t - s.y) * 0.1;
    s.z += (t - s.z) * 0.1;
  });

  const indigo = hovered ? "#6366f1" : "#4f46e5";
  const dark = "#4338ca";
  const deepDark = "#312e81";

  return (
    <Float speed={1.5} floatIntensity={0.35} rotationIntensity={0.08}>
      <group
        ref={groupRef}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        {/* Main basket */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.7, 0.8]} />
          <meshStandardMaterial color={indigo} metalness={0.3} roughness={0.4} transparent opacity={0.88} />
          <Edges color={hovered ? "#a5b4fc" : "#818cf8"} />
        </mesh>

        {/* Inner basket */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.05, 0.55, 0.65]} />
          <meshStandardMaterial color={deepDark} transparent opacity={0.5} />
        </mesh>

        {/* Handle crossbar */}
        <mesh position={[0, 0.57, -0.36]}>
          <boxGeometry args={[1.1, 0.07, 0.07]} />
          <meshStandardMaterial color={indigo} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Handle uprights */}
        {([-0.5, 0.5] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0.22, -0.36]}>
            <boxGeometry args={[0.07, 0.63, 0.07]} />
            <meshStandardMaterial color={indigo} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}

        {/* Bottom platform */}
        <mesh position={[0, -0.39, 0]}>
          <boxGeometry args={[1.25, 0.06, 0.85]} />
          <meshStandardMaterial color={dark} metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Front face plate */}
        <mesh position={[0, 0, 0.43]}>
          <boxGeometry args={[1.18, 0.68, 0.04]} />
          <meshStandardMaterial color={indigo} transparent opacity={0.6} />
          <Edges color="#818cf8" />
        </mesh>

        {/* Horizontal grid lines */}
        {([-0.16, 0.16] as number[]).map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[1.18, 0.03, 0.78]} />
            <meshStandardMaterial color={indigo} transparent opacity={0.35} />
          </mesh>
        ))}

        {/* Vertical grid lines */}
        {([-0.36, 0, 0.36] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.03, 0.68, 0.78]} />
            <meshStandardMaterial color={indigo} transparent opacity={0.35} />
          </mesh>
        ))}

        {/* Leg supports */}
        {([[-0.55, -0.55, 0.35], [0.55, -0.55, 0.35], [-0.55, -0.55, -0.35], [0.55, -0.55, -0.35]] as [number, number, number][]).map(
          ([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[0.07, 0.35, 0.07]} />
              <meshStandardMaterial color={dark} metalness={0.5} roughness={0.3} />
            </mesh>
          )
        )}

        {/* Wheels */}
        {([[-0.55, -0.75, 0.35], [0.55, -0.75, 0.35], [-0.55, -0.75, -0.35], [0.55, -0.75, -0.35]] as [number, number, number][]).map(
          ([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
              <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
            </mesh>
          )
        )}

        {/* Glow aura */}
        <mesh>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshStandardMaterial color={indigo} transparent opacity={0.035} side={THREE.BackSide} />
        </mesh>
      </group>
    </Float>
  );
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function CartScene({ onCartClick }: { onCartClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [webglAvailable] = useState(() => checkWebGL());

  if (!webglAvailable) {
    throw new Error("WebGL not available");
  }

  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.5], fov: 45 }}
      style={{ cursor: hovered ? "pointer" : "grab" }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x000000), 0);
      }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 3, -3]} intensity={0.4} color="#a5b4fc" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#818cf8" />

      <CartMesh onClick={onCartClick} hovered={hovered} setHovered={setHovered} />
    </Canvas>
  );
}
