import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, QrCode, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listAssets, listIssues, resetDemoData } from '../lib/store';
import { AssetStatusBadge, Button, IssueStatusBadge, Plate, PriorityBadge, inputClass } from '../components/ui';
import NewAssetModal from '../components/NewAssetModal';
import AnalyticsPanel from '../components/AnalyticsPanel';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Asset, Issue } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'assets' | 'issues' | 'analytics'>('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showNewAsset, setShowNewAsset] = useState(false);

  async function refresh() {
    setLoading(true);
    const [a, i] = await Promise.all([listAssets(), listIssues()]);
    setAssets(a);
    setIssues(i);
    setLoading(false);
  }

  useEffect(() => {
    refresh();

    if (!isSupabaseConfigured) return;

    // Live updates: whenever any user changes an issue or asset (status
    // change, assignment, new report), everyone looking at the dashboard
    // sees it immediately without needing to refresh.
    const channel = supabase
      .channel('dashboard-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      const matchesSearch =
        !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.issue_number.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [issues, search, statusFilter]);

  const openIssues = issues.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length;
  const criticalIssues = issues.filter((i) => i.priority === 'Critical' && !['Resolved', 'Closed'].includes(i.status)).length;
  const operationalPct = assets.length ? Math.round((assets.filter((a) => a.status === 'Operational').length / assets.length) * 100) : 0;

  const assetStatusOptions = ['All', 'Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired'];
  const issueStatusOptions = ['All', 'Reported', 'Assigned', 'Inspection Started', 'Maintenance In Progress', 'Waiting for Parts', 'Resolved', 'Closed', 'Reopened'];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-mist-100">Operations dashboard</h1>
          <p className="mt-1 text-sm text-steel-300">
            Signed in as <span className="text-mist-100">{user?.name}</span> ·{' '}
            <span className="font-mono uppercase text-amber-500">{user?.role}</span>
            {!isSupabaseConfigured && <span className="ml-2 text-steel-500">(demo storage)</span>}
            {isSupabaseConfigured && (
              <span className="ml-2 inline-flex items-center gap-1 text-teal-400">
                <Radio size={12} className="animate-pulse" /> Live
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {!isSupabaseConfigured && (
            <Button variant="ghost" onClick={() => { resetDemoData(); refresh(); }}>
              Reset demo data
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button variant="primary" onClick={() => setShowNewAsset(true)}>
              <Plus size={16} /> Register asset
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total assets" value={assets.length} />
        <SummaryCard label="Open issues" value={openIssues} accent="amber" />
        <SummaryCard label="Critical open" value={criticalIssues} accent="danger" />
        <SummaryCard label="Operational" value={`${operationalPct}%`} accent="teal" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-graphite-700">
        {(['assets', 'issues', 'analytics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setStatusFilter('All'); }}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-amber-500 text-mist-100' : 'border-transparent text-steel-300 hover:text-mist-100'
            }`}
          >
            {t === 'assets' ? `Assets (${assets.length})` : t === 'issues' ? `Issues (${issues.length})` : 'Analytics'}
          </button>
        ))}
      </div>

      {/* Filters */}
      {tab !== 'analytics' && (
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-500" />
          <input
            className={`${inputClass} pl-9`}
            placeholder={tab === 'assets' ? 'Search by name, code, location…' : 'Search by title or issue number…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={`${inputClass} w-auto`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {(tab === 'assets' ? assetStatusOptions : issueStatusOptions).map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
          ))}
        </select>
      </div>
      )}

      {tab === 'analytics' ? (
        <AnalyticsPanel assets={assets} issues={issues} />
      ) : loading ? (
        <p className="text-steel-300">Loading…</p>
      ) : tab === 'assets' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <Link key={asset.id} to={`/assets/${asset.id}`}>
              <Plate className="h-full transition-colors hover:border-amber-500/40">
                <div className="mb-3 flex items-start justify-between">
                  <QrCode size={20} className="text-steel-300" />
                  <AssetStatusBadge status={asset.status} />
                </div>
                <h3 className="font-display text-sm font-semibold text-mist-100">{asset.name}</h3>
                <p className="mt-1 font-mono text-xs text-amber-500">{asset.code}</p>
                <p className="mt-2 text-xs text-steel-300">{asset.location} · {asset.category}</p>
              </Plate>
            </Link>
          ))}
          {filteredAssets.length === 0 && <p className="text-steel-300">No assets match your filters.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const asset = assets.find((a) => a.id === issue.asset_id);
            return (
              <Link key={issue.id} to={`/assets/${issue.asset_id}`}>
                <Plate className="flex flex-wrap items-center justify-between gap-3 !py-4">
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-500">{issue.issue_number}</span>
                      <PriorityBadge priority={issue.priority} />
                    </div>
                    <h3 className="mt-1 font-display text-sm font-semibold text-mist-100">{issue.title}</h3>
                    <p className="mt-0.5 text-xs text-steel-300">{asset?.name ?? 'Unknown asset'} · {issue.category}</p>
                  </div>
                  <IssueStatusBadge status={issue.status} />
                </Plate>
              </Link>
            );
          })}
          {filteredIssues.length === 0 && <p className="text-steel-300">No issues match your filters.</p>}
        </div>
      )}

      {showNewAsset && (
        <NewAssetModal existingAssets={assets} onClose={() => setShowNewAsset(false)} onCreated={() => refresh()} />
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent?: 'amber' | 'teal' | 'danger' }) {
  const color = accent === 'amber' ? 'text-amber-500' : accent === 'teal' ? 'text-teal-400' : accent === 'danger' ? 'text-danger-500' : 'text-mist-100';
  return (
    <Plate>
      <p className="text-xs font-semibold uppercase tracking-wide text-steel-300">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${color}`}>{value}</p>
    </Plate>
  );
}