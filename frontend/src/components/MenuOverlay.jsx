import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventBus } from '../utils/eventBus.js';

const SETTINGS_KEY = 'iiit-metaverse-settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { musicVolume: 60, sfxVolume: 80, graphicsQuality: 'high' };
  } catch {
    return { musicVolume: 60, sfxVolume: 80, graphicsQuality: 'high' };
  }
}

export default function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('menu');
  const [settings, setSettings] = useState(loadSettings);
  const navigate = useNavigate();

  useEffect(() => {
    const off = eventBus.on('menu:toggle', (e) => setOpen(e.detail.open));
    return off;
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  if (!open) return null;

  const close = () => setOpen(false);

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-glass">
        <div className="mb-4 flex gap-2">
          {['menu', 'settings', 'controls'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                tab === t ? 'bg-gold-500 text-navy-950' : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'menu' && (
          <div className="flex flex-col gap-2">
            <button onClick={close} className="rounded-xl bg-navy-800/70 px-4 py-3 text-left text-parchment hover:bg-navy-700/70">
              ▶ Resume
            </button>
            <button
              onClick={() => {
                close();
                eventBus.emit('location:focus', { locationId: 'main-academic-block' });
              }}
              className="rounded-xl bg-navy-800/70 px-4 py-3 text-left text-parchment hover:bg-navy-700/70"
            >
              🗺 View Map
            </button>
            <button onClick={() => setTab('settings')} className="rounded-xl bg-navy-800/70 px-4 py-3 text-left text-parchment hover:bg-navy-700/70">
              ⚙ Settings
            </button>
            <button onClick={() => setTab('controls')} className="rounded-xl bg-navy-800/70 px-4 py-3 text-left text-parchment hover:bg-navy-700/70">
              🎮 Controls
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl bg-red-500/10 px-4 py-3 text-left text-red-300 hover:bg-red-500/20"
            >
              ⏻ Exit Campus
            </button>
          </div>
        )}

        {tab === 'settings' && (
          <div className="flex flex-col gap-5">
            <label className="text-sm text-parchment/80">
              Music volume: {settings.musicVolume}%
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => setSettings((s) => ({ ...s, musicVolume: Number(e.target.value) }))}
                className="mt-1 w-full"
              />
            </label>
            <label className="text-sm text-parchment/80">
              SFX volume: {settings.sfxVolume}%
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sfxVolume}
                onChange={(e) => setSettings((s) => ({ ...s, sfxVolume: Number(e.target.value) }))}
                className="mt-1 w-full"
              />
            </label>
            <div>
              <span className="text-sm text-parchment/80">Graphics quality</span>
              <div className="mt-2 flex gap-2">
                {['low', 'medium', 'high'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSettings((s) => ({ ...s, graphicsQuality: q }))}
                    className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                      settings.graphicsQuality === q
                        ? 'bg-gold-500 text-navy-950'
                        : 'bg-navy-800/70 text-parchment/70'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={close} className="mt-2 rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-navy-950">
              Done
            </button>
          </div>
        )}

        {tab === 'controls' && (
          <div className="space-y-2 text-sm text-parchment/80">
            <div className="flex justify-between"><span>Move</span><kbd className="rounded bg-navy-800 px-2 py-0.5">WASD / Arrows</kbd></div>
            <div className="flex justify-between"><span>Sprint</span><kbd className="rounded bg-navy-800 px-2 py-0.5">Shift</kbd></div>
            <div className="flex justify-between"><span>Interact</span><kbd className="rounded bg-navy-800 px-2 py-0.5">E</kbd></div>
            <div className="flex justify-between"><span>Menu</span><kbd className="rounded bg-navy-800 px-2 py-0.5">Esc</kbd></div>
            <div className="flex justify-between"><span>Zoom</span><kbd className="rounded bg-navy-800 px-2 py-0.5">Scroll</kbd></div>
            <div className="flex justify-between"><span>Click-to-Move</span><kbd className="rounded bg-navy-800 px-2 py-0.5">Left Click</kbd></div>
            <button
              onClick={() => {
                close();
                eventBus.emit('onboarding:open');
              }}
              className="mt-3 w-full rounded-xl bg-navy-800/80 py-2 text-xs font-semibold text-gold-400 hover:bg-navy-700/80 border border-white/10"
            >
              📖 Open Full Interactive Onboarding Guide
            </button>
            <button onClick={close} className="mt-2 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-navy-950">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
