# IIIT Bhopal Metaverse — Viva Questions & Detailed Answers

A curated question-and-answer preparation guide for defending the **IIIT Bhopal Metaverse** project in viva examinations, practical lab assessments, and seminar presentations.

---

### Q1. What was the motivation behind choosing a 2.5D engine like Phaser 3 instead of a full 3D engine like Three.js, Unity WebGL, or Unreal?
**Answer:**
Three key engineering reasons guided this architectural choice:
1. **Device Accessibility & Performance**: College demonstrations and student access often occur on laptops with integrated Intel/Apple Silicon graphics. Full 3D scenes frequently encounter WebGL context crashes, high GPU temperatures, and long asset download times (50–100MB). Phaser 3 compiles to a lightweight bundle (< 1.8MB) that runs at a stable 60 FPS on any browser.
2. **Deterministic Collision Detection**: In 2.5D, collision detection against campus buildings uses simple 2D Axis-Aligned Bounding Boxes (AABB) and circular colliders via Arcade Physics ($O(1)$ collision checks per frame), eliminating mesh clipping bugs common in unfinished 3D prototypes.
3. **Focus on Functionality over Vanity**: Prioritizing 2.5D allowed us to build complete, working features — A* pathfinding, search, AI assistant integration, day/night transitions, and NPC patrols — rather than getting stuck with an incomplete, lagging 3D model.

---

### Q2. Explain the A* pathfinding algorithm used in this project. What is its time and space complexity?
**Answer:**
- **Algorithm Execution**:
  The campus is represented as a 2D discrete grid of $50 \times 43$ tiles (each tile $32\times 32\text{ px}$). Walkable paths (roads, grass, plazas) have value `1`, while solid buildings have value `0`.
  The evaluation function is:
  $$f(n) = g(n) + h(n)$$
  where $g(n)$ is the exact cost from the start cell to node $n$, and $h(n)$ is the admissible Manhattan distance heuristic:
  $$h(n) = |r_{\text{goal}} - r_n| + |c_{\text{goal}} - c_n|$$
  Since the avatar moves in 4 cardinal directions without diagonal wall-clipping, Manhattan distance is admissible (it never overestimates the true distance), ensuring optimal path discovery.
- **Complexity**:
  - **Time Complexity**: $O(b^d)$ in the worst case, but significantly reduced by the heuristic. On our $50 \times 43$ grid ($V \approx 2150$ cells), execution completes in **< 3 milliseconds**.
  - **Space Complexity**: $O(V)$ to store the `open` priority queue and `cameFrom` backpointer hash maps.
- **Collinear Optimization**: After extracting the path, we pass it through `simplifyPath()`, which uses cross products ($\Delta x_1 \Delta y_2 - \Delta y_1 \Delta x_2 = 0$) to eliminate redundant intermediate points, returning a clean segment array.

---

### Q3. How do you prevent the player avatar from walking through buildings or outside campus borders?
**Answer:**
1. **World Bounds**: `this.sprite.setCollideWorldBounds(true)` binds the player within the $1600 \times 1400$ world rectangle. Static boundary wall colliders ($24\text{px}$ thick) border the four perimeter edges.
2. **Building Colliders**: Buildings are registered into an Arcade Physics `staticGroup()` with immovable bodies. In `CampusScene.js`, we declare:
   ```javascript
   this.physics.add.collider(this.player.sprite, this.buildingGroup);
   ```
   During every physics step, Arcade Physics performs separation resolution, cancelling any velocity vector pushing into a solid collider.

---

### Q4. How do React and Phaser communicate without causing memory leaks or multiple game instances?
**Answer:**
We solved this using two design patterns:
1. **Custom React Hook (`useGameInstance`)**:
   ```javascript
   useEffect(() => {
     if (gameRef.current) return;
     gameRef.current = new Phaser.Game(config);
     return () => {
       gameRef.current?.destroy(true); // cleanly tears down WebGL/Canvas context
       gameRef.current = null;
     };
   }, [parentId]);
   ```
   This prevents React StrictMode or component re-renders from instantiating duplicate canvases.
2. **EventBus Decoupling**:
   Instead of passing React state or functions into Phaser objects, we use an event bus (`utils/eventBus.js`) based on standard DOM `CustomEvent` dispatching. Phaser listens for UI events (`location:focus`, `navigate:request`, `timeOfDay:toggle`), while React components listen for gameplay events (`player:moved`, `location:interact`, `npc:talk`).

---

### Q5. How does the AI Assistant operate without a paid OpenAI or Anthropic API key?
**Answer:**
The assistant uses a **Provider Abstraction Architecture** (`aiProvider.js`):
- By default, it runs `mockProvider.js` — a local, deterministic Natural Language Understanding (NLU) service.
- It tokenizes and normalizes incoming student queries, matching them against intent patterns (e.g. *where is*, *take me to*, *study/library*, *food/canteen*, *hostels*, *labs*).
- It queries the centralized campus location repository (`mockLocations.js`) and returns structured JSON responses containing both natural language explanations and executable frontend action payloads (`{"action": "navigate", "destination": "central-library"}`).
- If an administrator configures `AI_PROVIDER=anthropic` with an `ANTHROPIC_API_KEY` in `.env`, the service delegates to the external LLM, with an automatic fallback to `mockProvider.js` if the external call fails or times out.

---

### Q6. How does your backend handle database operations if MongoDB is not installed or running?
**Answer:**
We implemented a **Repository Abstraction Layer** in `server/services/locationService.js`:
- During startup, `server/config/db.js` attempts to connect to `MONGODB_URI`.
- If connection fails or `MONGODB_URI` is unset, `isDbConnected()` returns `false`.
- The server does not crash. `locationService.js` routes all location, search, and navigation queries to `mockLocations.js` in memory.
- For user favorites, the controller serves from an in-memory store in Demo Mode, returning `{ "mode": "demo" }` in the JSON response to maintain transparency.
- When MongoDB is active, operations are persisted through Mongoose schemas (`Location`, `User`, `NPC`, etc.).

---

### Q7. How is physical distance and walking time calibrated in your navigation system?
**Answer:**
- The world canvas is designed on a 32px grid scale:
  $$1 \text{ tile } (32\text{px}) \approx 1 \text{ real-world meter}$$
- Average human walking speed is calibrated at $1.3\text{ m/s}$ (approx. $4.7\text{ km/h}$).
- The distance calculation is:
  $$\text{distanceM} = \text{round}\left(\frac{\text{pathLengthPx}}{32}\right)$$
- The estimated walking time is:
  $$\text{etaSeconds} = \text{round}\left(\frac{\text{distanceM}}{1.3}\right)$$
- Walking time in minutes is formatted as $\max(1, \text{round}(\text{etaSeconds} / 60))$.

---

### Q8. How do the autonomous NPCs work?
**Answer:**
Each NPC is an instance of the `NPC` class (`client/src/game/entities/NPC.js`):
- Configured with an initial spawn position, unique procedural sprite, role badge, dialogue script, and a series of patrol waypoints.
- During the update loop, the NPC calculates the Euclidean distance to its active waypoint. When within $6\text{px}$, it pauses for a random interval ($40$ to $90$ frames) using a state machine timer, then advances to the next waypoint.
- The NPC is registered as an immovable physics collider with the player avatar. Approaching within $80\text{px}$ triggers a prompt, and pressing `E` cycles through educational dialogue lines.

---

### Q9. How is the Day/Night lighting transition implemented?
**Answer:**
In `CampusScene.js`:
- An atmospheric rectangle overlay covering the entire $1600 \times 1400$ world is placed at `Depth 25` with color `#0a1128` (midnight navy).
- During day mode, its alpha is `0`. When toggled to night mode, Phaser's tween manager animates the alpha to `0.7` over 1000ms with sinusoidal easing (`Sine.easeInOut`).
- Simultaneously, radial light glow textures placed at streetlight coordinates (`Depth 26`) are tweened from alpha `0` to `0.85`, illuminating the roads and walkways.

---

### Q10. What automated tests were implemented, and what do they verify?
**Answer:**
We built 16 automated tests in `server/tests/api.test.js` executed via Node's native test runner (`node --test`):
1. System health check and Demo Mode metadata.
2. World configuration and grid tile dimensions.
3. Campus location retrieval and property structure.
4. Category filtering query parameters (`?type=academic`).
5. Category enumeration endpoint.
6. Single location retrieval and 404 handling.
7. Multi-field search across names, descriptions, and keywords.
8. A* pathfinding route correctness from Main Gate to Central Library.
9. Navigation endpoint distance and ETA calculations.
10. Dynamic player coordinate pathfinding waypoints.
11. AI Assistant query handling in mock/fallback mode.
12. Favorites API CRUD operations in Demo Mode.
13. Input validation: rejection of missing navigation parameters with HTTP 400.
14. Invalid destination handling: returning HTTP 404 for unknown buildings.
15. Input validation: rejection of empty favorite payloads with HTTP 400.
16. Unmatched assistant query graceful fallback without exceptions.
