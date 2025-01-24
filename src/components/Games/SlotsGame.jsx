import React, { useState } from "react";

const symbols = ["🍒", "⭐", "🍋", "💎", "🍉", "🔔", "7️⃣"]; // Символы для барабанов

const SlotsGame = () => {
  const [slots, setSlots] = useState([
    [...symbols], // Первый барабан
    [...symbols], // Второй барабан
    [...symbols], // Третий барабан
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(5000);
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState("");

  const [reelPositions, setReelPositions] = useState([0, 0, 0]); // Позиция каждого барабана

  // Обработка кнопки "Крутить"
  const handleSpin = () => {
    if (balance < bet) {
      setMessage("Недостаточно средств для ставки!");
      return;
    }

    setMessage("");
    setIsSpinning(true);
    setBalance((prev) => prev - bet);

    const newPositions = [
      Math.floor(Math.random() * symbols.length), // Случайная позиция для первого барабана
      Math.floor(Math.random() * symbols.length), // Случайная позиция для второго барабана
      Math.floor(Math.random() * symbols.length), // Случайная позиция для третьего барабана
    ];

    const spinIntervals = [];
    slots.forEach((_, index) => {
      spinIntervals[index] = setInterval(() => {
        setReelPositions((prevPositions) => {
          const updatedPositions = [...prevPositions];
          updatedPositions[index] =
            (prevPositions[index] - 1 + symbols.length) % symbols.length; // Сдвиг вверх
          return updatedPositions;
        });
      }, 100); // Скорость вращения
    });

    // Устанавливаем меньшую задержку для первого, среднюю для второго, большую для третьего барабана
    const stopDelays = [
      Math.floor(1000 + Math.random() * 1000), // 1000–1500 мс
      Math.floor(2000 + Math.random() * 500), // 1500–2000 мс
      Math.floor(2500 + Math.random() * 500), // 2000–2500 мс
    ];

    stopDelays.forEach((delay, index) => {
      setTimeout(() => {
        clearInterval(spinIntervals[index]); // Останавливаем вращение барабана
        setReelPositions((prevPositions) => {
          const updatedPositions = [...prevPositions];
          updatedPositions[index] = newPositions[index]; // Устанавливаем конечную позицию
          return updatedPositions;
        });

        if (index === slots.length - 1) {
          setTimeout(() => {
            setIsSpinning(false);
            checkWin(newPositions);
          }, 500);
        }
      }, delay);
    });
  };

  // Проверка на выигрыш
  const checkWin = (finalPositions) => {
    const middleSymbols = finalPositions.map(
      (pos, index) => symbols[(pos + 1) % symbols.length]
    ); // Символы в средней линии

    if (middleSymbols.every((symbol, _, arr) => symbol === arr[0])) {
      const winAmount = bet * 10; // Выигрыш 10x от ставки
      setBalance((prev) => prev + winAmount);
      setMessage(`🎉 Вы выиграли ${winAmount} монет! 🎉`);
    } else {
      setMessage("😢 Попробуйте снова!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-white">
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
            className="w-28 h-48 bg-gray-700  text-5xl flex flex-col items-center justify-center rounded-lg shadow-xl border-2 overflow-hidden"
          >
            {Array(3)
              .fill(0)
              .map((_, i) => {
                // Вычисляем отображаемый символ
                const symbolIndex =
                  (reelPositions[reelIndex] + i) % symbols.length;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center w-full h-24`}
                  >
                    {symbols[symbolIndex]}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Кнопка "Крутить" */}
      <button
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-2xl font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50"
        onClick={handleSpin}
        disabled={isSpinning || balance < bet}
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
