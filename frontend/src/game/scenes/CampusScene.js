import Phaser from 'phaser';
import Player, { INTERACTION_RADIUS } from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import { WORLD, ROADS, GREEN_ZONES, STREETLIGHTS, TREES, PLAYER_SPAWN } from '../maps/campusLayout.js';
import { LOCATIONS, LOCATION_COLORS } from '../../data/locations.js';
import { findPath, pathLength, estimateWalkTimeSeconds, distancePxToMeters } from '../systems/pathfinding.js';
import { eventBus } from '../../utils/eventBus.js';

const NPC_DEFINITIONS = [
  {
    id: 'guide-aryan',
    name: 'Aryan Sharma',
    role: 'Student Guide',
    spriteKey: 'npc-aryan',
    x: 640,
    y: 1140,
    dialogue: [
      'Welcome to IIIT Bhopal! I am Aryan, a 3rd year CSE student.',
      'Walk north along the main boulevard to reach the Academic & CCF blocks.',
      'You can search any building using the top search bar, or ask the AI Assistant for directions!',
      'Check out the Nescafe near the food court for great coffee between lectures.'
    ],
    patrol: [
      { x: 640, y: 1140 },
      { x: 740, y: 1140 },
      { x: 740, y: 1080 },
      { x: 640, y: 1080 }
    ]
  },
  {
    id: 'prof-sharma',
    name: 'Dr. R.K. Sharma',
    role: 'Professor (CSE)',
    spriteKey: 'npc-sharma',
    x: 360,
    y: 640,
    dialogue: [
      'Welcome to the Department of Computer Science & IT (CCF)!',
      'Our labs are equipped with high-performance GPU nodes for Machine Learning and Systems research.',
      'Always focus on data structures, algorithms, and practical projects.'
    ],
    patrol: [
      { x: 360, y: 640 },
      { x: 420, y: 640 },
      { x: 420, y: 580 },
      { x: 360, y: 580 }
    ]
  },
  {
    id: 'lib-ananya',
    name: 'Dr. Ananya Verma',
    role: 'Head Librarian',
    spriteKey: 'npc-ananya',
    x: 1220,
    y: 640,
    dialogue: [
      'Welcome to Dr. APJ Abdul Kalam Central Library!',
      'We have air-conditioned reading halls, IEEE Xplore digital terminals, and 15,000+ textbooks.',
      'During exam weeks, the library reading room remains open 24/7.'
    ]
  },
  {
    id: 'coach-vikram',
    name: 'Coach Vikram',
    role: 'Sports Officer',
    spriteKey: 'npc-vikram',
    x: 340,
    y: 920,
    dialogue: [
      'Welcome to the IIIT Bhopal Sports Arena!',
      'We organize the annual inter-branch sports meet and practice sessions every evening.',
      'Physical fitness keeps your engineering mind sharp!'
    ]
  }
];

export default class CampusScene extends Phaser.Scene {
  constructor() {
    super('CampusScene');
    this.buildingRects = new Map();
    this.streetGlows = [];
    this.npcs = [];
    this.timeOfDay = 'day';
    this.currentDestinationId = null;
    this.currentRoute = null;
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);

    // 1. Terrain & Pathways
    this.drawGround();
    this.drawRoads();
    this.drawGreenZones();

    // 2. Buildings & Colliders
    this.buildingGroup = this.physics.add.staticGroup();
    this.drawBuildings();
    this.drawBoundaryWalls();

    // 3. Decorative Street Furniture
    this.drawStreetlights();
    this.drawTrees();
    this.drawCampusPlazaFountain();
    this.drawMainEntranceGate();
    this.drawSignposts();
    this.setupAtmosphericParticles();

    // 4. Player Avatar
    this.player = new Player(this, PLAYER_SPAWN.x, PLAYER_SPAWN.y);
    this.physics.add.collider(this.player.sprite, this.buildingGroup);
    this.physics.add.collider(this.player.sprite, this.boundaryGroup);

    // 5. NPCs
    this.spawnNpcs();
    this.npcs.forEach((npc) => this.physics.add.collider(this.player.sprite, npc.sprite));

    // 6. Camera Follow
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    // 7. Navigation Graphics Layer
    this.routeGraphics = this.add.graphics().setDepth(10);
    this.destinationMarker = null;

    // 8. Day/Night Atmospheric Overlay Layer
    this.nightOverlay = this.add
      .rectangle(0, 0, WORLD.width, WORLD.height, 0x0a1128, 0)
      .setOrigin(0, 0)
      .setDepth(25);

    // 9. Floating Interaction Banner (Clickable + High Visibility)
    this.interactionText = this.add
      .text(0, 0, '[E] Enter Classrooms', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#090d16',
        backgroundColor: '#38bdf8',
        padding: { x: 10, y: 6 }
      })
      .setDepth(35)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    this.interactionText.on('pointerdown', (pointer) => {
      if (pointer && pointer.rightButtonDown && pointer.rightButtonDown()) return;
      this.triggerCurrentInteraction();
    });

    // 10. Click-to-move input listener
    this.input.on('pointerdown', (pointer) => {
      // Only handle if click is on game canvas (not UI overlays)
      if (pointer.rightButtonDown()) return;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.handleClickToMove(worldPoint.x, worldPoint.y);
    });

    // 11. ESC for pause menu
    this.input.keyboard.on('keydown-ESC', () => {
      eventBus.emit('menu:toggle', { open: true });
    });

    this.setupZoomControls();
    this.setupEventBusListeners();

    eventBus.emit('scene:ready', { world: WORLD, locations: LOCATIONS });
  }

  drawGround() {
    this.add.tileSprite(0, 0, WORLD.width, WORLD.height, 'grass').setOrigin(0, 0).setDepth(0);
  }

  drawRoads() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x334155, 1);

    ROADS.forEach((r) => {
      g.fillRect(r.x, r.y, r.width, r.height);

      // Dashed lane stripes
      g.lineStyle(2, 0xf8fafc, 0.4);
      if (r.width > r.height) {
        // Horizontal road centerline
        const midY = r.y + r.height / 2;
        for (let x = r.x; x < r.x + r.width; x += 32) {
          g.lineBetween(x, midY, x + 16, midY);
        }
      } else {
        // Vertical road centerline
        const midX = r.x + r.width / 2;
        for (let y = r.y; y < r.y + r.height; y += 32) {
          g.lineBetween(midX, y, midX, y + 16);
        }
      }
    });
  }

  drawGreenZones() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x166534, 0.95);
    GREEN_ZONES.forEach((z) => {
      g.fillRoundedRect(z.x, z.y, z.width, z.height, 16);
      g.lineStyle(2, 0x22c55e, 0.5);
      g.strokeRoundedRect(z.x, z.y, z.width, z.height, 16);
    });
  }

  drawBuildings() {
    LOCATIONS.forEach((loc) => {
      if (loc.type === 'other') {
        // Open Courtyard Amphitheatre
        const court = this.add
          .rectangle(loc.x, loc.y, loc.width, loc.height, 0x15803d, 0.8)
          .setStrokeStyle(3, 0x86efac, 0.8)
          .setDepth(3);

        this.add
          .text(loc.x, loc.y, loc.name, {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: '600',
            color: '#f8fafc',
            align: 'center',
            wordWrap: { width: loc.width - 16 }
          })
          .setOrigin(0.5)
          .setDepth(4);

        this.buildingRects.set(loc.id, { rect: court, loc });
        return;
      }

      const color = LOCATION_COLORS[loc.type] ?? 0x475569;

      // Drop shadow for building
      this.add
        .rectangle(loc.x + 4, loc.y + 6, loc.width, loc.height, 0x000000, 0.3)
        .setDepth(2);

      // Main building footprint (Clickable)
      const rect = this.add
        .rectangle(loc.x, loc.y, loc.width, loc.height, color, 1)
        .setStrokeStyle(3, 0x0f172a, 0.9)
        .setDepth(3)
        .setInteractive({ useHandCursor: true });

      rect.on('pointerdown', (pointer) => {
        if (pointer && pointer.rightButtonDown && pointer.rightButtonDown()) return;
        if (loc.classrooms && loc.classrooms.length > 0) {
          eventBus.emit('classroom:open', { location: loc, classroomIndex: 0 });
        } else {
          eventBus.emit('location:interact', { location: loc });
        }
      });

      this.physics.add.existing(rect, true);
      this.buildingGroup.add(rect);

      // Entrance door accent
      const isClassroomHub = loc.classrooms && loc.classrooms.length > 0;
      const doorAccent = this.add
        .rectangle(loc.x, loc.y + loc.height / 2 - 4, isClassroomHub ? 44 : 32, 10, isClassroomHub ? 0x06b6d4 : 0xfde047, 1)
        .setStrokeStyle(1.5, 0x0f172a)
        .setDepth(4)
        .setInteractive({ useHandCursor: true });

      if (isClassroomHub) {
        // Glowing door mat / entrance threshold
        const doorMat = this.add
          .rectangle(loc.x, loc.y + loc.height / 2 + 5, 54, 10, 0x38bdf8, 0.5)
          .setDepth(2)
          .setInteractive({ useHandCursor: true });

        const doorText = this.add
          .text(loc.x, loc.y + loc.height / 2 - 16, '🚪 CLICK TO ENTER CLASSROOMS', {
            fontSize: '9px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            color: '#38bdf8',
            backgroundColor: '#0f172acc',
            padding: { x: 5, y: 2 }
          })
          .setOrigin(0.5)
          .setDepth(6)
          .setInteractive({ useHandCursor: true });

        const openClassroom = () => {
          eventBus.emit('classroom:open', { location: loc, classroomIndex: 0 });
        };

        doorAccent.on('pointerdown', openClassroom);
        doorMat.on('pointerdown', openClassroom);
        doorText.on('pointerdown', openClassroom);
      }

      // Accessible ramp indicator for wheelchair friendly buildings
      if (loc.accessibility?.wheelchairAccessible) {
        this.add
          .rectangle(loc.x + 24, loc.y + loc.height / 2 - 4, 12, 8, 0x06b6d4, 1)
          .setDepth(4);
        this.add
          .text(loc.x + 24, loc.y + loc.height / 2 - 14, '♿', {
            fontSize: '11px',
            color: '#38bdf8'
          })
          .setOrigin(0.5)
          .setDepth(6);
      }

      // Building Nameplate (Clickable)
      const label = this.add
        .text(loc.x, loc.y, loc.name, {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: '700',
          color: '#ffffff',
          backgroundColor: '#0f172aee',
          padding: { x: 6, y: 3 },
          align: 'center',
          wordWrap: { width: loc.width - 20 }
        })
        .setOrigin(0.5)
        .setDepth(5)
        .setInteractive({ useHandCursor: true });

      label.on('pointerdown', () => {
        if (loc.classrooms && loc.classrooms.length > 0) {
          eventBus.emit('classroom:open', { location: loc, classroomIndex: 0 });
        } else {
          eventBus.emit('location:interact', { location: loc });
        }
      });

      this.buildingRects.set(loc.id, { rect, label, loc });
    });
  }

  drawBoundaryWalls() {
    this.boundaryGroup = this.physics.add.staticGroup();
    const t = 24;
    const walls = [
      { x: WORLD.width / 2, y: t / 2, w: WORLD.width, h: t },
      { x: WORLD.width / 2, y: WORLD.height - t / 2, w: WORLD.width, h: t },
      { x: t / 2, y: WORLD.height / 2, w: t, h: WORLD.height },
      { x: WORLD.width - t / 2, y: WORLD.height / 2, w: t, h: WORLD.height }
    ];
    walls.forEach((w) => {
      const rect = this.add
        .rectangle(w.x, w.y, w.w, w.h, 0x1e293b, 1)
        .setStrokeStyle(2, 0x475569)
        .setDepth(4);
      this.physics.add.existing(rect, true);
      this.boundaryGroup.add(rect);
    });
  }

  drawStreetlights() {
    STREETLIGHTS.forEach(({ x, y }) => {
      this.add.image(x, y, 'streetlight').setOrigin(0.5, 0.9).setDepth(12);

      // Radial warm light glow (activated during night mode)
      const glow = this.add
        .image(x, y - 36, 'light-glow')
        .setOrigin(0.5, 0.5)
        .setDepth(26)
        .setAlpha(0);

      this.streetGlows.push(glow);
    });
  }

  drawTrees() {
    TREES.forEach(({ x, y }) => {
      this.add.image(x, y, 'tree').setOrigin(0.5, 0.85).setDepth(13);
    });
  }

  drawCampusPlazaFountain() {
    const fx = 800;
    const fy = 660;

    // Water fountain sprite
    const fountain = this.add.image(fx, fy, 'fountain').setOrigin(0.5).setDepth(8);

    // Collider with fountain base so player cannot walk through water
    const fountainBase = this.add.circle(fx, fy, 32, 0x000000, 0);
    this.physics.add.existing(fountainBase, true);
    this.buildingGroup.add(fountainBase);

    // Subtle pulsing water ripples animation
    this.tweens.add({
      targets: fountain,
      scale: { from: 0.98, to: 1.02 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawMainEntranceGate() {
    const gx = 640;
    const gy = 1270;

    // Left and Right Stone Pillars
    this.add.rectangle(gx - 70, gy, 18, 28, 0x1e293b, 1).setStrokeStyle(2, 0x0284c7).setDepth(6);
    this.add.rectangle(gx + 70, gy, 18, 28, 0x1e293b, 1).setStrokeStyle(2, 0x0284c7).setDepth(6);

    // Grand Entrance Overhead Banner
    this.add
      .rectangle(gx, gy - 20, 160, 20, 0x0f172a, 0.95)
      .setStrokeStyle(2, 0xf59e0b)
      .setDepth(7);

    this.add
      .text(gx, gy - 20, 'IIIT BHOPAL · MAIN ENTRANCE', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '9px',
        fontWeight: 'bold',
        color: '#fde047',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(8);
  }

  drawSignposts() {
    const signLocations = [
      { x: 640, y: 1080 },
      { x: 800, y: 840 },
      { x: 450, y: 720 },
      { x: 1150, y: 720 }
    ];

    signLocations.forEach(({ x, y }) => {
      this.add.image(x, y, 'signpost').setOrigin(0.5, 0.9).setDepth(11);
    });
  }

  setupAtmosphericParticles() {
    // Soft floating dust / leaf particle effect
    const particles = this.add.particles(0, 0, 'dust', {
      x: { min: 0, max: WORLD.width },
      y: { min: 0, max: WORLD.height },
      speedX: { min: -10, max: 20 },
      speedY: { min: 5, max: 25 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 5000,
      frequency: 250,
      quantity: 1
    });
    particles.setDepth(20);
  }

  spawnNpcs() {
    this.npcs = NPC_DEFINITIONS.map((def) => new NPC(this, def));
  }

  setupZoomControls() {
    this.input.on('wheel', (_pointer, _objs, _dx, dy) => {
      const zoom = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.001, 0.6, 1.8);
      this.cameras.main.setZoom(zoom);
    });
  }

  setupEventBusListeners() {
    this.unsubFocus = eventBus.on('location:focus', (e) => {
      const entry = this.buildingRects.get(e.detail.locationId);
      if (entry) {
        this.cameras.main.pan(entry.loc.x, entry.loc.y, 600, 'Sine.easeInOut');
        this.pulseHighlight(entry.loc.id);
      }
    });

    this.unsubNavigate = eventBus.on('navigate:request', (e) => {
      this.drawRouteTo(e.detail.destinationId);
    });

    this.unsubCancelNav = eventBus.on('navigate:cancel', () => {
      this.clearRoute();
    });

    this.unsubTime = eventBus.on('timeOfDay:toggle', () => {
      this.toggleDayNight();
    });

    this.unsubRespawn = eventBus.on('player:respawn', () => {
      this.player.respawn();
      this.cameras.main.pan(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 400);
    });
  }

  toggleDayNight() {
    const isNight = this.timeOfDay === 'day';
    this.timeOfDay = isNight ? 'night' : 'day';

    const targetAlpha = isNight ? 0.7 : 0;
    const glowAlpha = isNight ? 0.85 : 0;

    // Smooth lighting transition tween
    this.tweens.add({
      targets: this.nightOverlay,
      alpha: targetAlpha,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.streetGlows,
      alpha: glowAlpha,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });

    eventBus.emit('timeOfDay:changed', { timeOfDay: this.timeOfDay });
  }

  handleClickToMove(x, y) {
    const path = findPath(this.player.x, this.player.y, x, y);
    if (path && path.length > 0) {
      this.player.setPath(path);
    } else {
      this.player.setTarget(x, y);
    }
  }

  pulseHighlight(locationId) {
    const entry = this.buildingRects.get(locationId);
    if (!entry) return;
    this.tweens.add({
      targets: entry.rect,
      alpha: { from: 1, to: 0.35 },
      yoyo: true,
      repeat: 3,
      duration: 220
    });
  }

  drawRouteTo(destinationId) {
    this.currentDestinationId = destinationId;
    const entry = this.buildingRects.get(destinationId);
    this.routeGraphics.clear();
    if (this.destinationMarker) this.destinationMarker.destroy();

    if (!entry) {
      eventBus.emit('navigate:result', { destinationId, found: false });
      return;
    }

    const path = findPath(this.player.x, this.player.y, entry.loc.x, entry.loc.y);
    if (!path) {
      eventBus.emit('navigate:result', { destinationId, found: false });
      return;
    }

    this.currentRoute = path;

    // Golden glowing route
    this.routeGraphics.lineStyle(5, 0xf59e0b, 0.95);
    this.routeGraphics.beginPath();
    this.routeGraphics.moveTo(path[0].x, path[0].y);
    path.slice(1).forEach((p) => this.routeGraphics.lineTo(p.x, p.y));
    this.routeGraphics.strokePath();

    // Floating waypoint pin on destination
    this.destinationMarker = this.add
      .text(entry.loc.x, entry.loc.y - entry.loc.height / 2 - 24, '📍', { fontSize: '28px' })
      .setOrigin(0.5)
      .setDepth(20);

    const distPx = pathLength(path);
    eventBus.emit('navigate:result', {
      destinationId,
      found: true,
      distanceM: distancePxToMeters(distPx),
      etaSeconds: estimateWalkTimeSeconds(distPx)
    });
  }

  clearRoute() {
    this.currentDestinationId = null;
    this.currentRoute = null;
    this.routeGraphics.clear();
    if (this.destinationMarker) {
      this.destinationMarker.destroy();
      this.destinationMarker = null;
    }
  }

  findNearestInteractiveLocation() {
    let nearest = null;
    let nearestDist = Infinity;
    const px = this.player.x;
    const py = this.player.y;

    this.buildingRects.forEach(({ loc }) => {
      if (!loc.interactive) return;

      // Distance to building perimeter (handles arbitrary building sizes accurately)
      const halfW = loc.width / 2;
      const halfH = loc.height / 2;
      const clampX = Phaser.Math.Clamp(px, loc.x - halfW, loc.x + halfW);
      const clampY = Phaser.Math.Clamp(py, loc.y - halfH, loc.y + halfH);
      const edgeDist = Phaser.Math.Distance.Between(px, py, clampX, clampY);

      // Distance to entrance door threshold
      const doorX = loc.x;
      const doorY = loc.y + halfH;
      const doorDist = Phaser.Math.Distance.Between(px, py, doorX, doorY);

      const d = Math.min(edgeDist, doorDist);

      // Generous interaction threshold (85px from edge or door)
      if (d <= 85 && d < nearestDist) {
        nearest = loc;
        nearestDist = d;
      }
    });
    return nearest;
  }

  findNearestNpc() {
    let nearest = null;
    let nearestDist = Infinity;
    this.npcs.forEach((npc) => {
      const d = this.player.distanceTo(npc.x, npc.y);
      if (d <= 90 && d < nearestDist) {
        nearest = npc;
        nearestDist = d;
      }
    });
    return nearest;
  }

  triggerCurrentInteraction() {
    const nearestLoc = this.findNearestInteractiveLocation();
    const nearestNpc = this.findNearestNpc();

    if (nearestLoc) {
      if (nearestLoc.classrooms && nearestLoc.classrooms.length > 0) {
        eventBus.emit('classroom:open', { location: nearestLoc, classroomIndex: 0 });
      } else {
        eventBus.emit('location:interact', { location: nearestLoc });
      }
    } else if (nearestNpc) {
      eventBus.emit('npc:talk', {
        npc: {
          id: nearestNpc.id,
          name: nearestNpc.name,
          role: nearestNpc.role,
          line: nearestNpc.getNextDialogueLine()
        }
      });
    }
  }

  update() {
    this.player.update();
    this.npcs.forEach((npc) => npc.update());

    const nearestLoc = this.findNearestInteractiveLocation();
    const nearestNpc = this.findNearestNpc();
    const target = nearestLoc || nearestNpc;

    if (target) {
      // Float prompt directly above the player's avatar so it is ALWAYS visible
      const tx = this.player.x;
      const ty = this.player.y - 36;
      let label = '';
      if (nearestLoc) {
        if (nearestLoc.classrooms && nearestLoc.classrooms.length > 0) {
          label = `[E] Enter Classrooms · ${nearestLoc.name}`;
          this.interactionText.setBackgroundColor('#06b6d4');
          this.interactionText.setColor('#090d16');
        } else {
          label = `[E] View ${nearestLoc.name}`;
          this.interactionText.setBackgroundColor('#f59e0b');
          this.interactionText.setColor('#090d16');
        }
      } else {
        label = `[E] Talk to ${nearestNpc.name}`;
        this.interactionText.setBackgroundColor('#38bdf8');
        this.interactionText.setColor('#090d16');
      }
      this.interactionText
        .setText(label)
        .setPosition(tx, ty)
        .setVisible(true);
      this.interactionText.setOrigin(0.5, 1);
    } else {
      this.interactionText.setVisible(false);
    }

    if (this.player.isInteractPressed()) {
      this.triggerCurrentInteraction();
    }

    // Dynamic Route Update check: if navigation active
    if (this.currentDestinationId && this.currentRoute && this.currentRoute.length > 0) {
      const goal = this.currentRoute[this.currentRoute.length - 1];
      const distToGoal = this.player.distanceTo(goal.x, goal.y);
      if (distToGoal < 40) {
        // Arrived at destination!
        this.clearRoute();
        eventBus.emit('navigate:arrived', { destinationId: this.currentDestinationId });
      } else {
        // Check if player drifted too far from the computed path (off-route recalculation)
        this.routeCheckCounter = (this.routeCheckCounter || 0) + 1;
        if (this.routeCheckCounter > 45) { // Check every ~45 frames (~0.75s)
          this.routeCheckCounter = 0;
          let minDistanceToPath = Infinity;
          for (const pt of this.currentRoute) {
            const d = this.player.distanceTo(pt.x, pt.y);
            if (d < minDistanceToPath) minDistanceToPath = d;
          }
          if (minDistanceToPath > 120) {
            // Player moved off path -> recalculate route smoothly
            this.drawRouteTo(this.currentDestinationId, false);
          }
        }
      }
    }

    eventBus.emit('player:moved', {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      locationId: nearestLoc ? nearestLoc.id : null,
      isSprinting: this.player.isSprinting
    });
  }

  shutdown() {
    this.unsubFocus?.();
    this.unsubNavigate?.();
    this.unsubCancelNav?.();
    this.unsubTime?.();
    this.unsubRespawn?.();
  }
}
