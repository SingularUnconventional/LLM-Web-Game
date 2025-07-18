import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import questionsData from '../data/psychologyQuestions.json';
import styles from './PsychologyTestPage.module.css';

interface Question {
  id: number;
  question: string;
  choices: { text: string; value: string }[];
}

const PsychologyTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { startGame, isLoading, error } = useGame();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion: Question = questionsData[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, answerValue: string) => {
    const newAnswers = { ...answers, [questionId]: answerValue };
    setAnswers(newAnswers);

    // 답변을 선택하면 자동으로 다음 질문으로 넘어감
    if (currentQuestionIndex < questionsData.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questionsData.length) {
      alert('모든 질문에 답변해주세요.');
      return;
    }

    // 모든 질문과 답변을 하나의 문자열로 조합
    const testResult = questionsData
      .map(q => `Q: ${q.question}\nA: ${answers[q.id]}`)
      .join('\n\n');

    try {
      await startGame(testResult);
      alert('게임이 시작되었습니다! 당신의 첫번째 이야기를 확인해보세요.');
      navigate('/'); // 게임 시작 후 홈으로 이동
    } catch (err) {
      // 에러는 GameContext에서 처리하므로 여기서는 추가 처리 불필요
      alert('게임 시작에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const progress = ((currentQuestionIndex + 1) / questionsData.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${progress}%` }}></div>
      </div>
      <div className={styles.questionCard}>
        <h2 className={styles.questionNumber}>Question {currentQuestionIndex + 1}</h2>
        <p className={styles.questionText}>{currentQuestion.question}</p>
        <div className={styles.choices}>
          {currentQuestion.choices.map((choice) => (
            <button
              key={choice.value}
              className={`${styles.choiceButton} ${answers[currentQuestion.id] === choice.value ? styles.selected : ''}`}
              onClick={() => handleAnswerSelect(currentQuestion.id, choice.value)}
              disabled={isLoading}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
      {currentQuestionIndex === questionsData.length - 1 && (
        <button
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={isLoading || Object.keys(answers).length !== questionsData.length}
        >
          {isLoading ? '분석 중...' : '결과 분석하고 이야기 시작하기'}
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default PsychologyTestPage;