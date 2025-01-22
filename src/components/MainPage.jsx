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
    const timeout = setTimeout(() => {
      setProgressWidth((completedStages / roadmap.length) * 100);
    }, 100);

    return () => clearTimeout(timeout);
  }, [completedStages, roadmap.length]);

  const filteredRoadmap = roadmap.filter((stage) =>
    stage.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className=" text-white py-12 flex flex-col min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-6 z-10">Дорожная карта сообщества</h1>
      <p className="text-center text-gray-400 italic mb-8 z-10">
        Следите за развитием платформы! Даты и этапы могут изменяться.
      </p>

      {/* Поле для поиска */}
      <div className="flex justify-center mb-6 z-10">
        <input
          type="text"
          placeholder="Поиск этапа..."
          className="p-3 rounded bg-gray-800 text-white w-full max-w-md focus:outline-none focus:ring focus:ring-blue-500"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Полоса прогресса */}
      <div className="w-full max-w-4xl mx-auto bg-gray-700 rounded-full h-3 mb-12 z-10">
        <div
          className="bg-green-500 h-full rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>

      {/* Карточки этапов */}
      <div className="bg-gray-800 p-6 rounded-lg max-w-6xl mx-auto z-10 shadow-lg">
        <h3 className="text-3xl font-semibold text-white mb-6 text-center">Временная шкала</h3>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredRoadmap.map((stage, index) => (
            <div
              key={index}
              className="relative p-5 bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedStage(stage)}
            >
              <div
                className={`absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center ${
                  stage.status === "completed"
                    ? "bg-green-500"
                    : stage.status === "current"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              >
                {stage.status === "completed" && <CheckCircleIcon className="w-6 h-6 text-white" />}
                {stage.status === "current" && <ClockIcon className="w-6 h-6 text-white" />}
                {stage.status === "upcoming" && <CalendarIcon className="w-6 h-6 text-white" />}
              </div>
              <div className="pl-12">
                <h4 className="text-lg font-bold text-white mb-2">{stage.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{stage.date}</p>
                <p className="text-sm text-gray-300">
                  {stage.description
                    ? stage.description.split(" ").slice(0, 8).join(" ") + (stage.description.split(" ").length > 10 ? " ..." : "")
                    : "Описание этапа недоступно"}
                </p>

              </div>
              <div className="absolute bottom-0 right-0 m-2">
                <span className="text-xs px-3 py-1 bg-gray-600 text-gray-300 rounded-full">
                  {stage.status === "completed" ? "Завершено" : stage.status === "current" ? "Текущий" : "Будущий"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Модальное окно */}
      {selectedStage && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out z-20"
          onClick={() => setSelectedStage(null)}
        >
          <div
            className="bg-gray-800 text-white p-6 rounded-lg w-96 shadow-lg transform transition-transform duration-300 ease-out scale-105"
            onClick={(e) => e.stopPropagation()}
          >
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

      <SignatureBlock />
    </div>
  );
};

export default MainPage;