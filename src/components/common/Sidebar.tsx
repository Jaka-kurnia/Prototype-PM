import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Kanban, 
  Layers, 
  CalendarRange, 
  ListTodo, 
  Bot, 
  FileText, 
  Briefcase, 
  Users, 
  FolderGit2, 
  Zap, 
  Power, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateTask: () => void;
  onOpenIntakeModal: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateTask,
  onOpenIntakeModal,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { 
    projects, 
    selectedProjectId, 
    setSelectedProjectId, 
    activeProject, 
    tasks, 
    crmDeals, 
    invoices, 
    teamMembers,
    toggleKillSwitch,
    role
  } = useApp();

  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectId);
  const pendingApprovalCount = projectTasks.filter((t) => t.status === 'Menunggu Persetujuan').length;
  const crmWonCount = crmDeals.filter((d) => d.status === 'Closing/Won').length;
  const unbilledCount = projectTasks.filter((t) => t.status === 'Selesai' && !t.billedInvoiceId).length;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }

  interface MenuSection {
    title: string;
    items: MenuItem[];
  }

  const menuSections: MenuSection[] = [
    {
      title: 'MANAJEMEN PROYEK',
      items: [
        {
          id: 'kanban',
          label: 'Kanban Board',
          icon: <Kanban className="w-4 h-4 shrink-0" />,
          badge: projectTasks.length > 0 ? `${projectTasks.length}` : undefined
        },
        {
          id: 'backlog',
          label: 'Backlog & Sprint',
          icon: <Layers className="w-4 h-4 shrink-0" />
        },
        {
          id: 'timeline',
          label: 'Timeline & Gantt',
          icon: <CalendarRange className="w-4 h-4 shrink-0" />
        },
        {
          id: 'list',
          label: 'Daftar Pekerjaan',
          icon: <ListTodo className="w-4 h-4 shrink-0" />
        }
      ]
    },
    {
      title: 'AI & OTOMASI BUG',
      items: [
        {
          id: 'ai_hub',
          label: 'Otomasi Fix Bug (AI)',
          icon: <Bot className="w-4 h-4 shrink-0 text-indigo-400 group-hover:text-white" />,
          badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Review` : undefined,
          badgeColor: 'bg-amber-400 text-slate-900 font-bold'
        }
      ]
    },
    {
      title: 'INTEGRASI BISNIS',
      items: [
        {
          id: 'finance',
          label: 'Finance & Invoices',
          icon: <FileText className="w-4 h-4 shrink-0" />,
          badge: unbilledCount > 0 ? `${unbilledCount} Unbilled` : undefined,
          badgeColor: 'bg-teal-400 text-slate-900 font-bold'
        },
        {
          id: 'crm',
          label: 'CRM Deals Won',
          icon: <Briefcase className="w-4 h-4 shrink-0" />,
          badge: crmWonCount > 0 ? `${crmWonCount} Baru` : undefined,
          badgeColor: 'bg-blue-400 text-slate-900 font-bold'
        },
        {
          id: 'team',
          label: 'Tim HR & Workload',
          icon: <Users className="w-4 h-4 shrink-0" />
        }
      ]
    },
    {
      title: 'PENGATURAN DEV & REPO',
      items: [
        {
          id: 'github',
          label: 'Integrasi GitHub & Branch',
          icon: <FolderGit2 className="w-4 h-4 shrink-0" />,
          badge: 'Auto Repo',
          badgeColor: 'bg-emerald-400 text-slate-950 font-bold'
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-zinc-950/70 lg:hidden backdrop-blur-xs transition-opacity duration-150"
        />
      )}

      {/* Main Sidebar (Linear / Vercel style dark zinc) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out shrink-0 select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-800/80 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-zinc-950 shadow-xs font-semibold text-xs tracking-tight">
              PM
            </div>
            <div>
              <div className="text-xs font-medium tracking-tight text-zinc-100 flex items-center gap-1.5">
                <span>Project Manjer</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-normal">Software House Suite</div>
            </div>
          </div>
        </div>

        {/* Project Selector Box in Sidebar */}
        <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40">
          <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 block mb-1.5 px-1">
            Proyek Aktif
          </label>
          <div className="relative">
            <FolderGit2 className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer appearance-none truncate transition-all duration-150"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-200">
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                {section.title}
              </div>

              {section.items.map((item) => {
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`group w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-zinc-900 text-white border border-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
                          isActive
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-700/60'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800/80 group-hover:border-zinc-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick Trigger for Intake Simulator */}
          <div className="pt-2 px-1">
            <button
              onClick={() => {
                onOpenIntakeModal();
                setIsOpenMobile(false);
              }}
              className="w-full flex items-center justify-between p-2.5 bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition-all duration-150 text-left"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-medium text-[11px]">Simulasi Bug Masuk</span>
              </div>
              <ArrowRight className="w-3 h-3 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Project Security & Kill Switch Status */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 space-y-2">
          {activeProject && (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Power className={`w-3 h-3 ${activeProject.killSwitchActive ? 'text-rose-400' : 'text-emerald-400'}`} />
                <span className="text-[10px] font-normal">Kill Switch:</span>
              </div>
              <button
                onClick={() => toggleKillSwitch(activeProject.id)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium transition-all duration-150 ${
                  activeProject.killSwitchActive
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
                title="Klik untuk mengaktifkan/mematikan kill switch"
              >
                {activeProject.killSwitchActive ? 'OFF' : 'READY'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-2 text-[10px] text-zinc-500 font-normal">
            <span>Linear Design System</span>
            <span className="font-mono text-zinc-600">v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
