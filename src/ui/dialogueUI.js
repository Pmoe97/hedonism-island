/**
 * Dialogue UI - NPC Conversation Interface
 * Full-screen split layout with portrait and conversation
 */

export class DialogueUI {
  constructor(npcManager, perchanceAI) {
    this.npcManager = npcManager;
    this.ai = perchanceAI;
    this.currentNPC = null;
    this.container = null;
    this.isOpen = false;
    
    this.createUI();
  }

  /**
   * Create dialogue UI elements
   */
  createUI() {
    // Main container
    this.container = document.createElement('div');
    this.container.className = 'dialogue-container';
    this.container.innerHTML = `
      <div class="dialogue-split">
        <!-- Left Panel - NPC Portrait -->
        <div class="dialogue-portrait-panel">
          <div class="dialogue-npc-info">
            <h2 class="dialogue-npc-name">NPC Name</h2>
            <p class="dialogue-npc-title">Title</p>
            <p class="dialogue-npc-mood">Mood: Neutral</p>
          </div>
          
          <img class="dialogue-npc-portrait" src="" alt="NPC Portrait">
          
          <div class="dialogue-relationship-bars">
            <div class="relationship-stat">
              <span class="relationship-label">Opinion:</span>
              <div class="relationship-bar">
                <div class="relationship-fill opinion" style="width: 50%"></div>
              </div>
            </div>
            <div class="relationship-stat">
              <span class="relationship-label">Trust:</span>
              <div class="relationship-bar">
                <div class="relationship-fill trust" style="width: 50%"></div>
              </div>
            </div>
            <div class="relationship-stat">
              <span class="relationship-label">Respect:</span>
              <div class="relationship-bar">
                <div class="relationship-fill respect" style="width: 50%"></div>
              </div>
            </div>
            <div class="relationship-stat">
              <span class="relationship-label">Fear:</span>
              <div class="relationship-bar">
                <div class="relationship-fill fear" style="width: 0%"></div>
              </div>
            </div>
            <div class="relationship-stat">
              <span class="relationship-label">Romantic:</span>
              <div class="relationship-bar">
                <div class="relationship-fill romantic" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Panel - Conversation -->
        <div class="dialogue-conversation-panel">
          <div class="dialogue-header">
            <span class="dialogue-header-title">Conversation</span>
            <button class="dialogue-close-btn">Close</button>
          </div>
          
          <div class="dialogue-messages" id="dialogue-messages">
            <!-- Messages will be inserted here -->
          </div>
          
          <div class="dialogue-input-area">
            <div class="dialogue-topics" id="dialogue-topics">
              <!-- Topic buttons will be inserted here -->
            </div>
            
            <div class="dialogue-input-controls">
              <input 
                type="text" 
                class="dialogue-text-input" 
                id="dialogue-text-input"
                placeholder="Type your message..."
                maxlength="200"
              >
              <button class="dialogue-send-btn" id="dialogue-send-btn">Send</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    // Bind events
    this.container.querySelector('.dialogue-close-btn').addEventListener('click', () => this.close());
    this.container.querySelector('#dialogue-send-btn').addEventListener('click', () => this.sendMessage());
    this.container.querySelector('#dialogue-text-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  /**
   * Open dialogue with NPC
   * @param {string} npcId - NPC ID
   */
  async open(npcId) {
    this.currentNPC = this.npcManager.getNPC(npcId);
    if (!this.currentNPC) {
      console.error('NPC not found:', npcId);
      return;
    }
    
    // Update UI with NPC info
    this.updateNPCInfo();
    
    // Load conversation history
    this.loadConversationHistory();
    
    // Update topics
    this.updateTopics();
    
    // Show container immediately (don't wait for portrait)
    this.container.classList.add('active');
    this.isOpen = true;
    
    // Load portrait asynchronously (don't block UI)
    this.loadPortrait(); // No await - let it load in background
    
    // Focus input
    setTimeout(() => {
      this.container.querySelector('#dialogue-text-input').focus();
    }, 300);
    
    // Initial greeting if first time
    if (this.currentNPC.relationships.player.interactionCount === 0) {
      this.addNPCMessage(this.currentNPC.dialogue.greeting || "Hello.");
    }
  }

  /**
   * Close dialogue
   */
  close() {
    this.container.classList.remove('active');
    this.isOpen = false;
    this.currentNPC = null;
    
    // End conversation in manager
    this.npcManager.endConversation();
    
    // Clear messages
    this.container.querySelector('#dialogue-messages').innerHTML = '';
  }

  /**
   * Update NPC info panel
   */
  updateNPCInfo() {
    if (!this.currentNPC) return;
    
    const npc = this.currentNPC;
    
    // Update name and title
    this.container.querySelector('.dialogue-npc-name').textContent = npc.identity.name;
    this.container.querySelector('.dialogue-npc-title').textContent = npc.identity.title;
    
    // Update mood
    const mood = npc.getMood();
    this.container.querySelector('.dialogue-npc-mood').textContent = `Mood: ${mood}`;
    
    // Update relationship bars
    const rel = npc.relationships.player;
    
    // Opinion is -100 to 100, convert to 0-100%
    const opinionPercent = ((rel.opinion + 100) / 2);
    this.container.querySelector('.relationship-fill.opinion').style.width = `${opinionPercent}%`;
    
    // Others are 0-100
    this.container.querySelector('.relationship-fill.trust').style.width = `${rel.trust}%`;
    this.container.querySelector('.relationship-fill.respect').style.width = `${rel.respect}%`;
    this.container.querySelector('.relationship-fill.fear').style.width = `${rel.fear}%`;
    this.container.querySelector('.relationship-fill.romantic').style.width = `${rel.romantic}%`;
  }

  /**
   * Load NPC portrait image
   */
  async loadPortrait() {
    if (!this.currentNPC) return;
    
    const portraitImg = this.container.querySelector('.dialogue-npc-portrait');
    
    // Check if NPC already has portrait URL
    if (this.currentNPC.appearance.portraitUrl) {
      portraitImg.src = this.currentNPC.appearance.portraitUrl;
      return;
    }
    
    // Generate portrait using AI
    try {
      portraitImg.src = this.ai.getPlaceholderImage(); // Show placeholder first
      
      const portraitUrl = await this.ai.generatePortrait(this.currentNPC);
      
      if (portraitUrl) {
        this.currentNPC.appearance.portraitUrl = portraitUrl;
        portraitImg.src = portraitUrl;
      }
    } catch (error) {
      console.error('Failed to generate portrait:', error);
      portraitImg.src = this.ai.getPlaceholderImage();
    }
  }

  /**
   * Load conversation history from NPC memory
   */
  loadConversationHistory() {
    if (!this.currentNPC) return;
    
    const history = this.currentNPC.memory.conversationHistory || [];
    const messagesContainer = this.container.querySelector('#dialogue-messages');
    
    // Clear existing
    messagesContainer.innerHTML = '';
    
    // Load last 20 messages
    const recentHistory = history.slice(-20);
    
    recentHistory.forEach(entry => {
      if (entry.speaker === 'player') {
        this.addPlayerMessage(entry.message, false, entry.timestamp);
      } else {
        this.addNPCMessage(entry.message, false, entry.timestamp);
      }
    });
    
    // Scroll to bottom
    this.scrollToBottom();
  }

  /**
   * Update topic buttons
   */
  updateTopics() {
    if (!this.currentNPC) return;
    
    const topicsContainer = this.container.querySelector('#dialogue-topics');
    topicsContainer.innerHTML = '';
    
    // Get topics from NPC dialogue
    const topics = this.currentNPC.dialogue.topics || [];
    
    // Add topic buttons
    topics.forEach(topic => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn';
      btn.textContent = topic.topic || topic;
      btn.addEventListener('click', () => {
        const message = typeof topic === 'object' ? topic.topic : topic;
        this.sendMessage(message);
      });
      topicsContainer.appendChild(btn);
    });
  }

  /**
   * Send message to NPC
   * @param {string} customMessage - Optional custom message (from topic buttons)
   */
  async sendMessage(customMessage = null) {
    const input = this.container.querySelector('#dialogue-text-input');
    const message = customMessage || input.value.trim();
    
    if (!message) return;
    
    // Clear input
    input.value = '';
    
    // Add player message to UI
    this.addPlayerMessage(message);
    
    // Show loading indicator
    this.showLoading();
    
    // Disable send button
    const sendBtn = this.container.querySelector('#dialogue-send-btn');
    sendBtn.disabled = true;
    
    try {
      // Get NPC response from manager
      const context = this.buildContext();
      const response = await this.npcManager.initiateDialogue(
        this.currentNPC.identity.id,
        message,
        context
      );
      
      // Remove loading indicator
      this.removeLoading();
      
      // Add NPC response to UI
      this.addNPCMessage(response, true);
      
      // Update NPC info (relationships may have changed)
      this.updateNPCInfo();
      
    } catch (error) {
      console.error('Dialogue error:', error);
      this.removeLoading();
      this.addNPCMessage('...', false);
    }
    
    // Re-enable send button
    sendBtn.disabled = false;
    input.focus();
  }

  /**
   * Build context for dialogue
   * @returns {string} Context description
   */
  buildContext() {
    // TODO: Get actual game context (location, time, events, etc.)
    const time = window.gameState?.time || { hour: 12, minute: 0 };
    const timeStr = `${time.hour}:${String(time.minute).padStart(2, '0')}`;
    
    return `You are talking at ${timeStr} on the tropical island.`;
  }

  /**
   * Add player message to conversation
   * @param {string} message - Message text
   * @param {boolean} scroll - Whether to scroll to bottom
   * @param {number} timestamp - Optional timestamp
   */
  addPlayerMessage(message, scroll = true, timestamp = null) {
    const messagesContainer = this.container.querySelector('#dialogue-messages');
    
    const messageEl = document.createElement('div');
    messageEl.className = 'dialogue-message player';
    
    const time = timestamp ? new Date(timestamp) : new Date();
    const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    messageEl.innerHTML = `
      <div class="message-bubble">${this.escapeHTML(message)}</div>
      <span class="message-timestamp">${timeStr}</span>
    `;
    
    messagesContainer.appendChild(messageEl);
    
    if (scroll) this.scrollToBottom();
  }

  /**
   * Add NPC message to conversation
   * @param {string} message - Message text
   * @param {boolean} allowRegenerate - Show regenerate button
   * @param {number} timestamp - Optional timestamp
   */
  addNPCMessage(message, allowRegenerate = false, timestamp = null) {
    const messagesContainer = this.container.querySelector('#dialogue-messages');
    
    const messageEl = document.createElement('div');
    messageEl.className = 'dialogue-message npc';
    
    const time = timestamp ? new Date(timestamp) : new Date();
    const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    let html = `
      <div class="message-bubble">${this.escapeHTML(message)}</div>
      <span class="message-timestamp">${timeStr}</span>
    `;
    
    if (allowRegenerate) {
      html += `<button class="dialogue-regenerate-btn">🔄 Regenerate</button>`;
    }
    
    messageEl.innerHTML = html;
    
    // Bind regenerate button
    if (allowRegenerate) {
      const regenBtn = messageEl.querySelector('.dialogue-regenerate-btn');
      regenBtn.addEventListener('click', () => this.regenerateLastResponse(messageEl));
    }
    
    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Regenerate last NPC response
   * @param {HTMLElement} messageEl - Message element to replace
   */
  async regenerateLastResponse(messageEl) {
    // Find previous player message
    const messages = Array.from(this.container.querySelectorAll('.dialogue-message'));
    const index = messages.indexOf(messageEl);
    
    if (index < 1) return;
    
    const prevMessage = messages[index - 1];
    if (!prevMessage.classList.contains('player')) return;
    
    const playerText = prevMessage.querySelector('.message-bubble').textContent;
    
    // Remove old NPC response
    messageEl.remove();
    
    // Remove from conversation history
    if (this.npcManager.activeConversation) {
      this.npcManager.activeConversation.history.pop(); // Remove NPC response
    }
    
    // Remove from NPC memory
    if (this.currentNPC.memory.conversationHistory.length > 0) {
      this.currentNPC.memory.conversationHistory.pop();
    }
    
    // Show loading
    this.showLoading();
    
    // Regenerate
    try {
      const context = this.buildContext();
      const response = await this.npcManager.initiateDialogue(
        this.currentNPC.identity.id,
        playerText,
        context
      );
      
      this.removeLoading();
      this.addNPCMessage(response, true);
      this.updateNPCInfo();
      
    } catch (error) {
      console.error('Regeneration error:', error);
      this.removeLoading();
      this.addNPCMessage('...', false);
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    const messagesContainer = this.container.querySelector('#dialogue-messages');
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'dialogue-loading';
    loadingEl.id = 'dialogue-loading-indicator';
    loadingEl.innerHTML = `
      <span>${this.currentNPC?.identity.name || 'NPC'} is typing</span>
      <div class="dialogue-loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
    
    messagesContainer.appendChild(loadingEl);
    this.scrollToBottom();
  }

  /**
   * Remove loading indicator
   */
  removeLoading() {
    const loading = this.container.querySelector('#dialogue-loading-indicator');
    if (loading) loading.remove();
  }

  /**
   * Scroll messages to bottom
   */
  scrollToBottom() {
    const messagesContainer = this.container.querySelector('#dialogue-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if dialogue is open
   * @returns {boolean} Is open
   */
  isDialogueOpen() {
    return this.isOpen;
  }
}
