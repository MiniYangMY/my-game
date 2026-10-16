import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

const GRID_SIZE = 18;
const INITIAL_SPEED = 140;

export default function SnakeClassicGame() {
  const [snake, setSnake] = useState([
    { x: 9, y: 9 },
    { x: 9, y: 10 },
    { x: 9, y: 11 },
  ]);
  const [direction, setDirection] = useState('UP');
  const [food, setFood] = useState({ x: 9, y: 4 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('classic_snake_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some((seg) => seg.x === newFood.x && seg.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    sound.playClick();
    const initialSnake = [
      { x: 9, y: 9 },
      { x: 9, y: 10 },
      { x: 9, y: 11 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    setFood(generateFood(initialSnake));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const changeDirection = (newDir) => {
    const opp = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opp[newDir] !== directionRef.current) {
      setDirection(newDir);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        changeDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        changeDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        changeDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        changeDirection('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const curDir = directionRef.current;

        if (curDir === 'UP') head.y -= 1;
        if (curDir === 'DOWN') head.y += 1;
        if (curDir === 'LEFT') head.x -= 1;
        if (curDir === 'RIGHT') head.x += 1;

        // Collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          sound.playMismatch();
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        // Collision with self
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          sound.playMismatch();
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          sound.playMatch();
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('classic_snake_highscore', nextScore.toString());
            }
            return nextScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, food, generateFood, highScore]);

  return (
    <div className="snake-classic-container">
      <div className="stats-board glass-panel">
        <div className="stat-pill">
          <div className="stat-pill-icon moves">
            <Trophy size={18} />
          </div>
          <div className="stat-pill-text">
            <span className="label">當前得分</span>
            <span className="value">{score} 分</span>
          </div>
        </div>

        <div className="stat-pill">
          <div className="stat-pill-icon timer">
            <Trophy size={18} />
          </div>
          <div className="stat-pill-text">
            <span className="label">最高紀錄</span>
            <span className="value">{highScore} 分</span>
          </div>
        </div>

        <div className="action-buttons-group">
          <button className="restart-button primary-btn" onClick={resetGame}>
            <RotateCcw size={18} />
            <span>{isPlaying ? '重置' : '開始遊戲'}</span>
          </button>
        </div>
      </div>

      <div className="snake-board-frame glass-panel">
        <div className="snake-board">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);

            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some((seg) => seg.x === x && seg.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={`snake-cell ${isHead ? 'snake-head' : ''} ${isBody ? 'snake-body' : ''} ${isFood ? 'snake-food' : ''}`}
              >
                {isFood && <span>🍎</span>}
                {isHead && <span>👀</span>}
              </div>
            );
          })}
        </div>

        {(!isPlaying || gameOver) && (
          <div className="snake-overlay">
            {gameOver ? (
              <div className="overlay-box">
                <h3>💥 遊戲結束！</h3>
                <p>最終得分：<strong>{score}</strong> 分</p>
                <button className="primary-btn pulse-glow" onClick={resetGame}>
                  <RotateCcw size={18} />
                  <span>再玩一次</span>
                </button>
              </div>
            ) : (
              <div className="overlay-box">
                <h3>🐍 經典貪吃蛇模式</h3>
                <p>使用鍵盤方向鍵或 WASD 操控方向吃到紅蘋果！</p>
                <button className="primary-btn pulse-glow" onClick={resetGame}>
                  <Play size={18} />
                  <span>開始挑戰</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* D-Pad on mobile/touch */}
      <div className="mobile-dpad">
        <button className="dpad-btn up" onClick={() => changeDirection('UP')}>
          <ArrowUp size={24} />
        </button>
        <div className="dpad-middle">
          <button className="dpad-btn left" onClick={() => changeDirection('LEFT')}>
            <ArrowLeft size={24} />
          </button>
          <button className="dpad-btn right" onClick={() => changeDirection('RIGHT')}>
            <ArrowRight size={24} />
          </button>
        </div>
        <button className="dpad-btn down" onClick={() => changeDirection('DOWN')}>
          <ArrowDown size={24} />
        </button>
      </div>
    </div>
  );
}
