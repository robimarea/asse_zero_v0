/**
 * Home.jsx
 * ─────────────────────────────────────────────────────────────
 * Assembles the home page:
 *
 *   1. <Hero />       — full-viewport title card with BlurText
 *                       animation.  Uses a <section> so the global
 *                       useScrollReveal picks it up.
 *
 *   2. <HomeStory />  — scroll-driven narrative: manifesto words,
 *                       service cards, diptych wipe, film strip,
 *                       quote, CTA.  Uses its own IntersectionObserver
 *                       and <div> blocks — no conflict with global CSS.
 *
 * useScrollReveal('section') is kept only to reveal the Hero section
 * which has opacity:0 in global.css by default.
 */

import { Helmet }        from 'react-helmet-async';
import Hero              from '../components/Hero';
import HomeStory         from '../components/HomeStory';
import useScrollReveal   from '../hooks/useScrollReveal';

export default function Home() {
  /* Reveal the Hero <section> via the global section animation */
  useScrollReveal('section');

  return (
    <>
      <Helmet>
        <title>ASSE ZERO | Home</title>
        <meta
          name="description"
          content="ASSE ZERO – Studio di produzione creativa. Advertising, Short Films, Music Videos, Sound Design."
        />
      </Helmet>

      {/* Full-viewport animated title */}
      <Hero />

      {/* Scroll-driven narrative — builds itself as you scroll */}
      <HomeStory />
    </>
  );
}
