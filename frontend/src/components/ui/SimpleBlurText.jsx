import { useRef, useState, useEffect } from 'react';

/**
 * SimpleBlurText
 *
 * Lightweight, CSS-transition-based blur reveal.
 * Triggers once when the element enters the viewport.
 *
 * Props:
 *  as           — HTML wrapper tag (default: 'span')
 *  style        — inline styles for the wrapper
 *  text         — string to animate
 *  className    — forwarded to the root element
 *  delay        — base delay (ms) between segments
 *  animateBy    — 'words' | 'letters'
 */
export default function SimpleBlurText({
  as: Tag = 'span',
  style = {},
  text,
  className,
  spanClassName = '',
  delay = 100,
  animateBy = 'words'
}) {
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
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <Tag
      ref={ref}
      className={className}
      aria-label={text}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        ...style
      }}
    >
      {elements.map((segment, i) => (
        <span
          key={i}
          className={spanClassName}
          style={{
            display:    'inline-block',
            whiteSpace: 'pre',
            opacity:    visible ? 1   : 0,
            filter:     visible ? 'blur(0px)' : 'blur(12px)',
            transform:  visible ? 'translateY(0)' : 'translateY(18px)',
            transition: `opacity 0.8s ease ${i * (delay / 1000)}s,
                         filter  0.8s ease ${i * (delay / 1000)}s,
                         transform 0.8s ease ${i * (delay / 1000)}s`,
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && i < elements.length - 1 && '\u00A0'}
        </span>
      ))}
    </Tag>
  );
}
