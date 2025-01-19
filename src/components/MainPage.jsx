import React from "react";
import { CheckCircleIcon, ClockIcon, CalendarIcon } from "@heroicons/react/outline";
import SignatureBlock from "./SignatureBlock";

const MainPage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStage, setSelectedStage] = React.useState(null);

  const roadmap = [
    {
      date: "Jan 16, 2025",
      title: "Запуск основного сайта",
      description: "Основной сайт нашего сообщества запущен!",
      status: "completed",
    },
    {
      date: "Feb 10, 2025",
      title: "Раздел с играми и внутрисайтовый банк",
      description:
        "Создание игровых разделов для участников: мини-игры, рейтинги. Добавление внутриигрового банка для управления ресурсами сообщества.",
      status: "current",
    },
    {
      date: "Mar 10, 2025",
      title: "Интеграция крипто-биржи",
      description:
        "Запуск внутренней крипто-биржи для обмена токенов сервера. Возможности: торговля, хранение и обмен внутриигровой валюты.",
      status: "upcoming",
    },
    {
      date: "Apr 10, 2025",
      title: "Coming soon",
      description: "Следите за новостями",
      status: "upcoming",
    },
  ];

  const filteredRoadmap = roadmap.filter((stage) =>
    stage.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedStages = roadmap.filter((stage) => stage.status === "completed").length;

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="bg-zinc-900 text-white px-6 py-12 flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-4">Дорожная карта сообщества</h1>

      <p className="text-sm text-center text-gray-400 italic mb-12">
        Обратите внимание: Даты и этапы могут быть изменены в зависимости от текущих потребностей и приоритетов сообщества.
      </p>

      {/* Поле для поиска */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Искать этап..."
          className="p-2 rounded bg-gray-800 text-white w-full max-w-md"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Полоса прогресса */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-12">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: `${(completedStages / roadmap.length) * 100}%` }}
        ></div>
      </div>

      {/* Карточки этапов */}
      <div className="flex flex-wrap justify-center gap-6">
        {filteredRoadmap.map((stage, index) => (
          <div
            key={index}
            className={`flex flex-col items-center w-56 p-4 rounded-lg shadow-md transition transform hover:scale-105 cursor-pointer ${
              stage.status === "completed"
                ? "bg-green-600 text-white border-green-800"
                : stage.status === "current"
                ? "bg-blue-600 text-white border-blue-800"
                : "bg-gray-800 text-gray-400 border-gray-700"
            } border-2`}
            onClick={() => setSelectedStage(stage)}
          >
            {/* Иконка статуса */}
            {stage.status === "completed" && <CheckCircleIcon className="w-6 h-6 text-green-200 mb-2" />}
            {stage.status === "current" && <ClockIcon className="w-6 h-6 text-yellow-200 mb-2" />}
            {stage.status === "upcoming" && <CalendarIcon className="w-6 h-6 text-gray-300 mb-2" />}

            {/* Дата этапа */}
            <div className="text-xs uppercase font-bold text-center">{stage.date}</div>

            {/* Заголовок этапа */}
            <h2 className="text-lg font-bold mt-3 text-center">{stage.title}</h2>

            {/* Ограниченное описание этапа */}
            <p className="text-sm text-center mt-2">
              {truncateText(stage.description, 60)} {/* Максимум 60 символов */}
            </p>

            {/* Статусный маркер */}
            {stage.status === "completed" && (
              <div className="mt-3 text-xs font-semibold text-green-200">Завершено</div>
            )}
            {stage.status === "current" && (
              <div className="mt-3 text-xs font-semibold text-yellow-200">Текущий этап</div>
            )}
            {stage.status === "upcoming" && (
              <div className="mt-3 text-xs font-semibold text-gray-300">Впереди</div>
            )}
          </div>
        ))}
      </div>

      {/* Модальное окно для полного описания */}
      {selectedStage && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{selectedStage.title}</h2>
            <p className="mb-6">{selectedStage.description}</p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setSelectedStage(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* TODO: подписной блок */}
      <SignatureBlock />
    </div>
  );
};

export default MainPage;
