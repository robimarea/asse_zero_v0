import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { TransitionProvider } from '@context/TransitionContext';
import { AdminAuthProvider } from '@context/AdminAuthContext';
import LoadingScreen    from '@ui/LoadingScreen';
import Navigation       from '@layout/Navigation';
import Footer           from '@layout/Footer';
import ClickSpark       from '@ui/ClickSpark';
import ScrollProgress   from '@ui/ScrollProgress';
import DotGrid          from '@ui/DotGrid';
import useViewportSystem from '@hooks/useViewportSystem';


const Home    = lazy(() => import('./pages/Home'));
const Work    = lazy(() => import('./pages/Work'));
const Servizi = lazy(() => import('./pages/Servizi'));
const About   = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RequireAdmin = lazy(() => import('./components/admin/RequireAdmin'));

function FixedTitle() {
  const navigate = useNavigate();
  
  const goHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={goHome}
      style={{
        position: 'fixed',
        top: 'max(1.5rem, env(safe-area-inset-top))',
        left: '2rem',
        zIndex: 1000,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: "'Roboto Condensed', Arial, sans-serif",
        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.opacity = '1';
      }}
      aria-label="Torna alla home"
    >
      ASSE ZERO
    </button>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  useViewportSystem();

  const isAdminArea = pathname.startsWith('/admin');

  return (
    <AdminAuthProvider>
    <TransitionProvider>
      <DotGrid />
      <FixedTitle />
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <ClickSpark />
      <ScrollProgress />
      
      <main>
        {!isAdminArea ? <Navigation /> : null}
        <Suspense fallback={null}>
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/work"    element={<Work />} />
            <Route path="/servizi" element={<Servizi />} />
            <Route path="/our-team" element={<About />} />
            <Route path="/about"    element={<Navigate to="/our-team" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*"        element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminArea ? <Footer /> : null}
    </TransitionProvider>
    </AdminAuthProvider>
  );
}
