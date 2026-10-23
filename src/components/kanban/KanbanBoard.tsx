import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { 
  Filter, 
  Search, 
  Layers, 
  Plus, 
  SlidersHorizontal,
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  X,
  AlertTriangle,
  DollarSign,
  Percent
} from 'lucide-react';
import { CreateMilestoneInvoiceModal } from '../finance/CreateMilestoneInvoiceModal';

interface KanbanBoardProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

// Columns grouping according to the PRD workflow
const KANBAN_COLUMNS: { id: string; label: string; statuses: TaskStatus[]; color: string; limit?: number }[] = [
  {
    id: 'backlog',
    label: 'Backlog / Baru',
    statuses: ['Backlog', 'Baru'],
    color: 'border-t-slate-400'
  },
  {
    id: 'analysis_dev',
    label: 'Dianalisis & To Do',
    statuses: ['To Do', 'Dianalisis'],
    color: 'border-t-sky-500'
  },
  {
    id: 'in_progress',
    label: 'Pengerjaan (In Progress)',
    statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'],
    color: 'border-t-indigo-500',
    limit: 6
  },
  {
    id: 'review_approval',
    label: 'Review / Persetujuan PR',
    statuses: ['In Review', 'Menunggu Persetujuan', 'Disetujui'],
    color: 'border-t-amber-500',
    limit: 5
  },
  {
    id: 'testing_deploy',
    label: 'QA & Deploy (Staging/Prod)',
    statuses: ['QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau'],
    color: 'border-t-purple-500'
  },
  {
    id: 'done',
    label: 'Selesai & Diverifikasi',
    statuses: ['Selesai'],
    color: 'border-t-emerald-500'
  }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onSelectTask, onOpenCreateTask }) => {
  const { tasks, selectedProjectId, teamMembers, activeProject, updateTaskStatus, role, epics, getProjectProgress } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  const projectProgress = getProjectProgress(selectedProjectId);

  // Filter tasks and epics for the selected project
  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const projectEpics = epics.filter((e) => e.projectId === selectedProjectId);

  // Apply filters
  const filteredTasks = projectTasks.filter((task) => {
    // If client role, only show client_public tasks
    if (role === 'client' && task.visibility !== 'client_public') {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchKey = task.key.toLowerCase().includes(q);
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      if (!matchKey && !matchTitle && !matchDesc) return false;
    }

    if (filterType !== 'all' && task.type !== filterType) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterSeverity !== 'all' && task.severity !== filterSeverity) return false;
    if (filterAssignee !== 'all' && task.assigneeId !== filterAssignee) return false;
    if (filterEpic !== 'all' && task.epicId !== filterEpic) return false;

    return true;
  });

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColId(colId);
  };

  const handleDragLeave = () => {
    setDragOverColId(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
    }
  };

  const pendingApprovalTotal = filteredTasks.filter((t) => t.status === 'Menunggu Persetujuan').length;

  // Selected developer multi-module insights
  const selectedMember = teamMembers.find((m) => m.id === filterAssignee);
  const memberTasksInProject = projectTasks.filter((t) => t.assigneeId === filterAssignee);
  const distinctEpicIds = Array.from(new Set(memberTasksInProject.map((t) => t.epicId).filter(Boolean)));
  const memberEpicsInProject = projectEpics.filter((e) => distinctEpicIds.includes(e.id));

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-zinc-50">
      {/* Board Controls Toolbar (Linear / Vercel style) */}
      <div className="bg-white border-b border-zinc-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari task atau kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-7 py-1.5 text-xs bg-zinc-50 border border-zinc-200/80 rounded-lg w-44 focus:w-56 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all duration-150 placeholder:text-zinc-400 text-zinc-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
            <button
              onClick={() => {
                setFilterType('all');
                setFilterPriority('all');
                setFilterSeverity('all');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 ${
                filterType === 'all' && filterPriority === 'all' && filterSeverity === 'all'
                  ? 'bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => {
                setFilterType('Bug');
                setFilterPriority('all');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 ${
                filterType === 'Bug'
                  ? 'bg-white text-rose-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Bug Saja
            </button>
            <button
              onClick={() => {
                setFilterPriority('Hotfix');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 ${
                filterPriority === 'Hotfix'
                  ? 'bg-white text-rose-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              🔥 Blocker
            </button>
            <button
              onClick={() => {
                setFilterType('Feature');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 ${
                filterType === 'Feature'
                  ? 'bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              ✨ Fitur
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

          {/* Developer Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 max-w-[170px] truncate transition-all duration-150"
          >
            <option value="all">Semua Developer</option>
            {teamMembers.map((member) => {
              const memberTasks = projectTasks.filter(t => t.assigneeId === member.id);
              const distinctEpics = Array.from(new Set(memberTasks.map(t => t.epicId).filter(Boolean)));
              if (memberTasks.length === 0) return null;
              return (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.role} ({distinctEpics.length} modul)
                </option>
              );
            })}
          </select>

          {/* Epic / Modul Filter */}
          {projectEpics.length > 0 && (
            <select
              value={filterEpic}
              onChange={(e) => setFilterEpic(e.target.value)}
              className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 max-w-[160px] truncate transition-all duration-150"
            >
              <option value="all">Semua Modul ({projectEpics.length})</option>
              {projectEpics.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.key}: {ep.title}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters button if any active */}
          {(searchQuery || filterType !== 'all' || filterPriority !== 'all' || filterSeverity !== 'all' || filterAssignee !== 'all' || filterEpic !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterPriority('all');
                setFilterSeverity('all');
                setFilterAssignee('all');
                setFilterEpic('all');
              }}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium px-2 py-1 hover:underline transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Right Info: Project stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 font-normal">
            <span className="font-medium text-zinc-900 font-mono tabular-nums">{filteredTasks.length}</span>
            <span>dari {projectTasks.length} tiket</span>
          </div>

          {pendingApprovalTotal > 0 && (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingApprovalTotal} PR Review</span>
            </div>
          )}

          {/* Quick Invoice Termin Trigger Button */}
          {role !== 'client' && (
            <button
              onClick={() => setShowMilestoneModal(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                projectProgress > 10
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 border border-zinc-200'
              }`}
              title={
                projectProgress > 10
                  ? `Progres ${projectProgress}% (> 10%): Klik untuk menerbitkan invoice termin ke Finance & CRM`
                  : `Progres saat ini ${projectProgress}% (SOP: Minimal > 10%). Klik untuk tinjau SOP`
              }
            >
              <DollarSign className={`w-3.5 h-3.5 ${projectProgress > 10 ? 'text-emerald-600' : 'text-zinc-400'}`} />
              <span>Invoice ({projectProgress}%)</span>
            </button>
          )}

          {role !== 'client' && (
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-lg transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-Module Developer Focus Banner (shown when a developer is filtered) */}
      {selectedMember && (
        <div className="bg-zinc-100/90 border-b border-zinc-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-800">
          <div className="flex items-center gap-3">
            <img 
              src={selectedMember.avatar} 
              alt={selectedMember.name} 
              className="w-6 h-6 rounded-full object-cover border border-zinc-200 shadow-xs" 
            />
            <div className="flex items-center gap-2">
              <span>
                Pekerjaan <strong className="font-medium text-zinc-900">{selectedMember.name}</strong> ({selectedMember.role}): Memegang <strong className="font-medium text-zinc-900">{memberEpicsInProject.length} modul</strong> di proyek ini
              </span>
              <div className="flex items-center gap-1.5">
                {memberEpicsInProject.map((ep) => (
                  <span 
                    key={ep.id} 
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white text-zinc-800 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    title={ep.title}
                  >
                    {ep.key}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setFilterAssignee('all')}
            className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:underline transition-colors"
          >
            Tampilkan Semua Developer
          </button>
        </div>
      )}

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-[1240px]">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => col.statuses.includes(t.status));
            const isOverWip = col.limit ? colTasks.length > col.limit : false;
            const isDragOver = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.statuses[0])}
                className={`flex-1 flex flex-col bg-zinc-100/50 rounded-2xl border transition-all duration-150 min-w-[230px] max-w-[280px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                  isDragOver ? 'border-zinc-400 bg-zinc-100 ring-2 ring-zinc-900/10' : 'border-zinc-200/80'
                }`}
              >
                {/* Column Header */}
                <div className={`p-3.5 bg-white rounded-t-2xl border-b border-zinc-200/80 border-t-2 ${col.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-900 tracking-tight">
                      {col.label}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                      isOverWip ? 'bg-rose-50 text-rose-700 border border-rose-200/60' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {colTasks.length}{col.limit ? `/${col.limit}` : ''}
                    </span>
                  </div>

                  {role !== 'client' && (
                    <button
                      onClick={onOpenCreateTask}
                      className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md hover:bg-zinc-100 transition-colors"
                      title="Tambah task ke kolom ini"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Over-WIP Warning Banner */}
                {isOverWip && (
                  <div className="px-3 py-1 bg-rose-50 border-b border-rose-200/60 flex items-center gap-1.5 text-[10px] text-rose-700 font-medium">
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>Melebihi batas WIP ({col.limit})</span>
                  </div>
                )}

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                  {colTasks.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs italic gap-1">
                      <span>Kolom Kosong</span>
                      <span className="text-[10px] text-zinc-300">Drag task ke sini</span>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id);
                        }}
                      >
                        <TaskCard
                          task={task}
                          members={teamMembers}
                          epic={projectEpics.find((e) => e.id === task.epicId)}
                          onClick={() => onSelectTask(task)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Invoice Termin Modal */}
      <CreateMilestoneInvoiceModal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        defaultProjectId={selectedProjectId}
      />
    </div>
  );
};
