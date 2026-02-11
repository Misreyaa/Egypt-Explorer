import React, { useState, Suspense, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { SignUpWrapper } from './components/SignUpWrapper';
import { SignInPage } from './components/SignInPage';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { LocalHomePage } from './components/LocalHomePage';
import { RecommendationsPage } from './components/RecommendationsPage';
import { LessonsPage } from './components/LessonsPage';
import { BiasPage } from './components/BiasPage';
import { LLMPage } from './components/LLMPage';
import { EgyRealPage } from './components/EgyRealPage';
import { HelpPage } from './components/HelpPage';
import { UserProfilePage } from './components/UserProfilePage';
import { ComfortZonePage } from './components/ComfortZonePage';
import { WishlistPage } from './components/WishlistPage';
import { LessonDetailPage } from './components/LessonDetailPage';
import { LessonItem } from './components/LessonsPage';
import { LocalBlogPage } from './components/LocalBlogPage';
import { HiddenGemForm } from './components/HiddenGemForm';
import { NotificationsPage } from './components/NotificationsPage';
import { LocalRulesPopup } from './components/LocalRulesPopup';
import { MatchWithLocalPage } from './components/MatchWithLocalPage';
import { BiasPromoBubble } from './components/BiasPromoBubble';
import { Toaster } from 'sonner';

function AppContent() {
  const { user } = useUser();
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [showLocalRules, setShowLocalRules] = useState(false);

  useEffect(() => {
    // Show local rules popup if user is local and hasn't seen it
    if (user?.userType === 'local' && !(user.profile as any).hasSeenRules) {
      setShowLocalRules(true);
    }
  }, [user]);

  const handlePageChange = (page: string) => {
    if (page === currentPage) return;
    setCurrentPage(page);
  };

  if (!user) {
    if (showSignUp) {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>}>
          <SignUpWrapper onComplete={() => setShowSignUp(false)} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>}>
        <SignInPage onSignUpClick={() => setShowSignUp(true)} />
      </Suspense>
    );
  }

  const handleStartLesson = (lesson: LessonItem) => {
    setSelectedLesson(lesson);
    handlePageChange('lesson-detail');
  };

  const renderPage = () => {
    // For locals, return local home page
    if (user.userType === 'local' && currentPage === 'home') {
      return <LocalHomePage onNavigate={handlePageChange} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handlePageChange} />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'lessons':
        return <LessonsPage onStartLesson={handleStartLesson} />;
      case 'lesson-detail':
        return selectedLesson ? (
          <LessonDetailPage lesson={selectedLesson} onBack={() => handlePageChange('lessons')} />
        ) : (
          <LessonsPage onStartLesson={handleStartLesson} />
        );
      case 'bias':
        return <BiasPage />;
      case 'llm':
        return <LLMPage />;
      case 'egyreal':
        return <EgyRealPage />;
      case 'help':
        return <HelpPage />;
      case 'wishlist':
        return <WishlistPage onNavigate={handlePageChange} />;
      case 'profile':
        return <UserProfilePage onNavigate={handlePageChange} />;
      case 'comfort-zone':
        return <ComfortZonePage />;
      case 'local-blog':
        return <LocalBlogPage />;
      case 'hidden-gem':
        return <HiddenGemForm />;
      case 'notifications':
        return <NotificationsPage />;
      case 'earnings':
        return <UserProfilePage onNavigate={handlePageChange} />;
      case 'match-local':
        return <MatchWithLocalPage />;
      default:
        return user.userType === 'local' 
          ? <LocalHomePage onNavigate={handlePageChange} />
          : <HomePage onNavigate={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onNavigate={handlePageChange} />
      <main>
        <Suspense fallback={<div className="container mx-auto py-12 px-4">Loading page...</div>}>
          {renderPage()}
        </Suspense>
      </main>
      <BiasPromoBubble currentPage={currentPage} onNavigate={handlePageChange} />
      <Toaster position="top-center" expand={false} richColors />
      {showLocalRules && <LocalRulesPopup open={showLocalRules} onClose={() => setShowLocalRules(false)} />}
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