import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { PLATE_COLORS, PLATE_COUNT } from "./platePalette";
import {
  createPhotorealStack,
  createPlateMaterials,
} from "./createPhotorealStack";

describe("createPlateMaterials", () => {
  it("builds anodized metal face + bright metallic neon rim", () => {
    const [face, rim] = createPlateMaterials("#00E5FF");
    expect(face.metalness).toBeGreaterThanOrEqual(0.75);
    expect(face.transmission).toBeLessThan(0.05);
    expect(face.roughness).toBeGreaterThan(0.18);
    expect(face.roughness).toBeLessThan(0.45);
    expect(face.envMapIntensity).toBeGreaterThanOrEqual(0.85);
    expect(face.clearcoat).toBeGreaterThanOrEqual(0.35);
    expect(face.emissiveIntensity).toBeGreaterThan(0.15);
    expect(face.emissiveIntensity).toBeLessThan(0.55);
    expect(rim.metalness).toBeGreaterThanOrEqual(0.7);
    expect(rim.emissiveIntensity).toBeGreaterThan(face.emissiveIntensity);
    expect(rim.emissiveIntensity).toBeGreaterThan(1.4);
    expect(rim.envMapIntensity).toBeGreaterThanOrEqual(0.7);
    expect(rim.emissive.getHex()).toBe(new THREE.Color("#00E5FF").getHex());
  });
});

describe("createPhotorealStack", () => {
  it("builds eleven spectrally ordered rounded plates plus a ground mesh", () => {
    const root = createPhotorealStack();
    const plates: THREE.Mesh[] = [];
    let ground: THREE.Mesh | null = null;

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (obj.name === "ground") ground = obj;
      if (obj.name.startsWith("plate-")) plates.push(obj);
    });

    plates.sort((a, b) => a.name.localeCompare(b.name));

    expect(plates).toHaveLength(PLATE_COUNT);
    expect(ground).toBeTruthy();

    for (let i = 0; i < PLATE_COUNT; i += 1) {
      const mesh = plates[i];
      expect(mesh.name).toBe(`plate-${String(i).padStart(2, "0")}`);
      expect(mesh.userData.rounded).toBe(true);
      expect(mesh.geometry.type).not.toBe("BoxGeometry");

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      const face = materials.find(
        (m): m is THREE.MeshPhysicalMaterial =>
          m instanceof THREE.MeshPhysicalMaterial &&
          m.metalness >= 0.75 &&
          m.transmission < 0.05,
      );
      const rim = materials.find(
        (m): m is THREE.MeshPhysicalMaterial =>
          m instanceof THREE.MeshPhysicalMaterial && m.emissiveIntensity > 1.2,
      );
      expect(face).toBeTruthy();
      expect(rim).toBeTruthy();
      expect(rim!.emissive.getHex()).toBe(
        new THREE.Color(PLATE_COLORS[i]).getHex(),
      );
    }

    expect(plates[0].position.y).toBeGreaterThan(
      plates[PLATE_COUNT - 1].position.y,
    );
  });
});
