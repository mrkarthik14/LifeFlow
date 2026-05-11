import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Moon, Sun, Palette, LayoutDashboard, CheckSquare, Clock, Briefcase, MoonStar, Menu, X, CloudRain, Sun as SunIcon, Cloud, FileText, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface ShellProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  user?: any;
}

export function Shell({ children, activeView, setActiveView, user }: ShellProps) {
  const { mood, theme, setMood, setTheme, weatherLoaded, setWeatherLoaded, generateDailyRoutine, tasks, updateTask, weather, setWeather } = useStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMoodSelectorOpen, setMoodSelectorOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.setAttribute('data-mood', mood);
  }, [theme, mood]);

  useEffect(() => {
    // Generate today's routine
    generateDailyRoutine(format(new Date(), 'yyyy-MM-dd'));

    // Fetch weather based on location
    if (!weatherLoaded && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get city name
          let city = '';
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoRes.json();
            city = geoData.city || geoData.locality || '';
          } catch(e) {}

          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const data = await res.json();
          if (data && data.current_weather) {
            const code = data.current_weather.weathercode;
            const temp = Math.round(data.current_weather.temperature);
            let weatherMood: any = 'clear';
            let conditionStr = 'Clear';
            
            if (code <= 3) {
              weatherMood = code === 0 ? 'sunny' : 'cloudy';
              conditionStr = code === 0 ? 'Sunny' : 'Cloudy';
            }
            else if (code >= 50 && code <= 67) { weatherMood = 'rainy'; conditionStr = 'Rain'; }
            else if (code >= 71 && code <= 77) { weatherMood = 'relaxed'; conditionStr = 'Snow'; }
            else if (code >= 80 && code <= 82) { weatherMood = 'rainy'; conditionStr = 'Showers'; }
            else if (code >= 95) { weatherMood = 'stressed'; conditionStr = 'Storm'; }
            
            setWeather({ temp, condition: conditionStr, city });
            setMood(weatherMood);
            setWeatherLoaded(true);
          }
        } catch (error) {
          console.error("Error fetching weather:", error);
        }
      });
    }

    // Request Notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [weatherLoaded, generateDailyRoutine, setMood, setWeatherLoaded, setWeather]);

  // Task Alerts Check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const todayDate = format(now, 'yyyy-MM-dd');

      tasks.forEach(task => {
        if (!task.completed && !task.notified && task.date === todayDate && task.time === timeStr) {
          if (Notification.permission === 'granted') {
            new Notification('Task Reminder', {
              body: `It's time for: ${task.title}`
            });
          }
          updateTask(task.id, { notified: true });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, updateTask]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'review', label: 'Night Review', icon: MoonStar },
  ];

  const moods = ['productive', 'focused', 'calm', 'energetic', 'relaxed', 'stressed', 'sunny', 'rainy', 'cloudy', 'clear'] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-20 xl:w-64 bg-[var(--surface)] border-r border-[var(--border)]",
          "lg:static lg:block transform transition-transform duration-300 ease-in-out flex flex-col xl:items-stretch items-center py-6",
          isSidebarOpen ? "translate-x-0 w-64 items-stretch px-6" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("flex items-center gap-4 mb-10", !isSidebarOpen && "xl:px-6 px-0")}>
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--color-primary-500)]/30 flex-shrink-0">
            LF
          </div>
          <span className={cn("text-xl font-serif font-semibold text-[var(--on-surface)]", !isSidebarOpen && "xl:block hidden")}>LifeFlow</span>
        </div>
        <nav className="flex flex-col gap-4 xl:px-4 w-full px-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center xl:justify-start justify-center gap-3 p-3 rounded-2xl transition-all",
                activeView === item.id 
                  ? "bg-[var(--color-primary-50)] text-[var(--color-primary-600)] font-bold shadow-sm" 
                  : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)] font-medium"
              )}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className={cn(!isSidebarOpen && "xl:block hidden")}>{item.label}</span>
            </button>
          ))}
          
          <div className="mt-auto">
            {user && (
              <button
                onClick={() => auth && signOut(auth)}
                className="w-full flex items-center xl:justify-start justify-center gap-3 p-3 rounded-2xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium"
              >
                <LogOut className="w-6 h-6 flex-shrink-0" />
                <span className={cn(!isSidebarOpen && "xl:block hidden")}>Logout</span>
              </button>
            )}
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent z-30 mt-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-full bg-[var(--surface)] shadow-sm">
              <Menu className="w-5 h-5 text-[var(--on-surface)]" />
            </button>
            {weather && (
              <div className="hidden md:flex items-center gap-2 bg-[var(--surface)] px-4 py-1.5 rounded-full border border-[var(--border)] shadow-sm text-sm font-bold text-[var(--on-surface-variant)]">
                {weather.condition === 'Sunny' ? <SunIcon className="w-4 h-4 text-orange-500" /> : <Cloud className="w-4 h-4 text-blue-400" />}
                {weather.temp}°C {weather.city ? `• ${weather.city}` : ''}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 relative">
            <div className="hidden lg:flex bg-[var(--surface)] rounded-full p-1 border border-[var(--border)] shadow-sm mr-2">
              <button onClick={() => setMood('sunny')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1", mood === 'sunny' ? "bg-[var(--color-primary-500)] text-white shadow-sm" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]")}><SunIcon className="w-3 h-3"/> Sunny</button>
              <button onClick={() => setMood('rainy')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1", mood === 'rainy' ? "bg-[var(--color-primary-500)] text-white shadow-sm" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]")}><CloudRain className="w-3 h-3"/> Rainy</button>
              <button onClick={() => setMood('productive')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", mood === 'productive' ? "bg-[var(--color-primary-500)] text-white shadow-sm" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]")}>Productive</button>
            </div>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-full bg-[var(--surface)] shadow-sm border border-[var(--border)] hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)] transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setMoodSelectorOpen(!isMoodSelectorOpen)}
                className="p-2.5 rounded-full bg-[var(--surface)] shadow-sm border border-[var(--border)] hover:bg-[var(--surface-variant)] text-[var(--color-primary-500)] transition-colors"
              >
                <Palette className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {isMoodSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onClick={() => setMoodSelectorOpen(false)}
                    className="absolute right-0 mt-2 w-48 py-2 bg-[var(--surface)] border border-[var(--border)] shadow-xl rounded-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">Select Theme</div>
                    {moods.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={cn(
                          "w-full text-left px-4 py-2 flex items-center gap-2 text-sm capitalize transition-colors font-medium",
                          mood === m ? "bg-[var(--color-primary-50)] text-[var(--color-primary-600)]" : "text-[var(--on-surface)] hover:bg-[var(--surface-variant)]"
                        )}
                      >
                         {m}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
