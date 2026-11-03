import React from 'react';
import ReactDOM from 'react-dom/client';
import '@pastel-studio/react/styles.css';
import './styles/canvas.css';
import { App } from './App';
import { flush } from './model/store';

// Unsaved changes are written before the window goes away.
window.addEventListener('beforeunload', () => void flush());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
