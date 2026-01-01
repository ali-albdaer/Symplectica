# Quick Start Guide

## Getting Started

1. **Open the Game**
   - Simply open `index.html` in a modern web browser
   - Chrome is recommended for best performance
   - Allow a few seconds for assets to load

2. **First Steps**
   - Click anywhere on the screen to lock mouse cursor
   - You'll spawn on Terra (the blue planet)
   - Use WASD to walk around the surface
   - Move your mouse to look around

## Essential Controls

```
┌─────────────────────────────────────────┐
│          MOVEMENT CONTROLS              │
├─────────────────────────────────────────┤
│ W/A/S/D      Move forward/left/back/right│
│ Space        Jump (or ascend in flight) │
│ Shift        Run (or descend in flight) │
│ Mouse        Look around                │
│ INS          Toggle flight mode         │
│ V            Switch camera view         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           MENU CONTROLS                 │
├─────────────────────────────────────────┤
│ /            Developer menu             │
│ F            Performance stats          │
│ ESC          Settings menu              │
└─────────────────────────────────────────┘
```

## Your First 5 Minutes

### 1. Explore the Planet (0-1 min)
- Walk around Terra's surface using WASD
- Try jumping with Space
- Notice gravity keeps you on the surface

### 2. Try Flight Mode (1-2 min)
- Press **INS** to enable free flight
- Now Space goes UP and Shift goes DOWN
- Fly up and see the planet from above

### 3. Switch Camera View (2-3 min)
- Press **V** to switch to third-person
- Notice the smooth, cinematic camera
- Press **V** again to go back to first-person

### 4. Check Performance (3-4 min)
- Press **F** to see performance metrics
- Watch your FPS (should be 60+ on decent hardware)
- See how many objects are being rendered

### 5. Open Developer Menu (4-5 min)
- Press **/** to open the dev menu
- Browse through different tabs
- Try changing the time scale to speed up orbits
- Watch planets move faster!

## Common Questions

**Q: How do I exit pointer lock?**  
A: Press ESC to open settings menu, or press ESC again to fully unlock

**Q: The controls feel too sensitive/slow**  
A: Press `/` → Player tab → Adjust "Mouse Sensitivity"

**Q: How do I see the orbital paths?**  
A: Currently hidden by default. You can toggle in future updates or modify the code

**Q: Can I go to other planets?**  
A: Yes! Enable flight mode (INS) and fly to them. They're far but reachable!

**Q: Performance is low, what should I do?**  
A: Press ESC → Change Quality Preset to "Medium" or "Low"

**Q: How do I interact with objects?**  
A: Walk/fly into them! They have physics and will react

## Pro Tips

1. **Smooth Landings**: When flying, slow down before landing by not pressing any movement keys

2. **Speed Flying**: In flight mode, move diagonally (W+D or W+A) for faster travel

3. **Third-Person Exploration**: Third-person view is great for seeing the planets while exploring

4. **Time Acceleration**: In dev menu, increase the time scale to see planets orbit faster

5. **Custom Gravity**: Try changing gravity multiplier in Physics tab for moon-like jumping

## Graphics Settings Guide

Choose based on your hardware:

- **High-End PC** (RTX 3060+, 16GB RAM): Ultra
- **Mid-Range PC** (GTX 1660, 8GB RAM): High (default)
- **Older PC** (GTX 1050, 4GB RAM): Medium
- **Laptop/Integrated Graphics**: Low

## Troubleshooting

### Black Screen
- Wait 5-10 seconds for loading
- Check browser console for errors (F12)
- Try refreshing the page

### Low FPS
- Lower quality in settings (ESC menu)
- Close other browser tabs
- Disable shadows (ESC → Shadow Quality → Disabled)

### Controls Not Working
- Click on the game window to focus
- Check if a menu is open (/, ESC)
- Try refreshing the page

### Objects Falling Through Planet
- This is a physics edge case with very fast movement
- Try reducing time scale in dev menu
- Or reload the page

## Next Steps

Once comfortable with basics:

1. **Experiment with Physics**
   - Open dev menu (/)
   - Go to Physics tab
   - Try different gravity multipliers
   - Watch how objects behave differently

2. **Visit Other Planets**
   - Enable flight mode
   - Fly toward the red planet (Ares)
   - Or visit the gray Moon
   - Each has different gravity

3. **Play with Objects**
   - Find the colored objects near spawn
   - Push them around
   - Throw them by running into them
   - Watch them bounce and roll

4. **Create Your Own Solar System**
   - Modify planet sizes in dev menu
   - Change orbital speeds
   - Adjust distances
   - Make your perfect system!

## Performance Metrics Explained

When you press **F**, you'll see:

- **FPS**: Frames per second (60 is ideal)
  - Green = Great (60+)
  - Orange = OK (45-60)
  - Red = Needs optimization (<45)

- **Frame Time**: Milliseconds per frame (lower is better)
  - ~16ms = 60 FPS
  - ~33ms = 30 FPS

- **Objects**: Total objects in scene
- **Draw Calls**: Rendering batches (lower is better)

## Have Fun!

This is a sandbox - there's no wrong way to play!

Try different things, break the physics, explore the universe, and most importantly, enjoy the journey through space! 🚀🌍🌙

---

For detailed documentation, see README.md
For technical details, check the source code comments
