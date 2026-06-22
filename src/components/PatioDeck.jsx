import { useMemo } from 'react';
import * as THREE from 'three';
import { getMaterial } from '../textures/generateTextures';

export default function PatioDeck({ length, width, option }) {
  const L = length * 0.3048;
  const W = width * 0.3048;
  const wallT = 0.3;
  const margin = 3.0;

  const patioL = L + wallT * 2 + margin * 2;
  const patioW = W + wallT * 2 + margin * 2;
  const thickness = 0.12;

  const material = useMemo(() => getMaterial(option, 1024), [option]);

  const deckGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(patioL, patioW);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [patioL, patioW]);

  // Thick edge around the patio
  const edgeGeos = useMemo(() => {
    const longGeo = new THREE.BoxGeometry(patioL, thickness, 0.08);
    const shortGeo = new THREE.BoxGeometry(0.08, thickness, patioW);
    return { longGeo, shortGeo };
  }, [patioL, patioW]);

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
    <group position={[0, -0.01, 0]}>
      {/* Deck surface — sits flat at ground level */}
      <mesh geometry={deckGeo} material={material} receiveShadow />

      {/* Edge trim */}
      <mesh
        geometry={edgeGeos.longGeo}
        material={edgeMat}
        position={[0, -thickness / 2, patioW / 2]}
        castShadow
      />
      <mesh
        geometry={edgeGeos.longGeo}
        material={edgeMat}
        position={[0, -thickness / 2, -patioW / 2]}
        castShadow
      />
      <mesh
        geometry={edgeGeos.shortGeo}
        material={edgeMat}
        position={[-patioL / 2, -thickness / 2, 0]}
        castShadow
      />
      <mesh
        geometry={edgeGeos.shortGeo}
        material={edgeMat}
        position={[patioL / 2, -thickness / 2, 0]}
        castShadow
      />
    </group>
  );
}
