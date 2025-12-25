"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

export type VisitorStatus = "browsing" | "cart" | "checkout";

export type Visitor = {
  id: string;
  city: string;
  lat: number;
  lon: number;
  status: VisitorStatus;
};

// داتا ديمو مؤقتة – حتى نربطوها مع الباك لاحقاً
const DEMO_VISITORS: Visitor[] = [
  {
    id: "1",
    city: "Casablanca",
    lat: 33.5731,
    lon: -7.5898,
    status: "checkout",
  },
  {
    id: "2",
    city: "Rabat",
    lat: 34.0209,
    lon: -6.8416,
    status: "cart",
  },
  {
    id: "3",
    city: "Paris",
    lat: 48.8566,
    lon: 2.3522,
    status: "browsing",
  },
  {
    id: "4",
    city: "Doha",
    lat: 25.2854,
    lon: 51.531,
    status: "checkout",
  },
  {
    id: "5",
    city: "Dubai",
    lat: 25.2048,
    lon: 55.2708,
    status: "cart",
  },
  {
    id: "6",
    city: "London",
    lat: 51.5074,
    lon: -0.1278,
    status: "browsing",
  },
];

type DashboardSceneProps = {
  visitors?: Visitor[];
};

function latLonToCartesian(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

type VisitorPointProps = {
  visitor: Visitor;
  radius: number;
};

function VisitorPoint({ visitor, radius }: VisitorPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { position, color } = useMemo(() => {
    const pos = latLonToCartesian(visitor.lat, visitor.lon, radius);

    let c = "#22c55e"; // browsing
    if (visitor.status === "cart") c = "#eab308"; // in cart
    if (visitor.status === "checkout") c = "#f97316"; // checkout

    return { position: pos, color: c };
  }, [visitor, radius]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Particle system for ambient effect
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Random sphere distribution
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const t = clock.getElapsedTime();
    particlesRef.current.rotation.y = t * 0.05;
    particlesRef.current.rotation.x = Math.sin(t * 0.03) * 0.1;
  });

  return (
    <points ref={particlesRef} geometry={particleGeometry}>
      <pointsMaterial
        size={0.03}
        color="#22c55e"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}


type RodixGlobeProps = {
  visitors: Visitor[];
};

function RodixGlobe({ visitors }: RodixGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 2;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.25;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* النواة الداخلية – كورة داكنة مع emissive خفيفة */}
      <mesh>
        <sphereGeometry args={[radius * 0.98, 64, 64]} />
        <meshStandardMaterial
          color="#020617"
          emissive="#10b981"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* شبكة Rodix – grid كثيفة تعطي إحساس hex/نيون */}
      <mesh>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* طبقة خارجية خفيفة glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.04, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* طبقة glow إضافية للتأثير الأقوى */}
      <mesh>
        <sphereGeometry args={[radius * 1.08, 24, 24]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* نقاط الزوار فوق الغلوب */}
      {visitors.map((v) => (
        <VisitorPoint
          key={v.id}
          visitor={v}
          radius={radius + 0.04}
        />
      ))}
    </group>
  );
}

export default function DashboardScene({ visitors }: DashboardSceneProps) {
  const data = visitors && visitors.length > 0 ? visitors : DEMO_VISITORS;

  const stats = useMemo(() => {
    let browsing = 0;
    let cart = 0;
    let checkout = 0;

    for (const v of data) {
      if (v.status === "browsing") browsing++;
      else if (v.status === "cart") cart++;
      else if (v.status === "checkout") checkout++;
    }

    return {
      browsing,
      cart,
      checkout,
      total: data.length,
    };
  }, [data]);

  return (
    <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-black via-neutral-950 to-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[6, 6, 6]} intensity={1.5} color="#10b981" />
        <pointLight position={[-4, -3, -6]} intensity={0.9} color="#22c55e" />
        <pointLight position={[0, -5, 0]} intensity={0.6} color="#059669" />
        <RodixGlobe visitors={data} />
        <ParticleField />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* overlay ديال الإحصائيات فوق الغلوب */}
      <div className="pointer-events-none absolute top-3 right-3 rounded-xl border border-emerald-500/40 bg-black/70 px-3 py-2 text-[11px] text-neutral-200 shadow-[0_0_18px_rgba(16,185,129,0.45)]">
        <div className="font-semibold text-xs mb-1 text-emerald-300">
          Live visitors (demo)
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{stats.browsing} browsing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>{stats.cart} in cart</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            <span>{stats.checkout} checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
