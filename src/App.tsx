import { motion } from 'framer-motion';
import { useState } from 'react';
import { TabBar, type TabId } from './components/TabBar';
import {
  useActiveSession,
  useLastCompletedSession,
  useSessions
} from './hooks/useSessions';
import { useSettings } from './hooks/useSettings';
import { LanguageContext } from './lib/i18n';
import { Onboarding } from './screens/Onboarding';
import { HistoryScreen } from './screens/History';
import { SettingsScreen } from './screens/Settings';
import { TimerScreen } from './screens/Timer';
import { ThemeProvider } from './theme/ThemeProvider';

export function App() {
  const { settings, loading } = useSettings();
  const active = useActiveSession();
  const last = useLastCompletedSession();
  const sessions = useSessions() ?? [];
  const [tab, setTab] = useState<TabId>('timer');

  if (loading || !settings) {
    return <Splash />;
  }

  return (
    <LanguageContext.Provider value={settings.language ?? 'bg'}>
      <ThemeProvider accent={settings.accentColor} mode={settings.themeMode}>
        {!settings.onboarded ? (
          <Onboarding initial={settings} />
        ) : (
          <>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {tab === 'timer' && (
                <TimerScreen
                  settings={settings}
                  active={active ?? undefined}
                  last={last ?? undefined}
                  sessions={sessions}
                />
              )}
              {tab === 'history' && (
                <HistoryScreen sessions={sessions} settings={settings} />
              )}
              {tab === 'settings' && (
                <SettingsScreen sessions={sessions} settings={settings} />
              )}
            </motion.div>
            <TabBar active={tab} onSelect={setTab} />
          </>
        )}
      </ThemeProvider>
    </LanguageContext.Provider>
  );
}

function Splash() {
  return (
    <div className="h-dvh grid place-items-center">
      <div className="h-10 w-10 rounded-full border-2 border-line border-t-accent animate-spin" />
    </div>
  );
}
