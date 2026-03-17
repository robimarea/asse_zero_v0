import { useRef, useState, useEffect } from 'react';

/**
 * SimpleBlurText
 *
 * Lightweight, CSS-transition-based word-by-word blur reveal.
 * Triggers once when the element enters the viewport.
 *
 * This is intentionally distinct from BlurText.jsx, which is a more
 * configurable framer-motion version used in the Hero.
 *
 * Props:
 *  text      — string to animate
 *  className — forwarded to the root <span>
 */
export default function SimpleBlurText({ text, className }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      style={{ display: 'inline-block' }}
    >
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          style={{
            display:    'inline-block',
            marginRight: '0.22em',
            opacity:    visible ? 1   : 0,
            filter:     visible ? 'blur(0px)' : 'blur(12px)',
            transform:  visible ? 'translateY(0)' : 'translateY(18px)',
            transition: `opacity 0.6s ease ${i * 0.1}s,
                         filter  0.6s ease ${i * 0.1}s,
                         transform 0.6s ease ${i * 0.1}s`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
