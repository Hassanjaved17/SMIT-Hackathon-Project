import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button, Field, inputClass } from './ui';
import { updateAsset } from '../lib/store';
import type { Asset } from '../types';

const CATEGORIES = ['Electronics', 'HVAC', 'Safety', 'Mechanical', 'Plumbing', 'Furniture', 'IT Equipment', 'Other'];

export default function EditAssetModal({
  asset,
  onClose,
  onUpdated,
}: {
  asset: Asset;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(asset.name);
  const [category, setCategory] = useState(asset.category);
  const [location, setLocation] = useState(asset.location);
  const [condition, setCondition] = useState(asset.condition);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateAsset(asset.id, {
        name: name.trim(),
        category,
        location: location.trim(),
        condition,
      });
      onUpdated();
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
          <h2 className="font-display text-lg font-semibold text-mist-100">Edit asset</h2>
          <button onClick={onClose} className="text-steel-300 hover:text-mist-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Asset code">
            <input className={`${inputClass} font-mono`} value={asset.code} disabled />
            <p className="mt-1 text-xs text-steel-500">Code cannot be changed</p>
          </Field>
          <Field label="Asset name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} required />
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
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
