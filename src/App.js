import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const BIRD_HEIGHT = 28;
const BIRD_WIDTH = 38;
const PIPE_WIDTH = 52;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_SPEED = -8;
const INITIAL_PIPE_SPEED = 2;
const MAX_PIPE_SPEED = 6;
const DIFFICULTY_INCREASE_INTERVAL = 10000; // 10 seconds

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameStarted, setGameStarted] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clouds, setClouds] = useState([]);
  const [lives, setLives] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pipeSpeed, setPipeSpeed] = useState(INITIAL_PIPE_SPEED);
  const [gameDimensions, setGameDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Audio setup
  useEffect(() => {
    const audio = new Audio('/8-bit-dreamland.mp3');
    audio.loop = true;
    audio.volume = volume;
    
    if (musicPlaying) {
      audio.play().catch(e => console.log('Audio play failed:', e));
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [musicPlaying, volume]);

  // Sound effects
  const playJumpSound = () => {
    if (volume > 0) {
      const jumpAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      jumpAudio.volume = volume * 0.7;
      jumpAudio.play().catch(e => console.log('Jump sound failed:', e));
    }
  };

  const playScoreSound = () => {
    if (volume > 0) {
      const scoreAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      scoreAudio.volume = volume * 0.6;
      scoreAudio.play().catch(e => console.log('Score sound failed:', e));
    }
  };

  // Update game dimensions when window resizes
  useEffect(() => {
    const handleResize = () => {
      setGameDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Progressive difficulty system
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const difficultyTimer = setInterval(() => {
      setCurrentLevel(prev => prev + 1);
      setPipeSpeed(prev => Math.min(prev + 0.5, MAX_PIPE_SPEED));
    }, DIFFICULTY_INCREASE_INTERVAL);

    return () => clearInterval(difficultyTimer);
  }, [gameStarted, gameOver]);

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      setVelocity(JUMP_SPEED);
      playJumpSound();
    }
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setBirdPosition(gameDimensions.height / 2);
    setGameStarted(false);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setClouds([]);
    setLives(3);
    setCurrentLevel(1);
    setPipeSpeed(INITIAL_PIPE_SPEED);
  };

  const loseLife = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
        return 0;
      }
      // Reset bird position but keep score and continue
      setBirdPosition(gameDimensions.height / 2);
      setVelocity(0);
      setPipes([]);
      setClouds([]);
      return newLives;
    });
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(() => {
      setBirdPosition((prev) => {
        const newPosition = prev + velocity;
        if (newPosition < 0 || newPosition > gameDimensions.height - BIRD_HEIGHT) {
          loseLife();
          return prev;
        }
        return newPosition;
      });

      setVelocity((prev) => prev + GRAVITY);

      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({
            ...pipe,
            x: pipe.x - pipeSpeed,
          }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH);

        if (prevPipes.length === 0 || prevPipes[prevPipes.length - 1].x < gameDimensions.width - 200) {
          const pipeHeight = Math.random() * (gameDimensions.height - PIPE_GAP - 100) + 50;
          newPipes.push({
            x: gameDimensions.width,
            height: pipeHeight,
            passed: false,
            speed: pipeSpeed,
          });
        }

        return newPipes;
      });

      // Cloud generation and movement
      setClouds((prevClouds) => {
        const newClouds = prevClouds
          .map((cloud) => ({
            ...cloud,
            x: cloud.x - cloud.speed,
          }))
          .filter((cloud) => cloud.x > -100);

        if (prevClouds.length === 0 || Math.random() < 0.008) {
          const cloudY = Math.random() * (gameDimensions.height - 100) + 50;
          const cloudSize = Math.random() * 40 + 60;
          const cloudSpeed = Math.random() * 0.5 + 0.5;
          newClouds.push({
            x: gameDimensions.width + 50,
            y: cloudY,
            size: cloudSize,
            speed: cloudSpeed,
            opacity: Math.random() * 0.3 + 0.7,
          });
        }

        return newClouds;
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameStarted, velocity, gameDimensions, pipeSpeed]);

  useEffect(() => {
    if (!gameStarted) return;

    pipes.forEach((pipe) => {
      if (
        !pipe.passed &&
        pipe.x + PIPE_WIDTH < 50 + BIRD_WIDTH &&
        pipe.x + PIPE_WIDTH > 50
      ) {
        pipe.passed = true;
        setScore((prev) => prev + 1);
        playScoreSound();
      }

      // Collision detection
      if (
        50 < pipe.x + PIPE_WIDTH &&
        50 + BIRD_WIDTH > pipe.x &&
        (birdPosition < pipe.height || birdPosition + BIRD_HEIGHT > pipe.height + PIPE_GAP)
      ) {
        loseLife();
      }
    });
  }, [pipes, birdPosition, gameStarted]);

  return (
    <div className="App">
      <div className="game-container">
        <div className="game-header">
          <h1>Flappy Bird</h1>
          <div className="game-stats">
            <div className="score">Score: {score}</div>
            <div className="lives">Lives: {'❤️'.repeat(lives)}</div>
            <div className="level">Level: {currentLevel}</div>
          </div>
          <div className="music-controls">
            <button 
              className={`music-toggle ${musicPlaying ? 'playing' : ''}`}
              onClick={() => setMusicPlaying(!musicPlaying)}
              title={musicPlaying ? 'Pause Music' : 'Play Music'}
            >
              {musicPlaying ? '🔊' : '🔇'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
              title="Volume"
            />
          </div>
        </div>
        
        <div 
          className="game-area" 
          onClick={jump}
          style={{ 
            width: gameDimensions.width, 
            height: gameDimensions.height - 100 
          }}
        >
          {/* Clouds in background */}
          {clouds.map((cloud, index) => (
            <div
              key={`cloud-${index}`}
              className="cloud"
              style={{
                left: cloud.x,
                top: cloud.y,
                width: cloud.size,
                height: cloud.size * 0.6,
                opacity: cloud.opacity,
              }}
            />
          ))}
          
          <div
            className="bird"
            style={{
              top: birdPosition,
              left: 50,
              width: BIRD_WIDTH,
              height: BIRD_HEIGHT,
            }}
          >
            <div className="eye"></div>
            <div className="beak"></div>
            <div className="tail"></div>
          </div>
          
          {pipes.map((pipe, index) => (
            <React.Fragment key={index}>
              <div
                className="pipe top-pipe"
                style={{
                  left: pipe.x,
                  width: PIPE_WIDTH,
                  height: pipe.height,
                }}
              />
              <div
                className="pipe bottom-pipe"
                style={{
                  left: pipe.x,
                  top: pipe.height + PIPE_GAP,
                  width: PIPE_WIDTH,
                  height: gameDimensions.height - pipe.height - PIPE_GAP - 100,
                }}
              />
            </React.Fragment>
          ))}
          
          {gameOver && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <p>Final Score: {score}</p>
              <p>Level Reached: {currentLevel}</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
          
          {!gameStarted && !gameOver && (
            <div className="start-screen">
              <h2>Click or Press Space to Start</h2>
              <p>You have 3 lives!</p>
              <p>Difficulty increases every 10 seconds</p>
            </div>
          )}
        </div>
        
        <div className="instructions">
          <p>Click or press Space to make the bird jump</p>
          <p>Avoid the pipes and try to get the highest score!</p>
          <p>Speed increases every 10 seconds - stay alive as long as possible!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
