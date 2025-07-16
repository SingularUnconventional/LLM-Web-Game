import React, { useState } from 'react';
import questions from '@/data/psychologyQuestions.json';
import { api } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import styles from './PsychologyTest.module.css';
import { useGame } from '@/contexts/GameContext';

interface Question {
  id: number;
  question: string;
  choices: { text: string; value: string }[];
}

const PsychologyTest: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();
  const { setGameSession } = useGame();

  const handleAnswer = async (answerValue: string) => {
    const newAnswers = [...answers, answerValue];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Test completed, send answers to backend
      try {
        const result = await api.post('/psychology/complete', { answers: newAnswers });
        console.log('Character generated:', result);
        setGameSession(result); // Save character data to context
        navigate('/play');
      } catch (error) {
        console.error('Error submitting psychology test:', error);
        alert('심리 테스트 제출 중 오류가 발생했습니다.');
      }
    }
  };

  const currentQuestion: Question = questions[currentQuestionIndex];

  return (
    <div className={styles.psychologyTestContainer}>
      <h2>{currentQuestion.question}</h2>
      <div className={styles.choices}>
        {currentQuestion.choices.map((choice) => (
          <button key={choice.value} onClick={() => handleAnswer(choice.value)}>
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PsychologyTest;
