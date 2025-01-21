import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './App.css';

// Компоненты
import NavBar from './components/NavBar';
import MainPage from './components/MainPage';
import GamesPage from './components/GamesPage';
import ExchangePage from './components/ExchangePage';
import BankPage from './components/BankPage';
import ProfilePage from './components/ProfilePage';

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [pageId, setPageId] = useState(1);

  // Асинхронная функция для получения данных пользователя
  const fetchUserData = async (discordId) => {
    try {
      const response = await axios.post(
        "/api/get-user",
        { discord_id: discordId }, // Передаём discord_id в body
        {
          withCredentials: true, // Если нужны cookies
        }
      );
      return response.data; // Возвращаем данные пользователя
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("Пользователь не найден");
      } else {
        console.error("Ошибка сервера:", error);
      }
      return null;
    }
  };

  // useEffect для проверки cookies и загрузки данных пользователя
  useEffect(() => {
    const fetchAndSetUserData = async () => {
      // Проверяем наличие cookies
      const userCookie = Cookies.get("discord_user");
      if (userCookie) {
        try {
          // Если cookie существует, преобразуем из JSON
          const userDataCookie = JSON.parse(userCookie);

          // Получаем данные пользователя с сервера
          const userDataFetch = await fetchUserData(userDataCookie.id);
          if (userDataFetch) {
            setUserData(userDataFetch); // Устанавливаем данные из сервера
          }

          setUser(userDataCookie); // Устанавливаем данные из cookies
        } catch (error) {
          console.error("Ошибка парсинга cookies или получения данных: ", error);
        }
      } else {
        // Если cookie не найдено, сбрасываем user
        setUser(null);
      }
    };

    fetchAndSetUserData(); // Вызываем асинхронную функцию
  }, []);

  // Функция для рендера текущей страницы
  const renderPage = () => {
    switch (pageId) {
      case 1:
        return <MainPage />;
      case 2:
        return <GamesPage />;
      case 3:
        return <ExchangePage />;
      case 4:
        return <BankPage />;
      case 5:
        return <ProfilePage user={user} userData={userData} />;
      default:
        return <MainPage />;
    }
  };

  return (
    <div className="flex flex-col max-w-screen px-5 h-screen overflow-x-hidden bg-zinc-900">
      {/* Верхняя панель навигации */}
      <div className="w-full">
        <NavBar user={user} setUser={setUser} setPageId={setPageId} />
      </div>
      <div className="gradient-background absolute bottom-5 left-5"></div>
      <div className="gradient-background absolute bottom-5 right-5"></div>
      {/* Основной контент */}
      <div className="h-full mb-3">{renderPage()}</div>
    </div>
  );
}

export default App;
