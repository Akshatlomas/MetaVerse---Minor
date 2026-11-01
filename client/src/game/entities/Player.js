import Phaser from 'phaser';

const WALK_SPEED = 190;
const SPRINT_SPEED = 320;
const INTERACTION_RADIUS = 80;

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCircle(14, 4, 4);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(15);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E
    });

    this.facing = 'down';
    this.isMoving = false;
    this.isSprinting = false;
    this.walkStep = 0;

    // Optional click-to-move target
    this.targetPoint = null;
    this.pathWaypoints = [];
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  setTarget(x, y) {
    this.targetPoint = { x, y };
  }

  clearTarget() {
    this.targetPoint = null;
    this.pathWaypoints = [];
  }

  setPath(waypoints) {
    if (waypoints && waypoints.length > 0) {
      this.pathWaypoints = [...waypoints];
      this.targetPoint = this.pathWaypoints.shift();
    }
  }

  teleport(x, y) {
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(0, 0);
    this.clearTarget();
  }

  respawn() {
    this.teleport(640, 1210);
  }

  update() {
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const sprinting = this.wasd.sprint.isDown || this.cursors.shift.isDown;

    this.isSprinting = sprinting;

    let vx = 0;
    let vy = 0;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // If keyboard is pressed, cancel any click-to-move target
    if (vx !== 0 || vy !== 0) {
      this.clearTarget();
      this.isMoving = true;
      const len = Math.hypot(vx, vy) || 1;
      const speed = sprinting ? SPRINT_SPEED : WALK_SPEED;
      this.sprite.setVelocity((vx / len) * speed, (vy / len) * speed);

      // Facing orientation
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
    } else if (this.targetPoint) {
      // Click-to-move navigation
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPoint.x, this.targetPoint.y);
      if (dist < 10) {
        if (this.pathWaypoints.length > 0) {
          this.targetPoint = this.pathWaypoints.shift();
        } else {
          this.clearTarget();
          this.sprite.setVelocity(0, 0);
          this.isMoving = false;
        }
      } else {
        this.isMoving = true;
        const speed = sprinting ? SPRINT_SPEED : WALK_SPEED;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPoint.x, this.targetPoint.y);
        this.sprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
    } else {
      this.sprite.setVelocity(0, 0);
      this.isMoving = false;
    }

    // Directional sprite texture update
    const textureKey = `player-${this.facing}`;
    if (this.sprite.texture.key !== textureKey && this.scene.textures.exists(textureKey)) {
      this.sprite.setTexture(textureKey);
    }

    // Walking animation bobbing
    if (this.isMoving) {
      this.walkStep += (sprinting ? 0.25 : 0.16);
      this.sprite.setRotation(Math.sin(this.walkStep) * 0.06);
      this.sprite.setScale(1 + Math.sin(this.walkStep * 2) * 0.04, 1 - Math.sin(this.walkStep * 2) * 0.04);
    } else {
      this.sprite.setRotation(0);
      this.sprite.setScale(1, 1);
    }
  }

  isInteractPressed() {
    return Phaser.Input.Keyboard.JustDown(this.wasd.interact);
  }

  distanceTo(x, y) {
    return Phaser.Math.Distance.Between(this.x, this.y, x, y);
  }

  isNear(x, y, radius = INTERACTION_RADIUS) {
    return this.distanceTo(x, y) <= radius;
  }
}

export { INTERACTION_RADIUS };
