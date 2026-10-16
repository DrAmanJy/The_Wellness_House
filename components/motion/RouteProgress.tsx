'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

export const RouteProgress: React.FC = () => {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When pathname changes, show a brief subtle navigation pulse
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 320);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (prefersReduced) return null;

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          key={pathname}
          initial={{ scaleX: 0, opacity: 0.8 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 h-[2.5px] bg-[#30473B] z-50 origin-left pointer-events-none"
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
};
