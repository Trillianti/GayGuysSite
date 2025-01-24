const { Client, GatewayIntentBits } = require("discord.js")
require("dotenv").config()
const db = require("./db") // Подключение к MySQL

// Константы конфигурации
const BASE_REWARD = 0.001
const AFK_CHANNEL_ID = "1274423436076126308"
const LOGGING_ENABLED = true

// Настройка клиента Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers],
})

// Отслеживание активных пользователей
const activeUsers = new Map()

// Функция логирования событий
function logEvent(message, details = {}) {
    if (LOGGING_ENABLED) {
        console.log(`[${new Date().toLocaleString()}] ${message}`)
        if (Object.keys(details).length > 0) {
            console.table(details) // Вывод данных в табличном виде
        }
    }
}

// Функция обработки наград
async function processBatchRewards() {
    if (activeUsers.size === 0) return

    const currentTime = Date.now()

    for (const [userId, userData] of activeUsers) {
        const timeInVoiceSeconds = (currentTime - userData.joinTime) / 1000
        const channel = client.channels.cache.get(userData.channelId)
        const user = client.users.cache.get(userId)

        // Подсчет активных пользователей в канале
        const channelActiveUsers = [...activeUsers.entries()].filter(
            ([_, data]) => data.channelId === userData.channelId
        ).length

        if (!channel || channelActiveUsers < 2) {
            activeUsers.delete(userId)
            continue
        }

        const rewardMultiplier = 1 + 0.1 * (channelActiveUsers - 2)
        const rewardAmount = BASE_REWARD * timeInVoiceSeconds * rewardMultiplier

        try {
            await db.execute("UPDATE users SET coin = coin + ?, last_join_time = ? WHERE discord_id = ?", [
                rewardAmount,
                currentTime,
                userId,
            ])

            logEvent(`Начислено вознаграждение`, {
                userId,
                userName: user ? user.username : userId,
                channelId: channel.id,
                channelName: channel.name,
                rewardAmount: rewardAmount.toFixed(4),
                timeInVoice: timeInVoiceSeconds.toFixed(1),
                channelActiveUsers,
                rewardMultiplier: rewardMultiplier.toFixed(2),
            })
        } catch (error) {
            console.error(`Ошибка при обновлении награды пользователя ${userId}:`, error)
        }
    }
}

// Запуск бота: загрузка активных пользователей
client.once("ready", () => {
    console.log(`Бот запущен как ${client.user.tag}`)

    const guild = client.guilds.cache.first()
    const voiceChannels = guild.channels.cache.filter((ch) => ch.type === 2)

    voiceChannels.forEach((channel) => {
        if (channel.id !== AFK_CHANNEL_ID) {
            channel.members.forEach((member) => {
                if (!member.user.bot) {
                    activeUsers.set(member.id, {
                        channelId: channel.id,
                        joinTime: Date.now(),
                    })
                }
            })
        }
    })
})

// Обработчик обновления голосового состояния
client.on("voiceStateUpdate", async (oldState, newState) => {
    const userId = newState.id
    const oldChannelId = oldState.channelId
    const newChannelId = newState.channelId

    const user = client.users.cache.get(userId)
    const oldChannel = oldChannelId ? client.channels.cache.get(oldChannelId) : null
    const newChannel = newChannelId ? client.channels.cache.get(newChannelId) : null

    await processBatchRewards()

    // Пользователь зашел в голосовой канал
    if (!oldChannelId && newChannelId) {
        logEvent("Пользователь зашел в голосовой канал", {
            userId,
            userName: user ? user.username : userId,
            channelId: newChannelId,
            channelName: newChannel ? newChannel.name : newChannelId,
        })

        if (newChannelId !== AFK_CHANNEL_ID) {
            activeUsers.set(userId, {
                channelId: newChannelId,
                joinTime: Date.now(),
            })
        }
    }
    // Пользователь вышел из голосового канала
    else if (oldChannelId && !newChannelId) {
        logEvent("Пользователь вышел из голосового канала", {
            userId,
            userName: user ? user.username : userId,
            channelId: oldChannelId,
            channelName: oldChannel ? oldChannel.name : oldChannelId,
        })

        activeUsers.delete(userId)
    }
    // Пользователь переключился между каналами
    else if (oldChannelId !== newChannelId) {
        logEvent("Пользователь сменил голосовой канал", {
            userId,
            userName: user ? user.username : userId,
            fromChannelId: oldChannelId,
            fromChannelName: oldChannel ? oldChannel.name : oldChannelId,
            toChannelId: newChannelId,
            toChannelName: newChannel ? newChannel.name : newChannelId,
        })

        if (newChannelId === AFK_CHANNEL_ID) {
            activeUsers.delete(userId)
        } else {
            activeUsers.set(userId, {
                channelId: newChannelId,
                joinTime: Date.now(),
            })
        }
    }
    // Обнуление времени входа для всех пользователей
    for (const [userId] of activeUsers) {
        activeUsers.get(userId).joinTime = Date.now()
    }
})

// Авторизация бота
client.login(process.env.BOT_TOKEN)
