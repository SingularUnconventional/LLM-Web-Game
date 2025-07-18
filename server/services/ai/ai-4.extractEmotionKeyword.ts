import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';

/**
 * AI-4: 감정 키워드 추출
 * 한 턴의 대화에서 핵심 감정 키워드를 하나 추출합니다.
 * @param userMessage - 사용자의 메시지
 * @param aiMessage - AI의 응답 메시지
 * @returns 추출된 감정 키워드 (문자열)
 */
export async function extractEmotionKeyword(
  userMessage: string,
  aiMessage: string
): Promise<string> {
  try {
    // 1. 프롬프트 가져오기
    const prompt = await getPrompt('4_emotion_keyword_extraction', {
      userMessage,
      aiMessage,
    });

    // 2. Gemini API 호출
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // 3. 결과 파싱 및 반환
    // AI가 "키워드: 불안" 과 같은 형식으로 응답한다고 가정
    const rawText = response.text();
    const keyword = rawText.split(':').pop()?.trim() || '';

    if (!keyword) {
      console.warn('Emotion keyword extraction resulted in an empty string.');
    }

    return keyword;
  } catch (error) {
    console.error('Error in extractEmotionKeyword:', error);
    throw new Error('Failed to extract emotion keyword.');
  }
}