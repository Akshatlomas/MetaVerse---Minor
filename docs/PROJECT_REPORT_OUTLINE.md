# IIIT Bhopal Metaverse — Final College Project Report Outline

A complete, standard B.Tech Computer Science & Engineering capstone project report outline complying with Indian university and institute thesis guidelines.

---

## Preliminary Pages
1. **Title Page**:
   - Project Title: *Design and Implementation of an Interactive Virtual Campus and Pathfinding Navigation System for IIIT Bhopal (IIIT Bhopal Metaverse)*
   - Submitted in partial fulfillment of the requirements for the degree of Bachelor of Technology in Computer Science and Engineering.
   - Student Names, Roll Numbers, Supervisor Name, Department of CSE, Indian Institute of Information Technology Bhopal.
2. **Certificate of Approval**:
   - Signed endorsement by Project Guide, Head of Department (HOD), and External Examiner.
3. **Declaration by Students**:
   - Plagiarism and originality statement.
4. **Acknowledgements**:
   - Acknowledgement to Director, Dean of Academics, Project Supervisor, and Faculty of Computer Science & IT (CCF).
5. **Abstract**:
   - 250-word summary of problem statement, technological choices, A* pathfinding implementation, dual-mode backend, and demonstration results.
6. **Table of Contents, List of Figures, List of Tables, List of Abbreviations**.

---

## Chapter 1: Introduction
- **1.1 Background**: Emergence of digital twins and interactive web metaverses in higher education institutions.
- **1.2 Institutional Context**: Overview of IIIT Bhopal (established 2017, Institute of National Importance by MoE, Government of India), currently operating at its transit campus at MANIT Bhopal.
- **1.3 Problem Statement**: Limitations of static PDF maps, non-interactive directories, and the orientation difficulties experienced by new students and visitors.
- **1.4 Proposed Solution**: An interactive browser-based 2.5D metaverse with integrated A* pathfinding, multi-turn AI campus assistant, and real-time landmark interactions.
- **1.5 Project Objectives**:
  - Implement a 60 FPS playable canvas in Phaser 3.
  - Develop an admissible A* navigation system calculating meters and walking ETA.
  - Engineer a zero-cost, offline-first fallback NLP assistant.
  - Architect a decoupled React-Phaser EventBus bridge.
  - Deliver a dual-mode Express.js + MongoDB backend.
- **1.6 Report Organization**.

---

## Chapter 2: Literature Review & Theoretical Background
- **2.1 Evolution of Virtual Campus Systems**: Review of earlier 3D desktop applications (Second Life, VRML) vs modern WebGL/Canvas standards.
- **2.2 Comparative Analysis of Web Game Engines**:
  - Three.js vs Babylon.js vs Unity WebGL vs Phaser 3.
  - Analysis of bundle sizes, GPU memory consumption, and mobile compatibility.
- **2.3 Graph Theory & Search Algorithms in Spatial Navigation**:
  - Dijkstra vs Greedy Best-First Search vs A* (A-Star).
  - Admissibility of Manhattan vs Euclidean distance on 4-way discrete grids.
- **2.4 Conversational Agents & Rule-Based Intent Matching**:
  - Generative LLMs vs domain-specific intent classifiers.
  - Zero-cost graceful degradation patterns.

---

## Chapter 3: System Requirements & Feasibility Analysis
- **3.1 Functional Requirements**:
  - Avatar movement (WASD/arrows, sprint, colliders).
  - Landmark interaction and facility data presentation.
  - Keyword search with category filtering.
  - Real-time route drawing and dynamic off-route recalculation.
  - Day/night atmospheric lighting toggle.
  - NPC wandering patrols and contextual dialogues.
- **3.2 Non-Functional Requirements**:
  - Response time: API calls $< 50\text{ms}$, pathfinding $< 5\text{ms}$.
  - Framerate: Stable 60 FPS on standard student laptops.
  - Portability: Zero installation friction on macOS, Windows, and Linux.
  - Fault tolerance: Unbroken execution in Demo Mode if MongoDB is absent.
- **3.3 Hardware & Software Specifications**:
  - Client: Modern browser (Chrome, Firefox, Safari, Edge) supporting HTML5 Canvas.
  - Server: Node.js 18+, npm 9+.
  - Optional Database: MongoDB Community Server 6.0+.

---

## Chapter 4: System Architecture & Design
- **4.1 Architectural Pattern**: Decoupled Client-Server and Event-Driven Pub/Sub.
- **4.2 System Architecture Diagram**: Detailed block diagram connecting React UI, Phaser Canvas, EventBus, Express Router, LocationService, and Database.
- **4.3 Spatial Coordinate Model**:
  - World coordinate plane ($1600 \times 1400\text{ px}$).
  - Tile grid conversion equations ($1\text{ tile} = 32\text{px} \approx 1\text{ meter}$).
- **4.4 Data Model & UML Class Diagrams**:
  - `Location`, `User`, `NPC`, `ChatMessage`, `NavigationLog`.
- **4.5 Sequence Diagrams**:
  - Search and Camera Focus Sequence.
  - A* Navigation Route Request Sequence.
  - AI Assistant Intent Resolution Sequence.

---

## Chapter 5: Methodology & Implementation Details
- **5.1 Frontend Development**:
  - React 18, Vite bundling, and Tailwind CSS glassmorphic design.
  - Custom React Hooks (`useGameInstance`).
  - Mobile Virtual Gamepad (`TouchControls.jsx`).
- **5.2 Phaser 3 Game World**:
  - Procedural texture generation in `BootScene.js` (zero external asset copyright dependencies).
  - Player avatar physics, velocity clamping, and directional sprites.
  - NPC state machine with autonomous patrol waypoints and pause timers.
  - Atmospheric dark overlay shader and radial streetlight illumination.
- **5.3 A* Pathfinding Engine**:
  - Walkable grid rasterization ($50 \times 43$).
  - Manhattan heuristic and priority queue exploration.
  - Collinear waypoint pruning via vector cross products.
  - Dynamic off-route drift detection and re-routing.
- **5.4 Backend REST API & Services**:
  - Express.js router architecture.
  - Dual-mode `locationService.js` abstraction (MongoDB vs in-memory mock data).
  - Provider-independent AI service with zero-cost regex/keyword intent classification.
  - Input validation and rate-limiting middleware.

---

## Chapter 6: Testing & Quality Assurance
- **6.1 Automated Test Suite**:
  - Discussion of the 16 automated tests in `server/tests/api.test.js`.
  - Verification of health checks, location listings, search queries, A* routing, and input validation.
- **6.2 Manual Verification Checklist**:
  - Step-by-step test cases for movement, sprint, building colliders, interactions, and day/night toggles.
- **6.3 Performance Benchmarking**:
  - Framerate profiling (consistent 58–60 FPS).
  - Bundle size analysis (< 1.8MB minified).
  - API latency benchmarks (average response time $< 8\text{ms}$ locally).

---

## Chapter 7: Results & Discussion
- **7.1 Demonstration of Deliverables**:
  - Landing page screenshots and feature showcase.
  - Virtual campus gameplay, A* route visualization, and minimap tracking.
  - AI assistant conversational samples.
- **7.2 Comparison with Existing University Portals**:
  - Qualitative comparison of student engagement, speed of orientation, and usability.
- **7.3 Known Limitations & Academic Trade-offs**:
  - 2.5D top-down projection vs 3D.
  - Single-player vs multi-player presence.
  - Transit campus layout vs permanent campus in construction.

---

## Chapter 8: Conclusion & Future Scope
- **8.1 Summary of Work Done**:
  - Successfully built a complete, locally runnable metaverse for IIIT Bhopal.
  - Delivered 100% of functional requirements with zero non-functional dead ends.
- **8.2 Future Scope**:
  - WebSockets multiplayer presence.
  - WebRTC virtual classrooms and club seminars.
  - Official campus circulars scrapers.
  - Permanent campus 3D WebGPU expansion.

---

## References & Appendices
- **References**: IEEE, ACM, and web standards citations on A* search, digital twins, and web game architecture.
- **Appendix A**: Complete REST API Endpoints Specification.
- **Appendix B**: Seed Script Data Dictionary.
- **Appendix C**: Installation & Local Deployment Manual.
