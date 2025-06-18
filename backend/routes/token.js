import express from 'express';
import { createToken, getTokens } from '../controllers/tokenController.js';

const router = express.Router();

router.post('/', createToken);
router.get('/', getTokens);


export default router;
