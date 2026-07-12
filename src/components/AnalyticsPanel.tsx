import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { listAllMaintenanceRecords } from '../lib/store';
import { Plate } from './ui';
import type { Asset, Issue, MaintenanceRecord } from '../types';

const COLORS = {
  amber: '#F2A93B',
  teal: '#35B0A7',
  danger: '#E15252',
  grid: '#2A323A',
  axis: '#8B99A6',
};

const tooltipStyle = {
  background: '#1D2329',
  border: '1px solid #2A323A',
  borderRadius: 8,
  color: '#EDEFF1',
  fontSize: 12,
};

export default function AnalyticsPanel({ assets, issues }: { assets: Asset[]; issues: Issue[] }) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllMaintenanceRecords()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const recurringIssues = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of issues) {
      counts.set(issue.asset_id, (counts.get(issue.asset_id) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([assetId, count]) => {
        const asset = assets.find((a) => a.id === assetId);
        return { name: asset ? asset.name : 'Unknown asset', count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [assets, issues]);

  const costTrend = useMemo(() => {
    const totals = new Map<string, number>();
    for (const record of records) {
      const month = record.created_at.slice(0, 7); // YYYY-MM
      totals.set(month, (totals.get(month) ?? 0) + Number(record.cost));
    }
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }));
  }, [records]);

  const technicianWorkload = useMemo(() => {
    const counts = new Map<string, { assigned: number; resolved: number }>();
    for (const issue of issues) {
      const tech = issue.assigned_technician;
      if (!tech) continue;
      const entry = counts.get(tech) ?? { assigned: 0, resolved: 0 };
      entry.assigned += 1;
      if (issue.status === 'Resolved' || issue.status === 'Closed') entry.resolved += 1;
      counts.set(tech, entry);
    }
    return Array.from(counts.entries())
      .map(([name, { assigned, resolved }]) => ({ name, assigned, resolved }))
      .sort((a, b) => b.assigned - a.assigned);
  }, [issues]);

  const totalCost = useMemo(
    () => records.reduce((sum, r) => sum + Number(r.cost), 0),
    [records]
  );

  const avgResolutionCount = records.filter((r) => r.time_spent_minutes > 0).length
    ? Math.round(
        records.reduce((sum, r) => sum + (r.time_spent_minutes || 0), 0) /
          records.filter((r) => r.time_spent_minutes > 0).length
      )
    : 0;

  if (loading) {
    return <p className="text-steel-300">Loading analytics…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Plate>
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-300">Total maintenance cost</p>
          <p className="mt-2 font-display text-3xl font-semibold text-amber-500">
            {totalCost.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </p>
        </Plate>
        <Plate>
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-300">Avg. time per job</p>
          <p className="mt-2 font-display text-3xl font-semibold text-teal-400">
            {avgResolutionCount} min
          </p>
        </Plate>
        <Plate>
          <p className="text-xs font-semibold uppercase tracking-wide text-steel-300">Most problematic asset</p>
          <p className="mt-2 font-display text-xl font-semibold text-danger-500">
            {recurringIssues[0]?.name ?? '—'}
          </p>
          {recurringIssues[0] && (
            <p className="mt-1 text-xs text-steel-300">{recurringIssues[0].count} issues reported</p>
          )}
        </Plate>
      </div>

      <Plate>
        <h3 className="mb-4 font-display text-sm font-semibold text-mist-100">
          Recurring issues by asset
        </h3>
        {recurringIssues.length === 0 ? (
          <p className="text-sm text-steel-300">No issues reported yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={recurringIssues} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid stroke={COLORS.grid} horizontal={false} />
              <XAxis type="number" stroke={COLORS.axis} fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke={COLORS.axis} fontSize={12} width={140} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(242,169,59,0.08)' }} />
              <Bar dataKey="count" fill={COLORS.amber} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Plate>

      <Plate>
        <h3 className="mb-4 font-display text-sm font-semibold text-mist-100">
          Maintenance cost trend
        </h3>
        {costTrend.length === 0 ? (
          <p className="text-sm text-steel-300">No maintenance records yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={costTrend}>
              <defs>
                <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="month" stroke={COLORS.axis} fontSize={12} />
              <YAxis stroke={COLORS.axis} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, 'Cost']} />
              <Area type="monotone" dataKey="total" stroke={COLORS.teal} fill="url(#costFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Plate>

      <Plate>
        <h3 className="mb-4 font-display text-sm font-semibold text-mist-100">
          Technician workload
        </h3>
        {technicianWorkload.length === 0 ? (
          <p className="text-sm text-steel-300">No issues assigned yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={technicianWorkload}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="name" stroke={COLORS.axis} fontSize={12} />
              <YAxis stroke={COLORS.axis} fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="assigned" name="Assigned" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Plate>
    </div>
  );
}