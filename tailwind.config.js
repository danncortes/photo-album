import daisyui from 'daisyui';

export default {
    content: ['./src/**/*.{html,ts}', './src/**/*.css'],
    theme: {
        extend: {},
    },
    plugins: [daisyui],
    daisyui: {
        themes: ['light'], // Ensure 'light' theme is specified
    },
};
