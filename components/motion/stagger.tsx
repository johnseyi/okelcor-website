"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * StaggerParent — triggers staggered reveal on scroll for its children.
 * Wrap a grid or list; place each card inside StaggerChild.
 */
export function StaggerParent({ children, className }: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerChild — individual animated item inside StaggerParent.
 * Inherits delay from parent stagger timing automatically.
 */
export function StaggerChild({ children, className }: Props) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
