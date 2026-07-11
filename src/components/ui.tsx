import type { ReactNode } from 'react';
import type { AssetStatus, IssueStatus, Priority } from '../types';

export function Plate({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`plate p-5 ${className}`}>{children}</div>;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-amber-500 text-graphite-950 hover:bg-amber-600',
    secondary: 'bg-graphite-700 text-mist-100 hover:bg-graphite-600 border border-graphite-600',
    ghost: 'text-mist-200 hover:text-mist-100 hover:bg-graphite-800',
    danger: 'bg-danger-500 text-white hover:opacity-90',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

const ASSET_STATUS_STYLES: Record<AssetStatus, string> = {
  Operational: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  'Issue Reported': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'Under Inspection': 'bg-steel-300/15 text-steel-300 border-steel-500/30',
  'Under Maintenance': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'Out of Service': 'bg-danger-500/15 text-danger-500 border-danger-500/30',
  Retired: 'bg-graphite-700 text-steel-300 border-graphite-600',
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-mono font-medium ${ASSET_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

const ISSUE_STATUS_STYLES: Record<IssueStatus, string> = {
  Reported: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  Assigned: 'bg-steel-300/15 text-steel-300 border-steel-500/30',
  'Inspection Started': 'bg-steel-300/15 text-steel-300 border-steel-500/30',
  'Maintenance In Progress': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'Waiting for Parts': 'bg-graphite-700 text-mist-200 border-graphite-600',
  Resolved: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Closed: 'bg-graphite-700 text-steel-300 border-graphite-600',
  Reopened: 'bg-danger-500/15 text-danger-500 border-danger-500/30',
};

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-mono font-medium ${ISSUE_STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: 'bg-graphite-700 text-mist-200',
  Medium: 'bg-steel-500/30 text-mist-100',
  High: 'bg-amber-500/25 text-amber-500',
  Critical: 'bg-danger-500/25 text-danger-500',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}>
      {priority === 'Critical' && '⚠ '}
      {priority}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-steel-300">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-md border border-graphite-600 bg-graphite-800 px-3 py-2.5 text-sm text-mist-100 placeholder:text-steel-500 outline-none focus:border-amber-500 transition-colors';
