import React from "react";

const MainPage = () => {
  const roadmap = [
    {
      date: "Jan 16, 2025",
      title: "Запуск основного сайта",
      description: "Основной сайт нашего сообщества запущен!",
      status: "current", // Текущий этап
    },
    {
      date: "Feb 10, 2025",
      title: "Раздел с играми и внутрисайтовый банк",
      description: "Создание игровых разделов для участников: мини-игры, рейтинги. Добавление внутриигрового банка для управления ресурсами сообщества.",
      status: "upcoming", // Будущий этап
    },
    {
      date: "Mar 10, 2025",
      title: "Интеграция крипто-биржи",
      description: "Запуск внутренней крипто-биржи для обмена токенов сервера. Возможности: торговля, хранение и обмен внутриигровой валюты.",
      status: "upcoming", // Будущий этап
    },
    {
      date: "Apr 10, 2025",
      title: "Coming soon",
      description: "Следите за новостями",
      status: "upcoming", // Будущий этап
    },
  ];
  

  return (
    <div className="bg-zinc-900 text-white px-6 py-12 flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-4">
        Дорожная карта сообщества
      </h1>
      
      {/* Спойлер о датах */}
      <p className="text-sm text-center text-gray-400 italic mb-12">
        Обратите внимание: Даты и этапы могут быть изменены в зависимости от текущих потребностей и приоритетов сообщества.
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        {roadmap.map((stage, index) => (
          <div
            key={index}
            className={`flex flex-col items-center w-56 p-4 rounded-lg shadow-md ${
              stage.status === "completed"
                ? "bg-green-600 text-white border-green-800"
                : stage.status === "current"
                ? "bg-blue-600 text-white border-blue-800"
                : "bg-gray-800 text-gray-400 border-gray-700"
            } border-2`}
          >
            {/* Дата этапа */}
            <div className="text-xs uppercase font-bold text-center">
              {stage.date}
            </div>

            {/* Заголовок этапа */}
            <h2 className="text-lg font-bold mt-3 text-center">{stage.title}</h2>

            {/* Описание этапа */}
            <p className="text-sm text-center mt-2">{stage.description}</p>

            {/* Статусный маркер */}
            {stage.status === "completed" && (
              <div className="mt-3 text-xs font-semibold text-green-200">
                Завершено
              </div>
            )}
            {stage.status === "current" && (
              <div className="mt-3 text-xs font-semibold text-yellow-200">
                Текущий этап
              </div>
            )}
            {stage.status === "upcoming" && (
              <div className="mt-3 text-xs font-semibold text-gray-300">
                Впереди
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

  );
};

export default MainPage;
