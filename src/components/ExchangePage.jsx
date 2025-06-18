import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    Tooltip,
    Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    Tooltip,
    Filler,
);

const pairs = [
    { label: 'GGC/USDT', from: 'GGC', to: 'USDT' },
    { label: 'GGC/BTC', from: 'GGC', to: 'BTC' },
    { label: 'BTC/USDT', from: 'BTC', to: 'USDT' },
];

const generateFakeHistory = (basePrice) => {
    const now = Date.now();
    return Array.from({ length: 60 }).map((_, i) => {
        const time = now - (59 - i) * 60000;
        const price = basePrice * (0.98 + Math.random() * 0.04);
        return { x: time, y: price.toFixed(6) };
    });
};

const ExchangePage = () => {
    const [pair, setPair] = useState(pairs[0]);
    const [isBuying, setIsBuying] = useState(true);
    const [amount, setAmount] = useState('');
    const [received, setReceived] = useState('');
    const [price, setPrice] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const basePrice =
                pair.from === 'GGC' ? 1 : pair.from === 'BTC' ? 60000 : 0.00002;

            const fakePrice = basePrice * (0.98 + Math.random() * 0.04);
            setPrice(fakePrice);
            setHistory(generateFakeHistory(fakePrice));
        };

        fetchData();
    }, [pair]);

    useEffect(() => {
        const input = parseFloat(amount);
        if (isNaN(input) || !price) return setReceived('');
        setReceived(
            isBuying ? (input * price).toFixed(6) : (input / price).toFixed(6),
        );
    }, [amount, price, isBuying]);

    const chartData = {
        datasets: [
            {
                label: `${pair.from}/${pair.to}`,
                data: history,
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    tooltipFormat: 'HH:mm',
                    displayFormats: { minute: 'HH:mm' },
                },
                ticks: { color: '#ccc' },
                grid: { color: 'rgba(255,255,255,0.05)' },
            },
            y: {
                ticks: { color: '#ccc' },
                grid: { color: 'rgba(255,255,255,0.05)' },
            },
        },
        plugins: {
            legend: { display: false },
        },
    };

    return (
        <div className="h-full flex justify-center items-start pt-28 px-4 pb-20">
            <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 text-white space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        🪙 Крипто-Биржа
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Режим демо. Курс и история отображаются случайно.
                    </p>
                </div>

                {/* Пара и переключение */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <select
                        className="px-4 py-2 bg-zinc-800 rounded-lg"
                        onChange={(e) => {
                            const selected = pairs.find(
                                (p) => p.label === e.target.value,
                            );
                            setPair(selected);
                        }}
                        value={pair.label}
                    >
                        {pairs.map((p) => (
                            <option key={p.label}>{p.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsBuying(!isBuying)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
                    >
                        {isBuying
                            ? 'Переключить на Продажу'
                            : 'Переключить на Покупку'}
                    </button>
                </div>

                {/* График */}
                <div className="relative h-64 bg-zinc-900/40 rounded-xl p-4 border border-zinc-700 shadow-inner">
                    <Line data={chartData} options={chartOptions} />
                    <div className="absolute top-4 right-4 bg-zinc-800 px-3 py-1 rounded-lg text-sm text-gray-300">
                        Текущий курс: {price ? price.toFixed(6) : '--'}
                    </div>
                </div>

                {/* Обмен */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Вы {isBuying ? 'отдаёте' : 'получаете'} ({pair.from}
                            )
                        </label>
                        <input
                            type="number"
                            placeholder="Введите сумму"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Вы {isBuying ? 'получаете' : 'отдаёте'} ({pair.to})
                        </label>
                        <input
                            type="text"
                            disabled
                            value={received}
                            className="w-full px-4 py-3 bg-zinc-700 rounded-lg text-white opacity-70"
                        />
                    </div>
                </div>

                <button className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition">
                    {isBuying ? 'Купить' : 'Продать'} {pair.from}
                </button>

                <p className="text-center text-sm text-gray-500 italic pt-2">
                    Торговля отключена — демонстрационный режим.
                </p>
            </div>
        </div>
    );
};

export default ExchangePage;
