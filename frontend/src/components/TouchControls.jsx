import React, { useState, useEffect } from 'react';
import { Flame } from './Icons.jsx';

export default function TouchControls() {
  const [isMobile, setIsMobile] = useState(false);
  const [sprintActive, setSprintActive] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmall = window.innerWidth <= 1024;
      setIsMobile(hasTouch || isSmall);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isMobile) return null;

  const dispatchKeyEvent = (type, key, code) => {
    window.dispatchEvent(
      new KeyboardEvent(type, {
        key,
        code,
        bubbles: true,
        cancelable: true
      })
    );
  };

  const handleDirDown = (key, code) => {
    dispatchKeyEvent('keydown', key, code);
  };

  const handleDirUp = (key, code) => {
    dispatchKeyEvent('keyup', key, code);
  };

  const toggleSprint = () => {
    const next = !sprintActive;
    setSprintActive(next);
    dispatchKeyEvent(next ? 'keydown' : 'keyup', 'Shift', 'ShiftLeft');
  };

  const handleInteract = () => {
    dispatchKeyEvent('keydown', 'e', 'KeyE');
    setTimeout(() => {
      dispatchKeyEvent('keyup', 'e', 'KeyE');
    }, 150);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex items-end justify-between px-6 sm:px-10">
      {/* 4-way D-Pad */}
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1.5 h-36 w-36 rounded-3xl bg-navy-950/70 p-2 backdrop-blur-md border border-white/10 shadow-glass">
        {/* Row 1 */}
        <div />
        <button
          onTouchStart={() => handleDirDown('w', 'KeyW')}
          onTouchEnd={() => handleDirUp('w', 'KeyW')}
          onMouseDown={() => handleDirDown('w', 'KeyW')}
          onMouseUp={() => handleDirUp('w', 'KeyW')}
          className="flex items-center justify-center rounded-xl bg-navy-800/90 text-parchment active:bg-gold-500 active:text-navy-950 font-bold text-lg select-none"
        >
          ▲
        </button>
        <div />

        {/* Row 2 */}
        <button
          onTouchStart={() => handleDirDown('a', 'KeyA')}
          onTouchEnd={() => handleDirUp('a', 'KeyA')}
          onMouseDown={() => handleDirDown('a', 'KeyA')}
          onMouseUp={() => handleDirUp('a', 'KeyA')}
          className="flex items-center justify-center rounded-xl bg-navy-800/90 text-parchment active:bg-gold-500 active:text-navy-950 font-bold text-lg select-none"
        >
          ◀
        </button>
        <div className="flex items-center justify-center text-[10px] uppercase font-bold text-parchment/40">
          Move
        </div>
        <button
          onTouchStart={() => handleDirDown('d', 'KeyD')}
          onTouchEnd={() => handleDirUp('d', 'KeyD')}
          onMouseDown={() => handleDirDown('d', 'KeyD')}
          onMouseUp={() => handleDirUp('d', 'KeyD')}
          className="flex items-center justify-center rounded-xl bg-navy-800/90 text-parchment active:bg-gold-500 active:text-navy-950 font-bold text-lg select-none"
        >
          ▶
        </button>

        {/* Row 3 */}
        <div />
        <button
          onTouchStart={() => handleDirDown('s', 'KeyS')}
          onTouchEnd={() => handleDirUp('s', 'KeyS')}
          onMouseDown={() => handleDirDown('s', 'KeyS')}
          onMouseUp={() => handleDirUp('s', 'KeyS')}
          className="flex items-center justify-center rounded-xl bg-navy-800/90 text-parchment active:bg-gold-500 active:text-navy-950 font-bold text-lg select-none"
        >
          ▼
        </button>
        <div />
      </div>

      {/* Action Buttons: Sprint and Interact */}
      <div className="pointer-events-auto flex flex-col gap-3">
        <button
          onClick={toggleSprint}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xs font-bold transition shadow-glass select-none ${
            sprintActive
              ? 'bg-amber-500 border-amber-400 text-navy-950 scale-105'
              : 'bg-navy-950/70 border-white/15 text-parchment/80 active:bg-navy-800'
          }`}
          title="Toggle Sprint"
        >
          <div className="flex flex-col items-center">
            <Flame size={18} className={sprintActive ? 'animate-bounce' : ''} />
            <span className="text-[9px] uppercase tracking-wider mt-0.5">Sprint</span>
          </div>
        </button>

        <button
          onClick={handleInteract}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 border border-gold-400 text-navy-950 font-bold shadow-glass active:scale-95 transition select-none"
          title="Interact with building or NPC (E)"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold font-mono">[ E ]</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold">Action</span>
          </div>
        </button>
      </div>
    </div>
  );
}
