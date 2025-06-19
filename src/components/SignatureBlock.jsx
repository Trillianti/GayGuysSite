import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const roleConfig = {
    1: { label: '👑 Мега гей', color: '#9B59B6', ring: 'ring-purple-500' },
    2: { label: '🔴 Сенаторы', color: '#EF4444', ring: 'ring-red-500' },
    3: { label: '🟢 Модераторы', color: '#10B981', ring: 'ring-emerald-500' },
    4: { label: '🔵 Натуральные геи', color: '#3B82F6', ring: 'ring-blue-500' },
};

const SignatureBlock = () => {
    const [usersByRole, setUsersByRole] = useState({});

    useEffect(() => {
        const fetchSignatureBlock = async () => {
            try {
                const response = await axios.get('/api/users');
                const users = response.data;

                const grouped = users.reduce((acc, user) => {
                    if (!user.role) return acc;
                    if (!acc[user.role]) acc[user.role] = [];
                    acc[user.role].push(user);
                    return acc;
                }, {});
                setUsersByRole(grouped);
            } catch (err) {
                console.error('Ошибка сервера:', err);
            }
        };

        fetchSignatureBlock();
    }, []);

    return (
        <section className="flex flex-col items-center text-white py-20 px-4">
            <h1 className="text-4xl font-bold text-center mb-14 backdrop-blur-sm bg-white/5 px-6 py-3 rounded-xl shadow-md border border-white/10">
                🌈 Наш коллектив
            </h1>

            {Object.keys(usersByRole).map((roleKey) => {
                const role = roleConfig[roleKey] || {
                    label: 'Участники',
                    color: '#6B7280',
                    ring: 'ring-gray-500',
                };
                const users = usersByRole[roleKey];

                return (
                    <div key={roleKey} className="mb-16 w-full">
                        <h3
                            className="text-2xl font-semibold text-center mb-8"
                            style={{ color: role.color }}
                        >
                            {role.label}
                        </h3>

                        <div className="flex flex-wrap justify-center gap-8">
                            {users.map((user) => (
                                <Link
                                    to={`/u/${user.discord_id}`}
                                    key={user.discord_id}
                                    className="relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-64 shadow-lg hover:shadow-2xl transition-transform hover:-translate-y-2 duration-300 group overflow-hidden"
                                >
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`ring-4 ${role.ring} rounded-full mb-3`}
                                        >
                                            <img
                                                src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`}
                                                alt={user.global_name}
                                                className="w-16 h-16 rounded-full object-cover shadow-md"
                                            />
                                        </div>
                                        <p className="text-white font-semibold text-lg text-center mb-1">
                                            {user.global_name}
                                        </p>
                                        <p className="italic text-sm text-gray-300 text-center break-words">
                                            {user.quote || 'Без цитаты'}
                                        </p>
                                    </div>

                                    {/* Световой эффект в фоне */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}
        </section>
    );
};

export default SignatureBlock;
