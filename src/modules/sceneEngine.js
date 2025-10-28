/**
 * Scene Engine - Handles story flow, choices, and rendering
 */
export class SceneEngine {
  constructor(scenes, aiProvider) {
    this.scenes = scenes;
    this.ai = aiProvider;
    this.currentScene = 'start';
    this.state = {
      variables: {},
      inventory: [],
      characters: {}
    };
  }
  
  start() {
    this.renderScene(this.currentScene);
  }
  
  renderScene(sceneId) {
    const scene = this.scenes[sceneId];
    if (!scene) {
      console.error(`Scene "${sceneId}" not found`);
      return;
    }
    
    const sceneContainer = document.getElementById('scene-container');
    const choicesContainer = document.getElementById('choices-container');
    
    // Clear previous content
    sceneContainer.innerHTML = '';
    choicesContainer.innerHTML = '';
    
    // Render scene text
    const textEl = document.createElement('div');
    textEl.innerHTML = this.processText(scene.text);
    sceneContainer.appendChild(textEl);
    
    // Add image if present
    if (scene.image) {
      this.renderImage(sceneContainer, scene.image);
    }
    
    // Render choices
    if (scene.choices) {
      scene.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.onclick = () => this.makeChoice(choice);
        choicesContainer.appendChild(button);
      });
    }
    
    // AI generation buttons
    if (scene.aiGenerate) {
      this.addAIButtons(choicesContainer, scene.aiGenerate);
    }
  }
  
  processText(text) {
    // Simple variable substitution
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return this.state.variables[varName] || match;
    });
  }
  
  renderImage(container, imageConfig) {
    const imgEl = document.createElement('img');
    imgEl.src = imageConfig.url || imageConfig;
    imgEl.alt = imageConfig.alt || 'Scene image';
    imgEl.style.maxWidth = '100%';
    imgEl.style.borderRadius = '8px';
    imgEl.style.marginTop = '20px';
    container.appendChild(imgEl);
  }
  
  addAIButtons(container, config) {
    if (config.text) {
      const btn = document.createElement('button');
      btn.className = 'choice-button';
      btn.textContent = '✨ Generate Text';
      btn.onclick = async () => {
        btn.textContent = '⏳ Generating...';
        btn.disabled = true;
        try {
          const result = await this.ai.generateText(config.text.prompt, config.text.options);
          alert(result); // Simple display for now
        } catch (e) {
          alert('Error: ' + e);
        }
        btn.disabled = false;
        btn.textContent = '✨ Generate Text';
      };
      container.appendChild(btn);
    }
    
    if (config.image) {
      const btn = document.createElement('button');
      btn.className = 'choice-button';
      btn.textContent = '🎨 Generate Image';
      btn.onclick = async () => {
        btn.textContent = '⏳ Generating...';
        btn.disabled = true;
        try {
          const imageUrl = await this.ai.generateImage(config.image.prompt);
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.borderRadius = '8px';
          img.style.marginTop = '20px';
          document.getElementById('scene-container').appendChild(img);
        } catch (e) {
          alert('Error: ' + e);
        }
        btn.disabled = false;
        btn.textContent = '🎨 Generate Image';
      };
      container.appendChild(btn);
    }
  }
  
  makeChoice(choice) {
    // Execute action if present
    if (choice.action) {
      this.executeAction(choice.action);
    }
    
    // Navigate to next scene
    if (choice.next) {
      this.currentScene = choice.next;
      this.renderScene(choice.next);
    }
  }
  
  executeAction(action) {
    // Simple action executor
    if (action.setVariable) {
      Object.assign(this.state.variables, action.setVariable);
    }
    if (action.addItem) {
      this.state.inventory.push(action.addItem);
    }
  }
}
