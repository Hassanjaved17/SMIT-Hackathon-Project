import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button, Field, inputClass } from './ui';
import { createAsset, generateAssetCode } from '../lib/store';
import type { Asset } from '../types';

const CATEGORIES = ['Electronics', 'HVAC', 'Safety', 'Mechanical', 'Plumbing', 'Furniture', 'IT Equipment', 'Other'];

export default function NewAssetModal({
  existingAssets,
  onClose,
  onCreated,
}: {
  existingAssets: Asset[];
  onClose: () => void;
  onCreated: (asset: Asset) => void;
}) {
  const [code, setCode] = useState(generateAssetCode(existingAssets));
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('Good');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const asset = await createAsset({
        code: code.trim(),
        name: name.trim(),
        category,
        location: location.trim(),
        condition,
        last_service_date: null,
        next_service_date: null,
        assigned_technician: null,
      });
      onCreated(asset);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/80 px-4">
      <div className="plate w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-mist-100">Register asset</h2>
          <button onClick={onClose} className="text-steel-300 hover:text-mist-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Asset code (unique)">
            <input className={`${inputClass} font-mono`} value={code} onChange={(e) => setCode(e.target.value)} required />
          </Field>
          <Field label="Asset name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Classroom Projector 01" required />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 204, Block B" required />
          </Field>
          <Field label="Condition">
            <select className={inputClass} value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </Field>
          {error && <p className="text-sm text-danger-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : 'Register asset'}
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
