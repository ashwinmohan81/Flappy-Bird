import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const BIRD_HEIGHT = 28;
const BIRD_WIDTH = 38;
const GRAVITY = 0.5;
const JUMP_SPEED = -8;
const PIPE_WIDTH = 52;
const INITIAL_PIPE_GAP = 150;
const MIN_PIPE_GAP = 80;
const PIPE_SPEED = 2;
const GAP_DECREASE_RATE = 2; // Decrease gap by 2px every 5 pipes

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameStarted, setGameStarted] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clouds, setClouds] = useState([]);
  const [lives, setLives] = useState(3);
  const [gameDimensions, setGameDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Enable audio on first user interaction
  const enableAudio = () => {
    if (!audioEnabled) {
      setAudioEnabled(true);
      // Try to start audio context
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        audioContext.resume();
        audioContext.close();
      } catch (error) {
        console.log('Audio context setup failed:', error);
      }
    }
  };

  const toggleMusic = () => {
    enableAudio();
    setMusicPlaying(!musicPlaying);
  };

  // Audio setup
  useEffect(() => {
    let audio;
    
    try {
      audio = new Audio('/8-bit-dreamland.mp3');
      audio.loop = true;
      audio.volume = volume;
      
      // Preload the audio for better performance
      audio.preload = 'auto';
      
      // Track when audio is loaded
      audio.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
        console.log('Audio file loaded successfully');
      });
      
      audio.addEventListener('error', (e) => {
        console.log('Audio loading error:', e);
        setAudioLoaded(false);
      });
      
      if (musicPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.log('Audio play failed:', e);
            // Common issue: browser requires user interaction
            if (e.name === 'NotAllowedError') {
              console.log('Browser requires user interaction before playing audio');
            }
          });
        }
      }

      return () => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    } catch (error) {
      console.log('Audio setup failed:', error);
    }
  }, [musicPlaying, volume]);

  // Sound effects
  const playJumpSound = () => {
    if (volume > 0) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        
        setTimeout(() => audioContext.close(), 200);
      } catch (error) {
        console.log('Jump sound failed:', error);
      }
    }
  };

  const playScoreSound = () => {
    if (volume > 0) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        setTimeout(() => audioContext.close(), 400);
      } catch (error) {
        console.log('Score sound failed:', error);
      }
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

  const jump = useCallback(() => {
    enableAudio();
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
  };

  const loseLife = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameOver(true);
        return 0;
      }
      // Keep bird position, only reset pipes and clouds
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
          // Only lose life if bird has lives and game isn't over
          if (lives > 0 && !gameOver) {
            loseLife();
          }
          return prev;
        }
        return newPosition;
      });

      setVelocity((prev) => prev + GRAVITY);

      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({
            ...pipe,
            x: pipe.x - PIPE_SPEED,
          }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH);

        if ((prevPipes.length === 0 || prevPipes[prevPipes.length - 1].x < gameDimensions.width - 150) && !gameOver) {
          const currentGap = Math.max(MIN_PIPE_GAP, INITIAL_PIPE_GAP - (GAP_DECREASE_RATE * Math.floor(score / 5)));
          const pipeHeight = Math.random() * (gameDimensions.height - currentGap - 100) + 50;
          newPipes.push({
            x: gameDimensions.width,
            height: pipeHeight,
            passed: false,
            speed: PIPE_SPEED,
            gap: currentGap,
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

        if ((prevClouds.length === 0 || Math.random() < 0.008) && !gameOver) {
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
  }, [gameStarted, velocity, gameDimensions, gameOver]);

  useEffect(() => {
    if (!gameStarted) return;

    pipes.forEach((pipe) => {
      if (
        !pipe.passed &&
        pipe.x + PIPE_WIDTH < 50 + BIRD_WIDTH &&
        pipe.x + PIPE_WIDTH > 50
      ) {
        pipe.passed = true;
        // Only increase score if game is not over and bird has lives
        if (!gameOver && lives > 0) {
          setScore((prev) => prev + 1);
          playScoreSound();
        }
      }

      // Collision detection - only check if bird has lives
      if (lives > 0 && !gameOver) {
        if (
          50 < pipe.x + PIPE_WIDTH &&
          50 + BIRD_WIDTH > pipe.x &&
          (birdPosition < pipe.height || birdPosition + BIRD_HEIGHT > pipe.height + pipe.gap)
        ) {
          loseLife();
        }
      }
    });
  }, [pipes, birdPosition, gameStarted, gameOver, lives]);

  return (
    <div className="App">
      <div className="game-container">
        <div className="game-header">
          <h1>Flappy Bird</h1>
          <div className="game-stats">
            <div className="score">Score: {score}</div>
            <div className="lives">Lives: {'❤️'.repeat(lives)}</div>
          </div>
          <div className="music-controls">
            <button
                      className={`music-toggle ${musicPlaying ? 'playing' : ''} ${!audioLoaded ? 'loading' : ''}`}
                      onClick={toggleMusic}
                      title={!audioLoaded ? 'Loading music...' : musicPlaying ? 'Pause Music' : 'Play Music'}
                      disabled={!audioLoaded}
                    >
                      {!audioLoaded ? '⏳' : musicPlaying ? '🔊' : '🔇'}
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
                  top: pipe.height + pipe.gap,
                  width: PIPE_WIDTH,
                  height: gameDimensions.height - pipe.height - pipe.gap - 100,
                }}
              />
            </React.Fragment>
          ))}
          
          {gameOver && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <p>Final Score: {score}</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
          
          {!gameStarted && !gameOver && (
            <div className="start-screen">
              <h2>Click or Press Space to Start</h2>
              <p>You have 3 lives!</p>
            </div>
          )}
        </div>
        
        <div className="instructions">
          <p>Click or press Space to make the bird jump</p>
          <p>Avoid the pipes and try to get the highest score!</p>
          <p>Gap between pipes decreases every 5 points - making it harder!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
