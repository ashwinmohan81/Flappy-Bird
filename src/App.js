import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const BIRD_HEIGHT = 28;
const BIRD_WIDTH = 38;
const GAME_HEIGHT = 500;
const GAME_WIDTH = 500;
const GRAVITY = 0.5;
const JUMP_SPEED = -8;
const PIPE_WIDTH = 52;
const PIPE_GAP = 150;

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameStarted, setGameStarted] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clouds, setClouds] = useState([]);

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      setVelocity(JUMP_SPEED);
    }
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setBirdPosition(250);
    setGameStarted(false);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setClouds([]);
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
        if (newPosition < 0 || newPosition > GAME_HEIGHT - BIRD_HEIGHT) {
          setGameOver(true);
          return prev;
        }
        return newPosition;
      });

      setVelocity((prev) => prev + GRAVITY);

      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({
            ...pipe,
            x: pipe.x - 2,
          }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH);

        if (prevPipes.length === 0 || prevPipes[prevPipes.length - 1].x < GAME_WIDTH - 200) {
          const pipeHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
          newPipes.push({
            x: GAME_WIDTH,
            height: pipeHeight,
            passed: false,
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

        if (prevClouds.length === 0 || Math.random() < 0.02) {
          const cloudY = Math.random() * (GAME_HEIGHT - 100) + 50;
          const cloudSize = Math.random() * 40 + 60;
          const cloudSpeed = Math.random() * 0.5 + 0.5;
          newClouds.push({
            x: GAME_WIDTH + 50,
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
  }, [gameStarted, velocity]);

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
      }

      // Collision detection
      if (
        50 < pipe.x + PIPE_WIDTH &&
        50 + BIRD_WIDTH > pipe.x &&
        (birdPosition < pipe.height || birdPosition + BIRD_HEIGHT > pipe.height + PIPE_GAP)
      ) {
        setGameOver(true);
      }
    });
  }, [pipes, birdPosition, gameStarted]);

  return (
    <div className="App">
      <div className="game-container">
        <div className="game-header">
          <h1>Flappy Bird</h1>
          <div className="score">Score: {score}</div>
        </div>
        
        <div 
          className="game-area" 
          onClick={jump}
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
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
                  height: GAME_HEIGHT - pipe.height - PIPE_GAP,
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
            </div>
          )}
        </div>
        
        <div className="instructions">
          <p>Click or press Space to make the bird jump</p>
          <p>Avoid the pipes and try to get the highest score!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
