import React, { useEffect, useRef, useState } from 'react';
import { LOCATIONS, LOCATION_COLORS } from '../data/locations.js';
import { WORLD } from '../game/maps/campusLayout.js';
import { eventBus } from '../utils/eventBus.js';
import { Maximize2, Minimize2, Navigation } from './Icons.jsx';

const COMPACT_SIZE = 170;
const EXPANDED_SIZE = 360;

export default function Minimap() {
  const canvasRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [player, setPlayer] = useState({ x: 640, y: 1210 });
  const [destinationId, setDestinationId] = useState(null);

  const size = expanded ? EXPANDED_SIZE : COMPACT_SIZE;

  useEffect(() => {
    const offMove = eventBus.on('player:moved', (e) => {
      setPlayer({ x: e.detail.x, y: e.detail.y });
    });
    const offNav = eventBus.on('navigate:result', (e) => {
      setDestinationId(e.detail.found ? e.detail.destinationId : null);
    });
    const offArr = eventBus.on('navigate:arrived', () => {
      setDestinationId(null);
    });

    return () => {
      offMove();
      offNav();
      offArr();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scaleX = size / WORLD.width;
    const scaleY = size / WORLD.height;

    // Background terrain
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#1e3a24';
    ctx.fillRect(0, 0, size, size);

    // Roads
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 1140 * scaleY, size, 64 * scaleY);
    ctx.fillRect(600 * scaleX, 120 * scaleY, 80 * scaleX, 1120 * scaleY);
    ctx.fillRect(0, 810 * scaleY, size, 56 * scaleY);
    ctx.fillRect(0, 560 * scaleY, size, 56 * scaleY);

    // Buildings
    LOCATIONS.forEach((loc) => {
      const hex = LOCATION_COLORS[loc.type] || 0x64748b;
      ctx.fillStyle = `#${hex.toString(16).padStart(6, '0')}`;
      const w = Math.max(4, loc.width * scaleX);
      const h = Math.max(4, loc.height * scaleY);
      const x = loc.x * scaleX - w / 2;
      const y = loc.y * scaleY - h / 2;

      ctx.fillRect(x, y, w, h);

      if (loc.id === destinationId) {
        // Destination pulsing gold highlight
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
      }
    });

    // Player position dot
    ctx.beginPath();
    ctx.arc(player.x * scaleX, player.y * scaleY, expanded ? 5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Pulse ring around player
    ctx.beginPath();
    ctx.arc(player.x * scaleX, player.y * scaleY, expanded ? 9 : 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [player, destinationId, size, expanded]);

  const handleBuildingClick = (loc) => {
    eventBus.emit('location:focus', { locationId: loc.id });
    eventBus.emit('navigate:request', { destinationId: loc.id });
  };

  return (
    <div
      className={`pointer-events-auto absolute z-30 transition-all duration-300 ${
        expanded
          ? 'bottom-20 right-6 md:bottom-24 md:right-8'
          : 'bottom-20 left-6 sm:bottom-6 sm:left-6'
      }`}
    >
      <div className="glass-panel overflow-hidden rounded-3xl p-2.5 shadow-glass">
        <div className="mb-2 flex items-center justify-between px-2 pt-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-parchment/60">
            <Navigation size={12} className="text-gold-400" /> Campus Minimap
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? 'Minimize' : 'Expand View'}
            className="rounded-lg p-1 text-parchment/50 hover:bg-white/5 hover:text-gold-400"
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-navy-950">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: size, height: size }}
          />

          {expanded && (
            <div className="absolute inset-0 pointer-events-none">
              {LOCATIONS.map((loc) => {
                const scaleX = size / WORLD.width;
                const scaleY = size / WORLD.height;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleBuildingClick(loc)}
                    title={`Click to Navigate to ${loc.name}`}
                    style={{
                      left: `${loc.x * scaleX}px`,
                      top: `${loc.y * scaleY}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="pointer-events-auto absolute flex h-4 w-4 items-center justify-center rounded-full bg-navy-950/80 border border-gold-400/60 text-[9px] text-gold-300 shadow hover:scale-125 transition-transform"
                  >
                    •
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {expanded && (
          <div className="mt-2.5 px-2 text-[11px] text-parchment/60">
            Click any pin on the map to calculate an A* route.
          </div>
        )}
      </div>
    </div>
  );
}
