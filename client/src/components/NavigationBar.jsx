import React, { useEffect, useState } from 'react';
import { getLocationById } from '../data/locations.js';
import { eventBus } from '../utils/eventBus.js';

export default function NavigationBar() {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    const off = eventBus.on('navigate:result', (e) => {
      setRoute(e.detail.found ? e.detail : null);
    });
    return off;
  }, []);

  if (!route) return null;

  const destination = getLocationById(route.destinationId);
  const minutes = Math.max(1, Math.round(route.etaSeconds / 60));

  return (
    <div className="pointer-events-auto absolute bottom-24 left-1/2 z-30 -translate-x-1/2">
      <div className="glass-panel flex items-center gap-4 rounded-2xl px-5 py-3 shadow-glass">
        <span className="text-xl">🧭</span>
        <div>
          <div className="font-display text-sm text-parchment">
            Route to {destination ? destination.name : 'destination'}
          </div>
          <div className="text-xs text-parchment/60">
            {route.distanceM} m · ~{minutes} min walk
          </div>
        </div>
        <button
          onClick={() => {
            setRoute(null);
            eventBus.emit('navigate:cancel');
          }}
          className="ml-2 rounded-full border border-white/10 px-2 py-1 text-xs text-parchment/60 hover:text-gold-400"
          title="Cancel navigation"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
