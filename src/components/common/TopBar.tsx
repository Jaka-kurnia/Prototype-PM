import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Plus, User, RefreshCw, Menu, ChevronRight, Bell } from 'lucide-react';
import { NotificationPopover } from './NotificationPopover';

interface TopBarProps {
  activeTab: string;
  onOpenCreateTask: () => void;
  onOpenIntakeModal: () => void;
  onToggleMobileSidebar: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenCreateTask,
  onOpenIntakeModal,
  onToggleMobileSidebar,
  onNavigateTab
}) => {
  const { role, setRole, activeProject, resetDataToDefault, projects, selectedProjectId, setSelectedProjectId, notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const tabTitles: Record<string, string> = {
    kanban: 'Kanban Board',
    backlog: 'Backlog & Sprints',
    timeline: 'Timeline & Gantt',
    list: 'Daftar Pekerjaan',
    ai_hub: 'Otomasi Fix Bug (AI Hub)',
    finance: 'Finance & Invoices',
    crm: 'Integrasi CRM (Deals Won)',
    team: 'Tim HR & Workload',
    github: 'Pengaturan GitHub & Otomasi Branch'
  };

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    owner: { label: 'Owner / Admin', badge: 'bg-purple-100 text-purple-800' },
    pm: { label: 'Project Manager', badge: 'bg-blue-100 text-blue-800' },
    developer: { label: 'Developer', badge: 'bg-emerald-100 text-emerald-800' },
    qa: { label: 'QA / Tester', badge: 'bg-amber-100 text-amber-800' },
    finance: { label: 'Finance', badge: 'bg-teal-100 text-teal-800' },
    sales: { label: 'Sales (CRM)', badge: 'bg-rose-100 text-rose-800' },
    client: { label: 'Klien (Portal)', badge: 'bg-slate-100 text-slate-800' }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-4 px-6 h-14">
        {/* Left: Mobile hamburger & Contextual Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 -ml-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg lg:hidden transition-all duration-150"
            title="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Contextual Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-xs truncate">
            {/* Project Switcher Selector */}
            <div className="relative flex items-center">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-medium text-zinc-800 bg-zinc-50 hover:bg-zinc-100/80 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 appearance-none pr-6 truncate max-w-[210px] transition-all duration-150"
                title="Pindah Proyek"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="text-zinc-800">
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none rotate-90" />
            </div>

            <span className="text-zinc-300 font-light">/</span>

            <span className="font-medium text-zinc-900 truncate">
              {tabTitles[activeTab] || 'Workspace'}
            </span>
          </nav>
        </div>

        {/* Right: RBAC Role Switcher & Primary Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* RBAC Role Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100/60 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 transition-all duration-150">
            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-[11px] text-zinc-400 font-normal hidden md:inline">Peran:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="text-xs font-medium text-zinc-800 bg-transparent border-0 focus:outline-none cursor-pointer pr-1"
            >
              {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                <option key={r} value={r} className="text-zinc-800">
                  {roleLabels[r].label}
                </option>
              ))}
            </select>
          </div>

          {/* Unified Notification Bell (Finance & CRM) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifikasi Tim Finance & CRM"
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all duration-150 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
            <NotificationPopover
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNavigateTab={onNavigateTab}
            />
          </div>

          {/* Reset Demo State Button */}
          <button
            onClick={resetDataToDefault}
            title="Reset data demo ke awal"
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all duration-150"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Primary Action Button */}
          {role !== 'client' ? (
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-lg transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08)] shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Task</span>
            </button>
          ) : (
            <button
              onClick={onOpenIntakeModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-lg transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08)] shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lapor Bug Klien</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
