import React, { useState } from 'react';

import RouletteGame from './Games/RouletteGame';
import PokerGame from './Games/PokerGame';
import BlackjackGame from './Games/BlackjackGame';
import SlotsGame from './Games/SlotsGame';
import CrashGame from './Games/CrashGame';

const GamesPage = () => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [isExiting, setIsExiting] = useState(false);

    const games = [
        {
            id: 1,
            name: 'Рулетка',
            description:
                'Испытай свою удачу в классической европейской рулетке.',
            image: '/roulette.webp',
        },
        {
            id: 2,
            name: 'Блэкджек',
            description: 'Сразись с дилером и набери 21 очко.',
            image: '/blackjack.webp',
        },
        {
            id: 3,
            name: 'Покер',
            description: 'Покажи свои навыки в лучшей карточной игре.',
            image: '/poker.webp',
        },
        {
            id: 4,
            name: 'Слоты',
            description: 'Крути барабаны и выигрывай огромные джекпоты.',
            image: '/slots.webp',
        },
        {
            id: 5,
            name: 'Слоты',
            description: 'Крути барабаны и выигрывай огромные джекпоты.',
            image: '/slots.webp',
        },
    ];

    const handlePlayClick = (game) => {
        setIsExiting(true);
        setTimeout(() => {
            setSelectedGame(game);
            setIsExiting(false);
        }, 300);
    };

    const handleBackClick = () => {
        setSelectedGame(null);
        setIsExiting(false);
    };

    if (selectedGame) {
        const GameComponent = {
            1: RouletteGame,
            2: BlackjackGame,
            3: PokerGame,
            4: SlotsGame,
            5: CrashGame,
        }[selectedGame.id];

        return (
            <div className="mt-12 text-white">
                <GameComponent />
                <div className="flex justify-center mt-10">
                    <button
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-semibold transition shadow-lg backdrop-blur-xl"
                        onClick={handleBackClick}
                    >
                        ⬅ Вернуться к выбору игры
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col items-center justify-start py-16 px-6 min-h-screen transition-all duration-300 ${
                isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
        >
            <h1 className="text-5xl font-extrabold text-white mb-10 text-center drop-shadow-xl">
                🎮 Выберите свою игру
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 w-full max-w-6xl">
                {games.map((game) => (
                    <div
                        key={game.id}
                        onClick={() => handlePlayClick(game)}
                        className="relative bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:shadow-indigo-500/30 transition transform hover:scale-105 cursor-pointer"
                    >
                        <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-48 object-cover opacity-90 hover:opacity-100 transition-all duration-300"
                        />
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {game.name}
                            </h2>
                            <p className="text-gray-300 text-sm mb-4">
                                {game.description}
                            </p>
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition">
                                Играть
                            </button>
                        </div>
                        <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                            Новинка
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GamesPage;
