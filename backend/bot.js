import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import db from './db.js'; // Убедись, что db.js экспортирует через ESM
import log from './logger.js'; // Убедись, что logger.js тоже ESM

dotenv.config();

// Константы конфигурации
const CONFIG = {
    BASE_REWARD: 0.001, // Базовая награда
    AFK_CHANNEL_ID: '1274423436076126308', // ID AFK-канала
    LOGGING_ENABLED: true,
    REWARD_INTERVAL: 60 * 1000, // Интервал начисления наград (1 минута)
};

// Настройка клиента Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
    ],
});

// Отслеживание активных пользователей
const activeUsers = new Map();

/**
 * Логирование событий
 * @param {string} message - Сообщение лога
 * @param {object} details - Дополнительные данные
 */
function logEvent(message, details = {}) {
    if (CONFIG.LOGGING_ENABLED) {
        log.info(message, details);
    }
}

/**
 * Обработка наград для активных пользователей
 */
async function processBatchRewards() {
    if (activeUsers.size === 0) return;

    const currentTime = Date.now();

    for (const [userId, userData] of activeUsers) {
        const { channelId, joinTime } = userData;
        const timeInVoiceSeconds = (currentTime - joinTime) / 1000;

        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            activeUsers.delete(userId); // Удаляем пользователя, если канал больше не существует
            continue;
        }

        // Подсчет активных пользователей в канале
        const channelActiveUsers = [...activeUsers.values()].filter(
            (data) => data.channelId === channelId,
        ).length;

        if (channelActiveUsers < 2) {
            activeUsers.delete(userId); // Не начисляем награды за одинокое пребывание
            continue;
        }

        const rewardMultiplier = 1 + 0.1 * (channelActiveUsers - 2);
        const rewardAmount =
            CONFIG.BASE_REWARD * timeInVoiceSeconds * rewardMultiplier;

        try {
            await db.execute(
                'UPDATE users SET coin = coin + ?, last_join_time = ? WHERE discord_id = ?',
                [rewardAmount, currentTime, userId],
            );

            logEvent(`Начислено вознаграждение`, {
                userId,
                rewardAmount: rewardAmount.toFixed(4),
                timeInVoice: timeInVoiceSeconds.toFixed(1),
                channelActiveUsers,
                rewardMultiplier: rewardMultiplier.toFixed(2),
            });
        } catch (error) {
            log.error(`Ошибка начисления награды для пользователя ${userId}`, {
                error,
            });
        }

        // Обновляем время входа пользователя
        userData.joinTime = currentTime;
    }
}

/**
 * Обработчик изменения голосового состояния
 */
client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.id;
    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;

    if (newChannelId && newChannelId !== CONFIG.AFK_CHANNEL_ID) {
        // Пользователь зашел в канал или переключился
        activeUsers.set(userId, {
            channelId: newChannelId,
            joinTime: activeUsers.has(userId)
                ? activeUsers.get(userId).joinTime
                : Date.now(),
        });
        logEvent('Пользователь зашел/переключился в канал', {
            userId,
            newChannelId,
        });
    } else if (!newChannelId || newChannelId === CONFIG.AFK_CHANNEL_ID) {
        // Пользователь вышел из канала или зашел в AFK
        activeUsers.delete(userId);
        logEvent('Пользователь вышел из канала/зашел в AFK', { userId });
    }
});

/**
 * Запуск бота
 */
client.once('ready', () => {
    log.info(`Бот запущен как ${client.user.tag}`);

    // Загружаем активных пользователей
    const guild = client.guilds.cache.first();
    if (!guild) {
        log.error('Сервер не найден!');
        return;
    }

    const voiceChannels = guild.channels.cache.filter((ch) => ch.type === 2);
    voiceChannels.forEach((channel) => {
        if (channel.id !== CONFIG.AFK_CHANNEL_ID) {
            channel.members.forEach((member) => {
                if (!member.user.bot) {
                    activeUsers.set(member.id, {
                        channelId: channel.id,
                        joinTime: Date.now(),
                    });
                }
            });
        }
    });

    // Запуск периодической обработки наград
    setInterval(processBatchRewards, CONFIG.REWARD_INTERVAL);
});

/**
 * Авторизация бота
 */
client.login(process.env.BOT_TOKEN);
