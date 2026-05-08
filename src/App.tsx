import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, ChevronRight, Kanban, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Types ---
type Status = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  created_at: string;
}

// --- Components ---

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: newTitle, description: newDesc, status: 'NAO_INICIADO' }])
        .select();

      if (error) throw error;
      if (data) {
        setTasks([data[0], ...tasks]);
        setNewTitle('');
        setNewDesc('');
        setIsAdding(false);
      }
    } catch (err: any) {
      alert('Erro ao adicionar tarefa: ' + err.message);
    }
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const columns: { title: string; status: Status; icon: any; color: string }[] = [
    { title: 'Não Iniciado', status: 'NAO_INICIADO', icon: Circle, color: 'border-slate-200 bg-slate-50/50' },
    { title: 'Em Andamento', status: 'EM_ANDAMENTO', icon: Clock, color: 'border-amber-200 bg-amber-50/50' },
    { title: 'Concluído', status: 'CONCLUIDO', icon: CheckCircle2, color: 'border-emerald-200 bg-emerald-50/50' },
  ];

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuração Necessária</h1>
          <p className="text-slate-600 mb-6">
            Por favor, adicione as credenciais do Supabase (URL e Anon Key) nos **Secrets** do AI Studio com os nomes:
            <br /><code className="bg-slate-100 px-2 py-1 rounded mt-2 block font-mono text-sm">VITE_SUPABASE_URL</code>
            <code className="bg-slate-100 px-2 py-1 rounded mt-1 block font-mono text-sm">VITE_SUPABASE_ANON_KEY</code>
          </p>
          <div className="text-left text-xs text-slate-400 font-mono bg-slate-900 p-4 rounded-lg overflow-auto">
            {`// SQL para o Supabase:\ncreate table tasks (\n  id uuid default gen_random_uuid() primary key,\n  title text not null,\n  description text,\n  status text not null default 'NAO_INICIADO',\n  created_at timestamp with time zone default now()\n);`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D] font-sans selection:bg-blue-100">
      {/* Top Navigation */}
      <nav className="h-[56px] bg-white border-b border-[#DFE1E6] flex items-center px-6 justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Kanban size={24} className="text-[#0052CC]" />
          <span className="font-bold text-lg tracking-tight">TaskBoard Pro</span>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#E3FCEF] text-[#006644] rounded-full text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006644]"></span>
            Supabase Connected
          </div>
          <div className="flex items-center gap-4 text-sm text-[#5E6C84]">
            <span className="hover:text-[#0052CC] cursor-pointer transition-colors">Docs</span>
            <span className="hover:text-[#0052CC] cursor-pointer transition-colors">Vercel Deploy</span>
            <div className="w-6 h-6 bg-[#0052CC] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {import.meta.env.VITE_USER_INITIALS || 'JS'}
            </div>
          </div>
        </div>
      </nav>

      {/* Action Bar */}
      <div className="h-[64px] flex items-center px-6 justify-between bg-[#F4F5F7]">
        <h1 className="text-xl font-semibold m-0">Project: Supabase Integration</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-3 pr-8 py-2 border border-[#DFE1E6] rounded-[3px] bg-white text-sm w-[240px] focus:outline-none focus:border-[#4C9AFF] transition-colors"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#0052CC] text-white px-4 py-2 rounded-[3px] font-medium text-sm hover:bg-[#0747A6] transition-colors cursor-pointer"
          >
            + Criar Tarefa
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <main className="px-6 pb-6 h-[calc(100vh-120px)] overflow-hidden">
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052CC] mb-4"></div>
            <p className="text-sm font-semibold text-[#5E6C84]">Sincronizando Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {columns.map((col) => (
              <div key={col.status} className="bg-[#EBECF0] rounded-[4px] flex flex-col p-2 max-h-full">
                {/* Column Header */}
                <div className="px-2 py-3 flex justify-between items-center">
                  <span className="text-[12px] font-semibold text-[#5E6C84] uppercase tracking-wider">
                    {col.title} ({tasks.filter(t => t.status === col.status).length})
                  </span>
                  <button className="text-[#5E6C84] hover:bg-[#DEDFE5] w-6 h-6 flex items-center justify-center rounded transition-colors">
                    ...
                  </button>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto space-y-2 px-1 pb-2 scrollbar-none">
                  <AnimatePresence mode="popLayout">
                    {tasks
                      .filter(t => t.status === col.status)
                      .map((task) => (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white p-3 rounded-[3px] shadow-[0_1px_1px_rgba(9,30,66,0.25)] border-b border-[rgba(9,30,66,0.1)] group cursor-grab active:cursor-grabbing hover:bg-[#F4F5F7] transition-colors"
                        >
                          <h3 className="text-sm text-[#172B4D] mb-2 leading-[1.4] font-normal">{task.title}</h3>
                          
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-1">
                              {col.status !== 'NAO_INICIADO' && (
                                <button
                                  onClick={() => updateStatus(task.id, 'NAO_INICIADO')}
                                  className="text-[10px] font-bold text-[#5E6C84] hover:bg-[#EBECF0] p-1 rounded transition-colors"
                                >
                                  Reset
                                </button>
                              )}
                              {col.status !== 'EM_ANDAMENTO' && col.status !== 'CONCLUIDO' && (
                                <button
                                  onClick={() => updateStatus(task.id, 'EM_ANDAMENTO')}
                                  className="text-[10px] font-bold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded hover:bg-[#B3D4FF] transition-colors"
                                >
                                  Iniciar
                                </button>
                              )}
                              {col.status !== 'CONCLUIDO' && (
                                <button
                                  onClick={() => updateStatus(task.id, 'CONCLUIDO')}
                                  className="text-[10px] font-bold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded hover:bg-[#ABF5D1] transition-colors"
                                >
                                  Finalizar
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-[#5E6C84] hover:text-[#DE350B] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={12} />
                              </button>
                              <div className="w-5 h-5 bg-[#DFE1E6] rounded-full flex items-center justify-center text-[9px] font-bold text-[#5E6C84]">
                                JS
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-[#091E42]/50 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-[400px] rounded-[3px] shadow-2xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4 text-[#172B4D]">Criar nova tarefa</h2>
              <form onSubmit={addTask} className="space-y-4">
                <div>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="O que precisa ser feito?"
                    className="w-full px-3 py-2 rounded-[3px] border border-[#DFE1E6] focus:outline-none focus:border-[#4C9AFF] bg-[#FAFBFC] text-sm transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Descrição opcional..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-[3px] border border-[#DFE1E6] focus:outline-none focus:border-[#4C9AFF] bg-[#FAFBFC] text-sm transition-colors resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-2 rounded-[3px] text-[#42526E] text-sm font-medium hover:bg-[#EBECF0] transition-colors"
                  >
                    Calcular
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-[3px] bg-[#0052CC] text-white text-sm font-medium hover:bg-[#0747A6] transition-colors"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
