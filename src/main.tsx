import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully catch and suppress external reCAPTCHA script timeout errors
window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  const file = event?.filename || '';
  if (msg.includes('reCAPTCHA') || msg.includes('recaptcha') || file.includes('recaptcha')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn('Caught and prevented unhandled reCAPTCHA script error:', msg);
    return true;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event?.reason;
  const reasonMsg = reason?.message || String(reason || '');
  if (reasonMsg.includes('reCAPTCHA') || reasonMsg.includes('recaptcha')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn('Caught and prevented unhandled reCAPTCHA rejection:', reasonMsg);
  }
});

createRoot(document.getElementById('root')!).render(<App />);
