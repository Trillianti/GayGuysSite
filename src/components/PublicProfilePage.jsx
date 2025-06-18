import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const roleStyles = {
    1: {
        label: '👑 Мега гей',
        ring: 'ring-purple-500',
        glow: 'shadow-purple-500/40',
    },
    2: { label: '🔴 Сенатор', ring: 'ring-red-500', glow: 'shadow-red-500/40' },
    3: {
        label: '🟢 Модератор',
        ring: 'ring-emerald-500',
        glow: 'shadow-emerald-500/40',
    },
    4: {
        label: '🔵 Натуральный гей',
        ring: 'ring-blue-500',
        glow: 'shadow-blue-500/40',
    },
};

const PublicProfilePage = () => {
    const { discord_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`/api/profile/${discord_id}`)
            .then((res) => setProfile(res.data))
            .catch((err) => console.error('Ошибка загрузки профиля:', err))
            .finally(() => setLoading(false));
    }, [discord_id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white animate-fadeIn px-4">
                <div className="w-28 h-28 rounded-full bg-zinc-700 animate-pulse mb-4" />
                <div className="w-52 h-6 rounded bg-zinc-700 animate-pulse mb-3" />
                <div className="w-44 h-4 rounded bg-zinc-700 animate-pulse mb-6" />
                <div className="w-full max-w-md h-32 rounded-2xl bg-zinc-800/60 backdrop-blur-lg animate-pulse border border-white/10" />
                <p className="text-sm text-gray-400 mt-6 animate-pulse">
                    Загружаем профиль...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-white text-center mt-20 text-xl">
                ❌ Профиль не найден
            </div>
        );
    }

    const role = roleStyles[profile.role] || {
        label: '🧑 Участник',
        ring: 'ring-gray-500',
        glow: 'shadow-zinc-500/30',
    };

    return (
        <div className="flex justify-center items-center h-full px-4">
            <div
                className={`w-full max-w-2xl p-8 rounded-3xl border border-white/10 backdrop-blur-xl bg-white/5 shadow-xl`}
            >
                <div className="flex flex-col items-center text-white">
                    <div
                        className={`ring-4 ${role.ring} ${role.glow} ring-offset-4 ring-offset-black rounded-full shadow-xl transition-all`}
                    >
                        <img
                            src={`https://cdn.discordapp.com/avatars/${discord_id}/${profile.avatar}.png`}
                            alt="Аватар"
                            className="w-36 h-36 rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold mt-6 drop-shadow">
                        {profile.global_name || profile.username}
                    </h1>
                    <p className="text-lg mt-1 text-indigo-300 font-medium drop-shadow-sm">
                        {role.label}
                    </p>
                    <p className="italic text-center mt-4 text-zinc-300 max-w-md">
                        “{profile.quote || 'Цитата не установлена'}”
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 text-white">
                    <div className="rounded-xl p-6 backdrop-blur-md bg-white/5 border border-white/10 shadow-md hover:shadow-xl transition-all">
                        <p className="text-sm text-gray-400 mb-1">Discord ID</p>
                        <p className="text-lg font-semibold">
                            {profile.discord_id}
                        </p>
                    </div>
                    <div className="rounded-xl p-6 backdrop-blur-md bg-white/5 border border-white/10 shadow-md hover:shadow-xl transition-all">
                        <p className="text-sm text-gray-400 mb-1">Монеты</p>
                        <p className="text-lg font-semibold">
                            {(Number(profile.coin) || 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfilePage;
