import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export type Mood = 'productive' | 'focused' | 'calm' | 'energetic' | 'relaxed' | 'stressed' | 'sunny' | 'rainy' | 'cloudy' | 'clear';
export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  date: string;
  time?: string;
  endTime?: string;
  tags: string[];
  notes: string;
  progress: number;
  completed: boolean;
  orderIndex?: number;
  notified?: boolean;
}

export interface JobApp {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: 'Applied' | 'OA' | 'Interview' | 'Rejected' | 'Selected';
  resumeVersion: string;
  notes: string;
}

export interface NightReview {
  id: string;
  date: string;
  completedToday: string;
  leftForTomorrow: string;
  diary: string;
  wins: string;
  lessons: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface AppState {
  tasks: Task[];
  jobs: JobApp[];
  reviews: NightReview[];
  notes: Note[];
  mood: Mood;
  theme: 'light' | 'dark';
  weatherLoaded: boolean;
  weather: { temp: number, condition: string, city?: string } | null;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  setMood: (mood: Mood) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setWeatherLoaded: (loaded: boolean) => void;
  setWeather: (weather: { temp: number, condition: string, city?: string } | null) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  addJob: (job: Omit<JobApp, 'id'>) => void;
  updateJob: (id: string, job: Partial<JobApp>) => void;
  deleteJob: (id: string) => void;
  addReview: (review: Omit<NightReview, 'id'>) => void;
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  generateDailyRoutine: (date: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      jobs: [],
      reviews: [],
      notes: [],
      mood: 'productive',
      theme: 'light',
      weatherLoaded: false,
      weather: null,
      editingTaskId: null,
      setEditingTaskId: (id) => set({ editingTaskId: id }),
      setMood: (mood) => set({ mood }),
      setTheme: (theme) => set({ theme }),
      setWeatherLoaded: (loaded) => set({ weatherLoaded: loaded }),
      setWeather: (weather) => set({ weather }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, { ...task, id: Math.random().toString(36).substring(7) }] })),
      updateTask: (id, updatedTask) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t))
      })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      setTasks: (tasks) => set({ tasks }),
      addJob: (job) => set((state) => ({ jobs: [...state.jobs, { ...job, id: Math.random().toString(36).substring(7) }] })),
      updateJob: (id, updatedJob) => set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updatedJob } : j))
      })),
      deleteJob: (id) => set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),
      addReview: (review) => set((state) => ({ reviews: [...state.reviews, { ...review, id: Math.random().toString(36).substring(7) }] })),
      addNote: (note) => set((state) => ({ notes: [{ ...note, id: Math.random().toString(36).substring(7), updatedAt: new Date().toISOString() }, ...state.notes] })),
      updateNote: (id, document) => set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...document, updatedAt: new Date().toISOString() } : n))
      })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      generateDailyRoutine: (date) => {
        const state = get();
        const existingTasks = state.tasks.filter(t => t.date === date);
        if (existingTasks.length > 0) return; // Routine already generated or tasks exist
        
        const routine: Omit<Task, 'id'>[] = [
          { title: 'Morning Routine & Planning', category: 'Personal', priority: 'High', date, time: '07:00', tags: [], notes: '', progress: 0, completed: false },
          { title: 'Deep Work Session 1', category: 'Work/Study', priority: 'High', date, time: '09:00', tags: [], notes: '', progress: 0, completed: false },
          { title: 'Deep Work Session 2', category: 'Work/Study', priority: 'High', date, time: '11:30', tags: [], notes: '', progress: 0, completed: false },
          { title: 'Review & Emails', category: 'Admin', priority: 'Medium', date, time: '14:00', tags: [], notes: '', progress: 0, completed: false },
          { title: 'Project Work / Continuation', category: 'Projects', priority: 'High', date, time: '15:30', tags: [], notes: '', progress: 0, completed: false },
          { title: 'Evening Wrap-up / Notes', category: 'Diary', priority: 'Medium', date, time: '18:00', tags: [], notes: '', progress: 0, completed: false },
          { title: 'Skill Development / Reading', category: 'Learning', priority: 'Medium', date, time: '19:30', tags: [], notes: '', progress: 0, completed: false }
        ];

        set((state) => ({
          tasks: [...state.tasks, ...routine.map(t => ({ ...t, id: Math.random().toString(36).substring(7) }))]
        }));
      }
    }),
    {
      name: 'lifeflow-storage',
    }
  )
);
