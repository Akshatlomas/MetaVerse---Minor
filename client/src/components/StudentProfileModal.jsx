import React, { useState, useEffect } from 'react';
import { X, User, Heart, MapPin, Check, GraduationCap } from './Icons.jsx';
import { api } from '../services/api.js';

const STORAGE_PROFILE_KEY = 'iiit-metaverse-student-profile';

export const DEMO_PROFILES = [
  {
    id: 'demo-student',
    name: 'Akshat Lomas',
    rollNo: '2022BCSE106',
    branch: 'Computer Science & Engineering',
    year: '3rd Year B.Tech',
    role: 'Student Developer'
  },
  {
    id: 'student-priya',
    name: 'Priya Verma',
    rollNo: '2022BITE042',
    branch: 'Information Technology',
    year: '3rd Year B.Tech',
    role: 'Student'
  },
  {
    id: 'student-rohit',
    name: 'Rohit Sharma',
    rollNo: '2023BECE018',
    branch: 'Electronics & Communication',
    year: '2nd Year B.Tech',
    role: 'Student'
  },
  {
    id: 'guest-visitor',
    name: 'Guest Explorer',
    rollNo: 'VISITOR-2026',
    branch: 'Prospective Student / Faculty',
    year: 'Campus Visitor',
    role: 'Guest'
  }
];

export function getActiveProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEMO_PROFILES[0];
  } catch {
    return DEMO_PROFILES[0];
  }
}

export default function StudentProfileModal({ isOpen, onClose, onProfileChange }) {
  const [profile, setProfile] = useState(getActiveProfile);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (isOpen) {
      setLoadingFavs(true);
      api.getFavorites()
        .then((res) => setFavorites(res.favorites || []))
        .catch(() => setFavorites([]))
        .finally(() => setLoadingFavs(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectProfile = (p) => {
    setProfile(p);
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(p));
    if (onProfileChange) onProfileChange(p);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl glass-panel shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-navy-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
              <User size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                Identity & Preferences
              </span>
              <h3 className="font-display text-base font-bold text-parchment">
                Student Profile
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-parchment/50 hover:bg-white/10 hover:text-parchment transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/10 px-6 pt-3 gap-2 bg-navy-950/40">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'profile'
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-parchment/50 hover:text-parchment'
            }`}
          >
            Select Profile
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'favorites'
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-parchment/50 hover:text-parchment'
            }`}
          >
            Saved Locations ({favorites.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              <p className="text-xs text-parchment/70 leading-relaxed">
                Choose a student profile for campus identification, saved navigation history, and role-based permissions in the IIIT Bhopal Metaverse:
              </p>

              <div className="space-y-2.5">
                {DEMO_PROFILES.map((p) => {
                  const isSelected = profile.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectProfile(p)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-center justify-between ${
                        isSelected
                          ? 'border-gold-500/60 bg-gold-500/10'
                          : 'border-white/5 bg-navy-900/40 hover:border-white/15 hover:bg-navy-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs ${
                            isSelected
                              ? 'bg-gold-500 text-navy-950'
                              : 'bg-navy-800 text-parchment/80'
                          }`}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-parchment">
                              {p.name}
                            </span>
                            {isSelected && (
                              <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[9px] font-bold text-gold-400 border border-gold-500/40">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-parchment/60">
                            {p.branch} · {p.year}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="text-gold-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-parchment/70 leading-relaxed">
                Locations marked as favorite during campus exploration:
              </p>
              {loadingFavs ? (
                <div className="py-8 text-center text-xs text-parchment/50">Loading saved locations…</div>
              ) : favorites.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-center text-xs text-parchment/50">
                  No saved locations yet. Press <strong>E</strong> near any building on campus and click the heart icon to save it!
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="rounded-xl border border-white/5 bg-navy-900/40 p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={16} className="text-gold-400" />
                        <div>
                          <h4 className="text-xs font-semibold text-parchment">{fav.name}</h4>
                          <span className="text-[10px] text-parchment/50">{fav.categoryName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-parchment/40">{fav.hours}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 bg-navy-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-gold-500 px-6 py-2 text-xs font-bold uppercase tracking-wider text-navy-950 transition hover:bg-gold-400"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
