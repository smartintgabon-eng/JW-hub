import React from 'react';
import { createRoot } from 'react-dom/client'; // Fix: Use createRoot for React 18+
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Service Worker update logic
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload(); // Reload the app when a new version is installed
    });
  }
}
