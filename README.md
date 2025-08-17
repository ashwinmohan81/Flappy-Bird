# Flappy Bird Game

A simple Flappy Bird game built with React using modern hooks and game mechanics.

## Features

- **Simple Controls**: Click or press Space to make the bird jump
- **Procedural Pipes**: Randomly generated pipes with consistent gaps
- **Score Tracking**: Real-time score display and final score on game over
- **Responsive Design**: Works on both desktop and mobile devices
- **Smooth Gameplay**: 60 FPS game loop with proper collision detection

## How to Play

1. **Start**: Click anywhere in the game area or press Space to begin
2. **Control**: Click or press Space to make the bird flap upward
3. **Objective**: Navigate through the pipes without hitting them
4. **Scoring**: Each pipe you pass gives you 1 point
5. **Game Over**: Hit a pipe or go out of bounds to end the game
6. **Restart**: Click "Play Again" to start a new game

## Technical Implementation

- **React Hooks**: Uses `useState`, `useEffect`, and `useCallback` for state management
- **Game Loop**: 20ms interval for smooth 50 FPS gameplay
- **Physics**: Simple gravity and velocity system
- **Collision Detection**: Precise hitbox calculations for pipes and bird
- **Responsive Design**: CSS Grid and Flexbox for cross-device compatibility

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Enjoy the game!

## Game Constants

- Bird size: 38x28 pixels
- Game area: 500x500 pixels
- Pipe width: 52 pixels
- Pipe gap: 150 pixels
- Gravity: 0.5 pixels/frame²
- Jump speed: -8 pixels/frame

## Future Enhancements

- Sound effects and background music
- High score persistence
- Different bird skins
- Power-ups and obstacles
- Multiplayer support
