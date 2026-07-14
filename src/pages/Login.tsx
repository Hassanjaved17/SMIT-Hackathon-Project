import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, inputClass, Plate } from '../components/ui';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'technician'>('technician');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <Plate className="p-8">
        <h1 className="font-display text-2xl font-semibold text-mist-100">
          {mode === 'login' ? 'Sign in to MaintainIQ' : 'Create your account'}
        </h1>
        <p className="mt-1.5 text-sm text-steel-300">Internal access for administrators and technicians.</p>

        {!isSupabaseConfigured && (
          <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
            Demo mode (no Supabase configured). Try <span className="font-mono">hassandeveloper341@gmail.com / admin123</span>, <span className="font-mono">admin@maintainiq.app / admin123</span> or{' '}
            <span className="font-mono">tech@maintainiq.app / tech123</span>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <Field label="Full name">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
          )}
          <Field label="Email">
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </Field>
          {mode === 'register' && (
            <Field label="Role">
              <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'technician')}>
                <option value="technician">Technician</option>
                <option value="admin">Administrator</option>
              </select>
            </Field>
          )}

          {error && <p className="text-sm text-danger-500">{error}</p>}

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          className="mt-5 text-sm text-steel-300 hover:text-mist-100"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
        </button>
      </Plate>
    </div>
  );
}
