import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
});

router.post('/', async (req, res) => {
    const { discord_id } = req.body;

    if (!discord_id) {
        return res.status(400).json({ error: 'Не указан discord_id' });
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE discord_id = ?',
            [discord_id],
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('discord_user');
    res.clearCookie('discord_token');
    res.status(200).json({ success: true });
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const [existingUser] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR name = ?',
            [email, username],
        );
        console.log(existingUser[0]);
        if (existingUser[0]) {
            return res
                .status(409)
                .json({ error: 'Пользователь уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
        );
        const token = jwt.sign({ id: result.id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ user: result, token, wallets: null });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db
            .execute('SELECT * FROM users WHERE name = ?', [username])
            .then((rows) => rows[0][0]);
        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        const [wallets] = await db.execute(
            'SELECT * FROM wallets WHERE user_id = ?',
            [user.id],
        );

        res.json({ user, token, wallets: wallets[0] ? wallets : null });
    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.get('/accesstoken', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Нет токена' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const [rows] = await db.execute(
            'SELECT id, name, email FROM users WHERE id = ?',
            [userId],
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const [wallets] = await db.execute(
            'SELECT * FROM wallets WHERE user_id = ?',
            [userId],
        );

        return res.json({
            user: rows[0],
            wallets: wallets[0] ? wallets : null,
        });
    } catch (err) {
        return res.status(401).json({
            error: 'Неверный или просроченный токен',
            err: err.message,
        });
    }
});

export default router;
