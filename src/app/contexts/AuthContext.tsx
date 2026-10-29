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
  // Dev-only override: set non-null to force a role, null to use on-chain result.
  devRoleOverride: UserRole | null;
  setDevRoleOverride: (role: UserRole | null) => void;
  // Dev-only: bypass wallet connection entirely
  devModeEnabled: boolean;
  setDevModeEnabled: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV_OVERRIDE_KEY = 'alana-dev-role-override';
const DEV_MODE_KEY = 'alana-dev-mode-enabled';
const DEV_MOCK_ADDRESS = '0x1234567890123456789012345678901234567890' as `0x${string}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address: walletAddress, isConnected: walletConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [devRoleOverride, setDevRoleOverrideState] = useState<UserRole | null>(null);
  const [devModeEnabled, setDevModeEnabledState] = useState(false);
  const [guardianSessionStatus, setGuardianSessionStatus] =
    useState<AuthContextType['guardianSessionStatus']>('idle');
  const [guardianSessionError, setGuardianSessionError] = useState<string | null>(null);
  const autoAuthorizationAttempt = useRef<string | null>(null);

  // Use dev mode values if enabled in dev environment
  const address = (import.meta.env.DEV && devModeEnabled) ? DEV_MOCK_ADDRESS : walletAddress;
  const isConnected = (import.meta.env.DEV && devModeEnabled) ? true : walletConnected;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const savedRole = localStorage.getItem(DEV_OVERRIDE_KEY) as UserRole | null;
    if (savedRole && ['visitor', 'apprentice', 'specialist', 'guardian'].includes(savedRole)) {
      setDevRoleOverrideState(savedRole);
    }
    const savedDevMode = localStorage.getItem(DEV_MODE_KEY) === 'true';
    setDevModeEnabledState(savedDevMode);
  }, []);

  const setDevRoleOverride = (newRole: UserRole | null) => {
    setDevRoleOverrideState(newRole);
    if (newRole) localStorage.setItem(DEV_OVERRIDE_KEY, newRole);
    else localStorage.removeItem(DEV_OVERRIDE_KEY);
  };

  const setDevModeEnabled = (enabled: boolean) => {
    setDevModeEnabledState(enabled);
    localStorage.setItem(DEV_MODE_KEY, String(enabled));
    // Auto-enable guardian role when dev mode is enabled
    if (enabled && !devRoleOverride) {
      setDevRoleOverride('guardian');
    }
  };

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

  const role: UserRole = devRoleOverride ?? onChainRole;
  const isAuthenticated = role !== 'visitor';
  const isLoading = isConnected && isReading && !devRoleOverride;

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
        devRoleOverride,
        setDevRoleOverride,
        devModeEnabled,
        setDevModeEnabled,
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
