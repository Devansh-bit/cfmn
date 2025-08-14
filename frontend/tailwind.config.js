/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    background: '#121212',
                    surface: '#1E1E1E',
                    primary: '#BB86FC',
                    secondary: '#03DAC6',
                    text: '#E0E0E0',
                    'text-secondary': '#A0A0A0',
                },
            },
        },
    },
    plugins: [],
}