import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAnalytics, analytics } from './services/analytics';

// Initialize analytics
initAnalytics();

// Track app launch — version will be set from App.tsx once available
analytics.track('app_launched');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message);
});
