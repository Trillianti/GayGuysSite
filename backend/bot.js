const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const db = require('./db'); // Подключение к MySQL

// Создаем экземпляр клиента
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// Базовая награда за секунду
const BASE_REWARD = 0.001;

// Функция для подсчета награды
async function calculateReward() {
    const guild = client.guilds.cache.first(); // Берем первый сервер
    const voiceChannels = guild.channels.cache.filter(ch => ch.type === 2); // Только голосовые каналы

    let activeUsers = 0;
    let activeChannels = 0;

    voiceChannels.forEach(channel => {
        const members = channel.members.filter(member => !member.user.bot); // Исключаем ботов

        if (members.size > 1) {
            activeUsers += members.size; // Считаем активных пользователей
            activeChannels++;
        }
    });

    if (activeChannels === 0) return 0; // Если нет активных каналов

    // Рассчитываем награду за секунду
    return BASE_REWARD * (1 + activeUsers / activeChannels);
}

// Функция начисления монет
async function rewardUser(userId, sessionTime) {
    try {
        const rewardPerSecond = await calculateReward();

        if (rewardPerSecond > 0) {
            const earnedCoins = sessionTime * rewardPerSecond;

            // Обновляем баланс пользователя
            await db.execute(
                'UPDATE users SET coins = coins + ? WHERE discord_id = ?',
                [earnedCoins, userId]
            );

            console.log(
                `Начислено ${earnedCoins.toFixed(2)} монет пользователю ${userId}`
            );
        } else {
            console.log(`Монеты не начислены: пользователь был один в канале.`);
        }
    } catch (err) {
        console.error(`Ошибка начисления монет: ${err.message}`);
    }
}

// Событие: подключение/отключение пользователя
client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.id;

    // Пользователь зашел в канал
    if (!oldState.channelId && newState.channelId) {
        console.log(`${userId} подключился к каналу ${newState.channelId}`);

        // Проверяем, существует ли пользователь в базе
        const [rows] = await db.execute(
            'SELECT discord_id FROM users WHERE discord_id = ?',
            [userId]
        );

        if (rows.length > 0) {
            // Обновляем время последнего входа
            await db.execute(
                'UPDATE users SET last_join_time = ? WHERE discord_id = ?',
                [Date.now(), userId]
            );
        } else {
            console.log(`Пользователь ${userId} не найден в таблице users.`);
        }
    }

    // Пользователь вышел из канала
    if (oldState.channelId && !newState.channelId) {
        console.log(`${userId} отключился от канала ${oldState.channelId}`);

        // Получаем время входа
        const [rows] = await db.execute(
            'SELECT last_join_time FROM users WHERE discord_id = ?',
            [userId]
        );

        if (rows.length > 0 && rows[0].last_join_time) {
            const lastJoinTime = rows[0].last_join_time;
            const sessionTime = Math.floor((Date.now() - lastJoinTime) / 1000);

            // Начисляем награду
            await rewardUser(userId, sessionTime);

            // Сбрасываем last_join_time
            await db.execute(
                'UPDATE users SET last_join_time = NULL WHERE discord_id = ?',
                [userId]
            );
        }
    }
});

// Запускаем бота
client.once('ready', () => {
    console.log(`Бот запущен как ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);
