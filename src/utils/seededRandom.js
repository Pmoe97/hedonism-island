/**
 * Seeded Random Number Generator
 * Provides deterministic randomness for map generation
 */

export class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.state = seed;
  }

  // Mulberry32 - fast, high quality PRNG
  next() {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // Random float between min and max
  range(min, max) {
    return min + this.next() * (max - min);
  }

  // Random integer between min (inclusive) and max (exclusive)
  int(min, max) {
    return Math.floor(this.range(min, max));
  }

  // Random boolean
  bool(probability = 0.5) {
    return this.next() < probability;
  }

  // Random element from array
  choice(array) {
    return array[this.int(0, array.length)];
  }

  // Shuffle array in place
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Reset to initial seed
  reset() {
    this.state = this.seed;
  }

  // Set new seed
  setSeed(seed) {
    this.seed = seed;
    this.state = seed;
  }
}
