/**
 * Minimal in-memory TTL cache.
 *
 * In the production system this same role is played by Redis, shared across
 * multiple backend instances. For a single-process standalone demo, an
 * in-memory Map with the same get/set interface is enough — swap this class
 * for a Redis-backed one without touching any calling code if this ever
 * needs to run as more than one instance.
 */
export class TtlCache {
  constructor(ttlMinutes = 30) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key, value) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear() {
    this.store.clear();
  }
}
