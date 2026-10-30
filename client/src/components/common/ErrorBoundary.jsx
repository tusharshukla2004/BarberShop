import { Component } from 'react';
import { Button, Container } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Global Error Boundary component catching unhandled render errors
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log unexpected runtime crashes safely
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center bg-white p-6">
          <Container className="max-w-md text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-pill bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-ink uppercase tracking-wide">
              Something went wrong
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2 mb-6 leading-relaxed">
              An unexpected display error occurred while rendering this view. Please refresh the
              page to continue.
            </p>
            <Button
              variant="primary"
              size="md"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={this.handleReload}
            >
              Refresh Page
            </Button>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
