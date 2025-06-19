import React, { useState } from 'react';
import axios from 'axios';

const ProfilePage = ({ user, userData }) => {
    const defaultQuote = 'Установите цитату, нажав кнопку редактирования';

    const [quote, setQuote] = useState(userData?.quote || defaultQuote);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(quote);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const maxLength = 70;
    const coins = Number(userData?.coin || 0).toFixed(2);

    const saveQuote = async () => {
        if (!inputValue.trim()) return setError('Цитата не может быть пустой.');
        if (inputValue.trim().length > maxLength)
            return setError('Цитата не должна превышать 70 символов.');

        try {
            const response = await axios.post(
                '/api/users',
                { discord_id: user.id, quote: inputValue.trim() },
                { withCredentials: true },
            );

            if (response.status === 200) {
                setQuote(inputValue.trim());
                setSuccess('Цитата успешно сохранена!');
                setIsEditing(false);
                setError('');
            }
        } catch (error) {
            setError('Ошибка при сохранении цитаты');
        }
    };

    const cancelEdit = () => {
        setInputValue(quote);
        setIsEditing(false);
        setError('');
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setInputValue(value);
            setError('');
        } else {
            setError('Цитата не должна превышать 70 символов.');
        }
    };

    if (!user || !userData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white animate-fadeIn px-4">
                <div className="w-28 h-28 mb-6 rounded-full bg-zinc-700 animate-pulse" />
                <div className="w-48 h-6 mb-3 rounded bg-zinc-700 animate-pulse" />
                <div className="w-full max-w-md bg-zinc-800 p-6 rounded-xl shadow-lg space-y-4">
                    <div className="w-32 h-5 rounded bg-zinc-700 animate-pulse" />
                    <div className="w-40 h-4 rounded bg-zinc-700 animate-pulse" />
                    <div className="w-24 h-4 rounded bg-zinc-700 animate-pulse" />
                    <div className="w-36 h-4 rounded bg-zinc-700 animate-pulse" />
                </div>
                <p className="text-sm text-gray-400 mt-6 animate-pulse">
                    Загружаем ваш профиль...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full px-4 text-white">
            <div className="relative mb-6 ring-4 ring-indigo-500 ring-offset-4 ring-offset-black rounded-full shadow-xl">
                <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt="User Avatar"
                    className="w-40 h-40 rounded-full object-cover"
                />
            </div>

            <h1 className="text-4xl font-extrabold mb-2 drop-shadow">
                {user.global_name || 'Имя пользователя'}
            </h1>
            <p className="text-indigo-400 mb-8 font-medium drop-shadow">
                @{user.username}
            </p>

            <div className="w-full max-w-xl p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Информация</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white">
                        <div className="rounded-lg p-4 bg-white/10 backdrop-blur border border-white/10">
                            <span className="block text-indigo-400 font-semibold text-xs mb-1">
                                Discord ID
                            </span>
                            {user.id}
                        </div>
                        <div className="rounded-lg p-4 bg-white/10 backdrop-blur border border-white/10">
                            <span className="block text-indigo-400 font-semibold text-xs mb-1">
                                Монеты
                            </span>
                            {coins}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h3 className="text-xl font-semibold mb-3">Цитата</h3>
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-white/10 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur"
                                placeholder="Введите вашу цитату"
                            />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">
                                    {inputValue.length}/{maxLength}
                                </span>
                                {error && (
                                    <p className="text-red-400">{error}</p>
                                )}
                                {success && (
                                    <p className="text-green-400">{success}</p>
                                )}
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={saveQuote}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition"
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center bg-white/10 p-4 rounded-lg border border-white/10 backdrop-blur">
                            <p className="italic text-white/80 max-w-[70%]">
                                “{quote}”
                            </p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition"
                            >
                                Редактировать
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
