import React, { useState } from 'react';
import { useStore, Note } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Trash2, Edit3, X, Save, FileText, Calendar, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const activeNote = notes.find(n => n.id === activeNoteId);
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateNote = () => {
    addNote({ title: 'Untitled Note', content: '' });
    setIsEditing(true);
    setEditTitle('Untitled Note');
    setEditContent('');
    // Automatically select the new note if we had an actual ID, but since it's generated in store, 
    // we might need to rely on the side-effect or just let the user see it top of list.
    // Hack: Wait a tick and grab the first note
    setTimeout(() => {
      const stateNotes = useStore.getState().notes;
      setActiveNoteId(stateNotes[0].id);
    }, 50);
  };

  const startEditing = (note: Note) => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
    setActiveNoteId(note.id);
  };

  const saveNote = () => {
    if (activeNoteId) {
      updateNote(activeNoteId, { title: editTitle || 'Untitled Note', content: editContent });
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      deleteNote(id);
      if (activeNoteId === id) {
        setActiveNoteId(null);
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[var(--surface-variant)]/30 rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-sm">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 flex flex-col bg-[var(--surface)] border-r border-[var(--border)] transition-all shrink-0",
        activeNoteId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-[var(--on-surface)]">
              <FileText className="w-5 h-5 text-[var(--color-primary-600)]" />
              Notes
            </h2>
            <button 
              onClick={handleCreateNote}
              className="p-2 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-100)] rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
            <input 
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--surface-variant)]/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-primary-500)] outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          <AnimatePresence>
            {filteredNotes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => {
                  setActiveNoteId(note.id);
                  if (isEditing) {
                    setEditTitle(note.title);
                    setEditContent(note.content);
                  }
                }}
                className={cn(
                  "p-3 rounded-xl cursor-pointer transition-all group flex flex-col gap-1",
                  activeNoteId === note.id 
                    ? "bg-[var(--color-primary-600)] text-white shadow-md shadow-[var(--color-primary-500)]/20" 
                    : "hover:bg-[var(--surface-variant)] text-[var(--on-surface)]"
                )}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm truncate pr-4">{note.title}</h3>
                  <button 
                    onClick={(e) => handleDelete(note.id, e)}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity shrink-0",
                      activeNoteId === note.id ? "hover:bg-white/20" : "hover:bg-red-50 text-red-500 dark:hover:bg-red-500/20"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className={cn(
                  "text-xs line-clamp-2",
                  activeNoteId === note.id ? "text-white/80" : "text-[var(--on-surface-variant)]"
                )}>
                  {note.content || "Empty note..."}
                </p>
                <div className={cn(
                  "text-[10px] font-medium mt-1 flex items-center gap-1",
                  activeNoteId === note.id ? "text-white/60" : "text-[var(--on-surface-variant)]/70"
                )}>
                  <Calendar className="w-3 h-3" />
                  {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredNotes.length === 0 && (
            <div className="text-center py-10 px-4 text-sm font-medium text-[var(--on-surface-variant)]">
              No notes found. Create a new one to start writing!
            </div>
          )}
        </div>
      </div>

      {/* Editor Main */}
      <div className={cn(
        "flex-1 flex flex-col bg-white dark:bg-[var(--surface)]",
        !activeNoteId ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {!activeNoteId ? (
          <div className="text-center flex flex-col items-center opacity-50 pl-4 pr-4">
            <div className="w-16 h-16 bg-[var(--surface-variant)] rounded-2xl flex items-center justify-center mb-4">
              <AlignLeft className="w-8 h-8 text-[var(--on-surface-variant)]" />
            </div>
            <p className="font-bold text-lg text-[var(--on-surface-variant)]">No note selected</p>
            <p className="text-sm font-medium text-[var(--on-surface-variant)]">Select a note from the sidebar or create a new one.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-[var(--border)] pr-6">
              <button 
                onClick={() => setActiveNoteId(null)}
                className="md:hidden p-2 hover:bg-[var(--surface-variant)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--on-surface-variant)]" />
              </button>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-transparent text-xl font-bold border-none outline-none text-[var(--on-surface)] px-0"
                  placeholder="Note Title"
                  autoFocus
                />
              ) : (
                <h1 className="flex-1 text-xl font-bold text-[var(--on-surface)] truncate">
                  {activeNote?.title}
                </h1>
              )}

              {isEditing ? (
                <button 
                  onClick={saveNote}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              ) : (
                <button 
                  onClick={() => activeNote && startEditing(activeNote)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-variant)] hover:bg-[var(--border)] text-[var(--on-surface)] rounded-xl text-sm font-bold transition-all"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full min-h-[400px] resize-none bg-transparent border-none outline-none text-[var(--on-surface)] leading-relaxed font-medium text-[15px]"
                  placeholder="Start typing your note here... (Markdown supported mentally)"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none text-[15px] font-medium leading-relaxed whitespace-pre-wrap text-[var(--on-surface)]">
                  {activeNote?.content || <span className="text-[var(--on-surface-variant)] italic">Empty note. Click edit to add content.</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
