import { calculatePayout } from '../utils/payout.js';

const symbolConfig = [
    { symbol: '🍒', weight: 30, multiplier: 2 },
    { symbol: '🍋', weight: 25, multiplier: 3 },
    { symbol: '🍉', weight: 20, multiplier: 4 },
    { symbol: '🍇', weight: 15, multiplier: 6 },
    { symbol: '🔔', weight: 7, multiplier: 10 },
    { symbol: '⭐', weight: 2, multiplier: 20 },
    { symbol: '💎', weight: 1, multiplier: 50 },
];

function weightedRandomSymbol() {
    const totalWeight = symbolConfig.reduce((sum, s) => sum + s.weight, 0);
    const rnd = Math.random() * totalWeight;

    let acc = 0;
    for (const item of symbolConfig) {
        acc += item.weight;
        if (rnd <= acc) return item.symbol;
    }
    return symbolConfig[0].symbol; // fallback
}

export function playSlots(bet) {
    const reels = Array.from({ length: 3 }, () => weightedRandomSymbol());
    const payout = calculatePayout(reels, bet, symbolConfig);

    return {
        reels,
        payout: payout.amount,
        multiplier: payout.multiplier,
        message: payout.message,
    };
}
