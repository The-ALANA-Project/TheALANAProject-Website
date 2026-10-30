import { motion, useReducedMotion } from 'motion/react';

interface BlogLoadingBarProps {
  label: string;
}

export function BlogLoadingBar({ label }: BlogLoadingBarProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full rounded-[4px] border border-accent/70 bg-background/60 p-4 shadow-lg backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground">
          {label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ALANA&apos;s Blog
        </span>
      </div>

      <div
        className="relative h-2 overflow-hidden rounded-[4px] border border-accent/60 bg-background/50 backdrop-blur-md"
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 rounded-[4px] bg-accent shadow-lg"
          initial={{ x: reduceMotion ? '0%' : '-110%' }}
          animate={{ x: reduceMotion ? '0%' : ['-110%', '310%'] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 1.5, ease: 'easeInOut', repeat: Infinity }
          }
        />
      </div>
      <span className="sr-only">Content is loading.</span>
    </div>
  );
}
