// Gera o logo (src/assets/logo.svg) e os ícones PNG do PWA a partir do desenho abaixo.
// Uso: npm run icons   (precisa do rsvg-convert: `brew install librsvg`)
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

/**
 * Carro branco de frente, com a chave de boca na grade e os faróis verde e vermelho (cores da Unitali),
 * no fundo laranja. `scale` encolhe o desenho (ícone maskable).
 */
function art(scale = 1) {
  const t = scale === 1 ? '' : ` transform="translate(${256 * (1 - scale)} ${256 * (1 - scale)}) scale(${scale})"`;
  return `
  <g${t}>
    <rect x="112" y="340" width="68" height="74" rx="20" fill="#7c2d12"/>
    <rect x="332" y="340" width="68" height="74" rx="20" fill="#7c2d12"/>
    <rect x="62" y="206" width="64" height="34" rx="14" fill="#ffffff"/>
    <rect x="386" y="206" width="64" height="34" rx="14" fill="#ffffff"/>
    <path d="M172 116 H340 Q368 116 378 142 L412 236 H100 L134 142 Q144 116 172 116 Z" fill="#ffffff"/>
    <path d="M184 144 H328 Q342 144 347 157 L370 222 H142 L165 157 Q170 144 184 144 Z" fill="#ffedd5"/>
    <rect x="80" y="218" width="352" height="154" rx="48" fill="#ffffff"/>
    <rect x="108" y="254" width="84" height="38" rx="19" fill="#009247"/>
    <rect x="320" y="254" width="84" height="38" rx="19" fill="#cf2b36"/>
    <rect x="188" y="298" width="136" height="54" rx="18" fill="#c2410c"/>
    <g transform="rotate(-30 256 325)">
      <rect x="212" y="318" width="64" height="14" rx="7" fill="#ffffff"/>
      <circle cx="282" cy="325" r="18" fill="#ffffff"/>
      <rect x="284" y="318" width="20" height="14" fill="#c2410c"/>
    </g>
  </g>`;
}

const defs = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#c2410c"/></linearGradient></defs>`;

/** cantos arredondados (fora deles, transparente): favicon, logo e ícone "any" */
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<rect width="512" height="512" rx="112" fill="url(#bg)"/>${art()}</svg>`;
/** quadrado inteiro: o sistema recorta (iOS arredonda; Android aplica a máscara) */
const square = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<rect width="512" height="512" fill="url(#bg)"/>${art(scale)}</svg>`;

const tmp = new URL('../node_modules/.icons/', import.meta.url);
mkdirSync(tmp, { recursive: true });
mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/assets/logo.svg', import.meta.url), rounded);

const sources = { rounded, apple: square(0.9), maskable: square(0.78) };
for (const [name, svg] of Object.entries(sources)) writeFileSync(new URL(`${name}.svg`, tmp), svg);

const out = [
  ['rounded', 64, 'public/favicon.png'],
  ['rounded', 192, 'public/icons/icon-192.png'],
  ['rounded', 512, 'public/icons/icon-512.png'],
  ['maskable', 512, 'public/icons/maskable-512.png'],
  ['apple', 180, 'public/icons/apple-touch-icon.png'],
];
for (const [src, size, file] of out) {
  execFileSync('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', new URL(`../${file}`, import.meta.url).pathname, new URL(`${src}.svg`, tmp).pathname]);
  console.log(`${file} (${size}px)`);
}
