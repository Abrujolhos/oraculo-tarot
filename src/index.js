import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);

// Limpar qualquer service worker antigo preso em cache, depois registar o novo
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Desregistar todos os SW antigos primeiro
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
      // Limpar todas as caches antigas
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Registar o novo
      await navigator.serviceWorker.register('/sw.js');
    } catch (e) { /* ignora */ }
  });
}
