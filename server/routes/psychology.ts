import { Router } from 'express';
import psychologyController from '../controllers/psychologyController';

const router = Router();

router.post('/complete', psychologyController.completeTest);

export default router;
