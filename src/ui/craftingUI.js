/**
 * Crafting UI - Recipe Browser and Crafting Interface
 * Beautiful multi-panel interface for browsing and crafting items
 */

import { recipeDB } from '../modules/recipe.js';
import { itemDB } from '../data/itemDatabase.js';

export class CraftingUI {
  constructor(player) {
    this.player = player;
    this.isVisible = false;
    this.selectedRecipe = null;
    this.currentCategory = 'all';
    this.craftingQueue = [];
    this.isCrafting = false;
    
    this.container = null;
    this.init();
  }

  /**
   * Initialize the UI
   */
  init() {
    this.container = document.createElement('div');
    this.container.id = 'crafting-ui';
    this.container.className = 'crafting-modal hidden';
    document.body.appendChild(this.container);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'c' || e.key === 'C') {
        if (!this.isVisible) this.show();
        else this.hide();
      }
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Show the crafting UI
   */
  show() {
    this.isVisible = true;
    this.render();
    this.container.classList.remove('hidden');
    console.log('📋 Crafting menu opened');
  }

  /**
   * Hide the crafting UI
   */
  hide() {
    this.isVisible = false;
    this.container.classList.add('hidden');
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Render the complete UI
   */
  render() {
    const recipes = this.currentCategory === 'all' 
      ? recipeDB.getAll() 
      : recipeDB.getByCategory(this.currentCategory);

    this.container.innerHTML = `
      <div class="crafting-overlay"></div>
      <div class="crafting-window">
        <!-- Header -->
        <div class="crafting-header">
          <h2>🔨 Crafting</h2>
          <button class="close-btn" onclick="window.craftingUI?.hide()">✕</button>
        </div>

        <!-- Main Content -->
        <div class="crafting-content">
          <!-- Left: Categories -->
          <div class="crafting-categories">
            <h3>Categories</h3>
            <div class="category-list">
              ${this.renderCategories()}
            </div>
            <div class="crafting-stats">
              <div class="stat-item">
                <span class="stat-label">⚡ Energy</span>
                <span class="stat-value">${Math.floor(this.player.stats.energy)}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">🔨 Crafting</span>
                <span class="stat-value">${Math.floor(this.player.skills.crafting)}</span>
              </div>
            </div>
          </div>

          <!-- Center: Recipe List -->
          <div class="crafting-recipes">
            <div class="recipes-header">
              <h3>${this.getCategoryName(this.currentCategory)}</h3>
              <span class="recipe-count">${recipes.length} recipes</span>
            </div>
            <div class="recipe-list">
              ${this.renderRecipeList(recipes)}
            </div>
          </div>

          <!-- Right: Recipe Details -->
          <div class="crafting-details">
            ${this.selectedRecipe ? this.renderRecipeDetails(this.selectedRecipe) : this.renderEmptyDetails()}
          </div>
        </div>

        <!-- Footer: Crafting Queue -->
        ${this.craftingQueue.length > 0 ? this.renderCraftingQueue() : ''}
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Render category buttons
   */
  renderCategories() {
    const categories = [
      { id: 'all', name: 'All', icon: '📋' },
      { id: 'tools', name: 'Tools', icon: '🔧' },
      { id: 'weapons', name: 'Weapons', icon: '⚔️' },
      { id: 'equipment', name: 'Equipment', icon: '🎽' },
      { id: 'consumables', name: 'Consumables', icon: '🍖' },
      { id: 'materials', name: 'Materials', icon: '📦' }
    ];

    return categories.map(cat => `
      <button 
        class="category-btn ${this.currentCategory === cat.id ? 'active' : ''}"
        data-category="${cat.id}"
      >
        <span class="category-icon">${cat.icon}</span>
        <span class="category-name">${cat.name}</span>
      </button>
    `).join('');
  }

  /**
   * Get category display name
   */
  getCategoryName(categoryId) {
    const names = {
      all: 'All Recipes',
      tools: 'Tools',
      weapons: 'Weapons',
      equipment: 'Equipment',
      consumables: 'Consumables',
      materials: 'Materials'
    };
    return names[categoryId] || 'Recipes';
  }

  /**
   * Render recipe list
   */
  renderRecipeList(recipes) {
    if (recipes.length === 0) {
      return '<div class="no-recipes">No recipes in this category</div>';
    }

    return recipes.map(recipe => {
      const canCraft = recipe.canCraft(this.player);
      const isSelected = this.selectedRecipe?.id === recipe.id;

      return `
        <div 
          class="recipe-item ${isSelected ? 'selected' : ''} ${!canCraft.success ? 'disabled' : ''}"
          data-recipe-id="${recipe.id}"
        >
          <div class="recipe-icon">${this.getRecipeIcon(recipe)}</div>
          <div class="recipe-info">
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-difficulty" style="color: ${recipe.getDifficultyColor()}">
              ${recipe.difficulty.toUpperCase()}
            </div>
          </div>
          <div class="recipe-status">
            ${canCraft.success ? 
              '<span class="status-can-craft">✓</span>' : 
              '<span class="status-cannot-craft" title="' + canCraft.reason + '">✕</span>'
            }
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Get recipe icon
   */
  getRecipeIcon(recipe) {
    const icons = {
      tools: '🔧',
      weapons: '⚔️',
      equipment: '🎽',
      consumables: '🍖',
      materials: '📦'
    };
    return icons[recipe.category] || '📋';
  }

  /**
   * Render recipe details panel
   */
  renderRecipeDetails(recipe) {
    const canCraft = recipe.canCraft(this.player);

    return `
      <div class="details-header">
        <h3>${recipe.name}</h3>
        <div class="difficulty-badge" style="background: ${recipe.getDifficultyColor()}">
          ${recipe.difficulty}
        </div>
      </div>

      <div class="details-description">
        ${recipe.description}
      </div>

      <div class="details-section">
        <h4>Requirements</h4>
        <div class="requirements-list">
          ${recipe.energyCost > 0 ? `
            <div class="requirement">
              <span class="req-icon">⚡</span>
              <span class="req-label">Energy:</span>
              <span class="req-value ${this.player.stats.energy >= recipe.energyCost ? 'available' : 'unavailable'}">
                ${recipe.energyCost}
              </span>
            </div>
          ` : ''}
          
          ${recipe.requiredSkill ? `
            <div class="requirement">
              <span class="req-icon">🔨</span>
              <span class="req-label">${recipe.requiredSkill}:</span>
              <span class="req-value ${this.player.getEffectiveSkill(recipe.requiredSkill) >= recipe.minimumSkillLevel ? 'available' : 'unavailable'}">
                ${recipe.minimumSkillLevel} (${Math.floor(this.player.getEffectiveSkill(recipe.requiredSkill))})
              </span>
            </div>
          ` : ''}

          ${recipe.requiredTool ? `
            <div class="requirement">
              <span class="req-icon">🛠️</span>
              <span class="req-label">Tool:</span>
              <span class="req-value ${recipe.checkPlayerHasTool(this.player, recipe.requiredTool) ? 'available' : 'unavailable'}">
                ${recipe.requiredTool}
              </span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="details-section">
        <h4>Ingredients</h4>
        <div class="ingredients-list">
          ${recipe.ingredients.map(ing => {
            const item = itemDB.get(ing.itemId);
            const hasCount = this.player.inventory.getItemCount(ing.itemId);
            const hasEnough = hasCount >= ing.quantity;

            return `
              <div class="ingredient ${hasEnough ? 'available' : 'unavailable'}">
                <span class="ingredient-name">${item?.name || ing.itemId}</span>
                <span class="ingredient-count">
                  ${hasCount}/${ing.quantity}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="details-section">
        <h4>Output</h4>
        <div class="output-list">
          ${recipe.output.map(out => {
            const item = itemDB.get(out.itemId);
            return `
              <div class="output-item">
                <span class="output-name">${item?.name || out.itemId}</span>
                <span class="output-quantity">×${out.quantity}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="details-footer">
        <div class="craft-time">
          ⏱️ ${(recipe.craftTime / 1000).toFixed(1)}s
        </div>
        <div class="craft-xp">
          ⭐ +${recipe.baseXP} XP
        </div>
      </div>

      <div class="details-actions">
        <button 
          class="craft-btn ${canCraft.success ? '' : 'disabled'}"
          data-recipe-id="${recipe.id}"
          ${!canCraft.success ? 'disabled' : ''}
        >
          ${canCraft.success ? '🔨 Craft' : `✕ ${canCraft.reason}`}
        </button>
      </div>
    `;
  }

  /**
   * Render empty details panel
   */
  renderEmptyDetails() {
    return `
      <div class="details-empty">
        <div class="empty-icon">🔨</div>
        <div class="empty-text">Select a recipe to view details</div>
      </div>
    `;
  }

  /**
   * Render crafting queue
   */
  renderCraftingQueue() {
    return `
      <div class="crafting-queue">
        <div class="queue-header">
          <h4>Crafting Queue</h4>
          <span class="queue-count">${this.craftingQueue.length} items</span>
        </div>
        <div class="queue-items">
          ${this.craftingQueue.map((item, index) => `
            <div class="queue-item">
              <span class="queue-recipe">${item.recipe.name}</span>
              <div class="queue-progress">
                <div class="queue-progress-bar" style="width: ${item.progress}%"></div>
              </div>
              <button class="queue-cancel" data-index="${index}">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Category buttons
    this.container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.category;
        this.render();
      });
    });

    // Recipe items
    this.container.querySelectorAll('.recipe-item').forEach(item => {
      item.addEventListener('click', () => {
        const recipeId = item.dataset.recipeId;
        this.selectRecipe(recipeId);
      });
    });

    // Craft button
    const craftBtn = this.container.querySelector('.craft-btn');
    if (craftBtn) {
      craftBtn.addEventListener('click', () => {
        const recipeId = craftBtn.dataset.recipeId;
        this.startCrafting(recipeId);
      });
    }

    // Queue cancel buttons
    this.container.querySelectorAll('.queue-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.cancelCrafting(index);
      });
    });

    // Overlay click to close
    const overlay = this.container.querySelector('.crafting-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.hide());
    }
  }

  /**
   * Select a recipe
   */
  selectRecipe(recipeId) {
    this.selectedRecipe = recipeDB.get(recipeId);
    this.render();
  }

  /**
   * Start crafting an item
   */
  startCrafting(recipeId) {
    const recipe = recipeDB.get(recipeId);
    if (!recipe) return;

    const canCraft = recipe.canCraft(this.player);
    if (!canCraft.success) {
      this.showNotification(canCraft.reason, 'error');
      return;
    }

    // Add to queue
    const queueItem = {
      recipe,
      progress: 0,
      startTime: Date.now()
    };

    this.craftingQueue.push(queueItem);
    
    // Start processing if not already crafting
    if (!this.isCrafting) {
      this.processCraftingQueue();
    }

    this.render();
    this.showNotification(`Crafting ${recipe.name}...`, 'info');
  }

  /**
   * Process crafting queue
   */
  async processCraftingQueue() {
    if (this.craftingQueue.length === 0) {
      this.isCrafting = false;
      return;
    }

    this.isCrafting = true;
    const current = this.craftingQueue[0];
    const recipe = current.recipe;

    // Show progress
    const startTime = Date.now();
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      current.progress = Math.min(100, (elapsed / recipe.craftTime) * 100);
      
      if (this.isVisible) {
        this.render();
      }
    }, 100);

    // Wait for craft time
    await new Promise(resolve => setTimeout(resolve, recipe.craftTime));
    clearInterval(updateInterval);

    // Complete crafting
    const result = recipe.craft(this.player);
    
    if (result.success) {
      const itemNames = result.items.map(i => i.item.name).join(', ');
      const qualityText = result.quality !== 'normal' ? ` (${result.quality})` : '';
      this.showNotification(`✓ Crafted ${itemNames}${qualityText}`, 'success');
      
      if (result.xpGained > 0) {
        this.showNotification(`+${result.xpGained} ${recipe.requiredSkill} XP`, 'info');
      }
    } else {
      this.showNotification(`✕ Crafting failed: ${result.reason}`, 'error');
    }

    // Remove from queue
    this.craftingQueue.shift();

    // Continue with next item
    if (this.craftingQueue.length > 0) {
      this.processCraftingQueue();
    } else {
      this.isCrafting = false;
      this.render();
    }
  }

  /**
   * Cancel crafting
   */
  cancelCrafting(index) {
    if (index === 0 && this.isCrafting) {
      this.showNotification('Cannot cancel item currently being crafted', 'warning');
      return;
    }

    const item = this.craftingQueue[index];
    this.craftingQueue.splice(index, 1);
    this.showNotification(`Cancelled crafting ${item.recipe.name}`, 'info');
    this.render();
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `crafting-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Update (called by game loop)
   */
  update() {
    if (this.isVisible && this.isCrafting) {
      this.render();
    }
  }
}
