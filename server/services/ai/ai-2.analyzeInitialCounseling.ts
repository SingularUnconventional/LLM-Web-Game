import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';
import { PlayerAnalysis, IPlayerAnalysis } from '../../models/PlayerAnalysis';

/**
 * AI-2: 초기 상담 분석
 * 초기 상담 내용을 분석하여 PlayerAnalysis를 생성하고 저장합니다.
 * @param userId - 분석을 진행할 사용자의 ID
 * @param initialCounselingText - 분석할 초기 상담 내용 (AI의 첫 대사)
 * @param userResponse - 사용자의 첫 응답
 * @returns 생성된 PlayerAnalysis 문서
 */
export async function analyzeInitialCounseling(
  userId: string,
  initialCounselingText: string,
  userResponse: string
): Promise<IPlayerAnalysis> {
  try {
    // 1. 프롬프트 가져오기
    const prompt = await getPrompt('2_initial_counseling_analysis', {
      initialCounselingText,
      userResponse,
    });

    // 2. Gemini API 호출하여 분석 결과 생성
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisResult = response.text();

    // 3. PlayerAnalysis 모델 생성 및 저장
    const newPlayerAnalysis = new PlayerAnalysis({
      userId,
      initialAnalysis: analysisResult,
      ongoingAnalysis: analysisResult, // 초기 분석 결과를 지속적 분석의 시작점으로 설정
    });

    await newPlayerAnalysis.save();

    // 4. 결과 반환
    return newPlayerAnalysis;
  } catch (error) {
    console.error('Error in analyzeInitialCounseling:', error);
    throw new Error('Failed to analyze initial counseling.');
  }
}
