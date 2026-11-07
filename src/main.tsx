import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { ConnectionErrorModal } from './components/common/ConnectionErrorModal';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ConnectionErrorModal />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
