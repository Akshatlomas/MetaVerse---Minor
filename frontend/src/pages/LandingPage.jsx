import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import { LOCATIONS, LOCATION_TYPES } from '../data/locations.js';
import {
  Compass,
  MapPin,
  Bot,
  Navigation,
  Sun,
  Moon,
  Flame,
  Users,
  GraduationCap,
  Clock,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  X,
  Check
} from '../components/Icons.jsx';

const FEATURES_DATA = [
  {
    icon: '🕹️',
    badge: 'Phaser 3 Engine',
    title: '2.5D Playable Campus',
    description:
      'Walk through a responsive 1600×1400 virtual world with WASD/arrow keys, sprint mechanics (320 px/s), building colliders, and procedural textures.'
  },
  {
    icon: '🧭',
    badge: 'A* Algorithm',
    title: 'Intelligent Pathfinding',
    description:
      'Grid-based A* routing calculates real pathways avoiding obstacles, computing precise distances in meters and estimated walking times in minutes.'
  },
  {
    icon: '🤖',
    badge: 'NLP + Zero-Cost Fallback',
    title: 'AI Campus Guide',
    description:
      'Ask questions like "Where is the library?" or "Take me to CCF labs". Operates with high-accuracy local intent classification with zero external API cost.'
  },
  {
    icon: '🌓',
    badge: 'Atmospheric Shader',
    title: 'Day / Night Simulation',
    description:
      'Smooth tweened lighting transitions between daylight and night mode with illuminated streetlights and cozy campus ambiance.'
  },
  {
    icon: '👥',
    badge: 'Patrol Waypoints',
    title: 'NPCs & Campus Life',
    description:
      'Meet student guides, professors, and sports officers wandering their designated patrol paths with multi-turn informational dialogue.'
  },
  {
    icon: '⚡',
    badge: 'Dual Architecture',
    title: 'Full REST API & Demo Mode',
    description:
      'Runs out of the box in zero-dependency Demo Mode with bundled campus datasets, and seamlessly switches to MongoDB for persistent operations.'
  }
];

const AI_SAMPLE_QUERIES = [
  {
    q: 'Where is the library?',
    a: "Dr. APJ Abdul Kalam Central Library is highlighted on your map. It features air-conditioned reading halls, IEEE digital access terminals, and 15,000+ textbooks. Open 8:00 AM - 10:00 PM."
  },
  {
    q: 'Take me to the CCF computer labs',
    a: "Plotting A* navigation route to Department of Computer Science & IT (CCF). Follow the golden illuminated path to explore AI/GPU computing clusters!"
  },
  {
    q: 'Where can I eat on campus?',
    a: "Campus Cafeteria & Food Court is open 8:00 AM - 10:30 PM, serving hot meals, snacks, fresh fruit juices, and features a Nescafe kiosk."
  },
  {
    q: 'Tell me about IIIT Bhopal',
    a: "IIIT Bhopal is an Institute of National Importance established in 2017 by MoE, Government of India. It offers premier B.Tech programs in CSE, IT, and ECE."
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeLocationModal, setActiveLocationModal] = useState(null);
  const [aiDemoIndex, setAiDemoIndex] = useState(0);

  const filteredLocations = selectedCategory === 'all'
    ? LOCATIONS
    : selectedCategory === 'accessible'
    ? LOCATIONS.filter((l) => l.accessibility?.wheelchairAccessible)
    : selectedCategory === LOCATION_TYPES.CLASSROOM
    ? LOCATIONS.filter((l) => l.type === LOCATION_TYPES.CLASSROOM || l.classrooms?.length > 0)
    : LOCATIONS.filter((l) => l.type === selectedCategory);

  return (
    <div className="min-h-screen bg-navy-950 text-parchment selection:bg-gold-500 selection:text-navy-950">
      <Navbar />
      <Hero />

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: SATELLITE REFERENCE & ARCHITECTURE OVERVIEW       */}
      {/* ------------------------------------------------------------- */}
      <section className="border-t border-white/10 bg-navy-900/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Campus Authenticity & Modeling
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl text-parchment">
              From Satellite Coordinates to Virtual Twin
            </h2>
            <p className="mt-4 text-sm sm:text-base text-parchment/70 leading-relaxed">
              IIIT Bhopal was established in 2017 by MoE, Government of India as an Institute of National Importance. The institute currently operates from its transit campus at MANIT Bhopal.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Satellite Card */}
            <div className="rounded-3xl border border-white/10 bg-navy-950/80 p-5 shadow-2xl overflow-hidden group">
              <div className="relative overflow-hidden rounded-2xl h-64 bg-navy-900 border border-white/5">
                <img
                  src="/campus-reference.png"
                  alt="IIIT Bhopal Google Satellite Reference Map"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 rounded-full bg-navy-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-gold-400 border border-gold-500/30">
                  Satellite Ground Reference
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-base font-bold text-parchment">
                  Official Transit Layout
                </h3>
                <p className="mt-1 text-xs text-parchment/60 leading-relaxed">
                  Verified quadrangle layout at MANIT Bhopal featuring connected academic blocks, administrative offices, and central courtyards.
                </p>
              </div>
            </div>

            {/* Virtual Twin Card */}
            <div className="rounded-3xl border border-gold-500/30 bg-gold-500/5 p-5 shadow-2xl overflow-hidden group">
              <div className="relative overflow-hidden rounded-2xl h-64 bg-navy-900 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center mb-3">
                  <Compass size={32} />
                </div>
                <h4 className="font-display text-lg font-bold text-parchment">
                  Playable 2.5D Metaverse World
                </h4>
                <p className="mt-1 text-xs text-parchment/70 max-w-sm">
                  1600 × 1400 canvas rendered in Phaser 3 with 32px tile grids, discrete collision geometry, and A* pathfinding graph.
                </p>
                <button
                  onClick={() => navigate('/campus')}
                  className="mt-4 rounded-full bg-gold-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-navy-950 shadow hover:bg-gold-400 transition"
                >
                  Launch Virtual Twin →
                </button>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-base font-bold text-gold-400">
                  Interactive Exploration Model
                </h3>
                <p className="mt-1 text-xs text-parchment/60 leading-relaxed">
                  Every landmark is wired to a centralized location dataset shared across Phaser rendering, REST APIs, and the AI assistant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: EXPLORE CAMPUS LOCATIONS                          */}
      {/* ------------------------------------------------------------- */}
      <section id="explore" className="py-24 max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Interactive Campus Atlas
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-parchment">
              Explore Campus Facilities
            </h2>
            <p className="mt-2 text-sm text-parchment/70 max-w-xl">
              Click any landmark to preview its academic departments, student amenities, and operating hours.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-navy-900 border border-white/10">
            {[
              { id: 'all', label: `All (${LOCATIONS.length})` },
              { id: 'accessible', label: '♿ Accessible' },
              { id: LOCATION_TYPES.CLASSROOM, label: 'Smart Classrooms' },
              { id: LOCATION_TYPES.ACADEMIC, label: 'Academic' },
              { id: LOCATION_TYPES.ADMIN, label: 'Admin' },
              { id: LOCATION_TYPES.RESEARCH, label: 'Labs & IIEC' },
              { id: LOCATION_TYPES.HOSTEL, label: 'Hostels' },
              { id: LOCATION_TYPES.FOOD, label: 'Dining' },
              { id: LOCATION_TYPES.SPORTS, label: 'Sports' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === tab.id
                    ? 'bg-gold-500 text-navy-950 shadow'
                    : 'text-parchment/60 hover:text-parchment'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="rounded-3xl border border-white/10 bg-navy-900/60 p-6 flex flex-col justify-between transition hover:border-gold-500/40 hover:bg-navy-800/60 shadow-glass group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-navy-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-400 border border-white/5">
                    {loc.categoryName || loc.type}
                  </span>
                  <span className="text-[10px] font-mono text-parchment/40">
                    ({loc.x}, {loc.y})
                  </span>
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-parchment group-hover:text-gold-400 transition-colors">
                  {loc.name}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-parchment/70 line-clamp-2">
                  {loc.description}
                </p>

                {/* Services Tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {(loc.services || []).slice(0, 3).map((srv, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-parchment/60"
                    >
                      {srv}
                    </span>
                  ))}
                  {(loc.services || []).length > 3 && (
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-parchment/40">
                      +{loc.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] text-parchment/50">
                  <Clock size={12} />
                  <span className="truncate max-w-[140px]">{loc.hours}</span>
                </span>

                <button
                  onClick={() => setActiveLocationModal(loc)}
                  className="rounded-full border border-gold-500/30 px-3 py-1 text-xs font-semibold text-gold-400 hover:bg-gold-500 hover:text-navy-950 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: FEATURE SHOWCASE                                  */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="border-t border-white/10 bg-navy-900/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Technical Architecture
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-parchment">
              Built for Performance & Scale
            </h2>
            <p className="mt-3 text-sm sm:text-base text-parchment/70">
              Combines game development in Phaser 3 with modern full-stack web technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_DATA.map((feat) => (
              <div
                key={feat.title}
                className="rounded-3xl border border-white/10 bg-navy-950/70 p-6 flex flex-col justify-between transition hover:border-gold-500/30 shadow-glass"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{feat.icon}</span>
                    <span className="rounded-full bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold text-gold-400 border border-gold-500/20">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-parchment">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-parchment/70">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: HOW TO PLAY & CONTROLS GUIDE                      */}
      {/* ------------------------------------------------------------- */}
      <section id="how-to-play" className="py-24 max-w-6xl mx-auto px-6">
        <div className="rounded-3xl border border-white/10 bg-navy-900/60 p-8 sm:p-12 shadow-2xl">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Controls & Gameplay
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-parchment">
              How to Navigate the Virtual World
            </h2>
            <p className="mt-3 text-sm text-parchment/70">
              Intuitive controls designed for instant playability on any laptop, desktop, or mobile device.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-4 text-center">
              <div className="font-mono text-xs font-bold text-gold-400 bg-navy-800 py-1.5 rounded-lg border border-white/10">
                W A S D
              </div>
              <div className="mt-3 text-xs font-bold text-parchment">Move</div>
              <div className="text-[10px] text-parchment/50 mt-0.5">4-Way Walking</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-4 text-center">
              <div className="font-mono text-xs font-bold text-gold-400 bg-navy-800 py-1.5 rounded-lg border border-white/10">
                Shift
              </div>
              <div className="mt-3 text-xs font-bold text-parchment">Sprint</div>
              <div className="text-[10px] text-parchment/50 mt-0.5">Boost to 320 px/s</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-4 text-center">
              <div className="font-mono text-xs font-bold text-gold-400 bg-navy-800 py-1.5 rounded-lg border border-white/10">
                E Key
              </div>
              <div className="mt-3 text-xs font-bold text-parchment">Interact</div>
              <div className="text-[10px] text-parchment/50 mt-0.5">Buildings & NPCs</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-4 text-center">
              <div className="font-mono text-xs font-bold text-gold-400 bg-navy-800 py-1.5 rounded-lg border border-white/10">
                Mouse Click
              </div>
              <div className="mt-3 text-xs font-bold text-parchment">Click-to-Move</div>
              <div className="text-[10px] text-parchment/50 mt-0.5">Auto A* Pathing</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-4 text-center">
              <div className="font-mono text-xs font-bold text-gold-400 bg-navy-800 py-1.5 rounded-lg border border-white/10">
                Scroll
              </div>
              <div className="mt-3 text-xs font-bold text-parchment">Camera Zoom</div>
              <div className="text-[10px] text-parchment/50 mt-0.5">0.6x to 1.8x</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-4 text-center">
              <div className="font-mono text-xs font-bold text-gold-400 bg-navy-800 py-1.5 rounded-lg border border-white/10">
                Touch
              </div>
              <div className="mt-3 text-xs font-bold text-parchment">Mobile D-Pad</div>
              <div className="text-[10px] text-parchment/50 mt-0.5">On-screen Gamepad</div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/campus')}
              className="rounded-full bg-gold-500 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-navy-950 shadow-glass transition hover:bg-gold-400 hover:scale-105"
            >
              Start Exploring Now →
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: AI ASSISTANT DEMO PREVIEW                         */}
      {/* ------------------------------------------------------------- */}
      <section id="ai" className="border-t border-white/10 bg-navy-900/40 py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Conversational Campus Intelligence
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-parchment">
              Zero-Cost AI Campus Guide
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-parchment/75">
              The AI Assistant translates natural student questions into structured map operations. Ask where to study, how to reach labs, or dining options, and watch it highlight locations or plot paths.
            </p>

            {/* Simulated Query Chips */}
            <div className="mt-6 space-y-2">
              <div className="text-xs font-semibold text-parchment/60 uppercase tracking-wider">
                Click a sample query to test fallback response:
              </div>
              <div className="flex flex-wrap gap-2">
                {AI_SAMPLE_QUERIES.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiDemoIndex(idx)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition text-left ${
                      aiDemoIndex === idx
                        ? 'bg-gold-500 text-navy-950 font-bold shadow'
                        : 'bg-navy-900 text-parchment/70 hover:bg-navy-800 border border-white/5'
                    }`}
                  >
                    "{item.q}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-white/10 bg-navy-950 p-6 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-parchment">AI Assistant Live Test</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Zero-Cost Fallback Mode Active</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* User Message */}
                <div className="ml-auto max-w-[85%] rounded-2xl bg-gold-500 px-4 py-2.5 text-xs font-medium text-navy-950">
                  {AI_SAMPLE_QUERIES[aiDemoIndex].q}
                </div>

                {/* Assistant Reply */}
                <div className="max-w-[85%] rounded-2xl bg-navy-800/90 border border-white/5 p-3.5 text-xs leading-relaxed text-parchment/90">
                  {AI_SAMPLE_QUERIES[aiDemoIndex].a}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-parchment/50">
                <span>Returns actionable JSON maps payload</span>
                <span className="font-mono text-gold-400">200 OK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: ABOUT PROJECT & VIVA PREPARATION                  */}
      {/* ------------------------------------------------------------- */}
      <section id="about" className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Academic Context & Capstone
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-parchment">
              IIIT Bhopal B.Tech CSE Project
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-parchment/75">
              Developed as a 3rd-year B.Tech Computer Science & Engineering major project, this system models how digital twins and virtual environments enhance campus onboarding, campus navigation, and smart student services.
            </p>
            <div className="mt-6 space-y-3 text-xs text-parchment/70">
              <div className="flex items-center gap-2">
                <span className="text-gold-400 font-bold">Institute:</span>
                <span>Indian Institute of Information Technology Bhopal (MoE, Govt. of India)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gold-400 font-bold">Programs Supported:</span>
                <span>B.Tech in CSE, IT, and ECE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gold-400 font-bold">Campus Type:</span>
                <span>Transit Campus (MANIT Bhopal) · Permanent Campus in development</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Core Tech Stack
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-parchment">
              Modern Full-Stack Architecture
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                'React 18',
                'Vite',
                'Phaser 3 (Arcade Physics)',
                'Tailwind CSS',
                'Node.js',
                'Express.js REST API',
                'A* Grid Pathfinding',
                'MongoDB & Mongoose',
                'Zero-Cost AI Provider',
                'EventBus Decoupling'
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-navy-900 px-3.5 py-1.5 text-xs text-parchment/80"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-navy-900/50 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                <Shield size={14} /> Viva Defense Ready
              </h4>
              <p className="mt-2 text-xs text-parchment/70 leading-relaxed">
                Complete documentation, API specifications, automated tests, and viva examination question-and-answers are included in the <code className="text-gold-300">docs/</code> directory and project README.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 7: FOOTER                                            */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-white/10 bg-navy-950 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 font-display text-xs font-bold text-navy-950">
              IB
            </div>
            <div>
              <div className="font-display text-sm font-bold text-parchment">
                IIIT Bhopal Metaverse
              </div>
              <div className="text-[11px] text-parchment/50">
                Educational Capstone Project · Indian Institute of Information Technology Bhopal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-parchment/60">
            <a href="#explore" className="hover:text-gold-400 transition">Atlas</a>
            <a href="#features" className="hover:text-gold-400 transition">Features</a>
            <a href="#how-to-play" className="hover:text-gold-400 transition">Controls</a>
            <a href="#about" className="hover:text-gold-400 transition">About</a>
            <button
              onClick={() => navigate('/campus')}
              className="text-gold-400 font-bold hover:underline"
            >
              Enter Campus →
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-[11px] text-parchment/40">
          Disclaimer: This is a student capstone project. Layout coordinates are optimized for browser navigation. Not an official Government of India portal.
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* LOCATION DETAIL MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      {activeLocationModal && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl glass-panel shadow-2xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-navy-900/60">
              <div>
                <span className="rounded-full bg-navy-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-400 border border-white/5">
                  {activeLocationModal.categoryName || activeLocationModal.type}
                </span>
                <h3 className="mt-1 font-display text-base font-bold text-parchment">
                  {activeLocationModal.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveLocationModal(null)}
                className="rounded-full p-2 text-parchment/50 hover:bg-white/10 hover:text-parchment"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-parchment/80 leading-relaxed">
                {activeLocationModal.description}
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-parchment/60">
                  Available Facilities & Services
                </h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(activeLocationModal.services || []).map((srv, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-navy-900/50 p-2 text-xs text-parchment/80 border border-white/5"
                    >
                      <Check size={14} className="text-gold-400 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-navy-900/30 p-3 text-xs text-parchment/60">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> Operating Hours:
                </span>
                <span className="font-semibold text-parchment">{activeLocationModal.hours}</span>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4 bg-navy-900/60 flex items-center justify-between">
              <button
                onClick={() => setActiveLocationModal(null)}
                className="text-xs font-semibold text-parchment/60 hover:text-parchment"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveLocationModal(null);
                  navigate('/campus');
                }}
                className="rounded-full bg-gold-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-navy-950 shadow hover:bg-gold-400 transition"
              >
                Explore on Campus →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
