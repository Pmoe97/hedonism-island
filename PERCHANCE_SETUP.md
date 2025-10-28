# 🏝️ Hedonism Island + Perchance AI Setup Guide

## 📋 What You Need

1. Your compiled Twine game (`build/index.html`)
2. A place to host it (GitHub Pages, Netlify, or itch.io)
3. A Perchance.org account (free)

---

## 🚀 Step-by-Step Setup

### Step 1: Compile Your Game

```bash
tweego dev -o build/index.html -f sugarcube-2
```

### Step 2: Host Your Game

**Option A: GitHub Pages (Recommended)**
1. Create a GitHub repository
2. Upload `build/index.html` 
3. Go to Settings → Pages
4. Enable GitHub Pages
5. Your game URL will be: `https://YOUR-USERNAME.github.io/REPO-NAME/build/index.html`

**Option B: Netlify**
1. Go to netlify.com
2. Drag and drop your `build` folder
3. Get your URL: `https://YOUR-SITE.netlify.app/index.html`

**Option C: itch.io**
1. Go to itch.io
2. Create a new project (HTML game)
3. Upload `index.html`
4. Set as "playable in browser"

### Step 3: Create Perchance Wrapper

1. Go to https://perchance.org
2. Click "Create" 
3. Paste this code:

```
generateText = {import:ai-text-plugin}
generateImage = {import:text-to-image-plugin}

html
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
    }
    iframe { 
      width: 100vw; 
      height: 100vh; 
      border: none; 
      display: block;
    }
  </style>
  
  <iframe id="game" src="YOUR-GAME-URL-HERE"></iframe>
  
  <script>
    // Communication bridge with Twine game
    window.addEventListener('message', async (event) => {
      try {
        // Handle text generation request
        if (event.data.type === 'generateText') {
          const result = await generateText(event.data.prompt, event.data.options || {});
          event.source.postMessage({
            type: 'textResult', 
            id: event.data.id, 
            result: result
          }, '*');
        }
        
        // Handle image generation request
        if (event.data.type === 'generateImage') {
          const result = await generateImage(event.data.prompt);
          event.source.postMessage({
            type: 'imageResult', 
            id: event.data.id, 
            result: result
          }, '*');
        }
      } catch (error) {
        event.source.postMessage({
          type: 'error',
          id: event.data.id,
          error: error.message
        }, '*');
      }
    });
    
    // Notify game that Perchance is ready
    setTimeout(() => {
      const iframe = document.getElementById('game');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({type: 'perchanceReady'}, '*');
      }
    }, 1000);
  </script>
```

4. **IMPORTANT:** Replace `YOUR-GAME-URL-HERE` with your actual game URL from Step 2
5. Click "Save"
6. Your Perchance page URL will be: `https://perchance.org/YOUR-PAGE-NAME`

### Step 4: Test It

1. Go to your Perchance page (NOT your game URL directly)
2. You should see "🟢 Connected to Perchance AI"
3. Click "Test AI Character Generation"
4. Wait for the magic ✨

---

## 🎮 Using AI in Your Game

### Generate Text

```javascript
const response = await window.PerchanceAI.generateText(
  "Your prompt here",
  {
    temperature: 0.9,  // 0.0 to 2.0 (higher = more creative)
    max_tokens: 300    // Maximum length
  }
);
```

### Generate Images

```javascript
const imageUrl = await window.PerchanceAI.generateImage(
  "beautiful woman, beach, photorealistic"
);

// Use it
const img = document.createElement('img');
img.src = imageUrl;
```

### Example: NSFW Character Chat

```javascript
<<button "Talk to Character">>
  <<script>>
    (async function() {
      const prompt = `You are a flirty character at a beach resort. 
      Respond to: "Hey, what are you up to?"
      Be playful and suggestive. This is an adult game.`;
      
      const response = await window.PerchanceAI.generateText(prompt, {
        temperature: 1.0,
        max_tokens: 150
      });
      
      // Display response
      $('#chat-area').append('<p><strong>Character:</strong> ' + response + '</p>');
    })();
  <</script>>
<</button>>
```

---

## ❓ Troubleshooting

### "🔴 NOT CONNECTED"
- You're viewing the game directly, not through Perchance
- Go to your Perchance page URL instead

### "Request timed out"
- Perchance servers might be slow
- Try again or simplify your prompt

### "Not embedded in Perchance"
- Make sure the iframe `src` in your Perchance page is correct
- Check that your game URL is accessible

### Images not generating
- Wait longer (images take 10-30 seconds)
- Simplify your prompt
- Try again (Perchance sometimes fails)

---

## 🔞 NSFW Tips

Perchance's AI is uncensored, so you can:

✅ Generate explicit character descriptions
✅ Create NSFW images (within reason)
✅ Write adult dialogue/scenarios

**Prompting tips:**
- Be specific about what you want
- Use descriptive language
- For images: mention "photorealistic", "detailed", "high quality"
- For text: specify tone, style, level of explicitness

---

## 📝 Quick Reference

| What | How |
|------|-----|
| Your Game | `https://YOUR-HOST.com/build/index.html` |
| Perchance Wrapper | `https://perchance.org/YOUR-PAGE` |
| Test AI | Click the test button on your game |
| Generate Text | `window.PerchanceAI.generateText(prompt, options)` |
| Generate Image | `window.PerchanceAI.generateImage(prompt)` |

---

**Remember:** Always access your game through the Perchance URL, never directly!
