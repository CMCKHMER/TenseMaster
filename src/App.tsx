import { useState, useEffect } from 'react';
import { tenses, TenseLevel, QuizQuestion } from './data/tenses';

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
  const [animateCorrect, setAnimateCorrect] = useState(false);
  const [animateWrong, setAnimateWrong] = useState(false);

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
  }, []);

  useEffect(() => {
    localStorage.setItem('tenseGameProgress', JSON.stringify({
      unlockedLevels,
      completedTenses,
      totalXP
    }));
  }, [unlockedLevels, completedTenses, totalXP]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'from-green-400 to-emerald-500';
      case 'intermediate': return 'from-blue-400 to-indigo-500';
      case 'advanced': return 'from-purple-400 to-violet-500';
      case 'expert': return 'from-red-400 to-rose-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'basic': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      case 'expert': return '🔥';
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
    setCurrentTenseIndex(index);
    setGameState('learn');
  };

  const startQuiz = () => {
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
      setCurrentScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setAnimateCorrect(true);
      setTimeout(() => setAnimateCorrect(false), 600);
    } else {
      setStreak(0);
      setAnimateWrong(true);
      setTimeout(() => setAnimateWrong(false), 600);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentTense.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      const result: QuizResult = {
        tenseId: currentTense.id,
        score: currentScore + (selectedAnswer === currentQuestion!.correctIndex ? 0 : 0),
        total: currentTense.quiz.length
      };
      // Recalculate score since we already incremented
      const finalScore = currentScore;
      result.score = finalScore;

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
        }
      }

      setGameState('results');
    }
  };

  const goToNextTense = () => {
    if (currentTenseIndex < tenses.length - 1) {
      setCurrentTenseIndex(prev => prev + 1);
      setGameState('learn');
    } else {
      setGameState('complete');
    }
  };

  const resetProgress = () => {
    setUnlockedLevels(['basic']);
    setCompletedTenses([]);
    setTotalXP(0);
    setQuizResults([]);
    setGameState('menu');
  };

  const getProgressPercentage = () => {
    return Math.round((completedTenses.length / tenses.length) * 100);
  };

  // ===== RENDER FUNCTIONS =====

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Tense Master
          </h1>
          <p className="text-xl text-slate-300 mb-6">Master English Verb Tenses — From Basics to Expert</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-700">
              <span className="text-2xl font-bold text-yellow-400">{totalXP}</span>
              <span className="text-slate-400 ml-2">XP</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-700">
              <span className="text-2xl font-bold text-green-400">{completedTenses.length}/{tenses.length}</span>
              <span className="text-slate-400 ml-2">Tenses</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-700">
              <span className="text-2xl font-bold text-blue-400">{getProgressPercentage()}%</span>
              <span className="text-slate-400 ml-2">Complete</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tense Levels */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {(['basic', 'intermediate', 'advanced', 'expert'] as const).map(level => {
          const levelTenses = tenses.filter(t => t.level === level);
          const isUnlocked = unlockedLevels.includes(level);
          const levelCompleted = levelTenses.every(t => completedTenses.includes(t.id));

          return (
            <div key={level} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{getLevelIcon(level)}</span>
                <h2 className="text-2xl font-bold">{getLevelLabel(level)} Tenses</h2>
                {levelCompleted && <span className="text-green-400 text-sm font-medium bg-green-400/10 px-3 py-1 rounded-full">✓ Complete</span>}
                {!isUnlocked && <span className="text-slate-500 text-sm font-medium bg-slate-700/50 px-3 py-1 rounded-full">🔒 Locked</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levelTenses.map(tense => {
                  const isCompleted = completedTenses.includes(tense.id);
                  const tenseIndex = tenses.findIndex(t => t.id === tense.id);

                  return (
                    <button
                      key={tense.id}
                      onClick={() => isUnlocked && startLearning(tenseIndex)}
                      disabled={!isUnlocked}
                      className={`relative group text-left p-5 rounded-xl border transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-slate-800/60 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 hover:scale-[1.02] cursor-pointer'
                          : 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{tense.name}</h3>
                        {isCompleted && (
                          <span className="text-green-400 text-xl">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 font-mono mb-3">{tense.formula}</p>
                      <div className={`inline-block text-xs px-2 py-1 rounded bg-gradient-to-r ${getLevelColor(tense.level)} text-white font-medium`}>
                        Level {tense.levelNumber}
                      </div>
                      {isUnlocked && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Reset button */}
        <div className="text-center mt-8">
          <button
            onClick={resetProgress}
            className="text-slate-500 hover:text-red-400 text-sm transition-colors"
          >
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setGameState('menu')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <span>←</span> Back to Menu
          </button>
          <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${getLevelColor(currentTense.level)} text-sm font-medium`}>
            {getLevelLabel(currentTense.level)} • Level {currentTense.levelNumber}
          </div>
        </div>

        {/* Tense Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{currentTense.name}</h1>
          <p className="text-slate-400 font-mono text-lg">{currentTense.formula}</p>
        </div>

        {/* Explanation Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
            <span>📖</span> Explanation
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg">{currentTense.explanation}</p>
        </div>

        {/* Usage */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>🎯</span> When to Use
          </h2>
          <ul className="space-y-3">
            {currentTense.usage.map((use, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-slate-300">{use}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Examples */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span>💡</span> Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentTense.examples.map((ex, i) => (
              <div key={i} className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
                <p className="text-slate-200 italic">"{ex}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Words */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span>⚡</span> Signal Words
          </h2>
          <div className="flex flex-wrap gap-2">
            {currentTense.signalWords.map((word, i) => (
              <span key={i} className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 px-3 py-1 rounded-full text-sm">
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Start Quiz Button */}
        <div className="text-center">
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-indigo-500/25"
          >
            Take the Quiz →
          </button>
          <p className="text-slate-500 mt-3 text-sm">{currentTense.quiz.length} questions</p>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transition-all ${animateCorrect ? 'bg-green-900/20' : ''} ${animateWrong ? 'bg-red-900/20' : ''}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-slate-400 text-sm">
            {currentTense.name}
          </div>
          <div className="flex items-center gap-4">
            {streak >= 2 && (
              <div className="text-orange-400 font-bold animate-pulse">
                🔥 {streak} streak!
              </div>
            )}
            <div className="text-slate-400 text-sm">
              {currentQuestionIndex + 1} / {currentTense.quiz.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / currentTense.quiz.length) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 mb-6">
          <p className="text-sm text-slate-400 mb-2">Fill in the blank:</p>
          <p className="text-2xl font-medium leading-relaxed">
            {currentQuestion!.sentence.split('___').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block mx-1 px-4 py-1 bg-indigo-500/20 border-b-2 border-indigo-400 rounded text-indigo-300 min-w-[80px] text-center">
                    {selectedAnswer !== null ? currentQuestion!.options[selectedAnswer] : '???'}
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {currentQuestion!.options.map((option, i) => {
            let buttonClass = 'bg-slate-800/60 border-slate-700 hover:border-indigo-500 hover:bg-slate-700/60';

            if (selectedAnswer !== null) {
              if (i === currentQuestion!.correctIndex) {
                buttonClass = 'bg-green-500/20 border-green-500 text-green-300';
              } else if (i === selectedAnswer && i !== currentQuestion!.correctIndex) {
                buttonClass = 'bg-red-500/20 border-red-500 text-red-300';
              } else {
                buttonClass = 'bg-slate-800/30 border-slate-800 opacity-50';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-xl border text-left font-medium transition-all duration-300 ${buttonClass} ${
                  selectedAnswer === null ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
                }`}
              >
                <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                {option}
                {selectedAnswer !== null && i === currentQuestion!.correctIndex && (
                  <span className="float-right">✓</span>
                )}
                {selectedAnswer === i && i !== currentQuestion!.correctIndex && (
                  <span className="float-right">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-xl p-5 mb-6 border ${
            selectedAnswer === currentQuestion!.correctIndex
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <p className="font-bold mb-2">
              {selectedAnswer === currentQuestion!.correctIndex ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className="text-slate-300">{currentQuestion!.explanation}</p>
          </div>
        )}

        {/* Next Button */}
        {selectedAnswer !== null && (
          <div className="text-center">
            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105"
            >
              {currentQuestionIndex < currentTense.quiz.length - 1 ? 'Next Question →' : 'See Results →'}
            </button>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-6xl mb-6">
            {percentage === 100 ? '🏆' : percentage >= 75 ? '🎉' : percentage >= 50 ? '👍' : '📚'}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {percentage === 100 ? 'Perfect Score!' : percentage >= 75 ? 'Great Job!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
          </h1>
          <p className="text-slate-400 mb-6">{currentTense.name}</p>

          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold mb-2">
              <span className={percentage >= 75 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                {lastResult.score}/{lastResult.total}
              </span>
            </div>
            <p className="text-slate-400">{percentage}% correct</p>

            <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            <div className="mt-4 text-yellow-400 font-bold">+{xpEarned} XP</div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={startQuiz}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              Retry Quiz
            </button>
            <button
              onClick={goToNextTense}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105"
            >
              {currentTenseIndex < tenses.length - 1 ? 'Next Tense →' : 'Back to Menu'}
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="text-slate-500 hover:text-white transition-colors py-2"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="text-8xl mb-6">🎓</div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Congratulations!
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          You've completed all 12 English verb tenses! You're now a Tense Master!
        </p>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-8">
          <p className="text-3xl font-bold text-yellow-400 mb-2">{totalXP} XP</p>
          <p className="text-slate-400">Total Experience Earned</p>
        </div>
        <button
          onClick={() => setGameState('menu')}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all hover:scale-105"
        >
          Back to Menu
        </button>
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
