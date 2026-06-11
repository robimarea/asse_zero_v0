import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@context/AdminAuthContext';
import PageSeo from '@components/seo/PageSeo';
import styles from './AdminLogin.module.css';

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
      <div className={`container ${styles.loginContainer}`}>
        <div className={styles.loginCard}>
          <h1 className={`section-title ${styles.title}`}>
            Area admin
          </h1>
          <p className={styles.description}>
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
              className={styles.input}
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
              className={`${styles.input} ${styles.passwordInput}`}
            />
            {error ? (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className={`section-title ${styles.submitButton}`}
              disabled={pending}
            >
              {pending ? 'Accesso…' : 'Entra'}
            </button>
          </form>
          <p className={styles.backLink}>
            <Link to="/">← Torna al sito</Link>
          </p>
        </div>
      </div>
    </>
  );
}
