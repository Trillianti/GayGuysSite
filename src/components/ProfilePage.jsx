import React, { useState } from "react";
import axios from "axios";

const ProfilePage = ({ user, userData }) => {
    const defaultQuote = "Установите цитату, нажав кнопку редактирования";

    const [quote, setQuote] = useState(userData.quote || defaultQuote);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(quote);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const maxLength = 70;

    const saveQuote = async () => {
        if (!inputValue.trim()) {
            setError("Цитата не может быть пустой.");
            return;
        }

        if (inputValue.trim().length > maxLength) {
            setError("Цитата не должна превышать 70 символов.");
            return;
        }

        try {
            // Отправляем запрос на сервер для сохранения цитаты
            const response = await axios.post("/api/save-quote", {
                discord_id: user.id,
                quote: inputValue.trim(),
            });

            if (response.status === 200) {
                setQuote(inputValue.trim());
                setSuccess("Цитата успешно сохранена!");
                setIsEditing(false);
                setError("");
            }
        } catch (error) {
            console.error("Ошибка сохранения цитаты:", error);
            setError("Ошибка сохранения цитаты на сервере.");
        }
    };

    const cancelEdit = () => {
        setInputValue(quote);
        setIsEditing(false);
        setError("");
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setInputValue(value);
            setError("");
        } else {
            setError("Цитата не должна превышать 70 символов.");
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <h1 className="text-3xl font-bold">Пользователь не авторизован</h1>
            </div>
        );
    }

    const coins = userData?.coin?.toFixed(2) || "0.00";

    return (
        <div className="flex flex-col items-center justify-center h-full text-white px-4">
            {/* User Avatar */}
            <div className="relative mb-6">
                <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt="User Avatar"
                    className="w-36 h-36 rounded-full shadow-2xl border-4 border-blue-500"
                />
            </div>

            {/* User Name */}
            <h1 className="text-5xl font-extrabold mb-4 text-center">{user.global_name || "Имя пользователя"}</h1>

            {/* User Info Card */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-lg">
                <h2 className="text-3xl font-semibold mb-6">Информация</h2>
                <p className="mb-4 text-lg">
                    <span className="font-bold">Монеты:</span> {coins}
                </p>
                <p className="mb-4 text-lg">
                    <span className="font-bold">Логин:</span> {user.username || "Не указано"}
                </p>
                <p className="mb-6 text-lg">
                    <span className="font-bold">ID:</span> {user.id}
                </p>

                {/* Quote Section */}
                <div className="mb-4">
                    <h3 className="font-bold text-lg mb-2">Цитата:</h3>
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Введите вашу цитату"
                            />
                            <p
                                className={`text-sm ${
                                    inputValue.length > maxLength ? "text-red-500" : "text-gray-400"
                                }`}
                            >
                                {inputValue.length}/{maxLength}
                            </p>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {success && <p className="text-green-500 text-sm">{success}</p>}
                            <div className="flex space-x-4">
                                <button
                                    onClick={saveQuote}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
                                >
                                    Отменить
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <p className="text-gray-300 italic">{quote}</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
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
