import React, { useEffect, useState } from 'react';
import { getLocationById } from '../data/locations.js';
import { eventBus } from '../utils/eventBus.js';
import { Sun, Moon, MapPin, RotateCcw, HelpCircle, Flame, BookOpen } from './Icons.jsx';

export default function HUD({ onOpenHelp }) {
  const [currentLocationId, setCurrentLocationId] = useState(null);
  const [isSprinting, setIsSprinting] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day');

  useEffect(() => {
    const offMove = eventBus.on('player:moved', (e) => {
      setCurrentLocationId(e.detail.locationId);
      setIsSprinting(Boolean(e.detail.isSprinting));
    });

    const offTime = eventBus.on('timeOfDay:changed', (e) => {
      setTimeOfDay(e.detail.timeOfDay);
    });

    return () => {
      offMove();
      offTime();
    };
  }, []);

  const currentLocation = currentLocationId ? getLocationById(currentLocationId) : null;

  return (
    <>
      {/* Top Left: Location Badge & Status */}
      <div className="pointer-events-none absolute left-6 top-6 z-30 flex flex-col gap-2">
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-2.5 shadow-glass">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400">
            <MapPin size={18} />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-parchment/50">
              Current Zone
            </div>
            <div className="font-display text-sm font-medium text-parchment">
              {currentLocation ? currentLocation.name : 'Central Campus Grounds'}
            </div>
          </div>
        </div>

        {/* Sprint indicator */}
        {isSprinting && (
          <div className="flex items-center gap-1.5 self-start rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[11px] font-medium text-amber-300">
            <Flame size={13} className="animate-pulse" /> Sprinting (320 px/s)
          </div>
        )}
      </div>

      {/* Top Right Controls: Quick Classrooms, Day/Night Toggle & Help */}
      <div className="pointer-events-auto absolute right-6 top-6 z-30 flex items-center gap-2">
        {/* Quick Enter Classrooms Button */}
        <button
          onClick={() => {
            const loc = getLocationById('lecture-hall-complex');
            eventBus.emit('classroom:open', { location: loc, classroomIndex: 0 });
          }}
          title="Enter Virtual Classrooms (LHC-101 / Aryabhata)"
          className="glass-panel flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500 hover:text-navy-950 transition shadow-glass"
        >
          <BookOpen size={16} />
          <span className="hidden sm:inline">Enter Classrooms</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </button>

        {/* Day / Night Toggle */}
        <button
          onClick={() => eventBus.emit('timeOfDay:toggle')}
          title={`Switch to ${timeOfDay === 'day' ? 'Night' : 'Day'} Mode`}
          className="glass-panel flex h-10 w-10 items-center justify-center rounded-2xl text-parchment transition hover:border-gold-500/40 hover:text-gold-400 shadow-glass"
        >
          {timeOfDay === 'day' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
        </button>

        {/* Respawn Button */}
        <button
          onClick={() => eventBus.emit('player:respawn')}
          title="Respawn at Main Entrance Gate"
          className="glass-panel flex h-10 w-10 items-center justify-center rounded-2xl text-parchment transition hover:border-gold-500/40 hover:text-gold-400 shadow-glass"
        >
          <RotateCcw size={17} />
        </button>

        {/* Help / Controls Guide */}
        <button
          onClick={onOpenHelp}
          title="View Controls & Gameplay Guide"
          className="glass-panel flex h-10 w-10 items-center justify-center rounded-2xl text-parchment transition hover:border-gold-500/40 hover:text-gold-400 shadow-glass"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {/* Bottom Center: Controls Bar */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 hidden sm:block">
        <div className="glass-panel flex items-center gap-4 rounded-full px-5 py-2 text-xs text-parchment/75 shadow-glass">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-navy-800/90 px-1.5 py-0.5 font-mono text-[11px] text-gold-400 border border-white/10">WASD</kbd> Move
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-navy-800/90 px-1.5 py-0.5 font-mono text-[11px] text-gold-400 border border-white/10">Shift</kbd> Sprint
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-navy-800/90 px-1.5 py-0.5 font-mono text-[11px] text-gold-400 border border-white/10">E</kbd> Interact
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-navy-800/90 px-1.5 py-0.5 font-mono text-[11px] text-gold-400 border border-white/10">Esc</kbd> Menu
          </span>
          <span className="text-white/20">•</span>
          <span className="text-parchment/50">Click ground to walk</span>
        </div>
      </div>
    </>
  );
}
