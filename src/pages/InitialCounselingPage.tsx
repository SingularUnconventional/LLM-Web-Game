import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import styles from './InitialCounselingPage.module.css';
import { Message } from '../types/api';

const INTRO_TEXTS = [
  '지금, 당신의 마음과 연결할 준비가 되셨나요?',
  '당신은 이제부터 ‘꿈을 관통하는 관찰자’입니다.',
  '당신과 닮은 상처를 지닌 존재들의 꿈속으로 들어가게 됩니다.',
  '그들은 당신을 모르지만, 이상하게도 경계하지 않습니다.',
  '당신의 이야기가 그들의 밤을 어떻게 바꾸게 될까요?',
];

const InitialCounselingPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationOver, setIsConversationOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIntroSequence, setShowIntroSequence] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start with a greeting from the AI
    api.counseling.getHistory().then((history) => {
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            speaker: 'ai',
            message:
              '안녕하세요, 여행자님. 잠시 쉬어가도 좋은 곳이에요. 이곳에서는 마음의 소리에 귀를 기울일 수 있답니다. 당신은 어떤 이야기를 하고 싶으신가요?',
          },
        ]);
      }
    });

    return () => {
      // Cleanup polling on component unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isAnalyzing) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const status = await api.auth.getStatus();
          if (
            status.hasCompletedInitialCounseling &&
            status.activeCharacterId
          ) {
            if (pollingIntervalRef.current)
              clearInterval(pollingIntervalRef.current);
            setIsAnalyzing(false);
            setShowIntroSequence(true);
          }
        } catch (error) {
          console.error('Polling for status failed:', error);
          if (pollingIntervalRef.current)
            clearInterval(pollingIntervalRef.current);
          setIsAnalyzing(false);
          alert('게임 상태를 확인하는 데 실패했습니다. 다시 시도해주세요.');
        }
      }, 3000); // Poll every 3 seconds
    }
  }, [isAnalyzing]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { speaker: 'user', message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // The endpoint name `postInitialMessage` is for the entire initial counseling session.
      const response = await api.counseling.postInitialMessage(input);
      const aiMessage: Message = { speaker: 'ai', message: response.message };
      setMessages((prev) => [...prev, aiMessage]);
      if (response.endConversation) {
        setIsConversationOver(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        speaker: 'ai',
        message:
          '죄송합니다, 응답을 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysis = async () => {
    setIsLoading(true);
    try {
      await api.game.submitInitialCounseling();
      setIsAnalyzing(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting counseling log:', error);
      alert('분석 요청에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleNextIntro = () => {
    if (introStep < INTRO_TEXTS.length - 1) {
      setIntroStep((prev) => prev + 1);
    } else {
      navigate('/play');
    }
  };

  if (showIntroSequence) {
    return (
      <div className={styles.introContainer} onClick={handleNextIntro}>
        <p className={styles.introText}>{INTRO_TEXTS[introStep]}</p>
        <small className={styles.clickPrompt}>화면을 클릭하여 계속하기</small>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.chatInterfaceContainer}>
        <h1 className={styles.pageTitle}>첫 번째 대화</h1>
        <p className={styles.pageDescription}>
          AI 안내자와의 대화를 통해 당신의 이야기를 들려주세요. 대화가
          충분하다고 느껴지면 안내자가 알려줄 거예요.
        </p>
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageBubble} ${msg.speaker === 'user' ? styles.user : styles.ai}`}
            >
              <p>{msg.message}</p>
            </div>
          ))}
          {isLoading && !isConversationOver && (
            <div
              className={`${styles.messageBubble} ${styles.ai} ${styles.typingIndicator}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          {isAnalyzing && (
            <div className={`${styles.messageBubble} ${styles.ai}`}>
              <p>
                당신의 이야기를 분석하여 첫 번째 꿈을 준비하고 있습니다. 잠시만
                기다려주세요...
              </p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {!isConversationOver ? (
          <div className={styles.messageInput}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) handleSendMessage();
              }}
              placeholder="메시지를 입력하세요..."
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? '...' : '전송'}
            </button>
          </div>
        ) : (
          <div className={styles.analysisContainer}>
            <p className={styles.analysisText}>
              대화가 충분히 진행되었습니다. 이제 당신의 이야기를 바탕으로 첫
              여정을 시작할 준비를 합니다.
            </p>
            <button
              onClick={handleAnalysis}
              disabled={isLoading || isAnalyzing}
              className={styles.endButton}
            >
              {isLoading || isAnalyzing ? '분석 중...' : '분석하고 시작하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitialCounselingPage;
