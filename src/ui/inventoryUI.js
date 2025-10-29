import { itemDB } from '../data/itemDatabase.js';

/**
 * Inventory UI - Elegant multi-panel interface
 * 
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  INVENTORY                     [X]      │
 * ├──────────────┬──────────────────────────┤
 * │              │  ┌───────────────────┐   │
 * │   EQUIPMENT  │  │                   │   │
 * │              │  │   ITEM GRID       │   │
 * │   [Weapon]   │  │   (4x5 slots)     │   │
 * │   [Tool]     │  │                   │   │
 * │   [Clothing] │  └───────────────────┘   │
 * │   [Backpack] │                           │
 * │              │  Weight: 45.2 / 100 lbs   │
 * │              │  [Sort] [Stack] [Drop]    │
 * ├──────────────┴──────────────────────────┤
 * │  ITEM DETAILS                            │
 * │  [Icon]  Stone Axe                       │
 * │          A crude but effective...        │
 * │          Durability: ████░░ 67/100       │
 * │          +2 Woodcutting, +5 Damage       │
 * │          [Use] [Equip] [Drop]            │
 * └──────────────────────────────────────────┘
 */
export class InventoryUI {
  constructor(inventory) {
    this.inventory = inventory;
    this.container = null;
    this.selectedSlot = null;
    this.draggedSlot = null;
    this.isOpen = false;
    
    this.createUI();
    this.setupEventListeners();
  }

  /**
   * Create the main UI structure
   */
  createUI() {
    // Main container
    this.container = document.createElement('div');
    this.container.className = 'inventory-overlay';
    this.container.style.display = 'none';
    
    // Modal dialog
    const modal = document.createElement('div');
    modal.className = 'inventory-modal';
    
    // Header
    const header = this.createHeader();
    modal.appendChild(header);
    
    // Content area
    const content = document.createElement('div');
    content.className = 'inventory-content';
    
    // Left panel: Equipment
    const equipmentPanel = this.createEquipmentPanel();
    content.appendChild(equipmentPanel);
    
    // Center panel: Item grid + controls
    const gridPanel = this.createGridPanel();
    content.appendChild(gridPanel);
    
    modal.appendChild(content);
    
    // Bottom panel: Item details
    const detailsPanel = this.createDetailsPanel();
    modal.appendChild(detailsPanel);
    
    this.container.appendChild(modal);
    document.body.appendChild(this.container);
  }

  /**
   * Create header with title and close button
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'inventory-header';
    
    const title = document.createElement('h2');
    title.textContent = 'INVENTORY';
    header.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'inventory-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.close();
    header.appendChild(closeBtn);
    
    return header;
  }

  /**
   * Create equipment panel (left side)
   */
  createEquipmentPanel() {
    const panel = document.createElement('div');
    panel.className = 'equipment-panel';
    
    const title = document.createElement('h3');
    title.textContent = 'EQUIPMENT';
    panel.appendChild(title);
    
    // Equipment slots
    const slots = ['weapon', 'tool', 'clothing', 'backpack'];
    slots.forEach(slotType => {
      const slotContainer = this.createEquipmentSlot(slotType);
      panel.appendChild(slotContainer);
    });
    
    return panel;
  }

  /**
   * Create individual equipment slot
   */
  createEquipmentSlot(slotType) {
    const container = document.createElement('div');
    container.className = 'equipment-slot-container';
    
    const label = document.createElement('div');
    label.className = 'equipment-label';
    label.textContent = slotType.toUpperCase();
    container.appendChild(label);
    
    const slot = document.createElement('div');
    slot.className = 'equipment-slot';
    slot.dataset.slotType = slotType;
    
    // Placeholder icon
    const placeholder = document.createElement('div');
    placeholder.className = 'equipment-placeholder';
    placeholder.textContent = this.getEquipmentIcon(slotType);
    slot.appendChild(placeholder);
    
    container.appendChild(slot);
    return container;
  }

  /**
   * Get icon for equipment slot
   */
  getEquipmentIcon(slotType) {
    const icons = {
      weapon: '⚔️',
      tool: '🔧',
      clothing: '👕',
      backpack: '🎒'
    };
    return icons[slotType] || '?';
  }

  /**
   * Create grid panel (center)
   */
  createGridPanel() {
    const panel = document.createElement('div');
    panel.className = 'grid-panel';
    
    // Item grid
    const grid = document.createElement('div');
    grid.className = 'inventory-grid';
    
    // Create 20 slots (4x5)
    for (let i = 0; i < 20; i++) {
      const slot = this.createInventorySlot(i);
      grid.appendChild(slot);
    }
    
    panel.appendChild(grid);
    
    // Weight indicator
    const weightBar = this.createWeightBar();
    panel.appendChild(weightBar);
    
    // Action buttons
    const actions = this.createActionButtons();
    panel.appendChild(actions);
    
    return panel;
  }

  /**
   * Create individual inventory slot
   */
  createInventorySlot(index) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.dataset.slotIndex = index;
    
    // Item icon (hidden by default)
    const icon = document.createElement('div');
    icon.className = 'slot-icon';
    slot.appendChild(icon);
    
    // Stack count badge (hidden by default)
    const count = document.createElement('div');
    count.className = 'slot-count';
    slot.appendChild(count);
    
    // Rarity border (hidden by default)
    const border = document.createElement('div');
    border.className = 'slot-border';
    slot.appendChild(border);
    
    // Event listeners
    slot.addEventListener('click', () => this.selectSlot(index));
    slot.addEventListener('dragstart', (e) => this.onDragStart(e, index));
    slot.addEventListener('dragover', (e) => this.onDragOver(e));
    slot.addEventListener('drop', (e) => this.onDrop(e, index));
    slot.addEventListener('mouseenter', () => this.showTooltip(index));
    slot.addEventListener('mouseleave', () => this.hideTooltip());
    
    return slot;
  }

  /**
   * Create weight capacity bar
   */
  createWeightBar() {
    const container = document.createElement('div');
    container.className = 'weight-container';
    
    const label = document.createElement('div');
    label.className = 'weight-label';
    container.appendChild(label);
    
    const barBg = document.createElement('div');
    barBg.className = 'weight-bar-bg';
    
    const barFill = document.createElement('div');
    barFill.className = 'weight-bar-fill';
    barBg.appendChild(barFill);
    
    container.appendChild(barBg);
    return container;
  }

  /**
   * Create action buttons
   */
  createActionButtons() {
    const container = document.createElement('div');
    container.className = 'action-buttons';
    
    const sortBtn = this.createButton('Sort', () => this.sortInventory());
    const stackBtn = this.createButton('Stack All', () => this.stackAll());
    const dropBtn = this.createButton('Drop All', () => this.dropAll());
    
    container.appendChild(sortBtn);
    container.appendChild(stackBtn);
    container.appendChild(dropBtn);
    
    return container;
  }

  /**
   * Create details panel (bottom)
   */
  createDetailsPanel() {
    const panel = document.createElement('div');
    panel.className = 'details-panel';
    
    // Default empty state
    const empty = document.createElement('div');
    empty.className = 'details-empty';
    empty.textContent = 'Select an item to view details';
    panel.appendChild(empty);
    
    // Item details (hidden by default)
    const details = document.createElement('div');
    details.className = 'details-content';
    details.style.display = 'none';
    
    // Icon
    const icon = document.createElement('div');
    icon.className = 'details-icon';
    details.appendChild(icon);
    
    // Info section
    const info = document.createElement('div');
    info.className = 'details-info';
    
    const name = document.createElement('div');
    name.className = 'details-name';
    info.appendChild(name);
    
    const description = document.createElement('div');
    description.className = 'details-description';
    info.appendChild(description);
    
    const durability = document.createElement('div');
    durability.className = 'details-durability';
    info.appendChild(durability);
    
    const effects = document.createElement('div');
    effects.className = 'details-effects';
    info.appendChild(effects);
    
    details.appendChild(info);
    
    // Action buttons
    const buttons = document.createElement('div');
    buttons.className = 'details-buttons';
    
    const useBtn = this.createButton('Use', () => this.useSelectedItem());
    const equipBtn = this.createButton('Equip', () => this.equipSelectedItem());
    const dropBtn = this.createButton('Drop', () => this.dropSelectedItem());
    
    buttons.appendChild(useBtn);
    buttons.appendChild(equipBtn);
    buttons.appendChild(dropBtn);
    
    details.appendChild(buttons);
    panel.appendChild(details);
    
    return panel;
  }

  /**
   * Create a button
   */
  createButton(text, onclick) {
    const btn = document.createElement('button');
    btn.className = 'inventory-button';
    btn.textContent = text;
    btn.onclick = onclick;
    return btn;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Only ESC to close (no letter shortcuts that interfere with typing)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Close on background click
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }

  /**
   * Open inventory
   */
  open() {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.refresh();
  }

  /**
   * Close inventory
   */
  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.selectedSlot = null;
  }

  /**
   * Toggle inventory
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Refresh all UI elements
   */
  refresh() {
    this.refreshInventoryGrid();
    this.refreshEquipmentSlots();
    this.refreshWeightBar();
    this.refreshDetails();
  }

  /**
   * Refresh inventory grid
   */
  refreshInventoryGrid() {
    const slots = this.container.querySelectorAll('.inventory-slot');
    
    slots.forEach((slotElement, index) => {
      const slot = this.inventory.slots[index];
      const icon = slotElement.querySelector('.slot-icon');
      const count = slotElement.querySelector('.slot-count');
      const border = slotElement.querySelector('.slot-border');
      
      if (slot && !slot.isEmpty()) {
        const item = slot.item;
        
        // Show icon
        icon.style.display = 'block';
        icon.textContent = this.getItemIcon(item);
        
        // Show count if stackable
        if (item.stackable && slot.quantity > 1) {
          count.style.display = 'block';
          count.textContent = slot.quantity;
        } else {
          count.style.display = 'none';
        }
        
        // Show rarity border
        border.style.display = 'block';
        border.style.borderColor = this.getRarityColor(item.rarity);
        
        // Draggable
        slotElement.draggable = true;
      } else {
        // Empty slot
        icon.style.display = 'none';
        count.style.display = 'none';
        border.style.display = 'none';
        slotElement.draggable = false;
      }
      
      // Selected state
      if (this.selectedSlot === index) {
        slotElement.classList.add('selected');
      } else {
        slotElement.classList.remove('selected');
      }
    });
  }

  /**
   * Refresh equipment slots
   */
  refreshEquipmentSlots() {
    const slotTypes = ['weapon', 'tool', 'clothing', 'backpack'];
    
    slotTypes.forEach(slotType => {
      const slotElement = this.container.querySelector(`[data-slot-type="${slotType}"]`);
      const item = this.inventory.equipment[slotType];
      
      // Clear existing content
      slotElement.innerHTML = '';
      
      if (item) {
        // Show equipped item
        const icon = document.createElement('div');
        icon.className = 'equipment-icon';
        icon.textContent = this.getItemIcon(item);
        slotElement.appendChild(icon);
        
        const border = document.createElement('div');
        border.className = 'equipment-border';
        border.style.borderColor = this.getRarityColor(item.rarity);
        slotElement.appendChild(border);
      } else {
        // Show placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'equipment-placeholder';
        placeholder.textContent = this.getEquipmentIcon(slotType);
        slotElement.appendChild(placeholder);
      }
      
      // Click to unequip
      slotElement.onclick = () => {
        if (item) {
          this.inventory.unequip(slotType);
          this.refresh();
        }
      };
    });
  }

  /**
   * Refresh weight bar
   */
  refreshWeightBar() {
    const currentWeight = this.inventory.getTotalWeight();
    const maxWeight = this.inventory.maxWeight;
    const percentage = (currentWeight / maxWeight) * 100;
    
    const label = this.container.querySelector('.weight-label');
    const fill = this.container.querySelector('.weight-bar-fill');
    
    label.textContent = `Weight: ${currentWeight.toFixed(1)} / ${maxWeight} lbs`;
    fill.style.width = `${Math.min(percentage, 100)}%`;
    
    // Color based on capacity
    if (percentage >= 100) {
      fill.style.backgroundColor = '#e74c3c'; // Red - overencumbered
    } else if (percentage >= 80) {
      fill.style.backgroundColor = '#f39c12'; // Orange - heavy
    } else if (percentage >= 60) {
      fill.style.backgroundColor = '#f1c40f'; // Yellow - moderate
    } else {
      fill.style.backgroundColor = '#2ecc71'; // Green - light
    }
  }

  /**
   * Refresh details panel
   */
  refreshDetails() {
    const empty = this.container.querySelector('.details-empty');
    const content = this.container.querySelector('.details-content');
    
    if (this.selectedSlot === null || this.inventory.slots[this.selectedSlot].isEmpty()) {
      empty.style.display = 'block';
      content.style.display = 'none';
      return;
    }
    
    empty.style.display = 'none';
    content.style.display = 'flex';
    
    const slot = this.inventory.slots[this.selectedSlot];
    const item = slot.item;
    
    // Icon
    const icon = content.querySelector('.details-icon');
    icon.textContent = this.getItemIcon(item);
    icon.style.borderColor = this.getRarityColor(item.rarity);
    
    // Name
    const name = content.querySelector('.details-name');
    name.textContent = item.name;
    name.style.color = this.getRarityColor(item.rarity);
    
    // Description
    const description = content.querySelector('.details-description');
    description.textContent = item.description;
    
    // Durability (if applicable)
    const durabilityDiv = content.querySelector('.details-durability');
    if (item.durability !== undefined) {
      const percentage = (item.durability / item.maxDurability) * 100;
      const bars = Math.round(percentage / 10);
      const filled = '█'.repeat(bars);
      const empty = '░'.repeat(10 - bars);
      
      durabilityDiv.style.display = 'block';
      durabilityDiv.textContent = `Durability: ${filled}${empty} ${item.durability}/${item.maxDurability}`;
    } else {
      durabilityDiv.style.display = 'none';
    }
    
    // Effects
    const effectsDiv = content.querySelector('.details-effects');
    if (item.effects && Object.keys(item.effects).length > 0) {
      const effectText = Object.entries(item.effects)
        .map(([key, value]) => {
          const prefix = value > 0 ? '+' : '';
          return `${prefix}${value} ${this.formatEffectName(key)}`;
        })
        .join(', ');
      
      effectsDiv.style.display = 'block';
      effectsDiv.textContent = effectText;
    } else {
      effectsDiv.style.display = 'none';
    }
    
    // Button visibility
    const buttons = content.querySelector('.details-buttons');
    const useBtn = buttons.children[0];
    const equipBtn = buttons.children[1];
    
    useBtn.style.display = item.consumable || item.usable ? 'inline-block' : 'none';
    equipBtn.style.display = item.equippable ? 'inline-block' : 'none';
  }

  /**
   * Select a slot
   */
  selectSlot(index) {
    this.selectedSlot = index;
    this.refresh();
  }

  /**
   * Drag and drop handlers
   */
  onDragStart(e, index) {
    this.draggedSlot = index;
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  }

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  onDrop(e, targetIndex) {
    e.preventDefault();
    
    if (this.draggedSlot !== null && this.draggedSlot !== targetIndex) {
      this.inventory.swapSlots(this.draggedSlot, targetIndex);
      this.refresh();
    }
    
    const dragged = this.container.querySelector('.dragging');
    if (dragged) dragged.classList.remove('dragging');
    this.draggedSlot = null;
  }

  /**
   * Tooltip (simple for now, can be enhanced)
   */
  showTooltip(index) {
    // TODO: Implement hover tooltip
  }

  hideTooltip() {
    // TODO: Implement hover tooltip
  }

  /**
   * Action handlers
   */
  sortInventory() {
    this.inventory.sortInventory();
    this.refresh();
  }

  stackAll() {
    this.inventory.stackAll();
    this.refresh();
  }

  dropAll() {
    if (confirm('Drop all items? This cannot be undone!')) {
      this.inventory.slots.forEach(slot => slot.clear());
      this.refresh();
    }
  }

  useSelectedItem() {
    if (this.selectedSlot !== null) {
      const result = this.inventory.useItem(this.selectedSlot);
      if (result) {
        console.log('Used item:', result);
        // TODO: Apply effects to player
      }
      this.refresh();
    }
  }

  equipSelectedItem() {
    if (this.selectedSlot !== null) {
      const slot = this.inventory.slots[this.selectedSlot];
      if (!slot.isEmpty() && slot.item.equippable) {
        const slotType = this.determineEquipmentSlot(slot.item);
        this.inventory.equip(slot.item, slotType);
        this.refresh();
      }
    }
  }

  dropSelectedItem() {
    if (this.selectedSlot !== null) {
      const slot = this.inventory.slots[this.selectedSlot];
      if (!slot.isEmpty()) {
        const item = slot.item;
        if (confirm(`Drop ${item.name}?`)) {
          this.inventory.removeItem(item.id, 1);
          this.refresh();
        }
      }
    }
  }

  /**
   * Determine which equipment slot an item goes in
   */
  determineEquipmentSlot(item) {
    if (item.type === 'weapon') return 'weapon';
    if (item.type === 'tool') return 'tool';
    if (item.type === 'equipment') {
      if (item.category === 'clothing') return 'clothing';
      if (item.category === 'backpack') return 'backpack';
    }
    return null;
  }

  /**
   * Get emoji icon for item (placeholder until we have real icons)
   */
  getItemIcon(item) {
    const iconMap = {
      // Food
      coconut: '🥥',
      berries: '🫐',
      cooked_fish: '🍖',
      raw_fish: '🐟',
      cooked_meat: '🥩',
      
      // Water
      water_bottle: '💧',
      dirty_water: '💦',
      
      // Medicine
      bandage: '🩹',
      herbal_remedy: '🌿',
      
      // Materials
      wood: '🪵',
      stone: '🪨',
      fiber: '🧵',
      leather: '🟫',
      metal_scrap: '⚙️',
      
      // Tools
      stone_axe: '🪓',
      stone_pickaxe: '⛏️',
      knife: '🔪',
      fishing_rod: '🎣',
      
      // Weapons
      stone_spear: '🗡️',
      wooden_club: '🏏',
      bow: '🏹',
      
      // Equipment
      cloth_shirt: '👕',
      leather_vest: '🦺',
      leather_backpack: '🎒',
      waterskin: '🫙'
    };
    
    return iconMap[item.id] || '📦';
  }

  /**
   * Get color for rarity
   */
  getRarityColor(rarity) {
    const colors = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800'
    };
    return colors[rarity] || colors.common;
  }

  /**
   * Format effect name for display
   */
  formatEffectName(effect) {
    const names = {
      hunger: 'Hunger',
      thirst: 'Thirst',
      health: 'Health',
      energy: 'Energy',
      damage: 'Damage',
      defense: 'Defense',
      woodcutting: 'Woodcutting',
      mining: 'Mining',
      crafting: 'Crafting',
      fishing: 'Fishing',
      range: 'Range',
      capacity: 'Capacity'
    };
    return names[effect] || effect;
  }
}
