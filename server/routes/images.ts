import { Router } from 'express';
import imageController from '../controllers/imageController';

const router = Router();

router.get('/:contentId', imageController.getImage);

export default router;
