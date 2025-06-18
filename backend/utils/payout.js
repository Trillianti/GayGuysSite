export function calculatePayout(reels, bet, config) {
    const [a, b, c] = reels;
    const entry = config.find((s) => s.symbol === a);

    if (a === b && b === c && entry) {
        const multiplier = entry.multiplier;
        return {
            amount: bet * multiplier,
            multiplier,
            message: `🔥 Три ${a}! Выигрыш x${multiplier}`,
        };
    }

    return {
        amount: 0,
        multiplier: 0,
        message: '🙈 Нет совпадений. Удачи в следующий раз!',
    };
}
