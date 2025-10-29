import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App/App';

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

// Only use StrictMode in development
const isDevelopment = process.env.NODE_ENV === 'development';

root.render(
  isDevelopment ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);