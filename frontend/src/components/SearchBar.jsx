import React, { useState, useMemo } from 'react';
import { searchLocations, LOCATIONS, LOCATION_TYPES } from '../data/locations.js';
import { eventBus } from '../utils/eventBus.js';
import { Search, X, MapPin, Navigation, BookOpen } from './Icons.jsx';

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'accessible', label: '♿ Accessible' },
  { id: LOCATION_TYPES.CLASSROOM, label: 'Classrooms' },
  { id: LOCATION_TYPES.ACADEMIC, label: 'Academic' },
  { id: LOCATION_TYPES.HOSTEL, label: 'Hostels' },
  { id: LOCATION_TYPES.FOOD, label: 'Dining' },
  { id: LOCATION_TYPES.SPORTS, label: 'Sports' }
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredResults = useMemo(() => {
    let list = LOCATIONS;
    if (activeCategory === 'accessible') {
      list = list.filter((l) => l.accessibility?.wheelchairAccessible);
    } else if (activeCategory !== 'all') {
      list = list.filter((l) => l.type === activeCategory || (activeCategory === LOCATION_TYPES.CLASSROOM && l.classrooms?.length > 0));
    }

    if (query.trim()) {
      list = searchLocations(query);
      if (activeCategory === 'accessible') {
        list = list.filter((l) => l.accessibility?.wheelchairAccessible);
      } else if (activeCategory !== 'all') {
        list = list.filter((l) => l.type === activeCategory || (activeCategory === LOCATION_TYPES.CLASSROOM && l.classrooms?.length > 0));
      }
    }
    return list.slice(0, 6);
  }, [query, activeCategory]);

  const handleSelect = (loc) => {
    eventBus.emit('location:focus', { locationId: loc.id });
    setFocused(false);
  };

  const handleDirectNavigate = (e, loc) => {
    e.stopPropagation();
    eventBus.emit('location:focus', { locationId: loc.id });
    eventBus.emit('navigate:request', { destinationId: loc.id });
    setFocused(false);
  };

  return (
    <div className="pointer-events-auto absolute left-1/2 top-6 z-30 w-[min(92vw,460px)] -translate-x-1/2">
      <div className="glass-panel rounded-3xl p-1.5 shadow-glass">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3 py-1.5">
          <Search size={18} className="text-gold-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search library, CCF labs, hostels, cafeteria…"
            className="w-full bg-transparent text-sm text-parchment placeholder:text-parchment/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-parchment/40 hover:text-parchment"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-white/5 px-2 pt-1.5 pb-0.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setFocused(true);
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                activeCategory === tab.id
                  ? 'bg-gold-500 text-navy-950 font-semibold'
                  : 'text-parchment/60 hover:bg-white/5 hover:text-parchment'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown Results */}
      {focused && (
        <div className="glass-panel mt-2 max-h-72 overflow-y-auto rounded-3xl p-2 shadow-glass">
          {filteredResults.length === 0 ? (
            <div className="px-4 py-3 text-center text-xs text-parchment/50">
              No campus locations matched "{query}". Try "library", "hostel", or "canteen".
            </div>
          ) : (
            filteredResults.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className="group flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2 transition hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy-800 text-gold-400 border border-white/5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-parchment group-hover:text-gold-300">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-parchment/50">
                      {loc.categoryName || loc.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {loc.classrooms && loc.classrooms.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eventBus.emit('classroom:open', { location: loc, classroomIndex: 0 });
                        setFocused(false);
                      }}
                      title="Enter Virtual Classrooms"
                      className="rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500 hover:text-navy-950 flex items-center gap-1 transition"
                    >
                      <BookOpen size={12} /> Classrooms
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDirectNavigate(e, loc)}
                    title="Plot A* Route"
                    className="rounded-xl border border-white/10 bg-navy-800/80 px-2.5 py-1 text-[11px] font-medium text-gold-400 opacity-80 hover:opacity-100 hover:border-gold-400 flex items-center gap-1"
                  >
                    <Navigation size={12} /> Directions
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
