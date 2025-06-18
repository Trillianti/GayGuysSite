import React, { useState, useEffect } from 'react';
import axios from 'axios';

const spinningSymbols = ['🍒', '🍋', '🍉', '🍇', '🔔', '⭐', '💎'];

const SlotsGame = () => {
    const [slots, setSlots] = useState(['❔', '❔', '❔']);
    const [finalResult, setFinalResult] = useState(['', '', '']);
    const [message, setMessage] = useState('');
    const [spinning, setSpinning] = useState(false);
    const [activeSpins, setActiveSpins] = useState([false, false, false]);

    const spinSlot = (reelIndex, finalSymbol, delay) => {
        return new Promise((resolve) => {
            let currentIndex = 0;
            setActiveSpins((prev) => {
                const newState = [...prev];
                newState[reelIndex] = true;
                return newState;
            });

            const interval = setInterval(() => {
                setSlots((prev) => {
                    const updated = [...prev];
                    updated[reelIndex] =
                        spinningSymbols[currentIndex % spinningSymbols.length];
                    currentIndex++;
                    return updated;
                });
            }, 80);

            setTimeout(() => {
                clearInterval(interval);
                setSlots((prev) => {
                    const updated = [...prev];
                    updated[reelIndex] = finalSymbol;
                    return updated;
                });
                setActiveSpins((prev) => {
                    const newState = [...prev];
                    newState[reelIndex] = false;
                    return newState;
                });
                resolve();
            }, delay);
        });
    };

    const handleSpin = async () => {
        setSpinning(true);
        setMessage('');
        setSlots(['🔄', '🔄', '🔄']);
        setFinalResult(['', '', '']);

        try {
            const res = await axios.post('/api/slots/spin', { bet: 1 });
            const result = res.data.reels;
            setFinalResult(result);

            await spinSlot(0, result[0], 1000);
            await spinSlot(1, result[1], 1200);
            await spinSlot(2, result[2], 1400);

            setMessage(res.data.message);
        } catch (err) {
            setMessage('❌ Ошибка соединения');
        } finally {
            setSpinning(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.1)] text-white text-center space-y-6 transition-all">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow">
                🎰 Слот-машина
            </h1>

            {/* Слоты */}
            <div className="flex justify-center gap-6 text-6xl font-mono">
                {slots.map((symbol, i) => (
                    <div
                        key={i}
                        className={`w-20 h-20 rounded-2xl flex items-center justify-center text-5xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-inner transition-all duration-300 ${
                            activeSpins[i] ? 'animate-spin-fast' : ''
                        }`}
                    >
                        {symbol}
                    </div>
                ))}
            </div>

            {/* Кнопка */}
            <button
                onClick={handleSpin}
                disabled={spinning}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 transition-all duration-300 text-white text-lg rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {spinning ? 'Крутим...' : 'Крутить 🎲'}
            </button>

            {/* Сообщение */}
            {message && (
                <p
                    className={`text-sm mt-4 transition-all ${
                        message.includes('🔥') || message.includes('🙂')
                            ? 'text-green-400 font-semibold'
                            : 'text-gray-400 italic'
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
};

export default SlotsGame;
