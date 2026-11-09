// Gera o logo (src/assets/logo.png) e os ícones PNG do PWA.
// Uso: npm run icons   (precisa do rsvg-convert: `brew install librsvg`)
//
// O desenho (carro de frente + chave de boca, em branco) está em scripts/icon-glyph.png, recortado do
// ícone original de 1254px. Aqui ele é posto sobre o fundo azul da marca (#0168FA) em cada formato.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const glyph = `data:image/png;base64,${readFileSync(new URL('./icon-glyph.png', import.meta.url)).toString('base64')}`;

/**
 * O desenho na mesma posição do ícone original (x 250, y 365, 811×522 de 1254px), em coordenadas de 512.
 * `scale` encolhe em torno do centro (ícone maskable, que o Android recorta em círculo).
 */
const k = 512 / 1254;
const glyphImage = `<image href="${glyph}" x="${250 * k}" y="${365 * k}" width="${811 * k}" height="${522 * k}"/>`;

function art(scale = 1) {
  const t = scale === 1 ? '' : ` transform="translate(${256 * (1 - scale)} ${256 * (1 - scale)}) scale(${scale})"`;
  return `<g${t}>${glyphImage}</g>`;
}

// azul da marca em cima, um pouco mais escuro embaixo (como no ícone original)
const defs = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0168fa"/><stop offset="1" stop-color="#0050d9"/></linearGradient></defs>`;

/** cantos arredondados (fora deles, transparente): favicon, logo e ícone "any" */
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<rect width="512" height="512" rx="112" fill="url(#bg)"/>${art()}</svg>`;
/** quadrado inteiro: o sistema recorta (iOS arredonda; Android aplica a máscara) */
const square = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<rect width="512" height="512" fill="url(#bg)"/>${art(scale)}</svg>`;
const tmp = new URL('../node_modules/.icons/', import.meta.url);
mkdirSync(tmp, { recursive: true });
mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });

const sources = { rounded, apple: square(1), maskable: square(0.86) };
for (const [name, svg] of Object.entries(sources)) writeFileSync(new URL(`${name}.svg`, tmp), svg);

const out = [
  // logo do app (cabeçalho e login): até 96px na tela, ×3 para telas de alta densidade
  ['rounded', 288, 'src/assets/logo.png'],  ['rounded', 64, 'public/favicon.png'],
  ['rounded', 192, 'public/icons/icon-192.png'],
  ['rounded', 512, 'public/icons/icon-512.png'],
  ['maskable', 512, 'public/icons/maskable-512.png'],
  ['apple', 180, 'public/icons/apple-touch-icon.png'],
];
for (const [src, size, file] of out) {
  execFileSync('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', new URL(`../${file}`, import.meta.url).pathname, new URL(`${src}.svg`, tmp).pathname]);
  console.log(`${file} (${size}px)`);
}
