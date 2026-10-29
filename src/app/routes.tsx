import { createBrowserRouter } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { BlogArticlePage } from './pages/BlogArticlePage';
import { KnowledgeHubPage } from './pages/KnowledgeHubPage';
import { CommunityPage } from './pages/CommunityPage';
import { ProductsPage } from './pages/ProductsPage';
import { WhitepaperPage } from './pages/WhitepaperPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PressKitPage } from './pages/PressKitPage';
import { AdminPage } from './pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      // ── Main Pages ──────────────────────────────────────────────────────
      { index: true,              Component: HomePage },
      { path: 'about',            Component: AboutPage },
      { path: 'blog',             Component: BlogPage },
      { path: 'blog/:slug',       Component: BlogArticlePage },
      { path: 'knowledge-hub',    Component: KnowledgeHubPage },
      { path: 'community',        Component: CommunityPage },
      { path: 'products',         Component: ProductsPage },
      { path: 'whitepaper',       Component: WhitepaperPage },

      // ── Legal / Footer Pages ─────────────────────────────────────────
      { path: 'terms',            Component: TermsPage },
      { path: 'privacy',          Component: PrivacyPage },
      { path: 'press-kit',        Component: PressKitPage },

      // ── Admin ────────────────────────────────────────────────────────
      { path: 'admin',            Component: AdminPage },

      // ── Fallback ─────────────────────────────────────────────────────
      { path: '*',                Component: HomePage },
    ],
  },
]);
