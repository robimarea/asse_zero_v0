import { useEffect, useRef } from 'react';

/**
 * Adds mouse-drag and touch-drag scrolling to a container ref.
 * axis: 'x' for horizontal (photos), 'y' for vertical (videos).
 * multiplier: scroll sensitivity.
 */
export default function useDragScroll(containerRef, axis = 'x', multiplier = 0.8) {
  const state = useRef({
    isDragging: false,
    startPos: 0,
    scrollOrigin: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getPos   = (e) => axis === 'x' ? e.pageX : e.pageY;
    const getOffset = () => axis === 'x' ? el.offsetLeft : el.offsetTop;
    const getScroll = () => axis === 'x' ? el.scrollLeft : el.scrollTop;
    const setScroll = (v) => {
      if (axis === 'x') el.scrollLeft = v;
      else              el.scrollTop  = v;
    };

    const onMouseDown = (e) => {
      state.current.isDragging   = true;
      state.current.startPos     = getPos(e) - getOffset();
      state.current.scrollOrigin = getScroll();
      el.style.cursor = 'grabbing';
    };

    const onMouseLeave = () => {
      if (state.current.isDragging) {
        state.current.isDragging = false;
        el.style.cursor = 'grab';
      }
    };

    const onMouseUp = () => {
      state.current.isDragging = false;
      el.style.cursor = 'grab';
    };

    const onMouseMove = (e) => {
      if (!state.current.isDragging) return;
      e.preventDefault();
      const delta = getPos(e) - getOffset() - state.current.startPos;
      setScroll(state.current.scrollOrigin - delta * multiplier);
    };

    // Touch
    const onTouchStart = (e) => {
      state.current.startPos     = axis === 'x' ? e.touches[0].pageX : e.touches[0].pageY;
      state.current.scrollOrigin = getScroll();
    };

    const onTouchMove = (e) => {
      const delta = state.current.startPos -
        (axis === 'x' ? e.touches[0].pageX : e.touches[0].pageY);
      setScroll(state.current.scrollOrigin + delta * multiplier);
    };

    el.addEventListener('mousedown',  onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup',    onMouseUp);
    el.addEventListener('mousemove',  onMouseMove);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: true });

    return () => {
      el.removeEventListener('mousedown',  onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup',    onMouseUp);
      el.removeEventListener('mousemove',  onMouseMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
    };
  }, [containerRef, axis, multiplier]);
}
