export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
export const STDB_URI = import.meta.env.VITE_STDB_URI || 'ws://localhost:3000';
export const STDB_DB_NAME = import.meta.env.VITE_STDB_DB_NAME || 'warroom';
