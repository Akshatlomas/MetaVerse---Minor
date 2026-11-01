import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameInstance } from '../hooks/useGameInstance.js';
import { eventBus } from '../utils/eventBus.js';
import { campusAudio } from '../services/campusAudio.js';
import HUD from '../components/HUD.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Minimap from '../components/Minimap.jsx';
import InteractionPanel from '../components/InteractionPanel.jsx';
import NavigationBar from '../components/NavigationBar.jsx';
import AIAssistant from '../components/AIAssistant.jsx';
import MenuOverlay from '../components/MenuOverlay.jsx';
import OnboardingOverlay from '../components/OnboardingOverlay.jsx';
import TouchControls from '../components/TouchControls.jsx';
import ClassroomModal from '../components/ClassroomModal.jsx';

const GAME_CONTAINER_ID = 'phaser-game';

export default function CampusPage() {
  useGameInstance(GAME_CONTAINER_ID);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const off = eventBus.on('scene:ready', () => {
      setReady(true);
      // Gentle start of outdoor campus audio ambience
      campusAudio.startAmbience();
    });

    const handleFirstInteraction = () => {
      campusAudio.startAmbience();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      off();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      campusAudio.stopAll();
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1b2a1f]">
      <div id={GAME_CONTAINER_ID} className="absolute inset-0" />

      {!ready && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-navy-950">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          <p className="text-sm text-parchment/60">Loading campus…</p>
        </div>
      )}

      <Link
        to="/"
        className="pointer-events-auto absolute bottom-6 left-6 z-30 rounded-full glass-panel px-4 py-2 text-xs font-medium text-parchment/70 shadow-glass hover:text-gold-400"
      >
        ← Exit
      </Link>

      <SearchBar />
      <HUD onOpenHelp={() => eventBus.emit('onboarding:open')} />
      <Minimap />
      <NavigationBar />
      <InteractionPanel />
      <AIAssistant />
      <MenuOverlay />
      <OnboardingOverlay />
      <TouchControls />
      <ClassroomModal />
    </div>
  );
}
