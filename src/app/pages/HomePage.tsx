import { useNavigate } from 'react-router';
import { SpaceGradient } from '../components/SpaceGradient';
import { Footer } from '../components/Footer';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 w-full flex flex-col">
        <div className="relative flex-1 overflow-hidden">
          <SpaceGradient />

          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl mx-auto px-8 md:px-16 w-full pt-[150px]">
              <div className="space-y-8 max-w-3xl">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-medium text-white text-left">
                    We empower Creators by guiding them into a world of novel technologies.
                  </h1>
                  <p className="text-lg md:text-xl text-left max-w-2xl font-normal text-[#F3F3F3]/90">
                    We invite you on a journey outside the ordinary with the support of the ALANA community.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-start items-start">
                  <button
                    onClick={() => navigate('/knowledge-hub')}
                    className="inline-flex items-center justify-center px-6 h-11 font-sans text-sm font-medium bg-accent text-[#262424] backdrop-blur-sm border border-accent shadow-lg rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-[#262424] hover:text-accent hover:border-accent"
                  >
                    Visit the Knowledge HUB
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center justify-center px-6 h-11 font-sans text-sm font-medium text-white bg-white/5 backdrop-blur-sm border border-white/30 rounded-tl-[4px] rounded-tr-none rounded-br-[24px] rounded-bl-[4px] transition-all duration-300 hover:bg-white/5 hover:border-accent hover:text-accent"
                  >
                    Explore Our Products
                  </button>
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
