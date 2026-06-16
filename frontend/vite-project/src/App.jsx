import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
// 1. Swapped 'Show' for 'SignedIn' and 'SignedOut'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { Button } from '@heroui/react';
function App() {
  return (
    <div>
      <h1>BulBul</h1>
       <Button>
      My Button
    </Button>

      <header>
        {/* 2. Used SignedOut for logged-out users */}
        
        <SignedOut>
          <SignInButton mode="modal"  />
          <SignUpButton mode="modal"/>
        </SignedOut>
        
        {/* 3. Used SignedIn for logged-in users */}
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>  
    </div>
  )
}

export default App