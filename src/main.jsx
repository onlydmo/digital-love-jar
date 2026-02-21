import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext'; // Import Toast
import './index.css'
import App from './App.jsx'

// Global safety net: Prevent WebSocket errors from crashing the app
window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || String(event?.reason) || '';
  if (msg.includes('WebSocket') || msg.includes('insecure') || msg.includes('realtime')) {
    console.warn('[Global] Suppressed unhandled WebSocket rejection:', msg);
    event.preventDefault(); // Prevent it from crashing the ErrorBoundary
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
