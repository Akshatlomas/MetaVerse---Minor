# IIIT Bhopal Metaverse — Complete Feature List

A detailed inventory of all functional and technical features implemented in the **IIIT Bhopal Metaverse** project.

---

## 1. Landing Page & Digital Showcase
- **Futuristic Dark Glassmorphic Design**: Charcoal, navy, and amber accents with high contrast readability and subtle gradient backdrops.
- **Hero Section**:
  - Live campus metrics (12+ landmarks, A* pathfinding, 2.5D Phaser engine).
  - Prominent "Enter Virtual Campus" call-to-action button.
  - Interactive satellite imagery preview showing verified MANIT Bhopal transit campus layout.
- **Interactive Campus Atlas**:
  - Real-time category filtering (All, Academic, Admin, Research/Incubation, Hostels, Dining, Sports).
  - Landmark cards displaying exact coordinates, services count, and operating hours.
  - Interactive "View Details" modal showing full facilities checklists and quick-jump links.
- **Architecture & Tech Highlights**:
  - Breakdown of Phaser 3, React 18, Vite, Tailwind CSS, Express, and MongoDB.
- **How-to-Play Section**:
  - Visual keyboard layout (WASD, Shift, E, Esc, Click-to-Move, Touch).
- **Interactive AI Assistant Preview**:
  - Live clickable prompt chips demonstrating instant zero-cost query answering right on the landing page.
- **Student Profile Switcher**:
  - Working identity selector modal (Akshat Lomas, Priya Verma, Rohit Sharma, Guest Explorer).
  - Saved favorites viewer displaying bookmarked campus buildings.

---

## 2. Interactive Virtual Campus (Phaser 3 Game Engine)
- **Player Avatar Mechanics**:
  - 4-directional walking with physics velocity clamping.
  - Shift key sprint acceleration from 190 px/s to 320 px/s.
  - Arcade physics body with circular colliders preventing clipping through buildings or world boundaries.
  - Directional eye tracking facing the player's movement direction.
- **Camera Follow & Boundaries**:
  - Smooth lerped camera tracking (`startFollow` with 0.12 damping factor).
  - Bound to 1600 × 1400 px world limits.
  - Interactive mouse wheel zoom (0.6x to 1.8x).
- **Spawn & Respawn System**:
  - Spawns at the Main Campus Entrance Gate (x: 640, y: 1210).
  - One-click respawn button in HUD to quickly recover avatar location.
- **Building Footprints & Colliders**:
  - Drop shadows, distinct department colors, and yellow entrance markers.
  - Solid physical collision bodies for all academic blocks and hostels.
  - Passable open areas for the central courtyard and amphitheatre.

---

## 3. Location Interactions & Information Panels
- **Proximity Detection**:
  - Continuous distance checking (`INTERACTION_RADIUS = 80px`).
  - Floating dynamic `[E] View <Name>` prompt appearing above target buildings.
- **Interactive Facility Modal**:
  - Building title, category badge, and coordinate metadata.
  - Full institutional description.
  - Verified departmental services checklist (e.g., GPU clusters, IEEE digital terminals).
  - Operating hours (including 24/7 exam access where verified).
  - One-click "Navigate Here" action triggering immediate A* routing.
  - "Save to Favorites" toggle with persistent feedback.

---

## 4. Intelligent Search & A* Navigation
- **Multi-Field Real-Time Search**:
  - Live filtering by building name, category, keywords, description, or services.
  - Category filter pills directly inside the search bar.
  - Clicking any search result pans the camera and flashes the target location.
- **A* Pathfinding Algorithm**:
  - Grid-based navigation avoiding all solid building colliders.
  - Illuminated golden pathway rendered dynamically across roads and paths.
  - Destination waypoint marker (`📍`) pinned at the destination entrance.
  - Real-time calculation of distance in meters and walking time in minutes.
  - **Dynamic Recalculation**: Automatically detects when player wanders >120px off-route and re-plans the path.
  - Automatic arrival detection clearing the route when within 40px of goal.
  - Safe error handling: Notifies user if an impossible destination is targeted.

---

## 5. Campus Minimap & Player HUD
- **Canvas-Rendered Minimap**:
  - Tracks live player position with pulse animation.
  - Renders campus road network and color-coded building shapes.
  - Visualizes active destination with glowing border.
  - Expandable view (170px compact ➔ 360px expanded).
  - When expanded, building pins are interactive: click any pin to plot an A* route!
- **Heads-Up Display (HUD)**:
  - Current zone badge showing the building or plaza currently occupied.
  - Active sprint indicator with speed readout (320 px/s).
  - Day / Night mode toggle button.
  - Respawn button.
  - Controls & Help guide modal trigger button (`?`).
  - Bottom controls reminder bar.

---

## 6. NPCs & Campus Life
- **Autonomous NPC Behaviors**:
  - Distinct procedural character sprites:
    - Aryan Sharma (Senior Student Guide)
    - Dr. R.K. Sharma (Professor of CSE)
    - Dr. Ananya Verma (Head Librarian)
    - Coach Vikram (Sports Officer)
  - Waypoint patrol loops with randomized pauses (40 to 90 ticks) simulating natural student activity.
  - Interactive `[E] Talk to <Name>` interaction prompt.
  - Multi-turn conversational dialogues providing guidance on academic labs, libraries, coffee spots, and sports.

---

## 7. Dynamic Day / Night Simulation
- **Atmospheric Lighting**:
  - Smooth tweened dark blue overlay (`#0a1128`) transitioning between daylight and night mode.
  - Streetlight activation: Radial warm golden light glows illuminate campus avenues at night.
  - Toggleable at any moment via the top-right HUD sun/moon icon.

---

## 8. AI Campus Assistant
- **Dual-Engine Architecture**:
  - Default zero-cost local rule engine with NLP intent matching and keyword extraction.
  - Optional Anthropic / upstream LLM provider configurable via `.env`.
- **Structured Action Payloads**:
  - Assistant responses return executable map actions:
    - `navigate`: Plots golden A* path directly to destination.
    - `show_location`: Centers and highlights target building.
    - `search`: Pre-populates the search bar.
- **Robust Domain Knowledge**:
  - Answers study/library, food, hostel, labs/coding, sports, placements, incubation, and general college queries accurately.
  - Graceful fallback for unknown questions with helpful suggested queries.

---

## 9. Mobile & Tablet Touch Gameplay
- **On-Screen Virtual Gamepad (`TouchControls.jsx`)**:
  - Activates automatically on touch screens and small viewports.
  - 4-way virtual D-Pad for directional walking.
  - Dedicated virtual "Sprint" toggle button.
  - Dedicated virtual "Action [E]" button for building/NPC interaction.
- **Click-to-Move**:
  - Tapping any point on the terrain computes an A* route and walks the avatar automatically.

---

## 10. Backend API & Dual-Mode Persistence
- **Express.js REST Architecture**:
  - Endpoints for health, config, locations, categories, search, navigation, assistant, and favorites.
  - Centralized error handler and input validation.
  - Rate limiting on conversational endpoints.
- **Dual-Mode Persistence**:
  - **Demo Mode**: 100% operational with zero external services (MongoDB not required).
  - **Database Mode**: Connects to MongoDB with Mongoose schemas for persistent storage of users, locations, NPCs, chats, and navigation logs.
