import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox, MeshTransmissionMaterial } from '@react-three/drei';
import { getMaterial } from '../textures/generateTextures';

function createRoundedRectShape(width, depth, radius) {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hd = depth / 2;
  const r = Math.min(radius, hw, hd);

  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

  return shape;
}

function PoolShell({ length, width, depth, option }) {
  const meshRef = useRef();
  const material = useMemo(() => getMaterial(option, 1024), [option]);

  const shellGeo = useMemo(() => {
    const L = length * 0.3048;
    const W = width * 0.3048;
    const D = depth * 0.3048;
    const wall = 0.35;
    const cornerRadius = 1.0;

    const outerShape = createRoundedRectShape(L + wall * 2, W + wall * 2, cornerRadius);
    const innerShape = createRoundedRectShape(L, W, cornerRadius - 0.3);

    const extrudeSettings = {
      steps: 1,
      depth: D + 0.3,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 5,
    };

    const group = new THREE.Group();

    // Outer shell
    const outerGeo = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
    outerGeo.translate(0, 0, -(D + 0.3));
    const outerMesh = new THREE.Mesh(outerGeo, material);
    outerMesh.castShadow = true;
    outerMesh.receiveShadow = true;
    group.add(outerMesh);

    // Inner cavity (subtractive visual)
    const innerExtrudeSettings = {
      steps: 1,
      depth: D - 0.15,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.08,
      bevelSegments: 6,
    };
    const innerGeo = new THREE.ExtrudeGeometry(innerShape, innerExtrudeSettings);
    innerGeo.translate(0, 0, -(D - 0.15));
    const innerMat = material.clone();
    innerMat.roughness = Math.min(1, (option.roughness || 0.6) * 0.8);
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.castShadow = true;
    innerMesh.receiveShadow = true;
    group.add(innerMesh);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(L - 0.1, W - 0.1);
    const floorMesh = new THREE.Mesh(floorGeo, innerMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -(D - 0.05);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    return group;
  }, [length, width, depth, material]);

  return <primitive ref={meshRef} object={shellGeo} />;
}

function CopingRing({ length, width, depth }) {
  const copingGeo = useMemo(() => {
    const L = length * 0.3048;
    const W = width * 0.3048;
    const wall = 0.35;
    const overhang = 0.2;
    const r = 1.3;

    const outerShape = createRoundedRectShape(L + wall * 2 + overhang * 2, W + wall * 2 + overhang * 2, r);
    const innerShape = createRoundedRectShape(L - 0.05, W - 0.05, r - 0.4);

    // Create coping as a ring using shape subtraction via path
    const outerPath = outerShape.getPoints(64);
    const innerPath = innerShape.getPoints(64).reverse();

    const allPoints = [...outerPath, ...innerPath];
    const copingShape = new THREE.Shape(allPoints.map(p => new THREE.Vector2(p.x, p.y)));

    const extrudeSettings = {
      steps: 1,
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.04,
      bevelSegments: 4,
    };

    return new THREE.ExtrudeGeometry(copingShape, extrudeSettings);
  }, [length, width, depth]);

  const copingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d6d0ca',
        roughness: 0.25,
        metalness: 0.05,
      }),
    []
  );

  return (
    <mesh geometry={copingGeo} material={copingMat} position={[0, 0.06, 0]} castShadow receiveShadow />
  );
}

function WaterlineTile({ length, width, depth }) {
  const tileGeo = useMemo(() => {
    const L = length * 0.3048;
    const W = width * 0.3048;
    const D = depth * 0.3048;
    const tileHeight = 0.15;

    const positions = [];
    const halfL = L / 2;
    const halfW = W / 2;

    // Simplified waterline: thin box strips along walls
    const stripGeo = new THREE.BoxGeometry(L + 0.05, tileHeight, 0.04);
    const group = new THREE.Group();

    [-1, 1].forEach((sign) => {
      const geo1 = stripGeo.clone();
      geo1.translate(0, -D + tileHeight / 2 + 0.25, sign * (halfW + 0.02));
      group.add(new THREE.Mesh(geo1));

      const geo2 = new THREE.BoxGeometry(0.04, tileHeight, W + 0.05);
      geo2.translate(sign * (halfL + 0.02), -D + tileHeight / 2 + 0.25, 0);
      group.add(new THREE.Mesh(geo2));
    });

    return group;
  }, [length, width, depth]);

  const tileMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e3a5f',
        roughness: 0.15,
        metalness: 0.1,
      }),
    []
  );

  return <primitive object={tileGeo} >
    {tileGeo.children.map((child, i) => (
      <mesh key={i} geometry={child.geometry} material={tileMat} />
    ))}
  </primitive>;
}

function PoolSteps({ length, width, depth }) {
  const stepsGeo = useMemo(() => {
    const L = length * 0.3048;
    const D = depth * 0.3048;
    const stepW = 3.0;
    const stepD = 1.2;
    const stepH = 0.35;
    const numSteps = 3;
    const group = new THREE.Group();

    for (let i = 0; i < numSteps; i++) {
      const geo = new THREE.BoxGeometry(stepW, stepH, stepD);
      geo.translate(0, -D + (i + 1) * stepH - stepH / 2, L / 2 - 0.3 - i * stepD + stepD / 2);
      const mesh = new THREE.Mesh(geo);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    return group;
  }, [length, width, depth]);

  const stepMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e8e4e0',
        roughness: 0.5,
        metalness: 0.0,
      }),
    []
  );

  return <primitive object={stepsGeo}>
    {stepsGeo.children.map((child, i) => (
      <mesh key={i} geometry={child.geometry} material={stepMat} />
    ))}
  </primitive>;
}

export default function PoolModel({ dims, shellOption }) {
  const groupRef = useRef();

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <PoolShell
        length={dims.pool_length}
        width={dims.pool_width}
        depth={dims.pool_depth}
        option={shellOption}
      />
      <WaterlineTile
        length={dims.pool_length}
        width={dims.pool_width}
        depth={dims.pool_depth}
      />
      <CopingRing
        length={dims.pool_length}
        width={dims.pool_width}
        depth={dims.pool_depth}
      />
      <PoolSteps
        length={dims.pool_length}
        width={dims.pool_width}
        depth={dims.pool_depth}
      />
    </group>
  );
}
