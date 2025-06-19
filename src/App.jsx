import { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
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
import PublicProfilePage from './components/PublicProfilePage';
import AiAssistant from './components/AiAssistant';

axios.defaults.withCredentials = true;

function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);

    const fetchUserData = async (discordId) => {
        try {
            const response = await axios.post('/api/users', {
                discord_id: discordId,
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.error('Пользователь не найден');
            } else {
                console.error('Ошибка сервера:', error);
            }
            return null;
        }
    };

    useEffect(() => {
        const fetchAndSetUserData = async () => {
            const userCookie = Cookies.get('discord_user');
            if (userCookie) {
                try {
                    const userDataCookie = JSON.parse(userCookie);
                    const userDataFetch = await fetchUserData(
                        userDataCookie.id,
                    );
                    if (userDataFetch) setUserData(userDataFetch);
                    setUser(userDataCookie);
                } catch (error) {
                    console.error('Ошибка парсинга cookies:', error);
                }
            } else {
                setUser(null);
            }
        };

        fetchAndSetUserData();
    }, []);

    return (
        <Router>
            <div className="flex flex-col max-w-screen h-screen overflow-x-hidden bg-zinc-900 relative">
                <div className="w-full z-20 flex justify-center">
                    <NavBar user={user} setUser={setUser} />
                </div>

                {/* Фоновые градиенты */}
                <div className="gradient-circle fixed bottom-[-50px] left-[-50px] w-[150px] h-[150px] lg:w-[300px] lg:h-[300px] md:w-[200px] md:h-[200px] sm:bottom-[-20px] sm:left-[-20px] sm:w-[150px] sm:h-[150px]"></div>
                <div className="gradient-circle delayed fixed top-[-50px] right-[-50px] w-[150px] h-[150px] lg:w-[300px] lg:h-[300px] md:w-[200px] md:h-[200px] sm:top-[-20px] sm:right-[-20px] sm:w-[150px] sm:h-[150px]"></div>

                {/* Контент */}
                <div className="h-full mb-3 z-10 mt-20 px-5">
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/games" element={<GamesPage />} />
                        <Route path="/exchange" element={<ExchangePage />} />
                        <Route path="/bank" element={<BankPage />} />
                        <Route
                            path="/profile"
                            element={
                                <ProfilePage user={user} userData={userData} />
                            }
                        />
                        <Route
                            path="/u/:discord_id"
                            element={<PublicProfilePage />}
                        />
                        {/* fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <AiAssistant />
                </div>
            </div>
        </Router>
    );
}

export default App;
