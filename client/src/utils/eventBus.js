/**
 * eventBus.js
 * Minimal pub/sub bridge between the React UI layer and the Phaser
 * game instance, since they live in different render trees. Avoids
 * lifting game state into React and re-rendering the canvas.
 *
 * Events used across the app:
 *  - "player:moved"        { x, y, locationId | null }
 *  - "location:interact"   { location }
 *  - "location:focus"      { locationId }        (UI -> game)
 *  - "navigate:request"    { destinationId }      (UI -> game)
 *  - "navigate:result"     { destinationId, distanceM, etaSeconds, found }
 *  - "npc:talk"            { npc }
 *  - "menu:toggle"         { open }
 */
class EventBus extends EventTarget {
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  on(type, handler) {
    this.addEventListener(type, handler);
    return () => this.removeEventListener(type, handler);
  }
}

export const eventBus = new EventBus();
