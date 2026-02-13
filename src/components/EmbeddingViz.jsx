import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import '../styles/EmbeddingViz.css';

/**
 * 3D visualization of token embeddings using PCA projection to 3D.
 */

function simplePCA3D(embeddings) {
  // Simple projection: take first 3 dimensions and normalize
  if (!embeddings || embeddings.length === 0) return [];

  const dims = embeddings[0].embedding.length;
  if (dims < 3) return embeddings.map(() => [0, 0, 0]);

  // Use first 3 principal-ish dimensions (cols 0, 1, 2)
  const points = embeddings.map((e) => [e.embedding[0], e.embedding[1], e.embedding[2]]);

  // Normalize to [-2, 2] range
  const maxAbs = Math.max(
    ...points.flat().map(Math.abs),
    0.001
  );
  return points.map((p) => p.map((v) => (v / maxAbs) * 2));
}

function EmbeddingPoint({ position, char, color }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        0.8 + Math.sin(state.clock.elapsedTime * 2 + position[0] * 3) * 0.1
      );
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0.15, 0]} fontSize={0.1} color="#ffffff">
        {char}
      </Text>
    </group>
  );
}

function EmbeddingScene({ embeddings }) {
  const projected = useMemo(() => simplePCA3D(embeddings), [embeddings]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-5, -3, 5]} intensity={0.3} color="#4ecdc4" />

      {embeddings.map((emb, i) => {
        const pos = projected[i] || [0, 0, 0];
        // Color by character type: vowels, consonants, special
        const isVowel = 'aeiou'.includes(emb.char.toLowerCase());
        const isSpecial = emb.char === '<BOS>';
        const color = isSpecial ? '#ff6b6b' : isVowel ? '#4ecdc4' : '#a29bfe';

        return (
          <EmbeddingPoint
            key={i}
            position={pos}
            char={emb.char}
            color={color}
          />
        );
      })}

      {/* Axes */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-2.5, 0, 0, 2.5, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#333355" />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -2.5, 0, 0, 2.5, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#333355" />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -2.5, 0, 0, 2.5])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#333355" />
      </line>

      <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={1} />
    </>
  );
}

export default function EmbeddingViz({ embeddings, onRefresh, isReady }) {
  return (
    <div className="embedding-viz">
      <h3>Token Embeddings (3D Projection)</h3>
      <div className="embedding-viz__legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#4ecdc4' }} /> Vowels</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#a29bfe' }} /> Consonants</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#ff6b6b' }} /> Special</span>
        {isReady && (
          <button className="btn btn--small" onClick={onRefresh}>
            Refresh
          </button>
        )}
      </div>
      {embeddings.length > 0 ? (
        <div className="embedding-viz__canvas-container">
          <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
            <EmbeddingScene embeddings={embeddings} />
          </Canvas>
        </div>
      ) : (
        <div className="embedding-viz__placeholder">
          <p>Initialize model and click Refresh to view embeddings</p>
        </div>
      )}
    </div>
  );
}
