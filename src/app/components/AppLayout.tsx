import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { SideShelfMenu } from './SideShelfMenu';
import { Toaster } from 'sonner';
import { SidebarSimple, X } from '@phosphor-icons/react';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[60] w-full border-b border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="px-8 md:px-16 max-w-6xl mx-auto">
          <div className="flex h-20 items-center justify-between gap-4">

            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              aria-label="Return to home"
            >
              <img
                src="https://pink-quick-lizard-297.mypinata.cloud/ipfs/bafkreigbfdftxo3is42qjhskodw2llxngscv2rvjygdajx3m5ryxckfgwi"
                alt="ALANA Logo"
                className="h-[28px] w-auto max-w-[140px] object-contain"
              />
            </button>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Hamburger — all screen sizes */}
              <button
                className="flex items-center justify-center w-10 h-10 text-foreground hover:text-accent transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X size={22} /> : <SidebarSimple size={22} mirrored />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Side Shelf Menu ──────────────────────────────────────────────── */}
      <SideShelfMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentPath={location.pathname}
      />

      {/* ── Page Content ────────────────────────────────────────────────── */}
      <main role="main" className="flex-1 flex flex-col">
        <Outlet />
      </main>

{/* ── Toast Notifications ─────────────────────────────────────────── */}
      <Toaster />
    </div>
  );
}
