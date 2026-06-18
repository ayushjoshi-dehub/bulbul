import { WallpaperProvider } from "./context/WallpaperContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Navigate, Route, Routes } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";

import { useAuth } from "@clerk/clerk-react";

import PageLoader from "./components/PageLoader";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import { setTokenGetter } from "./lib/axios";

import { Toaster } from "react-hot-toast";

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [clerkTimedOut, setClerkTimedOut] = useState(false);

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  // ✅ FIX: prevent duplicate calls (IMPORTANT)
  const initializedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isLoaded) {
        setClerkTimedOut(true);
      }
    }, 12000);

    if (!isLoaded) {
      return () => window.clearTimeout(timer);
    }

    const initAuth = async () => {
      if (isSignedIn) {
        setTokenGetter(getToken);

        // ❗ prevent duplicate socket/auth calls
        if (!initializedRef.current) {
          initializedRef.current = true;
          await checkAuth();
        }
      } else {
        initializedRef.current = false; // reset on logout
        clearAuth();
      }
    };

    initAuth();

    return () => window.clearTimeout(timer);
  }, [checkAuth, clearAuth, isLoaded, isSignedIn, getToken]);

  if (clerkTimedOut) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
          <p className="text-lg font-semibold">Clerk is taking too long to load</p>
          <p className="mt-2 text-sm text-muted">
            This usually means the Clerk script was blocked, the network is unavailable, or a browser
            extension interfered with auth bootstrap.
          </p>
          <button
            type="button"
            className="mt-5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded || (isSignedIn && isCheckingAuth)) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route
            path="/"
            element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/auth"
            element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />}
          />
        </Routes>

        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
