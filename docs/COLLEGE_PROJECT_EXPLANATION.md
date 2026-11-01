# IIIT Bhopal Metaverse — College Project Explanation (3rd Year B.Tech CSE)

A concise, academically rigorous explanation of the project designed for third-year engineering students, project guides, and seminar presentations.

---

## 1. Project Title & Problem Statement

- **Project Title**: IIIT Bhopal Metaverse: An Interactive 2.5D Digital Twin and Campus Navigation System
- **Academic Stream**: Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)
- **Problem Statement**:
  Colleges and universities rely heavily on static PDFs, fragmented websites, or generic satellite maps to guide new students, visitors, and faculty. In institutions operating from transit facilities — such as **IIIT Bhopal** at MANIT Bhopal — locating specific computer labs (CCF), specialized GPU computing nodes, faculty cabins, examination cells, or reading halls is frustrating. Furthermore, conventional maps provide no interactive guidance, real-time walking ETA calculations, or intelligent conversational support.

---

## 2. Core Solution & Vision

The **IIIT Bhopal Metaverse** solves this by building an interactive, browser-based **digital twin** of the campus. Instead of reading a static document, users enter a playable 2.5D virtual world where they can:
1. Walk and sprint through the campus using a customized student avatar.
2. Search and discover verified departmental laboratories, administrative sections, and amenities.
3. Compute obstacle-avoiding paths using the **A\* pathfinding algorithm**, with real-world distance in meters and walking time estimates.
4. Interact with campus NPCs (professors, student guides, sports officers) for institutional advice.
5. Inquire about campus facilities using a **Zero-Cost AI Assistant** that translates natural language into direct visual map operations.
6. Experience the campus across day and night with simulated atmospheric lighting.

---

## 3. Computer Science Fundamentals Applied

This project applies core subjects from the 3rd-year B.Tech CSE curriculum:

### 3.1 Design & Analysis of Algorithms (DAA) — A* Pathfinding
- **Algorithm**: A* (A-Star) search over a 2D discrete grid network ($50 \times 43$ cells).
- **Evaluation Function**: $f(n) = g(n) + h(n)$
  - $g(n)$: Exact distance from start to current node.
  - $h(n)$: Admissible Manhattan distance heuristic $h(n) = |r_{\text{goal}} - r_n| + |c_{\text{goal}} - c_n|$.
- **Optimization**: Collinear path simplification reduces hundreds of cell points into clean waypoint segments using cross-product verification ($\Delta x_1 \Delta y_2 - \Delta y_1 \Delta x_2 = 0$).

### 3.2 Software Engineering & System Architecture — Event-Driven Decoupling
- **Challenge**: Integrating a continuous 60 FPS Canvas game loop (Phaser 3) with a reactive virtual DOM (React 18).
- **Pattern**: Custom Pub/Sub EventBus (`utils/eventBus.js`) ensures strict separation of concerns. Neither layer directly mutates the other's state, preventing memory leaks, race conditions, and duplicate canvas mountings.

### 3.3 Web Technologies & Distributed Systems — RESTful API & Service Abstraction
- **Layering**: Controller-Service-Repository pattern in Express.js.
- **Graceful Degradation**: Dual-mode data repository (`locationService.js`) that automatically checks for database connectivity and falls back to structured in-memory datasets without failing HTTP requests.
- **Security & Protection**: Input validation, custom rate-limiting middleware, CORS policies, and centralized HTTP error handling.

### 3.4 Artificial Intelligence & Natural Language Processing — Intent Classification
- **Domain Pipeline**: Tokenization, case folding, regex pattern matching, and entity extraction over campus knowledge bases.
- **Action Payloads**: Structured JSON generation (`navigate`, `show_location`, `search`) that drives frontend canvas state.
- **Provider Abstraction**: Allows zero-cost local execution out of the box, with seamless plug-and-play support for external LLMs via environment variables.

### 3.5 Database Management Systems (DBMS) — Schema Design
- Normalized Mongoose schemas for `Location`, `User`, `NPC`, `ChatMessage`, and `NavigationLog`.
- Indexed lookup fields and separation of volatile session data from static geospatial layouts.

---

## 4. Why This is a Standout Third-Year B.Tech Project

1. **Working End-to-End System**: It is not a mockup, UI wireframe, or static 3D model. The source code builds, runs, tests, and serves locally with zero broken links or dummy buttons.
2. **Zero-Cost Deployment**: Designed so that any student or faculty member can clone the repository and run `npm run dev` on a standard laptop without credit cards, paid API keys, or Docker containers.
3. **Institutional Relevance**: Custom-built for **IIIT Bhopal**, incorporating real departments (CSE, IT, ECE), academic centers (CCF, IIEC, Central Library), and transit campus details.
4. **Comprehensive Test Suite**: Includes 16 automated tests covering API health, locations, search filtering, A* path calculations, assistant responses, input validation, and demo mode.
