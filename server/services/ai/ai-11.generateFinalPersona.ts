import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';
import { PlayerAnalysis, IPlayerAnalysis } from '../../models/PlayerAnalysis';

/**
 * AI-11: 최종 페르소나 생성
 * 플레이어의 모든 분석 기록과 감정 조각을 종합하여 최종 페르소나를 생성합니다.
 * @param playerAnalysisId - 대상 PlayerAnalysis 문서의 ID
 * @returns 생성된 최종 페르소나 문자열
 */
export async function generateFinalPersona(
  playerAnalysisId: string
): Promise<string> {
  try {
    const playerAnalysis = await PlayerAnalysis.findById(playerAnalysisId);
    if (!playerAnalysis) {
      throw new Error('PlayerAnalysis not found.');
    }

    // 1. 프롬프트 데이터 준비
    const promptData = {
      initialAnalysis: playerAnalysis.initialAnalysis,
      ongoingAnalysis: playerAnalysis.ongoingAnalysis,
      emotionShards: Object.fromEntries(playerAnalysis.emotionShards),
    };

    // 2. 프롬프트 가져오기
    const prompt = await getPrompt('11_final_persona_generation', promptData);

    // 3. Gemini API로 최종 페르소나 생성
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const finalPersona = response.text().trim();

    // 4. PlayerAnalysis 문서에 최종 페르소나 저장
    playerAnalysis.finalPersona = finalPersona;
    await playerAnalysis.save();

    return finalPersona;
  } catch (error) {
    console.error('Error in generateFinalPersona:', error);
    throw new Error('Failed to generate final persona.');
  }
}
