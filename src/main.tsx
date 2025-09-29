import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) || '';

if (!clerkPubKey) {
  // Fail fast to help diagnose missing env
  // eslint-disable-next-line no-console
  console.error('Missing VITE_CLERK_PUBLISHABLE_KEY in environment');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
