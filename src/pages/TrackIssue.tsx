import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { getIssueByNumber, getAsset } from '../lib/store';
import { Button, Field, inputClass, Plate } from '../components/ui';
import IssueReceipt from '../components/IssueReceipt';
import type { Asset, Issue } from '../types';

export default function TrackIssue() {
  const [searchParams] = useSearchParams();
  const [refInput, setRefInput] = useState(searchParams.get('ref') ?? '');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<{ issue: Issue; asset: Asset } | null>(null);

  async function lookup(ref: string) {
    if (!ref.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    const issue = await getIssueByNumber(ref);
    if (!issue) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const asset = await getAsset(issue.asset_id);
    if (!asset) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setResult({ issue, asset });
    setLoading(false);
  }

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) lookup(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    lookup(refInput);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-1 text-center font-display text-2xl font-semibold text-mist-100">
        Track your issue
      </h1>
      <p className="mb-6 text-center text-sm text-steel-300">
        Enter the reference number from your receipt (e.g. ISS-0007)
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <div className="flex-1">
          <Field label="Reference number">
            <input
              className={inputClass}
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="ISS-0007"
            />
          </Field>
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Track
          </Button>
        </div>
      </form>

      {notFound && (
        <Plate className="text-center text-sm text-steel-300">
          No issue found for that reference number. Double-check it and try again.
        </Plate>
      )}

      {result && <IssueReceipt issue={result.issue} asset={result.asset} />}
    </div>
  );
}
