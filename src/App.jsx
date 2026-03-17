import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { TransitionProvider } from './components/TransitionContext';
import LoadingScreen           from './components/LoadingScreen';
import Navigation              from './components/Navigation';
import Footer                  from './components/Footer';
import LightRays               from './components/LightRays';
import ClickSpark              from './components/ClickSpark';
import Cursor                  from './components/Cursor';

import Home    from './pages/Home';
import Work    from './pages/Work';
import Servizi from './pages/Servizi';
import About   from './pages/About';

export default function App() {
  const { pathname } = useLocation();
  // Once the LoadingScreen animation finishes it calls onComplete,
  // which unmounts it — removing the fixed full-screen div that was
  // intercepting all pointer events.
  const [showLoading, setShowLoading] = useState(true);

  /* Scroll to top on route change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <TransitionProvider>
      {showLoading && (
        <LoadingScreen onComplete={() => setShowLoading(false)} />
      )}
      <Cursor />
      <ClickSpark />
      <LightRays />
      <main>
        <Navigation />
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/work"    element={<Work />} />
          <Route path="/servizi" element={<Servizi />} />
          <Route path="/about"   element={<About />} />
          <Route path="*"        element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </TransitionProvider>
  );
}
