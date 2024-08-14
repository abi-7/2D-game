import { defineConfig } from 'vite';

export default defineConfig({
    base: "./",
    //bug with how kaboom is made that if default is used code doesn't work
    //output will no longer work 
    build: {
        minify: "terser",
    },
})