import { PlayerAnalysis } from '../../models/PlayerAnalysis';

/**
 * AI-5: 감정 조각 업데이트
 * 추출된 감정 키워드를 PlayerAnalysis의 emotionShards 맵에 업데이트합니다.
 * @param playerAnalysisId - 업데이트할 PlayerAnalysis 문서의 ID
 * @param emotionKeyword - 추가할 감정 키워드
 * @returns 업데이트된 PlayerAnalysis 문서
 */
export async function updateEmotionShards(
  playerAnalysisId: string,
  emotionKeyword: string
) {
  try {
    // emotionKeyword가 비어있으면 업데이트하지 않음
    if (!emotionKeyword) {
      return;
    }

    const playerAnalysis = await PlayerAnalysis.findById(playerAnalysisId);

    if (!playerAnalysis) {
      throw new Error('PlayerAnalysis not found.');
    }

    // emotionShards 맵에서 해당 키워드의 카운트를 1 증가시킴
    // 기존 값이 없으면 1로 초기화
    const currentCount = playerAnalysis.emotionShards.get(emotionKeyword) || 0;
    playerAnalysis.emotionShards.set(emotionKeyword, currentCount + 1);

    // 변경된 맵을 저장하기 위해 markModified 사용
    playerAnalysis.markModified('emotionShards');
    
    await playerAnalysis.save();

    return playerAnalysis;
  } catch (error) {
    console.error('Error in updateEmotionShards:', error);
    throw new Error('Failed to update emotion shards.');
  }
}