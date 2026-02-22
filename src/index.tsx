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

  // Service Worker registration and update logic
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker enregistré avec succès:', reg))
        .catch(err => console.log('Erreur d\'enregistrement du Service Worker:', err));
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload(); // Reload the app when a new version is installed
    });
  }
}
