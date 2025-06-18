import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Нет токена' });

    const token = authHeader.split(' ')[1]; // "Bearer <token>"

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // кладём данные пользователя в req
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Недействительный токен' });
    }
}

export default authMiddleware;
