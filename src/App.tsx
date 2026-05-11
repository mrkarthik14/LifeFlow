import { useState, useEffect } from 'react';
import { Shell } from './components/layout/Shell';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { TimerView } from './views/TimerView';
import { ReviewView } from './views/ReviewView';
import { NotesView } from './views/NotesView';
import { LoginView } from './views/LoginView';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center font-bold text-[var(--on-surface)]">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2674&auto=format&fit=crop')] bg-cover bg-center">
        <div className="min-h-screen bg-[var(--surface)]/80 backdrop-blur-3xl flex items-center justify-center p-4">
           <LoginView onLoginSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <Shell activeView={activeView} setActiveView={setActiveView} user={user}>
      {activeView === 'dashboard' && <DashboardView setActiveView={setActiveView} />}
      {activeView === 'tasks' && <TasksView />}
      {activeView === 'timer' && <TimerView setActiveView={setActiveView} />}
      {activeView === 'review' && <ReviewView />}
      {activeView === 'notes' && <NotesView />}
    </Shell>
  );
}

