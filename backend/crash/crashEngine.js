// crash/crashEngine.js
let ioRef = null;
let players = [];
let currentMultiplier = 1;
let crashAt = 0;
let gamePhase = 'waiting';
let tickInterval = null;

export function setupCrashGame(io) {
    ioRef = io;

    io.on('connection', (socket) => {
        console.log('👤 Player connected:', socket.id);

        socket.on('placeBet', ({ userId, bet, autoCashout }) => {
            if (gamePhase !== 'betting') return;

            players.push({
                userId,
                socket,
                bet,
                autoCashout: parseFloat(autoCashout),
                hasCashedOut: false,
            });

            console.log('💰 Ставка от', userId, 'на', bet);
        });

        socket.on('cashout', () => {
            if (gamePhase !== 'crashing') return;

            const player = players.find((p) => p.socket.id === socket.id);
            if (player && !player.hasCashedOut) {
                player.hasCashedOut = true;
                player.socket.emit('cashoutSuccess', {
                    at: currentMultiplier.toFixed(2),
                });
            }
        });
    });

    startGameLoop();
}

function startGameLoop() {
    const loop = async () => {
        while (true) {
            gamePhase = 'betting';
            players = [];
            currentMultiplier = 1;

            ioRef.emit('roundStart', { duration: 5000 });

            await wait(5000);

            gamePhase = 'crashing';
            crashAt = getRandomCrashMultiplier();
            const startTime = Date.now();

            tickInterval = setInterval(() => {
                const timeElapsed = (Date.now() - startTime) / 1000;
                currentMultiplier = getMultiplier(timeElapsed);

                ioRef.emit('tick', { multiplier: currentMultiplier });

                for (const player of players) {
                    if (
                        !player.hasCashedOut &&
                        player.autoCashout &&
                        currentMultiplier >= player.autoCashout
                    ) {
                        player.hasCashedOut = true;
                        player.socket.emit('autoCashout', {
                            at: player.autoCashout,
                        });
                    }
                }

                if (currentMultiplier >= crashAt) {
                    clearInterval(tickInterval);
                    gamePhase = 'ended';
                    ioRef.emit('roundEnd', { crashAt: currentMultiplier });
                }
            }, 100);

            await waitUntil(() => gamePhase === 'ended');

            await wait(5000);
        }
    };

    loop();
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitUntil(conditionFn) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (conditionFn()) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

function getRandomCrashMultiplier() {
    // Пример распределения: чаще низкие x, реже — высокие
    const r = Math.random();
    if (r < 0.5) return +(1 + Math.random()).toFixed(2); // 50% x1–x2
    if (r < 0.8) return +(2 + Math.random() * 2).toFixed(2); // 30% x2–x4
    if (r < 0.95) return +(4 + Math.random() * 3).toFixed(2); // 15% x4–x7
    return +(7 + Math.random() * 10).toFixed(2); // 5% x7+
}

function getMultiplier(t) {
    // Простая формула роста: экспонента
    return +(1.002 ** (t * 100)).toFixed(2);
}
