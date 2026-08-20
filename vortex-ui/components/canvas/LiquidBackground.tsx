'use client';
import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUv;
  float t = uTime * 0.12;

  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t), fbm(p + vec2(5.2, 1.3) + t * 0.7));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.5), fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.3));
  float f = fbm(p + 4.0 * r);

  vec3 col = mix(
    vec3(0.0, 0.01, 0.005),
    vec3(0.0, 0.16, 0.09),
    clamp(f * f * 4.0, 0.0, 1.0)
  );
  col = mix(col, vec3(0.0, 0.27, 0.15), clamp(length(q), 0.0, 1.0));
  col = mix(col, vec3(0.0, 0.53, 0.31), f * f * f);

  float glow = smoothstep(0.6, 0.9, f);
  col += vec3(0.0, 1.0, 0.5) * glow * 0.08;

  gl_FragColor = vec4(col, 1.0);
}`;

function FluidMesh() {
  const { viewport } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  // Use a manual elapsed ref to avoid THREE.Clock deprecation warning
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = elapsed.current;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1920, 1080) },
        }}
      />
    </mesh>
  );
}

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-70" aria-hidden="true">
      <Canvas
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 1], fov: 60 }}
      >
        <FluidMesh />
      </Canvas>
    </div>
  );
}
