declare global {
  interface Window {
    __DENTACARE_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : 'localhost';
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
const runtimeApiBaseUrl = isBrowser ? window.__DENTACARE_CONFIG__?.apiBaseUrl?.trim() : '';
const productionApiBaseUrl = 'https://dentacare-api-c8mz.onrender.com/api';
const fallbackApiBaseUrl = isLocal ? 'http://localhost:3000/api' : productionApiBaseUrl;

export const environment = {
  production: !isLocal,
  apiBaseUrl: (runtimeApiBaseUrl || fallbackApiBaseUrl).replace(/\/$/, '')
};
