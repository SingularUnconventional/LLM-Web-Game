import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';
import { Character } from '../../models/Character';
import { IPlayerAnalysis } from '../../models/PlayerAnalysis';

/**
 * AI-8: 새로운 동화 캐릭터 생성
 * 플레이어 분석 결과를 바탕으로 새로운 캐릭터의 이름, 설정을 생성합니다.
 * @param userId - 캐릭터를 소유할 사용자의 ID
 * @param playerAnalysis - 플레이어 분석 데이터
 * @returns 생성된 캐릭터의 정보 (이름, 설명)
 */
export async function generateNewCharacter(
  userId: string,
  playerAnalysis: IPlayerAnalysis
): Promise<{ name: string; description: string }> {
  try {
    // 1. 프롬프트 데이터 준비
    const promptData = {
      playerAnalysis: playerAnalysis.initialAnalysis, // 초기 분석 결과 사용
    };

    // 2. 프롬프트 가져오기
    const prompt = await getPrompt('8_new_character_generation', promptData);

    // 3. Gemini API로 캐릭터 정보 생성
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // 4. 결과 파싱 (JSON 형식이라고 가정)
    // 예: { "name": "상처 입은 어린 왕자", "description": "자신의 작은 별에서..." }
    const characterInfo = JSON.parse(rawText);

    if (!characterInfo.name || !characterInfo.description) {
      throw new Error('Generated character info is missing name or description.');
    }

    // 5. (DB 저장 없이) 생성된 정보 반환
    // 실제 저장은 이 함수를 호출하는 쪽에서 담당
    return {
      name: characterInfo.name,
      description: characterInfo.description,
    };
  } catch (error) {
    console.error('Error in generateNewCharacter:', error);
    throw new Error('Failed to generate new character.');
  }
}