import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';
import { ICharacter } from '../../models/Character';
import { IPlayerAnalysis } from '../../models/PlayerAnalysis';

// 엔딩 정보 타입
export type EndingData = {
  endingType: string;
  title: string;
  content: string;
};

/**
 * AI-10: 엔딩 생성
 * 최종 페르소나와 캐릭터 정보를 바탕으로 엔딩을 생성합니다.
 * @param playerAnalysis - 플레이어의 최종 분석 데이터
 * @param character - 함께 엔딩을 맞이하는 캐릭터
 * @returns 생성된 엔딩 데이터 (종류, 제목, 내용)
 */
export async function generateEnding(
  playerAnalysis: IPlayerAnalysis,
  character: ICharacter
): Promise<EndingData> {
  try {
    // 1. 프롬프트 데이터 준비
    const promptData = {
      finalPersona: playerAnalysis.finalPersona,
      characterName: character.name,
      characterState: `상담을 ${character.counselingCount}번 진행하며 초기 상태에서 벗어남.`, // 캐릭터의 최종 상태 요약
    };

    // 2. 프롬프트 가져오기
    const prompt = await getPrompt('10_ending_generation', promptData);

    // 3. Gemini API로 엔딩 생성
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // 4. 결과 파싱 (JSON 형식이라고 가정)
    const endingData: EndingData = JSON.parse(rawText);

    if (!endingData.endingType || !endingData.title || !endingData.content) {
      throw new Error('Generated ending data is incomplete.');
    }

    return endingData;
  } catch (error) {
    console.error('Error in generateEnding:', error);
    throw new Error('Failed to generate ending.');
  }
}