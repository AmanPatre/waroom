import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { DbConnection } from './module_bindings/index';
import { SpacetimeDBProvider } from 'spacetimedb/react';

// ─────────────────────────────────────────────
// DEV_MODE is mirrored here only to decide whether
// to wrap with SpacetimeDBProvider.
// The canonical DEV_MODE lives in App.jsx.
// ─────────────────────────────────────────────
const DEV_MODE = false;

if (DEV_MODE) {
  // Skip SpacetimeDB entirely — render App directly
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // ── LIVE MODE ──────────────────────────────
  // Uncomment after running: spacetime generate --lang typescript --out-dir src/module_bindings
  
  // ── LIVE MODE ──────────────────────────────
  // Uncomment after running: spacetime generate --lang typescript --out-dir src/module_bindings
  
  
  const stdbUri = import.meta.env.VITE_STDB_URI || 'ws://localhost:3000';
  const stdbDbName = import.meta.env.VITE_STDB_DB_NAME || 'warroom';

  const connectionBuilder = DbConnection.builder()
    .withUri(stdbUri)
    .withDatabaseName(stdbDbName)
    .withLightMode(true)
    .onDisconnect(() => console.log('disconnected'))
    .onConnectError(() => console.log('connection error'))
    .onConnect((conn, identity, token) => {
      console.log('Connected:', identity.toHexString());
      conn.subscriptionBuilder()
        .onApplied(() => console.log('subscriptions ready'))
        .subscribeToAllTables();
    });
  
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color:'white', background:'black', padding: '2rem', fontFamily: 'monospace' }}>
        <h2>Dashboard Crashed!</h2>
        <pre style={{color:'red'}}>{this.state.error && this.state.error.toString()}</pre>
        <pre>{this.state.error && this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SpacetimeDBProvider>
    </React.StrictMode>
  );

  console.warn('Set DEV_MODE = false and uncomment the LIVE MODE block in main.jsx');
}
