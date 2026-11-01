# IIIT Bhopal Metaverse — Known Limitations & Design Trade-offs

Honest documentation of current technical boundaries, architectural constraints, and intentional design trade-offs.

---

## 1. Campus Geography & Layout Representation
- **Transit vs Permanent Campus Context**:
  - IIIT Bhopal was established in 2017 as an Institute of National Importance by the Ministry of Education (MoE), Government of India. The institute currently operates from its transit campus located within the **MANIT Bhopal** campus while its permanent campus is under construction.
  - The Metaverse layout mirrors the verified academic departments (CSE, IT, ECE), computing facilities (CCF), library, administrative sections, and amenities. However, spatial distances and road widths on the 1600 × 1400 canvas have been optimized for fluid 2.5D browser gameplay rather than millimeter-accurate architectural surveying.

---

## 2. 2.5D Canvas vs Full 3D Rendering Engine
- **Why 2.5D (Phaser 3) was selected**:
  - College project demonstrations frequently occur on standard student laptops or college lab machines without dedicated discrete GPUs.
  - High-poly 3D WebGL scenes (e.g. heavy Three.js or Unreal Pixel Streaming) frequently suffer from long initial download times, thermal throttling, shader compilation stutter, and mobile browser crashes.
  - A stylized 2.5D top-down perspective using Phaser 3 Arcade Physics delivers guaranteed 60 FPS performance, instant sub-second bundle loading, reliable collision detection, and zero GPU memory crashes.

---

## 3. Asset Licensing & Procedural Texturing
- **Procedural Generation Trade-off**:
  - The project does not rely on third-party commercial asset packs that could cause licensing violations or broken asset URLs.
  - Textures for the terrain, roadways, buildings, avatar, and NPCs are generated procedurally at runtime inside `BootScene.js` using Phaser graphics primitives.
  - While lightweight and reliable, procedural shapes have a stylized geometric look compared to custom hand-drawn pixel art or photorealistic textures.

---

## 4. Single-Player vs Multi-Player Presence
- **Current Limitation**:
  - The current release is a single-player interactive campus environment with autonomous NPCs.
  - Other students walking the campus are not synchronized over WebSockets in real-time.
- **Mitigation & Future Work**:
  - The codebase is architected with a decoupled player entity (`Player.js`) and unique coordinate events (`player:moved`), making it straightforward to add a WebSocket or Socket.io server to broadcast avatar positions across clients.

---

## 5. Persistence Modes: Demo Mode vs MongoDB
- **Distinction**:
  - When running without a live MongoDB instance, the server operates in **Demo Mode**, maintaining saved locations in memory. Server restarts in Demo Mode reset saved locations to the default seed list.
  - To enable persistent user accounts and saved favorites across server restarts, MongoDB must be connected via `MONGODB_URI` in `server/.env`.
  - The system explicitly reports `"mode": "demo"` or `"mode": "database"` in all API responses so data persistence is never falsely claimed.

---

## 6. AI Assistant Scope
- **Rule-Based Fallback Scope**:
  - In default zero-cost mode, the assistant uses deterministic pattern matching and keyword extraction. While it answers all common campus navigation, facility, and administrative questions reliably, it does not hold open-ended philosophical conversations or answer queries outside the campus dataset.
  - Setting `AI_PROVIDER=anthropic` with a valid API key connects the assistant to a frontier LLM for generative responses while maintaining strict JSON action output for map navigation.
