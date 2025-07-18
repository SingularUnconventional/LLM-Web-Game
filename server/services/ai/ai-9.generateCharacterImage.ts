import { getPrompt } from '../promptService';
import { gemini } from '../../config/gemini';

/**
 * AI-9: 캐릭터 이미지 생성
 * 캐릭터의 이름과 설명을 바탕으로 이미지를 생성하는 프롬프트를 만들고,
 * 이미지 생성 AI를 호출하여 이미지 URL을 반환합니다.
 * @param characterName - 캐릭터 이름
 * @param characterDescription - 캐릭터 설명
 * @returns 생성된 이미지의 URL (또는 Base64 데이터)
 */
export async function generateCharacterImage(
  characterName: string,
  characterDescription: string
): Promise<string> {
  try {
    // 1. 이미지 생성을 위한 프롬프트 가져오기
    const prompt = await getPrompt('9_character_image_generation', {
      name: characterName,
      description: characterDescription,
    });

    // 2. Gemini 이미지 생성 모델 호출 (예시: 'gemini-pro-vision'은 텍스트/이미지 입력 모델, 실제 이미지 생성은 다른 모델일 수 있음)
    //    실제 Vertex AI나 다른 이미지 생성 API를 사용해야 함. 여기서는 가상으로 구현.
    const model = gemini.getGenerativeModel({ model: 'gemini-pro-vision' }); // 실제로는 이미지 생성 모델 사용 필요
    
    console.log(`[Image Gen] Generating image with prompt: ${prompt}`);
    
    // --- 가상 이미지 생성 로직 ---
    // 실제 API 호출 대신, 플레이스홀더 이미지 URL을 반환합니다.
    // 통합 시 이 부분을 실제 이미지 생성 API 호출로 교체해야 합니다.
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(characterName)}/512`;
    // --- 가상 로직 끝 ---

    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const imageUrl = response.text(); // API 응답에서 URL 추출

    return imageUrl;
  } catch (error) {
    console.error('Error in generateCharacterImage:', error);
    // 실제 이미지 생성 실패 시 기본 이미지 반환
    return 'https://picsum.photos/seed/default/512';
  }
}