import React from 'react';
import { Task, TeamMember, Epic } from '../../types';
import { 
  Bug, 
  Sparkles, 
  GitPullRequest, 
  Flame, 
  Clock, 
  CheckSquare, 
  FileCode,
  ShieldCheck,
  ChevronsUp,
  ArrowUp,
  Minus,
  ArrowDown,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  members: TeamMember[];
  epic?: Epic;
  onClick: () => void;
  onQuickMove?: (newStatus: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, members, epic, onClick }) => {
  const assignee = members.find((m) => m.id === task.assigneeId);

  // Jira standard priority icon & label
  const renderPriority = (priority: Task['priority']) => {
    switch (priority) {
      case 'Hotfix':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full" title="Prioritas: Blocker / Hotfix">
            <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>Blocker</span>
          </span>
        );
      case 'Tinggi':
        return (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-rose-700" title="Prioritas: Tinggi">
            <ChevronsUp className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
          </span>
        );
      case 'Sedang':
        return (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600" title="Prioritas: Sedang">
            <Minus className="w-3.5 h-3.5 text-amber-500 stroke-[3]" />
          </span>
        );
      case 'Rendah':
        return (
          <span className="flex items-center gap-0.5 text-[10px] text-zinc-400" title="Prioritas: Rendah">
            <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'baru saja';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}j`;
    return `${diffDays}h`;
  };

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

  // Subtle left border accent for critical urgency
  const isHotfix = task.priority === 'Hotfix' || (task.severity && task.severity.startsWith('S1'));
  const isPrReview = task.status === 'Menunggu Persetujuan';
  const isQaPhase = task.status === 'Deploy Staging' || task.status === 'QA/Testing';

  return (
    <div
      onClick={onClick}
      className={`group bg-white border rounded-xl p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-150 cursor-pointer relative select-none ${
        isHotfix
          ? 'border-l-2 border-l-rose-500 border-zinc-200/80'
          : isPrReview
          ? 'border-l-2 border-l-amber-500 border-zinc-200/80'
          : isQaPhase
          ? 'border-l-2 border-l-purple-500 border-zinc-200/80'
          : 'border-zinc-200/80'
      }`}
    >
      {/* 1. Epic / Module Lozenge */}
      {epic && (
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full font-mono truncate max-w-[170px]"
            style={{
              backgroundColor: `${epic.color}12`,
              color: epic.color,
              border: `1px solid ${epic.color}30`
            }}
            title={`Modul: ${epic.title}`}
          >
            {epic.key} · {epic.title}
          </span>

          {task.priority === 'Hotfix' && (
            <span className="flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded-full">
              Hotfix
            </span>
          )}
        </div>
      )}

      {/* 2. Issue Title (Readable & uncluttered, Linear style) */}
      <h4 className="text-xs font-medium text-zinc-900 group-hover:text-zinc-700 line-clamp-2 leading-snug mb-2.5 transition-colors">
        {task.title}
      </h4>

      {/* 3. Essential Software House Tags (Severity, Environment, QA, PR) */}
      {(task.severity || task.environment || task.qaSignOff || task.prNumber || task.warrantyStatus) && (
        <div className="flex items-center flex-wrap gap-1.5 text-[10px] mb-2.5 pt-2 border-t border-zinc-100">
          {/* Severity */}
          {task.severity && (
            <span className={`px-2 py-0.5 rounded-full font-medium border text-[10px] ${
              task.severity.startsWith('S1')
                ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                : task.severity.startsWith('S2')
                ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200/60'
            }`}>
              {task.severity.split(' ')[0]} {task.severity.includes('Blocker') ? 'Blocker' : task.severity.split(' ')[2] || ''}
            </span>
          )}

          {/* Environment */}
          {task.environment && (
            <span className="px-1.5 py-0.5 rounded-md font-mono font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60 text-[9px]">
              {task.environment === 'Production' ? 'PROD' : task.environment === 'Staging' ? 'STG' : 'QA'}
            </span>
          )}

          {/* QA Sign-off Badge */}
          {task.qaSignOff?.status === 'Passed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px]">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span>QA Passed</span>
            </span>
          )}

          {task.qaSignOff?.status === 'Failed (Reopen)' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px]">
              <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
              <span>QA Reopened</span>
            </span>
          )}

          {/* PR Indicator */}
          {task.prNumber && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60 text-[10px]">
              <GitPullRequest className="w-2.5 h-2.5 text-zinc-500" />
              <span>{task.prNumber}</span>
            </span>
          )}

          {/* Warranty */}
          {task.warrantyStatus && task.type === 'Bug' && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 truncate max-w-[90px]" title={task.warrantyStatus}>
              {task.warrantyStatus.includes('Garansi') ? 'Garansi Rp0' : 'Retainer'}
            </span>
          )}
        </div>
      )}

      {/* 4. Bottom Row (Linear/Jira Card Footer: Key, Type, Subtasks, Priority, Assignee) */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
        {/* Left: Type Icon + Issue Key + Subtasks */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-zinc-500 min-w-0">
          {task.type === 'Bug' ? (
            <div className="p-0.5 bg-rose-500/10 text-rose-600 rounded">
              <Bug className="w-3 h-3" />
            </div>
          ) : task.type === 'Feature' ? (
            <div className="p-0.5 bg-emerald-500/10 text-emerald-600 rounded">
              <Sparkles className="w-3 h-3" />
            </div>
          ) : (
            <div className="p-0.5 bg-sky-500/10 text-sky-600 rounded">
              <CheckSquare className="w-3 h-3" />
            </div>
          )}

          <span className="text-zinc-500 group-hover:text-zinc-800 transition-colors">
            {task.key}
          </span>

          {task.subtasks.length > 0 && (
            <span className="text-[10px] text-zinc-400 font-normal ml-1">
              {completedSubtasks}/{task.subtasks.length}
            </span>
          )}
        </div>

        {/* Right: Priority + Assignee Avatar */}
        <div className="flex items-center gap-2">
          {renderPriority(task.priority)}

          {assignee ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-5 h-5 rounded-full object-cover border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              title={`Ditugaskan: ${assignee.name} (${assignee.role})`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-zinc-100 border border-dashed border-zinc-300 flex items-center justify-center text-[9px] text-zinc-400" title="Belum ditugaskan">
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
