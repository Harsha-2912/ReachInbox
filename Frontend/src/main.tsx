import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          borderRadius: '12px',
          border: '1px solid #EAEAEA',
          background: '#FFFFFF',
          color: '#171717',
          fontSize: '13px',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.04)',
        },
      }}
    />
  </StrictMode>
);
