import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import VictoryModal from './VictoryModal';
import { RotateCcw, Clock, Footprints, Volume2, VolumeX, Sparkles, CheckCheck } from 'lucide-react';
import { sound } from '../utils/sound';

const THEMES = {
  snake: {
    id: 'snake',
    name: '🐍 貪吃蛇歷險',
    cards: [
      { id: 'snake', symbol: '🐍', name: '小青蛇', colorClass: 'card-green' },
      { id: 'apple', symbol: '🍎', name: '紅蘋果', colorClass: 'card-red' },
      { id: 'mouse', symbol: '🐭', name: '灰小鼠', colorClass: 'card-gray' },
      { id: 'frog', symbol: '🐸', name: '呱呱蛙', colorClass: 'card-emerald' },
      { id: 'mushroom', symbol: '🍄', name: '彩蘑菇', colorClass: 'card-purple' },
      { id: 'egg', symbol: '🥚', name: '幸運蛋', colorClass: 'card-amber' },
      { id: 'clover', symbol: '🍀', name: '四葉草', colorClass: 'card-lime' },
      { id: 'gem', symbol: '💎', name: '能量石', colorClass: 'card-cyan' },
    ]
  },
  animals: {
    id: 'animals',
    name: '🐾 森林萌寵',
    cards: [
      { id: 'panda', symbol: '🐼', name: '貓熊', colorClass: 'card-gray' },
      { id: 'fox', symbol: '🦊', name: '小狐狸', colorClass: 'card-amber' },
      { id: 'rabbit', symbol: '🐰', name: '白兔', colorClass: 'card-red' },
      { id: 'bear', symbol: '🐻', name: '棕熊', colorClass: 'card-amber' },
      { id: 'lion', symbol: '🦁', name: '獅王', colorClass: 'card-amber' },
      { id: 'tiger', symbol: '🐯', name: '小老虎', colorClass: 'card-amber' },
      { id: 'monkey', symbol: '🐵', name: '頑皮猴', colorClass: 'card-amber' },
      { id: 'penguin', symbol: '🐧', name: '企鵝', colorClass: 'card-cyan' },
    ]
  },
  fruits: {
    id: 'fruits',
    name: '🍓 甜蜜水果',
    cards: [
      { id: 'strawberry', symbol: '🍓', name: '草莓', colorClass: 'card-red' },
      { id: 'watermelon', symbol: '🍉', name: '西瓜', colorClass: 'card-emerald' },
      { id: 'banana', symbol: '🍌', name: '香蕉', colorClass: 'card-amber' },
      { id: 'grape', symbol: '🍇', name: '葡萄', colorClass: 'card-purple' },
      { id: 'pineapple', symbol: '🍍', name: '鳳梨', colorClass: 'card-amber' },
      { id: 'kiwi', symbol: '🥝', name: '奇異果', colorClass: 'card-lime' },
      { id: 'peach', symbol: '🍑', name: '水蜜桃', colorClass: 'card-red' },
      { id: 'orange', symbol: '🍊', name: '香橘', colorClass: 'card-amber' },
    ]
  }
};

// Generate 16 cards (8 pairs)
function createDeck(themeKey = 'snake') {
  const currentTheme = THEMES[themeKey] || THEMES.snake;
  const baseCards = currentTheme.cards.slice(0, 8); // exactly 8 unique items -> 16 cards

  const deck = [];
  baseCards.forEach((item, index) => {
    // Add two instances for each symbol
    deck.push({
      uniqueId: `${item.id}-1-${index}`,
      matchId: item.id,
      symbol: item.symbol,
      name: item.name,
      colorClass: item.colorClass,
    });
    deck.push({
      uniqueId: `${item.id}-2-${index}`,
      matchId: item.id,
      symbol: item.symbol,
      name: item.name,
      colorClass: item.colorClass,
    });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export default function MemoryGame() {
  const [currentTheme, setCurrentTheme] = useState('snake');
  const [cards, setCards] = useState(() => createDeck('snake'));
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('snake_memory_best');
    return saved ? JSON.parse(saved) : null;
  });
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, isCompleted]);

  // Handle card click
  const handleCardClick = (card) => {
    if (isDisabled || isCompleted) return;
    if (flippedCards.length === 1 && flippedCards[0].uniqueId === card.uniqueId) return;

    sound.playFlip();

    // Start timer on first move
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    // If 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstCard, secondCard] = newFlipped;

      if (firstCard.matchId === secondCard.matchId) {
        // Matched!
        setTimeout(() => {
          sound.playMatch();
          const newMatched = new Set(matchedIds);
          newMatched.add(firstCard.matchId);
          setMatchedIds(newMatched);
          setFlippedCards([]);

          // Check if all 8 pairs (16 cards) are matched
          if (newMatched.size === 8) {
            handleGameWin();
          }
        }, 300);
      } else {
        // Mismatch - flip back after delay
        setIsDisabled(true);
        setTimeout(() => {
          sound.playMismatch();
          setFlippedCards([]);
          setIsDisabled(false);
        }, 850);
      }
    }
  };

  const handleGameWin = () => {
    setIsCompleted(true);
    setIsTimerRunning(false);

    // Check best record (fewer moves is better, tie-breaker is faster time)
    const currentScore = {
      moves: moves + 1,
      time: timeSeconds,
      date: new Date().toLocaleDateString('zh-TW'),
    };

    let newRecord = false;
    if (!bestScore) {
      newRecord = true;
    } else if (currentScore.moves < bestScore.moves) {
      newRecord = true;
    } else if (currentScore.moves === bestScore.moves && currentScore.time < bestScore.time) {
      newRecord = true;
    }

    if (newRecord) {
      setIsNewRecord(true);
      setBestScore(currentScore);
      localStorage.setItem('snake_memory_best', JSON.stringify(currentScore));
    }
  };

  // Restart / Reset game
  const resetGame = (themeKey = currentTheme) => {
    clearInterval(timerRef.current);
    sound.playClick();
    setCards(createDeck(themeKey));
    setFlippedCards([]);
    setMatchedIds(new Set());
    setMoves(0);
    setTimeSeconds(0);
    setIsTimerRunning(false);
    setIsDisabled(false);
    setIsCompleted(false);
    setIsNewRecord(false);
  };

  const handleThemeChange = (key) => {
    setCurrentTheme(key);
    resetGame(key);
  };

  const toggleSound = () => {
    const newState = sound.toggleSound();
    setIsSoundOn(newState);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const matchedPairsCount = matchedIds.size;
  const progressPercent = Math.round((matchedPairsCount / 8) * 100);

  return (
    <div className="memory-game-container">
      {/* Header / Game Info Bar */}
      <div className="stats-board glass-panel">
        <div className="stat-pill">
          <div className="stat-pill-icon timer">
            <Clock size={18} />
          </div>
          <div className="stat-pill-text">
            <span className="label">時間</span>
            <span className="value" id="game-timer">{formatTime(timeSeconds)}</span>
          </div>
        </div>

        <div className="stat-pill">
          <div className="stat-pill-icon moves">
            <Footprints size={18} />
          </div>
          <div className="stat-pill-text">
            <span className="label">步數</span>
            <span className="value" id="game-moves">{moves} 步</span>
          </div>
        </div>

        <div className="stat-pill">
          <div className="stat-pill-icon matched">
            <CheckCheck size={18} />
          </div>
          <div className="stat-pill-text">
            <span className="label">消除進度</span>
            <span className="value">{matchedPairsCount} / 8 對</span>
          </div>
        </div>

        <div className="action-buttons-group">
          <button
            className="icon-button"
            onClick={toggleSound}
            title={isSoundOn ? '靜音' : '開啟音效'}
            id="sound-toggle-btn"
          >
            {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            className="restart-button primary-btn"
            onClick={() => resetGame()}
            title="重新洗牌開始"
            id="reset-game-btn"
          >
            <RotateCcw size={18} />
            <span>重新開始</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>消除進度: {progressPercent}%</span>
          {bestScore && (
            <span className="best-record-label">
              🏆 最佳: {bestScore.moves} 步 ({formatTime(bestScore.time)})
            </span>
          )}
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="theme-switcher">
        <span className="theme-title">主題樣式：</span>
        <div className="theme-pills">
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              className={`theme-pill ${currentTheme === key ? 'active' : ''}`}
              onClick={() => handleThemeChange(key)}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4x4 Grid of 16 Cards */}
      <div className="cards-grid 16-cards">
        {cards.map((card) => {
          const isFlipped =
            flippedCards.some((c) => c.uniqueId === card.uniqueId) ||
            matchedIds.has(card.matchId);
          const isMatched = matchedIds.has(card.matchId);

          return (
            <Card
              key={card.uniqueId}
              card={card}
              onClick={handleCardClick}
              isFlipped={isFlipped}
              isMatched={isMatched}
              isDisabled={isDisabled}
            />
          );
        })}
      </div>

      {/* Rules & Help Tips */}
      <div className="game-rules glass-panel">
        <div className="rules-header">
          <Sparkles size={18} className="rules-icon" />
          <span>遊戲規則與技巧</span>
        </div>
        <ul className="rules-list">
          <li>點擊任意卡牌翻面，每次可翻開 <strong>2 張</strong>。</li>
          <li>若兩張圖案相同，即成功<strong>消除</strong>；若不同，卡牌將自動翻回。</li>
          <li>合計 <strong>16 張牌（8 對）</strong>全部消除即獲勝！挑戰最短時間與最少步數！</li>
        </ul>
      </div>

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={isCompleted}
        moves={moves}
        timeSeconds={timeSeconds}
        onRestart={() => resetGame()}
        isNewRecord={isNewRecord}
      />
    </div>
  );
}
