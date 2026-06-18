import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';

// 1. Grab the key from your environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// 2. Safety check: Crash gracefully if the key is missing from .env.local
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Check your .env.local file!")
}

// 3. Render the application cleanly
createRoot(document.getElementById('root')).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    signInForceRedirectUrl="/"
    signUpForceRedirectUrl="/"
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
)
