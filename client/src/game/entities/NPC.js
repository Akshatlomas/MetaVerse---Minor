import Phaser from 'phaser';

/**
 * NPC
 * Interactive non-player-character with customizable sprite, patrol
 * waypoints, role badge, and multi-turn dialogue.
 */
export default class NPC {
  constructor(scene, { id, name, role, x, y, spriteKey = 'npc-aryan', dialogue = [], patrol = null }) {
    this.scene = scene;
    this.id = id;
    this.name = name;
    this.role = role;
    this.dialogue = dialogue.length > 0 ? dialogue : [`Hello! I am ${name}. Welcome to IIIT Bhopal!`];
    this.dialogueIndex = 0;

    this.sprite = scene.physics.add.sprite(x, y, spriteKey);
    this.sprite.setCircle(14, 4, 4);
    this.sprite.setImmovable(true);
    this.sprite.setDepth(14);

    this.patrol = patrol;
    this.patrolIndex = 0;
    this.speed = 45;
    this.isPaused = false;
    this.pauseTimer = 0;

    // Role badge & name label
    this.container = scene.add.container(x, y - 28).setDepth(16);

    const nameText = scene.add
      .text(0, 0, `${name} (${role})`, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        fontWeight: '600',
        color: '#f8fafc',
        backgroundColor: '#0f172a',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5, 1);

    this.container.add(nameText);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  update() {
    this.container.setPosition(this.sprite.x, this.sprite.y - 28);

    if (!this.patrol || this.patrol.length === 0) return;

    if (this.isPaused) {
      this.pauseTimer--;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
      }
      this.sprite.setVelocity(0, 0);
      return;
    }

    const target = this.patrol[this.patrolIndex];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

    if (dist < 6) {
      this.patrolIndex = (this.patrolIndex + 1) % this.patrol.length;
      this.isPaused = true;
      this.pauseTimer = Phaser.Math.Between(40, 90);
      this.sprite.setVelocity(0, 0);
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.sprite.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
  }

  getNextDialogueLine() {
    const line = this.dialogue[this.dialogueIndex];
    this.dialogueIndex = (this.dialogueIndex + 1) % this.dialogue.length;
    return line;
  }
}
