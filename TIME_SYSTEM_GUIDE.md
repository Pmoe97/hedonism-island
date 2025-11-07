# Real-Time System Guide (v4.0.0)

## Overview
The game now uses a **real-time system** instead of turn-based energy management. Time flows continuously and can be controlled by the player.

---

## Time Mechanics

### Time Flow
- **1 real second = 1 game minute** at 1x speed
- Time advances continuously (when not paused)
- Day/night cycles automatically progress
- 24-hour clock (0-23 hours, 0-59 minutes)

### Time Controls
**Location:** Top-right corner of screen

**Speed Options:**
- **⏸️ Pause** - Time stops completely (Space bar)
- **1x** - Normal speed (1 real sec = 1 game min) - Key: 1
- **10x** - Fast (1 real sec = 10 game min) - Key: 2
- **20x** - Very Fast (1 real sec = 20 game min) - Key: 3
- **100x** - Ultra Fast (1 real sec = 100 game min) - Key: 4

**Keyboard Shortcuts:**
- `Space` - Toggle pause/play
- `1` - Set to 1x speed
- `2` - Set to 10x speed
- `3` - Set to 20x speed
- `4` - Set to 100x speed

---

## Stat Changes

### Removed: Energy System ❌
- No more energy bar
- No energy costs for actions
- No energy regeneration
- No turn-based gameplay

### Added: Passive Stat Drain ✅
Stats decrease naturally over time:
- **Hunger**: -2 per hour
- **Thirst**: -3 per hour
- **Sanity**: +0.5 per hour (recovers slowly)

**Critical Thresholds:**
- Stats at 0 = critical condition
- Health = 0 = death
- Low hunger/thirst = skill penalties

---

## Action Durations

### Travel
**Duration:** 5-15 minutes (in-game time)
- Varies by terrain type
- Discovery state (undiscovered takes longer)
- Elevation changes increase time
- Player-owned territory = faster travel

**Terrain Examples:**
- Beach/Plains: ~7 minutes
- Forest: ~10 minutes
- Mountain: ~13 minutes
- Undiscovered: ~15 minutes

### Resource Gathering
**Duration:** 15-45 minutes (in-game time)
- **Trees**: ~30 minutes base
- **Rocks**: ~40 minutes base
- **Berries**: ~15 minutes base

**Modifiers:**
- Skill level reduces duration (-2 min per 10 skill)
- Better tools reduce duration (rare = -5min, epic = -8min)
- Node quality affects duration (rich nodes = -10%)

### Crafting
**Duration:** 30 minutes - 6 hours (in-game time)
- **Easy recipes**: ~30 minutes
- **Medium recipes**: ~1 hour
- **Hard recipes**: ~2 hours
- **Expert recipes**: ~4 hours

**Modifiers:**
- Skill level reduces duration (-5 min per 10 skill)
- Better tools reduce duration (rare = -10min, legendary = -30min)

---

## Time of Day Effects

### Dawn (5:00 - 7:00)
- Visibility improving
- Animals becoming active

### Morning (7:00 - 12:00)
- Full visibility
- Best time for gathering

### Afternoon (12:00 - 17:00)
- Full visibility
- Peak temperature

### Evening (17:00 - 20:00)
- Visibility decreasing
- Prepare for night

### Night (20:00 - 5:00)
- Reduced visibility
- Increased danger
- Slower movement

---

## Strategy Tips

### Time Management
1. **Use speed controls** - Speed up travel/gathering with 10x or 20x
2. **Pause for planning** - Pause while deciding what to do next
3. **Watch your stats** - They drain continuously, plan accordingly
4. **Night preparation** - Gather resources before nightfall

### Efficient Gameplay
- **Batch activities** - Do multiple gathers in one area
- **Upgrade tools** - Better tools = faster actions
- **Level skills** - Higher skills = faster completion
- **Manage hunger/thirst** - Keep food/water available

### Time Speed Recommendations
- **1x**: Combat, careful exploration, story events
- **10x**: Normal gameplay, resource gathering
- **20x**: Fast travel, waiting for day/night
- **100x**: Skipping time, long-distance travel
- **Pause**: Inventory management, crafting decisions, reading

---

## Technical Details

### Save System
- Saves now include time control state (v4.0.0)
- Old saves (v3.0.0 and earlier) are **not compatible**
- Time speed and pause state are preserved on save/load

### Game Loop
- Updates run at 60 FPS (real-time)
- Time advancement calculated based on delta time
- All systems synchronized to game time clock

### Events
Time-based events trigger at specific intervals:
- **Hourly**: Stat drain, time of day checks
- **Daily**: New day events, territory updates
- **Custom**: Quest timers, NPC schedules (future)

---

## Migration from v3.0.0

### What Changed
- **Removed**: Turn-based system, End Turn button, Energy system
- **Added**: Real-time loop, Time controls, Passive stat drain
- **Updated**: All actions now use duration instead of energy cost

### For Existing Players
- Old saves cannot be loaded in v4.0.0
- Start a new game to experience the real-time system
- Time controls appear top-right corner
- Use keyboard shortcuts for quick speed changes

---

## Future Enhancements (Planned)

- [ ] NPC movement/schedules based on time
- [ ] Weather system with time-based patterns
- [ ] Day/night visual effects
- [ ] Time-based random events
- [ ] Circadian rhythm effects on player stats
- [ ] Seasonal changes (long-term time progression)

---

## Troubleshooting

**Time not advancing:**
- Check if game is paused (pause button active)
- Verify time control UI is visible
- Try setting speed to 1x

**Stats draining too fast:**
- This is normal - passive drain over time
- Keep food/water available
- Consider reducing time speed

**Can't complete action:**
- Check if you have required tools
- Verify skill requirements
- Ensure you have resources (for crafting)

---

*Last Updated: v4.0.0 - Real-Time System Implementation*
