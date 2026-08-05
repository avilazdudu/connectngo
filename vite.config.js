import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ou o plugin do seu framework
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})