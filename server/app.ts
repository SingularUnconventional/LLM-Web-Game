import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
config(); // Ensure dotenv is configured as early as possible

import connectDB from './config/db';
import errorHandler from './middleware/errorMiddleware';

// Route imports
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import characterRoutes from './routes/character';

connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/character', characterRoutes);

app.get('/api', (req, res) => {
  res.send('Hello from the server!');
});

// Error Handler Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
