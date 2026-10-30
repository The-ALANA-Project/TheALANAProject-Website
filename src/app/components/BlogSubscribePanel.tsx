import { Button } from "./ui/button"
import { optimizedImageUrl } from "../utils/image"

const PARAGRAPH_SUBSCRIBE_URL =
  "https://paragraph.com/@the-alana-project/subscribe"

export function openParagraphSubscription() {
  const subscriptionWindow = window.open(
    PARAGRAPH_SUBSCRIBE_URL,
    "_blank",
    "noopener,noreferrer",
  )
  if (subscriptionWindow) subscriptionWindow.opener = null
}

export function BlogSubscribePanel() {
  const starryBackground =
    "https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafybeido2glqw574c5kxquhgythghbnchqibzbvvr6exxshlfve5ldsnd4"

  return (
    <aside className="group relative min-h-[35vh] w-full overflow-hidden bg-accent">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url(${optimizedImageUrl(starryBackground, 1920)})`,
          mixBlendMode: "luminosity",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[35vh] items-center justify-center px-8 md:px-16">
        <div className="max-w-2xl space-y-4 text-center">
          <div
            role="heading"
            aria-level={2}
            className="font-mono text-[28px] font-medium text-[#F3F3F3] md:text-[36px]"
          >
            Subscribe to ALANA&apos;s Blog
          </div>
          <p className="text-base leading-relaxed text-[#F3F3F3]/90 md:text-lg">
            Receive new stories, project updates, and perspectives from The
            ALANA Project community.
          </p>

          <Button
            type="button"
            size="lg"
            onClick={openParagraphSubscription}
            className="h-11 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-white/30 bg-white/5 px-6 text-white backdrop-blur-sm hover:border-accent hover:bg-white/5 hover:text-accent"
          >
            Subscribe on Paragraph
          </Button>
        </div>
      </div>
    </aside>
  )
}
