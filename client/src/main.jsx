import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { DbConnection } from './module_bindings/index.js';
import { SpacetimeDBProvider } from 'spacetimedb/react';
import { DEV_MODE, STDB_URI, STDB_DB_NAME } from './config.js';

if (DEV_MODE) {
  // Skip SpacetimeDB entirely — render App directly
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // ── LIVE MODE ──────────────────────────────
  const connectionBuilder = DbConnection.builder()
    .withUri(STDB_URI)
    .withDatabaseName(STDB_DB_NAME)
    .withLightMode(true)
    .onDisconnect(() => console.log('disconnected'))
    .onConnectError(() => console.log('connection error'))
    .onConnect((conn, identity, token) => {
      console.log('Connected:', identity.toHexString());
      conn.subscriptionBuilder()
        .onApplied(() => console.log('subscriptions ready'))
        .subscribeToAllTables();
    });

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
        <App />
      </SpacetimeDBProvider>
    </React.StrictMode>
  );
}
