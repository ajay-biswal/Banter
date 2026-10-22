import { useState } from 'react';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';

type AuthScreen = 'login' | 'signup';

export default function AppRoot() {
  const [screen, setScreen] = useState<AuthScreen>('login');

  if (screen === 'signup') {
    return <SignupScreen onSignIn={() => setScreen('login')} />;
  }

  return <LoginScreen onCreateAccount={() => setScreen('signup')} />;
}