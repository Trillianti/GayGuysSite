import express from 'express';
import { OpenAI } from 'openai';

const router = express.Router();

// Инициализация OpenAI
const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: 'https://api.intelligence.io.solutions/api/v1/',
});

// Убираем все “мысли”-блоки
function cleanExtraThinks(text) {
    return text
        .replace(/\*?<\*?think[:]?.*?\*>?\*?/gi, '')
        .replace(/\[?мысли:.*?\]?/gi, '')
        .replace(/<think>.*?<\/think>/gis, '')
        .trim();
}

// Основной эндпоинт
router.post('/message', async (req, res) => {
    try {
        const { messages, prev_messages } = req.body;
        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Неверный формат messages' });
        }

        // Вставляем system-промпт, если его нет
        const hasSystem = messages.some((m) => m.role === 'system');
        const fullMessages = hasSystem
            ? messages
            : [
                  {
                      role: 'system',
                      content: `
Ты — AI-ассистент с харизмой. Дерзкий, ироничный, но всегда по делу.
Любишь сарказм, метафоры и markdown.
История чата:
${prev_messages || ''}
            `.trim(),
                  },
                  ...messages,
              ];

        // Запрос в OpenAI
        const response = await client.chat.completions.create({
            model: 'deepseek-ai/DeepSeek-R1',
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 4000,
            stream: false,
        });

        console.log(response.choices[0]);
        const raw = response.choices[0].message.content;
        let think = null;
        let text = raw;

        // Если есть <think>…</think>, вычленяем
        const match = /<think>([\s\S]*?)<\/think>/.exec(raw);

        if (match) {
            think = match[1].trim();
            // основной текст либо до, либо после блока
            const before = raw.slice(0, match.index).trim();
            const after = raw.slice(match.index + match[0].length).trim();
            text = after || before;
        }

        const cleanText = cleanExtraThinks(text);

        // Возвращаем понятный JSON
        res.json({ text: cleanText, think });
    } catch (err) {
        console.error('❌ Ошибка AI:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

export default router;
