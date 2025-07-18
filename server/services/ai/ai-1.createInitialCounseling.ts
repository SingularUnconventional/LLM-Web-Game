import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';

/**
 * AI-1: 초기 상담 시작
 * 심리 검사 결과를 바탕으로 첫 상담 메시지를 생성합니다.
 * @param testResult - 사용자의 심리 검사 결과 텍스트
 * @returns 생성된 초기 상담 메시지 (AI의 첫 대사)
 */
export async function createInitialCounseling(
  testResult: string
): Promise<string> {
  try {
    // 1. 프롬프트 가져오기
    const prompt = await getPrompt('1_initial_counseling', {
      testResult,
    });

    // 2. Gemini API 호출
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const initialCounselingText = response.text();

    // 3. 결과 반환
    return initialCounselingText;
  } catch (error) {
    console.error('Error in createInitialCounseling:', error);
    throw new Error('Failed to create initial counseling message.');
  }
}