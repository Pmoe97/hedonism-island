/**
 * Terrain Texture Generator
 * Creates procedural noise patterns for different terrain types
 */

export class TerrainTextureGenerator {
  constructor() {
    // Simple noise generation using deterministic pseudo-random
    this.noiseCache = new Map();
  }

  /**
   * Generate noise value for a specific position
   * Uses simple pseudo-random based on coordinates
   */
  noise(x, y, seed = 0) {
    const key = `${x},${y},${seed}`;
    if (this.noiseCache.has(key)) {
      return this.noiseCache.get(key);
    }
    
    // Simple pseudo-random hash
    let n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
    n = n - Math.floor(n);
    
    this.noiseCache.set(key, n);
    return n;
  }

  /**
   * Get texture pattern for terrain type at specific hex coordinates
   * Returns { color, alpha } for overlay on base terrain
   */
  getTexturePattern(terrain, q, r, scale = 1.0) {
    const patterns = [];
    
    switch (terrain) {
      case 'forest':
      case 'rainforest':
        // Tree cluster speckles (darker green spots)
        for (let i = 0; i < 8; i++) {
          const noise = this.noise(q, r, i * 10);
          if (noise > 0.7) {
            patterns.push({
              x: (noise * 30 - 15) / scale,
              y: (this.noise(q, r, i * 10 + 1) * 30 - 15) / scale,
              size: 2 + this.noise(q, r, i * 10 + 2) * 3,
              color: terrain === 'rainforest' ? '#0f3d0f' : '#1a5c1a',
              alpha: 0.4
            });
          }
        }
        break;
        
      case 'jungle-hill':
        // Dense foliage patterns
        for (let i = 0; i < 12; i++) {
          const noise = this.noise(q, r, i * 7);
          if (noise > 0.6) {
            patterns.push({
              x: (noise * 35 - 17.5) / scale,
              y: (this.noise(q, r, i * 7 + 1) * 35 - 17.5) / scale,
              size: 1.5 + this.noise(q, r, i * 7 + 2) * 2.5,
              color: '#2d5016',
              alpha: 0.5
            });
          }
        }
        break;
        
      case 'beach':
        // Sand texture (small light spots)
        for (let i = 0; i < 15; i++) {
          const noise = this.noise(q, r, i * 5);
          if (noise > 0.5) {
            patterns.push({
              x: (noise * 40 - 20) / scale,
              y: (this.noise(q, r, i * 5 + 1) * 40 - 20) / scale,
              size: 0.8 + this.noise(q, r, i * 5 + 2) * 1.2,
              color: '#ffffff',
              alpha: 0.15
            });
          }
        }
        break;
        
      case 'rocky-peak':
      case 'misty-peak':
        // Rock face patterns (angular dark spots)
        for (let i = 0; i < 10; i++) {
          const noise = this.noise(q, r, i * 8);
          if (noise > 0.65) {
            patterns.push({
              x: (noise * 30 - 15) / scale,
              y: (this.noise(q, r, i * 8 + 1) * 30 - 15) / scale,
              size: 2 + this.noise(q, r, i * 8 + 2) * 4,
              color: '#3d3d3d',
              alpha: 0.3,
              angular: true
            });
          }
        }
        break;
        
      case 'savanna':
      case 'dry-hill':
        // Grass tufts (small tan/brown spots)
        for (let i = 0; i < 12; i++) {
          const noise = this.noise(q, r, i * 6);
          if (noise > 0.6) {
            patterns.push({
              x: (noise * 35 - 17.5) / scale,
              y: (this.noise(q, r, i * 6 + 1) * 35 - 17.5) / scale,
              size: 1 + this.noise(q, r, i * 6 + 2) * 2,
              color: '#a67c52',
              alpha: 0.25
            });
          }
        }
        break;
        
      case 'mangrove':
        // Dark water patches
        for (let i = 0; i < 8; i++) {
          const noise = this.noise(q, r, i * 9);
          if (noise > 0.68) {
            patterns.push({
              x: (noise * 32 - 16) / scale,
              y: (this.noise(q, r, i * 9 + 1) * 32 - 16) / scale,
              size: 2.5 + this.noise(q, r, i * 9 + 2) * 3,
              color: '#0a1f0a',
              alpha: 0.5
            });
          }
        }
        break;
        
      case 'palm-grove':
        // Palm tree locations (bright green circles)
        for (let i = 0; i < 6; i++) {
          const noise = this.noise(q, r, i * 11);
          if (noise > 0.72) {
            patterns.push({
              x: (noise * 28 - 14) / scale,
              y: (this.noise(q, r, i * 11 + 1) * 28 - 14) / scale,
              size: 2.5 + this.noise(q, r, i * 11 + 2) * 2,
              color: '#6ee700',
              alpha: 0.4
            });
          }
        }
        break;
    }
    
    return patterns;
  }

  /**
   * Calculate hillshading value based on elevation and neighboring tiles
   * Simulates light from NW direction
   */
  calculateHillshade(elevation, qOffset = 0, rOffset = 0, neighborElevation = null) {
    if (!neighborElevation) return 0;
    
    // Calculate slope (difference in elevation)
    const slope = elevation - neighborElevation;
    
    // NW light source means SE-facing slopes are darker
    // Light direction: NW -> SE (q increases, r increases is SE)
    const lightAngle = qOffset + rOffset; // Simplified: positive = facing away from light
    
    // Hillshade factor: -0.15 to +0.15
    return slope * lightAngle * 0.15;
  }

  /**
   * Get elevation-based color gradient
   * Returns brightness multiplier (0.6 - 1.4)
   */
  getElevationBrightness(elevation, minElev = 0, maxElev = 1) {
    // Safety checks
    if (elevation === undefined || elevation === null || isNaN(elevation)) {
      return 1.0; // Default brightness
    }
    if (minElev === maxElev) {
      return 1.0; // Avoid division by zero
    }
    
    // Normalize elevation to 0-1 range
    const normalized = (elevation - minElev) / (maxElev - minElev);
    
    // Clamp normalized value
    const clamped = Math.max(0, Math.min(1, normalized));
    
    // Map to brightness: low = darker (0.6), high = brighter (1.4)
    // Use slight curve to make difference more dramatic
    const brightness = 0.6 + Math.pow(clamped, 0.8) * 0.8;
    
    return brightness;
  }
}
