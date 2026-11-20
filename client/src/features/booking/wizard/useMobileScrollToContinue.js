import { useRef } from 'react';

export default function useMobileScrollToContinue() {
  const targetRef = useRef(null);

  const scrollToContinue = () => {
    if (!window.matchMedia('(max-width: 767px)').matches) return;

    targetRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'center',
    });
  };

  return { targetRef, scrollToContinue };
}
