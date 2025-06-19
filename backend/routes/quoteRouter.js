import express from 'express';

const router = express.Router();

// Получение цитат
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT global_name, discord_id, avatar, quote, role FROM users',
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Данные не найдены' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения цитат:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Сохранение цитаты
router.post('/', async (req, res) => {
    const { discord_id, quote } = req.body;

    // Проверяем наличие куки discord_token
    if (!req.cookies || !req.cookies['discord_token']) {
        return res
            .status(401)
            .json({ error: 'Токен доступа отсутствует в куках' });
    }
    const userCookie = req.cookies['discord_token']; // Получаем токен из куков

    if (!discord_id || !quote) {
        return res
            .status(400)
            .json({ error: 'Не указаны обязательные данные' });
    }
    if (quote.length > 70) {
        return res
            .status(400)
            .json({ error: 'Цитата должна быть до 70 символов' });
    }

    try {
        // Проверяем пользователя по токену
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE discord_id = ? AND access_token = ?',
            [discord_id, userCookie],
        );

        if (rows.length === 0) {
            return res.status(403).json({
                error: 'Несоответствие идентификаторов или недействительный токен',
            });
        }

        // Обновляем цитату
        await db.execute('UPDATE users SET quote = ? WHERE discord_id = ?', [
            quote,
            discord_id,
        ]);

        res.status(200).json({ message: 'Цитата успешно сохранена' });
    } catch (error) {
        console.error('Ошибка сохранения цитаты:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
export default router;
