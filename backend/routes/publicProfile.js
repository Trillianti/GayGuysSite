// routes/publicProfile.js
import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/:discord_id', async (req, res) => {
    const { discord_id } = req.params;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE discord_id = ?',
            [discord_id],
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching public profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
