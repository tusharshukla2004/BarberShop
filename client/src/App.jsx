import { AppRouter } from '@/app/router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

/**
 * Root Application Component
 * Protected by global ErrorBoundary
 * @returns {JSX.Element}
 */
export function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
