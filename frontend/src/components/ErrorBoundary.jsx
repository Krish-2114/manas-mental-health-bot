import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("[Manas] Render error captured by ErrorBoundary:", error, info);
  }

  handleReset = () => this.setState({ error: null, info: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ocean-bg">
        <div className="glass-card max-w-2xl w-full p-6 rounded-2xl">
          <h1 className="text-lg font-semibold text-ocean-danger mb-2">
            Something broke while rendering
          </h1>
          <p className="text-sm text-ocean-text-secondary mb-4">
            The screen crashed instead of going blank. Copy the details below.
          </p>
          <pre className="text-xs whitespace-pre-wrap bg-black/40 text-ocean-danger p-3 rounded-lg overflow-auto max-h-64">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          {this.state.info?.componentStack && (
            <pre className="text-xs whitespace-pre-wrap bg-black/30 text-ocean-text-secondary p-3 rounded-lg overflow-auto max-h-64 mt-3">
              {this.state.info.componentStack}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="btn-primary mt-4 !py-2 !px-4 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
