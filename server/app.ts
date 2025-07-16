import { Request, Response } from 'express';
import express from 'express';
const cors = require('cors');
import { config } from 'dotenv';
import psychologyRoutes from './routes/psychology';
import chatRoutes from './routes/chat';
import imagesRoutes from './routes/images';
import connectDB from './config/db';

config();

connectDB(); // Connect to MongoDB

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api/psychology', psychologyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/images', imagesRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.send('Hello from the server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
