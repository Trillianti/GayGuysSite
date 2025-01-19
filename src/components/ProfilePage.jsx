import React from "react";

const ProfilePage = ({ user, userData }) => {
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <h1 className="text-2xl font-bold">Пользователь не авторизован</h1>
      </div>
    );
  }
  const coins = userData.coin;
  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      {/* Аватар пользователя */}
      <div className="mb-6">
        <img
          src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
          alt="User Avatar"
          className="w-32 h-32 rounded-full shadow-lg"
        />
      </div>
      <h1 className="text-4xl font-bold mb-4">{user.global_name}</h1>
      <p className="text-lg text-gray-400 mb-6"></p>
      <p className="text-lg text-gray-400 mb-6"></p>
      <div className="bg-zinc-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Информация</h2>
        <p className="mb-2">
          Монеты: {coins.toFixed(2)}
        </p>
        <p className="mb-2">
          Логин: {user.username}
        </p>
        <p className="mb-2">
          ID: {user.id}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
