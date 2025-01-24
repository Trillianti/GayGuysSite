import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./App.css";

// Компоненты
import NavBar from "./components/NavBar";
import MainPage from "./components/MainPage";
import GamesPage from "./components/GamesPage";
import ExchangePage from "./components/ExchangePage";
import BankPage from "./components/BankPage";
import ProfilePage from "./components/ProfilePage";

axios.defaults.withCredentials = true;

function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [pageId, setPageId] = useState(
        parseInt(localStorage.getItem("pageId")) || 1
    );

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

    useEffect(() => {
        localStorage.setItem("pageId", pageId);
    }, [pageId]);

    // useEffect для проверки cookies и загрузки данных пользователя
    useEffect(() => {
        const fetchAndSetUserData = async () => {
            const userCookie = Cookies.get("discord_user");
            if (userCookie) {
                try {
                    const userDataCookie = JSON.parse(userCookie);

                    const userDataFetch = await fetchUserData(userDataCookie.id);
                    if (userDataFetch) {
                        setUserData(userDataFetch); // Устанавливаем данные из сервера
                    }

                    setUser(userDataCookie); // Устанавливаем данные из cookies
                } catch (error) {
                    console.error("Ошибка парсинга cookies или получения данных:", error);
                }
            } else {
                localStorage.setItem("pageId", 1);
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
        <div className="flex flex-col max-w-screen h-screen overflow-x-hidden bg-zinc-900 relative">
            <div className="w-full !z-20 flex justify-center">
                <NavBar user={user} setUser={setUser} setPageId={setPageId} />
            </div>

            {/* Градиентные элементы фона */}
            <div className="gradient-circle fixed bottom-[-50px] left-[-50px] w-[150px] h-[150px] lg:w-[300px] lg:h-[300px] md:w-[200px] md:h-[200px] sm:bottom-[-20px] sm:left-[-20px] sm:w-[150px] sm:h-[150px]"></div>
            <div className="gradient-circle delayed fixed top-[-50px] right-[-50px] w-[150px] h-[150px] lg:w-[300px] lg:h-[300px] md:w-[200px] md:h-[200px] sm:top-[-20px] sm:right-[-20px] sm:w-[150px] sm:h-[150px]"></div>

            {/* Основной контент */}
            <div className="h-full mb-3 z-10 mt-20 px-5">{renderPage()}</div>
        </div>
    );
}

export default App;
