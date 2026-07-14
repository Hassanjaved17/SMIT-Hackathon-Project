import { type ReactNode, useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, ClipboardCheck } from 'lucide-react';
import { Button, PriorityBadge, IssueStatusBadge } from './ui';
import { listMaintenanceRecords } from '../lib/store';
import type { Asset, Issue, MaintenanceRecord } from '../types';

export default function IssueReceipt({ issue, asset }: { issue: Issue; asset: Asset }) {
  const trackingUrl = `${window.location.origin}/track?ref=${issue.issue_number}`;
  const reportedAt = new Date(issue.created_at);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    listMaintenanceRecords(issue.id).then(setMaintenance);
  }, [issue.id]);

  function handlePrint() {
    window.print();
  }

  async function handleCopyRef() {
    await navigator.clipboard.writeText(issue.issue_number);
  }

  return (
    <div className="mx-auto max-w-md">
      <div
        id="issue-receipt"
        className="rounded-lg border border-graphite-600 bg-graphite-800/80 p-6 font-mono text-mist-100 print:border-black print:bg-white print:text-black"
      >
        <div className="mb-4 flex items-start justify-between border-b border-dashed border-graphite-600 pb-4 print:border-black">
          <div>
            <p className="text-xs uppercase tracking-widest text-steel-300 print:text-black">
              MaintainIQ · Issue Receipt
            </p>
            <p className="mt-1 text-lg font-bold text-amber-500 print:text-black">
              {issue.issue_number}
            </p>
          </div>
          <div className="rounded border border-graphite-600 bg-white p-1 print:border-black">
            <QRCodeCanvas value={trackingUrl} size={56} />
          </div>
        </div>

        <div className="mb-4 space-y-1.5 text-sm">
          <Row label="Reported">{reportedAt.toLocaleString()}</Row>
          <Row label="Asset">{asset.name}</Row>
          <Row label="Asset code">{asset.code}</Row>
          <Row label="Location">{asset.location}</Row>
          <Row label="Reported by">{issue.reporter_name}</Row>
        </div>

        <div className="mb-4 border-t border-dashed border-graphite-600 pt-4 print:border-black">
          <p className="mb-1 text-xs uppercase tracking-wide text-steel-300 print:text-black">
            Reported issue
          </p>
          <p className="mb-2 font-sans text-sm font-semibold text-mist-100 print:text-black">
            {issue.title}
          </p>
          <p className="font-sans text-xs text-steel-300 print:text-black">{issue.description}</p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 border-t border-dashed border-graphite-600 pt-4 print:border-black">
          <PriorityBadge priority={issue.priority} />
          <IssueStatusBadge status={issue.status} />
          <span className="text-xs text-steel-300 print:text-black">Category: {issue.category}</span>
        </div>

        {maintenance.length > 0 && (
          <div className="mb-4 space-y-2 border-t border-dashed border-graphite-600 pt-4 print:border-black">
            <p className="text-xs uppercase tracking-wide text-steel-300 print:text-black">
              Maintenance record
            </p>
            {maintenance.map((m) => (
              <div key={m.id} className="space-y-1 text-xs">
                <p className="font-semibold text-mist-100 print:text-black">{m.technician}</p>
                <p className="text-steel-300 print:text-black">{m.notes}</p>
                {m.parts_used && <p className="text-steel-400 print:text-black">Parts: {m.parts_used}</p>}
                {m.cost > 0 && <p className="text-steel-400 print:text-black">Cost: {m.cost}</p>}
                <p className="text-steel-500 print:text-black">{new Date(m.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <p className="border-t border-dashed border-graphite-600 pt-4 text-center text-[10px] text-steel-400 print:border-black print:text-black">
          Scan the QR code or visit /track and enter {issue.issue_number} to check status.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 print:hidden">
        <Button variant="secondary" onClick={handlePrint}>
          <Printer size={14} /> Print / Save as PDF
        </Button>
        <Button variant="ghost" onClick={handleCopyRef}>
          <ClipboardCheck size={14} /> Copy reference
        </Button>
        <a href={`/track?ref=${issue.issue_number}`}>
          <Button variant="ghost">
            <Download size={14} /> Track this issue
          </Button>
        </a>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-steel-400 print:text-black">{label}</span>
      <span className="text-right text-mist-100 print:text-black">{children}</span>
    </div>
  );
}
