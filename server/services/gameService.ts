import { User } from '../models/User';
import { Character, ICharacter } from '../models/Character';
import { PlayerAnalysis } from '../models/PlayerAnalysis';
import { CounselingLog } from '../models/CounselingLog';
import { Ending } from '../models/Ending';

import * as AI from './ai';

// --- 게임 시작 및 초기 설정 ---

/**
 * 심리 테스트 결과를 바탕으로 게임의 첫 단계를 시작합니다.
 * 1. 초기 상담 메시지 생성 (AI-1)
 * 2. 초기 상담 분석 (AI-2) -> PlayerAnalysis 생성
 * 3. 첫 동화 캐릭터 생성 (AI-8)
 * 4. 캐릭터 이미지 생성 (AI-9)
 * @param userId - 게임을 시작하는 사용자 ID
 * @param testResult - 심리 테스트 결과 텍스트
 */
export async function startGameWithTestResult(userId: string, testResult: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // 1. AI-1: 초기 상담 메시지 생성
  const initialCounselingText = await AI.createInitialCounseling(testResult);

  // 2. AI-2: 초기 상담 분석 (사용자의 첫 응답은 비어있는 상태로 시작)
  const playerAnalysis = await AI.analyzeInitialCounseling(
    userId,
    initialCounselingText,
    '(사용자�� 게임을 시작함)'
  );
  user.playerAnalysis = playerAnalysis._id;
  await user.save();

  // 3. AI-8: 첫 캐릭터 생성
  const { name, description } = await AI.generateNewCharacter(userId, playerAnalysis);

  // 4. AI-9: 캐릭터 이미지 생성
  const imageUrl = await AI.generateCharacterImage(name, description);

  // 5. 캐릭터 DB에 저장
  const newCharacter = new Character({
    userId,
    name,
    description,
    imageUrl,
    status: 'ongoing', // 첫 캐릭터는 바로 진행 중 상태
  });
  await newCharacter.save();

  return {
    initialCounselingText,
    character: newCharacter,
  };
}


// --- 핵심 대화 사이클 ---

/**
 * 사용자의 메시지를 처리하고 게임을 한 턴 진행합니다.
 * @param characterId - 대화 중인 캐릭터의 ID
 * @param userMessage - 사용자가 보낸 메시지
 */
export async function processTurn(characterId: string, userMessage: string) {
  const character = await Character.findById(characterId).populate<{ userId: { playerAnalysis: string } }>({
    path: 'userId',
    populate: { path: 'playerAnalysis' }
  });
  if (!character) throw new Error('Character not found');

  const playerAnalysis = await PlayerAnalysis.findById(character.userId.playerAnalysis);
  if (!playerAnalysis) throw new Error('PlayerAnalysis not found');

  const turn = character.counselingCount + 1;
  const history = await CounselingLog.find({ characterId }).sort({ turn: -1 }).limit(5);

  // 1. AI-3: 캐릭터 대화 생성
  const aiMessage = await AI.generateCharacterDialogue(character, playerAnalysis, history, userMessage);

  // 2. AI-4: 감정 키워드 추출
  const emotionKeyword = await AI.extractEmotionKeyword(userMessage, aiMessage);

  // 3. 상담 로그 저장
  const log = new CounselingLog({
    characterId,
    turn,
    userMessage,
    aiMessage,
    emotionKeyword,
  });
  await log.save();

  // 4. AI-5: 감정 조각 업데이트
  await AI.updateEmotionShards(playerAnalysis._id, emotionKeyword);

  // 5. 상담 횟수 증가
  character.counselingCount = turn;
  await character.save();

  // 6. 주기적인 심층 분석 (예: 3턴마다)
  if (turn % 3 === 0) {
    const recentLogs = await CounselingLog.find({ characterId }).sort({ turn: -1 }).limit(3);
    await AI.analyzeOngoingCounseling(playerAnalysis, recentLogs);
  }

  // 7. AI-7: 엔딩 조건 확인
  const endingCheck = await AI.checkEndingCondition(character, playerAnalysis);
  if (endingCheck.shouldEnd) {
    return await processEnding(character, playerAnalysis);
  }

  return {
    aiMessage,
    emotionKeyword,
    isEnding: false,
  };
}


// --- 엔딩 처리 ---

/**
 * 엔딩 절차를 진행합니다.
 * @param character - 엔딩을 맞이할 캐릭터
 * @param playerAnalysis - 플레이어 분석 데이터
 */
async function processEnding(character: ICharacter, playerAnalysis: any) {
  // 1. AI-11: 최종 페르소나 생성
  const finalPersona = await AI.generateFinalPersona(playerAnalysis._id);

  // 2. AI-10: 엔딩 생성
  const endingData = await AI.generateEnding(playerAnalysis, character);

  // 3. 엔딩 이미지 생성 (여기서는 캐릭터 이미지 재사용, 필요시 별도 생성)
  const endingImageUrl = character.imageUrl;

  // 4. 엔딩 정보 DB에 저장
  const newEnding = new Ending({
    userId: character.userId,
    characterId: character._id,
    finalPersona,
    endingType: endingData.endingType,
    title: endingData.title,
    content: endingData.content,
    imageUrl: endingImageUrl,
  });
  await newEnding.save();

  // 5. 캐릭터 상태 'completed'로 변경
  character.status = 'completed';
  await character.save();
  
  // 6. 사용자 정보에 완료된 캐릭터 추가
  await User.findByIdAndUpdate(character.userId, {
    $addToSet: { completedCharacterIds: character._id },
  });

  return {
    ending: newEnding,
    isEnding: true,
  };
}
