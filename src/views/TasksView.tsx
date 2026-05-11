import React, { useState, useEffect } from 'react';
import { useStore, Task, Priority } from '@/store/useStore';
import { format, addDays } from 'date-fns';
import { Plus, CheckCircle2, Circle, MoreVertical, Calendar, Tag, Trash2, CheckSquare, Edit3, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatTimePrefix } from '@/lib/utils';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTaskItem({ task, handleEditClick, updateTask, deleteTask }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const tomorrowDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const isTagStyle = task.date === todayDate || task.date === tomorrowDate;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex items-start gap-4 p-5 rounded-[2rem] border transition-all duration-300 relative",
        task.completed
          ? "bg-[var(--background)] border-[var(--border)] opacity-70"
          : "bg-[var(--surface)] border-[var(--border-dark)] hover:border-[var(--color-primary-300)] shadow-sm hover:shadow-md",
        isDragging && "shadow-xl border-[var(--color-primary-500)] scale-[1.02] bg-[var(--surface)] z-10"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-5 -left-2 p-2 md:opacity-0 opacity-100 group-hover:opacity-100 cursor-grab text-[var(--on-surface-variant)] hover:text-[var(--color-primary-600)] transition-opacity"
      >
        <div className="flex flex-col gap-1 w-2">
          <div className="w-1 h-1 bg-current rounded-full" />
          <div className="w-1 h-1 bg-current rounded-full" />
          <div className="w-1 h-1 bg-current rounded-full" />
        </div>
      </div>

      <button
        onClick={() => updateTask(task.id, { completed: !task.completed })}
        className={cn(
          "flex-shrink-0 mt-1 transition-colors ml-4",
          task.completed ? "text-[var(--color-primary-500)]" : "text-[var(--on-surface-variant)] hover:text-[var(--color-primary-400)]"
        )}
      >
        {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className={cn(
            "font-bold text-lg truncate transition-all",
            task.completed ? "text-[var(--on-surface-variant)] line-through" : "text-[var(--on-surface)]"
          )}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1 md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditClick(task)}
              className="p-1.5 text-[var(--on-surface-variant)] hover:text-[var(--color-primary-600)] transition-all rounded-lg hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)]/20"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 text-[var(--on-surface-variant)] hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-3">
          {task.notes && (
            isTagStyle ? (
              <div className="flex flex-wrap gap-1.5 transition-all mt-1">
                {task.notes.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                  <span key={i} className={cn(
                    "px-2.5 py-1 text-[11px] font-bold rounded-md border", 
                    task.completed ? "bg-[var(--surface-variant)] border-transparent text-[var(--on-surface-variant)] line-through opacity-70" : "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 border-[var(--color-primary-100)] dark:border-[var(--color-primary-800)] text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]"
                  )}>
                    {line.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className={cn("text-sm transition-all whitespace-pre-wrap mt-1", task.completed ? "text-[var(--on-surface-variant)] line-through opacity-70" : "text-[var(--on-surface)] opacity-90")}>
                {task.notes}
              </p>
            )
          )}
          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full opacity-80 group-hover:opacity-100 transition-opacity">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={task.completed ? 100 : task.progress || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateTask(task.id, { progress: val, completed: val === 100 });
              }}
              className="flex-1 h-2 bg-[var(--border)] dark:bg-[var(--surface-variant)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--color-primary-600)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
              disabled={task.completed}
            />
            <span className="text-xs font-bold text-[var(--on-surface-variant)] w-8 text-right">
              {task.completed ? 100 : task.progress || 0}%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold">
              <Tag className="w-3 h-3" /> {task.category}
            </span>
            <span className={cn(
              "px-3 py-1.5 rounded-lg font-bold",
              task.priority === 'High' ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                task.priority === 'Medium' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}>
              {task.priority} Priority
            </span>
            {task.time && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-[var(--surface-variant)] text-[var(--on-surface-variant)]">
                <Clock className="w-3 h-3" />
                {formatTimePrefix(task.time)} {task.endTime && `- ${formatTimePrefix(task.endTime)}`}
              </span>
            )}
            {!task.time && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-[var(--on-surface-variant)]">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TasksView() {
  const { tasks, addTask, updateTask, deleteTask, editingTaskId, setEditingTaskId } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'leftovers' | 'completed'>('all');

  const categories: string[] = ['Work/Study', 'Projects', 'Admin', 'Learning', 'Personal', 'Fitness', 'Diary', 'Other'];
  const priorities: Priority[] = ['High', 'Medium', 'Low'];
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const tomorrowDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'today') return !t.completed && t.date === todayDate;
    if (filter === 'tomorrow') return !t.completed && t.date === tomorrowDate;
    if (filter === 'leftovers') return !t.completed && t.date < todayDate;
    if (filter === 'all') return !t.completed; // All pending
    return true;
  }).sort((a, b) => {
    const orderA = a.orderIndex !== undefined ? a.orderIndex : new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const orderB = b.orderIndex !== undefined ? b.orderIndex : new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return orderA - orderB;
  });

  // Simple add task form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Personal');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTaskId) {
      const task = tasks.find(t => t.id === editingTaskId);
      if (task) {
        setTitle(task.title);
        setCategory(task.category);
        setPriority(task.priority);
        setDate(task.date);
        setTime(task.time || '');
        setEndTime(task.endTime || '');
        setNotes(task.notes || '');
        setEditingId(task.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setEditingTaskId(null);
      }
    }
  }, [editingTaskId, tasks, setEditingTaskId]);

  const resetForm = () => {
    setTitle('');
    setCategory('Personal');
    setPriority('Medium');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('');
    setEndTime('');
    setNotes('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEditClick = (task: Task) => {
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setDate(task.date);
    setTime(task.time || '');
    setEndTime(task.endTime || '');
    setNotes(task.notes || '');
    setEditingId(task.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      updateTask(editingId, { title, category, priority, date, time, endTime, notes });
    } else {
      addTask({
        title,
        category,
        priority,
        date,
        time,
        endTime,
        tags: [],
        notes,
        progress: 0,
        completed: false,
        notified: false
      });
    }
    resetForm();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex(t => t.id === active.id);
      const newIndex = filteredTasks.findIndex(t => t.id === over.id);
      
      const movedFiltered = arrayMove(filteredTasks, oldIndex, newIndex);
      
      const draggedTask = movedFiltered[newIndex];
      const prev = movedFiltered[newIndex - 1];
      const next = movedFiltered[newIndex + 1];

      const getOrder = (t: Task) => t.orderIndex !== undefined ? t.orderIndex : new Date(`${t.date}T${t.time || '00:00'}`).getTime();

      let newOrder: number;
      if (prev && next) {
        newOrder = (getOrder(prev) + getOrder(next)) / 2;
      } else if (prev) {
        newOrder = getOrder(prev) + 60000; // Add 1 min worth of MS
      } else if (next) {
        newOrder = getOrder(next) - 60000;
      } else {
        newOrder = getOrder(draggedTask);
      }
      
      updateTask(draggedTask.id, { orderIndex: newOrder });
    }
  };

  return (
    <div className="space-y-6 pb-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">Daily Tasks</h2>
          <p className="text-[var(--on-surface-variant)] text-sm mt-1">Manage your routines and daily focus.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar scroll-smooth snap-x">
          {(['all', 'today', 'tomorrow', 'leftovers', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all snap-start",
                filter === f 
                  ? "bg-[var(--color-primary-600)] text-white shadow-md shadow-[var(--color-primary-500)]/20" 
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
              )}
            >
              {f}
            </button>
          ))}
          <button 
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="px-5 py-2 rounded-full text-sm font-bold bg-[var(--surface)] border border-[var(--border)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] transition-all flex items-center gap-2 whitespace-nowrap snap-start shrink-0 ml-2"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            onSubmit={handleAddOrUpdate}
            className="bg-[var(--surface)]/60 backdrop-blur-md border border-white dark:border-[var(--border)] rounded-[2rem] p-6 shadow-sm overflow-hidden"
          >
            <h3 className="font-bold text-xl mb-4 text-[var(--on-surface)]">{editingId ? 'Edit Task' : 'New Task'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">Task Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none transition-all placeholder:text-[var(--on-surface-variant)] font-bold text-lg"
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none font-medium"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">Priority</label>
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none font-medium"
                >
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none font-medium text-sm"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">Start Time (Optional)</label>
                <input 
                  type="time" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none font-medium text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">End Time (Optional)</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none font-medium text-sm"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-2">Notes (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none transition-all placeholder:text-[var(--on-surface-variant)] font-medium resize-none"
                  placeholder="Any additional details?"
                  rows={2}
                />
              </div>
              
              {editingId && (
                <div className="md:col-span-4 flex flex-wrap items-center gap-3 bg-[var(--surface-variant)]/50 border border-[var(--border)] p-4 rounded-xl mt-2">
                  <span className="text-sm font-bold text-[var(--on-surface)] mr-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Quick Move:
                  </span>
                  <button type="button" onClick={() => setDate(todayDate)} className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-variant)] border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap text-[var(--color-primary-600)]">Today</button>
                  <button type="button" onClick={() => setDate(tomorrowDate)} className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-variant)] border border-[var(--border)] rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap text-blue-500">Tomorrow</button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--on-surface-variant)] hover:bg-white dark:hover:bg-[var(--surface-variant)] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!title.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] transition-colors shadow-md disabled:opacity-50"
              >
                {editingId ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {filteredTasks.length === 0 && !isAdding && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full text-center py-16 text-[var(--on-surface-variant)] border-2 border-dashed border-[var(--border)] rounded-[2rem]"
                >
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">No tasks found. Time to add some!</p>
                </motion.div>
              )}
              {filteredTasks.map(task => (
                <SortableTaskItem 
                  key={task.id} 
                  task={task} 
                  handleEditClick={handleEditClick} 
                  updateTask={updateTask} 
                  deleteTask={deleteTask} 
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
