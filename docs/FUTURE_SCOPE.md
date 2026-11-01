# IIIT Bhopal Metaverse — Future Scope & Extension Roadmap

A structured engineering roadmap outlining scalable extensions, research directions, and subsequent semester enhancements for the **IIIT Bhopal Metaverse** platform.

---

## 1. Real-Time Multiplayer Presence (WebSockets / Socket.io)
- **Objective**: Allow hundreds of students and faculty members to simultaneously explore the campus and see each other's avatars in real-time.
- **Architecture**:
  - Deploy a lightweight WebSocket gateway using `Socket.io` or `ws` in Node.js.
  - Implement spatial partitioning (quadtrees or grid buckets) so that position updates are only broadcast to clients within the same campus viewport, keeping network bandwidth minimal ($O(k)$ instead of $O(n^2)$).
  - Add peer-to-peer text chat bubbles and student emote gestures.

---

## 2. Real-Time Campus Notices & Circulars Integration
- **Objective**: Display live academic notices, exam schedules, fee reminders, and placement alerts inside virtual campus noticeboards.
- **Implementation**:
  - Integrate an automated RSS / web-scraping worker fetching updates from the official `iiitbhopal.ac.in` portal.
  - Render an interactive digital kiosk outside the Administrative Building and CCF block where students can click and view the latest official circulars.

---

## 3. WebRTC Virtual Classrooms & Seminar Halls
- **Objective**: Allow student clubs, faculty members, and coding societies (e.g., IEEE Student Branch, GDSC IIIT Bhopal) to host virtual meetups inside the Central Courtyard or Auditorium.
- **Implementation**:
  - Embed WebRTC mesh audio/video streams (using Jitsi Meet or LiveKit).
  - Spatial audio: Student avatars hear audio louder as they approach the virtual speaker stage, replicating physical auditorium acoustics.

---

## 4. Voice-Driven AI Navigation (Web Speech API)
- **Objective**: Hands-free voice navigation for improved accessibility.
- **Implementation**:
  - Integrate browser-native `webkitSpeechRecognition` to transcribe student voice commands directly (e.g., *"Take me to the library"*).
  - Synthesize assistant voice replies using `window.speechSynthesis`.

---

## 5. Permanent Campus Transition & High-Definition 3D (WebGPU / Three.js)
- **Objective**: Transition from the current 2.5D transit campus representation to a 3D digital twin when IIIT Bhopal completes construction of its permanent campus.
- **Implementation**:
  - Model official architectural CAD blueprints into optimized GLTF/GLB models.
  - Implement level-of-detail (LOD) rendering and WebGPU pipeline shaders while maintaining the same centralized location datasets and API contracts developed in this project.

---

## 6. Mobile AR Companion (Augmented Reality Wayfinding)
- **Objective**: Assist students physically standing on campus by overlaying directional navigation arrows onto their smartphone camera feed.
- **Implementation**:
  - Build a progressive web app (PWA) using WebXR / AR.js.
  - Correlate GPS coordinates and device compass orientation with the Metaverse A* route waypoints.
