"use client";

import { motion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Reveal — wraps any content in a scroll-triggered fade+slide animation.
 * Import this into server components freely; only the wrapper runs client-side.
 *
 * Usage:
 *   <Reveal>
 *     <MySectionContent />
 *   </Reveal>
 */
export default function Reveal({ children, className, delay = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: fadeUp.hidden,
        visible: {
          ...(fadeUp.visible as object),
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
