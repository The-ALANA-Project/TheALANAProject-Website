import { useEffect, useRef } from "react"
import { animate } from "animejs/animation"
import { scrambleText } from "animejs/text"
import { useReducedMotion } from "motion/react"

type HeroScrambleHeadingProps = {
  children: string
  className?: string
  onComplete?: () => void
}

export function HeroScrambleHeading({
  children,
  className,
  onComplete,
}: HeroScrambleHeadingProps) {
  const animatedTextRef = useRef<HTMLSpanElement>(null)
  const onCompleteRef = useRef(onComplete)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const animatedText = animatedTextRef.current

    if (!animatedText) {
      return
    }

    if (shouldReduceMotion) {
      onCompleteRef.current?.()
      return
    }

    const animation = animate(animatedText, {
      innerHTML: scrambleText({
        chars: "numbers",
        duration: 3000,
        ease: "out(2)",
        from: "left",
        override: "",
        perturbation: 0.12,
        seed: 24,
        settleRate: 24,
      }),
      onComplete: () => onCompleteRef.current?.(),
    })

    return () => {
      animation.cancel()
      animatedText.textContent = children
    }
  }, [children, shouldReduceMotion])

  return (
    <h1 className={className}>
      <span className="sr-only">{children}</span>
      <span className="relative block" aria-hidden="true">
        <span className="invisible">{children}</span>
        <span
          ref={animatedTextRef}
          className="absolute inset-0 overflow-hidden"
        >
          {children}
        </span>
      </span>
    </h1>
  )
}
