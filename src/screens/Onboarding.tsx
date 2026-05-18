import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../components/Button';
import { ColorSwatch } from '../components/ColorSwatch';
import { Field } from '../components/Field';
import { LanguagePicker } from '../components/LanguagePicker';
import { Segmented } from '../components/Segmented';
import { TimezonePicker } from '../components/TimezonePicker';
import { updateSettings } from '../db/db';
import type { HourFormat, Language, Settings, ThemeMode } from '../db/types';
import { LanguageContext, translate } from '../lib/i18n';

interface Props {
  initial: Settings;
}

const TARGETS = [13, 14, 16, 18, 20, 24] as const;

export function Onboarding({ initial }: Props) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>(initial.language ?? 'bg');
  const [name, setName] = useState(initial.name);
  const [accent, setAccent] = useState(initial.accentColor);
  const [theme, setTheme] = useState<ThemeMode>(initial.themeMode);
  const [tz, setTz] = useState(initial.timezone);
  const [hourFormat, setHourFormat] = useState<HourFormat>(initial.hourFormat);
  const [target, setTarget] = useState(initial.targetHours);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(language, key, params);

  const stepCount = 6;

  const canAdvance = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step < stepCount - 1) setStep((s) => s + 1);
    else finish();
  };

  const finish = async () => {
    await updateSettings({
      language,
      name: name.trim(),
      accentColor: accent,
      themeMode: theme,
      timezone: tz,
      hourFormat,
      targetHours: target,
      onboarded: true
    });
  };

  return (
    <LanguageContext.Provider value={language}>
      <div className="app-shell accent-ambient flex items-center">
        <div className="w-full max-w-md mx-auto p-5">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-ink-dim">
              {t('onb.step', { current: step + 1, total: stepCount })}
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: stepCount }).map((_, i) => (
                <span
                  key={i}
                  className={
                    'h-1.5 rounded-full transition-all ' +
                    (i === step
                      ? 'w-6 bg-accent'
                      : i < step
                        ? 'w-3 bg-accent/60'
                        : 'w-3 bg-line')
                  }
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface-2 p-6 shadow-sm min-h-[360px] overflow-hidden">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-5"
            >
              {step === 0 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {t('onb.language.title')}
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      {t('onb.language.sub')}
                    </p>
                  </div>
                  <LanguagePicker value={language} onChange={setLanguage} />
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {t('onb.welcome.title')}
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      {t('onb.welcome.sub')}
                    </p>
                  </div>
                  <Field label={t('onb.welcome.nameLabel')}>
                    <input
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('onb.welcome.namePlaceholder')}
                      className="w-full h-12 px-3 rounded-xl border border-line bg-surface"
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {t('onb.theme.title')}
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      {t('onb.theme.sub')}
                    </p>
                  </div>
                  <Field label={t('onb.theme.accentLabel')}>
                    <ColorSwatch value={accent} onChange={setAccent} />
                  </Field>
                  <Field label={t('onb.theme.themeLabel')}>
                    <Segmented
                      id="onb-theme"
                      ariaLabel={t('onb.theme.themeLabel')}
                      value={theme}
                      onChange={(v) => setTheme(v)}
                      options={[
                        { value: 'system', label: t('common.theme.system') },
                        { value: 'light', label: t('common.theme.light') },
                        { value: 'dark', label: t('common.theme.dark') }
                      ]}
                    />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {t('onb.location.title')}
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      {t('onb.location.sub')}
                    </p>
                  </div>
                  <Field label={t('onb.location.label')}>
                    <TimezonePicker value={tz} onChange={setTz} />
                  </Field>
                </>
              )}

              {step === 4 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {t('onb.format.title')}
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      {t('onb.format.sub')}
                    </p>
                  </div>
                  <Field label={t('onb.format.label')}>
                    <Segmented
                      id="onb-hour"
                      ariaLabel={t('onb.format.label')}
                      value={hourFormat}
                      onChange={(v) => setHourFormat(v)}
                      options={[
                        { value: '24h', label: t('common.hour.24h') },
                        { value: '12h', label: t('common.hour.12hLong') }
                      ]}
                    />
                  </Field>
                </>
              )}

              {step === 5 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {t('onb.goal.title')}
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      {t('onb.goal.sub')}
                    </p>
                  </div>
                  <Field label={t('onb.goal.targetLabel')}>
                    <div className="grid grid-cols-3 gap-2">
                      {TARGETS.map((tg) => (
                        <button
                          key={tg}
                          type="button"
                          onClick={() => setTarget(tg)}
                          className={
                            'h-12 rounded-xl border text-sm font-medium transition-colors ' +
                            (target === tg
                              ? 'border-accent text-accent bg-[rgb(var(--accent)/0.08)]'
                              : 'border-line text-ink hover:border-accent/50')
                          }
                        >
                          {tg}
                          {t('common.hourSuffix')}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label={t('onb.goal.customLabel')}>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={target}
                      onChange={(e) =>
                        setTarget(
                          Math.max(1, Math.min(120, Number(e.target.value) || 0))
                        )
                      }
                      className="w-full h-12 px-3 rounded-xl border border-line bg-surface"
                    />
                  </Field>
                </>
              )}
            </motion.div>
          </div>

          <div className="mt-5 flex gap-2">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                full
              >
                {t('onb.back')}
              </Button>
            )}
            <Button onClick={next} disabled={!canAdvance()} full>
              {step === stepCount - 1 ? t('onb.getStarted') : t('onb.continue')}
            </Button>
          </div>
        </div>
      </div>
    </LanguageContext.Provider>
  );
}
