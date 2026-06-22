import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const waterVertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying float vHeight;

  uniform float uTime;
  uniform vec2 uWaveSpeed;
  uniform float uWaveAmpA;
  uniform float uWaveAmpB;
  uniform float uWaveFreqA;
  uniform float uWaveFreqB;
  uniform vec2 uWaveDirA;
  uniform vec2 uWaveDirB;
  uniform float uChoppiness;

  void main() {
    vec3 pos = position;

    float waveA = sin(pos.x * uWaveFreqA + uTime * uWaveSpeed.x)
                * cos(pos.z * uWaveFreqA + uTime * uWaveSpeed.y)
                * uWaveAmpA;

    float waveB = sin(pos.x * uWaveFreqB * uWaveDirB.x + pos.z * uWaveFreqB * uWaveDirB.y + uTime * uWaveSpeed.y * 1.4)
                * uWaveAmpB;

    float wave = waveA + waveB;
    pos.y += wave;
    vHeight = wave;

    pos.x += cos(pos.z * uWaveFreqA * 1.8 + uTime * uWaveSpeed.x * 1.3) * uChoppiness * uWaveAmpA;
    pos.z += sin(pos.x * uWaveFreqB * 1.6 + uTime * uWaveSpeed.y * 1.2) * uChoppiness * uWaveAmpB;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    float dwdx = cos(pos.x * uWaveFreqA + uTime * uWaveSpeed.x) * uWaveFreqA * uWaveAmpA
               + cos(pos.x * uWaveFreqB * uWaveDirB.x + pos.z * uWaveFreqB * uWaveDirB.y + uTime * uWaveSpeed.y * 1.4) * uWaveFreqB * uWaveDirB.x * uWaveAmpB;

    float dwdz = cos(pos.z * uWaveFreqA + uTime * uWaveSpeed.y) * uWaveFreqA * uWaveAmpA
               + cos(pos.x * uWaveFreqB * uWaveDirB.x + pos.z * uWaveFreqB * uWaveDirB.y + uTime * uWaveSpeed.y * 1.4) * uWaveFreqB * uWaveDirB.y * uWaveAmpB;

    vNormal = normalize(mat3(modelMatrix) * normalize(vec3(-dwdx, 1.0, -dwdz)));

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    vUv = uv;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const waterFragmentShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vViewDir;
  varying float vHeight;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDistortionScale;
  uniform float uRoughness;
  uniform vec3 uCameraPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);

    // Fresnel reflection
    float fresnel = pow(1.0 - abs(dot(N, V)), 3.5);
    fresnel = mix(0.08, 0.7, fresnel);

    // Caustic-like light pattern
    vec2 cuv = vWorldPos.xz * uDistortionScale * 0.6;
    float caustic = 0.0;
    caustic += sin(cuv.x * 14.0 + uTime * 0.9) * sin(cuv.y * 14.0 + uTime * 0.7);
    caustic += sin(cuv.x * 9.0 - uTime * 0.55) * sin(cuv.y * 11.0 + uTime * 0.45);
    caustic += sin(cuv.x * 6.0 + uTime * 0.35) * sin(cuv.y * 8.0 - uTime * 0.5);
    caustic = caustic * 0.33 + 0.5;
    caustic = smoothstep(0.38, 0.62, caustic);

    // Depth coloring
    float depth = vHeight * 3.0;
    vec3 shallowColor = uColor * 1.3;
    vec3 deepColor = uColor * 0.2;
    vec3 waterColor = mix(shallowColor, deepColor, smoothstep(-0.3, -1.5, depth));

    // Specular highlight
    vec3 sunDir = normalize(vec3(0.6, 0.8, 0.4));
    vec3 H = normalize(sunDir + V);
    float spec = pow(max(dot(N, H), 0.0), 1.0 / (uRoughness * uRoughness + 0.001)) * (1.0 - uRoughness) * 0.8;

    // Subsurface scattering approximation
    float sss = max(0.0, dot(sunDir, -N)) * 0.15;
    vec3 sssColor = uColor * 1.5;

    vec3 color = waterColor;
    color += sssColor * sss;
    color += vec3(0.15, 0.25, 0.35) * caustic * 0.3;
    color += vec3(1.0, 0.94, 0.8) * spec * (0.3 + fresnel * 0.7);
    color = mix(color, vec3(0.85, 0.93, 1.0), fresnel * 0.6);

    gl_FragColor = vec4(color, uOpacity);
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
      uOpacity: { value: option.opacity || 0.65 },
      uDistortionScale: { value: option.distortionScale || 4.0 },
      uWaveSpeed: {
        value: new THREE.Vector2(
          option.waveSpeed?.[0] || 0.08,
          option.waveSpeed?.[1] || 0.12
        ),
      },
      uWaveAmpA: { value: 0.16 },
      uWaveAmpB: { value: 0.07 },
      uWaveFreqA: { value: 2.3 },
      uWaveFreqB: { value: 5.7 },
      uWaveDirA: { value: new THREE.Vector2(0.6, 0.8) },
      uWaveDirB: { value: new THREE.Vector2(-0.4, 0.9) },
      uChoppiness: { value: 0.33 },
      uCameraPos: { value: new THREE.Vector3() },
      uRoughness: { value: 0.01 },
    }),
    [option]
  );

  // Update uniform when option changes
  useMemo(() => {
    uniforms.uColor.value.set(option.color);
    uniforms.uOpacity.value = option.opacity || 0.65;
    uniforms.uDistortionScale.value = option.distortionScale || 4.0;
    uniforms.uWaveSpeed.value.set(
      option.waveSpeed?.[0] || 0.08,
      option.waveSpeed?.[1] || 0.12
    );
  }, [option, uniforms]);

  useFrame((_, delta) => {
    if (uniforms.uTime) {
      uniforms.uTime.value += delta;
      uniforms.uCameraPos.value.copy(camera.position);
    }
  });

  const waterGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(L - 0.2, W - 0.2, 128, 128);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [L, W]);

  return (
    <mesh
      ref={meshRef}
      geometry={waterGeo}
      position={[0, -D + 0.04, 0]}
      renderOrder={1}
    >
      <shaderMaterial
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
