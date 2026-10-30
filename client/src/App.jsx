import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { DesignSystemPage } from '@/pages/DesignSystemPage';
import { siteConfig } from '@/config/site';

/**
 * Root Application Component
 * Sets up routing, head metadata, and global shell
 * @returns {JSX.Element}
 */
export function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>
          {siteConfig.name} | {siteConfig.tagline}
        </title>
        <meta name="description" content={siteConfig.description} />
      </Helmet>
      <Routes>
        <Route path="/design-system" element={<DesignSystemPage />} />
        {/* Default route points to /design-system during foundation phase */}
        <Route path="/" element={<Navigate to="/design-system" replace />} />
        <Route path="*" element={<Navigate to="/design-system" replace />} />
      </Routes>
    </HelmetProvider>
  );
}

export default App;
