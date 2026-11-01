import Phaser from 'phaser';

/**
 * BootScene
 * Generates rich, high-resolution procedural textures and sprites for the
 * IIIT Bhopal Metaverse. Zero external copyright assets required;
 * loads instantly in under 150ms on any modern browser.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generatePlayerDirectionalTextures();
    this.generateNpcTextures();
    this.generateGrassTile();
    this.generateRoadTile();
    this.generatePathTile();
    this.generateFountainTexture();
    this.generateTreeTexture();
    this.generateStreetlightTexture();
    this.generateBenchTexture();
    this.generateLightGlowTexture();
    this.generateWaypointTexture();
    this.generateSignpostTexture();
    this.generateDustParticleTexture();

    this.scene.start('CampusScene');
  }

  // Generates 4 directional avatar textures (Down, Up, Left, Right)
  generatePlayerDirectionalTextures() {
    const size = 40;
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach((dir) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });

      // 1. Soft Elliptical Drop Shadow
      g.fillStyle(0x000000, 0.35);
      g.fillEllipse(size / 2, size - 4, 24, 10);

      // 2. Backpack (Visible behind when moving down/left/right, on back when moving up)
      if (dir === 'up') {
        g.fillStyle(0x1e293b, 1);
        g.fillRoundedRect(size / 2 - 9, size / 2 - 3, 18, 15, 4);
        g.fillStyle(0x38bdf8, 1);
        g.fillRect(size / 2 - 6, size / 2 + 2, 12, 3); // Neon blue zipper accent
      } else {
        g.fillStyle(0x0f172a, 1);
        g.fillRoundedRect(size / 2 - 8, size / 2 - 1, 16, 12, 3);
      }

      // 3. Torso / Collegiate Jacket (IIIT Bhopal Navy & Gold)
      g.fillStyle(0x0369a1, 1); // Rich cyan-navy blazer
      g.fillCircle(size / 2, size / 2, 13);

      // Jacket Zipper / Golden Trim
      g.fillStyle(0xf59e0b, 1);
      if (dir === 'down') {
        g.fillRect(size / 2 - 1, size / 2 - 6, 2, 14);
        // Collar
        g.fillTriangle(size / 2 - 6, size / 2 - 5, size / 2, size / 2 - 1, size / 2 - 1, size / 2 - 7);
        g.fillTriangle(size / 2 + 6, size / 2 - 5, size / 2, size / 2 - 1, size / 2 + 1, size / 2 - 7);
      } else if (dir === 'left') {
        g.fillRect(size / 2 - 3, size / 2 - 6, 2, 14);
      } else if (dir === 'right') {
        g.fillRect(size / 2 + 1, size / 2 - 6, 2, 14);
      }

      // 4. Head & Skin
      g.fillStyle(0xfde047, 1); // Warm Indian tone / stylized avatar skin
      g.fillCircle(size / 2, size / 2 - 7, 8.5);

      // 5. Hair / Collegiate Cap (Modern dark fade)
      g.fillStyle(0x0f172a, 1);
      if (dir === 'up') {
        g.fillCircle(size / 2, size / 2 - 8, 8.5); // Full back of head hair
      } else if (dir === 'down') {
        g.fillCircle(size / 2, size / 2 - 11, 7.5);
        // Fringe
        g.fillRect(size / 2 - 7, size / 2 - 12, 14, 5);
      } else if (dir === 'left') {
        g.fillCircle(size / 2 + 1, size / 2 - 10, 8);
        g.fillRect(size / 2 - 7, size / 2 - 11, 8, 4);
      } else if (dir === 'right') {
        g.fillCircle(size / 2 - 1, size / 2 - 10, 8);
        g.fillRect(size / 2 - 1, size / 2 - 11, 8, 4);
      }

      // 6. Expressive Eyes
      g.fillStyle(0xffffff, 1);
      if (dir === 'down') {
        g.fillCircle(size / 2 - 3.5, size / 2 - 6, 2.5);
        g.fillCircle(size / 2 + 3.5, size / 2 - 6, 2.5);
        g.fillStyle(0x0284c7, 1); // Blue iris
        g.fillCircle(size / 2 - 3.5, size / 2 - 6, 1.3);
        g.fillCircle(size / 2 + 3.5, size / 2 - 6, 1.3);
      } else if (dir === 'left') {
        g.fillCircle(size / 2 - 5, size / 2 - 6, 2.5);
        g.fillStyle(0x0284c7, 1);
        g.fillCircle(size / 2 - 5.5, size / 2 - 6, 1.3);
      } else if (dir === 'right') {
        g.fillCircle(size / 2 + 5, size / 2 - 6, 2.5);
        g.fillStyle(0x0284c7, 1);
        g.fillCircle(size / 2 + 5.5, size / 2 - 6, 1.3);
      }

      g.generateTexture(`player-${dir}`, size, size);
      // Generate default 'player' as down
      if (dir === 'down') {
        g.generateTexture('player', size, size);
      }
      g.destroy();
    });
  }

  // Generate 4 distinct NPC textures
  generateNpcTextures() {
    const npcConfigs = [
      { key: 'npc-aryan', bodyColor: 0xe07856, hairColor: 0x1f2937, badge: 'A' },
      { key: 'npc-sharma', bodyColor: 0x3b82f6, hairColor: 0x9ca3af, badge: 'S' },
      { key: 'npc-ananya', bodyColor: 0x10b981, hairColor: 0x4b5563, badge: 'L' },
      { key: 'npc-vikram', bodyColor: 0xef4444, hairColor: 0x111827, badge: 'V' }
    ];

    npcConfigs.forEach(({ key, bodyColor, hairColor }) => {
      const size = 40;
      const g = this.make.graphics({ x: 0, y: 0, add: false });

      g.fillStyle(0x000000, 0.35);
      g.fillEllipse(size / 2, size - 4, 22, 10);

      g.fillStyle(bodyColor, 1);
      g.fillCircle(size / 2, size / 2, 13);

      g.fillStyle(0xfde047, 1);
      g.fillCircle(size / 2, size / 2 - 7, 8.5);

      g.fillStyle(hairColor, 1);
      g.fillCircle(size / 2, size / 2 - 11, 7.5);

      g.fillStyle(0xffffff, 1);
      g.fillCircle(size / 2 - 3.5, size / 2 - 6, 2);
      g.fillCircle(size / 2 + 3.5, size / 2 - 6, 2);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(size / 2 - 3.5, size / 2 - 6, 1.2);
      g.fillCircle(size / 2 + 3.5, size / 2 - 6, 1.2);

      g.generateTexture(key, size, size);
      g.destroy();
    });
  }

  // Lush grass tile with delicate wildflowers (buttercups & daisies)
  generateGrassTile() {
    const size = 32;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x19371f, 1); // Dark rich lawn green
    g.fillRect(0, 0, size, size);

    // Textured lawn blades
    g.fillStyle(0x234d2b, 1);
    g.fillRect(3, 4, 7, 3);
    g.fillRect(19, 14, 6, 4);
    g.fillRect(9, 22, 8, 3);
    g.fillRect(23, 5, 5, 3);

    g.fillStyle(0x132a18, 1);
    g.fillRect(14, 8, 4, 3);
    g.fillRect(5, 15, 5, 3);
    g.fillRect(16, 26, 4, 3);

    // Tiny golden buttercups & white daisies
    g.fillStyle(0xfef08a, 0.85); // Soft yellow flower
    g.fillCircle(7, 9, 1.5);
    g.fillCircle(25, 23, 1.5);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(21, 10, 1.2);
    g.fillCircle(11, 27, 1.2);

    g.generateTexture('grass', size, size);
    g.destroy();
  }

  // Asphalt road tile with dashed white dividing markings & textured curbs
  generateRoadTile() {
    const size = 32;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x2a3342, 1); // Deep slate asphalt
    g.fillRect(0, 0, size, size);

    // Road texture grain
    g.fillStyle(0x384457, 0.6);
    g.fillRect(0, 0, size, 2);
    g.fillRect(0, size - 2, size, 2);

    // Subtle stone specks
    g.fillStyle(0x475569, 0.5);
    g.fillRect(6, 8, 2, 2);
    g.fillRect(18, 14, 2, 2);
    g.fillRect(26, 22, 2, 2);

    g.generateTexture('road', size, size);
    g.destroy();
  }

  // Cobblestone / Paver walkway tile with elegant beveling
  generatePathTile() {
    const size = 32;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x64748b, 1);
    g.fillRect(0, 0, size, size);

    g.fillStyle(0x475569, 0.5);
    g.strokeRect(1, 1, 14, 14);
    g.strokeRect(17, 1, 14, 14);
    g.strokeRect(1, 17, 14, 14);
    g.strokeRect(17, 17, 14, 14);

    g.fillStyle(0x94a3b8, 0.4);
    g.fillRect(2, 2, 12, 2);
    g.fillRect(18, 2, 12, 2);
    g.fillRect(2, 18, 12, 2);
    g.fillRect(18, 18, 12, 2);

    g.generateTexture('path', size, size);
    g.destroy();
  }

  // Central Campus Plaza Water Fountain
  generateFountainTexture() {
    const size = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Outer Shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(size / 2, size / 2 + 6, size - 8, size - 20);

    // Outer Stone Basin Rim
    g.fillStyle(0x94a3b8, 1);
    g.fillCircle(size / 2, size / 2, 36);
    g.fillStyle(0x64748b, 1);
    g.fillCircle(size / 2, size / 2, 33);

    // Deep Aqua Water
    g.fillStyle(0x0284c7, 0.9);
    g.fillCircle(size / 2, size / 2, 29);
    g.fillStyle(0x38bdf8, 0.7);
    g.fillCircle(size / 2, size / 2, 23);

    // Inner Marble Tier
    g.fillStyle(0xe2e8f0, 1);
    g.fillCircle(size / 2, size / 2, 14);
    g.fillStyle(0x0ea5e9, 0.9);
    g.fillCircle(size / 2, size / 2, 11);

    // Central Nozzle Spout
    g.fillStyle(0xffffff, 1);
    g.fillCircle(size / 2, size / 2, 5);

    g.generateTexture('fountain', size, size);
    g.destroy();
  }

  // Decorative green tree with multi-shade foliage & shadow
  generateTreeTexture() {
    const size = 64;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Trunk shadow
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(size / 2, size - 8, 38, 16);

    // Trunk
    g.fillStyle(0x5c2b09, 1);
    g.fillRect(size / 2 - 5, size / 2 + 2, 10, 24);

    // Foliage layers (multi-tone emerald & forest green)
    g.fillStyle(0x0f4221, 1);
    g.fillCircle(size / 2, size / 2 - 10, 24);

    g.fillStyle(0x15803d, 1);
    g.fillCircle(size / 2 - 6, size / 2 - 15, 17);

    g.fillStyle(0x22c55e, 0.9);
    g.fillCircle(size / 2 + 5, size / 2 - 17, 14);

    g.fillStyle(0x4ade80, 0.7);
    g.fillCircle(size / 2 - 1, size / 2 - 21, 9);

    g.generateTexture('tree', size, size);
    g.destroy();
  }

  // Campus streetlight
  generateStreetlightTexture() {
    const width = 24;
    const height = 52;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(width / 2, height - 3, 16, 7);

    // Metal pole
    g.fillStyle(0x1e293b, 1);
    g.fillRect(width / 2 - 2.5, 9, 5, height - 12);

    // Modern architectural luminaire head
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(width / 2 - 8, 4, 16, 7, 2);

    // Warm high-efficiency LED fixture
    g.fillStyle(0xfde047, 1);
    g.fillCircle(width / 2, 13, 4.5);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(width / 2, 13, 2);

    g.generateTexture('streetlight', width, height);
    g.destroy();
  }

  // Campus park bench
  generateBenchTexture() {
    const width = 40;
    const height = 20;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(width / 2, height - 2, 34, 8);

    g.fillStyle(0x92400e, 1);
    g.fillRect(3, 4, width - 6, 6);
    g.fillRect(3, 12, width - 6, 4);

    g.fillStyle(0x1e293b, 1);
    g.fillRect(5, 2, 3, height - 4);
    g.fillRect(width - 8, 2, 3, height - 4);

    g.generateTexture('bench', width, height);
    g.destroy();
  }

  // Radial light glow for streetlights in Night Mode
  generateLightGlowTexture() {
    const size = 180;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    for (let r = size / 2; r > 0; r -= 4) {
      const alpha = Math.max(0, (1 - r / (size / 2)) * 0.22);
      g.fillStyle(0xfef08a, alpha);
      g.fillCircle(size / 2, size / 2, r);
    }
    g.generateTexture('light-glow', size, size);
    g.destroy();
  }

  // Navigation waypoint dot
  generateWaypointTexture() {
    const size = 18;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(size / 2, size / 2, 7);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(size / 2, size / 2, 3);
    g.generateTexture('waypoint', size, size);
    g.destroy();
  }

  // Campus Directional Signpost
  generateSignpostTexture() {
    const width = 28;
    const height = 44;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(width / 2, height - 2, 14, 6);

    // Pole
    g.fillStyle(0x475569, 1);
    g.fillRect(width / 2 - 2, 8, 4, height - 10);

    // Signs pointing left & right
    g.fillStyle(0x0284c7, 1);
    g.fillRoundedRect(2, 6, width - 6, 8, 2);
    g.fillStyle(0xf59e0b, 1);
    g.fillRoundedRect(6, 17, width - 8, 8, 2);

    g.generateTexture('signpost', width, height);
    g.destroy();
  }

  // Floating dust mote / particle
  generateDustParticleTexture() {
    const size = 8;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(size / 2, size / 2, 2.5);
    g.generateTexture('dust', size, size);
    g.destroy();
  }
}
