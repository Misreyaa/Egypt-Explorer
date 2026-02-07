import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { SignUpPage } from './components/SignUpPage';
import { SignInPage } from './components/SignInPage';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { StreetsPage } from './components/StreetsPage';
import { LessonsPage } from './components/LessonsPage';
import { BiasPage } from './components/BiasPage';
import { LLMPage } from './components/LLMPage';
import { EgyRealPage } from './components/EgyRealPage';
import { HelpPage } from './components/HelpPage';

function AppContent() {
  const { user } = useUser();
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  if (!user) {
    if (showSignUp) {
      return <SignUpPage onComplete={() => setShowSignUp(false)} />;
    }
    return <SignInPage onSignUpClick={() => setShowSignUp(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'streets':
        return <StreetsPage />;
      case 'lessons':
        return <LessonsPage />;
      case 'bias':
        return <BiasPage />;
      case 'llm':
        return <LLMPage />;
      case 'egyreal':
        return <EgyRealPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
