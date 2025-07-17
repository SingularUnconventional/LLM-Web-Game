import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Message } from '../types/api';
import styles from './InitialCounselingPage.module.css'; // Reuse styles for consistency

const CounselingPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const history = await api.counseling.getHistory();
        if (history.length === 0) {
          setMessages([{ speaker: 'ai', message: '어서오세요. 어떤 이야기든 편하게 들려주세요.' }]);
        } else {
          setMessages(history);
        }
      } catch (error) {
        console.error("Failed to fetch counseling history:", error);
        setMessages([{ speaker: 'ai', message: '대화 기록을 불러오는 데 실패했습니다.' }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { speaker: 'user', message: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.counseling.postMessage(input);
      const aiMessage: Message = { speaker: 'ai', message: response.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { speaker: 'ai', message: '죄송합니다, 응답을 생성하는 데 실패했습니다.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.chatInterfaceContainer}>
        <h1 className={styles.pageTitle}>마음 상담소</h1>
        <p className={styles.pageDescription}>이곳에서의 대화는 당신의 다음 이야기에 영향을 주지 않습니다. 편하게 마음을 털어놓으��요.</p>
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.messageBubble} ${msg.speaker === 'user' ? styles.user : styles.ai}`}>
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
        <button onClick={() => navigate('/dashboard')} className={styles.endButton}>
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default CounselingPage;
