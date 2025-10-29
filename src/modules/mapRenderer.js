/**
 * Map Renderer - Hex Grid Visualization
 * Renders the procedurally generated hex map
 */

export class MapRenderer {
  constructor(canvas, hexGrid) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hexGrid = hexGrid;
    
    // Camera/viewport
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1.0;
    
    // Fog of War
    this.fogOfWarEnabled = false; // Debug toggle
    
    // Colors for different terrains
    this.terrainColors = {
      // WATER/COAST
      'sea': '#1e3a8a',           // Deep blue
      'beach': '#f4e4c1',         // Softer sand/beige
      'cliff': '#57534e',         // Warm grey
      'river': '#3b82f6',         // Bright blue
      
      // LOWLANDS
      'savanna': '#d4b896',       // Golden tan
      'forest': '#22c55e',        // Green
      'rainforest': '#15803d',    // Dark green
      'mangrove': '#166534',      // Dark swampy green
      'palm-grove': '#84cc16',    // Bright tropical green
      
      // HILLS
      'dry-hill': '#a8a29e',      // Tan/grey
      'jungle-hill': '#65a30d',   // Olive green
      'cloud-forest': '#6ee7b7',  // Mint/teal
      'bamboo-forest': '#86efac', // Light fresh green
      'scrubland': '#d6d3d1',     // Dusty grey-brown
      
      // MOUNTAINS
      'rocky-peak': '#78716c',    // Dark grey
      'misty-peak': '#e2e8f0'     // Lighter grey/white
    };
    
    this.setupCanvas();
  }

  setupCanvas() {
    // Set canvas size
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    
    // Center the view
    this.offsetX = this.canvas.width / 2;
    this.offsetY = this.canvas.height / 2;
  }

  // ========================================
  // MAIN RENDER
  // ========================================

  render(tiles) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dark background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context state
    this.ctx.save();
    
    // Apply camera transform
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    
    // Render all hexes
    for (const [key, tile] of tiles) {
      this.renderHex(tile);
    }
    
    // Restore context
    this.ctx.restore();
  }

  // ========================================
  // HEX RENDERING
  // ========================================

  renderHex(tile) {
    const corners = this.hexGrid.getHexCorners(tile.q, tile.r);
    
    // Fill hex with terrain color
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }
    this.ctx.closePath();
    
    // Terrain color with elevation shading
    const baseColor = this.terrainColors[tile.terrain] || '#666666';
    const brightness = tile.isLand ? 1 + (tile.elevation - 0.5) * 0.4 : 1;
    this.ctx.fillStyle = this.adjustBrightness(baseColor, brightness);
    this.ctx.fill();
    
    // Territory overlay (subtle tint)
    if (tile.faction && tile.faction !== 'neutral') {
      const territoryColors = {
        'castaways': 'rgba(251, 191, 36, 0.15)',     // Yellow
        'tidalClan': 'rgba(59, 130, 246, 0.15)',     // Blue
        'ridgeClan': 'rgba(132, 204, 22, 0.15)',     // Green
        'mercenaries': 'rgba(220, 38, 38, 0.15)'     // Red
      };
      
      const territoryColor = territoryColors[tile.faction];
      if (territoryColor) {
        this.ctx.fillStyle = territoryColor;
        this.ctx.fill();
      }
    }
    
    // Hex border (normal)
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // Territory frontier borders (thicker, colored)
    if (tile.isFrontier && tile.faction && tile.faction !== 'neutral') {
      this.renderTerritoryBorders(tile, corners);
    }
    
    // Draw strategic location markers
    if (tile.isStrategic) {
      this.renderStrategicMarker(tile);
    }
    
    // Debug: show coordinates
    if (this.scale > 0.8) {
      const center = this.hexGrid.axialToPixel(tile.q, tile.r);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.font = '8px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`${tile.q},${tile.r}`, center.x, center.y - 6);
      
      // Show terrain type
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.font = '6px monospace';
      this.ctx.fillText(tile.terrain || '?', center.x, center.y + 6);
    }
  }

  /**
   * Render territory borders between different factions
   */
  renderTerritoryBorders(tile, corners) {
    const borderColors = {
      'castaways': '#fbbf24',
      'tidalClan': '#3b82f6',
      'ridgeClan': '#84cc16',
      'mercenaries': '#dc2626'
    };
    
    const borderColor = borderColors[tile.faction] || '#666';
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    
    // Check each edge to see if it borders a different faction
    const neighbors = this.hexGrid.getNeighbors(tile.q, tile.r);
    
    for (let i = 0; i < 6; i++) {
      const neighbor = neighbors[i];
      if (!neighbor) continue;
      
      const neighborTile = this.getTile?.(neighbor.q, neighbor.r);
      if (!neighborTile) continue;
      
      // Draw border if neighbor is different faction
      if (neighborTile.faction !== tile.faction) {
        const startCorner = corners[i];
        const endCorner = corners[(i + 1) % 6];
        
        this.ctx.beginPath();
        this.ctx.moveTo(startCorner.x, startCorner.y);
        this.ctx.lineTo(endCorner.x, endCorner.y);
        this.ctx.stroke();
      }
    }
  }

  // Helper method to get tile (needs to be added)
  getTile(q, r) {
    // This will be provided by the parent that has access to tiles
    return window.game?.mapData?.tiles?.get(`${q},${r}`);
  }

  /**
   * Render special markers for strategic locations
   */
  renderStrategicMarker(tile) {
    const center = this.hexGrid.axialToPixel(tile.q, tile.r);
    const location = tile.strategicLocation;
    
    if (!location) return;
    
    // Different icons for different types
    this.ctx.save();
    this.ctx.translate(center.x, center.y);
    
    switch (location.type) {
      case 'starting-point':
        // Castaway beach - anchor/shipwreck icon
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.strokeStyle = '#92400e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // Draw star
        this.ctx.fillStyle = '#92400e';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('★', 0, 0);
        break;
        
      case 'native-village':
        // Village - hut icon
        if (location.faction === 'tidal-clan') {
          this.ctx.fillStyle = '#3b82f6'; // Blue for coastal
        } else {
          this.ctx.fillStyle = '#84cc16'; // Green for mountain
        }
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // Draw house symbol
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⌂', 0, 0);
        break;
        
      case 'hostile-base':
        // Mercenary compound - skull/danger icon
        this.ctx.fillStyle = '#dc2626'; // Red
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // Draw danger symbol
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚔', 0, 0);
        break;
        
      case 'sacred-site':
        // Sacred site - mystical symbol
        this.ctx.fillStyle = '#a78bfa'; // Purple
        this.ctx.strokeStyle = '#5b21b6';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // Draw sparkle
        this.ctx.fillStyle = '#fef3c7';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('✦', 0, 0);
        break;
        
      case 'shipwreck':
        // Shipwreck - broken ship/anchor icon
        this.ctx.fillStyle = '#92400e'; // Dark brown
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        // Draw anchor/ship symbol
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚓', 0, 0);
        break;
        
      case 'waterfall':
        // Waterfall - cascade icon
        this.ctx.fillStyle = '#3b82f6'; // Blue
        this.ctx.strokeStyle = '#1e3a8a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('≋', 0, 0);
        break;
        
      case 'hot-spring':
        // Hot spring - steam icon
        this.ctx.fillStyle = '#f97316'; // Orange
        this.ctx.strokeStyle = '#ea580c';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('♨', 0, 0);
        break;
        
      case 'cave':
        // Cave - dark entrance icon
        this.ctx.fillStyle = '#1c1917'; // Very dark grey
        this.ctx.strokeStyle = '#78716c';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#a8a29e';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('◐', 0, 0);
        break;
        
      case 'harbor':
        // Harbor - anchor/port icon
        this.ctx.fillStyle = '#0ea5e9'; // Sky blue
        this.ctx.strokeStyle = '#0284c7';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚓', 0, 0);
        break;
        
      case 'ruins':
        // Ancient Ruins - pillar icon
        this.ctx.fillStyle = '#78716c'; // Stone grey
        this.ctx.strokeStyle = '#44403c';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 9, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#d6d3d1';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🏛', 0, 0);
        break;
    }
    
    this.ctx.restore();
  }

  // ========================================
  // CAMERA CONTROLS
  // ========================================

  pan(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
  }

  zoom(delta, mouseX, mouseY) {
    const oldScale = this.scale;
    this.scale *= 1 + delta;
    this.scale = Math.max(0.3, Math.min(3, this.scale));
    
    // Zoom toward mouse position
    const scaleChange = this.scale / oldScale;
    this.offsetX = mouseX - (mouseX - this.offsetX) * scaleChange;
    this.offsetY = mouseY - (mouseY - this.offsetY) * scaleChange;
  }

  resetView() {
    this.offsetX = this.canvas.width / 2;
    this.offsetY = this.canvas.height / 2;
    this.scale = 1.0;
  }

  // ========================================
  // UTILITIES
  // ========================================

  adjustBrightness(color, factor) {
    // Parse hex color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Adjust brightness
    const nr = Math.min(255, Math.floor(r * factor));
    const ng = Math.min(255, Math.floor(g * factor));
    const nb = Math.min(255, Math.floor(b * factor));
    
    return `rgb(${nr}, ${ng}, ${nb})`;
  }

  // Convert screen coordinates to hex coordinates
  screenToHex(screenX, screenY) {
    // Get canvas bounding rect to convert viewport coords to canvas coords
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    // Convert to world coordinates (accounting for camera transform)
    const worldX = (canvasX - this.offsetX) / this.scale;
    const worldY = (canvasY - this.offsetY) / this.scale;
    
    return this.hexGrid.pixelToAxial(worldX, worldY);
  }
}
