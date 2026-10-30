import { useCallback, useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

type HeroIntroStage = "heading" | "description" | "actions"

export function useHeroIntroSequence() {
  const shouldReduceMotion = useReducedMotion()
  const [stage, setStage] = useState<HeroIntroStage>("heading")

  const revealDescription = useCallback(() => {
    setStage("description")
  }, [])

  const revealActions = useCallback(() => {
    setStage((current) => (current === "description" ? "actions" : current))
  }, [])

  useEffect(() => {
    if (shouldReduceMotion) setStage("actions")
  }, [shouldReduceMotion])

  return {
    shouldReduceMotion,
    revealDescription,
    revealActions,
    descriptionVisible: stage !== "heading",
    actionsVisible: stage === "actions",
    transition: shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }
}
