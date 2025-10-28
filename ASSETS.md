# 🎨 Hedonism Island - Asset List

## Image Assets

### Character Creation
- **Background Image**: `https://user.uploads.dev/file/b3d30050f83a4679a35851bdcf2da206.png`
  - **Type**: Tropical beach sunset background
  - **Usage**: Full-screen background for character creation wizard
  - **Implementation**: CSS background with blur overlay in `characterCreation.css`
  - **Specs**: Cover, center position, fixed attachment
  - **Effect**: 60% dark overlay + 3px blur for readability

### Metadata
- **Preview Image**: `https://user.uploads.dev/file/f35247bedf54d530f2c14b02f878f210.png`
  - **Type**: Generator preview/thumbnail
  - **Usage**: Social media sharing, generator listings
  - **Location**: `perchanceLogic.logic` $meta section

---

## Asset Guidelines

### Adding New Assets
1. Upload images to user.uploads.dev (or similar CDN)
2. Add URL to this document
3. Implement in appropriate CSS/HTML files
4. Test on multiple devices/resolutions

### Image Specifications
- **Backgrounds**: 1920x1080+ resolution, JPG or PNG
- **UI Elements**: SVG preferred, PNG fallback
- **Character Portraits**: Generated via Perchance AI (transparent background)
- **Icons**: SVG or emoji for best scaling

### Background Image Best Practices
- Use soft focus or blur for non-distracting backgrounds
- Apply dark overlay (50-70% opacity) for text readability
- Test contrast with white and green text (#4CAF50)
- Consider mobile viewport sizes

---

## Future Asset Needs
- [ ] Main menu background
- [ ] Map/island background
- [ ] UI icons (inventory, skills, etc.)
- [ ] Loading screen graphics
- [ ] Achievement badges
- [ ] Faction/group logos
