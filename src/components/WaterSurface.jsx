import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const waterVS = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying float vWaveHeight;

  uniform float uTime;
  uniform vec2 uWaveSpeed;
  uniform float uDistortionScale;
  uniform float uChoppiness;

  void main() {
    vec3 pos = position;
    float dx1 = pos.x * 2.6 + uTime * 0.7;
    float dz1 = pos.z * 2.3 + uTime * 0.55;
    float dx2 = pos.x * 5.2 - uTime * 0.45;
    float dz2 = pos.z * 4.8 + uTime * 0.6;

    float wave = sin(dx1) * cos(dz1) * 0.12
               + sin(dx2 * 0.7 + dz2 * 0.8) * 0.06
               + sin(dx2) * cos(dz1 * 1.2) * 0.04;

    pos.y += wave;
    vWaveHeight = wave;

    pos.x += cos(pos.z * 1.8 + uTime * 0.35) * 0.04;
    pos.z += sin(pos.x * 1.6 + uTime * 0.3) * 0.04;

    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vWorldPos = wp.xyz;

    float dwdx = cos(dx1) * 2.6 * 0.12 + cos(dx2 * 0.7 + dz2 * 0.8) * 0.7 * 5.2 * 0.06 + cos(dx2) * 5.2 * 0.04;
    float dwdz = cos(dz1) * 2.3 * 0.12 + cos(dx2 * 0.7 + dz2 * 0.8) * 0.8 * 4.8 * 0.06 + sin(dz1 * 1.2) * 1.2 * 0.04;

    vNormal = normalize(mat3(modelMatrix) * normalize(vec3(-dwdx, 1.0, -dwdz)));
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mv.xyz);
    vUv = uv;
    gl_Position = projectionMatrix * mv;
  }
`;

const waterFS = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying float vWaveHeight;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDistortionScale;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);

    float fresnel = pow(1.0 - abs(dot(N, V)), 4.0);
    fresnel = mix(0.06, 0.65, fresnel);

    // Caustics
    vec2 cuv = vWorldPos.xz * uDistortionScale * 0.5;
    float c = sin(cuv.x * 15.0 + uTime) * sin(cuv.y * 15.0 + uTime * 0.8)
            + sin(cuv.x * 9.0 - uTime * 0.6) * sin(cuv.y * 11.0 + uTime * 0.5)
            + sin(cuv.x * 6.5 + uTime * 0.4) * sin(cuv.y * 8.0 - uTime * 0.55);
    c = c * 0.33 + 0.5;
    c = smoothstep(0.36, 0.64, c);

    // Depth
    float depth = vWaveHeight * 4.0;
    vec3 shallow = uColor * 1.35;
    vec3 deep = uColor * 0.15;
    vec3 water = mix(shallow, deep, smoothstep(-0.3, -1.2, depth));

    // Specular
    vec3 sunDir = normalize(vec3(0.5, 0.8, 0.3));
    vec3 H = normalize(sunDir + V);
    float spec = pow(max(dot(N, H), 0.0), 256.0) * 0.7;

    water += vec3(0.1, 0.2, 0.3) * c * 0.35;
    water += vec3(1.0, 0.94, 0.8) * spec * (0.2 + fresnel * 0.8);
    water = mix(water, vec3(0.7, 0.85, 1.0), fresnel * 0.5);

    gl_FragColor = vec4(water, uOpacity);
  }
`;

export default function WaterSurface({ length, width, depth, option }) {
  const meshRef = useRef();
  const { camera } = useThree();

  const L = length * 0.3048;
  const W = width * 0.3048;
  const D = depth * 0.3048;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(option.color) },
      uOpacity: { value: option.opacity || 0.6 },
      uDistortionScale: { value: option.distortionScale || 4.0 },
      uWaveSpeed: { value: new THREE.Vector2(option.waveSpeed?.[0] || 0.08, option.waveSpeed?.[1] || 0.12) },
      uChoppiness: { value: 0.33 },
    }),
    []
  );

  useMemo(() => {
    uniforms.uColor.value.set(option.color);
    uniforms.uOpacity.value = option.opacity || 0.6;
    uniforms.uDistortionScale.value = option.distortionScale || 4.0;
  }, [option, uniforms]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  const waterGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(L - 0.15, W - 0.15, 100, 100);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [L, W]);

  return (
    <mesh
      ref={meshRef}
      geometry={waterGeo}
      position={[0, -0.03, 0]}
      renderOrder={1}
    >
      <shaderMaterial
        vertexShader={waterVS}
        fragmentShader={waterFS}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
