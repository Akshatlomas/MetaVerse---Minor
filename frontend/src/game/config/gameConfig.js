import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import CampusScene from '../scenes/CampusScene.js';

/**
 * Builds a fresh Phaser config bound to a parent DOM element.
 * Kept as a factory (not a singleton) so React can mount/unmount the
 * game cleanly on route changes without leaking old instances.
 */
export function createGameConfig(parentId) {
  return {
    type: Phaser.AUTO,
    parent: parentId,
    backgroundColor: '#1b2a1f',
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: false,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, CampusScene]
  };
}
