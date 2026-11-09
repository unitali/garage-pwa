import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// versão do package.json (atualizada pelo PR de release) — aparece no Perfil
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // versão nova fica esperando até o usuário tocar em "Atualizar" (src/pwa.ts)
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Unitali Garage',
        short_name: 'Unitali Garage',
        description: 'Controle de manutenções, abastecimentos e despesas dos seus veículos',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#003d9e', // mesma cor da barra do topo
        background_color: '#ffffff', // tela de abertura do app instalado: logo sobre branco
        // ícones gerados por `npm run icons` (scripts/icons.mjs): "any" com os cantos arredondados do desenho;
        // "maskable" com fundo inteiro e o carro menor, para o Android recortar no formato dele.
        // No iPhone vale o apple-touch-icon (index.html), que o próprio iOS arredonda.
        // ?v=blue: força o navegador a buscar os ícones novos (troque o valor sempre que mudar os ícones)
        icons: [
          { src: '/icons/icon-192.png?v=blue', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png?v=blue', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png?v=blue', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // inclui o logo (src/assets/logo.png) e a fonte Inter para aparecerem também offline
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // da Inter só o latim (português); os outros alfabetos ficam fora do cache
        globIgnores: ['**/inter-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        // /__/auth/* é o handler do Firebase Auth (proxy no vercel.json) — o service worker não pode interceptar
        navigateFallbackDenylist: [/^\/__\//],
      },
    }),
  ],
});
