import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import styles from './InitialCounselingPage.module.css'; // Reusing styles
import { Message, CounselingChatResponse, InitialCounselingSubmitResponse } from '../types/api';

const InitialCounselingPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set the initial AI message
    setMessages([
      { speaker: 'ai', message: '안녕하세요, 여행자님. 잠시 쉬어가도 좋은 곳이에요. 이곳에서는 마음의 소리에 귀를 기울일 수 있답니다. 당신은 어떤 이야기를 하고 싶으신가요?' }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { speaker: 'user', message: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response: CounselingChatResponse = await api.counseling.postInitialChatMessage(newMessages);
      const aiMessage: Message = { speaker: 'ai', message: response.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { speaker: 'ai', message: '죄송합니다, 응답을 생성하는 데 실패했습니다. 잠시 후 다시 시도해주세요.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCounseling = async () => {
    if (isLoading || messages.length < 2) return; // User must have at least one exchange with AI
    setIsLoading(true);
    try {
      // Use the new game service endpoint
      const response = await api.game.submitInitialCounseling(messages) as InitialCounselingSubmitResponse;
      alert('상담이 성공적으로 분석되었습니다. 이제 당신의 첫 번째 이야기를 시작합니다.');
      // Navigate to the main game play page with the initial data
      navigate('/play', { state: { gameData: response } });
    } catch (error) {
      console.error('Error submitting counseling log:', error);
      alert('분석 요청에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
    // No need to set isLoading to false if navigation is successful
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.chatInterfaceContainer}>
        <h1 className={styles.pageTitle}>첫 번째 대화</h1>
        <p className={styles.pageDescription}>AI 안내자와의 대화를 통해 당신의 이야기를 들려주세요. 대화가 충분하다고 느껴지면 '대화 종료' 버튼을 눌러주세요.</p>
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.messageBubble} ${msg.speaker === 'user' ? styles.ai : styles.user}`}>
              <p>{msg.message}</p>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageBubble} ${styles.ai} ${styles.typingIndicator}`}>
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className={styles.messageInput}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); }}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? '...' : '전송'}
          </button>
        </div>
        <button onClick={handleEndCounseling} disabled={isLoading || messages.length < 3} className={styles.endButton}>
          대화 종료 및 분석 요청
        </button>
      </div>
    </div>
  );
};

export default InitialCounselingPage;
