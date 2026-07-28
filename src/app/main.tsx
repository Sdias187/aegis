import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { env } from '@/config';
import { logger } from '@/logging';
import '@/styles/globals.css';

async function bootstrap() {
  // Inicializar MSW em desenvolvimento
  if (env.isMockEnabled) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
    });
    logger.info('[MSW] Mock Service Worker initialized');
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const { App } = await import('./App');

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap().catch((error) => {
  // Fallback: se o logger falhar, ainda exibir no console
  console.error('[AEGIS] Bootstrap error:', error);
  try {
    logger.error('Failed to bootstrap application', error as Error);
  } catch {
    // Silencioso
  }
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0D1117;color:#F85149;font-family:sans-serif;">
      <div style="text-align:center;">
        <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Erro ao iniciar aplicação</h1>
        <p style="color:#8B949E;">Verifique o console para mais detalhes</p>
        <pre style="margin-top:1rem;padding:1rem;background:#161B22;border-radius:8px;text-align:left;max-width:600px;overflow:auto;font-size:0.75rem;color:#E6EDF3;">${(error as Error).message}\n${(error as Error).stack || ''}</pre>
      </div>
    </div>
  `;
  }
});
