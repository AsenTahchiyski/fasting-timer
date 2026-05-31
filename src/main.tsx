import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ensureSettings, isDatabaseEmpty, restoreFromPayload } from './db/db';
import { readLocalBackup, requestPersistentStorage } from './lib/backup';
import { applyAccent, applyThemeMode } from './theme/ThemeProvider';
import './index.css';

async function bootstrap() {
  // Mark our storage durable so the browser won't evict it under pressure.
  await requestPersistentStorage();

  // If IndexedDB came up empty (wiped/evicted/corrupted) but we have a local
  // mirror, restore it before fresh defaults get created.
  try {
    if (await isDatabaseEmpty()) {
      const backup = readLocalBackup();
      if (backup) await restoreFromPayload(backup);
    }
  } catch {
    // Best effort — fall through to normal bootstrap.
  }

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
