import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { listAssets } from '../lib/store';
import { Plate, inputClass } from '../components/ui';
import ReportIssueForm from '../components/ReportIssueForm';
import type { Asset } from '../types';

export default function ReportIssue() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Asset | null>(null);

  useEffect(() => {
    listAssets().then(setAssets);
  }, []);

  const filtered = assets.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-mist-100">Report an issue</h1>
      <p className="mt-1.5 text-sm text-steel-300">
        Usually you'd scan an asset's QR tag directly. Search for one here if you don't have the tag handy.
      </p>

      {!selected ? (
        <div className="mt-6">
          <div className="relative mb-4">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-500" />
            <input className={`${inputClass} pl-9`} placeholder="Search asset by name, code, or location…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filtered.map((a) => (
              <button key={a.id} onClick={() => setSelected(a)} className="w-full text-left">
                <Plate className="!py-3 hover:border-amber-500/40">
                  <p className="font-display text-sm font-semibold text-mist-100">{a.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-amber-500">{a.code} · {a.location}</p>
                </Plate>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-sm text-steel-300">No matching assets.</p>}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <button onClick={() => setSelected(null)} className="mb-4 text-sm text-steel-300 hover:text-mist-100">← Choose a different asset</button>
          <Plate>
            <p className="mb-4 text-sm text-steel-300">
              Reporting for <span className="text-mist-100">{selected.name}</span>{' '}
              <span className="font-mono text-amber-500">({selected.code})</span>
            </p>
            <ReportIssueForm asset={selected} />
          </Plate>
        </div>
      )}
    </div>
  );
}
