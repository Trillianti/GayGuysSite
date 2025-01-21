const express = require('express');
const axios = require('axios');
const cors = require('cors');
const db = require('./db'); // Подключение к базе данных
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors({
    origin: "https://walletellaw.store", // URL вашего фронтенда
    credentials: true, // Разрешить передачу cookies
}), express.json());

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
    // Проверяем роли в порядке приоритетности
    for (const [roleId, mappedId] of Object.entries(roleMapping)) {
        if (roles.includes(roleId)) {
            return mappedId; // Возвращаем ID роли, если она найдена
        }
    }
    return null; // Если ничего не найдено
}
  

// Авторизация через Discord
app.get("/api/auth/discord/callback", async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send("Authorization code not provided");
    }

    try {
        // Обмен кода на токен
        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
            }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // Получаем данные пользователя
        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userData = userResponse.data;

        // Получаем роли пользователя на сервере
        const guildMemberResponse = await axios.get(
            `https://discord.com/api/guilds/1051792766130208859/members/${userData.id}`,
            {
                headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
            }
        );

        const memberData = guildMemberResponse.data;
        const roles = memberData.roles; // Массив ID ролей пользователя на сервере
        const role = getRoleId(roles); // Получаем роль пользователя

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
                role, // Выбранная роль
            ]
        );

        res.cookie("discord_user", JSON.stringify(userData), {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
        });
        res.cookie("discord_token", accessToken, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
        });

        res.redirect("https://walletellaw.store");
    } catch (error) {
        if (error.response) {
            console.error("Ошибка авторизации (API):", error.response.data);
            res.status(500).send("Ошибка авторизации: " + JSON.stringify(error.response.data));
        } else {
            console.error("Ошибка авторизации (нет ответа):", error.message);
            res.status(500).send("Ошибка авторизации: " + error.message);
        }
    }
});


// Получение списка пользователей
app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        console.error("Ошибка получения пользователей:", error);
        res.status(500).send("Ошибка получения пользователей");
    }
});

// Выход из системы
app.get("/api/logout", (req, res) => {
    res.clearCookie("discord_user");
    res.clearCookie("discord_token");
    res.status(200).json({ success: true });
});

// Эндпоинт для получения данных пользователя по discord_id через body
app.post("/api/get-user", async (req, res) => {
    const { discord_id } = req.body; // Получаем discord_id из тела запроса

    if (!discord_id) {
        return res.status(400).json({ error: "Не указан discord_id" });
    }
    try {
        // Выполняем запрос к базе данных
        const [rows] = await db.execute("SELECT * FROM users WHERE discord_id = ?", [discord_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        // Отправляем данные пользователя
        res.json(rows[0]);
    } catch (error) {
        console.error("Ошибка получения пользователя:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get("/api/get-quotes", async (req, res) => { 
    try {
        const [rows] = await db.execute("SELECT global_name, discord_id, avatar, quote, role FROM users");

        if (rows.length === 0) {
            return res.status(404).json({ message: "Данные не найдены" });
        }

        res.json(rows);
    } catch (error) {
        console.error("Ошибка в /get-quotes: ", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Сохранение цитаты пользователя
app.post("/api/save-quote", async (req, res) => {
    const { discord_id, quote } = req.body;

    if (!discord_id || !quote) {
        return res.status(400).json({ error: "Не указаны discord_id или quote" });
    }

    try {
        // Обновляем цитату в базе данных
        await db.execute(
            "UPDATE users SET quote = ? WHERE discord_id = ?",
            [quote, discord_id]
        );

        res.status(200).json({ message: "Цитата успешно сохранена" });
    } catch (error) {
        console.error("Ошибка сохранения цитаты:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});



// Запуск сервера
app.listen(50001, () => {
    console.log("Server start on 50001 port");
});
