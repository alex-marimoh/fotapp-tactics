import React from 'react';
import { DEFAULT_SKIN } from '../default-skin';
import { ghostBtn } from './styles';
import { logRouteRenderError } from './routeErrorLog';

/**
 * Full-screen fallback when a routed screen throws during render.
 * @param {{ onReload: () => void, onBackToBoard: () => void }} props
 */
export function RouteErrorFallback({ onReload, onBackToBoard }) {
  const T = DEFAULT_SKIN;
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: T.bg, color: T.text, fontFamily: T.font,
    }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Something went wrong</p>
        <p style={{ fontSize: 13, opacity: 0.65, margin: '0 0 16px' }}>
          This screen ran into an unexpected error. Try reloading or return to the board.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={onReload} style={ghostBtn(T)}>
            Reload page
          </button>
          <button type="button" onClick={onBackToBoard} style={ghostBtn(T)}>
            ← Back to board
          </button>
        </div>
      </div>
    </div>
  );
}

export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logRouteRenderError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleBackToBoard = () => {
    window.location.search = '';
  };

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorFallback
          onReload={this.handleReload}
          onBackToBoard={this.handleBackToBoard}
        />
      );
    }
    return this.props.children;
  }
}
