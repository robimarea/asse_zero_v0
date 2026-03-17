import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Merges a `from` snapshot and an array of `to` snapshots into
 * the keyframes object that framer-motion's `animate` prop expects.
 */
function buildKeyframes(from, steps) {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);
  const keyframes = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
}

/**
 * BlurText
 *
 * Animates each word (or letter) of `text` from a blurred/offset state
 * into sharp focus using framer-motion. Triggers once on viewport entry.
 *
 * Props:
 *  as           — HTML wrapper tag (default: 'p').
 *                 Pass 'span' when inside a heading, 'div' for block layouts.
 *  style        — merged into the wrapper element's inline style, useful for
 *                 overriding the default justifyContent:'center' (e.g. 'flex-start')
 *  text         — string to animate
 *  animateBy    — 'words' | 'letters'
 *  direction    — 'top' | 'bottom'  (initial offset direction)
 *  delay        — ms between each word / letter
 *  stepDuration — seconds per animation step
 *  className / spanStyle — forwarded to wrapper / each animated span
 *  threshold / rootMargin — IntersectionObserver options
 *  animationFrom / animationTo — override default keyframes
 *  easing / onAnimationComplete — framer-motion passthrough
 */
export default function BlurText({
  as               = 'p',
  style            = {},
  text             = '',
  delay            = 200,
  className        = '',
  spanStyle        = {},
  animateBy        = 'words',
  direction        = 'top',
  threshold        = 0.1,
  rootMargin       = '0px',
  animationFrom,
  animationTo,
  easing           = (t) => t,
  onAnimationComplete,
  stepDuration     = 0.35,
}) {
  const Tag      = as;
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () => ({ filter: 'blur(10px)', opacity: 0, y: direction === 'top' ? -50 : 50 }),
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      { filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
      { filter: 'blur(0px)', opacity: 1,   y: 0 },
    ],
    [direction],
  );

  const fromSnapshot    = animationFrom ?? defaultFrom;
  const toSnapshots     = animationTo   ?? defaultTo;
  const stepCount       = toSnapshots.length + 1;
  const totalDuration   = stepDuration * (stepCount - 1);
  const times           = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1),
  );
  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        display:        'flex',
        flexWrap:       'wrap',
        justifyContent: 'center',
        margin:         0,
        ...style,                  /* caller can override justifyContent etc. */
      }}
    >
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={fromSnapshot}
          animate={inView ? animateKeyframes : fromSnapshot}
          transition={{
            duration: totalDuration,
            times,
            delay:    (index * delay) / 1000,
            ease:     easing,
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
          style={{
            display:    'inline-block',
            willChange: 'transform, filter, opacity',
            ...spanStyle,
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </Tag>
  );
}
