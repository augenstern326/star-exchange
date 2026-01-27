'use client';

import { useEffect, useState } from 'react';

export function DBInitializer() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const response = await fetch('/api/init', {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Database initialization failed');
        }

        console.log('[v0] Database initialized successfully');
        setInitialized(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[v0] Database initialization error:', message);
        setError(message);
        setInitialized(true); // Still mark as initialized to not block app
      }
    };

    initDB();
  }, []);

  if (error) {
    console.warn('[v0] Database initialization warning:', error);
  }

  return null;
}
