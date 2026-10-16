import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Clock, Footprints, Star, Award } from 'lucide-react';
import { sound } from '../utils/sound';

export default function VictoryModal({ isOpen, moves, timeSeconds, onRestart, isNewRecord }) {
  useEffect(() => {
    if (isOpen) {
      sound.playVictory();

      // Trigger multi-stage confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine star rating: 16 cards (8 pairs)
  // Perfect is 8 moves (unlikely), <= 14 moves is 3 stars, <= 22 is 2 stars, > 22 is 1 star
  const getStars = () => {
    if (moves <= 14) return 3;
    if (moves <= 22) return 2;
    return 1;
  };

  const stars = getStars();

  return (
    <div className="modal-backdrop">
      <div className="victory-modal glass-panel">
        <div className="victory-icon-glow">
          <Trophy className="trophy-icon" size={64} />
        </div>

        <h2 className="victory-title">🎉 完成！全部消除！</h2>
        <p className="victory-subtitle">太神啦！你已成功配對並消除了全部 16 張卡牌！</p>

        {isNewRecord && (
          <div className="new-record-badge">
            <Award size={18} />
            <span>🌟 創下歷史新紀錄！</span>
          </div>
        )}

        <div className="stars-row">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              size={36}
              className={`star-icon ${starIndex <= stars ? 'active' : 'inactive'}`}
              fill={starIndex <= stars ? '#f59e0b' : 'none'}
            />
          ))}
        </div>

        <div className="victory-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-title">總耗時</span>
              <span className="stat-number">{formatTime(timeSeconds)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper purple">
              <Footprints size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-title">總步數</span>
              <span className="stat-number">{moves} 次</span>
            </div>
          </div>
        </div>

        <button
          className="restart-btn primary-btn pulse-glow"
          onClick={() => {
            sound.playClick();
            onRestart();
          }}
          id="victory-restart-btn"
        >
          <RotateCcw size={20} />
          <span>重新開始遊戲</span>
        </button>
      </div>
    </div>
  );
}
