import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    사용자 회원가입
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    사용자 로그인
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    현재 로그인된 사용자 정보 가져오기
 * @access  Private
 */
router.get('/me', authMiddleware, getMe);

export default router;
