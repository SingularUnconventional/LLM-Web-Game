import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionsData from '../data/psychologyQuestions.json';
import { api } from '../utils/api';
import { PsychologyTestResponse } from '../types/api';
import { useGame } from '../contexts/GameContext';
import styles from './PsychologyTestPage.module.css';

interface Question {
  id: number;
  question: string;
  choices: { text: string; value: string }[];
}

const PsychologyTestPage: React.FC = () => {
  const { gameSession, dispatch } = useGame();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion: Question = questionsData[currentQuestionIndex];
  const allQuestionsAnswered = Object.keys(answers).length === questionsData.length;

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAnswers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedAnswers = questionsData.map(q => ({
        question: q.question,
        answer: answers[q.id],
      }));
      
      const response = await api.psychology.submitAnswers(formattedAnswers) as PsychologyTestResponse;
      
      if (response.status === 'new_night_started') {
        // Update game context with new game state and character
        dispatch({ type: 'SET_SESSION', payload: response.gameState });
        dispatch({ type: 'SET_TIME_OF_DAY', payload: 'night' }); // Transition to night
        navigate('/game'); // Navigate to game play page
      }
    } catch (err) {
      console.error('Failed to submit psychology test answers:', err);
      setError('답변 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure gameSession is updated if coming from a different route
  useEffect(() => {
    if (gameSession?.currentPhase === 'DAY_PSYCHOLOGY_TEST') {
      // This page is meant to be shown during DAY_PSYCHOLOGY_TEST phase
    } else if (gameSession && gameSession.currentPhase !== 'DAY_PSYCHOLOGY_TEST') {
      // If game state is not in psychology test phase, navigate away
      navigate('/game'); // Or appropriate default page
    }
  }, [gameSession, navigate]);

  if (!currentQuestion) {
    return <div className={styles.psychologyTestPage}>질문을 로드하는 중...</div>;
  }

  return (
    <div className={styles.psychologyTestPage}>
      <h2 className={styles.questionTitle}>심리 테스트</h2>
      <div className={styles.questionContainer}>
        <p className={styles.questionText}>{currentQuestion.question}</p>
        <div className={styles.choicesContainer}>
          {currentQuestion.choices.map(choice => (
            <label key={choice.value} className={styles.choiceLabel}>
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={choice.value}
                checked={answers[currentQuestion.id] === choice.value}
                onChange={() => handleAnswerChange(currentQuestion.id, choice.value)}
                className={styles.choiceInput}
              />
              {choice.text}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.navigationButtons}>
        {currentQuestionIndex > 0 && (
          <button onClick={handlePreviousQuestion} className={styles.navButton} disabled={isLoading}>
            이전
          </button>
        )}
        {currentQuestionIndex < questionsData.length - 1 && (
          <button onClick={handleNextQuestion} className={styles.navButton} disabled={isLoading || !answers[currentQuestion.id]}>
            다음
          </button>
        )}
        {allQuestionsAnswered && (
          <button onClick={handleSubmitAnswers} className={styles.submitButton} disabled={isLoading}>
            {isLoading ? '제출 중...' : '답변 제출'}
          </button>
        )}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default PsychologyTestPage;