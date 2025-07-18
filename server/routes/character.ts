import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getAllCharacters,
  getCharacterDetails,
  createNewCharacter,
} from '../controllers/characterController';

const router = express.Router();

/**
 * @route   GET /api/character
 * @desc    사용자의 모든 캐릭터 목록 가져오기 (상태별 쿼리 가능 ?status=ongoing)
 * @access  Private
 */
router.get('/', authMiddleware, getAllCharacters);

/**
 * @route   POST /api/character
 * @desc    새로운 캐릭터 생성
 * @access  Private
 */
router.post('/', authMiddleware, createNewCharacter);

/**
 * @route   GET /api/character/:characterId
 * @desc    특정 캐릭터의 상세 정보 및 대화 기록 가져오기
 * @access  Private
 */
router.get('/:characterId', authMiddleware, getCharacterDetails);

export default router;
