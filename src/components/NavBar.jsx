import React, { useState } from "react";
import axios from "axios";

const Navbar = ({ user, setUser, setPageId }) => {
  const AUTH_URL =
    "https://discord.com/oauth2/authorize?client_id=1330201160191185036&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A50001%2Fauth%2Fdiscord%2Fcallback&scope=identify";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  const handleLogout = async () => {
    try {
      await axios.get("/api/logout", {
        withCredentials: true,
      });
      setUser(null);
      window.location.href = "http://localhost:5173"; // Перенаправление на клиенте
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  return (
    <div className="py-3">
      <div className="flex w-full h-20 bg-gray-700 text-white rounded-xl shadow-lg select-none items-center justify-between px-6">
        <div className="flex items-center cursor-pointer">
          <img
            src="https://placehold.co/50"
            className="w-[50px] h-[50px] rounded-lg"
            alt="Logo"
          />
          <span className="ml-2 text-lg font-bold">GayGuys</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <div
            className="text-sm font-medium hover:text-gray-400 cursor-pointer"
            onClick={() => setPageId(1)}
          >
            Главная
          </div>
          {user ? (
            <>
              <div
                className="text-sm font-medium hover:text-gray-400 cursor-pointer"
                onClick={() => setPageId(2)}
              >
                Игры
              </div>
              <div
                className="text-sm font-medium hover:text-gray-400 cursor-pointer"
                onClick={() => setPageId(3)}
              >
                Биржа
              </div>
              <div
                className="text-sm font-medium hover:text-gray-400 cursor-pointer"
                onClick={() => setPageId(4)}
              >
                Банк
              </div>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setPageId(5)}
              >
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  className="w-[30px] h-[30px] rounded-full"
                  alt="Profile"
                />
                <span className="ml-2">{user.username}</span>
              </div>
              <i
                className="fa-regular fa-arrow-right-from-bracket ml-4 px-2 py-1 rounded hover:text-red-700 transition-all duration-150 cursor-pointer"
                onClick={handleLogout}
              ></i>
            </>
          ) : (
            <div
              className="bg-zinc-600 px-4 py-2 text-sm rounded-lg font-medium hover:bg-discord hover:rounded-sm transition-all duration-150 cursor-pointer"
              onClick={handleLogin}
            >
              <i className="fa-brands fa-discord"></i> Авторизация через Discord
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i
              className={`fa-solid ${
                isMobileMenuOpen ? "fa-times" : "fa-bars"
              } text-lg`}
            ></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-700 text-white rounded-xl mt-2 shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div
          className="py-2 px-4 text-sm font-medium hover:bg-gray-600 cursor-pointer"
          onClick={() => {
            setPageId(1);
            setIsMobileMenuOpen(false);
          }}
        >
          Главная
        </div>
        {user ? (
          <>
            <div
              className="py-2 px-4 text-sm font-medium hover:bg-gray-600 cursor-pointer"
              onClick={() => {
                setPageId(2);
                setIsMobileMenuOpen(false);
              }}
            >
              Игры
            </div>
            <div
              className="py-2 px-4 text-sm font-medium hover:bg-gray-600 cursor-pointer"
              onClick={() => {
                setPageId(3);
                setIsMobileMenuOpen(false);
              }}
            >
              Биржа
            </div>
            <div
              className="py-2 px-4 text-sm font-medium hover:bg-gray-600 cursor-pointer"
              onClick={() => {
                setPageId(4);
                setIsMobileMenuOpen(false);
              }}
            >
              Банк
            </div>
            <div
              className="py-2 px-4 flex items-center cursor-pointer"
              onClick={() => {
                setPageId(5);
                setIsMobileMenuOpen(false);
              }}
            >
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                className="w-[30px] h-[30px] rounded-full"
                alt="Profile"
              />
              <span className="ml-2">{user.username}</span>
            </div>
            <div
              className="py-2 px-4 text-sm font-medium text-red-700 hover:bg-gray-600 cursor-pointer"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              Выйти
            </div>
          </>
        ) : (
          <div
            className="py-2 px-4 bg-zinc-600 text-sm rounded-lg font-medium hover:bg-discord hover:rounded-sm transition-all duration-150 cursor-pointer"
            onClick={() => {
              handleLogin();
              setIsMobileMenuOpen(false);
            }}
          >
            <i className="fa-brands fa-discord"></i> Авторизация через Discord
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
