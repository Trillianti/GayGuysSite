import { Router } from 'express';
import { playSlots } from '../services/slotService.js';

const router = Router();

router.post('/spin', (req, res) => {
    const { bet } = req.body;

    if (!bet || isNaN(bet) || bet <= 0) {
        return res.status(400).json({ error: 'Некорректная ставка' });
    }

    const result = playSlots(Number(bet));
    res.json(result);
});

export default router;
