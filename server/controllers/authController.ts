import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_default_secret', {
    expiresIn: '30d',
  });
};

class AuthController {
  // @desc    Register a new user
  // @route   POST /api/auth/register
  // @access  Public
  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  });

  // @desc    Authenticate a user
  // @route   POST /api/auth/login
  // @access  Public
  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  });
  
  // @desc    Get user data
  // @route   GET /api/auth/me
  // @access  Private
  // TODO: Add a middleware to protect this route
  getMe = asyncHandler(async (req: any, res: Response) => {
    // const user = await User.findById(req.user.id).select('-password');
    // res.status(200).json(user);
    res.status(200).json({ message: 'This is a protected route' });
  });
}

export default new AuthController();
