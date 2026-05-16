interface Props {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: Props) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs uppercase tracking-[0.14em] text-ink-dim font-medium">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-dim">{hint}</span>}
    </label>
  );
}
