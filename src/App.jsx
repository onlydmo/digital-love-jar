import React, { useState, useEffect } from 'react';
// Helper for robust lazy loading (reloads on chunk failure)

const lazyWithRetry = (componentImport) => {
  return React.lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("[App] Chunk load failed. Force reloading...", error);
      window.location.reload();
      return { default: () => null }; // Fallback while reloading
    }
  });
};

const LoveJar = lazyWithRetry(() => import('./components/LoveJar'));
const AdminDashboard = lazyWithRetry(() => import('./components/AdminDashboard'));
const JourneyPage = lazyWithRetry(() => import('./components/JourneyPage'));
const SettingsPage = lazyWithRetry(() => import('./components/SettingsPage'));
const ProfilePage = lazyWithRetry(() => import('./components/ProfilePage'));

import LoginPage from './components/LoginPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { JarProvider } from './context/JarContext';
import ErrorBoundary from './components/ErrorBoundary';
import { supabase } from './lib/supabase';
import NavigationBar from './components/NavigationBar';
import SkeletonLoader from './components/ui/SkeletonLoader';


import { TutorialProvider, useTutorial } from './context/TutorialContext';
import { useJar } from './context/JarContext';
import TutorialOverlay from './components/TutorialOverlay';
import { themes } from './lib/themes';

const AppContent = () => {
  const { couple, loading } = useAuth();
  const { notes } = useJar();
  const { addToast } = useToast();
  const { startTutorial } = useTutorial();
  const [currentView, setCurrentView] = useState('jar');
  const [viewMode, setViewMode] = useState('jar'); // JAR or GRID view for the 'jar' layout

  // Check for New User Onboarding
  useEffect(() => {
    if (couple && localStorage.getItem('love_jar_newly_created')) {
      addToast(
        "Welcome! You can change your Secret Code anytime in Settings -> Profile.",
        'info',
        7000,
        'bottom-right'
      );
      localStorage.removeItem('love_jar_newly_created');

      // Start the very first tutorial
      startTutorial('jar_intro');
    }
  }, [couple, addToast, startTutorial]);

  // Handle hash changes & Tutorials
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['jar', 'journey', 'admin', 'studio', 'settings', 'profile'].includes(hash)) {
        setCurrentView(hash);
        // Trigger Tutorial for this view
        startTutorial(`${hash}_intro`);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [startTutorial]);

  // Push Notifications Logic
  useEffect(() => {
    if (!couple) return;

    // 1. Request Permission if default (User asked for proactive prompt)
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        addToast(
          "Don't miss a beat! 💌 Enable notifications in Settings to know when a new memory arrives.",
          'info',
          8000
        );
      }, 5000); // 5s delay so it doesn't overwhelm immediately
      return () => clearTimeout(timer);
    }

    // 2. Realtime Listener
    let channel;
    try {
      channel = supabase.channel('public:notes_notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes', filter: `couple_id=eq.${couple.id}` }, (payload) => {
          // Check if WE sent it (debounce check)
          const lastSent = parseInt(localStorage.getItem('love_jar_last_sent') || '0');
          const timeSinceSend = Date.now() - lastSent;

          // If we sent a message < 5 seconds ago, assume this INSERT is ours and ignore
          if (timeSinceSend < 5000) {
            console.log("[App] Notification suppressed (Self-sent)");
            return;
          }

          // Otherwise, it's a new note from partner!
          const note = payload.new;
          console.log("[App] New Note Received!", note);

          // Trigger System Notification
          if (Notification.permission === 'granted') {
            new Notification("New Memory in the Jar! 💌", {
              body: "Someone left a note for you... Tap to see.",
              icon: '/icon.png',
              badge: '/icon.png'
            });
          } else {
            // Fallback to in-app toast
            addToast("New Memory Received! 💌", 'success');
          }
        })
        .subscribe();
    } catch (err) {
      console.warn("[App] Realtime notification listener failed (WebSocket unavailable). Notifications will not be live.", err);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };

  }, [couple, addToast]);

  // Import supabase for the effect above (it was missing in file)
  // Wait, I need to check if supabase is imported. It wasn't in the snippet.
  // I will assume I need to add it to imports or use it from context if available.
  // Actually, App.jsx doesn't import supabase. I need to fix that first or assume it's global? No, imports are explicit.
  // I see 'import { supabase } from '../lib/supabase';' in AdminDashboard, but not App.jsx.
  // I must add the import.

  const handleViewChange = (view) => {
    window.location.hash = view;
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background-dark text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">favorite</span>
          <span className="text-sm font-bold tracking-widest opacity-50">LOADING LOVE...</span>
        </div>
      </div>
    );
  }

  if (!couple) {
    return <LoginPage />;
  }

  // Determine global theme class based on couple data
  const ambienceClass = couple?.ambience ? `theme-${couple.ambience}` : 'theme-night';

  console.log('[App] Current Couple:', couple);
  console.log('[App] Ambience Class:', ambienceClass);

  const avatarUrl = couple?.partner_1_avatar || couple?.partner_2_avatar;

  return (
    <div className={`font-sans antialiased bg-background-dark min-h-screen text-white pb-20 ${ambienceClass}`}>

      {/* Unified Global Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 md:px-12 md:py-8 flex items-center justify-between bg-gradient-to-b from-background-dark/80 to-transparent backdrop-blur-sm">
        {/* Left: Logo & Counter */}
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
          </div>
          <div>
            <h1 className="font-bold text-lg md:text-xl tracking-tight leading-none">The Love Jar</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-[10px] md:text-xs text-secondary uppercase tracking-[0.2em] font-black">
                {notes?.length || 0} Memories
              </p>
              {currentView === 'jar' && (
                <button
                  onClick={() => setViewMode(viewMode === 'jar' ? 'grid' : 'jar')}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-tighter"
                >
                  <span className="material-symbols-outlined text-[12px]">{viewMode === 'jar' ? 'grid_view' : 'close_fullscreen'}</span>
                  {viewMode === 'jar' ? 'Grid' : 'Jar'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 shadow-lg"
            onClick={() => handleViewChange('settings')}
            title="Settings"
          >
            <span className="material-symbols-outlined text-white/70 text-xl">settings</span>
          </button>

          <button
            className="h-11 w-11 rounded-full border-2 border-primary/30 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-md shadow-xl hover:scale-105 transition-transform"
            onClick={() => handleViewChange('profile')}
            title="Profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white/70">person</span>
            )}
          </button>
        </div>
      </header>

      <div className="pt-24 md:pt-32">
        <React.Suspense fallback={
          <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="h-10 w-48 bg-white/10 rounded-xl mb-4"></div>
            <SkeletonLoader type={currentView === 'jar' ? 'note' : 'card'} count={currentView === 'jar' ? 6 : 3} />
          </div>
        }>
          {currentView === 'jar' && <LoveJar viewMode={viewMode} setViewMode={setViewMode} />}
          {currentView === 'journey' && <JourneyPage />}
          {currentView === 'admin' && <AdminDashboard />}
          {currentView === 'studio' && <AdminDashboard initialTab="create" />}
          {currentView === 'settings' && <SettingsPage />}
          {currentView === 'profile' && <ProfilePage />}
        </React.Suspense>
      </div>

      <NavigationBar currentView={currentView} onViewChange={handleViewChange} />

      {/* Tutorial Overlay */}
      <TutorialOverlay />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <TutorialProvider>
            <JarProvider>
              <AppContent />
            </JarProvider>
          </TutorialProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
