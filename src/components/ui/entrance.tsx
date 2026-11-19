'use client';

import { useEffect, type ReactNode } from 'react';
import { useAnimate, useInView, useReducedMotion } from 'motion/react';

export function Entrance({
  children,
  className,
  hero = false,
}: {
  children: ReactNode;
  className?: string;
  hero?: boolean;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, amount: 0.12 });
  const reduceMotion = useReducedMotion();
  const shouldAnimate = hero || inView;

  useEffect(() => {
    const element = scope.current;
    if (
      !element ||
      !shouldAnimate ||
      reduceMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const animation = animate(
      element,
      { y: [hero ? 12 : 8, 0], opacity: [0.88, 1] },
      { duration: hero ? 0.65 : 0.32, ease: [0.2, 0.65, 0.3, 1] },
    );
    return () => {
      animation.stop();
      element.style.removeProperty('transform');
      element.style.removeProperty('opacity');
    };
  }, [animate, hero, reduceMotion, scope, shouldAnimate]);

  return (
    <div className={className} ref={scope}>
      {children}
    </div>
  );
}
