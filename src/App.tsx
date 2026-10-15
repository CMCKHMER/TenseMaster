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
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ question: QuizQuestion; selected: number }[]>([]);

  const currentTense = tenses[currentTenseIndex];
  const currentQuestion: QuizQuestion | undefined = currentTense?.quiz[currentQuestionIndex];

  useEffect(() => {
    const saved = localStorage.getItem('tenseGameProgress');
    if (saved) {
      const data = JSON.parse(saved);
      setUnlockedLevels(data.unlockedLevels || ['basic']);
      setCompletedTenses(data.completedTenses || []);
      setTotalXP(data.totalXP || 0);
      setBestStreak(data.bestStreak || 0);
    }
    setTimeout(() => setMenuAnim(true), 100);
    const timer = setTimeout(() => {
      if (soundEnabled) playBell();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('tenseGameProgress', JSON.stringify({
      unlockedLevels,
      completedTenses,
      totalXP,
      bestStreak
    }));
  }, [unlockedLevels, completedTenses, totalXP, bestStreak]);

  const sfx = (fn: () => void) => { if (soundEnabled) fn(); };

  // Keyboard shortcuts: 1-4 to answer in quiz, Enter for Next, Esc for Back
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState === 'quiz') {
        if (selectedAnswer === null && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key) - 1;
          if (currentQuestion && idx < currentQuestion.options.length) {
            handleAnswer(idx);
          }
        }
        else if (selectedAnswer === null && ['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
          const idx = e.key.toLowerCase().charCodeAt(0) - 97;
          if (currentQuestion && idx < currentQuestion.options.length) {
            handleAnswer(idx);
          }
        }
        else if (selectedAnswer !== null && e.key === 'Enter') {
          nextQuestion();
        }
      }
      else if (e.key === 'Escape') {
        if (gameState === 'learn' || gameState === 'results' || gameState === 'complete') {
          sfx(playClick);
          setGameState('menu');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, selectedAnswer, currentQuestion, currentQuestionIndex]);


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
    setWrongAnswers([]);
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
      if (newStreak > bestStreak) setBestStreak(newStreak);
      if (newStreak >= 3) sfx(playStreak);
      setShowConfetti(true);
    } else {
      sfx(playWrong);
      setStreak(0);
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
      if (currentQuestion) {
        setWrongAnswers(prev => [...prev, { question: currentQuestion, selected: index }]);
      }
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
    setBestStreak(0);
    setWrongAnswers([]);
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
      primary: 'bg-gradient-to-r from-cyan-300 to-violet-400 hover:from-cyan-200 hover:to-violet-300 text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.25)] hover:shadow-[0_12px_32px_rgba(34,211,238,0.4)]',
      secondary: 'bg-white/[0.06] hover:bg-white/[0.10] text-slate-100 border border-white/10 hover:border-cyan-300/40',
      success: 'bg-gradient-to-r from-teal-300 to-cyan-300 hover:from-teal-200 hover:to-cyan-200 text-slate-950 shadow-[0_8px_24px_rgba(94,234,212,0.25)] hover:shadow-[0_12px_32px_rgba(94,234,212,0.4)]',
      danger: 'bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-300 hover:to-pink-400 text-white shadow-[0_8px_24px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_32px_rgba(244,63,94,0.4)]',
      chalk: 'bg-white/[0.06] hover:bg-cyan-200/[0.10] text-cyan-100 border border-cyan-200/20 hover:border-cyan-200/40',
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
      background: 'radial-gradient(ellipse at 72% 18%, rgba(34,211,238,0.16), transparent 42%), radial-gradient(ellipse at 12% 88%, rgba(139,92,246,0.18), transparent 42%), #020617',
    }}>
      {/* Chalkboard texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      {/* Wooden frame border */}
      <div className="absolute inset-0 pointer-events-none border border-white/[0.06] rounded-none" style={{
        boxShadow: 'inset 0 0 30px rgba(34,211,238,0.04)',
      }}></div>

      {/* Confetti */}
      <Confetti active={showConfetti} count={40} onComplete={() => setShowConfetti(false)} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header - Chalkboard style */}
        <div className={`text-center mb-10 transition-all duration-700 ${menuAnim ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          {/* Chalk-style title */}
          <div className="relative inline-block">
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight" style={{
              fontFamily: 'Syne, sans-serif',
              letterSpacing: '-0.01em',
            }}>
              <span className="cmc-gradient-text">Tense Master</span>
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-300 via-teal-200 to-violet-300 rounded"></div>
          </div>
          <p className="text-base text-slate-300 mt-4 font-grotesk" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Learn English Verb Tenses — From Basics to Expert
          </p>
        </div>

        {/* Stats Bar - Wooden desk style */}
        <div className={`flex items-center justify-center gap-4 flex-wrap mb-8 transition-all duration-700 delay-200 ${menuAnim ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 transition-transform hover:scale-105 hover:bg-cyan-200/[0.08]">
            <span className="text-2xl font-bold text-yellow-300" style={{ textShadow: '0 0 10px rgba(253,224,71,0.5)' }}>⭐ {totalXP}</span>
            <span className="text-amber-300/70 ml-2 text-sm">XP</span>
          </div>
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 transition-transform hover:scale-105 hover:bg-cyan-200/[0.08]">
            <span className="text-2xl font-bold text-green-300">{completedTenses.length}/{tenses.length}</span>
            <span className="text-amber-300/70 ml-2 text-sm">Tenses</span>
          </div>
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 transition-transform hover:scale-105 hover:bg-cyan-200/[0.08]">
            <span className="text-2xl font-bold text-blue-300">{getProgressPercentage()}%</span>
            <span className="text-amber-300/70 ml-2 text-sm">Complete</span>
          </div>
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 transition-transform hover:scale-105 hover:bg-cyan-200/[0.08]">
            <span className="text-2xl font-bold text-orange-400">🔥 {bestStreak}</span>
            <span className="text-amber-300/70 ml-2 text-sm">Best Streak</span>
          </div>
          {/* Sound toggle */}
          <button
            onClick={() => { setSoundEnabled(!soundEnabled); sfx(playClick); }}
            className="bg-white/[0.04] backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 transition-transform hover:scale-105 text-xl hover:bg-cyan-200/[0.08] hover:border-cyan-300/40"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Progress bar - Pencil style */}
        <div className="max-w-md mx-auto mb-10">
          <div className="h-4 bg-slate-900/80 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-300 via-teal-200 to-violet-300 rounded-full transition-all duration-1000 relative"
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
                <h2 className="text-2xl font-bold text-white/90 font-display">{getLevelLabel(level)} Tenses</h2>
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
                      <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                        isUnlocked
                          ? `bg-white/[0.04] backdrop-blur-sm ${isCompleted ? 'border-teal-300/40' : 'border-white/10'} hover:border-cyan-300/40 hover:bg-cyan-200/[0.06]`
                          : 'bg-white/[0.02] border-white/5'
                      } ${cardHover === tense.id ? `shadow-lg shadow-cyan-500/20` : 'shadow-md shadow-black/30'}`}
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
            className="text-slate-500 hover:text-rose-300 text-sm transition-colors underline underline-offset-4"
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
        background: 'radial-gradient(ellipse at 72% 18%, rgba(34,211,238,0.16), transparent 42%), radial-gradient(ellipse at 12% 88%, rgba(139,92,246,0.18), transparent 42%), #020617',
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
              <h1 className="text-4xl md:text-5xl font-bold text-white/90 font-display" style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}>
                📝 {currentTense.name}
              </h1>
              <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white/20"></div>
            </div>
            <p className="text-slate-300 font-mono text-lg mt-3 bg-white/[0.04] inline-block px-4 py-1 rounded-lg border border-white/10">
              {currentTense.formula}
            </p>
          </div>

          {/* Explanation Card - 3D Notebook page */}
          <Card3D hoverId="explanation">
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
              {/* Notebook lines */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #8b5e3c 31px, #8b5e3c 32px)',
              }}></div>
              {/* Red margin line */}
              <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-400/20"></div>

              <div className="relative">
                <h2 className="text-xl font-bold text-cyan-200 mb-3 flex items-center gap-2 font-display">
                  <span>📖</span> Explanation
                </h2>
                <p className="text-slate-200 leading-relaxed text-lg pl-8">{currentTense.explanation}</p>
              </div>
            </div>
          </Card3D>

          {/* Usage Card */}
          <Card3D hoverId="usage">
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6 shadow-xl">
              <h2 className="text-xl font-bold text-teal-200 mb-4 flex items-center gap-2 font-display">
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
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6 shadow-xl">
              <h2 className="text-xl font-bold text-violet-200 mb-4 flex items-center gap-2 font-display">
                <span>💡</span> Examples
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTense.examples.map((ex, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/10 hover:border-violet-300/40 hover:bg-violet-300/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/15 group">
                    <p className="text-slate-200 italic group-hover:text-white transition-colors">"{ex}"</p>
                  </div>
                ))}
              </div>
            </div>
          </Card3D>

          {/* Signal Words */}
          <Card3D hoverId="signals">
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2 font-display">
                <span>⚡</span> Signal Words
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentTense.signalWords.map((word, i) => (
                  <span key={i} className="bg-amber-200/10 border border-amber-200/30 text-amber-100 px-3 py-1.5 rounded-full text-sm hover:bg-amber-200/20 hover:scale-110 transition-all duration-200 cursor-default">
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
      background: 'radial-gradient(ellipse at 72% 18%, rgba(34,211,238,0.16), transparent 42%), radial-gradient(ellipse at 12% 88%, rgba(139,92,246,0.18), transparent 42%), #020617',
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
          <div className="text-slate-300 text-sm font-medium bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/10">
            📝 {currentTense.name}
          </div>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <div className="text-orange-400 font-bold animate-bounce text-lg">
                🔥 {streak} streak!
              </div>
            )}
            <div className="text-slate-400 text-sm bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/10">
              Q{currentQuestionIndex + 1}/{currentTense.quiz.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white/[0.04] rounded-full mb-8 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-300 via-teal-200 to-violet-300 rounded-full transition-all duration-700 relative"
            style={{ width: `${((currentQuestionIndex + 1) / currentTense.quiz.length) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
          </div>
        </div>

        {/* Question Card - 3D */}
        <Card3D hoverId="question">
          <div className={`bg-white/[0.04] backdrop-blur-sm border rounded-2xl p-8 mb-6 shadow-2xl transition-all duration-300 ${
            shakeCard ? 'animate-shake border-rose-400/50' :
            selectedAnswer === currentQuestion!.correctIndex ? 'border-teal-300/40 shadow-[0_0_32px_rgba(94,234,212,0.18)]' :
            selectedAnswer !== null ? 'border-rose-300/30' : 'border-white/10'
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
            let buttonClass = 'bg-white/[0.04] border border-white/10 hover:border-cyan-300/40 hover:bg-cyan-200/[0.06] text-slate-100 shadow-sm hover:shadow-[0_8px_24px_rgba(34,211,238,0.15)]';

            if (selectedAnswer !== null) {
              if (i === currentQuestion!.correctIndex) {
                buttonClass = 'bg-teal-300/[0.10] border-teal-300/60 text-teal-100 shadow-[0_0_20px_rgba(94,234,212,0.18)]';
              } else if (i === selectedAnswer && i !== currentQuestion!.correctIndex) {
                buttonClass = 'bg-rose-400/[0.10] border-rose-400/60 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.18)]';
              } else {
                buttonClass = 'bg-white/[0.02] border-white/5 opacity-40 text-slate-500 shadow-none';
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
                <span className="text-slate-500 mr-3 font-bold text-sm bg-white/[0.06] w-7 h-7 inline-flex items-center justify-center rounded-full border border-white/10">
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
              ? 'bg-teal-300/[0.08] border-teal-300/30 shadow-lg shadow-teal-300/10'
              : 'bg-rose-400/[0.08] border-rose-400/30 shadow-lg shadow-rose-400/10'
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
            <p className="text-slate-600 text-xs mt-2">Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-slate-300 text-xs">Enter</kbd></p>
          </div>
        )}

        {/* Keyboard hint */}
        {selectedAnswer === null && (
          <p className="text-slate-600 text-xs text-center mt-4">
            Tip: use keys <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-slate-300">1-4</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 text-slate-300">A-D</kbd> to answer
          </p>
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
        background: 'radial-gradient(ellipse at 72% 18%, rgba(34,211,238,0.16), transparent 42%), radial-gradient(ellipse at 12% 88%, rgba(139,92,246,0.18), transparent 42%), #020617',
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
          <h1 className="text-4xl font-bold mb-2 font-display text-white/90" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {percentage === 100 ? 'Perfect Score!' : percentage >= 75 ? 'Great Job!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
          </h1>
          <p className="text-slate-400 mb-6">{currentTense.name}</p>

          <Card3D hoverId="results">
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6 shadow-2xl">
              <div className="text-6xl font-bold mb-3">
                <span className={percentage >= 75 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'} style={{
                  textShadow: percentage >= 75 ? '0 0 20px rgba(34,197,94,0.5)' : percentage >= 50 ? '0 0 20px rgba(234,179,8,0.5)' : '0 0 20px rgba(239,68,68,0.5)',
                }}>
                  {lastResult.score}/{lastResult.total}
                </span>
              </div>
              <p className="text-slate-400 text-lg">{percentage}% correct</p>

              <div className="mt-5 h-4 bg-slate-900/80 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-1000 relative ${
                    percentage >= 75 ? 'bg-gradient-to-r from-teal-300 to-cyan-300' : percentage >= 50 ? 'bg-gradient-to-r from-amber-300 to-amber-400' : 'bg-gradient-to-r from-rose-400 to-pink-500'
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
            <div className="bg-gradient-to-r from-cyan-200/15 to-violet-300/15 border border-cyan-300/40 rounded-2xl p-4 mb-6 animate-bounce-in">
              <p className="text-cyan-200 font-bold text-lg">🔓 New Level Unlocked!</p>
              <p className="text-cyan-100/80">{getLevelLabel(newLevelUnlocked)} Tenses are now available!</p>
            </div>
          )}

          {/* Wrong answers review */}
          {wrongAnswers.length > 0 && (
            <div className="bg-rose-400/[0.06] border border-rose-400/30 rounded-2xl p-6 mb-6 text-left backdrop-blur-sm">
              <h3 className="font-bold text-rose-200 mb-3 flex items-center gap-2">
                <span>📝</span> Review your mistakes ({wrongAnswers.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {wrongAnswers.map((item, i) => (
                  <div key={i} className="bg-white/[0.02] border border-rose-400/15 rounded-xl p-3">
                    <p className="text-slate-200 mb-2 text-sm">
                      <span className="text-slate-500 mr-2">Q{i + 1}.</span>
                      {item.question.sentence}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-rose-400/15 border border-rose-400/30 text-rose-200 px-2 py-1 rounded">
                        Your answer: {item.question.options[item.selected]}
                      </span>
                      <span className="bg-teal-300/15 border border-teal-300/30 text-teal-100 px-2 py-1 rounded">
                        Correct: {item.question.options[item.question.correctIndex]}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2 italic">{item.question.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best streak display */}
          {bestStreak > 0 && (
            <div className="text-orange-400 text-sm font-medium mb-4">
              🔥 Best streak this session: <span className="font-bold">{bestStreak} in a row</span>
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
      background: 'radial-gradient(ellipse at 50% 18%, rgba(250,204,21,0.10), transparent 45%), radial-gradient(ellipse at 50% 88%, rgba(139,92,246,0.18), transparent 42%), #020617',
    }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <Confetti active={showConfetti} count={80} onComplete={() => setShowConfetti(false)} />

      <div className="relative z-10 max-w-lg mx-auto px-4 text-center">
        <div className="text-8xl mb-6 animate-bounce-in">🎓</div>
        <h1 className="text-5xl font-bold mb-4 font-display" style={{
          background: 'linear-gradient(100deg, #a5f3fc 0%, #5eead4 45%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Congratulations!
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          You've mastered all 12 English verb tenses! You're a true Tense Master! 🌟
        </p>

        <Card3D hoverId="complete">
          <div className="bg-white/[0.04] backdrop-blur-sm border border-cyan-300/30 rounded-2xl p-8 mb-8 shadow-2xl shadow-cyan-500/10">
            <p className="text-5xl font-bold text-cyan-200 mb-2" style={{ textShadow: '0 0 30px rgba(165,243,252,0.4)' }}>
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
