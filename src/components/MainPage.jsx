import React, { useState, useEffect } from "react";
import { CheckCircleIcon, ClockIcon, CalendarIcon } from "@heroicons/react/outline";
import SignatureBlock from "./SignatureBlock";

const MainPage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStage, setSelectedStage] = React.useState(null);
  const [progressWidth, setProgressWidth] = useState(0);

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
      title: "Мобильное приложение",
      description:
        "Разработка и запуск мобильного приложения для удобного доступа к сервисам сообщества на Android и iOS.",
      status: "upcoming",
    },
    {
      date: "May 5, 2025",
      title: "Социальная платформа",
      description:
        "Запуск раздела социальной платформы: чаты, сообщества, личные профили. Новые возможности для общения и взаимодействия.",
      status: "upcoming",
    },
    {
      date: "Jun 20, 2025",
      title: "AI-ассистент",
      description:
        "Добавление AI-ассистента на сайт. Умные ответы, автоматическое выполнение задач и помощь пользователям.",
      status: "upcoming",
    },
    {
      date: "Jul 15, 2025",
      title: "Маркетплейс товаров сообщества",
      description:
        "Создание маркетплейса, где участники смогут обмениваться товарами и услугами за внутриигровую валюту или реальные деньги.",
      status: "upcoming",
    },
    {
      date: "Aug 10, 2025",
      title: "Система голосования участников",
      description:
        "Введение системы голосования, чтобы пользователи могли влиять на развитие проекта и выбор новых функций.",
      status: "upcoming",
    },
    {
      date: "Sep 25, 2025",
      title: "Образовательная платформа",
      description:
        "Запуск образовательной платформы с курсами и уроками для участников: программирование, дизайн, управление проектами.",
      status: "upcoming",
    },
    {
      date: "Oct 10, 2025",
      title: "Мероприятие в реальной жизни",
      description:
        "Проведение первого оффлайн-мероприятия для участников сообщества. Встречи, конкурсы и награды.",
      status: "upcoming",
    },
    {
      date: "Nov 20, 2025",
      title: "NFT-галерея участников",
      description:
        "Запуск NFT-галереи, где пользователи смогут выставлять свои цифровые работы, коллекции и торговать ими.",
      status: "upcoming",
    },
    {
      date: "Dec 15, 2025",
      title: "Глобальная интеграция партнеров",
      description:
        "Привлечение глобальных партнеров для улучшения возможностей платформы. Новые сервисы, скидки и бонусы для участников.",
      status: "upcoming",
    },
    {
      date: "Jan 1, 2026",
      title: "Обновление системы наград",
      description:
        "Внедрение новой системы наград за активность участников: рейтинги, трофеи, достижения.",
      status: "upcoming",
    },
    {
      date: "Feb 14, 2026",
      title: "Праздничное обновление",
      description:
        "Добавление тематических обновлений на сайте: праздничные события, конкурсы и уникальные награды.",
      status: "upcoming",
    },
  ];
  
  const completedStages = roadmap.filter((stage) => stage.status === "completed").length;
  useEffect(() => {
    // Обновляем ширину с небольшой задержкой, чтобы анимация сработала
    const timeout = setTimeout(() => {
      setProgressWidth((completedStages / roadmap.length) * 100);
    }, 100); // Задержка, чтобы активировать transition

    return () => clearTimeout(timeout);
  }, [completedStages, roadmap.length]);

  const filteredRoadmap = roadmap.filter((stage) =>
    stage.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="bg-zinc-900 text-white px-6 py-12 flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-4 z-10">Дорожная карта сообщества</h1>

      <p className="text-sm text-center text-gray-400 italic mb-12 z-10">
        Обратите внимание: Даты и этапы могут быть изменены в зависимости от текущих потребностей и приоритетов сообщества.
      </p>

      {/* Поле для поиска */}
      <div className="flex justify-center mb-6 z-10">
        <input
          type="text"
          placeholder="Искать этап..."
          className="p-2 rounded bg-gray-800 text-white w-full max-w-md"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Полоса прогресса */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-12 z-10">
        <div
          className="bg-green-500 h-full rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>

      {/* Карточки этапов */}
      <div className="flex flex-wrap justify-center gap-6 z-10">
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
        <div className="fixed top-0 left-0 w-full h-full flex items-center z-20 justify-center bg-black bg-opacity-50">
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
