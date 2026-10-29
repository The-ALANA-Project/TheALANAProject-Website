import { RouterProvider } from 'react-router';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IconContext } from '@phosphor-icons/react';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { wagmiConfig } from './config/web3';

const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <IconContext.Provider value={{ weight: 'fill' }}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </IconContext.Provider>
    </HelmetProvider>
  );
}
