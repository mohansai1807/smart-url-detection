import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Define props and state interfaces for the ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Create the ErrorBoundary component to catch runtime errors in the app
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Replaced the constructor with a class property for state initialization.
  // This is a more modern and concise approach that resolves the type errors
  // related to `state` and `props` not being found on the component instance.
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console for debugging
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI if an error is caught
      return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-4xl font-bold text-danger mb-4">Oops! Something went wrong.</h1>
            <p className="text-lg text-dark-subtext mb-6">
                We've encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="bg-brand-primary text-white font-bold py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary"
            >
                Refresh Page
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);