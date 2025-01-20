import React, { useState, useEffect } from "react";
import axios from "axios";

const SignatureBlock = () => {
  const [usersByRole, setUsersByRole] = useState({});
  const fetchSignatureBlock = async () => {
    try {
      const response = await axios.get("http://localhost:50001/get-quotes");
      const users = response.data;
      // Группируем пользователей по ролям
      const groupedByRole = users.reduce((acc, user) => {
        if (!acc[user.role]) acc[user.role] = [];
        acc[user.role].push(user);
        return acc;
      }, {});

      setUsersByRole(groupedByRole);
    } catch (error) {
      console.error("Ошибка сервера:", error);
    }
  };
  useEffect(() => {
    

    fetchSignatureBlock();
  }, []);

  return (
    <div className="flex flex-col items-center  text-white py-10 px-5 z-10">
        <h1 className="text-4xl font-bold text-center mb-4">Наш колектив</h1>
      {Object.keys(usersByRole).map((role) => (
        <div key={role} className="mb-8 w-full">
          {/* Название роли */}
          <h3
            className={`text-center text-lg font-semibold mb-4 ${
              role === "1"
                ? "text-[#9B59B6]"
                : role === "2"
                ? "text-red-500"
                : role === "3"
                ? "text-[#1ABC9C]"
                : "text-[#3498DB]"
            }`}
          >
            {role === "1" && "👑 Мега гей"}
            {role === "2" && "🔴 Сенаторы"}
            {role === "3" && "⚪ Модераторы"}
            {role === "4" && "🔵 Новички"}
          </h3>

          {/* Карточки пользователей */}
          <div className="flex flex-wrap justify-center gap-6">
            {usersByRole[role].map((user) => (
              <div
                key={user.discord_id}
                className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg w-64"
              >
                <div className="flex items-center mb-2">
                    <img
                    src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`}
                    alt={user.global_name}
                    className="w-12 h-12 rounded-full"
                    />
                    <p className="text-sm font-medium text-white">
                    &nbsp;&nbsp;{user.global_name}
                    </p>
                </div>
                <div className="italic font-thin font-sans text-center">{user.qoute || "Пока нет цитаты"}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SignatureBlock;
