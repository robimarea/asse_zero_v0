import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@context/AdminAuthContext';
import PageSeo from '@components/seo/PageSeo';

export default function AdminLogin() {
  const { admin, status, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (status === 'loading') {
    return <p className="srOnly">Caricamento</p>;
  }

  if (admin) {
    return <Navigate to={from === '/admin/login' ? '/admin' : from} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Errore di accesso');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageSeo
        title="Admin — Accesso"
        description="Accesso riservato agli amministratori."
        robots="noindex, nofollow"
        path="/admin/login"
      />
      <div className="container" style={{ padding: '6rem 1.5rem 4rem', maxWidth: '28rem' }}>
        <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
          Area admin
        </h1>
        <p style={{ opacity: 0.75, marginBottom: '2rem', fontSize: '0.95rem' }}>
          Accesso riservato. URL non pubblicizzato sul sito principale.
        </p>
        <form onSubmit={onSubmit}>
          <label className="srOnly" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={inputStyle}
          />
          <label className="srOnly" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{ ...inputStyle, marginTop: '0.75rem' }}
          />
          {error ? (
            <p role="alert" style={{ color: 'var(--color-danger, #c44)', marginTop: '1rem', fontSize: '0.9rem' }}>
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="section-title"
            disabled={pending}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.85rem 1rem',
              fontSize: '0.85rem',
              letterSpacing: '0.12em',
              border: '1px solid rgb(var(--accent-rgb) / 0.35)',
              background: 'rgb(var(--accent-rgb) / 0.12)',
              color: 'var(--color-text)',
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            {pending ? 'Accesso…' : 'Entra'}
          </button>
        </form>
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.6 }}>
          <Link to="/">← Torna al sito</Link>
        </p>
      </div>
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '4px',
  border: '1px solid rgb(var(--accent-rgb) / 0.25)',
  background: 'rgb(var(--color-bg-rgb, 10 10 12) / 0.6)',
  color: 'var(--color-text)',
  fontSize: '1rem',
};
