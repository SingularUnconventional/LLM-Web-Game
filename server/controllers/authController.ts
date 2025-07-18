import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { ProtectedRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { PlayerAnalysis } from '../models/PlayerAnalysis';

const generateToken = (id: string) => {
  // 환경 변수 사용을 권장
  const secret = process.env.JWT_SECRET || 'a-very-secret-key';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

/**
 * 새로운 사용자를 등록합니다.
 * User와 함께 비어있는 PlayerAnalysis를 생성하고 연결합니다.
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.' });
  }

  const userExists = await User.findOne({ $or: [{ email }, { nickname }] });
  if (userExists) {
    return res.status(400).json({ message: '이미 존재하는 이메일 또는 닉네임입니다.' });
  }

  // 1. 새로운 User 생성
  const user = new User({
    email,
    password,
    nickname,
  });

  // 2. 새로운 PlayerAnalysis 생성
  const playerAnalysis = new PlayerAnalysis({
    userId: user._id,
  });

  // 3. User에 PlayerAnalysis ID 연결
  user.playerAnalysis = playerAnalysis._id;

  // 4. 두 모델을 트랜잭션처럼 함께 저장 (하나라도 실패하면 롤백되도록)
  // 여기서는 간단하게 순차 저장으로 처리. 프로덕션에서는 트랜잭션 사용 고려.
  await user.save();
  await playerAnalysis.save();

  res.status(201).json({
    _id: user._id,
    nickname: user.nickname,
    email: user.email,
    token: generateToken(user._id.toString()),
  });
});

/**
 * 사용자를 인증(로그인)합니다.
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.status(200).json({
      _id: user._id,
      nickname: user.nickname,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  }
});

/**
 * 현재 로그인된 사용자의 정보를 가져옵니다.
 */
export const getMe = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  // authMiddleware를 통과하면 req.user에 사용자 정보가 담겨 있음
  const user = await User.findById(req.user!._id).select('-password');
  res.status(200).json(user);
});