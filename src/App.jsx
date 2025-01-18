import { useState, useEffect } from 'react';
import './App.css';
import NavBar from './components/NavBar';
import MainPage from './components/MainPage';
import GamesPage from './components/GamesPage';
import ExchangePage from './components/ExchangePage';
import BankPage from './components/BankPage';
import ProfilePage from './components/ProfilePage';

function App() {
  const [user, setUser] = useState(null)
  const [pageId, setPageId] = useState(1)

  useEffect(() => {
    let a = true;
    if (a === true) {
      setUser(true);
    } else {
      setUser(null);
    }
  }, []);

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
        return <ProfilePage />;
      default:
        return <MainPage />;
    }
  };

  return (
    <div className="flex flex-col w-screen px-5 h-screen bg-zinc-900">
      {/* Верхняя панель навигации */}
      <div className="w-full">
        <NavBar user={user} setPageId={setPageId} />
      </div>

      {/* Основной контент */}
      <div className="rounded-lg shadow-lg h-full mb-3">
        {renderPage()}
      </div>
    </div>

  );
}

export default App;
