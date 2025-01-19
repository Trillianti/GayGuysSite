const express = require('express');
const axios = require('axios');
const cors = require('cors');
const db = require('./db'); // Подключение к базе данных
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // URL вашего фронтенда
    credentials: true, // Разрешить передачу cookies
}), express.json());

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URL;

// Авторизация через Discord
app.get("/auth/discord/callback", async (req, res) => {
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

        // Сохраняем данные в базу данных
        await db.execute(
            `INSERT INTO users (discord_id, global_name, username, avatar, access_token, coin)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             global_name = VALUES(global_name), username = VALUES(username),
             avatar = VALUES(avatar), access_token = VALUES(access_token)`,
            [userData.id, userData.global_name || userData.username, userData.username, userData.avatar, accessToken, 0]
        );

        // Устанавливаем cookies
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

        res.redirect("http://localhost:5173");
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
app.get("/users", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        console.error("Ошибка получения пользователей:", error);
        res.status(500).send("Ошибка получения пользователей");
    }
});

// Выход из системы
app.get("/logout", (req, res) => {
    res.clearCookie("discord_user");
    res.clearCookie("discord_token");
    res.status(200).json({ success: true });
});

// Эндпоинт для получения данных пользователя по discord_id через body
app.post("/get-user", async (req, res) => {
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

app.get("get-quotes", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT global_name, discord_id, avatar, quote, role FROM users");
        if (rows.length === 0) {
            return rows;
        }
    } catch (error) {
        console.error("Ошибка в /get-quotes: ", error);
        res.status(500).json({ error: "Ошибка сервера "});
    }
});

// Запуск сервера
app.listen(50001, () => {
    console.log("Server start on 50001 port");
    console.log("http://localhost:50001");
});
