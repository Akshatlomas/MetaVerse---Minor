# IIIT Bhopal Metaverse — Demonstration & Presentation Guide

A step-by-step walkthrough for demonstrating the **IIIT Bhopal Metaverse** in college presentations, viva examinations, and project evaluations.

---

## 30-Second Elevator Pitch

> *"Good morning respected evaluators. Our project is the **IIIT Bhopal Metaverse** — a functional, interactive digital twin of the Indian Institute of Information Technology Bhopal. Built with React, Phaser 3, Node.js, and Express, it transforms campus exploration from static PDFs and web pages into a playable 2.5D virtual world. Students and visitors can control an avatar to walk the campus, search any department, calculate obstacle-avoiding walking routes using real-time A\* pathfinding, talk to campus NPCs, and interact with an AI assistant that triggers map navigation. The entire system is built with a dual-mode offline-first architecture that runs smoothly on any laptop with zero paid API dependencies."*

---

## 5-Minute Live Demo Script

### Step 1: The Landing Page (0:00 - 1:00)
1. Open `http://localhost:5173` in your browser.
2. **Highlight Branding & Design**: Show the modern dark theme with glassmorphism, glowing accents, and live metrics (12+ locations, A* pathfinding, 2.5D engine).
3. **Show Satellite Reference Comparison**:
   - Scroll to the *Authenticity & Modeling* section.
   - Point out the official MANIT transit campus satellite reference map alongside our virtual campus representation.
4. **Interactive Atlas & Filter Tabs**:
   - Click the "Academic" or "Hostels" filter pills.
   - Click "View Details" on the *Department of Computer Science & IT (CCF)* card to show the facilities checklist (AI/ML lab, GPU cluster, 24/7 access).
5. **Demonstrate AI Assistant Demo Preview**:
   - Click the chip `"Take me to the CCF computer labs"`.
   - Show how the backend zero-cost engine returns an actionable navigation response.
6. **Show Student Identity Switcher**:
   - Click the "Profile" button on the navbar.
   - Switch between demo students (e.g. *Akshat Lomas - 3rd Year CSE*).

---

### Step 2: Entering the Virtual Campus (1:00 - 2:00)
1. Click the golden **"Enter Virtual Campus →"** button.
2. **Onboarding Guide**:
   - The interactive Quick Start Guide pops up, showing the controls clearly.
   - Dismiss it with "Start Exploring Campus →".
   - Note to evaluators: *The guide can be reopened at any time by pressing `?` in the HUD or via the Pause Menu.*
3. **Avatar Movement**:
   - Walk using `W/A/S/D` or Arrow keys.
   - Hold `Shift` to sprint — point out the HUD badge updating to **"Sprinting (320 px/s)"**.
   - Walk against a building (e.g., Academic block) to demonstrate **solid collision detection** (no clipping through walls).
4. **Click-to-Move**:
   - Click anywhere on the ground — observe the player avatar walking automatically to that position.
5. **Camera Zoom**:
   - Scroll the mouse wheel to zoom in (up to 1.8x) and zoom out (down to 0.6x).

---

### Step 3: Search & A* Pathfinding Navigation (2:00 - 3:00)
1. **Search**:
   - Click the top search bar.
   - Type `"library"`. The dropdown live-filters to *Dr. APJ Abdul Kalam Central Library*.
   - Click the search result — notice the camera smoothly pans across campus and highlights the building.
2. **A\* Route Calculation**:
   - Click the building or click "Navigate Here".
   - An **illuminated golden pathway** is drawn connecting the player to the library entrance.
   - The route **avoids all intermediate building footprints**.
   - Point out the **NavigationBar** at the bottom: Shows exact distance (e.g., `834 m`) and estimated walk time (e.g., `~11 min walk`).
3. **Dynamic Route Recalculation**:
   - Deliberately walk in the opposite direction off the route.
   - Notice that the path dynamically recalculates to guide you from your new position!
4. **Arrival**:
   - Walk to the destination entrance — the route completes and clears automatically.

---

### Step 4: Building & NPC Interactions (3:00 - 4:00)
1. **Building Interaction**:
   - Approach the *Department of Computer Science & IT (CCF)*.
   - The floating prompt `[E] View Department of Computer Science & IT` appears.
   - Press `E` to open the full facility panel.
   - Click the heart icon to save it to Favorites.
2. **NPC Interaction**:
   - Walk to the student guide **Aryan Sharma** (orange hoodie) or **Dr. R.K. Sharma** (blue blazer).
   - The prompt `[E] Talk to Aryan Sharma (Student Guide)` appears.
   - Press `E` to engage in multi-turn conversation. Press `E` again to cycle through dialogue advice.

---

### Step 5: Day/Night Mode & AI Assistant (4:00 - 5:00)
1. **Day / Night Toggle**:
   - Click the Moon/Sun icon in the top-right HUD.
   - Watch the smooth atmospheric tween: the campus dims to a night sky and streetlights emit warm radial glow.
2. **AI Campus Assistant**:
   - Click the robot icon `🤖` in the bottom-right corner.
   - Type: *"Where is the cafeteria?"*
   - The assistant answers with operating hours and cuisine options, and triggers a map highlight.
   - Type: *"Take me to the hostel"*
   - The assistant plots the navigation route immediately.
3. **Mobile Responsive Touch Controls**:
   - Open Chrome DevTools (`Cmd + Option + I` or `F12`) and toggle device toolbar (iPhone/iPad).
   - Show the virtual 4-way D-Pad, Sprint toggle button, and Action [E] button.

---

## Comprehensive Manual Testing Checklist

| Test Item | Verification Procedure | Expected Outcome | Status |
|-----------|------------------------|------------------|--------|
| **1. Landing Page** | Open `http://localhost:5173` | Dark theme, Hero, features, atlas, satellite reference render smoothly | PASS |
| **2. Enter Campus** | Click "Enter Virtual Campus" | Route transitions to `/campus`, Phaser canvas mounts cleanly | PASS |
| **3. Player Movement** | Press `W`, `A`, `S`, `D` / Arrows | Avatar moves smoothly in 4 directions | PASS |
| **4. Sprint Mechanic** | Hold `Shift` while walking | Avatar accelerates to 320 px/s; HUD shows Sprinting badge | PASS |
| **5. Collisions** | Walk into any building wall | Avatar is stopped by physics collider; no wall penetration | PASS |
| **6. Building Interaction** | Approach building, press `E` | Floating prompt appears; modal opens with description and hours | PASS |
| **7. Campus Search** | Type query in top search bar | Live filtering updates; clicking result focuses camera | PASS |
| **8. A* Navigation** | Request directions to any building | Golden illuminated route renders avoiding buildings; distance/ETA display | PASS |
| **9. Minimap** | Walk around campus | Minimap dot tracks player; expand button opens full map | PASS |
| **10. NPC Interactions** | Approach NPC, press `E` | Dialogue bubble opens; cycling dialogue works | PASS |
| **11. Day/Night Toggle** | Click Sun/Moon icon in HUD | Atmospheric dark shader activates; streetlights emit radial glow | PASS |
| **12. AI Assistant** | Ask "where is the library" | Assistant answers correctly and triggers map focus | PASS |
| **13. Mobile Fallback** | Resize viewport < 1024px | On-screen virtual D-Pad and action buttons appear | PASS |
| **14. Backend API** | Run `npm test` in server | 16 automated test suites pass in < 500ms | PASS |
