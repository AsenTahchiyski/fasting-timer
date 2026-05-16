import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ensureSettings } from './db/db';
import { applyAccent, applyThemeMode } from './theme/ThemeProvider';
import './index.css';

async function bootstrap() {
  const settings = await ensureSettings();
  // Apply theme synchronously to avoid a flash on first paint.
  applyAccent(settings.accentColor);
  applyThemeMode(settings.themeMode);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
