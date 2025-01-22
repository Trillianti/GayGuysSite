const express = require('express');
const axios = require('axios');
const cors = require('cors');
const db = require('./db'); // Подключение к базе данных
require('dotenv').config({ path: '../.env' });
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({
    origin: process.env.VITE_MAIN_URL, // URL вашего фронтенда
    credentials: true, // Разрешить передачу cookies
}));
app.use(express.json());
app.use(cookieParser());
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URL;

const roleMapping = {
    "1133370743481184326": 1, // Высший приоритет
    "1093160551800111104": 2,
    "1133375386525384734": 3,
    "1093158986204844073": 4, // Низший приоритет
};

function getRoleId(roles) {
    if (!roles || !Array.isArray(roles)) {
        console.warn("Неверный формат ролей или роли отсутствуют");
        return null;
    }

    for (const [roleId, mappedId] of Object.entries(roleMapping)) {
        if (roles.includes(roleId)) {
            return mappedId;
        }
    }

    console.warn("Роль пользователя не найдена в маппинге");
    return null;
}

// Авторизация через Discord
app.get("/auth/discord/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ error: "Authorization code not provided" });
    }

    try {
        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userData = userResponse.data;

        const guildMemberResponse = await axios.get(
            `https://discord.com/api/guilds/1051792766130208859/members/${userData.id}`,
            {
                headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
            }
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
            ]
        );

        res.cookie("discord_user", JSON.stringify(userData), {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.cookie("discord_token", accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.redirect(process.env.VITE_MAIN_URL);
    } catch (error) {
        console.error("Ошибка авторизации:", error?.response?.data || error.message);
        res.status(500).json({ error: "Ошибка авторизации" });
    }
});

// Получение списка пользователей
app.get("/users", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        console.error("Ошибка получения пользователей:", error);
        res.status(500).json({ error: "Ошибка получения пользователей" });
    }
});

// Выход из системы
app.get("/logout", (req, res) => {
    res.clearCookie("discord_user");
    res.clearCookie("discord_token");
    res.status(200).json({ success: true });
});

// Получение данных пользователя
app.post("/get-user", async (req, res) => {
    const { discord_id } = req.body;

    if (!discord_id) {
        return res.status(400).json({ error: "Не указан discord_id" });
    }

    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE discord_id = ?", [discord_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Ошибка получения пользователя:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Получение цитат
app.get("/get-quotes", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT global_name, discord_id, avatar, quote, role FROM users");

        if (rows.length === 0) {
            return res.status(404).json({ error: "Данные не найдены" });
        }

        res.json(rows);
    } catch (error) {
        console.error("Ошибка получения цитат:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Сохранение цитаты
app.post("/save-quote", async (req, res) => {
    const { discord_id, quote } = req.body;

    // Проверяем наличие куки discord_token
    if (!req.cookies || !req.cookies["discord_token"]) {
        return res.status(401).json({ error: "Токен доступа отсутствует в куках" });
    }
    console.log(quote.length)
    const userCookie = req.cookies["discord_token"]; // Получаем токен из куков

    if (!discord_id || !quote) {
        return res.status(400).json({ error: "Не указаны обязательные данные" });
    }
    if (quote.length > 70) {
        return res.status(400).json({ error: "Цитата должна быть до 70 символов" });
    }

    try {
        // Проверяем пользователя по токену
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE discord_id = ? AND access_token = ?",
            [discord_id, userCookie]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: "Несоответствие идентификаторов или недействительный токен" });
        }

        // Обновляем цитату
        await db.execute("UPDATE users SET quote = ? WHERE discord_id = ?", [quote, discord_id]);

        res.status(200).json({ message: "Цитата успешно сохранена" });
    } catch (error) {
        console.error("Ошибка сохранения цитаты:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});


// Запуск сервера
app.listen(50001, () => {
    console.log("Server start on port 50001");
});
