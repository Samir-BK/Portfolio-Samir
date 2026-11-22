'use client';

import { useEffect, type ReactNode } from 'react';
import { useAnimate, useInView, useReducedMotion } from 'motion/react';

export function Entrance({
  children,
  className,
  hero = false,
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  hero?: boolean;
  stagger?: boolean;
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
    const targets = stagger ? Array.from(element.children) : [element];
    function reset(target: Element) {
      if (!(target instanceof HTMLElement)) return;
      target.style.removeProperty('transform');
      target.style.removeProperty('opacity');
    }
    const animations = targets.map((target, index) =>
      animate(
        target,
        { y: [hero ? 12 : 18, 0], opacity: [hero ? 0.88 : 0.8, 1] },
        {
          duration: hero ? 0.65 : 0.5,
          delay: Math.min(index * 0.045, 0.18),
          ease: [0.2, 0.65, 0.3, 1],
          onComplete: () => reset(target),
        },
      ),
    );
    return () => {
      for (const animation of animations) animation.stop();
      for (const target of targets) reset(target);
    };
  }, [animate, hero, reduceMotion, scope, shouldAnimate, stagger]);

  return (
    <div className={className} ref={scope}>
      {children}
    </div>
  );
}
