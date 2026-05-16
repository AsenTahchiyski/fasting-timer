import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../components/Button';
import { ColorSwatch } from '../components/ColorSwatch';
import { Field } from '../components/Field';
import { Segmented } from '../components/Segmented';
import { TimezonePicker } from '../components/TimezonePicker';
import { updateSettings } from '../db/db';
import type { HourFormat, Settings, ThemeMode } from '../db/types';

interface Props {
  initial: Settings;
}

const TARGETS = [13, 14, 16, 18, 20, 24] as const;

export function Onboarding({ initial }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial.name);
  const [accent, setAccent] = useState(initial.accentColor);
  const [theme, setTheme] = useState<ThemeMode>(initial.themeMode);
  const [tz, setTz] = useState(initial.timezone);
  const [hourFormat, setHourFormat] = useState<HourFormat>(initial.hourFormat);
  const [target, setTarget] = useState(initial.targetHours);

  const steps = [
    'Welcome',
    'Theme',
    'Location',
    'Format',
    'Goal'
  ];

  const canAdvance = () => {
    if (step === 0) return name.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else finish();
  };

  const finish = async () => {
    await updateSettings({
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
    <div className="app-shell accent-ambient flex items-center">
      <div className="w-full max-w-md mx-auto p-5">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-ink-dim">
            Step {step + 1} of {steps.length}
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
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
                      Hi there 👋
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      Let’s get a quick setup so the app feels like yours.
                    </p>
                  </div>
                  <Field label="What should we call you?">
                    <input
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-12 px-3 rounded-xl border border-line bg-surface"
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Pick a vibe
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      Choose an accent color and how light or dark you like it.
                    </p>
                  </div>
                  <Field label="Accent color">
                    <ColorSwatch value={accent} onChange={setAccent} />
                  </Field>
                  <Field label="Theme">
                    <Segmented
                      id="onb-theme"
                      ariaLabel="Theme"
                      value={theme}
                      onChange={(v) => setTheme(v)}
                      options={[
                        { value: 'system', label: 'System' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' }
                      ]}
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Where are you?
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      We use this to show times correctly. We pre-filled your
                      current zone.
                    </p>
                  </div>
                  <Field label="Timezone">
                    <TimezonePicker value={tz} onChange={setTz} />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Time format
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      How would you like times to be shown?
                    </p>
                  </div>
                  <Field label="Hour format">
                    <Segmented
                      id="onb-hour"
                      ariaLabel="Hour format"
                      value={hourFormat}
                      onChange={(v) => setHourFormat(v)}
                      options={[
                        { value: '24h', label: '24-hour' },
                        { value: '12h', label: '12-hour (AM/PM)' }
                      ]}
                    />
                  </Field>
                </>
              )}

              {step === 4 && (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Pick a goal
                    </h1>
                    <p className="mt-1 text-sm text-ink-dim">
                      A daily fasting target. You can change this anytime.
                    </p>
                  </div>
                  <Field label="Target">
                    <div className="grid grid-cols-3 gap-2">
                      {TARGETS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTarget(t)}
                          className={
                            'h-12 rounded-xl border text-sm font-medium transition-colors ' +
                            (target === t
                              ? 'border-accent text-accent bg-[rgb(var(--accent)/0.08)]'
                              : 'border-line text-ink hover:border-accent/50')
                          }
                        >
                          {t}h
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Or custom (hours)">
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
              Back
            </Button>
          )}
          <Button onClick={next} disabled={!canAdvance()} full>
            {step === steps.length - 1 ? 'Get started' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
