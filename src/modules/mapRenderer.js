/**
 * Map Renderer - Hex Grid Visualization
 * Renders the procedurally generated hex map with rich visual depth
 */

import { TerrainTextureGenerator } from '../utils/terrainTextures.js';

export class MapRenderer {
  constructor(canvas, hexGrid) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hexGrid = hexGrid;
    this.textureGenerator = new TerrainTextureGenerator();
    
    // Camera/viewport
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1.0;
    
    // Fog of War
    this.fogOfWarEnabled = false; // Debug toggle
    
    // Colors for different terrains (adjusted for better visual depth)
    this.terrainColors = {
      // WATER/COAST
      'sea': '#1e3a8a',           // Deep blue
      'beach': '#f4e4c1',         // Sandy beige
      'cliff': '#57534e',         // Warm grey
      'river': '#3b82f6',         // Bright blue
      
      // LOWLANDS
      'savanna': '#d4b896',       // Golden tan
      'forest': '#2d5016',        // Rich forest green
      'rainforest': '#1a3a1a',    // Deep jungle green
      'mangrove': '#166534',      // Dark swampy green
      'palm-grove': '#84cc16',    // Bright tropical green
      
      // HILLS
      'dry-hill': '#a8a29e',      // Tan/grey
      'jungle-hill': '#3d5a2c',   // Olive green (darker than before)
      'cloud-forest': '#5f9ea0',  // Cadet blue/teal
      'bamboo-forest': '#86efac', // Light fresh green
      'scrubland': '#c2b280',     // Dusty sage
      
      // MOUNTAINS
      'rocky-peak': '#696969',    // Dim grey
      'misty-peak': '#d3d3d3'     // Light grey
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

  render(tiles, territoryManager = null, playerPosition = null) {
    // Store reference for helper methods
    this.territoryManager = territoryManager;
    this.playerPosition = playerPosition;
    
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
    
    // Highlight player's current tile
    if (playerPosition) {
      this.highlightPlayerTile(playerPosition);
    }
    
    // Restore context
    this.ctx.restore();
    
    // Add subtle film grain overlay (post-transform)
    this.addFilmGrain();
  }

  // ========================================
  // HEX RENDERING
  // ========================================

  renderHex(tile) {
    const corners = this.hexGrid.getHexCorners(tile.q, tile.r);
    
    // Get territory data if available
    const territory = this.territoryManager?.getTerritory(tile.q, tile.r);
    
    // Fill hex with terrain color
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }
    this.ctx.closePath();
    
    // Enhanced terrain rendering with elevation and textures
    const baseColor = this.terrainColors[tile.terrain] || '#666666';
    
    // ENHANCEMENT 1: Elevation-based brightness (0.7 - 1.4 range)
    let brightness = 1.0;
    if (tile.isLand && tile.elevation !== undefined && !isNaN(tile.elevation)) {
      brightness = this.textureGenerator.getElevationBrightness(tile.elevation, 0, 1);
      // Safety check: ensure brightness is valid
      if (isNaN(brightness) || brightness < 0.5 || brightness > 1.5) {
        brightness = 1.0;
      }
    }
    
    // Apply base terrain color with elevation
    this.ctx.fillStyle = this.adjustBrightness(baseColor, brightness);
    this.ctx.fill();
    
    // ENHANCEMENT 2: Procedural terrain textures
    if (this.scale > 0.5) { // Only render textures when zoomed in enough
      this.renderTerrainTexture(tile, corners);
    }
    
    // ENHANCEMENT 3: Faction territory tinting (25% opacity for claimed tiles)
    if (territory?.discovered && territory.owner && territory.owner !== 'neutral') {
      const territoryColors = {
        'player': 'rgba(251, 191, 36, ALPHA)',        // Warm yellow
        'castaways': 'rgba(251, 191, 36, ALPHA)',     // Warm yellow
        'natives_clan1': 'rgba(34, 139, 34, ALPHA)',  // Forest green
        'natives_clan2': 'rgba(32, 178, 170, ALPHA)', // Light sea green  
        'mercenaries': 'rgba(70, 130, 180, ALPHA)'    // Steel blue
      };
      
      // Stronger tint when zoomed out for visibility
      let alpha = this.scale < 0.4 ? 0.35 : 0.25;
      const colorTemplate = territoryColors[territory.owner];
      
      if (colorTemplate) {
        this.ctx.fillStyle = colorTemplate.replace('ALPHA', alpha.toString());
        this.ctx.fill();
      }
    }
    
    // ENHANCEMENT 4: Darken unexplored tiles
    if (territory && !territory.visited) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fill();
    }
    
    // Hex border (subtle)
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
    
    // ENHANCEMENT 5: Improved territory borders
    if (territory?.discovered && territory.owner && territory.owner !== 'neutral') {
      this.renderEnhancedTerritoryBorders(tile, corners, territory);
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
   * Render procedural terrain textures
   */
  renderTerrainTexture(tile, corners) {
    const patterns = this.textureGenerator.getTexturePattern(tile.terrain, tile.q, tile.r, this.scale);
    const center = this.hexGrid.axialToPixel(tile.q, tile.r);
    
    this.ctx.save();
    
    // Clip to hex shape
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }
    this.ctx.closePath();
    this.ctx.clip();
    
    // Draw texture patterns
    for (const pattern of patterns) {
      this.ctx.globalAlpha = pattern.alpha;
      this.ctx.fillStyle = pattern.color;
      
      if (pattern.angular) {
        // Angular rock patterns
        this.ctx.fillRect(
          center.x + pattern.x - pattern.size / 2,
          center.y + pattern.y - pattern.size / 2,
          pattern.size,
          pattern.size
        );
      } else {
        // Circular patterns (trees, grass, etc.)
        this.ctx.beginPath();
        this.ctx.arc(center.x + pattern.x, center.y + pattern.y, pattern.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    this.ctx.globalAlpha = 1.0;
    this.ctx.restore();
  }

  /**
   * Render enhanced territory borders between different factions
   * FIXED: Properly detects all borders, not just perimeter tiles
   */
  renderEnhancedTerritoryBorders(tile, corners, territory) {
    const borderColors = {
      'player': '#fbbf24',          // Warm yellow
      'castaways': '#fbbf24',        // Warm yellow  
      'natives_clan1': '#228B22',    // Forest green
      'natives_clan2': '#20B2AA',    // Light sea green
      'mercenaries': '#4682B4'       // Steel blue
    };
    
    const borderColor = borderColors[territory.owner] || '#666';
    
    // Hex neighbor directions (axial coordinates)
    const directions = [
      { q: 1, r: 0 },   // E
      { q: 1, r: -1 },  // NE
      { q: 0, r: -1 },  // NW
      { q: -1, r: 0 },  // W
      { q: -1, r: 1 },  // SW
      { q: 0, r: 1 }    // SE
    ];
    
    // Check each edge
    for (let i = 0; i < 6; i++) {
      const dir = directions[i];
      const neighborQ = tile.q + dir.q;
      const neighborR = tile.r + dir.r;
      const neighborTerr = this.territoryManager?.getTerritory(neighborQ, neighborR);
      
      // Draw border if neighbor has different owner or is neutral/undiscovered
      const shouldDrawBorder = !neighborTerr || 
                               neighborTerr.owner !== territory.owner ||
                               neighborTerr.owner === 'neutral';
      
      if (shouldDrawBorder) {
        // Calculate control strength for border thickness (50% - 100% = 2px - 4px)
        const strength = (territory.controlStrength || 50) / 100;
        const lineWidth = 2 + (strength * 2);
        
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Draw slightly inset border for better visibility
        const startCorner = corners[i];
        const endCorner = corners[(i + 1) % 6];
        
        // Inset by 10% toward center for cleaner look
        const center = this.hexGrid.axialToPixel(tile.q, tile.r);
        const inset = 0.1;
        
        const startX = startCorner.x + (center.x - startCorner.x) * inset;
        const startY = startCorner.y + (center.y - startCorner.y) * inset;
        const endX = endCorner.x + (center.x - endCorner.x) * inset;
        const endY = endCorner.y + (center.y - endCorner.y) * inset;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Add subtle outer glow for emphasis
        if (this.scale > 0.6) {
          this.ctx.strokeStyle = borderColor + '40'; // 25% opacity
          this.ctx.lineWidth = lineWidth + 2;
          this.ctx.beginPath();
          this.ctx.moveTo(startX, startY);
          this.ctx.lineTo(endX, endY);
          this.ctx.stroke();
        }
      }
    }
  }

  /**
   * OLD method - kept for backward compatibility but not used
   */
  renderTerritoryBorders(tile, corners, territory) {
    // Redirect to enhanced version
    this.renderEnhancedTerritoryBorders(tile, corners, territory);
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

  /**
   * Highlight the player's current tile with pulsing glow
   */
  highlightPlayerTile(position) {
    const corners = this.hexGrid.getHexCorners(position.q, position.r);
    
    // Animated pulse effect (using timestamp)
    const pulseSpeed = 2000; // 2 second cycle
    const pulse = (Math.sin(Date.now() / pulseSpeed * Math.PI * 2) + 1) / 2; // 0-1
    const alpha = 0.2 + pulse * 0.3; // 0.2-0.5
    
    // Draw glowing border
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }
    this.ctx.closePath();
    
    // Glow effect (multiple layers)
    this.ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    
    this.ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.5})`;
    this.ctx.lineWidth = 8;
    this.ctx.stroke();
  }

  /**
   * Add subtle film grain overlay for organic feel
   */
  addFilmGrain() {
    if (this.scale < 0.5) return; // Skip grain when zoomed out
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;
    
    // Add random noise to every 10th pixel (performance optimization)
    for (let i = 0; i < pixels.length; i += 40) {
      const noise = (Math.random() - 0.5) * 8; // -4 to +4
      pixels[i] = Math.max(0, Math.min(255, pixels[i] + noise));     // R
      pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + noise)); // G
      pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + noise)); // B
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  adjustBrightness(color, factor) {
    // Safety checks
    if (!color || typeof color !== 'string') return '#666666';
    if (isNaN(factor) || factor === undefined) factor = 1.0;
    
    // Parse hex color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Check for invalid parse results
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.warn('Invalid color:', color);
      return '#666666';
    }
    
    // Adjust brightness
    const nr = Math.min(255, Math.max(0, Math.floor(r * factor)));
    const ng = Math.min(255, Math.max(0, Math.floor(g * factor)));
    const nb = Math.min(255, Math.max(0, Math.floor(b * factor)));
    
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
