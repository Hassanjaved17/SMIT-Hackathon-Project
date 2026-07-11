import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const NAV_LINKS = [
  { href: '#features', label: 'Platform' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-graphite-700 bg-graphite-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 text-graphite-950">
            <Wrench size={17} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Maintain<span className="text-amber-500">IQ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-mist-200 transition-colors hover:text-mist-100">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="secondary" onClick={() => logout()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign in
              </Button>
              <Button variant="primary" onClick={() => navigate('/report')}>
                Report an issue
              </Button>
            </>
          )}
        </div>

        <button className="text-mist-100 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-graphite-700 bg-graphite-900 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-mist-200" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Button variant="secondary" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                  <Button variant="ghost" onClick={() => logout()}>Sign out</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => navigate('/login')}>Sign in</Button>
                  <Button variant="primary" onClick={() => navigate('/report')}>Report an issue</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
