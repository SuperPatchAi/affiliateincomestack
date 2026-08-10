import * as THREE from "three";
import {
  PLATE_COLORS,
  PLATE_CORNER_RADIUS,
  PLATE_COUNT,
  PLATE_DEPTH,
  PLATE_GAP,
  PLATE_HEIGHT,
  PLATE_WIDTH,
} from "./platePalette";

function roundedRectShape(
  width: number,
  depth: number,
  radius: number,
): THREE.Shape {
  const hw = width / 2;
  const hd = depth / 2;
  const r = Math.min(radius, hw - 0.01, hd - 0.01);
  const shape = new THREE.Shape();
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

export function createRoundedPlateGeometry(): THREE.ExtrudeGeometry {
  const shape = roundedRectShape(PLATE_WIDTH, PLATE_DEPTH, PLATE_CORNER_RADIUS);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: PLATE_HEIGHT,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 4,
    curveSegments: 16,
  });
  // Extrude along +Z; rotate so thickness is Y (up).
  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  return geometry;
}

function createDataTexture(
  size: number,
  fill: (x: number, y: number, i: number) => [number, number, number],
  colorSpace: THREE.ColorSpace = THREE.NoColorSpace,
): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const [r, g, b] = fill(x, y, i);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.colorSpace = colorSpace;
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createMetalMaps(hex: string): {
  map: THREE.Texture;
  roughnessMap: THREE.Texture;
  metalnessMap: THREE.Texture;
  emissiveMap: THREE.Texture;
} {
  const size = 128;
  // Darker anodized body so specular + env reflections carry the metal read.
  const base = new THREE.Color(hex)
    .lerp(new THREE.Color("#0a0a0c"), 0.42)
    .multiplyScalar(0.78);
  const br = Math.round(base.r * 255);
  const bg = Math.round(base.g * 255);
  const bb = Math.round(base.b * 255);

  // Horizontal brush streaks (anodized / brushed plate).
  const map = createDataTexture(
    size,
    (x, y) => {
      const brush = Math.sin(y * 0.85 + x * 0.04) * 14;
      const micro = (((x * 17 + y * 3) % 19) / 19 - 0.5) * 10;
      return [
        Math.min(255, Math.max(0, br + brush + micro)),
        Math.min(255, Math.max(0, bg + brush * 0.9 + micro)),
        Math.min(255, Math.max(0, bb + brush * 0.75 + micro * 0.8)),
      ];
    },
    THREE.SRGBColorSpace,
  );
  map.repeat.set(2.4, 1.1);

  const roughnessMap = createDataTexture(size, (x, y) => {
    const streak = Math.abs(Math.sin(y * 1.1 + x * 0.05)) * 55;
    const n = Math.min(255, 70 + Math.floor(streak) + ((x * 5 + y * 11) % 18));
    return [n, n, n];
  });
  roughnessMap.repeat.set(3.2, 1.4);

  // Mostly metal; slightly softer paint film toward face center.
  const metalnessMap = createDataTexture(size, (x, y) => {
    const cx = x / (size - 1) - 0.5;
    const cy = y / (size - 1) - 0.5;
    const d = Math.sqrt(cx * cx + cy * cy) * 2;
    const n = Math.min(255, Math.floor(210 + d * 40 + ((x + y) % 8)));
    return [n, n, n];
  });

  // Edge-weighted emissive — neon rim light on metal faces.
  const emissiveMap = createDataTexture(size, (x, y) => {
    const cx = x / (size - 1) - 0.5;
    const cy = y / (size - 1) - 0.5;
    const d = Math.sqrt(cx * cx + cy * cy) * 2;
    const edge = Math.min(255, Math.max(8, Math.floor(8 + d * d * 247)));
    return [edge, edge, edge];
  });

  return { map, roughnessMap, metalnessMap, emissiveMap };
}

export function createPlateMaterials(hex: string): THREE.MeshPhysicalMaterial[] {
  const { map, roughnessMap, metalnessMap, emissiveMap } = createMetalMaps(hex);
  const color = new THREE.Color(hex);

  // ExtrudeGeometry groups: 0 = lids (top/bottom), 1 = sides.
  // Concept still: edge-lit anodized metal plates + neon side glow.
  const face = new THREE.MeshPhysicalMaterial({
    color: color.clone().lerp(new THREE.Color("#121418"), 0.38),
    map,
    roughness: 0.3,
    roughnessMap,
    metalness: 0.92,
    metalnessMap,
    transmission: 0,
    transparent: false,
    opacity: 1,
    emissive: color,
    emissiveIntensity: 0.32,
    emissiveMap,
    envMapIntensity: 1.2,
    clearcoat: 0.62,
    clearcoatRoughness: 0.18,
    anisotropy: 0.72,
    anisotropyRotation: 0,
  });

  const rim = new THREE.MeshPhysicalMaterial({
    color: color.clone().multiplyScalar(0.42),
    roughness: 0.16,
    metalness: 0.9,
    emissive: color,
    emissiveIntensity: 1.85,
    envMapIntensity: 1.05,
    clearcoat: 0.48,
    clearcoatRoughness: 0.12,
  });

  return [face, rim];
}

function createGround(): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(3.4, 96);
  const material = new THREE.MeshStandardMaterial({
    color: 0x06060a,
    roughness: 0.35,
    metalness: 0.72,
    envMapIntensity: 1.1,
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.name = "ground";
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  return ground;
}

/**
 * Hand-crafted photoreal Income Stack for interactive hero preview.
 * Rounded anodized-metal plates with neon side rims + reflective ground.
 */
export function createPhotorealStack(): THREE.Group {
  const root = new THREE.Group();
  root.name = "Income Stack photoreal hero";

  // Shared geometry instance per plate clone would share morph state — clone instead.
  for (let i = 0; i < PLATE_COUNT; i += 1) {
    const geometry = createRoundedPlateGeometry();
    const materials = createPlateMaterials(PLATE_COLORS[i]);
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.name = `plate-${String(i).padStart(2, "0")}`;
    mesh.userData.rounded = true;
    mesh.userData.plateColor = PLATE_COLORS[i];
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const fromTop = i;
    const yFromBottom =
      (PLATE_COUNT - 1 - fromTop) * (PLATE_HEIGHT + PLATE_GAP) +
      PLATE_HEIGHT / 2 +
      0.01;
    mesh.position.y = yFromBottom;
    root.add(mesh);
  }

  root.add(createGround());
  return root;
}

export function disposePhotorealStack(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      for (const key of [
        "map",
        "roughnessMap",
        "metalnessMap",
        "emissiveMap",
        "normalMap",
      ] as const) {
        const tex = (mat as THREE.MeshPhysicalMaterial)[key];
        if (tex) tex.dispose();
      }
      mat.dispose();
    }
  });
}
