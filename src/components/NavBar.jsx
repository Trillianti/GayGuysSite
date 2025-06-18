import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ user, setUser }) => {
    const AUTH_URL = import.meta.env.VITE_AUTH_URL;
    const MAIN_URL = import.meta.env.VITE_MAIN_URL;

    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogin = () => {
        window.location.href = AUTH_URL;
    };

    const handleLogout = async () => {
        try {
            await axios.get('/api/logout', { withCredentials: true });
            setUser(null);
            navigate('/');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const pages = [
        { path: '/', label: 'Главная' },
        { path: '/games', label: 'Игры' },
        { path: '/exchange', label: 'Биржа' },
        { path: '/bank', label: 'Банк' },
    ];

    return (
        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/5 border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-3">
                    <img
                        src="https://placehold.co/40x40"
                        alt="Logo"
                        className="w-10 h-10 rounded-xl border border-white/20"
                    />
                    <span className="text-white text-xl font-bold drop-shadow-sm">
                        GayGuys
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6">
                    {user &&
                        pages.map((page) => (
                            <Link
                                key={page.path}
                                to={page.path}
                                className="text-sm text-white hover:text-indigo-300 transition-all"
                            >
                                {page.label}
                            </Link>
                        ))}

                    {user ? (
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center space-x-2 ml-4"
                            >
                                <img
                                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full border border-white/20 shadow"
                                />
                                <span className="text-sm text-white drop-shadow">
                                    {user.username}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="ml-4 text-red-400 hover:text-red-600 transition"
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="ml-4 bg-indigo-600/70 hover:bg-indigo-500/80 text-white text-sm px-4 py-2 rounded-lg transition-all shadow-md backdrop-blur-sm border border-white/10"
                        >
                            <i className="fa-brands fa-discord mr-2"></i> Войти
                            с Discord
                        </button>
                    )}
                </nav>

                {/* Mobile toggle */}
                <button
                    className="md:hidden text-white text-xl"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <i
                        className={`fa-solid ${
                            menuOpen ? 'fa-xmark' : 'fa-bars'
                        }`}
                    ></i>
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden backdrop-blur-xl bg-zinc-900/70 border-t border-white/10 text-white px-6 py-4 space-y-4 transition-all">
                    <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm hover:text-indigo-300"
                    >
                        Главная
                    </Link>

                    {user &&
                        pages
                            .filter((page) => page.path !== '/')
                            .map((page) => (
                                <Link
                                    key={page.path}
                                    to={page.path}
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-sm hover:text-indigo-300"
                                >
                                    {page.label}
                                </Link>
                            ))}

                    {user ? (
                        <>
                            <Link
                                to="/profile"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center space-x-2 pt-2"
                            >
                                <img
                                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                                    className="w-6 h-6 rounded-full border border-white/20 shadow"
                                    alt="User"
                                />
                                <span>{user.username}</span>
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMenuOpen(false);
                                }}
                                className="text-red-400 text-left text-sm mt-2 hover:text-red-600"
                            >
                                <i className="fa-solid fa-right-from-bracket mr-2"></i>{' '}
                                Выйти
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                handleLogin();
                                setMenuOpen(false);
                            }}
                            className="bg-indigo-600/70 hover:bg-indigo-500/80 text-white text-sm px-4 py-2 rounded-lg transition shadow-md backdrop-blur-sm border border-white/10"
                        >
                            <i className="fa-brands fa-discord mr-2"></i> Войти
                            с Discord
                        </button>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
