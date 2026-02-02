import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface UseAuthOptions {
  requireAuth?: boolean;
  requireParent?: boolean;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    requireAuth = true,
    requireParent = false,
    redirectTo = '/login',
  } = options;

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    
    if (!userStr && requireAuth) {
      router.push(redirectTo);
      return;
    }

    if (userStr) {
      const userData = JSON.parse(userStr);
      
      if (requireParent && !userData.isParent) {
        router.push('/');
        return;
      }

      setUser(userData);
    }

    setLoading(false);
  }, [router, requireAuth, requireParent, redirectTo]);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, updateUser, logout };
}

