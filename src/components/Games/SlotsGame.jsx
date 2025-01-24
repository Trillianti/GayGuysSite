import React, { useState } from "react";

const symbols = ["🍒", "⭐", "🍋", "💎", "🍉", "🔔", "7️⃣"]; // Символы для барабанов

const SlotsGame = () => {
  const [slots, setSlots] = useState([
    ["❓", "❓", "❓"],
    ["❓", "❓", "❓"],
    ["❓", "❓", "❓"],
  ]); // Символы на барабанах
  const [isSpinning, setIsSpinning] = useState(false); // Состояние вращения
  const [balance, setBalance] = useState(5000); // Баланс игрока
  const [bet, setBet] = useState(100); // Ставка игрока
  const [message, setMessage] = useState(""); // Сообщение результата

  // Функция для случайного выбора символа
  const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

  // Обработка кнопки "Крутить"
  const handleSpin = () => {
    if (balance < bet) {
      setMessage("Недостаточно средств для ставки!");
      return;
    }

    setMessage(""); // Сброс сообщения
    setIsSpinning(true); // Запускаем вращение
    setBalance((prev) => prev - bet); // Уменьшаем баланс

    const newSlots = [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    ];

    let stopDelays = [1000, 2000, 3000]; // Задержка остановки барабанов
    stopDelays.forEach((delay, index) => {
      setTimeout(() => {
        setSlots((prevSlots) => {
          const updatedSlots = [...prevSlots];
          updatedSlots[index] = newSlots[index]; // Устанавливаем значения для остановленного барабана
          return updatedSlots;
        });

        if (index === 2) {
          setTimeout(() => {
            setIsSpinning(false); // Останавливаем вращение после последнего барабана
            checkWin(newSlots); // Проверяем результат
          }, 500);
        }
      }, delay);
    });
  };

  // Проверка на выигрыш
  const checkWin = (newSlots) => {
    if (
      newSlots[0][1] === newSlots[1][1] &&
      newSlots[1][1] === newSlots[2][1]
    ) {
      const winAmount = bet * 10; // Выигрыш 10x от ставки
      setBalance((prev) => prev + winAmount);
      setMessage(`🎉 Вы выиграли ${winAmount} монет! 🎉`);
    } else {
      setMessage("😢 Попробуйте снова!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-center text-white">
      <h1 className="text-6xl font-extrabold mb-6 text-yellow-400 drop-shadow-lg">
        🎰 Слоты
      </h1>
      <p className="text-lg text-gray-300 mb-4">Крути барабаны и выигрывай крупный джекпот!</p>

      {/* Баланс и ставка */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        <div className="text-2xl">
          Баланс: <span className="text-green-400 font-bold">{balance} монет</span>
        </div>
        <div className="text-2xl">
          Ставка:{" "}
          <input
            type="number"
            value={bet}
            min="1"
            max={balance}
            onChange={(e) => setBet(parseInt(e.target.value))}
            className="bg-gray-800 text-white text-center w-24 py-1 rounded-md shadow-inner"
          />
        </div>
      </div>

      {/* Барабаны */}
      <div className="flex space-x-6 mb-8">
        {slots.map((reel, reelIndex) => (
          <div
            key={reelIndex}
            className="w-28 h-36 bg-gradient-to-b from-yellow-400 to-red-600 text-5xl flex flex-col items-center justify-center rounded-lg shadow-xl border-2 border-yellow-300 overflow-hidden"
          >
            {/* Символы на барабане */}
            {reel.map((symbol, symbolIndex) => (
              <div
                key={symbolIndex}
                className={`flex items-center justify-center w-full h-12 transition-transform duration-200 ${
                  isSpinning ? "animate-bounce" : ""
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Кнопка "Крутить" */}
      <button
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-2xl font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50"
        onClick={handleSpin}
        disabled={isSpinning || balance < bet} // Блокируем кнопку при вращении или недостатке баланса
      >
        {isSpinning ? "Крутится..." : "Крутить"}
      </button>

      {/* Сообщение результата */}
      {message && (
        <p className="text-2xl font-bold mt-8 text-yellow-400 animate-bounce">
          {message}
        </p>
      )}
    </div>
  );
};

export default SlotsGame;
