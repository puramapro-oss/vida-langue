'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei'
import { Suspense, useRef, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Sphère distordue émeraude avec MeshDistortMaterial.
 * Float doux + rotation lente.
 */
function VedaSphere() {
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshDistortMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={0.25}
          distort={0.35}
          speed={1.8}
          roughness={0.25}
          metalness={0.55}
        />
      </mesh>
    </Float>
  )
}

/**
 * 200 particules orbitales teal.
 */
function OrbitalParticles() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3)
    for (let i = 0; i < 200; i++) {
      const radius = 2 + Math.random() * 1.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = radius * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05
      ref.current.rotation.x += delta * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#5EEAD4"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

/**
 * Hero3D principal. À utiliser via dynamic import (ssr:false).
 * Container : absolute inset-0 pointer-events-none opacity-70.
 */
export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-70">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1.2} color="#10B981" />
          <pointLight position={[-5, -3, -2]} intensity={0.8} color="#06B6D4" />
          <VedaSphere />
          <OrbitalParticles />
          <Stars radius={50} depth={50} count={800} factor={3} saturation={0} fade />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            enableDamping
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
