import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Navigation,
  Bot,
  MapPin,
  Flame,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users
} from './Icons.jsx';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-32 pb-20 bg-navy-950">
      {/* Ambient background glowing accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[128px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[128px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-gold-500/10 blur-[128px]" />

      {/* Futuristic grid mesh background */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="heroGridFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 80}
              y1="0"
              x2={i * 80}
              y2="800"
              stroke="url(#heroGridFade)"
              strokeWidth="0.75"
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 70}
              x2="1200"
              y2={i * 70}
              stroke="url(#heroGridFade)"
              strokeWidth="0.75"
            />
          ))}
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
        {/* Left Column: Headlines & Call to Action */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-400 backdrop-blur-md">
            <Sparkles size={14} className="text-gold-400" />
            <span>Interactive Virtual Digital Twin · IIIT Bhopal</span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] text-parchment sm:text-5xl md:text-6xl">
            Explore <span className="bg-gradient-to-r from-gold-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">IIIT Bhopal</span> in the Metaverse
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-parchment/75 sm:text-lg">
            A fully playable, browser-based virtual campus designed for the <strong>Indian Institute of Information Technology Bhopal</strong>. Control your avatar, navigate academic blocks and computing facilities with A* pathfinding, interact with campus NPCs, and get live guidance from an AI assistant.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/campus')}
              className="group flex items-center gap-2.5 rounded-full bg-gold-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-navy-950 shadow-glass transition hover:bg-gold-400 hover:scale-[1.02] active:scale-95"
            >
              <span>Enter Virtual Campus</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="#explore"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-navy-900/60 px-6 py-4 text-sm font-semibold text-parchment backdrop-blur-md transition hover:border-gold-400/50 hover:text-gold-400"
            >
              <Compass size={16} />
              <span>Explore Locations</span>
            </a>

            <a
              href="#how-to-play"
              className="flex items-center gap-2 rounded-full px-5 py-4 text-sm font-semibold text-parchment/70 transition hover:text-parchment"
            >
              <span>How to Play</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 max-w-lg">
            <div>
              <div className="font-display text-2xl font-bold text-parchment">14+</div>
              <div className="text-xs text-parchment/60 mt-0.5">Campus Landmarks</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-gold-400">A* + WebRTC</div>
              <div className="text-xs text-parchment/60 mt-0.5">Nav & Isolated Audio</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-emerald-400">LiveKit</div>
              <div className="text-xs text-parchment/60 mt-0.5">Virtual Classrooms</div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Interactive Campus Card & Reference Preview */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md rounded-3xl glass-panel p-6 shadow-2xl border border-white/10 backdrop-blur-xl">
            {/* Top Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Campus Engine Active
                </span>
              </div>
              <span className="text-[11px] font-mono text-parchment/50">1600 × 1400 px</span>
            </div>

            {/* Satellite Reference vs 2.5D Metaverse World */}
            <div className="mt-4 relative overflow-hidden rounded-2xl border border-white/10 bg-navy-900 group">
              <img
                src="/campus-reference.png"
                alt="IIIT Bhopal Campus Satellite Reference"
                className="w-full h-48 object-cover opacity-85 transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-parchment flex items-center gap-1.5">
                    <MapPin size={13} className="text-gold-400" />
                    MANIT Transit Campus Layout
                  </div>
                  <div className="text-[10px] text-parchment/60">
                    Indian Institute of Information Technology Bhopal
                  </div>
                </div>
                <button
                  onClick={() => navigate('/campus')}
                  className="rounded-xl bg-gold-500/90 px-3 py-1.5 text-[11px] font-bold text-navy-950 shadow hover:bg-gold-400"
                >
                  Enter →
                </button>
              </div>
            </div>

            {/* Interactive Feature Highlights */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-navy-900/50 p-2.5 border border-white/5 text-xs text-parchment/80">
                <span className="flex items-center gap-2">
                  <GraduationCap size={15} className="text-cyan-400" />
                  LiveKit Virtual Classrooms
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Audio Isolated</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-navy-900/50 p-2.5 border border-white/5 text-xs text-parchment/80">
                <span className="flex items-center gap-2">
                  <Navigation size={15} className="text-amber-400" />
                  Live A* Walking Route & ETA
                </span>
                <span className="font-mono text-[10px] text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">Active</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-navy-900/50 p-2.5 border border-white/5 text-xs text-parchment/80">
                <span className="flex items-center gap-2">
                  <Bot size={15} className="text-purple-400" />
                  AI Voice Campus Assistant
                </span>
                <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Speech + NLP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
