import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function Card({ card, onClick, isFlipped, isMatched, isDisabled }) {
  const handleClick = () => {
    if (!isFlipped && !isMatched && !isDisabled) {
      onClick(card);
    }
  };

  return (
    <div
      className={`card-wrapper ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={isMatched ? -1 : 0}
      aria-label={`卡牌 ${card.name || card.symbol}`}
    >
      <div className="card-inner">
        {/* Card Back (Unflipped) */}
        <div className="card-face card-back">
          <div className="card-back-pattern">
            <span className="snake-symbol">🐍</span>
            <div className="card-back-ring"></div>
          </div>
          <span className="card-tip">點擊翻牌</span>
        </div>

        {/* Card Front (Flipped) */}
        <div className={`card-face card-front ${card.colorClass || ''}`}>
          <div className="card-front-content">
            <span className="card-symbol">{card.symbol}</span>
            <span className="card-label">{card.name}</span>
          </div>

          {/* Matched overlay badge */}
          {isMatched && (
            <div className="matched-badge">
              <CheckCircle2 size={18} className="matched-icon" />
              <span>已消除</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
