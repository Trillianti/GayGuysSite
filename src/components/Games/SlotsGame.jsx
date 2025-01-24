import React, { useState, useEffect, useRef } from "react";

const symbols = ["🍒", "⭐", "🍋", "💎", "🍉", "🔔", "7️⃣"];
const SPIN_DURATION = 2000; // Длительность вращения
const SYMBOL_HEIGHT = 80; // Высота символа

const SlotsGame = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState("");
  const [finalPositions, setFinalPositions] = useState([0, 0, 0]);
  const [isAutoSpin, setIsAutoSpin] = useState(false);

  // Рефы для контроля анимации каждого барабана
  const reelRefs = [
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  const handleSpin = () => {
    if (balance < bet) {
      setMessage("Недостаточно средств для ставки!");
      setIsAutoSpin(false); // Остановить автопрокрутку при недостатке средств
      return;
    }

    setMessage("");
    setIsSpinning(true);
    setBalance((prev) => prev - bet);

    // Генерируем финальные позиции
    const newPositions = [
      Math.floor(Math.random() * symbols.length),
      Math.floor(Math.random() * symbols.length),
      Math.floor(Math.random() * symbols.length)
    ];

    // Различная длительность остановки для каждого барабана
    const stopDelays = [1200, 1700, 2200];

    // Анимация вращения для каждого барабана
    reelRefs.forEach((ref, index) => {
      if (ref.current) {
        // Быстрое вращение
        ref.current.style.transition = 'transform 0.05s linear';
        
        const spinInterval = setInterval(() => {
          ref.current.style.transform = `translateY(-${Math.random() * SYMBOL_HEIGHT * symbols.length}px)`;
        }, 20);

        // Остановка барабана
        setTimeout(() => {
          clearInterval(spinInterval);
          
          // Плавная остановка на нужной позиции
          ref.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
          ref.current.style.transform = `translateY(-${newPositions[index] * SYMBOL_HEIGHT}px)`;
        }, stopDelays[index]);
      }
    });

    // Завершение игры
    setTimeout(() => {
      setIsSpinning(false);
      setFinalPositions(newPositions);
      checkWin(newPositions);
    }, SPIN_DURATION);
  };

  const checkWin = (positions) => {
    const middleSymbols = positions.map(
      (pos) => symbols[(pos + 1) % symbols.length]
    );

    if (middleSymbols.every((symbol, _, arr) => symbol === arr[0])) {
      const winAmount = bet * 45;
      setBalance((prev) => prev + winAmount);
      setMessage(`🎉 Вы выиграли ${winAmount} монет! 🎉`);
    } else {
      setMessage("😢 Попробуйте снова!");
    }
  };

  const handleAutoSpinToggle = () => {
    setIsAutoSpin((prev) => !prev);
  };

  useEffect(() => {
    if (isAutoSpin && !isSpinning) {
      const autoSpinInterval = setInterval(() => {
        if (balance >= bet) {
          handleSpin();
        } else {
          clearInterval(autoSpinInterval);
          setIsAutoSpin(false);
        }
      }, SPIN_DURATION + 100); 

      return () => clearInterval(autoSpinInterval);
    }
  }, [isAutoSpin, isSpinning, balance, bet]);

  const renderReel = (reelIndex) => {
    return (
      <div 
        className="w-28 h-48 bg-gray-700 text-5xl rounded-lg shadow-xl border-2 overflow-hidden relative"
      >
        <div 
          ref={reelRefs[reelIndex]}
          className="absolute w-full flex flex-col"
        >
          {[...symbols, ...symbols, ...symbols].map((symbol, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center w-full"
              style={{ height: `${SYMBOL_HEIGHT}px` }}
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-white">
      <h1 className="text-6xl font-extrabold mb-6 text-yellow-400 drop-shadow-lg">
        🎰 Слоты
      </h1>

      <div className="flex items-center justify-center space-x-8 mb-8">
        <div className="text-2xl">
          Баланс: <span className="text-green-400 font-bold">{balance} монет</span>
        </div>
        <div className="text-2xl">
          Ставка: {" "}
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

      <div className="flex space-x-6 mb-8">
        {[0, 1, 2].map(reelIndex => renderReel(reelIndex))}
      </div>

      <div className="flex space-x-4">
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-2xl font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50 w-48"
          onClick={handleSpin}
          disabled={isSpinning || balance < bet}
        >
          {isSpinning ? "Крутится..." : "Крутить"}
        </button>

        <button
          className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-xl font-bold py-2 px-4 rounded-full transition-all w-20 ${isAutoSpin ? "ring-4 ring-green-400" : ""}`}
          onClick={handleAutoSpinToggle}
          disabled={balance < bet}
        >
          {isAutoSpin ? "Стоп" : "Авто"}
        </button>
      </div>

      {message && (
        <p className="text-2xl font-bold mt-8 text-yellow-400 animate-bounce">
          {message}
        </p>
      )}
    </div>
  );
};

export default SlotsGame;
