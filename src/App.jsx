import { Helmet } from 'react-helmet-async';
import Navigation from './components/Navigation';
import Hero      from './components/Hero';
import About     from './components/About';
import Photos    from './components/Photos';
import Videos    from './components/Videos';
import Services  from './components/Services';
import Contact   from './components/Contact';
import Footer    from './components/Footer';
import ClickSpark from './components/ClickSpark';
import LightRays  from './components/LightRays';
import useScrollReveal from './hooks/useScrollReveal';

export default function App() {
  useScrollReveal('section');

  return (
    <>
      <Helmet>
        <title>Portfolio | Gerardo Romani</title>
        <meta name="description" content="Portfolio creativo di Gerardo Romani" />
      </Helmet>

      {/* Sfondo WebGL – raggi luminosi fissi dietro tutto */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#92c8d3"
        raysSpeed={0.6}
        lightSpread={1.4}
        rayLength={2.2}
        fadeDistance={1.2}
        saturation={1.0}
        followMouse={true}
        mouseInfluence={0.12}
        noiseAmount={0.05}
        distortion={0.05}
        pulsating={false}
      />

      <ClickSpark/>
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