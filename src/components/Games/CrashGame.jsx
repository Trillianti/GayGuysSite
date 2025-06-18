import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';

const socket = io('https://gayguys.trillianti.trl/api');

export default function CrashGame({ userId, balance }) {
    const [phase, setPhase] = useState('waiting');
    const [timeLeft, setTimeLeft] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [history, setHistory] = useState([]);
    const [bet, setBet] = useState(0);
    const [autoCash, setAutoCash] = useState(0);
    const chartRef = useRef();

    useEffect(() => {
        socket.on('roundStart', ({ duration }) => {
            setPhase('betting');
            setTimeLeft(duration / 1000);
            const t = setInterval(() => {
                setTimeLeft((t) => Math.max(0, t - 0.1));
            }, 100);
            setTimeout(() => clearInterval(t), duration);
        });

        socket.on('tick', ({ multiplier }) => {
            setPhase('crashing');
            setMultiplier(multiplier);
            setHistory((prev) => [...prev, { x: Date.now(), y: multiplier }]);
        });

        socket.on('roundEnd', ({ crashAt }) => {
            setPhase('ended');
            setMultiplier(crashAt);
            setHistory((prev) => [
                ...prev,
                { x: Date.now() + 100, y: crashAt },
            ]);
        });
        // handle other events...
    }, []);

    const placeBet = () => {
        socket.emit('placeBet', { userId, bet, autoCashout: autoCash });
    };
    const cashout = () => {
        socket.emit('cashout');
    };

    return (
        <div className="p-6 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl space-y-6">
            <h1 className="text-2xl font-bold text-white">Crash Game</h1>
            {phase === 'betting' && (
                <>
                    <p className="text-gray-300">Time: {timeLeft.toFixed(1)}</p>
                    <input
                        type="number"
                        value={bet}
                        placeholder="Bet"
                        onChange={(e) => setBet(e.target.value)}
                        className="..."
                    />
                    <input
                        type="number"
                        value={autoCash}
                        placeholder="Auto cashout"
                        onChange={(e) => setAutoCash(e.target.value)}
                        className="..."
                    />
                    <button
                        onClick={placeBet}
                        className="bg-green-600 rounded px-4 py-2"
                    >
                        Place Bet
                    </button>
                </>
            )}
            {phase === 'crashing' && (
                <>
                    <p className="text-4xl text-white">
                        {multiplier.toFixed(2)}×
                    </p>
                    <button
                        onClick={cashout}
                        className="bg-blue-600 rounded px-4 py-2"
                    >
                        Cashout
                    </button>
                </>
            )}
            <div className="h-64">
                <Line
                    data={{
                        datasets: [
                            {
                                data: history,
                                borderColor: '#4ade80',
                                fill: false,
                            },
                        ],
                    }}
                    options={{
                        scales: {
                            x: { type: 'time' },
                            y: { beginAtZero: true },
                        },
                    }}
                />
            </div>
        </div>
    );
}
