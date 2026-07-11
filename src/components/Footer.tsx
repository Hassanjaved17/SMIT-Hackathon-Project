import { Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-graphite-700 bg-graphite-950">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-graphite-950">
                <Wrench size={14} strokeWidth={2.5} />
              </span>
              <span className="font-display text-base font-semibold">
                Maintain<span className="text-amber-500">IQ</span>
              </span>
            </div>
            <p className="max-w-xs text-sm text-steel-300">
              Every asset gets a digital identity, a QR tag, and a permanent service record.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-steel-300">Platform</h4>
            <ul className="space-y-2 text-sm text-mist-200">
              <li>Asset Registry</li>
              <li>QR Tagging</li>
              <li>AI Issue Triage</li>
              <li>Maintenance History</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-steel-300">Company</h4>
            <ul className="space-y-2 text-sm text-mist-200">
              <li>About</li>
              <li>Security</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-steel-300">Built for</h4>
            <ul className="space-y-2 text-sm text-mist-200">
              <li>Schools & Campuses</li>
              <li>Hospitals & Labs</li>
              <li>Hotels & Facilities</li>
              <li>Warehouses</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-graphite-800 pt-6 text-xs text-steel-500 sm:flex-row sm:items-center">
          <span>© 2026 MaintainIQ. Built for the SMIT Final Hackathon.</span>
          <span className="font-mono">ASSET-TAG · v1.0</span>
        </div>
      </div>
    </footer>
  );
}
