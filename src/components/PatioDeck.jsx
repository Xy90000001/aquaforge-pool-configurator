import { useMemo } from 'react';
import * as THREE from 'three';
import { getMaterial } from '../textures/generateTextures';

export default function PatioDeck({ length, width, option }) {
  const L = length * 0.3048;
  const W = width * 0.3048;
  const wall = 0.35;
  const margin = 3.5;

  const material = useMemo(() => getMaterial(option, 1024), [option]);

  const deckGeo = useMemo(() => {
    const patioL = L + wall * 2 + margin * 2;
    const patioW = W + wall * 2 + margin * 2;
    const geo = new THREE.PlaneGeometry(patioL, patioW);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [L, W]);

  // Patio edge/thickness
  const edgeGeo = useMemo(() => {
    const patioL = L + wall * 2 + margin * 2;
    const patioW = W + wall * 2 + margin * 2;
    const thickness = 0.15;

    // Create a box for the patio edge perimeter
    const group = new THREE.Group();

    // Four edge boxes
    const longEdge = new THREE.BoxGeometry(patioL, thickness, 0.12);
    const shortEdge = new THREE.BoxGeometry(0.12, thickness, patioW);

    [-1, 1].forEach((s) => {
      const e1 = new THREE.Mesh(longEdge);
      e1.position.set(0, -thickness / 2, s * (patioW / 2));
      group.add(e1);

      const e2 = new THREE.Mesh(shortEdge);
      e2.position.set(s * (patioL / 2), -thickness / 2, 0);
      group.add(e2);
    });

    return group;
  }, [L, W]);

  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: option.color,
        roughness: 0.7,
        metalness: 0,
      }),
    [option]
  );

  return (
    <group position={[0, -0.02, 0]}>
      <mesh geometry={deckGeo} material={material} receiveShadow />
      <primitive object={edgeGeo}>
        {edgeGeo.children.map((child, i) => (
          <mesh key={i} geometry={child.geometry} material={edgeMat} castShadow />
        ))}
      </primitive>
    </group>
  );
}
