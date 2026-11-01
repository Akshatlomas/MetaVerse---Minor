import React, { useEffect, useState } from 'react';
import { eventBus } from '../utils/eventBus.js';
import { api } from '../services/api.js';
import {
  X,
  Navigation,
  Clock,
  Heart,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Accessibility,
  BookOpen
} from './Icons.jsx';

export default function InteractionPanel() {
  const [location, setLocation] = useState(null);
  const [npc, setNpc] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favFeedback, setFavFeedback] = useState('');

  useEffect(() => {
    const offLoc = eventBus.on('location:interact', (e) => {
      setNpc(null);
      setLocation(e.detail.location);
      setIsFavorite(false);
      setFavFeedback('');
    });

    const offNpc = eventBus.on('npc:talk', (e) => {
      setLocation(null);
      setNpc(e.detail.npc);
    });

    return () => {
      offLoc();
      offNpc();
    };
  }, []);

  if (!location && !npc) return null;

  const close = () => {
    setLocation(null);
    setNpc(null);
  };

  const handleNavigate = () => {
    if (!location) return;
    eventBus.emit('navigate:request', { destinationId: location.id });
    close();
  };

  const handleToggleFavorite = async () => {
    if (!location) return;
    try {
      if (!isFavorite) {
        await api.addFavorite(location.id);
        setIsFavorite(true);
        setFavFeedback('Saved to Favorites!');
      } else {
        await api.removeFavorite(location.id);
        setIsFavorite(false);
        setFavFeedback('Removed from Favorites');
      }
      setTimeout(() => setFavFeedback(''), 2500);
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-navy-950/60 backdrop-blur-sm p-4 sm:p-6 md:items-center">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Location Information Card */}
        {location && (
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <span className="rounded-full bg-navy-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400 border border-white/5">
                    {location.categoryName || location.type}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-parchment">
                    {location.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={close}
                className="rounded-full p-1 text-parchment/40 hover:bg-white/5 hover:text-parchment"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-parchment/80">
              {location.description}
            </p>

            {/* Services / Labs / Facilities */}
            {location.services && location.services.length > 0 && (
              <div className="mt-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">
                  Facilities & Services
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {location.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-white/5 bg-navy-800/80 px-3 py-1 text-xs text-parchment/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Accessibility & Classroom Highlights */}
            {location.accessibility?.wheelchairAccessible && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 text-xs text-cyan-200">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Accessibility size={14} className="text-cyan-400" />
                  Wheelchair Accessible Campus Building
                </span>
                <span className="text-[10px] text-cyan-300/80 font-mono">Ramp + Wide Doors</span>
              </div>
            )}

            {/* Timings & Verification Badge */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs text-parchment/70">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-gold-400" />
                <span>{location.hours}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <Shield size={12} /> Verified IIIT Bhopal Facility
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
              {location.classrooms && location.classrooms.length > 0 && (
                <button
                  onClick={() => {
                    close();
                    eventBus.emit('classroom:open', { location, classroomIndex: 0 });
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-3 text-sm font-bold text-navy-950 transition hover:bg-cyan-400 shadow-md"
                >
                  <BookOpen size={16} /> Enter Classrooms ({location.classrooms.length})
                </button>
              )}

              <button
                onClick={handleNavigate}
                className={`w-full ${location.classrooms?.length ? 'sm:w-auto px-5' : 'sm:flex-1'} flex items-center justify-center gap-2 rounded-2xl bg-gold-500 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 shadow-md`}
              >
                <Navigation size={16} /> Get Directions
              </button>

              <button
                onClick={handleToggleFavorite}
                title="Save location to favorites"
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-xs font-medium transition ${
                  isFavorite
                    ? 'border-red-500/50 bg-red-500/20 text-red-300'
                    : 'border-white/10 bg-navy-800/80 text-parchment/70 hover:border-white/20 hover:text-parchment'
                }`}
              >
                <Heart size={16} className={isFavorite ? 'fill-red-400 text-red-400' : ''} />
                {favFeedback || (isFavorite ? 'Saved' : 'Favorite')}
              </button>
            </div>
          </div>
        )}

        {/* NPC Conversation Card */}
        {npc && (
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xl font-bold">
                  {npc.name[0]}
                </div>
                <div>
                  <span className="rounded-full bg-navy-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 border border-white/5">
                    {npc.role}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-parchment">
                    {npc.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={close}
                className="rounded-full p-1 text-parchment/40 hover:bg-white/5 hover:text-parchment"
              >
                <X size={20} />
              </button>
            </div>

            {/* Speech bubble */}
            <div className="mt-5 rounded-2xl border border-white/5 bg-navy-900/80 p-4 relative">
              <div className="absolute -top-2 left-6 h-3 w-3 rotate-45 border-l border-t border-white/5 bg-navy-900/80" />
              <p className="text-sm leading-relaxed text-parchment/90">
                "{npc.line}"
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={close}
                className="rounded-xl border border-white/10 bg-navy-800 px-4 py-2 text-xs font-medium text-parchment/70 hover:text-parchment"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
