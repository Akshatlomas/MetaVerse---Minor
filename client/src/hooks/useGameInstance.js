import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config/gameConfig.js';

/**
 * Mounts a Phaser game into the given DOM id on mount and destroys it
 * cleanly on unmount (important for React StrictMode / route changes,
 * otherwise Phaser leaks canvases and duplicate input listeners).
 */
export function useGameInstance(parentId) {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return undefined;

    const config = createGameConfig(parentId);
    gameRef.current = new Phaser.Game(config);

    const handleResize = () => {
      gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  return gameRef;
}
