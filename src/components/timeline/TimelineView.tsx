import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Project, TeamMember, Epic } from '../../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  CheckSquare, 
  Clock, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Search,
  Filter,
  Users,
  AlertCircle,
  FolderGit2,
  CalendarRange,
  ArrowUpRight,
  ChevronDown,
  ListFilter,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface TimelineViewProps {
  onSelectTask: (task: Task) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectTask }) => {
  const { tasks, epics, projects, selectedProjectId, setSelectedProjectId, teamMembers } = useApp();

  // Filter 3 Proyek Dumy: Perpus, Futsal, dan POS
  const availableProjects = useMemo(() => {
    return projects.filter(p => 
      p.id === 'proj-perpustakaan' || 
      p.id === 'proj-futsal' || 
      p.id === 'proj-1' ||
      p.code === 'LIB-DIG' ||
      p.code === 'FTSL-PRO' ||
      p.code === 'POS-KLN'
    );
  }, [projects]);

  // Project selector: can be single project or 'all'
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>(selectedProjectId || 'proj-perpustakaan');
  const [groupingMode, setGroupingMode] = useState<'epic' | 'assignee' | 'status'>('epic');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Timeline Date Grid Window (Oct 10, 2026 to Nov 08, 2026 = 30 Hari)
  const timelineStartDate = new Date(2026, 9, 10); // 10 Okt 2026
  const totalDays = 30; // 10 Okt - 08 Nov 2026
  const todayDateStr = '2026-10-20'; // Current simulated date (20 Okt 2026)

  // Generate calendar days array
  const calendarDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; dayName: string; isWeekend: boolean; isToday: boolean }[] = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(timelineStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isToday: dateStr === todayDateStr
      });
    }
    return days;
  }, [totalDays]);

  // Filter tasks based on project, status, and search
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter project
      if (activeProjectFilter !== 'all' && task.projectId !== activeProjectFilter) {
        return false;
      }
      // Only include tasks from the 3 allowed projects
      const isAllowedProject = 
        task.projectId === 'proj-perpustakaan' || 
        task.projectId === 'proj-futsal' || 
        task.projectId === 'proj-1';
      if (!isAllowedProject) return false;

      // Filter status
      if (statusFilter !== 'all') {
        if (statusFilter === 'in_progress' && task.status !== 'In Progress' && task.status !== 'Dianalisis') return false;
        if (statusFilter === 'done' && task.status !== 'Selesai') return false;
        if (statusFilter === 'qa' && task.status !== 'QA/Testing' && task.status !== 'Menunggu Persetujuan') return false;
        if (statusFilter === 'backlog' && task.status !== 'Backlog' && task.status !== 'To Do' && task.status !== 'Baru') return false;
      }

      // Filter search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchKey = task.key.toLowerCase().includes(q);
        if (!matchTitle && !matchKey) return false;
      }

      return true;
    });
  }, [tasks, activeProjectFilter, statusFilter, searchQuery]);

  // Overall Stats
  const totalTasksCount = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter(t => t.status === 'Selesai').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'In Progress' || t.status === 'Dianalisis').length;
  const hotfixCount = filteredTasks.filter(t => t.priority === 'Hotfix' || t.priority === 'Tinggi').length;
  const totalEstimatedHours = filteredTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);
  const totalLoggedHours = filteredTasks.reduce((acc, t) => acc + (t.timeLoggedHours || 0), 0);
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Toggle group collapse
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Calculate Bar Position & Width based on Dates
  const calculateBarPosition = (startDateStr?: string, dueDateStr?: string) => {
    const parseDateToDayIndex = (dStr?: string, fallbackIndex = 0) => {
      if (!dStr) return fallbackIndex;
      const parts = dStr.split('-');
      if (parts.length !== 3) return fallbackIndex;
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const diffTime = dateObj.getTime() - timelineStartDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      return Math.max(0, Math.min(totalDays - 1, diffDays));
    };

    const startIndex = parseDateToDayIndex(startDateStr, 2);
    const endIndex = parseDateToDayIndex(dueDateStr, startIndex + 5);
    const spanDays = Math.max(1, endIndex - startIndex + 1);

    const leftPercent = (startIndex / totalDays) * 100;
    const widthPercent = (spanDays / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(3.5, widthPercent)}%`,
      startIndex,
      endIndex,
      spanDays
    };
  };

  // Grouped Tasks for Display
  const groupedData = useMemo(() => {
    if (groupingMode === 'epic') {
      // Group by Epic
      const currentEpics = epics.filter(e => activeProjectFilter === 'all' || e.projectId === activeProjectFilter);
      return currentEpics.map(epic => {
        const groupTasks = filteredTasks.filter(t => t.epicId === epic.id);
        const groupProj = availableProjects.find(p => p.id === epic.projectId);
        return {
          id: epic.id,
          title: epic.title,
          badge: epic.key,
          color: epic.color || '#2563eb',
          subtext: groupProj ? groupProj.name : '',
          tasks: groupTasks
        };
      }).filter(g => g.tasks.length > 0 || activeProjectFilter !== 'all');
    }

    if (groupingMode === 'assignee') {
      // Group by Team Member
      return teamMembers.map(member => {
        const groupTasks = filteredTasks.filter(t => t.assigneeId === member.id);
        return {
          id: member.id,
          title: member.name,
          badge: member.role,
          avatar: member.avatar,
          color: member.role.toLowerCase().includes('backend') ? '#0284c7' : member.role.toLowerCase().includes('frontend') ? '#06b6d4' : '#6366f1',
          subtext: `@${member.githubUsername || member.name.toLowerCase()}`,
          tasks: groupTasks
        };
      }).filter(g => g.tasks.length > 0);
    }

    // Default: Group by Status
    const statuses: Task['status'][] = ['Baru', 'In Progress', 'Dianalisis', 'QA/Testing', 'Menunggu Persetujuan', 'Selesai', 'Backlog'];
    return statuses.map(status => {
      const groupTasks = filteredTasks.filter(t => t.status === status);
      return {
        id: status,
        title: status,
        badge: `${groupTasks.length} Task`,
        color: status === 'Selesai' ? '#10b981' : status === 'In Progress' ? '#3b82f6' : status === 'Menunggu Persetujuan' ? '#f59e0b' : '#64748b',
        subtext: 'Status Pengerjaan',
        tasks: groupTasks
      };
    }).filter(g => g.tasks.length > 0);
  }, [groupingMode, epics, filteredTasks, activeProjectFilter, availableProjects, teamMembers]);

  // Today position percentage
  const todayIndex = useMemo(() => {
    const todayParts = todayDateStr.split('-');
    const todayObj = new Date(parseInt(todayParts[0]), parseInt(todayParts[1]) - 1, parseInt(todayParts[2]));
    const diffTime = todayObj.getTime() - timelineStartDate.getTime();
    return Math.round(diffTime / (1000 * 3600 * 24));
  }, [todayDateStr, timelineStartDate]);

  const todayPercent = (todayIndex / totalDays) * 100;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-4 md:p-6 text-zinc-900 font-sans">
      <div className="max-w-[96rem] mx-auto space-y-6">

        {/* 1. Header Toolbar (Linear / Vercel style) */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-semibold shadow-xs">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <h1 className="text-base font-semibold text-zinc-900 tracking-tight">
                  Timeline & Gantt Roadmap Proyek
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Periode: 10 Okt - 08 Nov 2026
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  3 Proyek Aktif Terintegrasi
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Visualisasi jadwal sprint pengerjaan, ketergantungan antar modul, dan milestone pengiriman untuk 3 proyek utama.
              </p>
            </div>

            {/* Quick 3-Project Switcher Pills */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 text-xs gap-1 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveProjectFilter('proj-perpustakaan');
                  setSelectedProjectId('proj-perpustakaan');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeProjectFilter === 'proj-perpustakaan'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>📚</span>
                <span>1. Perpustakaan Digital</span>
              </button>

              <button
                onClick={() => {
                  setActiveProjectFilter('proj-futsal');
                  setSelectedProjectId('proj-futsal');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeProjectFilter === 'proj-futsal'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>⚽</span>
                <span>2. Arena Futsal Pro</span>
              </button>

              <button
                onClick={() => {
                  setActiveProjectFilter('proj-1');
                  setSelectedProjectId('proj-1');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeProjectFilter === 'proj-1'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>☕</span>
                <span>3. POS Kopi Kenangan</span>
              </button>

              <button
                onClick={() => setActiveProjectFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeProjectFilter === 'all'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Semua (3 Proyek)
              </button>
            </div>
          </div>

          {/* Controls: Search, Status Filter, Grouping Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Search box */}
              <div className="relative min-w-[200px] sm:min-w-[260px]">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari task (nama atau kode)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-1.5 px-2 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="all">Semua Status ({tasks.length})</option>
                  <option value="in_progress">Sedang Dikerjakan</option>
                  <option value="qa">QA / Review Approval</option>
                  <option value="done">Selesai</option>
                  <option value="backlog">Backlog / To Do</option>
                </select>
              </div>

              {/* Grouping Mode */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-500 font-medium">Kelompokkan:</span>
                <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                  <button
                    onClick={() => setGroupingMode('epic')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      groupingMode === 'epic' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Modul Epic
                  </button>
                  <button
                    onClick={() => setGroupingMode('assignee')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      groupingMode === 'assignee' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Engineer Tim
                  </button>
                  <button
                    onClick={() => setGroupingMode('status')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      groupingMode === 'status' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    Status
                  </button>
                </div>
              </div>
            </div>

            {/* Legend Guide */}
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Selesai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                <span>QA / Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Hotfix / Kritis</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Garis Merah: Hari Ini (20 Okt)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Project Metrics & Milestone Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Progress */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Progres Penyelesaian
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-zinc-900">{completionPercentage}%</span>
              <span className="text-xs text-zinc-500 font-medium">({completedTasksCount} dari {totalTasksCount} task)</span>
            </div>
            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Aktif Dikerjakan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-blue-600">{inProgressCount}</span>
              <span className="text-xs text-zinc-500">task berjalan sprint ini</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Distributed lock, OPAC UI, dan QRIS gateway.
            </p>
          </div>

          {/* Workload Hours */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Alokasi Estimasi Waktu
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-zinc-900">{totalEstimatedHours} Jam</span>
              <span className="text-xs text-zinc-500">({totalLoggedHours}j logged)</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Beban kerja dibagi rata ke 5 role spesialis.
            </p>
          </div>

          {/* Milestone Release */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Target Milestone UAT
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-purple-700">01 Nov 2026</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/80">
                H-12 Hari
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Sign-off UAT Termin 2 dan deployment Staging.
            </p>
          </div>
        </div>

        {/* 3. Gantt Chart Canvas (Split Pane: Left Tree + Right Timeline Canvas) */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
          
          {/* Top Date Header Row */}
          <div className="flex border-b border-zinc-200/80 bg-zinc-50/80 sticky top-0 z-20">
            {/* Left Header: Task List column title */}
            <div className="w-[320px] sm:w-[380px] shrink-0 p-3 px-5 border-r border-zinc-200/80 flex items-center justify-between text-xs font-semibold text-zinc-700">
              <span>Task / Modul Pengerjaan</span>
              <span className="text-[10px] font-mono text-zinc-400">Tenggat & Assignee</span>
            </div>

            {/* Right Header: 30 Calendar Days Grid */}
            <div className="flex-1 overflow-x-auto relative select-none">
              <div className="grid grid-cols-30 min-w-[750px] text-center" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(25px, 1fr))` }}>
                {calendarDays.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`py-2 px-0.5 text-[10px] border-r border-zinc-100 flex flex-col items-center justify-center transition-colors ${
                      day.isToday
                        ? 'bg-amber-100/70 font-bold text-amber-900 border-amber-300'
                        : day.isWeekend
                        ? 'bg-zinc-100/60 text-zinc-400'
                        : 'text-zinc-600'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-semibold leading-none">{day.dayName}</span>
                    <span className={`text-[11px] font-mono font-bold mt-0.5 ${day.isToday ? 'text-amber-900 font-extrabold' : ''}`}>
                      {day.dayNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gantt Body: Grouped Rows */}
          <div className="divide-y divide-zinc-100">
            {groupedData.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-zinc-300" />
                <p className="text-xs">Tidak ada task yang cocok dengan kriteria pencarian.</p>
              </div>
            ) : (
              groupedData.map((group) => {
                const isCollapsed = collapsedGroups[group.id];
                const groupTaskCount = group.tasks.length;

                return (
                  <div key={group.id} className="space-y-0">
                    {/* Group Header Row */}
                    <div 
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center bg-zinc-50/70 hover:bg-zinc-100/70 cursor-pointer border-y border-zinc-200/50 py-2.5 px-5 transition-colors select-none"
                    >
                      <div className="w-[320px] sm:w-[380px] shrink-0 flex items-center gap-2.5 pr-4">
                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: group.color }} 
                        />
                        <span className="font-semibold text-xs text-zinc-900 truncate">
                          {group.title}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 bg-white px-1.5 py-0.2 rounded border border-zinc-200 shrink-0">
                          {groupTaskCount}
                        </span>
                      </div>

                      <div className="flex-1 text-[11px] text-zinc-400 font-mono italic truncate">
                        {group.subtext}
                      </div>
                    </div>

                    {/* Group Task Rows (Visible when not collapsed) */}
                    {!isCollapsed && (
                      <div className="divide-y divide-zinc-100">
                        {group.tasks.map((task) => {
                          const { left, width, spanDays } = calculateBarPosition(task.startDate, task.dueDate);
                          const assignee = teamMembers.find(m => m.id === task.assigneeId);
                          const isDone = task.status === 'Selesai';
                          const isHotfix = task.priority === 'Hotfix' || task.priority === 'Tinggi';
                          const isReview = task.status === 'Menunggu Persetujuan' || task.status === 'QA/Testing';

                          const barBgColor = isDone
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : isHotfix
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : isReview
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : task.status === 'In Progress'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-zinc-600 hover:bg-zinc-700';

                          return (
                            <div 
                              key={task.id}
                              className="flex items-center hover:bg-zinc-50/70 transition-colors group relative"
                            >
                              {/* Left Task Meta Column */}
                              <div 
                                onClick={() => onSelectTask(task)}
                                className="w-[320px] sm:w-[380px] shrink-0 p-2.5 px-5 border-r border-zinc-200/80 flex items-center justify-between gap-3 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">
                                    {task.key}
                                  </span>
                                  <span className="text-xs font-medium text-zinc-800 group-hover:text-blue-600 truncate transition-colors">
                                    {task.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {assignee && (
                                    <img
                                      src={assignee.avatar}
                                      alt={assignee.name}
                                      title={assignee.name}
                                      className="w-5 h-5 rounded-full object-cover border border-zinc-200 shrink-0"
                                    />
                                  )}
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    {task.dueDate.slice(5)}
                                  </span>
                                </div>
                              </div>

                              {/* Right Gantt Bar Visual Column */}
                              <div className="flex-1 relative h-9 flex items-center min-w-[750px] px-0.5">
                                {/* Weekend Shading & Today line backdrop */}
                                <div className="absolute inset-0 grid grid-cols-30 pointer-events-none" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(25px, 1fr))` }}>
                                  {calendarDays.map((d, dIdx) => (
                                    <div 
                                      key={dIdx} 
                                      className={`h-full border-r border-zinc-100/80 ${d.isWeekend ? 'bg-zinc-50/40' : ''}`} 
                                    />
                                  ))}
                                </div>

                                {/* Today Red Marker Line */}
                                <div 
                                  className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80 z-10 pointer-events-none"
                                  style={{ left: `${todayPercent}%` }}
                                />

                                {/* Interactive Gantt Bar */}
                                <div
                                  onClick={() => onSelectTask(task)}
                                  className={`absolute h-6 rounded-md px-2 flex items-center justify-between text-[10px] font-medium text-white shadow-xs transition-all cursor-pointer z-10 ${barBgColor}`}
                                  style={{
                                    left,
                                    width
                                  }}
                                  title={`${task.key}: ${task.title}\nStatus: ${task.status}\nTenggat: ${task.dueDate} (${spanDays} Hari)`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-200 shrink-0" />}
                                    {isHotfix && !isDone && <Flame className="w-3 h-3 text-rose-200 shrink-0" />}
                                    <span className="truncate text-[10px]">{task.status}</span>
                                  </div>
                                  <span className="font-mono text-[9px] opacity-85 pl-1.5 shrink-0">
                                    {task.estimateHours}j
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Timeline Explanatory Footer Card */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-zinc-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Klik bar tugas mana saja untuk membuka popup detail lengkap, mengubah status, melihat subtask, atau membuat Pull Request.
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-mono">
            <span>Proyek Aktif: <strong>{activeProjectFilter === 'all' ? '3 Proyek' : availableProjects.find(p => p.id === activeProjectFilter)?.name}</strong></span>
            <span>·</span>
            <span>Total Task: <strong>{filteredTasks.length} Task</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
