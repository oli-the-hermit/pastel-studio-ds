import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@pastel-studio/react/styles.css';
import './styles/docs.css';
import { DocsThemeProvider } from './theme';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <DocsThemeProvider>
        <App />
      </DocsThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
