import React, { useState, useRef, useEffect } from 'react';
import type { Analytics } from '@entity-builders/analytics';
import {
  Plus,
  RefreshCw,
  FileText,
  MessageSquare,
  Mail,
  MessageCircle,
  Settings,
  Trash2,
  Pencil,
  X,
  GripVertical,
} from 'lucide-react';

interface SidebarProps {
  recipes: Array<{ id: string; name: string; instruction: string }>;
  selectedRecipeId: string;
  onSelectRecipe: (id: string, instruction: string) => void;
  onDeleteRecipe: (id: string) => void;
  onRenameRecipe: (id: string, newName: string) => void;
  onAddRecipe: (name: string, instruction: string) => void;
  onReorderRecipes: (
    recipes: Array<{ id: string; name: string; instruction: string }>,
  ) => void;
  onOpenSettings: () => void;
  hasUpdateBadge?: boolean;
  analytics: Analytics;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  simplifier: <RefreshCw size={20} />,
  summarizer: <FileText size={20} />,
  'qa-engineer': <MessageSquare size={20} />,
  'translator-es': <Mail size={20} />,
  'code-expert': <MessageSquare size={20} />,
  'code-reviewer': <MessageSquare size={20} />,
  'email-writer': <Mail size={20} />,
  'blog-post': <FileText size={20} />,
  'tweet-writer': <MessageCircle size={20} />,
  custom: <MessageCircle size={20} />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  onDeleteRecipe,
  onRenameRecipe,
  onAddRecipe,
  onReorderRecipes,
  onOpenSettings,
  hasUpdateBadge = false,
  analytics,
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemRef = useRef<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const commitEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameRecipe(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveNew = () => {
    if (!newName.trim()) return;
    onAddRecipe(newName.trim(), newInstruction.trim());
    setNewName('');
    setNewInstruction('');
    setShowNewForm(false);
  };

  return (
    <div className='w-64 bg-white border-r border-gray-200 flex flex-col h-full'>
      <div className='p-4 border-b border-gray-100 flex items-center gap-2'>
        <h2 className='font-bold text-gray-800 text-lg flex-1'>Recipes</h2>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className={`p-1.5 rounded-full transition-colors ${showNewForm ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          {showNewForm ? (
            <X size={18} className='text-blue-600' />
          ) : (
            <Plus size={18} className='text-gray-600' />
          )}
        </button>
        <button
          onClick={() => {
            onOpenSettings();
            analytics.track('settings_opened');
          }}
          className='p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors relative'
        >
          <Settings size={18} />
          {hasUpdateBadge && (
            <span className='absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse' />
          )}
        </button>
      </div>

      {/* New Recipe Form */}
      {showNewForm && (
        <div className='p-4 border-b border-gray-100 bg-blue-50/50 space-y-3 animate-in fade-in slide-in-from-top-2'>
          <input
            type='text'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='Recipe name...'
            className='w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white'
            autoFocus
          />
          <textarea
            value={newInstruction}
            onChange={(e) => setNewInstruction(e.target.value)}
            placeholder='System instructions...'
            rows={3}
            className='w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white resize-none'
          />
          <div className='flex gap-2'>
            <button
              onClick={handleSaveNew}
              disabled={!newName.trim()}
              className='flex-1 px-3 py-1.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowNewForm(false);
                setNewName('');
                setNewInstruction('');
              }}
              className='px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className='flex-1 overflow-y-auto py-2'>
        {recipes.map((preset) => {
          return (
            <div
              key={preset.id}
              className={`relative group transition-all ${
                dragOverId === preset.id
                  ? 'border-t-2 border-blue-400'
                  : 'border-t-2 border-transparent'
              }`}
              draggable
              onDragStart={(e) => {
                dragItemRef.current = preset.id;
                e.dataTransfer.effectAllowed = 'move';
                // Make the drag image slightly transparent
                const el = e.currentTarget as HTMLElement;
                el.style.opacity = '0.5';
              }}
              onDragEnd={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
                setDragOverId(null);
                dragItemRef.current = null;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragItemRef.current !== preset.id) {
                  setDragOverId(preset.id);
                }
              }}
              onDragLeave={() => {
                setDragOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverId(null);
                const fromId = dragItemRef.current;
                const toId = preset.id;
                if (!fromId || fromId === toId) return;
                const fromIndex = recipes.findIndex((r) => r.id === fromId);
                const toIndex = recipes.findIndex((r) => r.id === toId);
                if (fromIndex === -1 || toIndex === -1) return;
                const reordered = [...recipes];
                const [moved] = reordered.splice(fromIndex, 1);
                reordered.splice(toIndex, 0, moved);
                onReorderRecipes(reordered);
              }}
            >
              <button
                onClick={() => onSelectRecipe(preset.id, preset.instruction)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditing(preset.id, preset.name);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors pr-12
                ${
                  selectedRecipeId === preset.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {/* Drag Handle */}
                <span className='flex-shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing'>
                  <GripVertical size={14} />
                </span>
                <span
                  className={
                    selectedRecipeId === preset.id
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }
                >
                  {ICON_MAP[preset.id] || <MessageCircle size={20} />}
                </span>
                {editingId === preset.id ? (
                  <input
                    ref={editInputRef}
                    type='text'
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className='flex-1 px-2 py-0.5 text-sm rounded border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-white text-gray-800 min-w-0'
                  />
                ) : (
                  <span className='truncate'>{preset.name}</span>
                )}
              </button>

              {/* Action Buttons */}
              {editingId !== preset.id && (
                <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(preset.id, preset.name);
                    }}
                    className='p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all'
                    title='Rename Recipe'
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm('Are you sure you want to delete this recipe?')
                      ) {
                        onDeleteRecipe(preset.id);
                      }
                    }}
                    className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all'
                    title='Delete Recipe'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
