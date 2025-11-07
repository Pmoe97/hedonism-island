/**
 * Time Control UI
 * Displays current time and provides speed controls (pause/1x/10x/20x/100x)
 */

export class TimeControlUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.container = null;
    this.init();
  }

  /**
   * Initialize the UI
   */
  init() {
    this.container = document.createElement('div');
    this.container.id = 'time-control-ui';
    this.container.className = 'time-control-container';
    document.body.appendChild(this.container);

    this.render();
    this.startUpdateLoop();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key.toLowerCase()) {
        case ' ':  // Space bar = pause/unpause
          e.preventDefault();
          this.togglePause();
          break;
        case '1':
          this.setSpeed(1);
          break;
        case '2':
          this.setSpeed(10);
          break;
        case '3':
          this.setSpeed(20);
          break;
        case '4':
          this.setSpeed(100);
          break;
      }
    });
  }

  /**
   * Render the UI
   */
  render() {
    const isPaused = this.gameState.isPaused;
    const speed = this.gameState.timeSpeed;
    const timeString = this.gameState.getTimeString();
    const timeOfDay = this.gameState.getTimeOfDay();

    this.container.innerHTML = `
      <div class="time-display-section">
        <div class="time-icon">${this.getTimeOfDayIcon(timeOfDay)}</div>
        <div class="time-info">
          <div class="time-string">${timeString}</div>
          <div class="time-of-day">${timeOfDay}</div>
        </div>
      </div>
      
      <div class="speed-controls">
        <button 
          class="speed-btn pause-btn ${isPaused ? 'active' : ''}" 
          data-speed="pause"
          title="Pause (Space)"
        >
          ${isPaused ? '▶️' : '⏸️'}
        </button>
        <button 
          class="speed-btn ${!isPaused && speed === 1 ? 'active' : ''}" 
          data-speed="1"
          title="Normal Speed (1)"
        >
          1x
        </button>
        <button 
          class="speed-btn ${!isPaused && speed === 10 ? 'active' : ''}" 
          data-speed="10"
          title="Fast (2)"
        >
          10x
        </button>
        <button 
          class="speed-btn ${!isPaused && speed === 20 ? 'active' : ''}" 
          data-speed="20"
          title="Very Fast (3)"
        >
          20x
        </button>
        <button 
          class="speed-btn ${!isPaused && speed === 100 ? 'active' : ''}" 
          data-speed="100"
          title="Ultra Fast (4)"
        >
          100x
        </button>
      </div>
    `;

    // Add event listeners
    this.container.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const speedValue = btn.dataset.speed;
        if (speedValue === 'pause') {
          this.togglePause();
        } else {
          this.setSpeed(parseInt(speedValue));
        }
      });
    });
  }

  /**
   * Get icon for time of day
   */
  getTimeOfDayIcon(timeOfDay) {
    const icons = {
      'dawn': '🌅',
      'morning': '☀️',
      'afternoon': '🌤️',
      'evening': '🌇',
      'night': '🌙'
    };
    return icons[timeOfDay] || '🌞';
  }

  /**
   * Toggle pause
   */
  togglePause() {
    this.gameState.togglePause();
    this.render();
  }

  /**
   * Set time speed
   */
  setSpeed(speed) {
    if (this.gameState.isPaused) {
      this.gameState.resume();
    }
    this.gameState.setTimeSpeed(speed);
    this.render();
  }

  /**
   * Start update loop to refresh time display
   */
  startUpdateLoop() {
    setInterval(() => {
      // Only update time display, not full render (to avoid flickering)
      const timeString = this.gameState.getTimeString();
      const timeOfDay = this.gameState.getTimeOfDay();
      
      const timeStringEl = this.container.querySelector('.time-string');
      const timeOfDayEl = this.container.querySelector('.time-of-day');
      const timeIcon = this.container.querySelector('.time-icon');
      
      if (timeStringEl) timeStringEl.textContent = timeString;
      if (timeOfDayEl) timeOfDayEl.textContent = timeOfDay;
      if (timeIcon) timeIcon.textContent = this.getTimeOfDayIcon(timeOfDay);
    }, 1000); // Update every second
  }

  /**
   * Show/hide UI
   */
  show() {
    this.container.style.display = 'flex';
  }

  hide() {
    this.container.style.display = 'none';
  }
}
