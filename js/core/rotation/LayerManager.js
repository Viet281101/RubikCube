import * as THREE from 'three';
import { AXES, AXIS_TO_INDEX_KEY } from '../../constants/index.js';

/**
 * Helper class for managing rotation groups and layers
 */
export default class LayerManager {
  constructor(scene, rubik) {
    this.scene = scene;
    this.rubik = rubik;
  }

  /**
   * Check if cubie is in specific layer
   */
  _isInLayer(cubie, axis, layer) {
    const indexKey = AXIS_TO_INDEX_KEY[axis];
    return cubie.index[indexKey] === layer;
  }

  /**
   * Get all cubies in a specific layer
   */
  getCubiesInLayer(axis, layer) {
    return this.rubik.cubies.filter((c) => this._isInLayer(c, axis, layer));
  }

  /**
   * Create a rotation group for a specific layer
   */
  createRotationGroup(axis, layer) {
    const group = new THREE.Group();

    this.rubik.cubies.forEach((cubie) => {
      if (this._isInLayer(cubie, axis, layer)) {
        group.add(cubie.object3D);
      }
    });

    this.scene.add(group);
    return group;
  }

  /**
   * Finish rotation and return cubies to scene
   */
  finishRotationGroup(group) {
    const rotatedCubies = [];

    while (group.children.length) {
      const child = group.children[0];

      const cubie = this.rubik.cubies.find((c) => c.object3D === child);
      if (cubie) rotatedCubies.push(cubie);

      child.applyMatrix4(group.matrix);
      this.scene.add(child);
    }

    this.scene.remove(group);
    return rotatedCubies;
  }

  /**
   * Update cubie indices after rotation
   */
  commitCubieIndex(cubies, rotateAxis, direction) {
    const rotationLogic = {
      [AXES.X]: (idx, dir) => {
        const { downUp, backFront } = idx;
        idx.downUp = dir > 0 ? 2 - backFront : backFront;
        idx.backFront = dir > 0 ? downUp : 2 - downUp;
      },
      [AXES.Y]: (idx, dir) => {
        const { leftRight, backFront } = idx;
        idx.leftRight = dir > 0 ? backFront : 2 - backFront;
        idx.backFront = dir > 0 ? 2 - leftRight : leftRight;
      },
      [AXES.Z]: (idx, dir) => {
        const { leftRight, downUp } = idx;
        idx.leftRight = dir > 0 ? 2 - downUp : downUp;
        idx.downUp = dir > 0 ? leftRight : 2 - leftRight;
      },
    };

    cubies.forEach((cubie) => {
      rotationLogic[rotateAxis]?.(cubie.index, direction);
    });
  }
}
