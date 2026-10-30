import { useNavigate } from 'react-router';
import { SpaceGradient } from '../components/SpaceGradient';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-1 flex-col">
      {/* Hero */}
      <section className="flex w-full flex-1 flex-col">
        <div className="relative flex min-h-[36rem] flex-1 overflow-hidden sm:min-h-[32rem]">
          <SpaceGradient />

          <div className="relative z-10 flex w-full items-center py-16">
            <div className="mx-auto w-full max-w-6xl px-8 md:px-16">
              <div className="mx-auto flex max-w-3xl flex-col items-center space-y-8 sm:mx-0 sm:items-start">
                <div className="space-y-4">
                  <h1 className="text-center font-medium text-white sm:text-left">
                    We empower Creators by guiding them into a world of novel technologies.
                  </h1>
                  <p className="mx-auto max-w-2xl text-center text-lg font-normal text-background/90 sm:mx-0 sm:text-left md:text-xl">
                    We invite you on a journey outside the ordinary with the support of the ALANA community.
                  </p>
                </div>

                <div className="flex w-full max-w-sm flex-col items-stretch justify-start gap-4 sm:max-w-none sm:flex-row sm:items-start">
                  <Button
                    onClick={() => navigate('/knowledge-hub')}
                    className="h-11 w-full rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-accent bg-accent px-6 font-sans text-sm font-medium text-accent-foreground shadow-lg backdrop-blur-sm hover:border-accent hover:bg-foreground hover:text-accent sm:w-auto"
                  >
                    Visit the Knowledge HUB
                  </Button>
                  <Button
                    onClick={() => navigate('/products')}
                    className="h-11 w-full rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] border border-background/30 bg-background/5 px-6 font-sans text-sm font-medium text-background backdrop-blur-sm hover:border-accent hover:bg-background/5 hover:text-accent sm:w-auto"
                  >
                    Explore Our Products
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
