import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import App from './App';
import './index.css';
import './i18n/i18n';

// Remove the incorrect imports and flag settings
// import { UNSAFE_enhanceManualRouteObjects } from 'react-router-dom';
// UNSAFE_enhanceManualRouteObjects.v7_startTransition = true;
// UNSAFE_enhanceManualRouteObjects.v7_relativeSplatPath = true;

// Instead, use a proper way to handle React Router warnings
// These warnings are just informational about future React Router v7 changes
// and don't affect functionality in v6

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeroUIProvider>
        <ToastProvider />
        <App />
      </HeroUIProvider>
    </BrowserRouter>
  </React.StrictMode>,
);