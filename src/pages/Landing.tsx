import { Link } from 'react-router-dom';
import {
  QrCode, ClipboardList, Sparkles, History, Wrench, ShieldCheck,
  ScanLine, UserCheck, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { Button, Plate } from '../components/ui';

const FEATURES = [
  {
    icon: QrCode,
    title: 'A tag for every asset',
    body: 'Register a projector, an AC unit, or an elevator once. MaintainIQ mints a unique code and a QR tag that never breaks, even if the asset gets renamed or relocated.',
  },
  {
    icon: Sparkles,
    title: 'AI issue triage',
    body: 'A messy complaint like "it\'s leaking and making noise" becomes a structured ticket: title, category, priority, likely causes, and safe initial checks — reviewed by a human before it saves.',
  },
  {
    icon: ClipboardList,
    title: 'Controlled workflow',
    body: 'Issues move through reported, assigned, inspected, and resolved — with invalid jumps blocked and every resolution backed by a maintenance note.',
  },
  {
    icon: History,
    title: 'Permanent history',
    body: 'Every asset carries a tamper-resistant timeline: who reported what, who fixed it, which parts were used, and when the next service is due.',
  },
  {
    icon: Wrench,
    title: 'Built for technicians',
    body: 'A focused queue of assigned work, one tap to start inspection, and a fast way to log parts, cost, and evidence from a phone.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe by default',
    body: 'Public asset pages expose only what reporters need. Internal notes, costs, and technician details stay behind authentication.',
  },
];

const WORKFLOW = [
  { icon: ScanLine, title: 'Scan the tag', body: 'Anyone can scan the QR on the asset and open its public page — no login required.' },
  { icon: ClipboardList, title: 'Report the problem', body: 'Describe the issue in plain language. AI triage suggests the structured details.' },
  { icon: UserCheck, title: 'Assign & fix', body: 'A technician is assigned, inspects, and logs the work performed and parts used.' },
  { icon: CheckCircle2, title: 'Close the loop', body: 'The asset returns to Operational, and the fix becomes part of its permanent history.' },
];

const PLANS = [
  {
    name: 'Campus',
    price: '$0',
    period: 'up to 25 assets',
    tag: null,
    features: ['Unlimited issue reports', 'QR tag generation', 'Basic maintenance history', 'Email support'],
  },
  {
    name: 'Facility',
    price: '$79',
    period: 'per month',
    tag: 'Most picked',
    features: ['Unlimited assets', 'AI issue triage', 'Technician assignment & roles', 'Evidence uploads', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'multi-site',
    tag: null,
    features: ['Multi-building & multi-org', 'SSO & audit-grade history', 'AI preventive recommendations', 'Dedicated onboarding'],
  },
];

const FAQ = [
  { q: 'Do reporters need to create an account?', a: 'No. Anyone can scan a QR tag and submit a report from the public asset page — accounts are only for admins and technicians.' },
  { q: 'What happens if the AI suggestion is wrong?', a: 'Every AI-generated field is editable before saving. AI output is advisory — the person submitting or reviewing the issue always has the final word.' },
  { q: 'Can I bulk-generate QR labels?', a: 'Yes, admins can select multiple assets and generate a printable label sheet with the organization name, asset code, and QR tag.' },
  { q: 'What if an asset is retired?', a: 'Retired assets keep their QR page readable but clearly display a Retired status, and no new issues can move it out of that state.' },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-graphite-700">
        <div className="pointer-events-none absolute inset-0 hazard-stripe opacity-[0.04]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-graphite-600 bg-graphite-800 px-3 py-1 text-xs font-mono text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> ASSET-INTELLIGENCE PLATFORM
            </span>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-mist-100 sm:text-5xl lg:text-6xl">
              Every asset deserves a service record, not a rumor.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-steel-300">
              MaintainIQ turns scattered registers, phone calls, and WhatsApp threads into one QR-accessible history —
              from the projector in Room 204 to the AC unit in the lobby.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/report">
                <Button variant="primary">
                  Report an issue <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Open technician login</Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs font-mono text-steel-500">
              <span>SCAN → REPORT → DIAGNOSE → MAINTAIN</span>
            </div>
          </div>

          {/* Signature element: asset nameplate / tag mockup */}
          <div className="relative">
            <div className="plate plate-rivets-bottom mx-auto max-w-sm p-6">
              <div className="mb-4 flex items-center justify-between border-b border-graphite-700 pb-3">
                <span className="font-mono text-xs text-steel-300">ASSET TAG</span>
                <span className="rounded border border-teal-500/30 bg-teal-500/15 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                  OPERATIONAL
                </span>
              </div>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-graphite-600 bg-graphite-900">
                  <QrCode size={52} className="text-mist-100" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold text-mist-100">Classroom Projector 01</div>
                  <div className="mt-1 font-mono text-xs text-amber-500">AST-0001</div>
                  <div className="mt-1 text-xs text-steel-300">Room 204, Block B</div>
                </div>
              </div>
              <div className="space-y-2 border-t border-graphite-700 pt-4 text-xs">
                <div className="flex justify-between text-steel-300">
                  <span>Reported</span>
                  <span className="font-mono text-mist-200">Display flickering, no HDMI signal</span>
                </div>
                <div className="flex justify-between text-steel-300">
                  <span>AI priority</span>
                  <span className="font-mono text-amber-500">Medium</span>
                </div>
                <div className="flex justify-between text-steel-300">
                  <span>Next service</span>
                  <span className="font-mono text-mist-200">Nov 01, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-graphite-700 bg-graphite-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-500">Platform</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The QR code is the entry point. This is the actual product.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Plate key={f.title} className="h-full">
                <f.icon size={22} className="mb-4 text-amber-500" strokeWidth={2} />
                <h3 className="mb-2 font-display text-base font-semibold text-mist-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-steel-300">{f.body}</p>
              </Plate>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-b border-graphite-700 bg-graphite-950 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-teal-400">Lifecycle</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              From a flickering projector to a closed ticket.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {WORKFLOW.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-graphite-600 bg-graphite-800 text-teal-400">
                  <step.icon size={20} />
                </div>
                <h3 className="mb-1.5 font-display text-sm font-semibold text-mist-100">{step.title}</h3>
                <p className="text-sm leading-relaxed text-steel-300">{step.body}</p>
                {i < WORKFLOW.length - 1 && (
                  <div className="mt-6 hidden h-px w-full bg-graphite-700 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-graphite-700 bg-graphite-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-500">Pricing</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Priced by facility, not by headache.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`plate flex flex-col p-7 ${plan.tag ? 'border-amber-500/50 shadow-[0_0_0_1px_rgba(242,169,59,0.15)]' : ''}`}
              >
                {plan.tag && (
                  <span className="mb-4 inline-block w-fit rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-graphite-950">
                    {plan.tag}
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold text-mist-100">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold text-mist-100">{plan.price}</span>
                  <span className="text-xs text-steel-300">{plan.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-steel-300">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/report" className="mt-8">
                  <Button variant={plan.tag ? 'primary' : 'secondary'} className="w-full">
                    {plan.price === 'Custom' ? 'Talk to us' : 'Get started'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-graphite-950 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-14 max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-teal-400">FAQ</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Common questions</h2>
          </div>
          <div className="divide-y divide-graphite-700 border-y border-graphite-700">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-medium text-mist-100">
                  {item.q}
                  <span className="ml-4 text-steel-300 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-steel-300">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-graphite-700 bg-graphite-900 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Give your first asset a QR tag today.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-steel-300">
            No spreadsheets. No lost paper trail. Just a scan and a permanent record.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login">
              <Button variant="primary">Sign in to register an asset</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
