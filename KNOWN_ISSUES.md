# Known Issues & Next Steps

## 🐛 Critical Issues to Fix

### Player Position Detection
**Status**: In Progress  
**Priority**: High  
**Description**: Player location detection for movement isn't working reliably. Some adjacent hexes report as "too far to travel" even though they should be accessible.

**Current Debugging**:
- Added extensive logging to TravelSystem.canTravelTo()
- Fixed hex distance calculation from Manhattan to proper max(dq, dr, ds)
- Changed threshold from distance > 2 to distance > 1
- Territory initialization fixed (was using tile.type instead of tile.terrain)

**Next Steps**:
- Review console logs during gameplay to see exact distance calculations
- Verify that territoryManager.getTerritory() is finding all adjacent territories
- Check if fog of war is preventing movement (territories must be discovered)
- Test if the issue is with click detection vs movement validation
- Consider adding visual debug layer showing which hexes are actually clickable

**Possible Root Causes**:
1. Fog of war preventing movement to undiscovered territories
2. Territory lookup failing for some coordinates
3. Canvas coordinate to hex coordinate conversion issue
4. Player position not being updated correctly after movement

### Beach Spawning
**Status**: Mostly Working  
**Priority**: Medium  
**Description**: Player should always spawn on a beach tile but occasionally spawns elsewhere.

**Current State**:
- Filters for `terrain === 'beach' && isLand`
- Picks beach closest to center
- Falls back to any passable land if no beaches found
- Added logging to show selected position

**Next Steps**:
- Verify beach tiles are being created correctly during map generation
- Check if beachTiles.length === 0 frequently
- May need to adjust beach generation parameters in MapEngine

## ✅ Recently Fixed

- ✅ Island size increased to 40x40 (was 15x15, then 25x25)
- ✅ Resource node creation during travel discoveries (proper config objects)
- ✅ Save/load system (node configs, save data structure)
- ✅ Territory terrain property (was using tile.type, now uses tile.terrain)
- ✅ Hex distance calculation (proper formula)
- ✅ Initial visibility range (increased from 1 to 2)

## 🎯 Upcoming Features

### Immediate (This Week)
1. Fix player movement detection
2. Improve fog of war visibility
3. Polish starting area spawning

### Short Term (Next Week)
1. Implement survival mechanics
   - Hunger/thirst depletion over time
   - Weather system (rain, storms, heat)
   - Temperature effects
   - Sleep requirements

2. Early game content
   - Tutorial integration
   - Day 1-7 progression
   - First resource gathering tutorial
   - Basic crafting introduction

### Medium Term (2-3 Weeks)
1. NPC System
   - NPC class with stats and inventory
   - Perchance AI personality generation
   - Relationship system
   - Dialogue trees with moral choices
   - Daily schedules and behaviors

2. Combat System
   - Turn-based or real-time combat
   - Weapon types and combat skills
   - Enemy AI
   - Faction battles

### Long Term (1+ Month)
1. Quest System
2. Building/Shelter system
3. Advanced crafting (tool durability, quality tiers)
4. Food spoilage and preservation
5. Advanced NPC interactions (trading, alliances)
6. End game content

## 📊 Performance Notes

### Current Performance
- Island generation: ~100ms for 1,200 hexes
- Render loop: 60 FPS
- Bundle size: 498 KB (102 KB gzipped)

### Optimization Opportunities
- Territory fog rendering could be cached
- Resource node rendering could use sprite batching
- Consider worker thread for map generation
- Implement viewport culling for large islands

## 🧪 Testing Checklist

### Before Each Commit
- [ ] npm run build succeeds
- [ ] No console errors on page load
- [ ] Character creation works
- [ ] Story intro plays
- [ ] Island generates successfully
- [ ] Player spawns on map
- [ ] Can open inventory (I key)
- [ ] Can open crafting (C key)
- [ ] Can open skills (K key)
- [ ] Movement works (click adjacent hexes)
- [ ] Resource gathering works
- [ ] Crafting produces items

### Full Integration Test
- [ ] Create new character
- [ ] Complete story intro
- [ ] Spawn on beach
- [ ] Move around map
- [ ] Discover new territories
- [ ] Find resource nodes
- [ ] Gather resources
- [ ] Craft basic tools
- [ ] Save game
- [ ] Load game
- [ ] Resume from save

## 🔧 Debug Commands

Open console and type:
```javascript
// Check player position
game.player.position

// Check current territory
game.territoryManager.getTerritory(game.player.position.q, game.player.position.r)

// Check adjacent territories
game.territoryManager.getAdjacentTerritories(game.player.position.q, game.player.position.r)

// Check if can travel to position
game.travelSystem.canTravelTo(q, r)

// Force move player
game.player.position = { q: 0, r: 0 }
game.travelSystem.setPosition(0, 0)
game.gameView.renderPlayerMarker()

// List all resource nodes
game.resourceNodeManager.nodes

// Get nodes at position
game.resourceNodeManager.getNodesAt(q, r)
```

## 📝 Notes for Tomorrow

1. Start session by creating a new game and checking console logs
2. Test movement thoroughly - try clicking every adjacent hex
3. Document exact error messages and coordinates
4. May need to add visual debug overlay showing:
   - Player actual position
   - Adjacent hex coordinates
   - Territory ownership
   - Fog of war state
   - Clickable areas

5. Consider removing extensive logging once issues are fixed

---

Last Updated: October 27, 2025  
Current Version: v2.0.0  
Next Session Focus: Player movement detection fix
