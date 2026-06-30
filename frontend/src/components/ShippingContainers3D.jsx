import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, RoundedBox } from "@react-three/drei";

const COLORS = {
  navy: "#002D62",
  red: "#D90429",
  white: "#F8FAFC",
  steel: "#1d4ed8",
};

function Container({ position, color, rotation = [0, 0, 0], scale = 1, speed = 1 }) {
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
      <group position={position} rotation={rotation} scale={scale}>
        <RoundedBox args={[2.2, 1, 1]} radius={0.06} smoothness={4} castShadow>
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.45} />
        </RoundedBox>
        {/* corrugation lines */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.505]}>
            <boxGeometry args={[0.04, 0.9, 0.02]} />
            <meshStandardMaterial color="#00000022" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function ContainerStack() {
  const group = useRef();
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25;
    }
  });
  return (
    <group ref={group} rotation={[0.1, -0.4, 0]}>
      <Container position={[0, 1.1, 0]} color={COLORS.red} speed={1.1} />
      <Container position={[-0.3, 0, 0.2]} color={COLORS.navy} speed={0.9} rotation={[0, 0.15, 0]} />
      <Container position={[0.4, -1.1, -0.3]} color={COLORS.white} speed={1.3} rotation={[0, -0.2, 0]} />
      <Container position={[2.4, 0.3, -1.2]} color={COLORS.steel} scale={0.8} speed={1.5} />
      <Container position={[-2.6, -0.6, -1]} color={COLORS.red} scale={0.7} speed={1.4} rotation={[0, 0.4, 0.1]} />
    </group>
  );
}

export default function ShippingContainers3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.6} castShadow />
        <directionalLight position={[-5, -3, 2]} intensity={0.5} color="#D90429" />
        <ContainerStack />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
