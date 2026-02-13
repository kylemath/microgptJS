import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/AttentionViz.css';

/**
 * 3D visualization of attention weights.
 * Shows attention heads as color-coded bars/columns.
 */

function AttentionBar({ position, height, color, label }) {
  const meshRef = useRef();
  useFrame(() => {
    if (meshRef.current) {
      // Smoothly animate to target height
      const target = Math.max(0.01, height);
      meshRef.current.scale.y += (target - meshRef.current.scale.y) * 0.1;
      meshRef.current.position.y = meshRef.current.scale.y / 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.15, 1, 0.15]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>
      {label && (
        <Text position={[0, -0.15, 0]} fontSize={0.08} color="#aaaacc" rotation={[-Math.PI / 4, 0, 0]}>
          {label}
        </Text>
      )}
    </group>
  );
}

function AttentionScene({ attentionWeights }) {
  const headColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#fdcb6e'];
  const nHead = attentionWeights?.length || 4;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 5, 3]} intensity={0.8} />

      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} />
      </mesh>

      {/* Attention bars per head */}
      {attentionWeights && attentionWeights.map((headWeights, h) => {
        const weights = Array.isArray(headWeights) ? headWeights : [];
        return weights.map((w, t) => (
          <AttentionBar
            key={`${h}-${t}`}
            position={[h * 1.2 - (nHead * 1.2) / 2 + 0.6, 0, t * 0.3 - 0.5]}
            height={w * 2}
            color={headColors[h % headColors.length]}
            label={t === 0 ? `H${h}` : undefined}
          />
        ));
      })}

      {/* Head labels */}
      {Array.from({ length: nHead }, (_, h) => (
        <Text
          key={h}
          position={[h * 1.2 - (nHead * 1.2) / 2 + 0.6, 2.2, 0]}
          fontSize={0.15}
          color={headColors[h % headColors.length]}
        >
          Head {h}
        </Text>
      ))}

      <OrbitControls enableZoom={true} enablePan={true} />
    </>
  );
}

export default function AttentionViz({ trainingState }) {
  const attnWeights = trainingState?.attentionWeights?.[0]; // Layer 0

  return (
    <div className="attention-viz">
      <h3>Attention Weights</h3>
      {attnWeights ? (
        <div className="attention-viz__canvas-container">
          <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
            <AttentionScene attentionWeights={attnWeights} />
          </Canvas>
        </div>
      ) : (
        <div className="attention-viz__placeholder">
          <p>Start training to see attention weights</p>
        </div>
      )}
    </div>
  );
}
