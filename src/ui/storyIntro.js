/**
 * Story Intro - Visual Novel Style
 * Opening crash sequence with text box at bottom
 */

export class StoryIntro {
  constructor(gameState) {
    this.gameState = gameState;
    this.currentScene = 0;
    this.currentLine = 0;
    this.scenes = this.getIntroScenes();
    this.keyHandler = null;
  }

  getIntroScenes() {
    return [
      // Scene 1: Pre-crash tension
      {
        background: '#1a1a1a',
        lines: [
          'Flight 447 to Fiji.',
          'You settle into your seat, earbuds in, ready for a long flight.',
          'The vacation of a lifetime awaits.',
          'Or so you thought...'
        ]
      },
      
      // Scene 2: Turbulence begins
      {
        background: 'linear-gradient(180deg, #1a1a1a 0%, #2d3561 100%)',
        lines: [
          'Three hours in, the plane shudders.',
          'Once. Twice.',
          'The seatbelt sign dings on.',
          '"This is your captain speaking. We\'re experiencing some unexpected turbulence..."'
        ]
      },
      
      // Scene 3: Disaster strikes
      {
        background: 'linear-gradient(180deg, #2d3561 0%, #5e0000 100%)',
        lines: [
          'BANG!',
          'The plane lurches violently to the left.',
          'Screams fill the cabin.',
          'Oxygen masks drop from above.',
          '"BRACE FOR IMPACT!"'
        ]
      },
      
      // Scene 4: The crash
      {
        background: '#000',
        lines: [
          'The world spins.',
          'Metal tears. Glass shatters.',
          'A deafening roar.',
          '',
          'Then... nothing.'
        ]
      },
      
      // Scene 5: Underwater struggle
      {
        background: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
        lines: [
          'Cold.',
          'Pressure.',
          'Salt water burns your throat.',
          'Your eyes snap open.',
          'You\'re underwater. The plane is sinking.'
        ]
      },
      
      // Scene 6: Swimming to surface
      {
        background: 'linear-gradient(180deg, #004e92 0%, #0066cc 100%)',
        lines: [
          'Kick. Swim. Survive.',
          'Your lungs scream for air.',
          'Light above. Keep going.',
          'Almost there...',
          'GASP!'
        ]
      },
      
      // Scene 7: Ocean survival
      {
        background: 'linear-gradient(180deg, #0066cc 0%, #00aaff 100%)',
        lines: [
          'You break the surface, gasping for air.',
          'Debris floats everywhere. People crying out.',
          'You grab onto a piece of the fuselage.',
          'In the distance... an island.',
          'You have to swim. It\'s your only chance.'
        ]
      },
      
      // Scene 8: The swim
      {
        background: 'linear-gradient(180deg, #00aaff 0%, #44bbff 100%)',
        lines: [
          'You swim.',
          'Every stroke burns.',
          'The island grows closer.',
          'Don\'t give up.',
          'Just a little further...'
        ]
      },
      
      // Scene 9: Beach arrival
      {
        background: 'linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)',
        lines: [
          'Your hand touches sand.',
          'You crawl onto the beach.',
          'Your body collapses.',
          'The sun beats down on your back.',
          'Everything fades to black.'
        ]
      },
      
      // Scene 10: Waking up
      {
        background: 'linear-gradient(135deg, #f4e4c1 0%, #ffd89b 100%)',
        lines: [
          'How long were you out?',
          'The sun is lower now. Late afternoon.',
          'You push yourself to your knees.',
          'Your entire body aches.',
          'But you\'re alive.'
        ]
      },
      
      // Scene 11: Taking stock
      {
        background: 'linear-gradient(135deg, #ffd89b 0%, #ffb347 100%)',
        lines: [
          'You look around.',
          'A pristine beach. Untouched jungle beyond.',
          'No signs of civilization.',
          'No rescue in sight.',
          'You\'re completely alone.'
        ]
      },
      
      // Scene 12: Title reveal
      {
        background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
        lines: [
          'Welcome to paradise.',
          '',
          'HEDONISM ISLAND',
          '',
          'Your survival begins now.'
        ]
      }
    ];
  }

  show() {
    const container = document.getElementById('story-intro');
    if (!container) {
      console.error('Story intro container not found');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="vn-container">
        <div class="vn-background" id="vn-background"></div>
        <div class="vn-textbox">
          <div class="vn-text" id="vn-text"></div>
          <div class="vn-continue">▼ Click to continue</div>
        </div>
        <button class="vn-skip" id="vn-skip">Skip Intro</button>
      </div>
    `;

    this.currentScene = 0;
    this.currentLine = 0;
    this.showScene();
    this.attachEventListeners();
  }

  hide() {
    const container = document.getElementById('story-intro');
    if (container) {
      container.classList.add('hidden');
      container.innerHTML = '';
    }
    
    // Remove key listener
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  showScene() {
    if (this.currentScene >= this.scenes.length) {
      this.complete();
      return;
    }

    const scene = this.scenes[this.currentScene];
    const background = document.getElementById('vn-background');
    
    if (background) {
      background.style.backgroundColor = scene.background;
    }

    this.showLine();
  }

  showLine() {
    const scene = this.scenes[this.currentScene];
    const textEl = document.getElementById('vn-text');
    
    if (!textEl) return;

    if (this.currentLine >= scene.lines.length) {
      // Move to next scene
      this.currentScene++;
      this.currentLine = 0;
      
      if (this.currentScene >= this.scenes.length) {
        this.complete();
        return;
      }
      
      // Fade transition between scenes
      const bg = document.getElementById('vn-background');
      if (bg) {
        bg.style.opacity = '0';
        setTimeout(() => {
          this.showScene();
          bg.style.opacity = '1';
        }, 500);
      } else {
        this.showScene();
      }
      return;
    }

    const line = scene.lines[this.currentLine];
    
    // Fade in text
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = line;
      textEl.style.opacity = '1';
    }, 100);
  }

  advance() {
    this.currentLine++;
    this.showLine();
  }

  complete() {
    console.log('✅ Story intro complete');
    this.hide();
    this.gameState.emit('introComplete');
  }

  attachEventListeners() {
    const container = document.getElementById('story-intro');
    if (!container) return;

    // Click anywhere to advance
    const textbox = container.querySelector('.vn-textbox');
    if (textbox) {
      textbox.addEventListener('click', () => this.advance());
    }

    // Skip button
    const skipBtn = document.getElementById('vn-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.complete());
    }

    // Also allow spacebar/enter to advance
    this.keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.advance();
      } else if (e.key === 'Escape') {
        this.complete();
      }
    };
    
    document.addEventListener('keydown', this.keyHandler);
  }
}
