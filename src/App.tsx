import { useState, useEffect, useCallback } from 'react';
import { tenses, QuizQuestion } from './data/tenses';
import { playCorrect, playWrong, playClick, playLevelUp, playQuizStart, playStreak, playBell, playPerfect } from './utils/sounds';
import { Confetti } from './components/Particles';

type GameState = 'menu' | 'learn' | 'quiz' | 'results' | 'complete';

interface QuizResult {
  tenseId: string;
  score: number;
  total: number;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentTenseIndex, setCurrentTenseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>(['basic']);
  const [completedTenses, setCompletedTenses] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [cardHover, setCardHover] = useState<string | null>(null);
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [menuAnim, setMenuAnim] = useState(false);
  const [newLevelUnlocked, setNewLevelUnlocked] = useState<string | null>(null);

  const currentTense = tenses[currentTenseIndex];
  const currentQuestion: QuizQuestion | undefined = currentTense?.quiz[currentQuestionIndex];

  useEffect(() => {
    const saved = localStorage.getItem('tenseGameProgress');
    if (saved) {
      const data = JSON.parse(saved);
      setUnlockedLevels(data.unlockedLevels || ['basic']);
      setCompletedTenses(data.completedTenses || []);
      setTotalXP(data.totalXP || 0);
    }
    setTimeout(() => setMenuAnim(true), 100);
    // Play school bell on first load
    const timer = setTimeout(() => {
      if (soundEnabled) playBell();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('tenseGameProgress', JSON.stringify({
      unlockedLevels,
      completedTenses,
      totalXP
    }));
  }, [unlockedLevels, completedTenses, totalXP]);

  const sfx = (fn: () => void) => { if (soundEnabled) fn(); };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return { bg: 'from-green-600 to-emerald-700', text: 'text-green-300', border: 'border-green-500/50', glow: 'shadow-green-500/30' };
      case 'intermediate': return { bg: 'from-blue-600 to-indigo-700', text: 'text-blue-300', border: 'border-blue-500/50', glow: 'shadow-blue-500/30' };
      case 'advanced': return { bg: 'from-purple-600 to-violet-700', text: 'text-purple-300', border: 'border-purple-500/50', glow: 'shadow-purple-500/30' };
      case 'expert': return { bg: 'from-red-600 to-rose-700', text: 'text-red-300', border: 'border-red-500/50', glow: 'shadow-red-500/30' };
      default: return { bg: 'from-gray-600 to-gray-700', text: 'text-gray-300', border: 'border-gray-500/50', glow: 'shadow-gray-500/30' };
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'basic': return '📗';
      case 'intermediate': return '📘';
      case 'advanced': return '📕';
      case 'expert': return '📙';
      default: return '📚';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'basic': return 'Basic';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      case 'expert': return 'Expert';
      default: return '';
    }
  };

  const startLearning = (index: number) => {
    sfx(playClick);
    setCurrentTenseIndex(index);
    setGameState('learn');
  };

  const startQuiz = () => {
    sfx(playQuizStart);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentScore(0);
    setStreak(0);
    setGameState('quiz');
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === currentQuestion!.correctIndex) {
      sfx(playCorrect);
      setCurrentScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak >= 3) sfx(playStreak);
      setShowConfetti(true);
    } else {
      sfx(playWrong);
      setStreak(0);
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
    }
  };

  const nextQuestion = () => {
    sfx(playClick);
    if (currentQuestionIndex < currentTense.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = currentScore;
      const result: QuizResult = {
        tenseId: currentTense.id,
        score: finalScore,
        total: currentTense.quiz.length
      };
      setQuizResults(prev => [...prev, result]);

      const xpEarned = finalScore * 25 + (finalScore === result.total ? 50 : 0);
      setTotalXP(prev => prev + xpEarned);

      if (!completedTenses.includes(currentTense.id)) {
        setCompletedTenses(prev => [...prev, currentTense.id]);
      }

      // Unlock next level
      const levelOrder = ['basic', 'intermediate', 'advanced', 'expert'];
      const currentLevelIdx = levelOrder.indexOf(currentTense.level);
      const levelTenses = tenses.filter(t => t.level === currentTense.level);
      const allLevelCompleted = levelTenses.every(t => completedTenses.includes(t.id) || t.id === currentTense.id);

      if (allLevelCompleted && currentLevelIdx < levelOrder.length - 1) {
        const nextLevel = levelOrder[currentLevelIdx + 1];
        if (!unlockedLevels.includes(nextLevel)) {
          setUnlockedLevels(prev => [...prev, nextLevel]);
          setNewLevelUnlocked(nextLevel);
          sfx(playLevelUp);
        }
      }

      if (finalScore === result.total) {
        sfx(playPerfect);
        setShowConfetti(true);
      }

      setGameState('results');
    }
  };

  const goToNextTense = () => {
    sfx(playClick);
    setNewLevelUnlocked(null);
    if (currentTenseIndex < tenses.length - 1) {
      setCurrentTenseIndex(prev => prev + 1);
      setGameState('learn');
    } else {
      setGameState('complete');
    }
  };

  const resetProgress = () => {
    sfx(playClick);
    setUnlockedLevels(['basic']);
    setCompletedTenses([]);
    setTotalXP(0);
    setQuizResults([]);
    setGameState('menu');
  };

  const getProgressPercentage = () => {
    return Math.round((completedTenses.length / tenses.length) * 100);
  };

  // ===== 3D Card Component =====
  const Card3D = ({ children, className = '', onClick, hoverId }: { children: React.ReactNode; className?: string; onClick?: () => void; hoverId?: string }) => {
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    const [hasPlayedHoverSound, setHasPlayedHoverSound] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hoverId) return;
      if (cardHover !== hoverId && !hasPlayedHoverSound) {
        sfx(playClick);
        setHasPlayedHoverSound(true);
      }
      setCardHover(hoverId);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    };

    const handleMouseLeave = () => {
      setCardHover(null);
      setHasPlayedHoverSound(false);
      setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    };

    return (
      <div
        className={`transition-all duration-200 ease-out ${className}`}
        style={{ transform, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {children}
      </div>
    );
  };

  // ===== 3D Button Component =====
  const Button3D = ({ children, onClick, className = '', variant = 'primary', disabled = false, id = '' }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'chalk';
    disabled?: boolean;
    id?: string;
  }) => {
    const [isPressed, setIsPressed] = useState(false);

    const variants = {
      primary: 'bg-gradient-to-b from-indigo-400 to-indigo-600 hover:from-indigo-300 hover:to-indigo-500 text-white shadow-[0_6px_0_0_#3730a3,0_8px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_4px_0_0_#3730a3,0_6px_15px_rgba(79,70,229,0.5)]',
      secondary: 'bg-gradient-to-b from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600 text-white shadow-[0_6px_0_0_#1e293b,0_8px_20px_rgba(51,65,85,0.4)] hover:shadow-[0_4px_0_0_#1e293b,0_6px_15px_rgba(51,65,85,0.5)]',
      success: 'bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white shadow-[0_6px_0_0_#166534,0_8px_20px_rgba(34,197,94,0.4)] hover:shadow-[0_4px_0_0_#166534,0_6px_15px_rgba(34,197,94,0.5)]',
      danger: 'bg-gradient-to-b from-red-400 to-red-600 hover:from-red-300 hover:to-red-500 text-white shadow-[0_6px_0_0_#991b1b,0_8px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_4px_0_0_#991b1b,0_6px_15px_rgba(239,68,68,0.5)]',
      chalk: 'bg-gradient-to-b from-amber-100 to-amber-200 hover:from-amber-50 hover:to-amber-100 text-amber-900 shadow-[0_6px_0_0_#92400e,0_8px_20px_rgba(146,64,14,0.3)] hover:shadow-[0_4px_0_0_#92400e,0_6px_15px_rgba(146,64,14,0.4)]',
    };

    const handleClick = () => {
      if (disabled) return;
      sfx(playClick);
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onClick?.();
    };

    return (
      <button
        onClick={handleClick}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        className={`relative font-bold py-3 px-6 rounded-xl transition-all duration-150 active:translate-y-[4px] ${
          isPressed ? 'translate-y-[4px]' : ''
        } ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-[2px]'} ${className}`}
        style={{ transform: isPressed ? 'translateY(4px)' : undefined }}
      >
        {children}
      </button>
    );
  };

  // ===== RENDER FUNCTIONS =====

  const renderMenu = () => (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1a3a2a 0%, #0f2a1a 50%, #1a1a2e 100%)',
    }}>
      {/* Chalkboard texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      {/* Wooden frame border */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-amber-900/60 rounded-none" style={{
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
      }}></div>

      {/* Confetti */}
      <Confetti active={showConfetti} count={40} onComplete={() => setShowConfetti(false)} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header - Chalkboard style */}
        <div className={`text-center mb-10 transition-all duration-700 ${menuAnim ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          {/* Chalk-style title */}
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-7xl font-bold text-white/90 tracking-wide" style={{
              fontFamily: 'Georgia, serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.1)',
              letterSpacing: '0.05em',
            }}>
              ✏️ Tense Master
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-[3px] bg-white/30 rounded"></div>
          </div>
          <p className="text-lg text-emerald-200/70 mt-4 font-serif italic">
            "Learn English Verb Tenses — From Basics to Expert"
          </p>
        </div>

        {/* Stats Bar - Wooden desk style */}
        <div className={`flex items-center justify-center gap-4 flex-wrap mb-8 transition-all duration-700 delay-200 ${menuAnim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="bg-amber-800/40 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-amber-700/50 shadow-[0_4px_0_0_#451a03] transition-transform hover:scale-105">
            <span className="text-2xl font-bold text-yellow-300" style={{ textShadow: '0 0 10px rgba(253,224,71,0.5)' }}>⭐ {totalXP}</span>
            <span className="text-amber-300/70 ml-2 text-sm">XP</span>
          </div>
          <div className="bg-amber-800/40 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-amber-700/50 shadow-[0_4px_0_0_#451a03] transition-transform hover:scale-105">
            <span className="text-2xl font-bold text-green-300">{completedTenses.length}/{tenses.length}</span>
            <span className="text-amber-300/70 ml-2 text-sm">Tenses</span>
          </div>
          <div className="bg-amber-800/40 backdrop-blur-sm rounded-xl px-5 py-3 border-2 border-amber-700/50 shadow-[0_4px_0_0_#451a03] transition-transform hover:scale-105">
            <span className="text-2xl font-bold text-blue-300">{getProgressPercentage()}%</span>
            <span className="text-amber-300/70 ml-2 text-sm">Complete</span>
          </div>
          {/* Sound toggle */}
          <button
            onClick={() => { setSoundEnabled(!soundEnabled); sfx(playClick); }}
            className="bg-amber-800/40 backdrop-blur-sm rounded-xl px-4 py-3 border-2 border-amber-700/50 shadow-[0_4px_0_0_#451a03] transition-transform hover:scale-105 text-xl"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Progress bar - Pencil style */}
        <div className="max-w-md mx-auto mb-10">
          <div className="h-4 bg-amber-950/50 rounded-full overflow-hidden border-2 border-amber-800/50 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-full transition-all duration-1000 relative"
              style={{ width: `${getProgressPercentage()}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Tense Levels - Notebook sections */}
        {(['basic', 'intermediate', 'advanced', 'expert'] as const).map((level, levelIdx) => {
          const levelTenses = tenses.filter(t => t.level === level);
          const isUnlocked = unlockedLevels.includes(level);
          const levelCompleted = levelTenses.every(t => completedTenses.includes(t.id));
          const colors = getLevelColor(level);

          return (
            <div
              key={level}
              className={`mb-8 transition-all duration-700 ${menuAnim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${300 + levelIdx * 150}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl transform hover:scale-125 transition-transform">{getLevelIcon(level)}</span>
                <h2 className="text-2xl font-bold text-white/90 font-serif">{getLevelLabel(level)} Tenses</h2>
                {levelCompleted && (
                  <span className="text-green-400 text-sm font-medium bg-green-400/10 px-3 py-1 rounded-full border border-green-500/30 animate-pulse">✓ Complete</span>
                )}
                {!isUnlocked && (
                  <span className="text-slate-400 text-sm font-medium bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/30">🔒 Complete previous level</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {levelTenses.map((tense, tIdx) => {
                  const isCompleted = completedTenses.includes(tense.id);
                  const tenseIndex = tenses.findIndex(t => t.id === tense.id);

                  return (
                    <Card3D
                      key={tense.id}
                      hoverId={tense.id}
                      onClick={() => isUnlocked ? startLearning(tenseIndex) : undefined}
                      className={`${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                    >
                      <div className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                        isUnlocked
                          ? `bg-gradient-to-br from-slate-800/90 to-slate-900/90 ${isCompleted ? 'border-green-500/50' : 'border-slate-600/50'} hover:border-white/30`
                          : 'bg-slate-900/60 border-slate-800/50'
                      } ${cardHover === tense.id ? `shadow-lg shadow-indigo-500/20` : 'shadow-md shadow-black/30'}`}
                      style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Card shine effect */}
                        {cardHover === tense.id && isUnlocked && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                        )}

                        <div className="flex items-start justify-between mb-3" style={{ transform: 'translateZ(20px)' }}>
                          <h3 className="font-bold text-lg text-white/90">{tense.name}</h3>
                          {isCompleted && (
                            <span className="text-green-400 text-xl animate-bounce-in">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 font-mono mb-3" style={{ transform: 'translateZ(10px)' }}>
                          {tense.formula}
                        </p>
                        <div className={`inline-block text-xs px-3 py-1 rounded-full bg-gradient-to-r ${colors.bg} text-white font-medium shadow-md`} style={{ transform: 'translateZ(15px)' }}>
                          Level {tense.levelNumber}
                        </div>

                        {/* 3D depth effect */}
                        <div className="absolute -bottom-1 -right-1 left-1 h-2 bg-black/20 rounded-b-2xl blur-sm -z-10"></div>
                      </div>
                    </Card3D>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Reset button */}
        <div className="text-center mt-8 pb-6">
          <button
            onClick={resetProgress}
            className="text-slate-500 hover:text-red-400 text-sm transition-colors underline underline-offset-4"
          >
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );

  const renderLearn = () => {
    const colors = getLevelColor(currentTense.level);

    return (
      <div className="min-h-screen relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #1a3a2a 0%, #0f2a1a 50%, #1a1a2e 100%)',
      }}>
        {/* Chalkboard texture */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button3D variant="secondary" onClick={() => setGameState('menu')}>
              ← Back
            </Button3D>
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${colors.bg} text-sm font-medium text-white shadow-lg`}>
              {getLevelLabel(currentTense.level)} • Level {currentTense.levelNumber}
            </div>
          </div>

          {/* Tense Title - Chalkboard header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block relative">
              <h1 className="text-4xl md:text-5xl font-bold text-white/90 font-serif" style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}>
                📝 {currentTense.name}
              </h1>
              <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white/20"></div>
            </div>
            <p className="text-slate-300 font-mono text-lg mt-3 bg-slate-800/50 inline-block px-4 py-1 rounded-lg border border-slate-700/50">
              {currentTense.formula}
            </p>
          </div>

          {/* Explanation Card - 3D Notebook page */}
          <Card3D hoverId="explanation">
            <div className="bg-amber-50/5 backdrop-blur-sm border-2 border-amber-800/30 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
              {/* Notebook lines */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #8b5e3c 31px, #8b5e3c 32px)',
              }}></div>
              {/* Red margin line */}
              <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-400/20"></div>

              <div className="relative">
                <h2 className="text-xl font-bold text-emerald-300 mb-3 flex items-center gap-2 font-serif">
                  <span>📖</span> Explanation
                </h2>
                <p className="text-slate-200 leading-relaxed text-lg pl-8">{currentTense.explanation}</p>
              </div>
            </div>
          </Card3D>

          {/* Usage Card */}
          <Card3D hoverId="usage">
            <div className="bg-slate-800/60 border-2 border-slate-600/30 rounded-2xl p-6 mb-6 shadow-xl">
              <h2 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2 font-serif">
                <span>🎯</span> When to Use
              </h2>
              <ul className="space-y-3">
                {currentTense.usage.map((use, i) => (
                  <li key={i} className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-200">
                    <span className="text-green-400 mt-1 text-lg group-hover:scale-125 transition-transform">✦</span>
                    <span className="text-slate-200">{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card3D>

          {/* Examples Card */}
          <Card3D hoverId="examples">
            <div className="bg-slate-800/60 border-2 border-slate-600/30 rounded-2xl p-6 mb-6 shadow-xl">
              <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2 font-serif">
                <span>💡</span> Examples
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTense.examples.map((ex, i) => (
                  <div key={i} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 group">
                    <p className="text-slate-200 italic group-hover:text-white transition-colors">"{ex}"</p>
                  </div>
                ))}
              </div>
            </div>
          </Card3D>

          {/* Signal Words */}
          <Card3D hoverId="signals">
            <div className="bg-slate-800/60 border-2 border-slate-600/30 rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2 font-serif">
                <span>⚡</span> Signal Words
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentTense.signalWords.map((word, i) => (
                  <span key={i} className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-200 px-3 py-1.5 rounded-full text-sm hover:bg-yellow-400/20 hover:scale-110 transition-all duration-200 cursor-default">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </Card3D>

          {/* Start Quiz Button */}
          <div className="text-center pb-8">
            <Button3D variant="success" onClick={startQuiz} className="text-xl py-5 px-14">
              🎮 Take the Quiz →
            </Button3D>
            <p className="text-slate-500 mt-4 text-sm">{currentTense.quiz.length} questions await you!</p>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1a2a3a 0%, #0f1a2a 50%, #1a1a2e 100%)',
    }}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Confetti */}
      <Confetti active={showConfetti} count={30} onComplete={() => setShowConfetti(false)} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-slate-300 text-sm font-medium bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
            📝 {currentTense.name}
          </div>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <div className="text-orange-400 font-bold animate-bounce text-lg">
                🔥 {streak} streak!
              </div>
            )}
            <div className="text-slate-400 text-sm bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              Q{currentQuestionIndex + 1}/{currentTense.quiz.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-slate-800 rounded-full mb-8 overflow-hidden border border-slate-700/50 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 relative"
            style={{ width: `${((currentQuestionIndex + 1) / currentTense.quiz.length) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
          </div>
        </div>

        {/* Question Card - 3D */}
        <Card3D hoverId="question">
          <div className={`bg-slate-800/80 border-2 rounded-2xl p-8 mb-6 shadow-2xl transition-all duration-300 ${
            shakeCard ? 'animate-shake border-red-500/50' :
            selectedAnswer === currentQuestion!.correctIndex ? 'border-green-500/50' :
            selectedAnswer !== null ? 'border-red-500/30' : 'border-slate-600/50'
          }`}>
            <p className="text-sm text-slate-400 mb-3 uppercase tracking-wider font-medium">Fill in the blank:</p>
            <p className="text-2xl font-medium leading-relaxed text-white/90">
              {currentQuestion!.sentence.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className={`inline-block mx-2 px-5 py-1.5 rounded-lg border-b-4 font-bold transition-all duration-300 ${
                      selectedAnswer !== null
                        ? selectedAnswer === currentQuestion!.correctIndex
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 animate-pulse'
                    }`}>
                      {selectedAnswer !== null ? currentQuestion!.options[selectedAnswer] : '???'}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </Card3D>

        {/* Options - 3D Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentQuestion!.options.map((option, i) => {
            let buttonClass = 'bg-gradient-to-b from-slate-700 to-slate-800 border-slate-600/50 hover:border-indigo-400/50 hover:from-slate-600 hover:to-slate-700 text-white shadow-[0_5px_0_0_#1e293b,0_7px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_3px_0_0_#1e293b,0_5px_10px_rgba(0,0,0,0.4)]';

            if (selectedAnswer !== null) {
              if (i === currentQuestion!.correctIndex) {
                buttonClass = 'bg-gradient-to-b from-green-500/30 to-green-600/30 border-green-500/70 text-green-200 shadow-[0_5px_0_0_#166534,0_0_20px_rgba(34,197,94,0.2)]';
              } else if (i === selectedAnswer && i !== currentQuestion!.correctIndex) {
                buttonClass = 'bg-gradient-to-b from-red-500/30 to-red-600/30 border-red-500/70 text-red-200 shadow-[0_5px_0_0_#991b1b,0_0_20px_rgba(239,68,68,0.2)]';
              } else {
                buttonClass = 'bg-slate-800/30 border-slate-800/30 opacity-40 text-slate-500 shadow-none';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                className={`relative p-5 rounded-xl border-2 text-left font-medium transition-all duration-200 ${buttonClass} ${
                  selectedAnswer === null ? 'cursor-pointer hover:-translate-y-1 active:translate-y-[3px] active:shadow-none' : 'cursor-default'
                }`}
              >
                <span className="text-slate-500 mr-3 font-bold text-sm bg-slate-900/50 w-7 h-7 inline-flex items-center justify-center rounded-full">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-lg">{option}</span>
                {selectedAnswer !== null && i === currentQuestion!.correctIndex && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl animate-bounce-in">✅</span>
                )}
                {selectedAnswer === i && i !== currentQuestion!.correctIndex && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl animate-shake">❌</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-2xl p-6 mb-6 border-2 animate-slide-up ${
            selectedAnswer === currentQuestion!.correctIndex
              ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
              : 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10'
          }`}>
            <p className="font-bold mb-2 text-xl">
              {selectedAnswer === currentQuestion!.correctIndex ? '🎉 Correct!' : '💡 Not quite!'}
            </p>
            <p className="text-slate-200 text-lg">{currentQuestion!.explanation}</p>
          </div>
        )}

        {/* Next Button */}
        {selectedAnswer !== null && (
          <div className="text-center animate-fade-in">
            <Button3D
              variant={selectedAnswer === currentQuestion!.correctIndex ? 'success' : 'primary'}
              onClick={nextQuestion}
              className="text-lg py-4 px-10"
            >
              {currentQuestionIndex < currentTense.quiz.length - 1 ? 'Next Question →' : '🏆 See Results →'}
            </Button3D>
          </div>
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    const lastResult = quizResults[quizResults.length - 1];
    const percentage = Math.round((lastResult.score / lastResult.total) * 100);
    const xpEarned = lastResult.score * 25 + (lastResult.score === lastResult.total ? 50 : 0);

    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #1a2a3a 0%, #0f1a2a 50%, #1a1a2e 100%)',
      }}>
        {/* Background effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <Confetti active={showConfetti} count={60} onComplete={() => setShowConfetti(false)} />

        <div className="relative z-10 max-w-lg mx-auto px-4 text-center">
          <div className="text-7xl mb-6 animate-bounce-in">
            {percentage === 100 ? '🏆' : percentage >= 75 ? '🎉' : percentage >= 50 ? '👍' : '📚'}
          </div>
          <h1 className="text-4xl font-bold mb-2 font-serif text-white/90" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {percentage === 100 ? 'Perfect Score!' : percentage >= 75 ? 'Great Job!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
          </h1>
          <p className="text-slate-400 mb-6">{currentTense.name}</p>

          <Card3D hoverId="results">
            <div className="bg-slate-800/80 border-2 border-slate-600/30 rounded-2xl p-8 mb-6 shadow-2xl">
              <div className="text-6xl font-bold mb-3">
                <span className={percentage >= 75 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'} style={{
                  textShadow: percentage >= 75 ? '0 0 20px rgba(34,197,94,0.5)' : percentage >= 50 ? '0 0 20px rgba(234,179,8,0.5)' : '0 0 20px rgba(239,68,68,0.5)',
                }}>
                  {lastResult.score}/{lastResult.total}
                </span>
              </div>
              <p className="text-slate-400 text-lg">{percentage}% correct</p>

              <div className="mt-5 h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-1000 relative ${
                    percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
              </div>

              <div className="mt-5 text-yellow-300 font-bold text-xl animate-pulse">
                +{xpEarned} XP ⭐
              </div>
            </div>
          </Card3D>

          {/* New level unlocked notification */}
          {newLevelUnlocked && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 rounded-2xl p-4 mb-6 animate-bounce-in">
              <p className="text-yellow-300 font-bold text-lg">🔓 New Level Unlocked!</p>
              <p className="text-yellow-200/70">{getLevelLabel(newLevelUnlocked)} Tenses are now available!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button3D variant="secondary" onClick={startQuiz} className="w-full">
              🔄 Retry Quiz
            </Button3D>
            <Button3D variant="success" onClick={goToNextTense} className="w-full text-lg py-4">
              {currentTenseIndex < tenses.length - 1 ? '→ Next Tense' : '🏠 Back to Menu'}
            </Button3D>
            <button
              onClick={() => { sfx(playClick); setNewLevelUnlocked(null); setGameState('menu'); }}
              className="text-slate-500 hover:text-white transition-colors py-2 underline underline-offset-4"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
      background: 'linear-gradient(180deg, #2a1a3a 0%, #1a0f2a 50%, #1a1a2e 100%)',
    }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <Confetti active={showConfetti} count={80} onComplete={() => setShowConfetti(false)} />

      <div className="relative z-10 max-w-lg mx-auto px-4 text-center">
        <div className="text-8xl mb-6 animate-bounce-in">🎓</div>
        <h1 className="text-5xl font-bold mb-4 font-serif" style={{
          background: 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
        }}>
          Congratulations!
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          You've mastered all 12 English verb tenses! You're a true Tense Master! 🌟
        </p>

        <Card3D hoverId="complete">
          <div className="bg-slate-800/80 border-2 border-yellow-500/30 rounded-2xl p-8 mb-8 shadow-2xl shadow-yellow-500/10">
            <p className="text-5xl font-bold text-yellow-400 mb-2" style={{ textShadow: '0 0 30px rgba(251,191,36,0.5)' }}>
              {totalXP} XP
            </p>
            <p className="text-slate-400 text-lg">Total Experience Earned</p>
            <div className="mt-4 flex justify-center gap-4">
              <span className="text-3xl">📗</span>
              <span className="text-3xl">📘</span>
              <span className="text-3xl">📕</span>
              <span className="text-3xl">📙</span>
            </div>
          </div>
        </Card3D>

        <Button3D variant="primary" onClick={() => { sfx(playBell); setGameState('menu'); }} className="text-lg py-4 px-12">
          🏠 Back to Menu
        </Button3D>
      </div>
    </div>
  );

  switch (gameState) {
    case 'menu': return renderMenu();
    case 'learn': return renderLearn();
    case 'quiz': return renderQuiz();
    case 'results': return renderResults();
    case 'complete': return renderComplete();
    default: return renderMenu();
  }
}
