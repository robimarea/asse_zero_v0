import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import LoadingScreen from './components/LoadingScreen';
import Navigation    from './components/Navigation';
import Footer        from './components/Footer';
import LightRays     from './components/LightRays';
import ClickSpark    from './components/ClickSpark';

import Home    from './pages/Home';
import Work    from './pages/Work';
import Servizi from './pages/Servizi';

export default function App() {
  const [loading, setLoading] = useState(true);
  const done = useCallback(() => setLoading(false), []);
  const { pathname } = useLocation();

  /* Scroll to top on page change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <>
      <ClickSpark />

      <Helmet>
        <title>ASSE ZERO | Production</title>
        <meta name="description" content="ASSE ZERO – Advertising, Short Films, Music Videos, Sound Design" />
      </Helmet>

      {loading && <LoadingScreen onComplete={done} />}

      <LightRays
        raysOrigin="top-center"
        raysColor="#92c8d3"
        raysSpeed={0.4}
        lightSpread={0.7}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0}
        distortion={0}
        className="custom-rays"
        pulsating={false}
        fadeDistance={1}
        saturation={1.7}
      />

      <Navigation />

      <main>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/work"    element={<Work />} />
          <Route path="/servizi" element={<Servizi />} />
          {/* Fallback */}
          <Route path="*"        element={<Home />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
