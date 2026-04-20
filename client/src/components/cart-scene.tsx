import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

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

function ShoppingCart({ onClick, hovered, setHovered }: {
  onClick: () => void;
  hovered: boolean;
  setHovered: (v: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/cart.glb");

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material = node.material.clone();
        }
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    clonedScene.traverse((node: any) => {
      if (node.isMesh && node.material) {
        node.material.emissive = new THREE.Color(hovered ? 0x4f46e5 : 0x000000);
        node.material.emissiveIntensity = hovered ? 0.15 : 0;
      }
    });
  }, [hovered, clonedScene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * (hovered ? 0.7 : 0.25);
    const target = hovered ? 1.07 : 1.0;
    const s = groupRef.current.scale;
    s.x += (target - s.x) * 0.08;
    s.y += (target - s.y) * 0.08;
    s.z += (target - s.z) * 0.08;
  });

  return (
    <Float speed={1.2} floatIntensity={0.25} rotationIntensity={0.06}>
      <group
        ref={groupRef}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        dispose={null}
      >
        {/* Scale down the model (bounding box ~10 units wide → 0.18 scale = ~1.8 units) */}
        <primitive object={clonedScene} scale={[0.18, 0.18, 0.18]} position={[0, -0.9, 0]} />
      </group>
    </Float>
  );
}

useGLTF.preload("/cart.glb");

export default function CartScene({ onCartClick }: { onCartClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  if (!checkWebGL()) {
    return (
      <button
        type="button"
        onClick={onCartClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-80 w-full items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl"
        data-testid="button-cart-fallback"
      >
        <div className="text-center">
          <div className="text-6xl">{hovered ? "🛒" : "🛍️"}</div>
          <div className="mt-3 text-lg font-semibold">Click the cart to begin</div>
          <div className="mt-1 text-sm opacity-90">3D view unavailable on this device</div>
        </div>
      </button>
    );
  }

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1, 4], fov: 40 }}
      style={{ cursor: hovered ? "pointer" : "grab" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#c7d2fe" />
      <pointLight position={[0, 4, 2]} intensity={0.7} color="#818cf8" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.4}
        penumbra={0.6}
        intensity={1.2}
        castShadow
      />

      <ShoppingCart onClick={onCartClick} hovered={hovered} setHovered={setHovered} />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.3}
        scale={8}
        blur={2.5}
        far={4}
        color="#4338ca"
      />

      <Environment preset="city" />
    </Canvas>
  );
}
