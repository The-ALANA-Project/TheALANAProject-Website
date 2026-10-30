import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

type BlogBeamRevealProps = {
  children: ReactNode
}

export function BlogBeamReveal({ children }: BlogBeamRevealProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="relative overflow-clip"
      initial={
        shouldReduceMotion
          ? { opacity: 1 }
          : {
              clipPath: "inset(0 0 100% 0)",
              opacity: 0.25,
              y: -28,
            }
      }
      animate={{
        clipPath: "inset(0 0 0% 0)",
        opacity: 1,
        y: 0,
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
      {!shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-accent/30 via-accent/10 to-transparent"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "500%", opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </motion.div>
  )
}
