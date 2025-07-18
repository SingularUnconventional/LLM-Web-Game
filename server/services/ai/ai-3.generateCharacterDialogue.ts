import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';
import { ICharacter } from '../../models/Character';
import { IPlayerAnalysis } from '../../models/PlayerAnalysis';
import { ICounselingLog } from '../../models/CounselingLog';

/**
 * AI-3: 캐릭터 대화 생성
 * 현재까지의 상담 내용과 플레이어 분석을 바탕으로 캐릭터의 다음 대사를 생성합니다.
 * @param character - 현재 대화 중인 캐릭터 정보
 * @param playerAnalysis - 현재 플레이어 분석 데이터
 * @param counselingHistory - 최근 상담 기록 (e.g., 마지막 5턴)
 * @param userMessage - 사용자의 현재 메시지
 * @returns 생성된 AI 캐릭터의 응답 메시지
 */
export async function generateCharacterDialogue(
  character: ICharacter,
  playerAnalysis: IPlayerAnalysis,
  counselingHistory: ICounselingLog[],
  userMessage: string
): Promise<string> {
  try {
    // 1. 프롬프트에 필요한 데이터 조합
    const promptData = {
      characterName: character.name,
      characterDescription: character.description,
      playerAnalysis: playerAnalysis.ongoingAnalysis,
      counselingHistory: counselingHistory.map(log => ({
        speaker: 'user',
        message: log.userMessage,
      }, {
        speaker: 'ai',
        message: log.aiMessage,
      })),
      userMessage,
    };

    // 2. 프롬프트 가져오기
    const prompt = await getPrompt('3_character_dialogue', promptData);

    // 3. Gemini API 호출
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiMessage = response.text();

    // 4. 결과 반환
    return aiMessage;
  } catch (error) {
    console.error('Error in generateCharacterDialogue:', error);
    throw new Error('Failed to generate character dialogue.');
  }
}