import { Player } from '../modules/player.js';

/**
 * Player HUD - Elegant stat visualization
 * 
 * Design: Minimalist corner overlay that expands on hover
 * - Compact mode: Small bars in corner
 * - Expanded mode: Full stats, effects, bonuses
 * - Color-coded warnings
 * - Smooth animations
 */
export class PlayerHUD {
  constructor(player) {
    this.player = player;
    this.container = null;
    this.expanded = false;
    this.updateInterval = null;
    
    this.createUI();
    this.startUpdating();
  }

  /**
   * Create HUD UI
   */
  createUI() {
    this.container = document.createElement('div');
    this.container.className = 'player-hud';
    
    // Compact view (always visible)
    const compact = this.createCompactView();
    this.container.appendChild(compact);
    
    // Expanded view (shows on hover)
    const expanded = this.createExpandedView();
    this.container.appendChild(expanded);
    
    // Toggle on click
    this.container.addEventListener('click', () => this.toggle());
    
    document.body.appendChild(this.container);
  }

  /**
   * Create compact stat bars
   */
  createCompactView() {
    const compact = document.createElement('div');
    compact.className = 'hud-compact';
    
    // Player name/avatar
    const header = document.createElement('div');
    header.className = 'hud-header';
    
    const avatar = document.createElement('div');
    avatar.className = 'hud-avatar';
    avatar.textContent = '🏝️';
    header.appendChild(avatar);
    
    const name = document.createElement('div');
    name.className = 'hud-name';
    name.textContent = this.player.name;
    header.appendChild(name);
    
    compact.appendChild(header);
    
    // Core stat bars
    const stats = ['health', 'hunger', 'thirst', 'energy'];
    stats.forEach(stat => {
      const bar = this.createStatBar(stat, true);
      compact.appendChild(bar);
    });
    
    return compact;
  }

  /**
   * Create expanded detail view
   */
  createExpandedView() {
    const expanded = document.createElement('div');
    expanded.className = 'hud-expanded';
    
    // All stats with numbers
    const statsSection = document.createElement('div');
    statsSection.className = 'hud-section';
    
    const statsTitle = document.createElement('h3');
    statsTitle.textContent = 'STATS';
    statsSection.appendChild(statsTitle);
    
    ['health', 'hunger', 'thirst', 'energy', 'sanity'].forEach(stat => {
      const row = this.createStatRow(stat);
      statsSection.appendChild(row);
    });
    
    expanded.appendChild(statsSection);
    
    // Status effects
    const effectsSection = document.createElement('div');
    effectsSection.className = 'hud-section hud-effects';
    
    const effectsTitle = document.createElement('h3');
    effectsTitle.textContent = 'STATUS EFFECTS';
    effectsSection.appendChild(effectsTitle);
    
    const effectsList = document.createElement('div');
    effectsList.className = 'effects-list';
    effectsSection.appendChild(effectsList);
    
    expanded.appendChild(effectsSection);
    
    // Equipment bonuses
    const bonusesSection = document.createElement('div');
    bonusesSection.className = 'hud-section hud-bonuses';
    
    const bonusesTitle = document.createElement('h3');
    bonusesTitle.textContent = 'BONUSES';
    bonusesSection.appendChild(bonusesTitle);
    
    const bonusesList = document.createElement('div');
    bonusesList.className = 'bonuses-list';
    bonusesSection.appendChild(bonusesList);
    
    expanded.appendChild(bonusesSection);
    
    // Survival time
    const timeSection = document.createElement('div');
    timeSection.className = 'hud-section hud-time';
    
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    timeSection.appendChild(timeDisplay);
    
    expanded.appendChild(timeSection);
    
    return expanded;
  }

  /**
   * Create a stat bar (compact)
   */
  createStatBar(stat, compact = false) {
    const container = document.createElement('div');
    container.className = `stat-bar ${compact ? 'compact' : ''}`;
    container.dataset.stat = stat;
    
    const icon = document.createElement('div');
    icon.className = 'stat-icon';
    icon.textContent = this.getStatIcon(stat);
    container.appendChild(icon);
    
    const barBg = document.createElement('div');
    barBg.className = 'stat-bar-bg';
    
    const barFill = document.createElement('div');
    barFill.className = 'stat-bar-fill';
    barBg.appendChild(barFill);
    
    container.appendChild(barBg);
    
    if (!compact) {
      const value = document.createElement('div');
      value.className = 'stat-value';
      container.appendChild(value);
    }
    
    return container;
  }

  /**
   * Create a stat row (expanded)
   */
  createStatRow(stat) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.dataset.stat = stat;
    
    const label = document.createElement('div');
    label.className = 'stat-label';
    label.textContent = this.getStatLabel(stat);
    row.appendChild(label);
    
    const barContainer = document.createElement('div');
    barContainer.className = 'stat-bar-container';
    
    const barBg = document.createElement('div');
    barBg.className = 'stat-bar-bg';
    
    const barFill = document.createElement('div');
    barFill.className = 'stat-bar-fill';
    barBg.appendChild(barFill);
    
    barContainer.appendChild(barBg);
    row.appendChild(barContainer);
    
    const value = document.createElement('div');
    value.className = 'stat-value';
    row.appendChild(value);
    
    return row;
  }

  /**
   * Get icon for stat
   */
  getStatIcon(stat) {
    const icons = {
      health: '❤️',
      hunger: '🍖',
      thirst: '💧',
      energy: '⚡',
      sanity: '🧠'
    };
    return icons[stat] || '?';
  }

  /**
   * Get label for stat
   */
  getStatLabel(stat) {
    const labels = {
      health: 'Health',
      hunger: 'Hunger',
      thirst: 'Thirst',
      energy: 'Energy',
      sanity: 'Sanity'
    };
    return labels[stat] || stat;
  }

  /**
   * Get color for stat value
   */
  getStatColor(stat, value) {
    // Health uses different thresholds
    if (stat === 'health') {
      if (value <= 20) return '#e74c3c';
      if (value <= 40) return '#e67e22';
      if (value <= 60) return '#f39c12';
      return '#2ecc71';
    }
    
    // Hunger/Thirst/Energy - low is bad
    if (stat === 'hunger' || stat === 'thirst' || stat === 'energy') {
      if (value <= 20) return '#e74c3c';
      if (value <= 40) return '#e67e22';
      if (value <= 60) return '#f39c12';
      return '#2ecc71';
    }
    
    // Sanity
    if (stat === 'sanity') {
      if (value <= 20) return '#9b59b6';
      if (value <= 40) return '#e74c3c';
      if (value <= 60) return '#f39c12';
      return '#2ecc71';
    }
    
    return '#3498db';
  }

  /**
   * Toggle expanded view
   */
  toggle() {
    this.expanded = !this.expanded;
    
    if (this.expanded) {
      this.container.classList.add('expanded');
    } else {
      this.container.classList.remove('expanded');
    }
  }

  /**
   * Update HUD display
   */
  update() {
    // Update compact bars
    ['health', 'hunger', 'thirst', 'energy'].forEach(stat => {
      const bar = this.container.querySelector(`.hud-compact .stat-bar[data-stat="${stat}"]`);
      if (bar) {
        const fill = bar.querySelector('.stat-bar-fill');
        const maxValue = stat === 'health' ? this.player.stats.maxHealth : 100;
        const value = this.player.stats[stat];
        const percentage = (value / maxValue) * 100;
        
        fill.style.width = `${percentage}%`;
        fill.style.backgroundColor = this.getStatColor(stat, value);
        
        // Pulse animation for critical stats
        if (value <= 20) {
          fill.classList.add('critical');
        } else {
          fill.classList.remove('critical');
        }
      }
    });
    
    // Update expanded stats
    if (this.expanded) {
      ['health', 'hunger', 'thirst', 'energy', 'sanity'].forEach(stat => {
        const row = this.container.querySelector(`.hud-expanded .stat-row[data-stat="${stat}"]`);
        if (row) {
          const fill = row.querySelector('.stat-bar-fill');
          const valueDisplay = row.querySelector('.stat-value');
          
          const maxValue = stat === 'health' ? this.player.stats.maxHealth : 100;
          const value = this.player.stats[stat];
          const percentage = (value / maxValue) * 100;
          
          fill.style.width = `${percentage}%`;
          fill.style.backgroundColor = this.getStatColor(stat, value);
          
          if (stat === 'health') {
            valueDisplay.textContent = `${Math.round(value)}/${maxValue}`;
          } else {
            valueDisplay.textContent = `${Math.round(value)}%`;
          }
        }
      });
      
      // Update status effects
      this.updateStatusEffects();
      
      // Update bonuses
      this.updateBonuses();
      
      // Update time
      this.updateTime();
    }
  }

  /**
   * Update status effects list
   */
  updateStatusEffects() {
    const list = this.container.querySelector('.effects-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (this.player.statusEffects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'effects-empty';
      empty.textContent = 'No active effects';
      list.appendChild(empty);
      return;
    }
    
    this.player.statusEffects.forEach(effect => {
      const item = document.createElement('div');
      item.className = `effect-item ${effect.type}`;
      
      const icon = document.createElement('span');
      icon.className = 'effect-icon';
      icon.textContent = effect.icon || '✨';
      item.appendChild(icon);
      
      const name = document.createElement('span');
      name.className = 'effect-name';
      name.textContent = effect.name;
      item.appendChild(name);
      
      const duration = document.createElement('span');
      duration.className = 'effect-duration';
      const minutes = Math.ceil(effect.duration / 60000);
      duration.textContent = `${minutes}m`;
      item.appendChild(duration);
      
      list.appendChild(item);
    });
  }

  /**
   * Update equipment bonuses
   */
  updateBonuses() {
    const list = this.container.querySelector('.bonuses-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const bonuses = this.player.getTotalBonuses();
    const activeBonuses = Object.entries(bonuses).filter(([key, value]) => value !== 0);
    
    if (activeBonuses.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'bonuses-empty';
      empty.textContent = 'No active bonuses';
      list.appendChild(empty);
      return;
    }
    
    activeBonuses.forEach(([key, value]) => {
      const item = document.createElement('div');
      item.className = 'bonus-item';
      
      const name = document.createElement('span');
      name.className = 'bonus-name';
      name.textContent = this.formatBonusName(key);
      item.appendChild(name);
      
      const valueSpan = document.createElement('span');
      valueSpan.className = `bonus-value ${value > 0 ? 'positive' : 'negative'}`;
      valueSpan.textContent = value > 0 ? `+${value}` : value;
      item.appendChild(valueSpan);
      
      list.appendChild(item);
    });
  }

  /**
   * Update survival time display
   */
  updateTime() {
    const display = this.container.querySelector('.time-display');
    if (!display) return;
    
    const days = Math.floor(this.player.daysAlive);
    const hours = Math.floor(this.player.hoursAlive);
    
    display.innerHTML = `
      <div class="time-label">Survived</div>
      <div class="time-value">${days}d ${hours}h</div>
    `;
  }

  /**
   * Format bonus name
   */
  formatBonusName(key) {
    const names = {
      damage: 'Damage',
      defense: 'Defense',
      woodcutting: 'Woodcutting',
      mining: 'Mining',
      fishing: 'Fishing',
      crafting: 'Crafting',
      capacity: 'Capacity',
      speed: 'Speed'
    };
    return names[key] || key;
  }

  /**
   * Start automatic updates
   */
  startUpdating() {
    this.updateInterval = setInterval(() => {
      this.update();
    }, 100); // Update 10 times per second for smooth animations
  }

  /**
   * Stop automatic updates
   */
  stopUpdating() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopUpdating();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
