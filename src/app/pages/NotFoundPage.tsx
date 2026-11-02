import { Link } from 'react-router';
import { Footer } from '../components/Footer';
import { Seo } from '../components/Seo';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page Not Found"
        description="The page you requested could not be found."
        noIndex
      />
      <div className="flex min-h-[70vh] flex-1 items-center justify-center px-8 py-16">
        <div className="max-w-xl space-y-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Error 404
          </p>
          <div
            role="heading"
            aria-level={1}
            className="font-sans text-4xl font-medium tracking-tight md:text-6xl"
          >
            This page is outside the known universe.
          </div>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            The link may be outdated, or the page may have moved.
          </p>
          <Button
            asChild
            size="lg"
            className="h-11 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 text-accent-foreground hover:bg-foreground hover:text-accent"
          >
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
