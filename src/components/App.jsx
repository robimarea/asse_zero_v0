import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Photos from './components/Photos';
import Videos from './components/Videos';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LightRays from './components/LightRays';
import useScrollReveal from './hooks/useScrollReveal';

export default function App() {
  const [loading, setLoading] = useState(true);

  // Called by LoadingScreen when the exit animation ends
  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  useScrollReveal('section');

  return (
    <>
      <Helmet>
        <title>Portfolio | Gerardo Romani</title>
        <meta name="description" content="Portfolio creativo di Gerardo Romani" />
      </Helmet>

      {/* ── Loading screen – rendered on top until animation ends ── */}
      {loading && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}

      {/* ── Main site ─────────────────────────────────────────────── */}
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
        <Hero />
        <About />
        <Photos />
        <Videos />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
