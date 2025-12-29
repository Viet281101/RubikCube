import * as THREE from 'three';
import Cube from './Cube.js';
import { RUBIK_COLORS } from '../constants/colors.js';

export default class RubikCube {
  constructor({
    size = 3,
    cubieSize = 1,
    gap = 0.05,
  } = {}) {
    this.size = size;
    this.cubieSize = cubieSize;
    this.gap = gap;

    this.group = new THREE.Group();
    this.cubies = [];

    this._createCubies();
  }

  /**
   * Create materials for each face of the Cubie
    * Conventions:
    * - leftRight: 0 → Left, max → Right
    * - downUp: 0 → Down, max → Up
    * - backFront: 0 → Back, max → Front
   */
  _createCubieMaterials(leftRight, downUp, backFront) {
    const max = this.size - 1;

    const faces = [
      leftRight === max ? RUBIK_COLORS.RIGHT : RUBIK_COLORS.NONE, // Right (+X)
      leftRight === 0 ? RUBIK_COLORS.LEFT : RUBIK_COLORS.NONE, // Left (-X)
      downUp === max ? RUBIK_COLORS.UP : RUBIK_COLORS.NONE, // Up (+Y)
      downUp === 0 ? RUBIK_COLORS.DOWN : RUBIK_COLORS.NONE, // Down (-Y)
      backFront === max ? RUBIK_COLORS.FRONT : RUBIK_COLORS.NONE, // Front (+Z)
      backFront === 0 ? RUBIK_COLORS.BACK : RUBIK_COLORS.NONE, // Back (-Z)
    ];

    return faces.map(
      color =>
        new THREE.MeshStandardMaterial({
          color,
        })
    );
  }

  /**
   * Create all cubies and add more to the group
   */
  _createCubies() {
    const offset = (this.size - 1) / 2;
    const spacing = this.cubieSize + this.gap;

    for (let leftRight = 0; leftRight < this.size; leftRight++) {
      for (let downUp = 0; downUp < this.size; downUp++) {
        for (let backFront = 0; backFront < this.size; backFront++) {

          // Position render (ThreeJS with XYZ)
          const position = {
            x: (leftRight - offset) * spacing,
            y: (downUp - offset) * spacing,
            z: (backFront - offset) * spacing,
          };

          const materials = this._createCubieMaterials(
            leftRight,
            downUp,
            backFront
          );

          const cubie = new Cube({
            size: this.cubieSize,
            position,
            materials,
          });

          // Index logic Rubik
          cubie.index = {
            leftRight,
            downUp,
            backFront,
          };

          this.cubies.push(cubie);
          this.group.add(cubie.object3D);
        }
      }
    }
  }

  /**
   * Dispose all geometry & material
   */
  dispose() {
    this.group.children.forEach(child => {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    });

    this.group.clear();
    this.cubies = [];
  }

  /**
   * Rebuild cube with new option
   */
  rebuild({ size, cubieSize, gap }) {
    if (size !== undefined) this.size = size;
    if (cubieSize !== undefined) this.cubieSize = cubieSize;
    if (gap !== undefined) this.gap = gap;

    this.dispose();
    this._createCubies();
  }

  get object3D() {
    return this.group;
  }
}
