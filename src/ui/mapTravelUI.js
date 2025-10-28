/**
 * Map Travel UI
 * Handles visual representation of territories, fog of war, and travel interactions
 */

export class MapTravelUI {
  constructor(mapEngine, travelSystem, territoryManager) {
    this.mapEngine = mapEngine;
    this.travelSystem = travelSystem;
    this.territoryManager = territoryManager;
    
    this.hoveredHex = null;
    this.selectedHex = null;
    this.initialized = false;
    
    // Layers for different visual elements
    this.territoryLayer = null;
    this.fogLayer = null;
    this.markerLayer = null;
  }
  
  /**
   * Initialize layers and event listeners (call after canvas exists)
   */
  initialize() {
    if (this.initialized) return;
    
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      console.warn('Canvas not found, deferring MapTravelUI initialization');
      return;
    }
    
    this.createLayers();
    this.setupEventListeners();
    this.initialized = true;
    console.log('✅ MapTravelUI initialized');
  }
  
  /**
   * Get pixel coordinates for a hex (uses renderer)
   */
  hexToPixel(q, r) {
    const renderer = window.game.gameView?.renderer;
    if (!renderer || !renderer.hexGrid) {
      return { x: 0, y: 0 };
    }
    return renderer.hexGrid.axialToPixel(q, r);
  }
  
  /**
   * Get hex size
   */
  getHexSize() {
    const renderer = window.game.gameView?.renderer;
    return renderer?.hexGrid?.hexSize || 40;
  }
  
  /**
   * Get renderer for transformations
   */
  getRenderer() {
    return window.game.gameView?.renderer;
  }

  /**
   * Create canvas layers for territories and fog
   */
  createLayers() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      console.error('Canvas not found for creating layers');
      return;
    }
    
    // Territory overlay (faction colors)
    this.territoryLayer = document.createElement('canvas');
    this.territoryLayer.width = canvas.width;
    this.territoryLayer.height = canvas.height;
    this.territoryLayer.style.position = 'absolute';
    this.territoryLayer.style.top = '0';
    this.territoryLayer.style.left = '0';
    this.territoryLayer.style.pointerEvents = 'none';
    this.territoryLayer.style.mixBlendMode = 'multiply';
    canvas.parentElement.appendChild(this.territoryLayer);

    // Fog of war layer
    this.fogLayer = document.createElement('canvas');
    this.fogLayer.width = canvas.width;
    this.fogLayer.height = canvas.height;
    this.fogLayer.style.position = 'absolute';
    this.fogLayer.style.top = '0';
    this.fogLayer.style.left = '0';
    this.fogLayer.style.pointerEvents = 'none';
    canvas.parentElement.appendChild(this.fogLayer);

    // Marker layer (resources, NPCs, events)
    this.markerLayer = document.createElement('canvas');
    this.markerLayer.width = canvas.width;
    this.markerLayer.height = canvas.height;
    this.markerLayer.style.position = 'absolute';
    this.markerLayer.style.top = '0';
    this.markerLayer.style.left = '0';
    this.markerLayer.style.pointerEvents = 'none';
    canvas.parentElement.appendChild(this.markerLayer);
  }

  /**
   * Setup event listeners for hex interaction
   */
  setupEventListeners() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      console.error('Canvas not found for event listeners');
      return;
    }

    canvas.addEventListener('mousemove', (e) => {
      const renderer = window.game.gameView?.renderer;
      if (!renderer) return;
      
      const hex = renderer.screenToHex(e.clientX, e.clientY);
      this.onHexHover(hex);
    });

    canvas.addEventListener('click', (e) => {
      const renderer = window.game.gameView?.renderer;
      if (!renderer) return;
      
      const hex = renderer.screenToHex(e.clientX, e.clientY);
      this.onHexClick(hex);
    });

    canvas.addEventListener('mouseleave', () => {
      this.onHexHover(null);
    });
  }

  /**
   * Handle hex hover
   */
  onHexHover(hex) {
    if (!hex) {
      this.hoveredHex = null;
      this.hideTooltip();
      return;
    }

    // Only show hover if hex is visible (not in fog)
    const territory = this.territoryManager.getTerritory(hex.q, hex.r);
    if (!territory || !territory.visibleFromFog) {
      this.hoveredHex = null;
      this.hideTooltip();
      return;
    }

    this.hoveredHex = hex;
    this.showTooltip(hex, territory);
    this.render(); // Re-render to show hover effect
  }

  /**
   * Handle hex click
   */
  onHexClick(hex) {
    if (!hex) return;

    const territory = this.territoryManager.getTerritory(hex.q, hex.r);
    if (!territory || !territory.visibleFromFog) return;

    // Try to travel to this hex
    const result = this.travelSystem.startTravel(hex.q, hex.r);
    
    if (result.success) {
      this.selectedHex = hex;
      this.showTravelNotification(result);
    } else {
      this.showErrorNotification(result.reason);
    }

    this.render();
  }

  /**
   * Show tooltip for hex
   */
  showTooltip(hex, territory) {
    let tooltip = document.getElementById('hex-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'hex-tooltip';
      tooltip.className = 'hex-tooltip';
      document.body.appendChild(tooltip);
    }

    // Build tooltip content
    let content = `<div class="tooltip-title">${this.getTerrainName(territory.terrain)}</div>`;
    
    // Owner info
    if (territory.owner) {
      const factionName = this.getFactionName(territory.owner);
      content += `<div class="tooltip-faction" style="color: ${territory.getFactionColor()}">
        ${factionName} Territory (${territory.controlStrength}%)
      </div>`;
    } else {
      content += `<div class="tooltip-faction">Unclaimed</div>`;
    }

    // Travel info
    const travelInfo = this.travelSystem.getTravelInfo(hex.q, hex.r);
    if (travelInfo) {
      if (travelInfo.canTravel) {
        content += `<div class="tooltip-travel">
          ⚡ ${travelInfo.energyCost} energy
          ⏱️ ${(travelInfo.travelTime / 1000).toFixed(1)}s
        </div>`;
      } else {
        content += `<div class="tooltip-error">${travelInfo.reason}</div>`;
      }
    }

    // Features
    if (territory.discovered) {
      if (territory.hasResourceNode) {
        content += `<div class="tooltip-feature">🌳 Resources Available</div>`;
      }
      if (territory.hasNPC) {
        content += `<div class="tooltip-feature">👤 NPC Present</div>`;
      }
      if (territory.hasEvent) {
        content += `<div class="tooltip-feature">❗ Event Available</div>`;
      }
    }

    tooltip.innerHTML = content;

    // Position tooltip near cursor (use canvas element)
    const canvas = document.getElementById('game-canvas');
    const pixel = this.hexToPixel(hex.q, hex.r);
    const renderer = window.game.gameView?.renderer;
    
    if (canvas && renderer) {
      const screenX = pixel.x * renderer.scale + renderer.offsetX;
      const screenY = pixel.y * renderer.scale + renderer.offsetY;
      tooltip.style.left = `${screenX + canvas.offsetLeft + 40}px`;
      tooltip.style.top = `${screenY + canvas.offsetTop - 20}px`;
    }
    tooltip.style.display = 'block';
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    const tooltip = document.getElementById('hex-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Render all layers
   */
  render() {
    if (!this.initialized) {
      this.initialize();
      if (!this.initialized) return; // Still not ready
    }
    
    this.renderTerritories();
    this.renderFogOfWar();
    this.renderMarkers();
    this.renderHoverHighlight();
  }

  /**
   * Render faction territories
   */
  renderTerritories() {
    if (!this.territoryLayer) return;
    
    const ctx = this.territoryLayer.getContext('2d');
    const renderer = this.getRenderer();
    if (!renderer) return;
    
    ctx.clearRect(0, 0, this.territoryLayer.width, this.territoryLayer.height);
    
    // Apply same transformation as main renderer
    ctx.save();
    ctx.translate(renderer.offsetX, renderer.offsetY);
    ctx.scale(renderer.scale, renderer.scale);

    this.territoryManager.territories.forEach(territory => {
      if (!territory.owner || !territory.visibleFromFog) return;

      const pixel = this.hexToPixel(territory.position.q, territory.position.r);
      const size = this.getHexSize();

      // Draw faction colored overlay
      ctx.save();
      ctx.translate(pixel.x, pixel.y);
      
      // Draw hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Fill with faction color
      const color = territory.getFactionColor();
      const alpha = territory.controlStrength / 100 * 0.4; // Max 40% opacity
      ctx.fillStyle = this.hexToRGBA(color, alpha);
      ctx.fill();

      // Border for stronger control
      if (territory.controlStrength > 60) {
        ctx.strokeStyle = this.hexToRGBA(color, 0.8);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Render fog of war
   */
  renderFogOfWar() {
    if (!this.fogLayer) return;
    
    const ctx = this.fogLayer.getContext('2d');
    const renderer = this.getRenderer();
    if (!renderer) return;
    
    ctx.clearRect(0, 0, this.fogLayer.width, this.fogLayer.height);
    
    // Apply same transformation as main renderer
    ctx.save();
    ctx.translate(renderer.offsetX, renderer.offsetY);
    ctx.scale(renderer.scale, renderer.scale);

    this.territoryManager.territories.forEach(territory => {
      const pixel = this.hexToPixel(territory.position.q, territory.position.r);
      const size = this.getHexSize();

      ctx.save();
      ctx.translate(pixel.x, pixel.y);

      // Draw hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Full fog (undiscovered)
      if (!territory.discovered) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fill();
      }
      // Partial fog (discovered but not visited)
      else if (territory.discovered && !territory.visited) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
      }
      // No fog (visited)
      // Don't draw anything

      ctx.restore();
    });
    
    ctx.restore();
  }

  /**
   * Render markers for resources, NPCs, events
   */
  renderMarkers() {
    if (!this.markerLayer) return;
    
    const ctx = this.markerLayer.getContext('2d');
    const renderer = this.getRenderer();
    if (!renderer) return;
    
    ctx.clearRect(0, 0, this.markerLayer.width, this.markerLayer.height);
    
    // Apply same transformation as main renderer
    ctx.save();
    ctx.translate(renderer.offsetX, renderer.offsetY);
    ctx.scale(renderer.scale, renderer.scale);

    this.territoryManager.territories.forEach(territory => {
      if (!territory.visited) return; // Only show markers on visited tiles

      const pixel = this.hexToPixel(territory.position.q, territory.position.r);
      const size = this.getHexSize();

      // Resource nodes
      if (territory.hasResourceNode) {
        this.drawMarker(ctx, pixel.x - size * 0.3, pixel.y - size * 0.3, '🌳', 16);
      }

      // NPCs
      if (territory.hasNPC) {
        this.drawMarker(ctx, pixel.x + size * 0.3, pixel.y - size * 0.3, '👤', 16);
      }

      // Events
      if (territory.hasEvent) {
        this.drawMarker(ctx, pixel.x, pixel.y + size * 0.4, '❗', 16);
      }

      // Player position marker
      const currentPos = this.travelSystem.currentPosition;
      if (territory.position.q === currentPos.q && territory.position.r === currentPos.r) {
        this.drawMarker(ctx, pixel.x, pixel.y, '📍', 24);
      }
    });
    
    ctx.restore();
  }

  /**
   * Draw a marker (emoji/icon)
   */
  drawMarker(ctx, x, y, icon, size) {
    ctx.save();
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow for visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    
    ctx.fillText(icon, x, y);
    ctx.restore();
  }

  /**
   * Render hover highlight
   */
  renderHoverHighlight() {
    if (!this.hoveredHex) return;

    const territory = this.territoryManager.getTerritory(this.hoveredHex.q, this.hoveredHex.r);
    if (!territory || !territory.visibleFromFog) return;

    const renderer = this.getRenderer();
    if (!renderer) return;
    
    const ctx = renderer.ctx;
    const pixel = this.hexToPixel(this.hoveredHex.q, this.hoveredHex.r);
    const size = this.getHexSize();

    ctx.save();
    ctx.translate(renderer.offsetX, renderer.offsetY);
    ctx.scale(renderer.scale, renderer.scale);
    ctx.translate(pixel.x, pixel.y);

    // Draw highlight hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    // Yellow highlight
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Show travel notification
   */
  showTravelNotification(result) {
    this.showNotification(
      `Traveling... (${result.energyCost} energy, ${(result.travelTime / 1000).toFixed(1)}s)`,
      'info'
    );
  }

  /**
   * Show error notification
   */
  showErrorNotification(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    let container = document.getElementById('travel-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'travel-notifications';
      container.className = 'travel-notifications';
      document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `travel-notification travel-notification-${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3s
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Helper: Get terrain name
   */
  getTerrainName(terrain) {
    const names = {
      'deep_water': 'Deep Ocean',
      'water': 'Shallow Water',
      'beach': 'Beach',
      'lowland': 'Lowland',
      'forest': 'Forest',
      'highland': 'Highland',
      'mountain': 'Mountain'
    };
    return names[terrain] || terrain;
  }

  /**
   * Helper: Get faction name
   */
  getFactionName(faction) {
    const names = {
      player: 'Your',
      castaways: 'Castaway',
      natives_clan1: 'Native Clan 1',
      natives_clan2: 'Native Clan 2',
      mercenaries: 'Mercenary'
    };
    return names[faction] || faction;
  }

  /**
   * Helper: Convert hex color to RGBA
   */
  hexToRGBA(hex, alpha) {
    if (!hex) return `rgba(255, 255, 255, ${alpha})`;
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Update (called from game loop)
   */
  update(deltaTime) {
    if (!this.initialized) {
      this.initialize();
    }
    
    // Re-render if traveling (for animations)
    if (this.travelSystem.isTraveling) {
      this.render();
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.territoryLayer) this.territoryLayer.remove();
    if (this.fogLayer) this.fogLayer.remove();
    if (this.markerLayer) this.markerLayer.remove();
    this.hideTooltip();
  }
}
