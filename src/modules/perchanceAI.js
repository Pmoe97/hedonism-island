/**
 * Perchance AI Integration
 * Direct plugin access - no bridge needed, Perchance handles it automatically
 */
export class PerchanceAI {
  constructor() {
    this.isReady = true; // Always ready since Perchance handles plugins automatically
    console.log('✅ Perchance AI Ready');
    this.debugPerchanceAvailability();
  }
  
  /**
   * Debug helper to check what Perchance functions are available
   */
  debugPerchanceAvailability() {
    const checks = {
      'window.generateImage': typeof window.generateImage,
      'window.generateText': typeof window.generateText,
      'window.kv': typeof window.kv,
      'globalThis.generateImage': typeof globalThis.generateImage,
      'globalThis.generateText': typeof globalThis.generateText
    };
    
    console.group('🔍 Perchance Availability Check');
    for (const [key, type] of Object.entries(checks)) {
      const icon = type === 'function' || type === 'object' ? '✅' : '❌';
      console.log(`${icon} ${key}: ${type}`);
    }
    
    // List all window properties that contain 'generate'
    const generateProps = Object.keys(window).filter(k => k.toLowerCase().includes('generate'));
    if (generateProps.length > 0) {
      console.log('📋 Window properties containing "generate":', generateProps);
    }
    
    console.groupEnd();
  }
  
  /**
   * Generate text using ai-text-plugin
   * @param {string} prompt - The instruction for text generation
   * @param {object} options - Optional parameters (temperature, max_tokens, etc.)
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      // Direct call to Perchance generateText plugin
      const result = await window.generateText(prompt, options);
      return result;
    } catch (error) {
      console.error('Text generation failed:', error);
      throw new Error(`Failed to generate text: ${error.message}`);
    }
  }

  /**
   * Extract text from Perchance AI response
   * Removes metadata, formatting tokens, and unwanted wrappers
   * @param {*} response - Raw response from generateText
   * @returns {string} Clean text content
   */
  extractText(response) {
    if (!response) return '';
    
    // If response is object with text/content property
    if (typeof response === 'object') {
      return response.text || response.content || String(response);
    }
    
    let text = String(response);
    
    // Remove Perchance internal tokens
    text = text.replace(/\[output\d*\]/gi, '');
    text = text.replace(/\[\/output\]/gi, '');
    text = text.replace(/\[comment\].*?\[\/comment\]/gi, '');
    
    // Remove common AI metadata patterns
    text = text.replace(/^(Assistant:|AI:|Response:)\s*/i, '');
    
    return text.trim();
  }

  /**
   * Sanitize NPC dialogue response
   * Based on proven patterns from Office Clicker
   * @param {string} rawResponse - Raw AI output
   * @param {object} npc - NPC object for context
   * @returns {string} Sanitized dialogue
   */
  sanitizeNpcResponse(rawResponse, npc = null) {
    let text = this.extractText(rawResponse);
    
    // Remove common unwanted patterns
    const unwantedPatterns = [
      // Meta-commentary
      /\(.*?thinks.*?\)/gi,
      /\(.*?feels.*?\)/gi,
      /\*.*?internally.*?\*/gi,
      
      // Narration
      /^(He|She|They)\s+(said|says|replies|responds|asks|whispers|shouts)/gi,
      /\*\*[^*]+\*\*/g, // Remove **bold** narration
      /\*[^*]+\*/g, // Remove *italic* actions
      
      // Meta instructions that leaked through
      /\[.*?INST.*?\]/gi,
      /\[.*?SYS.*?\]/gi,
      /<\|.*?\|>/gi,
    ];
    
    for (const pattern of unwantedPatterns) {
      text = text.replace(pattern, '');
    }
    
    // Remove cringe theatrical phrases (but allow normal ellipses)
    const cringePhrases = [
      /\bheh\b\.?/gi,
      /\.{4,}/g, // Only remove REALLY excessive ellipses (4+), allow normal "..." or ".."
    ];
    
    for (const phrase of cringePhrases) {
      text = text.replace(phrase, '...');
    }
    
    // Only remove outer quotes if the ENTIRE response is a single quoted string
    // This preserves dialogue that contains multiple quoted segments
    const trimmed = text.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.indexOf('"', 1) === trimmed.length - 1) {
      // Only one pair of quotes wrapping everything
      text = trimmed.slice(1, -1);
    } else if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.indexOf("'", 1) === trimmed.length - 1) {
      // Single quotes wrapping everything
      text = trimmed.slice(1, -1);
    }
    
    // Limit response length (prevent rambling)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const maxSentences = 3;
    if (sentences.length > maxSentences) {
      text = sentences.slice(0, maxSentences).join(' ');
    }
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Ensure first letter is capitalized
    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    
    // Ensure ends with punctuation
    if (text && !/[.!?]$/.test(text)) {
      text += '.';
    }
    
    return text;
  }

  /**
   * Build conversation history for context
   * @param {Array} history - Array of {speaker, message, timestamp} objects
   * @param {number} maxMessages - Maximum messages to include
   * @returns {string} Formatted history
   */
  buildConversationHistory(history, maxMessages = 5) {
    if (!history || history.length === 0) return '';
    
    const recent = history.slice(-maxMessages);
    const formatted = recent.map(entry => {
      const speaker = entry.speaker === 'player' ? 'Player' : entry.npcName || 'NPC';
      return `${speaker}: "${entry.message}"`;
    }).join('\n');
    
    return formatted;
  }

  /**
   * Analyze response for repetition issues
   * @param {string} response - AI response
   * @param {Array} recentResponses - Recent NPC responses
   * @returns {boolean} True if response seems repetitive
   */
  analyzeResponseForRepetition(response, recentResponses = []) {
    if (!response || recentResponses.length === 0) return false;
    
    const normalized = response.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    // Check for exact duplicates
    for (const recent of recentResponses) {
      const recentNormalized = recent.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      if (normalized === recentNormalized) return true;
      
      // Check for high similarity (>70% same words)
      const words1 = new Set(normalized.split(/\s+/));
      const words2 = new Set(recentNormalized.split(/\s+/));
      const intersection = new Set([...words1].filter(w => words2.has(w)));
      const similarity = intersection.size / Math.max(words1.size, words2.size);
      if (similarity > 0.7) return true;
    }
    
    return false;
  }

  /**
   * Get variation strategy based on conversation state
   * @param {object} npc - NPC object
   * @param {string} context - Current context
   * @returns {string} Strategy instruction
   */
  getVariationStrategy(npc, context = '') {
    const strategies = [
      'Try a different emotional tone',
      'Reference a different aspect of your personality',
      'Use a different conversational style (formal/casual)',
      'Focus on a different topic',
      'Express a contrasting opinion or mood'
    ];
    
    // Rotate through strategies based on conversation count
    const index = (npc.relationships?.player?.interactionCount || 0) % strategies.length;
    return strategies[index];
  }

  /**
   * Calculate temperature for regeneration attempts
   * @param {number} attemptNumber - Current regeneration attempt
   * @returns {number} Temperature value
   */
  getRegenerationTemperature(attemptNumber = 0) {
    // Start at 0.7, increase by 0.1 per attempt, cap at 1.0
    return Math.min(0.7 + (attemptNumber * 0.1), 1.0);
  }
  
  /**
   * Generate image using text-to-image-plugin
   * @param {string|object} promptInput - The image description (string) or prompt object
   * @returns {Promise<string>} Image URL or data URI
   */
  async generateImage(promptInput) {
    try {
      // Perchance's generateImage is added to window by the plugin system
      // Access it directly from window (bundled code is in module scope)
      const generateImageFn = window.generateImage;
      
      if (typeof generateImageFn !== 'function') {
        console.warn('❌ Perchance generateImage not found on window');
        console.warn('📋 Available window properties with "generate":', 
          Object.keys(window).filter(k => k.toLowerCase().includes('generate')));
        return this.getPlaceholderImage();
      }
      
      console.log('✅ Calling window.generateImage with:', 
        typeof promptInput === 'object' ? promptInput.prompt?.slice(0, 60) : String(promptInput).slice(0, 60));
      
      // Call Perchance's image plugin
      // According to docs: accepts string or { prompt: "..." } object
      // Returns either a URL string or a String object with extra properties
      const result = await generateImageFn(promptInput);
      
      // Extract the actual URL (result might be a String object with .dataUrl property)
      const imageUrl = result?.dataUrl || result?.toString() || result;
      
      console.log('✅ Image generated:', imageUrl ? (String(imageUrl).slice(0, 60) + '...') : 'null');
      return imageUrl;
    } catch (error) {
      console.error('❌ Image generation error:', error);
      console.warn('Falling back to placeholder');
      return this.getPlaceholderImage();
    }
  }
  
  /**
   * Generate placeholder image when Perchance is unavailable
   * @returns {string} Data URI for placeholder SVG
   */
  getPlaceholderImage() {
    // Tropical-themed placeholder with transparent background
    const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#grad)" opacity="0.3"/>
      <text x="200" y="180" font-family="Arial, sans-serif" font-size="120" fill="#4CAF50" text-anchor="middle" font-weight="bold">?</text>
      <text x="200" y="250" font-family="Arial, sans-serif" font-size="24" fill="#fff" text-anchor="middle">Portrait Coming Soon</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Save data persistently using kv-plugin
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  async saveData(key, value) {
    try {
      await window.kv.set(key, value);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  }

  /**
   * Load data from kv-plugin
   * @param {string} key - Storage key
   * @returns {Promise<any>} Stored value
   */
  async loadData(key) {
    try {
      return await window.kv.get(key);
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }

  /**
   * Generate character profile with AI
   * @param {string} faction - castaway, islander, mercenary, tourist
   * @param {string} gender - Gender from settings
   * @returns {Promise<object>} Character profile
   */
  async generateCharacter(faction, gender) {
    const genderLabel = {
      female: 'woman',
      male: 'man',
      futanari: 'futanari',
      transWoman: 'trans woman',
      transMale: 'trans man'
    }[gender] || 'person';

    const factionDesc = {
      castaway: 'a fellow castaway who washed up on the island',
      islander: 'a native islander, initially cautious of outsiders',
      mercenary: 'a Blacksteel mercenary, hostile and dangerous',
      tourist: 'a tourist visiting the island resort'
    }[faction] || 'a person';

    const prompt = `Generate a detailed character profile for ${genderLabel} who is ${factionDesc}. Include:
- Name (first and last)
- Age (18-45)
- Physical description (2-3 sentences, be explicit and detailed)
- Personality traits (3-4 traits)
- Background story (2-3 sentences)
- Sexual preferences/kinks (2-3, be explicit)
- Skills (2-3 relevant skills)

Format as JSON with keys: name, age, description, personality, background, kinks, skills (array).`;

    try {
      const response = await this.generateText(prompt, { 
        temperature: 0.9,
        max_tokens: 500 
      });
      
      // Parse AI response as JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse character data');
      }
    } catch (error) {
      console.error('Character generation failed:', error);
      // Fallback to basic character
      return {
        name: `${gender} ${faction}`,
        age: 25,
        description: 'A mysterious person.',
        personality: ['friendly', 'adventurous'],
        background: 'Their past is unknown.',
        kinks: ['vanilla'],
        skills: ['survival']
      };
    }
  }

  /**
   * Apply consistent art style to image prompts
   * Based on user's settings preference
   * @param {string} basePrompt - Base image description
   * @returns {object} Prompt object for generateImage
   */
  applyImageStyle(basePrompt) {
    // Get user's style preference from game state
    const selectedStyle = window.gameState?.settings?.imageStyle || 'photorealistic';
    
    // Define style directives (from Perchance reference guide)
    const styleDirectives = {
      photorealistic: "photorealistic, highly detailed, 8k quality, professional photography, natural lighting, sharp focus, realistic textures",
      anime: "anime style, manga aesthetic, cel shaded, vibrant colors, clean lines, Japanese animation style, expressive features",
      artistic: "artistic style, painterly aesthetic, impressionist, brush strokes, artistic interpretation, creative composition, gallery quality",
      cartoon: "cartoon style, comic book aesthetic, bold outlines, simplified shapes, bright colors, animated style, character illustration",
      cinematic: "cinematic lighting, movie scene, dramatic composition, film quality, depth of field, atmospheric, professional cinematography"
    };
    
    const directive = styleDirectives[selectedStyle] || styleDirectives.photorealistic;
    
    // Check if style already applied (prevent duplicates)
    const hasStyle = basePrompt.toLowerCase().includes(selectedStyle.toLowerCase());
    
    // Return prompt object (Perchance format)
    const styledPrompt = hasStyle ? basePrompt : `${basePrompt}, ${directive}`;
    
    console.log(`[Image Style] Selected: ${selectedStyle}`);
    
    return { prompt: styledPrompt };
  }

  /**
   * Generate character portrait image
   * @param {object} character - Character object
   * @param {string} styleOverride - Optional style override
   * @returns {Promise<string>} Portrait URL
   */
  async generatePortrait(character, styleOverride = null) {
    // Build detailed character description from appearance
    const appearance = character.appearance || {};
    const body = appearance.body || {};
    const face = appearance.face || {};
    const hair = appearance.hair || {};
    
    // Construct detailed prompt for theme-appropriate tropical island character
    const genderDesc = {
      female: 'woman',
      male: 'man',
      futanari: 'futanari',
      Cuntboy: 'Cuntboy',
      other: 'person'
    }[character.gender] || 'person';
    
    const buildDesc = {
      petite: 'petite, slender build',
      slim: 'slim, athletic build',
      average: 'average build',
      athletic: 'athletic, toned build',
      curvy: 'curvy, voluptuous build',
      muscular: 'muscular, powerful build',
      heavyset: 'heavyset, robust build'
    }[body.build] || 'average build';
    
    const skinDesc = body.skinTone || 'fair skin';
    const hairDesc = `${hair.length || 'medium'} ${hair.color || 'brown'} hair${hair.style ? ', ' + hair.style : ''}`;
    const eyeDesc = `${face.eyeColor || 'brown'} eyes`;
    
    // Age and height details
    const ageDesc = character.age ? `${character.age} years old` : 'young adult';
    const heightDesc = body.height ? `, ${body.height}cm tall` : '';
    
    // Build base prompt with transparent background request built into the prompt text
    const basePrompt = `Portrait of a ${genderDesc}, ${ageDesc}, ${buildDesc}, ${skinDesc}, ${hairDesc}, ${eyeDesc}${heightDesc}, attractive face, confident expression, tropical island vacation attire, isolated on transparent background, profile portrait, studio lighting`;
    
    // Apply global style system
    const styledPrompt = this.applyImageStyle(basePrompt);
    
    console.log('[Portrait] Generating with prompt:', styledPrompt.prompt.slice(0, 100) + '...');
    
    return await this.generateImage(styledPrompt);
  }

  // Generate image from custom prompt (used by character creator)
  async generateImageFromPrompt(prompt, styleOverride = null) {
    // Apply style system to the prompt
    const styledPrompt = this.applyImageStyle(prompt);
    
    console.log('[Custom Portrait] Generating with prompt:', styledPrompt.prompt.slice(0, 150) + '...');
    
    return await this.generateImage(styledPrompt);
  }
}

