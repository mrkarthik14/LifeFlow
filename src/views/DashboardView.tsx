import { useStore } from '@/store/useStore';
import { format, subDays, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Flame, CheckCircle2, Clock, Calendar as CalendarIcon, Briefcase, Play, MoonStar, CheckSquare, Edit3, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatTimePrefix } from '@/lib/utils';

export function DashboardView({ setActiveView }: { setActiveView: (v: string) => void }) {
  const { tasks, jobs, mood, setEditingTaskId } = useStore();
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const tomorrowDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const yesterdayDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  
  const allTodaysTasks = tasks.filter(t => t.date === todayDate);
  const todaysTasks = allTodaysTasks.filter(t => !t.completed).sort((a,b) => {
    const orderA = a.orderIndex !== undefined ? a.orderIndex : new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const orderB = b.orderIndex !== undefined ? b.orderIndex : new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return orderA - orderB;
  });
  const completedTodayTasks = allTodaysTasks.filter(t => t.completed);
  
  const allYesterdaysTasks = tasks.filter(t => t.date === yesterdayDate);
  const yesterdayLeftover = allYesterdaysTasks.filter(t => !t.completed).sort((a,b) => {
    const orderA = a.orderIndex !== undefined ? a.orderIndex : new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const orderB = b.orderIndex !== undefined ? b.orderIndex : new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return orderA - orderB;
  });
  const yesterdayCompleted = allYesterdaysTasks.filter(t => t.completed);

  const tomorrowsTasks = tasks.filter(t => t.date === tomorrowDate).sort((a,b) => {
    const orderA = a.orderIndex !== undefined ? a.orderIndex : new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const orderB = b.orderIndex !== undefined ? b.orderIndex : new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return orderA - orderB;
  });
  
  const completedToday = completedTodayTasks.length;
  const completionPercentage = allTodaysTasks.length > 0 ? Math.round((completedToday / allTodaysTasks.length) * 100) : 0;

  // Real Streak Calculation
  let currentStreak = 0;
  let dDate = subDays(new Date(), 1);
  while(true) {
    const dStr = format(dDate, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dStr);
    if (dayTasks.some(t => t.completed)) {
      currentStreak++;
      dDate = subDays(dDate, 1);
    } else {
      break;
    }
  }
  if (completedTodayTasks.length > 0) currentStreak++;

  // Streak Weekdays
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dStr = format(d, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dStr);
    
    let state: 'green' | 'red' | 'gray' = 'gray';
    if (dayTasks.length > 0) {
      if (dayTasks.some(t => t.completed)) state = 'green';
      else if (d < new Date() && !isSameDay(d, new Date())) state = 'red';
    }

    return {
      day: format(d, 'EEE'), // Sun, Mon, Tue
      date: dStr,
      state
    };
  });

  // Monthly Calendar Data
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate }).map(day => {
      const dStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.date === dStr);
      let state: 'green' | 'red' | 'gray' = 'gray';
      if (dayTasks.length > 0) {
          if (dayTasks.some(t => t.completed)) state = 'green';
          else if (day < new Date() && !isSameDay(day, new Date())) state = 'red';
      }
      return {
          date: day,
          dateStr: dStr,
          state,
          isCurrentMonth: isSameMonth(day, monthStart),
          isToday: isSameDay(day, new Date())
      };
  });

  return (
    <div className="flex flex-col h-full space-y-8 pb-8">
      {/* Header section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h2 className="text-4xl font-bold text-[var(--on-surface)]">Good Morning!</h2>
          <p className="text-[var(--on-surface-variant)] text-sm mt-2">
            Currently focusing on <span className="font-bold text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2 py-0.5 rounded-md">{todaysTasks.length > 0 ? (todaysTasks.find(t => !t.completed)?.category || 'Productivity') : 'Productivity'}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-[var(--surface)] px-5 py-3 rounded-2xl border border-[var(--border)] shadow-sm overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <Flame className="w-5 h-5 text-green-500" />
              <span className="text-xl font-bold">{currentStreak}</span>
            </div>
            <div className="h-6 w-px bg-[var(--border)] mx-1 shrink-0"></div>
            <div className="flex gap-1.5 shrink-0">
              {weekDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                    d.state === 'green'
                      ? "bg-green-500 text-white shadow-md shadow-green-500/30" 
                      : d.state === 'red'
                      ? "bg-red-50 text-red-500 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20"
                      : "bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
                  )}>
                    {d.state === 'green' ? <Check className="w-4 h-4 stroke-[3]" /> : 
                     d.state === 'red' ? <X className="w-4 h-4 stroke-[3]" /> : 
                     d.day.charAt(0)}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[var(--surface)] px-5 py-3 rounded-2xl border border-[var(--border)] shadow-sm">
            <span className="text-xl font-bold text-[var(--color-primary-600)]">{completionPercentage}%</span>
            <span className="flex flex-col text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider leading-tight"><span>Daily</span><span>Score</span></span>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveView('timer')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold text-sm whitespace-nowrap hover:bg-[var(--color-primary-100)] transition-colors border border-[var(--color-primary-100)]">
          <Play className="w-4 h-4" /> Start Timer
        </button>
        <button onClick={() => setActiveView('tasks')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--surface)] text-[var(--on-surface)] font-bold text-sm whitespace-nowrap hover:bg-[var(--surface-variant)] transition-colors border border-[var(--border)]">
          <CheckSquare className="w-4 h-4" /> Today's Tasks
        </button>
        <button onClick={() => setActiveView('jobs')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--surface)] text-[var(--on-surface)] font-bold text-sm whitespace-nowrap hover:bg-[var(--surface-variant)] transition-colors border border-[var(--border)]">
          <Briefcase className="w-4 h-4" /> Job Tracker
        </button>
        <button onClick={() => setActiveView('review')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--surface)] text-[var(--on-surface)] font-bold text-sm whitespace-nowrap hover:bg-[var(--surface-variant)] transition-colors border border-[var(--border)]">
          <MoonStar className="w-4 h-4" /> Night Review
        </button>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-4 flex-1">
        
        {/* Monthly Activity Calendar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-12 lg:col-span-12 xl:col-span-8 bg-[var(--surface)]/60 backdrop-blur-md rounded-[2rem] p-6 border border-white dark:border-[var(--border)] shadow-sm flex flex-col min-h-[300px]"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-[var(--on-surface)]">Activity Calendar</h3>
              <p className="text-xs font-medium text-[var(--on-surface-variant)] mt-1 uppercase tracking-wider">{format(monthStart, 'MMMM yyyy')}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--on-surface-variant)]"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>Completed</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--on-surface-variant)] ml-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>Missed</div>
            </div>
          </div>
          <div className="flex-1 w-full flex flex-col justify-center">
            <div className="grid grid-cols-7 gap-1.5 md:gap-3 w-full max-w-2xl mx-auto">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-[var(--on-surface-variant)] pb-2">{d}</div>
              ))}
              {calendarDays.map((d, i) => (
                <motion.div 
                  key={i} 
                  whileHover={d.state !== 'gray' || d.isToday ? { scale: 1.05 } : {}}
                  className={cn(
                  "relative aspect-square rounded-xl flex items-center justify-center font-bold text-xs md:text-sm transition-all border shrink-0 overflow-hidden",
                  !d.isCurrentMonth ? "opacity-30" : "opacity-100",
                  d.state === 'green' ? "bg-green-500 text-white border-green-600 shadow-md shadow-green-500/30" : 
                  d.state === 'red' ? "bg-red-50 text-red-500 border-red-200 dark:bg-red-500/10 dark:border-red-500/20" :
                  "bg-[var(--surface-variant)]/50 text-[var(--on-surface-variant)] border-transparent",
                  d.isToday && d.state === 'gray' ? "ring-2 ring-[var(--color-primary-500)] ring-offset-2 ring-offset-[var(--surface)] text-[var(--color-primary-600)] bg-[var(--color-primary-50)]" : ""
                )}>
                  {d.state === 'green' ? <Check className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" /> : 
                   d.state === 'red' ? <X className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" /> : 
                   format(d.date, 'd')}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Yesterday's Wrap-up Area */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-12 lg:col-span-4 bg-[var(--surface)] p-6 rounded-[2rem] shadow-sm border border-[var(--border)] min-h-[300px] flex flex-col relative"
        >
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-6 z-10 relative">
            <h3 className="font-bold text-lg mb-6 text-[var(--on-surface)]">Yesterday's Tasks</h3>
            
            {yesterdayLeftover.length > 0 && (
              <div>
                <h4 className="font-bold text-xs mb-4 text-orange-500 font-bold uppercase tracking-wider">Leftover Work</h4>
                <div className="relative ml-3 pl-4 border-l-2 border-[var(--border)] space-y-5">
                  {yesterdayLeftover.map((task) => (
                    <TimelineItem key={task.id} time={format(new Date(task.date), 'MMM d')} label={task.title} notes={task.notes} active={false} isLeftover onEdit={() => { setEditingTaskId(task.id); setActiveView('tasks'); }} theme="light" />
                  ))}
                </div>
              </div>
            )}

            {yesterdayCompleted.length > 0 && (
              <div>
                <h4 className="font-bold text-xs mb-4 mt-6 text-green-500 uppercase tracking-wider">Completed</h4>
                <div className="relative ml-3 pl-4 border-l-2 border-[var(--border)] space-y-4 opacity-80">
                  {yesterdayCompleted.map((task) => (
                    <div key={task.id} className="relative flex items-center gap-3 group">
                      <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <div className="text-sm font-medium text-[var(--on-surface-variant)] line-through flex-1">{task.title}</div>
                      <button 
                        onClick={() => { setEditingTaskId(task.id); setActiveView('tasks'); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 shrink-0 flex items-center justify-center rounded-md"
                        title="Edit Task"
                      >
                         <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {yesterdayLeftover.length === 0 && yesterdayCompleted.length === 0 && (
              <div className="text-sm font-medium text-[var(--on-surface-variant)] italic">No tasks recorded yesterday.</div>
            )}
          </div>
        </motion.div>

        {/* Today's Routine Area */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="col-span-1 md:col-span-12 lg:col-span-4 bg-[var(--color-primary-600)] text-white p-6 rounded-[2rem] shadow-xl shadow-[var(--color-primary-200)] dark:shadow-none min-h-[300px] flex flex-col relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-6 z-10 relative">
            <div>
              <h3 className="font-bold text-lg mb-6">Today's Routine</h3>
              <div className="relative ml-3 pl-4 border-l-2 border-white/20 space-y-7">
                {todaysTasks.slice(0, 5).map((task, i) => (
                   <TimelineItem key={task.id} time={task.time ? formatTimePrefix(task.time) : "Any"} label={task.title} notes={task.notes} active={i === 0} onEdit={() => { setEditingTaskId(task.id); setActiveView('tasks'); }} theme="dark" isTagStyle />
                ))}
                {todaysTasks.length === 0 && (
                  <div className="text-sm font-medium text-white/70 italic">No tasks active for today.</div>
                )}
              </div>
            </div>

            {completedTodayTasks.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-sm mb-4 text-green-200 uppercase tracking-wider">Completed Today</h3>
                <div className="relative ml-3 pl-4 border-l-2 border-white/20 space-y-4 opacity-80">
                  {completedTodayTasks.map((task) => (
                    <div key={task.id} className="relative flex items-center gap-3 group">
                      <div className="absolute -left-[22px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-400 flex items-center justify-center ring-[3px] ring-[var(--color-primary-600)]"></div>
                      <div className="text-sm font-medium text-white line-through decoration-white/50 flex-1">{task.title}</div>
                      <button 
                        onClick={() => { setEditingTaskId(task.id); setActiveView('tasks'); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 shrink-0 flex items-center justify-center rounded-md text-white"
                        title="Edit Task"
                      >
                         <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setActiveView('tasks')} className="mt-6 w-full py-3 bg-white text-[var(--color-primary-600)] rounded-xl font-bold text-sm hover:bg-white/90 transition-colors z-10 shrink-0">
            View All Tasks
          </button>
        </motion.div>

        {/* Tomorrow's Outlook */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="col-span-1 md:col-span-12 lg:col-span-4 bg-[var(--surface)] p-6 rounded-[2rem] shadow-sm border border-[var(--border)] min-h-[300px] flex flex-col relative"
        >
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide z-10 relative">
            <h3 className="font-bold text-lg mb-6 text-[var(--on-surface)]">Tomorrow's Tasks</h3>
            <div className="relative ml-3 pl-4 border-l-2 border-[var(--border)] space-y-5">
              {tomorrowsTasks.map((task) => (
                <TimelineItem key={task.id} time={task.time ? formatTimePrefix(task.time) : "Any"} label={task.title} notes={task.notes} active={false} onEdit={() => { setEditingTaskId(task.id); setActiveView('tasks'); }} theme="light" isTagStyle />
              ))}
              {tomorrowsTasks.length === 0 && (
                <div className="text-sm font-medium text-[var(--on-surface-variant)] italic">No tasks scheduled for tomorrow.</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Small Data Cards */}
        <StatCard className="col-span-1 md:col-span-6 lg:col-span-3" icon={CheckCircle2} label="Tasks Completed" value={`${completedToday} / ${todaysTasks.length}`} />
        <StatCard className="col-span-1 md:col-span-4 lg:col-span-3" icon={Clock} label="Focus Hours" value="4h 30m" />
        <StatCard className="col-span-1 md:col-span-4 lg:col-span-3" icon={Briefcase} label="Active Applications" value={jobs.length} />
        <StatCard className="col-span-1 md:col-span-4 lg:col-span-3" icon={CalendarIcon} label="Upcoming Deadlines" value={tasks.filter(t => !t.completed && t.date >= todayDate).length} />

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, className }: { icon: any, label: string, value: string | number, className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className={cn("bg-[var(--surface)]/80 backdrop-blur-md p-6 rounded-[2rem] border border-[var(--border)] shadow-sm flex flex-col justify-center", className)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-[1rem]">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--on-surface-variant)] leading-tight">{label}</p>
          <p className="text-2xl font-black text-[var(--on-surface)] mt-0.5">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineItem({ time, label, notes, active = false, isLeftover = false, onEdit, theme = 'dark', isTagStyle = false }: { time: string, label: string, notes?: string, active?: boolean, isLeftover?: boolean, key?: string | number, onEdit?: () => void, theme?: 'dark' | 'light', isTagStyle?: boolean }) {
  const isDark = theme === 'dark';
  const timeColor = active ? (isDark ? 'text-white' : 'text-[var(--color-primary-600)]') : (isLeftover ? (isDark ? 'text-orange-200' : 'text-orange-600') : (isDark ? 'text-white/70' : 'text-[var(--on-surface-variant)]'));
  const labelColor = active ? (isDark ? 'text-white' : 'text-[var(--on-surface)]') : (isDark ? 'text-white/80' : 'text-[var(--on-surface-variant)]');
  const ringColor = active ? (isDark ? 'bg-white border-[var(--color-primary-600)] ring-white' : 'bg-[var(--color-primary-600)] border-white ring-[var(--color-primary-600)]') : (isDark ? 'border-white/40' : 'border-black/20 dark:border-white/30');

  return (
    <div className="relative group">
      {isLeftover ? (
        <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-[3px] bg-transparent ${isDark ? 'border-orange-300' : 'border-orange-500'}`} />
      ) : (
        <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-[3px] ${active ? 'ring-2' : ''} ${ringColor}`} />
      )}
      <div className={`text-xs font-bold mb-0.5 ${timeColor}`}>{time}</div>
      <div className={`flex justify-between items-start gap-4 text-sm font-medium leading-snug ${labelColor}`}>
        <div className="flex-1 flex flex-col gap-1.5">
          <span>{label}</span>
          {notes && (
            isTagStyle ? (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {notes.split('\n').filter(l => l.trim()).map((line, i) => (
                  <span key={i} className={cn(
                    "px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md border", 
                    isDark ? "bg-white/10 border-white/20 text-white/90" : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[var(--on-surface-variant)]"
                  )}>
                    {line.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className={cn("text-xs whitespace-pre-wrap mt-0.5 opacity-80", isDark ? "text-white/80" : "text-[var(--on-surface-variant)]")}>{notes}</p>
            )
          )}
        </div>
        {onEdit && (
          <button 
            onClick={onEdit} 
            className={`md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity p-1.5 -mr-1.5 rounded-md shrink-0 flex items-center justify-center ${isDark ? 'bg-white/10 hover:bg-white/30 text-white' : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-current'}`}
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
