import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="font-mono text-xs text-amber-500">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-mist-100">Page not found</h1>
      <p className="mt-2 text-steel-300">This link doesn't match anything in MaintainIQ.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button variant="primary">Return home</Button>
      </Link>
    </div>
  );
}
