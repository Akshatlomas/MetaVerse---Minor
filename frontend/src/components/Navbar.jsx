import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StudentProfileModal, { getActiveProfile } from './StudentProfileModal.jsx';
import { User } from './Icons.jsx';

const NAV_LINKS = [
  { label: 'Virtual Campus', href: '/campus' },
  { label: 'Explore Locations', href: '#explore' },
  { label: 'Features', href: '#features' },
  { label: 'How to Play', href: '#how-to-play' },
  { label: 'About Project', href: '#about' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(getActiveProfile);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mt-4 flex items-center justify-between rounded-2xl glass-panel px-5 py-3 shadow-glass border border-white/10">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 font-display text-sm font-bold text-navy-950 shadow-md">
                IB
              </div>
              <span className="font-display text-lg tracking-wide text-parchment">
                IIIT Bhopal <span className="text-gold-400">Metaverse</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-sm font-medium text-parchment/80 transition hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-parchment/80 transition hover:text-gold-400"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2 rounded-full border border-gold-500/40 bg-navy-800/60 px-4 py-2 text-xs font-semibold text-gold-400 transition hover:bg-gold-500 hover:text-navy-950"
                title="Switch student profile / view favorites"
              >
                <User size={14} />
                <span>{currentProfile ? currentProfile.name.split(' ')[0] : 'Profile'}</span>
              </button>

              <Link
                to="/campus"
                className="rounded-full bg-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy-950 shadow transition hover:bg-gold-400"
              >
                Play Now →
              </Link>
            </div>

            <button
              className="md:hidden text-parchment p-1"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? '✕' : '☰'}
            </button>
          </div>

          {open && (
            <div className="mt-2 flex flex-col gap-1 rounded-2xl glass-panel p-4 md:hidden border border-white/10">
              {NAV_LINKS.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-parchment/90 hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-parchment/90 hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-navy-800/80 px-4 py-2.5 text-xs font-semibold text-gold-400"
                >
                  <User size={14} /> Profile ({currentProfile.name})
                </button>
                <Link
                  to="/campus"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-gold-500 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-navy-950"
                >
                  Enter Virtual Campus →
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileChange={(p) => setCurrentProfile(p)}
      />
    </>
  );
}
