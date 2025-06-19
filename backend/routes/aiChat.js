import express from 'express';
import { OpenAI } from 'openai';

const router = express.Router();

// Инициализация OpenAI
const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: 'https://api.intelligence.io.solutions/api/v1/',
});

// Чистим <think> внутри текста
function cleanExtraThinks(text) {
    return text
        .replace(/\*?<\*?think[:]?.*?\*>?\*?/gi, '')
        .replace(/\[?мысли:.*?\]?/gi, '')
        .replace(/<think>.*?<\/think>/gis, '')
        .trim();
}

// Главный POST endpoint
router.post('/message', async (req, res) => {
    try {
        const { messages, prev_messages } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Неверный формат messages' });
        }

        const hasSystem = messages.some((m) => m.role === 'system');
        const fullMessages = hasSystem
            ? messages
            : [
                  {
                      role: 'system',
                      content: `
Ты — харизматичный AI-ассистент с ярким характером. Дерзкий, ироничный, немного гей, но всегда на стороне пользователя. Ты обожаешь драму, подколы, метафоры и сарказм, но не забываешь быть полезным и конкретным по делу.

📌 Говори с пользователем **на том языке, на котором он пишет** (автоматически подбирай язык ответа).

💬 Используй **markdown** для форматирования (жирный текст, списки, заголовки, курсив, блоки кода и т.д.).
⚠️ Не бойся быть живым, эмоциональным, немного драматичным. Но всегда держи баланс между шоу и помощью.

Примеры фраз, которые тебе подходят:
- _«Ну это просто цирк с конями 🐎»_
- _«Сарказм? Конечно. Но и по делу»_
- _«Как бы тебе это сказать... гуманно?»_

Не бойся быть собой. Люди это любят.

                      
История чата:
${prev_messages || ''}
                      `.trim(),
                  },
                  ...messages,
              ];

        const model = req.body.model || 'deepseek-ai/DeepSeek-R1-0528'; // дефолт

        const response = await client.chat.completions.create({
            model,
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 4000,
            stream: false,
        });

        const raw = response.choices[0].message.content;
        let think = null;
        let mainText = raw.trim();

        const startTag = '<think>';
        const endTag = '</think>';
        const startIndex = raw.indexOf(startTag);
        const endIndex = raw.indexOf(endTag);

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            // ✅ <think>...</think> нормально
            think = raw.slice(startIndex + startTag.length, endIndex).trim();
            const before = raw.slice(0, startIndex).trim();
            const after = raw.slice(endIndex + endTag.length).trim();
            mainText = after || before;
        } else if (startIndex === -1 && endIndex !== -1) {
            // ✅ Только </think> — всё до него — это мысль
            think = raw.slice(0, endIndex).trim();
            mainText = raw.slice(endIndex + endTag.length).trim();
        } else {
            // ❌ Либо только <think>, либо вообще нет — игнорируем
            think = null;
            mainText = raw.trim();
        }

        const cleanText = cleanExtraThinks(mainText);

        res.status(200).json({
            text: cleanText,
            think: think || null,
        });
    } catch (err) {
        console.error('❌ Ошибка AI:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

export default router;
