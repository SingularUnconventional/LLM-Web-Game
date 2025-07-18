import { ICharacter } from '../../models/Character';
import { IPlayerAnalysis } from '../../models/PlayerAnalysis';

// 엔딩 조건 타입 정의
export type EndingConditionResult = {
  shouldEnd: boolean;
  reason: 'counseling_limit' | 'specific_emotion' | 'none';
};

const COUNSELING_LIMIT = 10; // 최대 상담 횟수 (예시)

/**
 * AI-7: 엔딩 조건 확인
 * 상담이 엔딩으로 분기해야 하는지 조건을 확인합니다.
 * @param character - 현재 캐릭터 정보
 * @param playerAnalysis - 현재 플레이어 분석 정보
 * @returns 엔딩 조건 충족 여부와 이유
 */
export async function checkEndingCondition(
  character: ICharacter,
  playerAnalysis: IPlayerAnalysis
): Promise<EndingConditionResult> {
  // 조건 1: 상담 횟수가 최대치에 도달했는가?
  if (character.counselingCount >= COUNSELING_LIMIT) {
    return {
      shouldEnd: true,
      reason: 'counseling_limit',
    };
  }

  // 조건 2: 특정 감정 조각을 3개 이상 획득했는가? (예시)
  // if ((playerAnalysis.emotionShards.get('안정') || 0) >= 3) {
  //   return {
  //     shouldEnd: true,
  //     reason: 'specific_emotion',
  //   };
  // }

  // 모든 조건에 해당하지 않으면 엔딩 아님
  return {
    shouldEnd: false,
    reason: 'none',
  };
}