import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export const SessionManager = () => {
  useSessionTimeout();
  return null; // This component only handles session logic
};