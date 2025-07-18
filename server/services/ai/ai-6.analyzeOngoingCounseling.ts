import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';
import { PlayerAnalysis, IPlayerAnalysis } from '../../models/PlayerAnalysis';
import { ICounselingLog } from '../../models/CounselingLog';

/**
 * AI-6: 지속적 상담 분석
 * 누적된 상담 기록과 감정 조각을 바탕으로 플레이어 분석을 업데이트합니다.
 * @param playerAnalysis - 업데이트할 PlayerAnalysis 문서
 * @param recentLogs - 분석에 사용할 최근 상담 로그
 * @returns 업데이트된 PlayerAnalysis 문서
 */
export async function analyzeOngoingCounseling(
  playerAnalysis: IPlayerAnalysis,
  recentLogs: ICounselingLog[]
): Promise<IPlayerAnalysis> {
  try {
    // 1. 프롬프트 데이터 준비
    const promptData = {
      currentAnalysis: playerAnalysis.ongoingAnalysis,
      emotionShards: Object.fromEntries(playerAnalysis.emotionShards), // Map을 객체로 변환
      counselingLogs: recentLogs.map(log => ({
        user: log.userMessage,
        ai: log.aiMessage,
        emotion: log.emotionKeyword,
      })),
    };

    // 2. 프롬프트 가져오기
    const prompt = await getPrompt('6_ongoing_counseling_analysis', promptData);

    // 3. Gemini API로 새로운 분석 결과 생성
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const updatedAnalysis = response.text();

    // 4. PlayerAnalysis 업데이트 및 저장
    playerAnalysis.ongoingAnalysis = updatedAnalysis;
    await playerAnalysis.save();

    return playerAnalysis;
  } catch (error) {
    console.error('Error in analyzeOngoingCounseling:', error);
    throw new Error('Failed to analyze ongoing counseling.');
  }
}