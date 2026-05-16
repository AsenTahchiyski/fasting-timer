import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { epochToLocalInput, localInputToEpoch } from '../lib/time';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (ms: number) => void;
  title: string;
  initial: number;
  timezone: string;
  /** optional bounds for validation (inclusive on min, exclusive on max). */
  min?: number;
  max?: number;
}

export function TimeEditModal({
  open,
  onClose,
  onSave,
  title,
  initial,
  timezone,
  min,
  max
}: Props) {
  const [value, setValue] = useState(epochToLocalInput(initial, timezone));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(epochToLocalInput(initial, timezone));
      setError(null);
    }
  }, [open, initial, timezone]);

  const handleSave = () => {
    const ms = localInputToEpoch(value, timezone);
    if (Number.isNaN(ms)) {
      setError('Invalid date');
      return;
    }
    if (min !== undefined && ms < min) {
      setError('Time must be after the previous boundary.');
      return;
    }
    if (max !== undefined && ms > max) {
      setError('Time cannot be in the future.');
      return;
    }
    onSave(ms);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="grid gap-3">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          className="w-full h-12 px-3 rounded-xl border border-line bg-surface text-ink"
        />
        {error && (
          <p className="text-sm text-[rgb(255,107,107)]">{error}</p>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
