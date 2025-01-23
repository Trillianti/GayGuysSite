const { Client, GatewayIntentBits } = require("discord.js")
require("dotenv").config()
const db = require("./db") // Подключение к MySQL
const { use } = require("react")

// Создаем экземпляр клиента
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers],
})

// Базовая награда за секунду
const BASE_REWARD = 0.001

const AFK_CHANNEL_ID = "1274423436076126308"
// Функция начисления награды
async function handleUserReward(action, userId, oldChannelId = null, newChannelId = null) {
    try {
        const guild = client.guilds.cache.first()
        const voiceChannels = guild.channels.cache.filter((ch) => ch.type === 2)
        const activeMembers = new Map()

        voiceChannels.forEach((channel) => {
            if (channel.id !== AFK_CHANNEL_ID) {
                channel.members.forEach((member) => {
                    if (!member.user.bot) {
                        activeMembers.set(member.id)
                    }
                })
            }
        })

        // Обработка действий
        if (action === "join") {
            activeMembers.delete(userId)
            console.log(`${userId} зашёл. Его время обнулено, награда начислена всем остальным.`)

            // Добавляем пользователя, если его нет в базе
            await db.execute(
                "INSERT INTO users (discord_id, last_join_time, coin) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE last_join_time = ?",
                [userId, Date.now(), Date.now()]
            )

            const newChannel = guild.channels.cache.get(newChannelId)
            if (newChannel && newChannel.members.size === 2) {
                const aloneUser = [...newChannel.members.values()].find((member) => member.id !== userId)
                if (aloneUser) {
                    const aloneUserId = aloneUser.id
                    activeMembers.delete(aloneUserId)
                    console.log(`В канале ${newChannelId} был один человек (${aloneUserId}). Время обнулено.`)

                    // Добавляем второго пользователя, если его нет в базе
                    await db.execute(
                        "INSERT INTO users (discord_id, last_join_time, coin) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE last_join_time = ?",
                        [aloneUserId, Date.now(), Date.now()]
                    )
                }
            }
        }

        if (action === "leave") {
            // Если пользователь вышел не из AFK, добавляем его в награды
            if (oldChannelId !== AFK_CHANNEL_ID) {
                activeMembers.set(userId)
                console.log(`${userId} вышел, добавлен в раздачу наград.`)
            } else {
                console.log("Человек вышел из AFK, награду не начисляем.")
            }

            // Если канал, из которого вышел пользователь, пустой
            const oldChannel = guild.channels.cache.get(oldChannelId)
            if (oldChannel.members.size === 0) {
                activeMembers.delete(userId)
                console.log(`${userId} вышел из ${oldChannelId}, он был один. Награда не начислена.`)
            }
        }

        if (action === "switch") {
            // Если пользователь переключил канал, проверяем одиночных участников
            const newChannel = guild.channels.cache.get(newChannelId)
            const oldChannel = guild.channels.cache.get(oldChannelId)

            // Если в новом канале был один участник
            if (newChannel && newChannel.members.size === 2) {
                const aloneUser = [...newChannel.members.values()].find((member) => member.id !== userId)
                if (aloneUser) {
                    activeMembers.delete(aloneUser.id)
                    console.log(
                        `В канале ${newChannelId} был один человек (${aloneUser.id}). Время обнулено.`
                    )

                    await db.execute(
                        "INSERT INTO users (discord_id, last_join_time, coin) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE last_join_time = ?",
                        [aloneUser.id, Date.now(), Date.now()]
                    )
                }
            }

            // Если старый канал опустел
            if (oldChannel && oldChannel.members.size === 0) {
                activeMembers.delete(userId)
                console.log(`${userId} покинул канал ${oldChannelId}, он был один. Награда не начислена.`)
            }

            if (oldChannelId === AFK_CHANNEL_ID) {
                console.log(
                    `Пользователь ${userId} переключился из AFK канала (${oldChannelId} → ${newChannelId}). Награды не начисляются.`
                )
                activeMembers.delete(userId)
            }
        }

        // Если активных пользователей нет, прерываем выполнение
        if (activeMembers.size === 0) {
            console.log("Нет активных пользователей.")
            return
        }

        // Удаляем одиночно сидящих пользователей
        for (const [id] of activeMembers) {
            let voiceChannel = guild.channels.cache.find(
                (channel) => channel.type === 2 && channel.members.has(id) // Changed from userId to id
            )
            if (!voiceChannel) {
                voiceChannel = client.channels.cache.get(oldChannelId)
            }
            if (
                newChannelId !== voiceChannel.id &&
                oldChannelId !== voiceChannel.id &&
                voiceChannel.members.size === 1
            ) {
                activeMembers.delete(id)
                console.log(`Пользователь ${id} один в канале ${voiceChannel.id}, удален из награды.`)
            }
        }

        // В блоке начисления наград модифицируем получение записи пользователя
        const rewardsPromises = []
        for (const [Id] of activeMembers) {
            let userChannel = guild.channels.cache.find(
                (channel) => channel.type === 2 && channel.members.has(Id)
            )

            if (!userChannel || (Id === userId && action === "switch")) {
                userChannel = client.channels.cache.get(oldChannelId)
            }
            // Безопасное получение времени последнего входа
            const [userRecords] = await db.execute("SELECT last_join_time FROM users WHERE discord_id = ?", [
                Id,
            ])

            // Добавляем проверку существования записи
            if (userRecords.length === 0) {
                console.log(`Пользователь ${Id} не найден в базе данных. Пропуск.`)
                continue
            }

            const lastJoinTime = userRecords[0].last_join_time
            const currentTime = Date.now()

            // Расчет времени в голосовом канале в секундах
            const timeInVoiceSeconds = (currentTime - lastJoinTime) / 1000

            // Количество людей в текущем голосовом канале
            let peopleInChannel = userChannel.members.size

            if ((action === "join" || action === "switch") && userChannel.id === newChannelId) {
                peopleInChannel -= 1
            }

            if ((action === "leave" || action === "switch") && userChannel.id === oldChannelId) {
                peopleInChannel += 1
            }

            // Расчет множителя награды
            const rewardMultiplier = 1 + 0.1 * (peopleInChannel - 2)
            const rewardAmount = BASE_REWARD * timeInVoiceSeconds * rewardMultiplier

            rewardsPromises.push(
                db
                    .execute("UPDATE users SET coin = coin + ?, last_join_time = ? WHERE discord_id = ?", [
                        rewardAmount,
                        currentTime,
                        Id,
                    ])
                    .then(() => {
                        console.log(
                            `Пользователь ${Id}: ` +
                                `Награда = ${rewardAmount.toFixed(4)} ` +
                                `(${BASE_REWARD} * ${timeInVoiceSeconds.toFixed(
                                    1
                                )}сек * Множитель ${rewardMultiplier.toFixed(2)}) ` +
                                `Людей в канале: ${peopleInChannel}`
                        )
                    })
            )
        }

        // Параллельное выполнение начисления наград
        await Promise.all(rewardsPromises)
        console.log(`Начислены награды для ${activeMembers.size} пользователей`)
    } catch (err) {
        console.error(`Ошибка начисления монет: ${err.message}`)
    }
}

// Событие: подключение/отключение пользователя
client.on("voiceStateUpdate", async (oldState, newState) => {
    const userId = newState.id
    const oldChannelId = oldState.channelId
    const newChannelId = newState.channelId

    if (!oldState.channelId && newState.channelId) {
        // Пользователь подключился
        console.log("Пользователь " + userId + " подключился в канал " + newState.channelId)
        await handleUserReward("join", userId, oldChannelId, newChannelId)
    } else if (oldState.channelId && !newState.channelId) {
        // Пользователь отключился
        console.log("Пользователь " + userId + " отключился от канала " + oldState.channelId)
        await handleUserReward("leave", userId, oldChannelId, newChannelId)
    } else if (oldState.channelId !== newState.channelId) {
        // Пользователь перешел из одного канала в другой
        console.log(
            "Пользователь " +
                userId +
                " перешел из канала " +
                oldState.channelId +
                " в канал " +
                newState.channelId
        )
        await handleUserReward("switch", userId, oldChannelId, newChannelId)
    }
})

// Запускаем бота
client.once("ready", () => {
    console.log(`Бот запущен как ${client.user.tag}`)
})

client.login(process.env.BOT_TOKEN)
