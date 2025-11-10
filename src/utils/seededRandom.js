/**
 * Seeded Random Number Generator
 * Provides deterministic randomness for map generation
 */

export class SeededRandom {
  constructor(seed = Date.now()) {
    // Convert string seeds to numeric hash
    if (typeof seed === 'string') {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      seed = Math.abs(hash);
      console.log(`🌱 SeededRandom constructor: converted string to numeric seed=${seed}`);
    } else {
      console.log(`🌱 SeededRandom constructor: seed=${seed}, type=${typeof seed}`);
    }
    
    this.seed = seed;
    this.state = seed;
    console.log(`🌱 SeededRandom state initialized: ${this.state}`);
  }

  // Mulberry32 - fast, high quality PRNG
  next() {
    const oldState = this.state;
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    const result = ((t ^ t >>> 14) >>> 0) / 4294967296;
    console.log(`🎲 next() called: oldState=${oldState}, newState=${this.state}, t=${t}, result=${result}`);
    return result;
  }

  // Random float between min and max
  range(min, max) {
    return min + this.next() * (max - min);
  }

  // Random integer between min (inclusive) and max (inclusive)
  int(min, max) {
    const nextVal = this.next();
    const range = max - min + 1;
    const result = Math.floor(min + nextVal * range);
    console.log(`🎲 int(${min}, ${max}): next()=${nextVal.toFixed(6)}, range=${range}, result=${result}`);
    return result;
  }

  // Random boolean
  bool(probability = 0.5) {
    return this.next() < probability;
  }

  // Random element from array
  choice(array) {
    return array[this.int(0, array.length - 1)];
  }

  // Shuffle array in place
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(0, i);
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
