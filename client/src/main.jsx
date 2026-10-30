import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from '@/app/providers';
import App from '@/App';
import '@/styles/globals.css';

/**
 * Initialize mock service worker in development mode
 */
async function enableMocking() {
  if (import.meta.env.DEV) {
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
