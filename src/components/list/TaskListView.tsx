import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { 
  Search, 
  Terminal, 
  Bug, 
  Sparkles, 
  CheckSquare, 
  ArrowUpDown, 
  Filter, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Flame, 
  ChevronDown,
  X,
  Plus
} from 'lucide-react';

interface TaskListViewProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ onSelectTask, onOpenCreateTask }) => {
  const { tasks, selectedProjectId, teamMembers, role, updateTaskStatus, addToast } = useApp();

  const [jqlQuery, setJqlQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Task>('key');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);

  // Parse simple JQL-like query e.g. "type = Bug" or "priority = Hotfix" or search string
  const filteredTasks = projectTasks.filter((task) => {
    if (role === 'client' && task.visibility !== 'client_public') {
      return false;
    }

    if (!jqlQuery.trim()) return true;

    const lowerQuery = jqlQuery.toLowerCase();

    // Check for "field = value" syntax
    if (lowerQuery.includes('=')) {
      const parts = lowerQuery.split('=').map((s) => s.trim());
      const field = parts[0];
      const val = parts[1];

      if (field === 'type') return task.type.toLowerCase() === val;
      if (field === 'priority') return task.priority.toLowerCase() === val;
      if (field === 'status') return task.status.toLowerCase().includes(val);
      if (field === 'difficulty') return (task.difficulty || '').toLowerCase() === val;
    }

    // Default keyword search
    return (
      task.key.toLowerCase().includes(lowerQuery) ||
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
    );
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(sortedTasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    selectedTaskIds.forEach((id) => {
      updateTaskStatus(id, newStatus, 'Bulk status update');
    });
    addToast('success', 'Pembaruan Massal Berhasil', `${selectedTaskIds.length} task dialihkan ke status ${newStatus}.`);
    setSelectedTaskIds([]);
  };

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'Hotfix':
        return 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
      case 'Tinggi':
        return 'text-amber-800 bg-amber-50 border-amber-200 font-semibold';
      case 'Sedang':
        return 'text-slate-700 bg-slate-50 border-slate-200';
      case 'Rendah':
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Search & JQL Bar Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Tabel Data & JQL Query Filter (PRD Bagian 6.4)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Gunakan sintaks query cepat seperti <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">type = Bug</code> atau cari bebas.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Task</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter JQL: 'type = Bug', 'priority = Hotfix', 'status = Menunggu Persetujuan', atau judul..."
              value={jqlQuery}
              onChange={(e) => setJqlQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {jqlQuery && (
              <button
                onClick={() => setJqlQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Preset:</span>
            <button
              onClick={() => setJqlQuery('type = Bug')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                jqlQuery === 'type = Bug'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              type = Bug
            </button>
            <button
              onClick={() => setJqlQuery('priority = Hotfix')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                jqlQuery === 'priority = Hotfix'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              priority = Hotfix
            </button>
            <button
              onClick={() => setJqlQuery('status = Menunggu Persetujuan')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                jqlQuery === 'status = Menunggu Persetujuan'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              status = Menunggu Persetujuan
            </button>
            <button
              onClick={() => setJqlQuery('difficulty = Hard')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                jqlQuery === 'difficulty = Hard'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              difficulty = Hard
            </button>
          </div>
        </div>

        {/* Bulk Action Toolbar (Appears when >= 1 row selected) */}
        {selectedTaskIds.length > 0 && (
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedTaskIds.length} item dipilih</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">Tindakan Massal:</span>
              <button
                onClick={() => handleBulkStatusChange('In Progress')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-medium"
              >
                Set In Progress
              </button>
              <button
                onClick={() => handleBulkStatusChange('Selesai')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
              >
                Tandai Selesai
              </button>
              <button
                onClick={() => setSelectedTaskIds([])}
                className="p-1 text-slate-400 hover:text-white"
                title="Batalkan pilihan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* High-Density Data Grid Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-600">
                  <th className="p-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === sortedTasks.length && sortedTasks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('key')}
                    className="p-3 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Kode</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('title')}
                    className="p-3 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Judul Pekerjaan</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3 whitespace-nowrap">Tipe</th>
                  <th
                    onClick={() => handleSort('status')}
                    className="p-3 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3 whitespace-nowrap">Prioritas</th>
                  <th className="p-3 whitespace-nowrap">Assignee</th>
                  <th className="p-3 text-right whitespace-nowrap font-mono">Estimasi</th>
                  <th className="p-3 text-right whitespace-nowrap font-mono">Tercatat</th>
                  <th className="p-3 whitespace-nowrap">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400 italic">
                      Tidak ada pekerjaan yang cocok dengan kueri filter &quot;{jqlQuery}&quot;.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => {
                    const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                    const isSelected = selectedTaskIds.includes(task.id);

                    return (
                      <tr
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={`h-11 hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/70' : ''
                        }`}
                      >
                        <td
                          className="p-3 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(task.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                          />
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {task.key}
                        </td>

                        <td className="p-3 font-semibold text-slate-900 max-w-sm truncate">
                          {task.title}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            {task.type === 'Bug' ? (
                              <Bug className="w-3.5 h-3.5 text-rose-500" />
                            ) : task.type === 'Feature' ? (
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            ) : (
                              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="font-medium">{task.type}</span>
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/80">
                            {task.status}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[11px] px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                            {task.priority === 'Hotfix' && <Flame className="w-3 h-3 inline mr-1 text-rose-600" />}
                            {task.priority}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {assignee ? (
                            <div className="flex items-center gap-1.5">
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-slate-800 font-medium truncate max-w-[110px]">
                                {assignee.name.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="p-3 text-right font-mono text-slate-600 tabular-nums">
                          {task.estimateHours}j
                        </td>

                        <td className="p-3 text-right font-mono text-slate-600 tabular-nums">
                          {task.timeLoggedHours}j
                        </td>

                        <td className="p-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {task.dueDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Count */}
          <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan <strong className="font-mono text-slate-800">{sortedTasks.length}</strong> dari {projectTasks.length} pekerjaan
            </span>
            <span className="text-[11px] font-mono">
              Total estimasi: {sortedTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0)} jam
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
