/**
 * Home.jsx
 * ─────────────────────────────────────────────────────────────
 * Assembles the home page:
 *   1. <Hero />
 *   2. <HomeStory />
 */

import { Helmet }        from 'react-helmet-async';
import Hero              from '@sections/Hero';
import HomeStory         from '@sections/HomeStory';

export default function Home() {

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
