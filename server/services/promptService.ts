import fs from 'fs/promises';
import path from 'path';

const PROMPT_DIR = path.join(__dirname, '..', 'prompts');

/**
 * 지정된 이름의 프롬프트 파일 내용을 읽고, 주어진 데이터로 플레이스홀더를 채웁니다.
 * @param templateName - .txt 확장자를 제외한 프롬프트 파일 이름 (e.g., '1_initial_counseling')
 * @param data - 프롬프트의 {{placeholder}}를 대체할 데이터 객체
 * @returns 내용이 채워진 프롬프트 문자열
 */
export async function getPrompt(
  templateName: string,
  data: Record<string, any> = {}
): Promise<string> {
  const filePath = path.join(PROMPT_DIR, `${templateName}.txt`);

  try {
    const template = await fs.readFile(filePath, 'utf-8');

    // 템플릿의 {{key}} 플레이스홀더를 data 객체의 값으로 대체
    const filledPrompt = template.replace(/{{(.*?)}}/g, (match, key) => {
      const value = data[key.trim()];
      if (value === undefined || value === null) {
        console.warn(`[getPrompt] '${templateName}' 템플릿의 키 '${key.trim()}'에 해당하는 데이터가 없습니다.`);
        return match; // 데이터��� 없으면 플레이스홀더 유지
      }
      // 객체나 배열이면 JSON 문자열로 변환
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    });

    return filledPrompt;
  } catch (error) {
    console.error(`'${templateName}' 프롬프트를 로드하는 중 오류 발생:`, error);
    throw new Error(`Prompt template '${templateName}' not found or could not be read.`);
  }
}

