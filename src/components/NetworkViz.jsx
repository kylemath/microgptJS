import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/NetworkViz.css';

/**
 * 3D transformer architecture visualization using Three.js / R3F.
 * Shows the data flow through embedding -> attention -> MLP -> output.
 */

function EmbeddingBlock({ position, label, color, scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={[scale, scale * 0.6, scale * 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <Text position={[0, -scale * 0.5, 0]} fontSize={0.15} color="#ffffff" anchorY="top">
        {label}
      </Text>
    </group>
  );
}

function AttentionHead({ position, index, weights, headDim }) {
  const meshRef = useRef();
  const intensity = weights ? Math.max(...weights.flat?.() || weights) : 0.5;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3 + index;
      meshRef.current.scale.setScalar(0.8 + intensity * 0.4);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.2, 0.06, 8, 24]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(index * 0.25, 0.8, 0.5 + intensity * 0.3)}
          emissive={new THREE.Color().setHSL(index * 0.25, 0.5, intensity * 0.2)}
        />
      </mesh>
      <Text position={[0, -0.35, 0]} fontSize={0.1} color="#aaaacc">
        Head {index}
      </Text>
    </group>
  );
}

function MLPBlock({ position, activations }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    }
  });

  // Color based on average activation magnitude
  const avgAct = activations
    ? activations.reduce((s, a) => s + Math.abs(a), 0) / activations.length
    : 0;
  const hue = 0.08 + Math.min(avgAct, 1) * 0.1;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 6]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(hue, 0.7, 0.5)}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text position={[0, -0.45, 0]} fontSize={0.12} color="#ffffff">
        MLP (ReLU)
      </Text>
    </group>
  );
}

function DataFlow({ from, to, color = '#4ecdc4', active = false }) {
  const points = useMemo(() => {
    const mid = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 0.3,
      (from[2] + to[2]) / 2,
    ];
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to)
    ).getPoints(20);
  }, [from, to]);

  const posArray = useMemo(
    () => new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])),
    [points]
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={posArray}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.9 : 0.3}
      />
    </line>
  );
}

function TransformerScene({ trainingState }) {
  const attnWeights = trainingState?.attentionWeights;
  const embedding = trainingState?.embedding;
  const nHead = 4;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 3, -5]} intensity={0.4} color="#4ecdc4" />

      {/* Input Embedding */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
        <EmbeddingBlock position={[-2, 0, 0]} label="Token Embedding" color="#6c5ce7" scale={0.8} />
      </Float>

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <EmbeddingBlock position={[-2, -1.2, 0]} label="Position Embedding" color="#a29bfe" scale={0.6} />
      </Float>

      {/* Combined + RMSNorm */}
      <Float speed={0.8} floatIntensity={0.2}>
        <EmbeddingBlock position={[0, -0.5, 0]} label="RMSNorm" color="#00b894" scale={0.5} />
      </Float>

      {/* Attention Heads */}
      {Array.from({ length: nHead }, (_, i) => (
        <Float key={i} speed={1 + i * 0.2} floatIntensity={0.2}>
          <AttentionHead
            position={[1.5, 0.5 - i * 0.7, 0]}
            index={i}
            weights={attnWeights?.[0]?.[i]}
          />
        </Float>
      ))}

      {/* MLP */}
      <Float speed={0.6} floatIntensity={0.3}>
        <MLPBlock position={[3, -0.5, 0]} activations={embedding} />
      </Float>

      {/* Output */}
      <Float speed={0.9} floatIntensity={0.2}>
        <EmbeddingBlock position={[4.5, -0.5, 0]} label="Output Logits" color="#fd79a8" scale={0.7} />
      </Float>

      {/* Data flow arrows */}
      <DataFlow from={[-2, 0, 0]} to={[0, -0.3, 0]} active={!!embedding} />
      <DataFlow from={[-2, -1.2, 0]} to={[0, -0.7, 0]} color="#a29bfe" active={!!embedding} />
      <DataFlow from={[0, -0.5, 0]} to={[1.2, -0.5, 0]} active={!!attnWeights} />
      <DataFlow from={[1.8, -0.5, 0]} to={[3, -0.5, 0]} color="#fdcb6e" active={!!attnWeights} />
      <DataFlow from={[3, -0.5, 0]} to={[4.5, -0.5, 0]} color="#fd79a8" active={!!embedding} />

      {/* Title */}
      <Text position={[1.25, 1.8, 0]} fontSize={0.25} color="#ffffff" fontWeight="bold">
        Transformer Architecture
      </Text>
      <Text position={[1.25, 1.5, 0]} fontSize={0.12} color="#8888aa">
        Token → Embedding → Attention → MLP → Logits
      </Text>

      <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function NetworkViz({ trainingState }) {
  return (
    <div className="network-viz">
      <h3>3D Model Architecture</h3>
      <div className="network-viz__canvas-container">
        <Canvas camera={{ position: [1.25, 0, 5], fov: 50 }}>
          <TransformerScene trainingState={trainingState} />
        </Canvas>
      </div>
      <p className="network-viz__hint">Drag to rotate, scroll to zoom</p>
    </div>
  );
}
