import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wrench, MapPin, Tag } from 'lucide-react';
import { getAssetByCode, listHistory } from '../lib/store';
import { AssetStatusBadge, Plate } from '../components/ui';
import ReportIssueForm from '../components/ReportIssueForm';
import type { Asset, HistoryEntry } from '../types';

export default function PublicAsset() {
  const { code } = useParams();
  const [asset, setAsset] = useState<Asset | null | undefined>(undefined);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    (async () => {
      if (!code) return;
      const a = await getAssetByCode(code);
      setAsset(a);
      if (a) setHistory((await listHistory(a.id)).slice(0, 5));
    })();
  }, [code]);

  if (asset === undefined) return <div className="mx-auto max-w-lg px-6 py-20 text-center text-steel-300">Loading asset…</div>;

  if (asset === null) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-mist-100">Asset not found</h1>
        <p className="mt-2 text-steel-300">The code "{code}" doesn't match any registered asset.</p>
        <Link to="/" className="mt-6 inline-block text-amber-500">Return home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <div className="mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-steel-500">
        <Wrench size={13} /> Public asset page
      </div>

      <Plate className="mb-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-mist-100">{asset.name}</h1>
            <p className="mt-1 flex items-center gap-1 font-mono text-xs text-amber-500"><Tag size={12} />{asset.code}</p>
          </div>
          <AssetStatusBadge status={asset.status} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-steel-300"><MapPin size={14} /> {asset.location}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-graphite-700 pt-4 text-xs text-steel-300">
          <div><p className="text-steel-500">Category</p><p className="mt-0.5 text-mist-100">{asset.category}</p></div>
          <div><p className="text-steel-500">Condition</p><p className="mt-0.5 text-mist-100">{asset.condition}</p></div>
          <div><p className="text-steel-500">Last service</p><p className="mt-0.5 text-mist-100">{asset.last_service_date ?? '—'}</p></div>
          <div><p className="text-steel-500">Next service</p><p className="mt-0.5 text-mist-100">{asset.next_service_date ?? '—'}</p></div>
        </div>

        {history.length > 0 && (
          <div className="mt-4 border-t border-graphite-700 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-steel-300">Recent activity</p>
            <ul className="space-y-1.5 text-xs text-steel-300">
              {history.map((h) => <li key={h.id}>· {h.action}</li>)}
            </ul>
          </div>
        )}
      </Plate>

      {asset.status === 'Retired' ? (
        <p className="text-center text-sm text-steel-300">This asset is retired and no longer accepts new issue reports.</p>
      ) : (
        <Plate>
          <h2 className="mb-4 font-display text-base font-semibold text-mist-100">Report an issue</h2>
          <ReportIssueForm asset={asset} />
        </Plate>
      )}
    </div>
  );
}
