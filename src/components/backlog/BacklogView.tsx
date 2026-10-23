import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Sprint, TeamMember } from '../../types';
import { 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Bug, 
  Sparkles, 
  CheckSquare, 
  Layers, 
  Flag,
  Users,
  Code,
  Layout,
  ShieldCheck,
  Briefcase,
  Terminal,
  ArrowRight,
  Filter,
  Flame,
  Check
} from 'lucide-react';

interface BacklogViewProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ onSelectTask, onOpenCreateTask }) => {
  const { tasks, sprints, selectedProjectId, updateTask, teamMembers, addToast, epics, activeProject } = useApp();

  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const projectSprints = sprints.filter((s) => s.projectId === selectedProjectId);
  const projectEpics = epics.filter((e) => e.projectId === selectedProjectId);

  const activeSprint = projectSprints.find((s) => s.status === 'active') || projectSprints[0];
  const futureSprint = projectSprints.find((s) => s.status === 'future');

  const matchesFilters = (t: Task) => {
    if (filterAssignee !== 'all' && t.assigneeId !== filterAssignee) return false;
    if (filterEpic !== 'all' && t.epicId !== filterEpic) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    return true;
  };

  const activeSprintTasks = projectTasks.filter((t) => t.sprintId === activeSprint?.id && matchesFilters(t));
  const backlogPoolTasks = projectTasks.filter((t) => (!t.sprintId || (t.sprintId !== activeSprint?.id && t.sprintId !== futureSprint?.id)) && matchesFilters(t));

  const totalActiveHours = activeSprintTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);
  const totalBacklogHours = backlogPoolTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);

  const moveTaskToSprint = (taskId: string, sprintId?: string) => {
    updateTask(taskId, { sprintId });
    addToast('info', 'Task Dipindahkan', sprintId ? 'Task dimasukkan ke sprint aktif.' : 'Task dikembalikan ke backlog pool.');
  };

  const handleCompleteSprint = () => {
    addToast('success', 'Sprint Dituntaskan!', 'Pekerjaan yang belum tuntas otomatis dialihkan ke sprint berikutnya.');
  };

  // Helper for role styling & icons
  const getRoleBadge = (roleName?: string) => {
    const r = (roleName || '').toLowerCase();
    if (r.includes('backend')) {
      return {
        label: 'Backend Dev',
        icon: Code,
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500'
      };
    }
    if (r.includes('frontend')) {
      return {
        label: 'Frontend Dev',
        icon: Layout,
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500'
      };
    }
    if (r.includes('qa') || r.includes('test')) {
      return {
        label: 'QA',
        icon: ShieldCheck,
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500'
      };
    }
    if (r.includes('manajer') || r.includes('manager') || r.includes('pm')) {
      return {
        label: 'Project Manajer',
        icon: Briefcase,
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500'
      };
    }
    return {
      label: 'Full stack',
      icon: Terminal,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500'
    };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-medium text-zinc-900 tracking-tight">
                Backlog & Sprint Planning
              </h1>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80 font-mono">
                {activeProject?.code || 'PROJ'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Distribusi tugas hasil konversi CRM berdasarkan 5 model role teknis: <span className="text-zinc-700 font-medium">Jaka (Backend Dev)</span>, <span className="text-zinc-700 font-medium">Aldyana (Frontend Dev)</span>, <span className="text-zinc-700 font-medium">Parhan (QA)</span>, <span className="text-zinc-700 font-medium">Asisyah (Project Manajer)</span>, dan <span className="text-zinc-700 font-medium">Azi (Full stack)</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCompleteSprint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Selesaikan Sprint</span>
            </button>

            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-lg transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Item Backlog</span>
            </button>
          </div>
        </div>

        {/* 5-Role Workload Matrix Cards (Interactive Filters) */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-600" />
              <span className="text-xs font-medium text-zinc-900">
                Matriks Pembagian Tugas Sesuai Role Tim ({teamMembers.length} Role Terdistribusi)
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Klik kartu peran di bawah untuk menyaring backlog khusus role tersebut
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {teamMembers.map((member) => {
              const roleMeta = getRoleBadge(member.role);
              const RoleIcon = roleMeta.icon;
              const memberTasks = projectTasks.filter((t) => t.assigneeId === member.id);
              const totalHours = memberTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);
              const isSelected = filterAssignee === member.id;

              return (
                <button
                  key={member.id}
                  onClick={() => setFilterAssignee(isSelected ? 'all' : member.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-[0_2px_6px_rgba(0,0,0,0.12)] ring-2 ring-zinc-900/10'
                      : 'bg-zinc-50/70 hover:bg-white border-zinc-200/80 hover:border-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      isSelected ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : roleMeta.bg
                    } flex items-center gap-1 truncate`}>
                      <RoleIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{roleMeta.label}</span>
                    </span>
                  </div>

                  <div className={`font-medium text-xs truncate ${isSelected ? 'text-white' : 'text-zinc-900'}`}>{member.name}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>{member.role}</div>

                  <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                    isSelected ? 'border-zinc-800 text-zinc-300' : 'border-zinc-200/80 text-zinc-600'
                  }`}>
                    <span className="font-medium">{memberTasks.length} task</span>
                    <span className={isSelected ? 'text-zinc-400' : 'text-zinc-400'}>{totalHours} jam</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Toolbar (Developer, Modul, Type) */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-zinc-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span>Filter:</span>
            </span>
            
            {/* Developer Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all duration-150"
              >
                <option value="all">Semua Role & Developer ({projectTasks.length} task)</option>
                {teamMembers.map((member) => {
                  const mTasks = projectTasks.filter(t => t.assigneeId === member.id);
                  const roleMeta = getRoleBadge(member.role);
                  return (
                    <option key={member.id} value={member.id}>
                      {member.name} · {roleMeta.label} ({mTasks.length} task)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Modul Filter */}
            {projectEpics.length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={filterEpic}
                  onChange={(e) => setFilterEpic(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 max-w-[220px] truncate transition-all duration-150"
                >
                  <option value="all">Semua Modul / Microservices ({projectEpics.length})</option>
                  {projectEpics.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.key}: {ep.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all duration-150"
              >
                <option value="all">Semua Tipe</option>
                <option value="Feature">Feature</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
              </select>
            </div>

            {(filterAssignee !== 'all' || filterEpic !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => {
                  setFilterAssignee('all');
                  setFilterEpic('all');
                  setFilterType('all');
                }}
                className="text-zinc-600 hover:text-zinc-900 hover:underline font-medium text-[11px] transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>

          <span className="text-zinc-500 text-[11px]">
            Menampilkan: <strong className="text-zinc-900 font-medium">{activeSprintTasks.length + backlogPoolTasks.length}</strong> task
          </span>
        </div>

        {/* Section 1: Active Sprint */}
        {activeSprint && (
          <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="p-4 px-5 bg-zinc-50/70 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <h2 className="text-sm font-medium text-zinc-900">{activeSprint.name}</h2>
                <span className="text-[11px] font-mono font-medium text-zinc-700 bg-white px-2.5 py-0.5 rounded-full border border-zinc-200/80">
                  {activeSprintTasks.length} task · {totalActiveHours} jam kerja
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {activeSprint.startDate} s/d {activeSprint.endDate}
                </span>
              </div>
            </div>

            {/* Sprint Goal Banner */}
            <div className="px-5 py-2.5 bg-zinc-50/40 border-b border-zinc-100 flex items-center gap-2 text-xs text-zinc-700 font-medium">
              <Flag className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Sprint Goal: <span className="font-normal text-zinc-600">{activeSprint.goal}</span></span>
            </div>

            {/* Task rows */}
            <div className="divide-y divide-zinc-100">
              {activeSprintTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 italic">
                  Belum ada task di sprint aktif ini yang sesuai filter. Masukkan task dari Backlog Pool di bawah.
                </div>
              ) : (
                activeSprintTasks.map((task) => {
                  const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                  const taskEpic = projectEpics.find((e) => e.id === task.epicId);
                  const roleMeta = getRoleBadge(assignee?.role);
                  const RoleIcon = roleMeta.icon;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-3.5 px-5 hover:bg-zinc-50/80 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-mono font-medium text-zinc-500 shrink-0 w-20">{task.key}</span>
                        {taskEpic && (
                          <span 
                            className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0 truncate max-w-[120px]"
                            style={{ 
                              backgroundColor: `${taskEpic.color}12`, 
                              color: taskEpic.color, 
                              borderColor: `${taskEpic.color}35` 
                            }}
                            title={`Modul: ${taskEpic.title}`}
                          >
                            {taskEpic.key}
                          </span>
                        )}
                        {task.type === 'Bug' ? (
                          <div className="p-0.5 bg-rose-50 text-rose-600 rounded">
                            <Bug className="w-3.5 h-3.5 shrink-0" />
                          </div>
                        ) : task.type === 'Feature' ? (
                          <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          </div>
                        ) : (
                          <div className="p-0.5 bg-sky-50 text-sky-600 rounded">
                            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                          </div>
                        )}
                        <span className="font-medium text-zinc-900 group-hover:text-zinc-700 truncate">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Role Badge */}
                        <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${roleMeta.bg} flex items-center gap-1 hidden md:inline-flex`}>
                          <RoleIcon className="w-2.5 h-2.5" />
                          <span>{roleMeta.label}</span>
                        </span>

                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          task.priority === 'Hotfix' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200/60' 
                            : 'text-zinc-600 bg-zinc-100 border-zinc-200/60'
                        }`}>
                          {task.priority}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium border border-zinc-200/60">
                          {task.status}
                        </span>

                        <span className="font-mono font-medium text-zinc-600 text-xs w-12 text-right">
                          {task.estimateHours}j
                        </span>

                        {assignee ? (
                          <div className="flex items-center gap-1.5">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover border border-zinc-200 shadow-xs"
                              referrerPolicy="no-referrer"
                              title={`${assignee.name} (${roleMeta.label})`}
                            />
                            <span className="text-[11px] font-medium text-zinc-700 hidden lg:inline">
                              {assignee.name}
                            </span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-200" />
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveTaskToSprint(task.id, undefined);
                          }}
                          className="text-[11px] text-zinc-400 hover:text-zinc-800 px-2 py-1 rounded-md hover:bg-zinc-100 font-medium transition-colors"
                          title="Kembalikan ke Backlog Pool"
                        >
                          Ke Backlog
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Section 2: Backlog Pool */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="p-4 px-5 bg-zinc-50/70 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-medium text-zinc-900">Backlog Pool (Pekerjaan Siap Dijadwalkan)</h2>
              <span className="text-[11px] font-mono font-medium text-zinc-600 bg-white px-2.5 py-0.5 rounded-full border border-zinc-200/80">
                {backlogPoolTasks.length} task · {totalBacklogHours} jam
              </span>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {backlogPoolTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400 italic">
                Backlog kosong atau filter tidak cocok. Semua pekerjaan telah dimasukkan ke dalam sprint.
              </div>
            ) : (
              backlogPoolTasks.map((task) => {
                const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                const taskEpic = projectEpics.find((e) => e.id === task.epicId);
                const roleMeta = getRoleBadge(assignee?.role);
                const RoleIcon = roleMeta.icon;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3.5 px-5 hover:bg-zinc-50/80 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-mono font-medium text-zinc-500 shrink-0 w-20">{task.key}</span>
                      {taskEpic && (
                        <span 
                          className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0 truncate max-w-[120px]"
                          style={{ 
                            backgroundColor: `${taskEpic.color}12`, 
                            color: taskEpic.color, 
                            borderColor: `${taskEpic.color}35` 
                          }}
                          title={`Modul: ${taskEpic.title}`}
                        >
                          {taskEpic.key}
                        </span>
                      )}
                      {task.type === 'Bug' ? (
                        <div className="p-0.5 bg-rose-50 text-rose-600 rounded">
                          <Bug className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      ) : task.type === 'Feature' ? (
                        <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      ) : (
                        <div className="p-0.5 bg-sky-50 text-sky-600 rounded">
                          <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      )}
                      <span className="font-medium text-zinc-900 group-hover:text-zinc-700 truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Role Badge */}
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${roleMeta.bg} flex items-center gap-1 hidden md:inline-flex`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        <span>{roleMeta.label}</span>
                      </span>

                      <span className="text-[10px] text-zinc-600 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-full font-medium">
                        {task.priority}
                      </span>

                      <span className="font-mono font-medium text-zinc-600 text-xs w-12 text-right">
                        {task.estimateHours}j
                      </span>

                      {assignee && (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-5 h-5 rounded-full object-cover border border-zinc-200 shadow-xs"
                            referrerPolicy="no-referrer"
                            title={`${assignee.name} (${roleMeta.label})`}
                          />
                          <span className="text-[11px] font-medium text-zinc-700 hidden lg:inline">
                            {assignee.name}
                          </span>
                        </div>
                      )}

                      {activeSprint && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveTaskToSprint(task.id, activeSprint.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-800 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1 rounded-lg border border-zinc-200/80 transition-all duration-150"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Masukkan Sprint</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
