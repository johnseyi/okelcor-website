"use client";

/**
 * components/motion/stagger.tsx
 *
 * Scroll-triggered stagger reveal powered by GSAP.
 * Drop-in replacement for the previous Framer Motion version.
 * Public API is unchanged — all existing usages continue to work.
 *
 * StaggerParent — attach to the grid/list container.
 * StaggerChild  — pass-through div; kept for backward compatibility.
 *                 No longer needed for the animation to work — GSAP
 *                 targets direct children of StaggerParent automatically.
 *
 * Usage:
 *   <StaggerParent className="grid grid-cols-3 gap-6">
 *     <StaggerChild><Card /></StaggerChild>
 *     <StaggerChild><Card /></StaggerChild>
 *     <StaggerChild><Card /></StaggerChild>
 *   </StaggerParent>
 */

import { useStagger } from "@/hooks/useStagger";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child animating in (seconds). Default 0.09. */
  stagger?: number;
  /** Delay before the first item starts (seconds). Default 0. */
  delay?: number;
};

type ItemProps = React.HTMLAttributes<HTMLDivElement>;

export function StaggerParent({
  children,
  className,
  stagger,
  delay,
}: ContainerProps) {
  const ref = useStagger<HTMLDivElement>({ stagger, delay });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * StaggerChild — plain pass-through wrapper.
 * Kept for backward compatibility with existing markup.
 */
export function StaggerChild({ children, ...props }: ItemProps) {
  return <div {...props}>{children}</div>;
}
