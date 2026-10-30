import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAccount, useReadContracts, useSignMessage } from 'wagmi';
import { optimism } from '@reown/appkit/networks';
import { NFT_CONTRACTS, unlockKeyAbi } from '../config/web3';
import {
  clearStoredGuardianSession,
  getStoredGuardianSession,
  requestGuardianNonce,
  storeGuardianSession,
  validateGuardianSession,
  verifyGuardianSignature,
} from '../services/guardianApi';

export type UserRole = 'visitor' | 'apprentice' | 'specialist' | 'guardian';

interface AuthContextType {
  role: UserRole;
  address: `0x${string}` | undefined;
  isAuthenticated: boolean;
  isConnected: boolean;
  isLoading: boolean;
  guardianSessionStatus: 'idle' | 'checking' | 'authorizing' | 'authorized' | 'error';
  guardianSessionError: string | null;
  authorizeGuardian: () => Promise<void>;
  clearGuardianAuthorization: () => void;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [guardianSessionStatus, setGuardianSessionStatus] =
    useState<AuthContextType['guardianSessionStatus']>('idle');
  const [guardianSessionError, setGuardianSessionError] = useState<string | null>(null);
  const autoAuthorizationAttempt = useRef<string | null>(null);

  const { data, isLoading: isReading } = useReadContracts({
    allowFailure: true,
    contracts: address
      ? [
          {
            address: NFT_CONTRACTS.guardian,
            abi: unlockKeyAbi,
            functionName: 'getHasValidKey',
            args: [address],
            chainId: optimism.id,
          },
          {
            address: NFT_CONTRACTS.specialist,
            abi: unlockKeyAbi,
            functionName: 'getHasValidKey',
            args: [address],
            chainId: optimism.id,
          },
          {
            address: NFT_CONTRACTS.apprentice,
            abi: unlockKeyAbi,
            functionName: 'getHasValidKey',
            args: [address],
            chainId: optimism.id,
          },
        ]
      : [],
    query: { enabled: Boolean(address) },
  });

  let onChainRole: UserRole = 'visitor';
  if (address && data) {
    const [guardian, specialist, apprentice] = data;
    if (guardian?.status === 'success' && guardian.result === true) onChainRole = 'guardian';
    else if (specialist?.status === 'success' && specialist.result === true) onChainRole = 'specialist';
    else if (apprentice?.status === 'success' && apprentice.result === true) onChainRole = 'apprentice';
  }

  const role: UserRole = onChainRole;
  const isAuthenticated = role !== 'visitor';
  const isLoading = isConnected && isReading;

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (Array.isArray(requiredRole)) return requiredRole.includes(role);
    const hierarchy: Record<UserRole, number> = {
      visitor: 0,
      apprentice: 1,
      specialist: 2,
      guardian: 3,
    };
    return hierarchy[role] >= hierarchy[requiredRole];
  };

  const clearGuardianAuthorization = () => {
    clearStoredGuardianSession();
    setGuardianSessionStatus('idle');
    setGuardianSessionError(null);
  };

  useEffect(() => {
    const stored = getStoredGuardianSession();
    if (!address || !stored || stored.walletAddress.toLowerCase() !== address.toLowerCase()) {
      if (stored) clearStoredGuardianSession();
      setGuardianSessionStatus('idle');
      return;
    }

    let cancelled = false;
    setGuardianSessionStatus('checking');
    validateGuardianSession()
      .then(() => {
        if (!cancelled) setGuardianSessionStatus('authorized');
      })
      .catch((error) => {
        if (!cancelled) {
          clearStoredGuardianSession();
          setGuardianSessionStatus('error');
          setGuardianSessionError(error instanceof Error ? error.message : 'Guardian session expired');
        }
      });
    return () => { cancelled = true; };
  }, [address]);

  useEffect(() => {
    const handleSessionCleared = () => {
      setGuardianSessionStatus('idle');
      setGuardianSessionError('Guardian authorization expired. Please sign in again.');
    };
    window.addEventListener('alana-guardian-session-cleared', handleSessionCleared);
    return () => window.removeEventListener('alana-guardian-session-cleared', handleSessionCleared);
  }, []);

  const authorizeGuardian = useCallback(async () => {
    if (!address || onChainRole !== 'guardian') {
      throw new Error('An active Nucleus Guardian membership is required');
    }

    setGuardianSessionStatus('authorizing');
    setGuardianSessionError(null);
    try {
      const { message } = await requestGuardianNonce(address);
      const signature = await signMessageAsync({ message });
      const session = await verifyGuardianSignature({
        walletAddress: address,
        message,
        signature,
      });
      storeGuardianSession(session);
      setGuardianSessionStatus('authorized');
    } catch (error) {
      clearStoredGuardianSession();
      const message = error instanceof Error ? error.message : 'Guardian authorization failed';
      setGuardianSessionStatus('error');
      setGuardianSessionError(message);
      throw error;
    }
  }, [address, onChainRole, signMessageAsync]);

  useEffect(() => {
    if (!address || onChainRole !== 'guardian') {
      autoAuthorizationAttempt.current = null;
      return;
    }
    if (
      guardianSessionStatus !== 'idle' ||
      autoAuthorizationAttempt.current === address
    ) {
      return;
    }

    autoAuthorizationAttempt.current = address;
    authorizeGuardian().catch(() => undefined);
  }, [address, authorizeGuardian, guardianSessionStatus, onChainRole]);

  return (
    <AuthContext.Provider
      value={{
        role,
        address,
        isAuthenticated,
        isConnected,
        isLoading,
        guardianSessionStatus,
        guardianSessionError,
        authorizeGuardian,
        clearGuardianAuthorization,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
