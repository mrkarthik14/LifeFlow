import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { MoonStar, Save, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function ReviewView() {
  const { addReview, reviews } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const existingReview = reviews.find(r => r.date === today);
  
  const [completedToday, setCompletedToday] = useState(existingReview?.completedToday || '');
  const [leftForTomorrow, setLeftForTomorrow] = useState(existingReview?.leftForTomorrow || '');
  const [diary, setDiary] = useState(existingReview?.diary || '');
  const [wins, setWins] = useState(existingReview?.wins || '');
  const [lessons, setLessons] = useState(existingReview?.lessons || '');
  const [saved, setSaved] = useState(!!existingReview);

  const handleSave = () => {
    addReview({
      date: today,
      completedToday,
      leftForTomorrow,
      diary,
      wins,
      lessons
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000); // feedback
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8 h-full">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-[var(--color-primary-600)] text-white rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-[var(--color-primary-500)]/30">
          <MoonStar className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--on-surface)]">Night Review</h2>
        <p className="text-[var(--on-surface-variant)] text-sm mt-1">Empty your mind for a clear tomorrow.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--surface)]/60 backdrop-blur-md border border-white dark:border-[var(--border)] rounded-[2rem] p-6 lg:p-10 shadow-sm space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">What did I complete today?</label>
            <textarea 
              value={completedToday} onChange={e => setCompletedToday(e.target.value)}
              className="w-full h-32 bg-white dark:bg-[var(--background)] border border-[var(--border)] rounded-[1.5rem] p-5 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none resize-none font-medium"
              placeholder="List down the major tasks you finished..."
            />
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">What is left for tomorrow?</label>
            <textarea 
              value={leftForTomorrow} onChange={e => setLeftForTomorrow(e.target.value)}
              className="w-full h-32 bg-white dark:bg-[var(--background)] border border-[var(--border)] rounded-[1.5rem] p-5 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none resize-none font-medium"
              placeholder="What needs to carry over?"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Wins of the Day & Lessons Learned</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" value={wins} onChange={e => setWins(e.target.value)}
              className="w-full bg-white dark:bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none font-medium"
              placeholder="e.g. Solved that graph DP problem!"
            />
            <input 
              type="text" value={lessons} onChange={e => setLessons(e.target.value)}
              className="w-full bg-white dark:bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none font-medium"
              placeholder="e.g. Always normalize data before training."
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">Daily Diary / Thoughts</label>
          <textarea 
            value={diary} onChange={e => setDiary(e.target.value)}
            className="w-full h-40 bg-white dark:bg-[var(--background)] border border-[var(--border)] rounded-[1.5rem] p-5 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none resize-none font-serif text-lg"
            placeholder="Dear diary..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border)]">
          <button 
            onClick={handleSave}
            disabled={saved}
            className="px-8 py-4 rounded-[1.5rem] text-sm font-bold bg-[var(--color-primary-600)] text-white transition-colors shadow-md shadow-[var(--color-primary-500)]/20 hover:bg-[var(--color-primary-700)] flex items-center gap-2 disabled:opacity-70 disabled:hover:bg-[var(--color-primary-600)]"
          >
            {saved ? <><Check className="w-5 h-5"/> Reflection Saved!</> : <><Save className="w-5 h-5"/> Save Reflection</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
