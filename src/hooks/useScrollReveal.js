import { useEffect } from 'react';

/**
 * Attaches an IntersectionObserver to all elements matching `selector`.
 * When an element enters the viewport it receives the class "visible",
 * triggering the CSS opacity / translateY transition defined in global.css.
 */
export default function useScrollReveal(selector = 'section') {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector]);
}
