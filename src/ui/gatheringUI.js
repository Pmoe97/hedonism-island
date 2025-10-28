/**
 * Resource Gathering UI
 * 
 * Design: Interactive overlay that appears when gathering
 * - Progress bar with animation
 * - Resource preview
 * - Tool durability warning
 * - Skill XP gain notification
 * - Smooth transitions
 */
export class GatheringUI {
  constructor() {
    this.container = null;
    this.isGathering = false;
    this.currentNode = null;
    this.gatheringProgress = 0;
    this.gatherStartTime = 0;
    this.animationFrame = null;
    
    this.createUI();
  }

  /**
   * Create UI elements
   */
  createUI() {
    this.container = document.createElement('div');
    this.container.className = 'gathering-overlay';
    this.container.style.display = 'none';
    
    const modal = document.createElement('div');
    modal.className = 'gathering-modal';
    
    // Resource info
    const info = document.createElement('div');
    info.className = 'gathering-info';
    
    const icon = document.createElement('div');
    icon.className = 'gathering-icon';
    info.appendChild(icon);
    
    const name = document.createElement('div');
    name.className = 'gathering-name';
    info.appendChild(name);
    
    modal.appendChild(info);
    
    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'gathering-progress-container';
    
    const progressLabel = document.createElement('div');
    progressLabel.className = 'gathering-progress-label';
    progressLabel.textContent = 'Gathering...';
    progressContainer.appendChild(progressLabel);
    
    const progressBg = document.createElement('div');
    progressBg.className = 'gathering-progress-bg';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'gathering-progress-fill';
    progressBg.appendChild(progressFill);
    
    progressContainer.appendChild(progressBg);
    modal.appendChild(progressContainer);
    
    // Details
    const details = document.createElement('div');
    details.className = 'gathering-details';
    modal.appendChild(details);
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'gathering-cancel';
    cancelBtn.textContent = 'Cancel (ESC)';
    cancelBtn.onclick = () => this.cancel();
    modal.appendChild(cancelBtn);
    
    this.container.appendChild(modal);
    document.body.appendChild(this.container);
    
    // ESC key to cancel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isGathering) {
        this.cancel();
      }
    });
  }

  /**
   * Start gathering from a node
   */
  startGathering(node, player, onComplete) {
    if (this.isGathering) return;
    
    this.isGathering = true;
    this.currentNode = node;
    this.gatheringProgress = 0;
    this.gatherStartTime = Date.now();
    this.onComplete = onComplete;
    
    // Update UI
    const icon = this.container.querySelector('.gathering-icon');
    const name = this.container.querySelector('.gathering-name');
    const details = this.container.querySelector('.gathering-details');
    
    icon.textContent = node.getSprite();
    name.textContent = node.getName();
    
    // Show node details
    const info = node.getInfo();
    details.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Tool Required:</span>
        <span class="detail-value">${info.requiredTool}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Energy Cost:</span>
        <span class="detail-value">${info.energyCost}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${info.gatherTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Uses Remaining:</span>
        <span class="detail-value">${info.usesRemaining}</span>
      </div>
    `;
    
    // Show overlay
    this.container.style.display = 'flex';
    
    // Start progress animation
    this.animate();
  }

  /**
   * Animate gathering progress
   */
  animate() {
    if (!this.isGathering) return;
    
    const elapsed = Date.now() - this.gatherStartTime;
    const duration = this.currentNode.gatherTime;
    this.gatheringProgress = Math.min((elapsed / duration) * 100, 100);
    
    // Update progress bar
    const fill = this.container.querySelector('.gathering-progress-fill');
    fill.style.width = `${this.gatheringProgress}%`;
    
    // Check if complete
    if (this.gatheringProgress >= 100) {
      this.complete();
      return;
    }
    
    // Continue animation
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Complete gathering
   */
  complete() {
    this.isGathering = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.onComplete) {
      this.onComplete();
    }
    
    // Hide after brief delay
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 500);
  }

  /**
   * Cancel gathering
   */
  cancel() {
    this.isGathering = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.container.style.display = 'none';
  }

  /**
   * Show gathering result
   */
  showResult(result) {
    if (!result.success) {
      this.showNotification('Failed', result.reason, 'error');
      return;
    }
    
    // Show items gained
    const itemNames = result.items.map(item => item.name).join(', ');
    let message = `Gathered: ${itemNames}`;
    
    if (result.xpGained) {
      message += `\n+${result.xpGained} XP`;
    }
    
    this.showNotification('Success!', message, 'success');
  }

  /**
   * Show notification popup
   */
  showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `gathering-notification ${type}`;
    
    const titleEl = document.createElement('div');
    titleEl.className = 'notification-title';
    titleEl.textContent = title;
    notification.appendChild(titleEl);
    
    const messageEl = document.createElement('div');
    messageEl.className = 'notification-message';
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

/**
 * Resource Node Inspector UI
 * Shows node info when player is near
 */
export class NodeInspector {
  constructor() {
    this.container = null;
    this.currentNode = null;
    this.createUI();
  }

  /**
   * Create inspector UI
   */
  createUI() {
    this.container = document.createElement('div');
    this.container.className = 'node-inspector';
    this.container.style.display = 'none';
    
    document.body.appendChild(this.container);
  }

  /**
   * Show node info
   */
  show(node, player) {
    this.currentNode = node;
    
    const canGather = node.canGather(player);
    const info = node.getInfo();
    
    this.container.innerHTML = `
      <div class="inspector-header">
        <span class="inspector-icon">${node.getSprite()}</span>
        <span class="inspector-name">${node.getName()}</span>
        <span class="inspector-quality ${node.quality}">${node.quality}</span>
      </div>
      
      <div class="inspector-state">
        <span class="state-badge ${node.state}">${node.state.toUpperCase()}</span>
        ${node.isRegenerating ? `<span class="regen-progress">${info.regenerationProgress} regenerated</span>` : ''}
      </div>
      
      <div class="inspector-details">
        <div class="inspector-row">
          <span class="inspector-label">🔧 Tool:</span>
          <span class="inspector-value">${info.requiredTool}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-label">⚡ Energy:</span>
          <span class="inspector-value">${info.energyCost}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-label">⏱️ Time:</span>
          <span class="inspector-value">${info.gatherTime}</span>
        </div>
        <div class="inspector-row">
          <span class="inspector-label">📦 Uses:</span>
          <span class="inspector-value">${info.usesRemaining}</span>
        </div>
      </div>
      
      <div class="inspector-action">
        ${canGather.success 
          ? '<button class="inspector-button gather">Press E to Gather</button>'
          : `<div class="inspector-error">${canGather.reason}</div>`
        }
      </div>
    `;
    
    this.container.style.display = 'block';
  }

  /**
   * Hide inspector
   */
  hide() {
    this.container.style.display = 'none';
    this.currentNode = null;
  }

  /**
   * Update inspector (if node state changes)
   */
  update(player) {
    if (this.currentNode) {
      this.show(this.currentNode, player);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
