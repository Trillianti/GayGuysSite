import React, { useState } from "react";

import RouletteGame from './Games/RouletteGame'
import PokerGame from './Games/PokerGame'
import BlackjackGame from './Games/BlackjackGame'
import SlotsGame from './Games/SlotsGame'

const GamesPage = () => {
  const [selectedGame, setSelectedGame] = useState(null); // Состояние выбранной игры
  const [isExiting, setIsExiting] = useState(false); // Состояние анимации выхода

  const games = [
    {
      id: 1,
      name: "Рулетка",
      description: "Испытай свою удачу в классической европейской рулетке.",
      image: "/roulette.webp",
    },
    {
      id: 2,
      name: "Блэкджек",
      description: "Сразись с дилером и набери 21 очко.",
      image: "/blackjack.webp",
    },
    {
      id: 3,
      name: "Покер",
      description: "Покажи свои навыки в лучшей карточной игре.",
      image: "/poker.webp",
    },
    {
      id: 4,
      name: "Слоты",
      description: "Крути барабаны и выигрывай огромные джекпоты.",
      image: "/slots.webp",
    },
  ];

  const handlePlayClick = (game) => {
    setIsExiting(true); // Запускаем анимацию выхода
    setTimeout(() => {
      setSelectedGame(game); // После завершения анимации устанавливаем выбранную игру
      setIsExiting(false); // Сбрасываем состояние анимации
    }, 300); // Задержка для завершения анимации
  };

  const handleBackClick = () => {
    setSelectedGame(null); // Сбрасываем выбранную игру
    setIsExiting(false); // Сбрасываем состояние анимации
  };

  if (selectedGame) {
    // Если игра выбрана, показываем компонент игры по ID
    switch (selectedGame.id) {
      case 1:
        return (
          <div className="mt-12">
            <RouletteGame />
            <button
              className="mt-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all"
              onClick={handleBackClick} // Возврат к выбору игры
            >
              Вернуться назад
            </button>
          </div>
        );
      case 2:
        return (
          <div className="mt-12">
            <BlackjackGame />
            <button
              className="mt-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all"
              onClick={handleBackClick}
            >
              Вернуться назад
            </button>
          </div>
        );
      case 3:
        return (
          <div className="mt-12">
            <PokerGame />
            <button
              className="mt-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all"
              onClick={handleBackClick}
            >
              Вернуться назад
            </button>
          </div>
        );
      case 4:
        return (
          <div className="mt-12">
            <SlotsGame />
            <button
              className="mt-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all"
              onClick={handleBackClick}
            >
              Вернуться назад
            </button>
          </div>
        );
      default:
        return null;
    }
  }

  // Если игра не выбрана, показываем список игр
  return (
    <div
      className={`flex flex-col items-center justify-start py-12 px-6 select-none transition-all duration-300 ${
        isExiting ? "opacity-0 transform scale-95" : "opacity-100"
      }`}
    >
      <h1 className="text-5xl text-white font-extrabold mb-8 drop-shadow-md">
        Выберите свою игру
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 relative cursor-pointer"
            onClick={() => handlePlayClick(game)}
          >
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-48 object-cover opacity-90 hover:opacity-100 transition-all"
            />
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
              <p className="text-gray-400 mb-4">{game.description}</p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-all"
              >
                Играть
              </button>
            </div>
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
              Новинка
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;