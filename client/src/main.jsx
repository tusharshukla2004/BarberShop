import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from '@/app/providers';
import App from '@/App';
import '@/styles/globals.css';

/**
 * Initialize mock service worker in development mode or when VITE_USE_MOCKS=true
 */
async function enableMocking() {
  const useMocks =
    import.meta.env.VITE_USE_MOCKS === 'true' ||
    (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false');

  if (useMocks) {
    const { worker } = await import('@/mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

enableMocking().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>
  );
});
