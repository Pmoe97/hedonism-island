/**
 * Hexagonal Grid Utilities
 * Uses axial coordinate system (q, r)
 * Reference: https://www.redblobgames.com/grids/hexagons/
 */

export class HexGrid {
  constructor(radius = 7) {
    this.radius = radius; // Number of hexes from center to edge
    this.hexSize = 40; // Pixel size of each hex
  }

  // ========================================
  // COORDINATE CONVERSIONS
  // ========================================

  // Convert axial (q, r) to cube (x, y, z) coordinates
  axialToCube(q, r) {
    const x = q;
    const z = r;
    const y = -x - z;
    return { x, y, z };
  }

  // Convert cube to axial coordinates
  cubeToAxial(x, y, z) {
    const q = x;
    const r = z;
    return { q, r };
  }

  // Convert axial to pixel coordinates (for rendering)
  axialToPixel(q, r) {
    const x = this.hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = this.hexSize * (3 / 2 * r);
    return { x, y };
  }

  // Convert pixel to axial coordinates (for mouse clicks)
  pixelToAxial(x, y) {
    const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / this.hexSize;
    const r = (2 / 3 * y) / this.hexSize;
    return this.roundAxial(q, r);
  }

  // Round fractional axial coordinates to nearest hex
  roundAxial(q, r) {
    return this.cubeToAxial(...this.roundCube(q, -q - r, r));
  }

  // Round fractional cube coordinates
  roundCube(x, y, z) {
    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);

    const x_diff = Math.abs(rx - x);
    const y_diff = Math.abs(ry - y);
    const z_diff = Math.abs(rz - z);

    if (x_diff > y_diff && x_diff > z_diff) {
      rx = -ry - rz;
    } else if (y_diff > z_diff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    return [rx, ry, rz];
  }

  // ========================================
  // DISTANCE & NEIGHBORS
  // ========================================

  // Distance between two hexes (in hex units)
  distance(q1, r1, q2, r2) {
    const cube1 = this.axialToCube(q1, r1);
    const cube2 = this.axialToCube(q2, r2);
    return Math.max(
      Math.abs(cube1.x - cube2.x),
      Math.abs(cube1.y - cube2.y),
      Math.abs(cube1.z - cube2.z)
    );
  }

  // Get all 6 neighbors of a hex
  getNeighbors(q, r) {
    const directions = [
      { q: 1, r: 0 },   // East
      { q: 1, r: -1 },  // Northeast
      { q: 0, r: -1 },  // Northwest
      { q: -1, r: 0 },  // West
      { q: -1, r: 1 },  // Southwest
      { q: 0, r: 1 }    // Southeast
    ];

    return directions.map(dir => ({
      q: q + dir.q,
      r: r + dir.r
    }));
  }

  // Get specific neighbor by direction (0-5)
  getNeighbor(q, r, direction) {
    const neighbors = this.getNeighbors(q, r);
    return neighbors[direction % 6];
  }

  // ========================================
  // AREA QUERIES
  // ========================================

  // Get all hexes within a certain range
  getHexesInRange(centerQ, centerR, range) {
    const hexes = [];
    for (let q = -range; q <= range; q++) {
      const r1 = Math.max(-range, -q - range);
      const r2 = Math.min(range, -q + range);
      for (let r = r1; r <= r2; r++) {
        hexes.push({ q: centerQ + q, r: centerR + r });
      }
    }
    return hexes;
  }

  // Get hexes in a ring at exact distance
  getRing(centerQ, centerR, radius) {
    const results = [];
    if (radius === 0) {
      return [{ q: centerQ, r: centerR }];
    }

    let hex = { q: centerQ - radius, r: centerR + radius };
    const directions = [
      { q: 1, r: -1 }, { q: 1, r: 0 }, { q: 0, r: 1 },
      { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }
    ];

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        results.push({ ...hex });
        hex.q += directions[i].q;
        hex.r += directions[i].r;
      }
    }

    return results;
  }

  // Get all hexes in a line between two points
  getLine(q1, r1, q2, r2) {
    const dist = this.distance(q1, r1, q2, r2);
    if (dist === 0) return [{ q: q1, r: r1 }];

    const results = [];
    for (let i = 0; i <= dist; i++) {
      const t = i / dist;
      const q = q1 * (1 - t) + q2 * t;
      const r = r1 * (1 - t) + r2 * t;
      const rounded = this.roundAxial(q, r);
      results.push(rounded);
    }
    return results;
  }

  // ========================================
  // MAP GENERATION HELPERS
  // ========================================

  // Generate all hexes in a circular map
  generateCircularMap(radius) {
    const hexes = [];
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        // Filter to make it more circular
        if (this.distance(0, 0, q, r) <= radius) {
          hexes.push({ q, r });
        }
      }
    }
    return hexes;
  }

  // Check if hex is within map bounds
  isInBounds(q, r, radius) {
    return this.distance(0, 0, q, r) <= radius;
  }

  // ========================================
  // PATHFINDING (A*)
  // ========================================

  // Find shortest path between two hexes
  findPath(startQ, startR, goalQ, goalR, costFn = () => 1) {
    const start = { q: startQ, r: startR };
    const goal = { q: goalQ, r: goalR };

    const frontier = [{ hex: start, priority: 0 }];
    const cameFrom = new Map();
    const costSoFar = new Map();

    const key = (hex) => `${hex.q},${hex.r}`;
    cameFrom.set(key(start), null);
    costSoFar.set(key(start), 0);

    while (frontier.length > 0) {
      // Get hex with lowest priority
      frontier.sort((a, b) => a.priority - b.priority);
      const current = frontier.shift().hex;

      // Check if we reached the goal
      if (current.q === goal.q && current.r === goal.r) {
        break;
      }

      // Check all neighbors
      const neighbors = this.getNeighbors(current.q, current.r);
      for (const next of neighbors) {
        const newCost = costSoFar.get(key(current)) + costFn(next.q, next.r);
        const nextKey = key(next);

        if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)) {
          costSoFar.set(nextKey, newCost);
          const priority = newCost + this.distance(next.q, next.r, goal.q, goal.r);
          frontier.push({ hex: next, priority });
          cameFrom.set(nextKey, current);
        }
      }
    }

    // Reconstruct path
    const path = [];
    let current = goal;
    while (current) {
      path.unshift(current);
      current = cameFrom.get(key(current));
    }

    return path.length > 0 && path[0].q === start.q && path[0].r === start.r ? path : [];
  }

  // ========================================
  // RENDERING HELPERS
  // ========================================

  // Get polygon points for drawing a hex
  getHexCorners(q, r) {
    const center = this.axialToPixel(q, r);
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i - Math.PI / 6; // Flat-top orientation
      corners.push({
        x: center.x + this.hexSize * Math.cos(angle),
        y: center.y + this.hexSize * Math.sin(angle)
      });
    }
    return corners;
  }
}
