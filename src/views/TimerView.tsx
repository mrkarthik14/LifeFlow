import { useState, useEffect } from 'react';
import { Play, Pause, Square, Coffee, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

export function TimerView({ setActiveView }: { setActiveView?: (v: string) => void }) {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [customMinutes, setCustomMinutes] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const { setMood } = useStore();

  const times = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    custom: customMinutes * 60
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notification here
      if (Notification.permission === 'granted') {
        new Notification('Timer Complete!', { body: 'Time to switch tasks!' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }

      if (mode === 'pomodoro') {
        setSessionCount(c => c + 1);
        if ((sessionCount + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(times.longBreak);
          setMood('relaxed');
        } else {
          setMode('shortBreak');
          setTimeLeft(times.shortBreak);
          setMood('calm');
        }
      } else {
        setMode('pomodoro');
        setTimeLeft(times.pomodoro);
        setMood('focused');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessionCount, setMood]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive && mode === 'pomodoro') setMood('focused');
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(times[mode]);
  };

  const changeMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(times[newMode]);
    if (newMode === 'pomodoro') setMood('productive');
    else setMood('relaxed');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((times[mode] - timeLeft) / times[mode]) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
      {setActiveView && (
        <button 
          onClick={() => setActiveView('tasks')}
          className="absolute top-0 right-4 sm:right-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] text-[var(--on-surface-variant)] shadow-sm hover:bg-[var(--surface-variant)] hover:text-[var(--color-primary-600)] transition-all font-bold text-sm"
        >
          <CheckSquare className="w-4 h-4" /> Link to Tasks
        </button>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[var(--surface)]/60 backdrop-blur-md p-8 rounded-[3rem] border border-white dark:border-[var(--border)] shadow-xl shadow-[var(--color-primary-500)]/5 flex flex-col items-center"
      >
        <div className="flex bg-white dark:bg-[var(--surface-variant)] p-1.5 rounded-full mb-12 shadow-sm border border-[var(--border)] overflow-x-auto max-w-full hide-scrollbar">
          {(['pomodoro', 'shortBreak', 'longBreak', 'custom'] as const).map(m => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                mode === m 
                  ? "bg-[var(--color-primary-600)] text-white shadow-md" 
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              )}
            >
              {m.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center mb-12 group cursor-pointer" onClick={() => !isActive && setIsEditing(true)}>
          {/* Circular Progress SVG */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
            <circle cx="128" cy="128" r="120" className="stroke-[var(--border)]" strokeWidth="8" fill="none" />
            <motion.circle 
              cx="128" cy="128" r="120"
              className="stroke-[var(--color-primary-500)]"
              strokeWidth="12" fill="none"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>
          
          {isEditing && !isActive ? (
            <div className="flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
              <input 
                type="number" 
                value={customMinutes}
                onChange={e => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setCustomMinutes(val);
                  if (mode === 'custom') setTimeLeft(val * 60);
                }}
                onBlur={() => {
                   setIsEditing(false);
                   if (mode !== 'custom') changeMode('custom');
                   else setTimeLeft(customMinutes * 60);
                }}
                autoFocus
                className="w-24 text-4xl font-bold bg-transparent border-b-2 border-[var(--color-primary-500)] text-center outline-none text-[var(--on-surface)] tabular-nums"
                min="1"
              />
              <span className="text-xl font-bold text-[var(--on-surface-variant)]">min</span>
            </div>
          ) : (
            <div className="flex flex-col items-center z-10 transition-transform group-hover:scale-105">
              <div className="text-6xl font-bold text-[var(--on-surface)] tracking-tighter tabular-nums">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </div>
              {!isActive && <div className="text-[10px] font-bold uppercase text-[var(--color-primary-500)] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to Edit</div>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border border-[var(--border)] hover:bg-[var(--surface-variant)] transition-colors shadow-sm"
          >
            <Square className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] hover:scale-105 transition-all shadow-xl shadow-[var(--color-primary-500)]/30"
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--surface-variant)] text-[var(--color-primary-600)] font-bold text-lg border border-[var(--color-primary-100)] dark:border-[var(--border)] shadow-sm">
            {sessionCount}
          </div>
        </div>
      </motion.div>
      <p className="mt-8 text-[var(--on-surface-variant)] flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
        <Coffee className="w-4 h-4" /> Stay hydrated and blink often!
      </p>
    </div>
  );
}
