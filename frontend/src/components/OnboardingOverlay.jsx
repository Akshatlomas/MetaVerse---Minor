import React, { useState, useEffect } from 'react';
import { eventBus } from '../utils/eventBus.js';
import { HelpCircle, X, Navigation, Compass, Flame, Shield, MapPin, Bot, Sun } from './Icons.jsx';

const STORAGE_KEY = 'iiit-bhopal-metaverse-onboarding-seen';

export default function OnboardingOverlay({ forceOpen = false, onClose }) {
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setVisible(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    const off = eventBus.on('onboarding:open', () => setVisible(true));
    return off;
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl glass-panel shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-navy-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
              <Compass size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">
                Quick Start & Controls Guide
              </span>
              <h2 className="font-display text-lg font-bold text-parchment">
                Welcome to IIIT Bhopal Metaverse
              </h2>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-2 text-parchment/50 hover:bg-white/10 hover:text-parchment transition"
            title="Close Guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          <p className="text-sm leading-relaxed text-parchment/80">
            Explore a playable virtual twin of <strong>Indian Institute of Information Technology Bhopal (IIIT Bhopal)</strong>.
            Walk through departments, computing labs, hostels, and sports grounds, find directions with A* pathfinding, and consult your AI campus guide!
          </p>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/5 bg-navy-900/60 p-3.5 flex items-start gap-3">
              <div className="flex flex-col gap-1 items-center shrink-0">
                <kbd className="rounded-lg bg-navy-800 px-2 py-1 font-mono text-xs text-gold-400 border border-white/10 shadow">W A S D</kbd>
                <span className="text-[10px] text-parchment/50">or Arrows</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-parchment">Avatar Movement</h4>
                <p className="text-[11px] text-parchment/60 mt-0.5">Walk in 4 directions around campus roads and pathways.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-navy-900/60 p-3.5 flex items-start gap-3">
              <div className="shrink-0">
                <kbd className="rounded-lg bg-navy-800 px-2.5 py-1 font-mono text-xs text-gold-400 border border-white/10 shadow">Shift</kbd>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-parchment">Sprint Mode</h4>
                <p className="text-[11px] text-parchment/60 mt-0.5">Hold Shift while walking to boost speed up to 320 px/s.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-navy-900/60 p-3.5 flex items-start gap-3">
              <div className="shrink-0">
                <kbd className="rounded-lg bg-navy-800 px-2.5 py-1 font-mono text-xs text-gold-400 border border-white/10 shadow">E</kbd>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-parchment">Interact & Talk</h4>
                <p className="text-[11px] text-parchment/60 mt-0.5">Press near buildings for facility info, or NPCs for student advice.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-navy-900/60 p-3.5 flex items-start gap-3">
              <div className="shrink-0">
                <kbd className="rounded-lg bg-navy-800 px-2.5 py-1 font-mono text-xs text-gold-400 border border-white/10 shadow">Click</kbd>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-parchment">Click-to-Move</h4>
                <p className="text-[11px] text-parchment/60 mt-0.5">Click anywhere on the terrain to auto-walk using A* pathfinding.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-navy-900/60 p-3.5 flex items-start gap-3">
              <div className="shrink-0">
                <kbd className="rounded-lg bg-navy-800 px-2.5 py-1 font-mono text-xs text-gold-400 border border-white/10 shadow">Esc</kbd>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-parchment">Menu & Audio Settings</h4>
                <p className="text-[11px] text-parchment/60 mt-0.5">Pause gameplay, adjust audio volume, or return to landing page.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-navy-900/60 p-3.5 flex items-start gap-3">
              <div className="shrink-0 text-amber-400">
                <Sun size={20} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-parchment">Day / Night Cycle</h4>
                <p className="text-[11px] text-parchment/60 mt-0.5">Toggle the top-right button to experience campus at night with streetlights.</p>
              </div>
            </div>
          </div>

          {/* Key Features Callout */}
          <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
              <Bot size={15} /> Key Student Features
            </h4>
            <ul className="mt-2 text-xs text-parchment/80 space-y-1 list-disc list-inside">
              <li><strong>Search Bar:</strong> Search any location at the top or filter by categories.</li>
              <li><strong>Interactive Minimap:</strong> Expand in the corner to see live player coordinates and click pins to navigate.</li>
              <li><strong>AI Assistant:</strong> Ask natural questions like <em>"Take me to the library"</em> or <em>"Where can I eat?"</em>.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 px-6 py-4 bg-navy-900/80 gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-parchment/60 hover:text-parchment">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-white/20 bg-navy-800 text-gold-500 focus:ring-0"
            />
            Don't show again automatically
          </label>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto rounded-full bg-gold-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-navy-950 shadow-glass transition hover:bg-gold-400"
          >
            Start Exploring Campus →
          </button>
        </div>
      </div>
    </div>
  );
}
