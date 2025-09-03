/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                vgbf: {
                    blue: '#003366',
                    gold: '#FFD700',
                    green: '#006633',
                },
            },
        },
    },
    plugins: [],
}
