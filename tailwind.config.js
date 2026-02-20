/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#ffbd59",
                "gold": "#ffbd59",
                "pink": "#ff9fb2",
                "wine-light": "#3d1425",
                "wine-muted": "#492222",
                "gold-soft": "#cb9090",
                "background-light": "#f8f8f5",
                "background-dark": "#2a0a18",
            },
            fontFamily: {
                "display": ["Manrope", "Inter", "sans-serif"],
                "handwriting": ["Caveat", "cursive"]
            },
            borderRadius: {
                "lg": "1rem",
                "xl": "1.5rem",
            },
        },
    },
    plugins: [],
}
