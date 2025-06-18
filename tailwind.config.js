/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            backdropBlur: {
                xs: '2px',
            },

            colors: {
                discord: {
                    DEFAULT: '#5865F2', // Основной оттенок
                    light: '#7983F5', // Светлый оттенок (опционально)
                    dark: '#434DBA', // Тёмный оттенок (опционально)
                },
            },

            animation: {
                'fade-in': 'fadeIn 0.4s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: 0, transform: 'scale(0.95)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
};
