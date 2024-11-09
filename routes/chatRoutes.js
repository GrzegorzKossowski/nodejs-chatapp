import express from 'express';
import { testController } from '../controllers/chatController.js';

const router = express.Router();

router.route('/').get(testController)

export default router