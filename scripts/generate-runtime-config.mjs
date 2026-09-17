import { mkdirSync, writeFileSync } from 'node:fs';

const apiBaseUrl = (process.env.DENTACARE_API_BASE_URL || '').trim().replace(/\/$/, '');
const output = `window.__DENTACARE_CONFIG__ = {\n  apiBaseUrl: ${JSON.stringify(apiBaseUrl)}\n};\n`;

mkdirSync('public', { recursive: true });
writeFileSync('public/runtime-config.js', output, 'utf8');

console.log(
  apiBaseUrl
    ? `DentaCare runtime API configured: ${apiBaseUrl}`
    : 'DentaCare runtime API uses same-origin /api fallback.'
);
