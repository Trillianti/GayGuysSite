import React from 'react';

const BankPage = () => {
    return (
        <div className="h-full flex items-center justify-center px-4 ">
            <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl p-10 text-center text-white">
                <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow-md">
                    💳 Банк сообщества
                </h1>
                <p className="text-lg text-gray-300 mb-10">
                    Тут будет возможность пополнить, снять или инвестировать
                    свои GGC-монеты.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl border border-zinc-700 shadow-md">
                        <h3 className="text-2xl font-semibold mb-2 text-indigo-400">
                            👛 Баланс
                        </h3>
                        <p className="text-3xl font-bold">0.00 GGC</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Ваш текущий баланс
                        </p>
                    </div>

                    <div className="bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl border border-zinc-700 shadow-md">
                        <h3 className="text-2xl font-semibold mb-2 text-green-400">
                            📈 Доход
                        </h3>
                        <p className="text-3xl font-bold">+0.00%</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Процентный вклад за 30 дней
                        </p>
                    </div>
                </div>

                <div className="mt-12 space-y-4">
                    <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition rounded-xl text-lg font-semibold shadow-lg">
                        🔄 Пополнить баланс
                    </button>
                    <button className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 transition rounded-xl text-lg font-semibold shadow-lg">
                        ⬇ Снять средства
                    </button>
                    <button className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 transition rounded-xl text-lg font-semibold shadow-lg">
                        💼 Инвестировать
                    </button>
                </div>

                <p className="mt-12 text-gray-500 text-sm italic">
                    Банк временно находится в демо-режиме. Вся информация — на
                    главной.
                </p>
            </div>
        </div>
    );
};

export default BankPage;
