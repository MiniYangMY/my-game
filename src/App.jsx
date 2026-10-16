import React, { useState } from 'react';
import MemoryGame from './components/MemoryGame';
import SnakeClassicGame from './components/SnakeClassicGame';
import { Gamepad2, Layers } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('memory'); // 'memory' | 'classic'

  return (
    <div className="app-root">
      {/* Background ambient decorative orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>

      <header className="game-header">
        <div className="logo-badge">
          <span className="logo-emoji">🐍</span>
          <span className="logo-tag">Vite + React</span>
        </div>
        <h1 className="game-main-title">貪吃蛇記憶翻牌大挑戰</h1>
        <p className="game-subtitle">
          共 16 張卡牌，翻開相同圖案即可消除！比比看誰的步數最少、時間最短！
        </p>

        {/* Tab switch between 16-card matching (default) and classic snake */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'memory' ? 'active' : ''}`}
            onClick={() => setActiveTab('memory')}
            id="tab-memory-btn"
          >
            <Layers size={18} />
            <span>16張翻牌消除模式</span>
            <span className="badge-highlight">主遊戲</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'classic' ? 'active' : ''}`}
            onClick={() => setActiveTab('classic')}
            id="tab-classic-btn"
          >
            <Gamepad2 size={18} />
            <span>經典街機貪吃蛇</span>
          </button>
        </div>
      </header>

      <main className="game-main-content">
        {activeTab === 'memory' ? <MemoryGame /> : <SnakeClassicGame />}
      </main>

      <footer className="game-footer">
        <p>16 張牌記憶配對遊戲 • 支援計時與步數統計 • 點擊卡牌即可翻面消除</p>
      </footer>
    </div>
  );
}
