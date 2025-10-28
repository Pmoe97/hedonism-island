/**
 * Simplex Noise Implementation
 * For procedural terrain generation
 * Based on Stefan Gustavson's implementation
 */

export class SimplexNoise {
  constructor(seed = 0) {
    // Convert string seeds to numeric hash
    if (typeof seed === 'string') {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      seed = Math.abs(hash);
    }
    
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];

    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    // Seed-based shuffle
    let n, q;
    for (let i = 255; i > 0; i--) {
      n = Math.floor((seed = (seed * 16807) % 2147483647) / 2147483647 * (i + 1));
      q = this.p[i];
      this.p[i] = this.p[n];
      this.p[n] = q;
    }

    // Extend to 512
    this.perm = [];
    this.permMod12 = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  dot(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  noise2D(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

    let n0, n1, n2;
    
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    
    // Safely access permutation table
    const permJJ = this.perm[jj] || 0;
    const permJJ1 = this.perm[(jj + j1) & 255] || 0;
    const permJJ2 = this.perm[(jj + 1) & 255] || 0;
    
    const gi0 = this.permMod12[(ii + permJJ) & 511] || 0;
    const gi1 = this.permMod12[(ii + i1 + permJJ1) & 511] || 0;
    const gi2 = this.permMod12[(ii + 1 + permJJ2) & 511] || 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      const g0 = this.grad3[gi0];
      n0 = g0 ? t0 * t0 * this.dot(g0, x0, y0) : 0.0;
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      const g1 = this.grad3[gi1];
      n1 = g1 ? t1 * t1 * this.dot(g1, x1, y1) : 0.0;
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      const g2 = this.grad3[gi2];
      n2 = g2 ? t2 * t2 * this.dot(g2, x2, y2) : 0.0;
    }

    return 70.0 * (n0 + n1 + n2);
  }

  // Fractal/Octave noise for more natural terrain
  fractal(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}
