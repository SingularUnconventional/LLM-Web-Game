import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ProtectedRequest } from '../middleware/authMiddleware';
import { Character } from '../models/Character';
import { CounselingLog } from '../models/CounselingLog';
import { PlayerAnalysis } from '../models/PlayerAnalysis';
import * as AI from '../services/ai';

/**
 * 사용자의 모든 캐릭터 목록을 가져옵니다.
 * 상태별로(ongoing, completed) 필터링할 수 있습니다.
 */
export const getAllCharacters = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!._id;
  const { status } = req.query; // 'ongoing', 'completed'

  const query: { userId: string; status?: string } = { userId };
  if (status && (status === 'ongoing' || status === 'completed')) {
    query.status = status as string;
  }

  const characters = await Character.find(query).sort({ createdAt: -1 });
  res.status(200).json(characters);
});

/**
 * 특정 캐릭터의 상세 정보와 모든 상담 기록을 가져옵니다.
 */
export const getCharacterDetails = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!._id;
  const { characterId } = req.params;

  const character = await Character.findOne({ _id: characterId, userId });
  if (!character) {
    return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
  }

  const counselingHistory = await CounselingLog.find({ characterId }).sort({ turn: 'asc' });

  res.status(200).json({
    character,
    counselingHistory,
  });
});

/**
 * 새로운 캐릭터를 생성합니다.
 * (예: 사용자가 특정 조건을 만족했을 때 호출)
 */
export const createNewCharacter = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const userId = req.user!._id;

    const playerAnalysis = await PlayerAnalysis.findOne({ userId });
    if (!playerAnalysis) {
        return res.status(400).json({ message: '새로운 캐릭터를 생성하려면 플레이어 분석 데이터가 필요합니다.' });
    }

    // 1. AI-8: 새 캐릭터 정보 생성
    const { name, description } = await AI.generateNewCharacter(userId, playerAnalysis);

    // 2. AI-9: 캐릭터 이미지 생성
    const imageUrl = await AI.generateCharacterImage(name, description);

    // 3. 새 캐릭터 DB에 저장
    const newCharacter = new Character({
        userId,
        name,
        description,
        imageUrl,
        status: 'ongoing', // 생성 후 바로 진행 가능
    });
    await newCharacter.save();

    res.status(201).json(newCharacter);
});