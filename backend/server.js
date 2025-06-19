import express from 'express';
import axios from 'axios';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config({ path: '../.env' });

import userRoutes from './routes/auth.js';
import walletRoutes from './routes/wallets.js';
import ggcRoutes from './routes/ggc.js';
import tokenRoutes from './routes/token.js';
import publicProfileRoutes from './routes/publicProfile.js';
import slotsRouter from './routes/slots.js';
import chatRouter from './routes/aiChat.js';
import quoteRouter from './routes/quoteRouter.js';

const app = express();

app.use(
    cors({
        origin: process.env.VITE_MAIN_URL,
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URL;

const roleMapping = {
    '1133370743481184326': 1, // Высший приоритет
    '1093160551800111104': 2,
    '1133375386525384734': 3,
    '1093158986204844073': 4, // Низший приоритет
};

function getRoleId(roles) {
    if (!roles || !Array.isArray(roles)) {
        console.warn('Неверный формат ролей или роли отсутствуют');
        return null;
    }

    for (const [roleId, mappedId] of Object.entries(roleMapping)) {
        if (roles.includes(roleId)) {
            return mappedId;
        }
    }

    console.warn('Роль пользователя не найдена в маппинге');
    return null;
}

// Новые API-маршруты
app.use('/users', userRoutes);
app.use('/wallet', walletRoutes);
app.use('/ggc', ggcRoutes);
app.use('/tokens', tokenRoutes);
app.use('/profile', publicProfileRoutes);
app.use('/slots', slotsRouter);
app.use('/chat', chatRouter);
app.use('/qoute', quoteRouter);

// Авторизация через Discord
app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res
            .status(400)
            .json({ error: 'Authorization code not provided' });
    }

    try {
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get(
            'https://discord.com/api/users/@me',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        );

        const userData = userResponse.data;

        const guildMemberResponse = await axios.get(
            `https://discord.com/api/guilds/1051792766130208859/members/${userData.id}`,
            {
                headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
            },
        );

        const memberData = guildMemberResponse.data;
        const roles = memberData.roles;
        const role = getRoleId(roles);

        await db.execute(
            `INSERT INTO users (discord_id, global_name, username, avatar, access_token, coin, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             global_name = VALUES(global_name),
             username = VALUES(username),
             avatar = VALUES(avatar),
             access_token = VALUES(access_token),
             role = VALUES(role)`,
            [
                userData.id,
                userData.global_name || userData.username,
                userData.username,
                userData.avatar,
                accessToken,
                0, // Начальные монеты
                role,
            ],
        );

        res.cookie('discord_user', JSON.stringify(userData), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.cookie('discord_token', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        res.redirect(process.env.VITE_MAIN_URL);
    } catch (error) {
        console.error(
            'Ошибка авторизации:',
            error?.response?.data || error.message,
        );
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
});

const options = {
    key: fs.readFileSync('C:/nginx/certs/trillianti.key'), // Путь к приватному ключу
    cert: fs.readFileSync('C:/nginx/certs/trillianti.crt'), // Путь к сертификату
};

https.createServer(options, app).listen(50001, () => {
    console.log('HTTPS Server started on port 50001');
});
