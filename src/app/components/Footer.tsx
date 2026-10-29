import { useNavigate } from 'react-router';
import { siteConfig } from '../config/site';

export function Footer() {
  const navigate = useNavigate();
  const { legalEntityName, copyrightYear, footerLinks } = siteConfig;

  return (
    <footer className="flex border-t border-foreground">
      <div className="w-full max-w-6xl mx-auto px-8 md:px-16 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <nav className="flex items-center gap-6" aria-label="Legal navigation">
          {footerLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              className="text-[13px] text-muted-foreground font-mono hover:text-foreground transition-colors leading-none"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <span className="text-[13px] text-muted-foreground font-mono leading-none">
          © {copyrightYear} {legalEntityName}
        </span>
      </div>
    </footer>
  );
}
