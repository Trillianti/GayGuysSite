import React, { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    ClockIcon,
    CalendarIcon,
} from '@heroicons/react/outline';
import SignatureBlock from './SignatureBlock';

const roadmap = [
    {
        date: 'Jan 16, 2025',
        title: 'Запуск основного сайта',
        description: 'Основной сайт нашего сообщества запущен!',
        status: 'completed',
    },
    {
        date: 'Jul 18, 2025',
        title: 'AI-ассистент',
        description:
            'Добавление AI-ассистента на сайт. Умные ответы, автоматическое выполнение задач и помощь пользователям.',
        status: 'completed',
    },
    {
        date: 'Sep 1, 2025',
        title: 'Раздел с играми и внутрисайтовый банк',
        description:
            'Создание игровых разделов для участников: мини-игры, рейтинги. Добавление внутриигрового банка для управления ресурсами сообщества.',
        status: 'current',
    },
    {
        date: 'Oct 15, 2025',
        title: 'Интеграция крипто-биржи',
        description:
            'Запуск внутренней крипто-биржи для обмена токенов сервера. Возможности: торговля, хранение и обмен внутриигровой валюты.',
        status: 'upcoming',
    },
    {
        date: 'Dec 1, 2025',
        title: 'Мобильное приложение',
        description:
            'Разработка и запуск мобильного приложения для удобного доступа к сервисам сообщества на Android и iOS.',
        status: 'upcoming',
    },
    {
        date: 'Jan 20, 2026',
        title: 'Социальная платформа',
        description:
            'Запуск раздела социальной платформы: чаты, сообщества, личные профили. Новые возможности для общения и взаимодействия.',
        status: 'upcoming',
    },
    {
        date: 'Mar 5, 2026',
        title: 'Маркетплейс товаров сообщества',
        description:
            'Создание маркетплейса, где участники смогут обмениваться товарами и услугами за внутриигровую валюту или реальные деньги.',
        status: 'upcoming',
    },
    {
        date: 'Apr 25, 2026',
        title: 'Система голосования участников',
        description:
            'Введение системы голосования, чтобы пользователи могли влиять на развитие проекта и выбор новых функций.',
        status: 'upcoming',
    },
    {
        date: 'Jun 15, 2026',
        title: 'Образовательная платформа',
        description:
            'Запуск образовательной платформы с курсами и уроками для участников: программирование, дизайн, управление проектами.',
        status: 'upcoming',
    },
    {
        date: 'Aug 1, 2026',
        title: 'Мероприятие в реальной жизни',
        description:
            'Проведение первого оффлайн-мероприятия для участников сообщества. Встречи, конкурсы и награды.',
        status: 'upcoming',
    },
    {
        date: 'Sep 20, 2026',
        title: 'NFT-галерея участников',
        description:
            'Запуск NFT-галереи, где пользователи смогут выставлять свои цифровые работы, коллекции и торговать ими.',
        status: 'upcoming',
    },
    {
        date: 'Nov 10, 2026',
        title: 'Глобальная интеграция партнеров',
        description:
            'Привлечение глобальных партнеров для улучшения возможностей платформы. Новые сервисы, скидки и бонусы для участников.',
        status: 'upcoming',
    },
    {
        date: 'Dec 31, 2026',
        title: 'Обновление системы наград',
        description:
            'Внедрение новой системы наград за активность участников: рейтинги, трофеи, достижения.',
        status: 'upcoming',
    },
    {
        date: 'Feb 14, 2027',
        title: 'Праздничное обновление',
        description:
            'Добавление тематических обновлений на сайте: праздничные события, конкурсы и уникальные награды.',
        status: 'upcoming',
    },
];

const MainPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStage, setSelectedStage] = useState(null);
    const [progressWidth, setProgressWidth] = useState(0);

    const completedStages = roadmap.filter(
        (s) => s.status === 'completed',
    ).length;

    useEffect(() => {
        const timeout = setTimeout(() => {
            setProgressWidth((completedStages / roadmap.length) * 100);
        }, 100);
        return () => clearTimeout(timeout);
    }, [completedStages]);

    const filtered = roadmap.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'current':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen text-white py-16 px-4 flex flex-col items-center">
            <div className="text-center max-w-2xl mb-12 bg-white/5 backdrop-blur-md rounded-xl px-6 py-4 shadow-lg border border-white/10">
                <h1 className="text-4xl font-bold mb-2">
                    📍 Roadmap: Community Progress
                </h1>
                <p className="text-zinc-300 text-sm">
                    Следи за прогрессом. Даты могут меняться 😄
                </p>
            </div>

            <div className="mb-10 w-full max-w-md">
                <input
                    type="text"
                    placeholder="Поиск этапа..."
                    className="w-full px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="w-full max-w-4xl h-4 rounded-full overflow-hidden mb-14 border border-white/10 bg-white/10 backdrop-blur-md shadow-inner">
                <div
                    className="bg-gradient-to-r from-green-400 via-lime-400 to-green-500 h-full transition-all duration-700 ease-in-out"
                    style={{ width: `${progressWidth}%` }}
                ></div>
            </div>

            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full max-w-6xl">
                {filtered.map((stage, i) => (
                    <div
                        key={i}
                        onClick={() => setSelectedStage(stage)}
                        className="relative bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-transform cursor-pointer"
                    >
                        <div
                            className={`absolute -top-5 -left-5 w-10 h-10 rounded-full flex items-center justify-center ${getStatusStyle(
                                stage.status,
                            )}`}
                        >
                            {stage.status === 'completed' && (
                                <CheckCircleIcon className="w-5 h-5 text-white" />
                            )}
                            {stage.status === 'current' && (
                                <ClockIcon className="w-5 h-5 text-white" />
                            )}
                            {stage.status === 'upcoming' && (
                                <CalendarIcon className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">
                            {stage.title}
                        </h3>
                        <p className="text-sm text-gray-300 mb-3">
                            {stage.date}
                        </p>
                        <p className="text-sm text-gray-200">
                            {stage.description}
                        </p>
                        <span className="absolute bottom-3 right-3 text-[10px] px-3 py-1 bg-white/10 border border-white/10 rounded-full text-gray-300 uppercase">
                            {stage.status === 'completed'
                                ? 'Completed'
                                : stage.status === 'current'
                                ? 'Current'
                                : 'Upcoming'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Модалка */}
            {selectedStage && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setSelectedStage(null)}
                >
                    <div
                        className="bg-white/10 border border-white/10 backdrop-blur-xl p-8 rounded-2xl max-w-md w-full text-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4">
                            {selectedStage.title}
                        </h2>
                        <p className="text-sm text-gray-300 mb-6">
                            {selectedStage.description}
                        </p>
                        <button
                            onClick={() => setSelectedStage(null)}
                            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-20 w-full max-w-5xl">
                <SignatureBlock />
            </div>
        </div>
    );
};

export default MainPage;
