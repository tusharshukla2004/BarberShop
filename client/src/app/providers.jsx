import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from '@/app/store';

/**
 * Global App Providers wrapping Redux, Helmet, and React Router
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}

export default Providers;
