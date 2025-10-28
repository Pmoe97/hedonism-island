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
    
    // Colors for different terrains
    this.terrainColors = {
      'sea': '#1e3a8a',
      'beach': '#fde047',
      'river': '#3b82f6',
      'savanna': '#a3e635',
      'forest': '#22c55e',
      'rainforest': '#15803d',
      'dry-hill': '#a8a29e',
      'jungle-hill': '#65a30d',
      'cloud-forest': '#6ee7b7',
      'rocky-peak': '#78716c',
      'misty-peak': '#cbd5e1'
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
    
    // Hex border
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
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
    const worldX = (screenX - this.offsetX) / this.scale;
    const worldY = (screenY - this.offsetY) / this.scale;
    return this.hexGrid.pixelToAxial(worldX, worldY);
  }
}
