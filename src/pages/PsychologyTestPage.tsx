import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, GameSessionData } from '../contexts/GameContext';
import { api } from '../utils/api';
import psychologyQuestions from '../data/psychologyQuestions.json';
import styles from './PsychologyTestPage.module.css';

interface Choice {
  text: string;
  value: string;
}

interface Question {
  id: number;
  question: string;
  choices: Choice[];
}

const PsychologyTestPage: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useGame();
  const navigate = useNavigate();

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < psychologyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== psychologyQuestions.length) {
      setError('모든 질문에 답변해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.post<GameSessionData>('/psychology/complete', { answers });
      dispatch({ type: 'SET_SESSION', payload: result });
      navigate('/play');
    } catch (err) {
      setError(err instanceof Error ? err.message : '캐릭터 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion: Question = psychologyQuestions[currentQuestionIndex];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.testContainer}>
        <h2 className={styles.title}>마음의 연결</h2>
        <p className={styles.subtitle}>당신과 닮은 존재를 찾기 위한 몇 가지 질문입니다.</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.questionCard}>
          <p className={styles.questionText}>{`Q${currentQuestionIndex + 1}. ${currentQuestion.question}`}</p>
          <div className={styles.options}>
            {currentQuestion.choices.map((option: Choice) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(String(currentQuestion.id), option.text)}
                className={styles.optionButton}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${((currentQuestionIndex + 1) / psychologyQuestions.length) * 100}%` }}
          />
        </div>
        <p className={styles.progressText}>{`${currentQuestionIndex + 1} / ${psychologyQuestions.length}`}</p>
        
        {currentQuestionIndex === psychologyQuestions.length - 1 && (
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || Object.keys(answers).length !== psychologyQuestions.length} 
            className={styles.submitButton}
          >
            {isLoading ? '연결 중...' : '결과 보기'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PsychologyTestPage;
