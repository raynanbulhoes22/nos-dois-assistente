import { useState, useEffect } from 'react';

interface User {
  id: string;
  email?: string;
}

export const useWelcomeModal = (user: User | null) => {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const hasSeenWelcome = localStorage.getItem(`dashboard_welcome_shown_${user.email}`);
      if (!hasSeenWelcome) {
        setShouldShowWelcome(true);
      }
    }
  }, [user?.email]);

  const markWelcomeAsSeen = () => {
    if (user?.email) {
      localStorage.setItem(`dashboard_welcome_shown_${user.email}`, 'true');
      setShouldShowWelcome(false);
    }
  };

  return {
    shouldShowWelcome,
    markWelcomeAsSeen
  };
};