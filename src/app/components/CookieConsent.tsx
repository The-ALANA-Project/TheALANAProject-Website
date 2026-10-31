import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Button } from "./ui/button"
import { HOME_INTRO_COMPLETE_EVENT } from "../config/events"
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  sendAnalyticsPageView,
} from "../utils/analytics"

type ConsentChoice = "accepted" | "declined"

export function CookieConsent() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const [needsConsent, setNeedsConsent] = useState(() => {
    try {
      return localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === null
    } catch {
      return true
    }
  })
  const [introComplete, setIntroComplete] = useState(location.pathname !== "/")

  useEffect(() => {
    if (location.pathname !== "/") {
      setIntroComplete(true)
      return
    }

    setIntroComplete(false)
    const handleIntroComplete = () => setIntroComplete(true)
    window.addEventListener(HOME_INTRO_COMPLETE_EVENT, handleIntroComplete)
    return () =>
      window.removeEventListener(HOME_INTRO_COMPLETE_EVENT, handleIntroComplete)
  }, [location.pathname])

  const saveChoice = (choice: ConsentChoice) => {
    try {
      localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice)
    } catch {
      // Consent still applies for the current page when storage is unavailable.
    }

    const granted = choice === "accepted"
    window.gtag?.("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    })

    if (granted) {
      sendAnalyticsPageView()
    }

    setNeedsConsent(false)
  }

  return (
    <AnimatePresence>
      {needsConsent && (introComplete || shouldReduceMotion) && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-6xl px-4 md:px-16"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          initial={
            shouldReduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0.8 }
          }
          animate={{ y: 0, opacity: 1 }}
          exit={
            shouldReduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0.8 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 280, damping: 30 }
          }
        >
          <div className="rounded-t-[24px] border border-foreground/20 bg-background/95 px-6 py-6 shadow-2xl backdrop-blur-2xl md:px-10 md:py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Your privacy
                </p>
                <div
                  id="cookie-consent-title"
                  role="heading"
                  aria-level={2}
                  className="mb-2 font-sans text-xl font-medium md:text-2xl"
                >
                  Help us improve The ALANA Project
                </div>
                <p
                  id="cookie-consent-description"
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  We use Google Analytics cookies to understand how the website
                  is used. Analytics is optional, advertising storage stays
                  disabled, and you can read more in our{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row md:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => saveChoice("declined")}
                  className="h-11 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border-foreground px-6"
                >
                  Decline
                </Button>
                <Button
                  size="lg"
                  onClick={() => saveChoice("accepted")}
                  className="h-11 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 text-accent-foreground hover:bg-foreground hover:text-accent"
                >
                  Accept Analytics
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
