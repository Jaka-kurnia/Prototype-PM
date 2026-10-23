import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Project, 
  Task, 
  Epic, 
  Sprint, 
  TeamMember, 
  CRMDeal, 
  Invoice, 
  InvoiceItem,
  AppNotification,
  GitHubIntegrationSettings,
  ProjectBranch,
  TaskEvent, 
  Comment, 
  AutomationRule, 
  UserRole,
  TaskStatus,
  BugDifficulty,
  BugSeverity,
  BugEnvironment,
  WarrantyStatus,
  QASignOff,
  TaskPriority,
  TaskType,
  IntelligentOrchestratorResult
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_EPICS, 
  INITIAL_SPRINTS, 
  INITIAL_MEMBERS, 
  INITIAL_TASKS, 
  INITIAL_CRM_DEALS, 
  INITIAL_INVOICES, 
  INITIAL_EVENTS, 
  INITIAL_COMMENTS, 
  INITIAL_RULES 
} from '../mock/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeProject: Project | null;
  projects: Project[];
  tasks: Task[];
  epics: Epic[];
  sprints: Sprint[];
  teamMembers: TeamMember[];
  crmDeals: CRMDeal[];
  invoices: Invoice[];
  events: TaskEvent[];
  comments: Comment[];
  automationRules: AutomationRule[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Actions
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, reason?: string) => void;
  createTask: (newTask: Partial<Task>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, body: string, isInternal: boolean) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  
  // Software House Bug Lifecycle Actions
  triageBug: (taskId: string, data: { 
    severity: BugSeverity; 
    environment: BugEnvironment; 
    warrantyStatus?: WarrantyStatus; 
    slaDeadline?: string; 
    assigneeId?: string;
  }) => void;
  qaSignOff: (taskId: string, result: { 
    passed: boolean; 
    notes: string; 
    testCasesCount?: number; 
    passedCasesCount?: number; 
    reopenReason?: string;
  }) => void;
  recordBugRca: (taskId: string, rca: string, preventiveMeasures?: string) => void;
  reopenBug: (taskId: string, reason: string) => void;

  // AI Pipeline Actions
  runAiFixer: (taskId: string, categoryOverride?: 'kecil' | 'menengah' | 'besar') => Promise<void>;
  runIntelligentOrchestrator: (reportText: string, context?: { taskKey?: string; projectId?: string }) => IntelligentOrchestratorResult;
  createSimulatedBug: (projectId: string, category: 'kecil' | 'menengah' | 'besar') => Task;
  approveAiPr: (taskId: string, notes?: string) => void;
  rejectAiPr: (taskId: string, reason: string) => void;
  requestAiRevision: (taskId: string, revisionNotes: string) => void;
  chooseManualFix: (taskId: string) => void;
  submitHumanFix: (
    taskId: string, 
    data: { 
      mitigationOption: string; 
      patchCommitHash?: string; 
      devNotes: string; 
      timeSpentHours?: number; 
      advanceToQa?: boolean;
    }
  ) => void;
  deployToStaging: (taskId: string) => void;
  deployToProduction: (taskId: string, doubleConfirmed?: boolean) => boolean;
  triggerRollback: (taskId: string, reason: string) => void;
  toggleKillSwitch: (projectId: string) => void;

  githubSettings: GitHubIntegrationSettings;
  updateGithubSettings: (updates: Partial<GitHubIntegrationSettings>) => void;

  // Team & GitHub Collaborator Actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => TeamMember;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // CRM & Business Flow
  convertCrmDealToProject: (
    dealId: string, 
    customCode?: string, 
    customRepoName?: string, 
    moduleAssignments?: { epicKey: string; title: string; assigneeId: string; estimateHours?: number; description?: string }[]
  ) => Project;

  // Finance Actions
  createInvoiceFromCompletedTasks: (projectId: string, taskIds: string[], type?: Invoice['type']) => Invoice;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  createCustomProgressInvoice: (params: {
    projectId: string;
    percentage: number;
    customAmount: number;
    title: string;
    notes?: string;
    dueDate?: string;
  }) => { success: boolean; invoice?: Invoice; error?: string };

  // Project Progress Helper
  getProjectProgress: (projectId: string) => number;

  // Integrated Notifications (Finance & CRM)
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => AppNotification;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Intake Simulations
  ingestBugReport: (data: {
    projectId: string;
    title: string;
    description: string;
    source: 'Web Form' | 'WhatsApp' | 'Sentry';
    priority?: TaskPriority;
    severity?: BugSeverity;
    environment?: BugEnvironment;
    sentryErrorDetails?: string;
    reproductionSteps?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    warrantyStatus?: WarrantyStatus;
  }) => Task;

  // Reset demo
  resetDataToDefault: () => void;
}

export const INITIAL_GITHUB_SETTINGS: GitHubIntegrationSettings = {
  isConnected: true,
  accountName: 'agensi-tech-bot',
  organization: 'agensi-software-house',
  authType: 'pat',
  apiKey: 'ghp_9k2L8vM14pQxW3zT5aY7eR6uI0oP8sD39aF',
  tokenMasked: 'ghp_••••••••••••••••••••••••••••••••39aF',
  tokenScopes: ['repo', 'workflow', 'admin:org', 'write:packages', 'read:user'],
  tokenExpiresAt: '2027-10-31',
  webhookSecret: 'whsec_98fbc1a284e9411d332cba91b',
  webhookUrl: 'https://api.softwarehouse.dev/api/webhooks/github',
  defaultBranch: 'main',
  repoVisibility: 'private',
  autoCreateRepo: true,
  autoCreateEpicBranches: true,
  autoInviteCollaborators: true,
  autoSetupWorkflows: true,
  branchPrefixEpic: 'epic/',
  branchPrefixFeature: 'feat/',
  branchPrefixFix: 'fix/',
  enforceBranchProtection: true,
  requireReviews: true,
  minApprovals: 1,
  requireStatusChecks: true,
  requireLinearHistory: false,
  lastSyncAt: '2026-10-15T21:00:00Z'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'project_manjer_state_v6_3projs';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('owner');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-perpustakaan');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // GitHub Integration Settings
  const [githubSettings, setGithubSettings] = useState<GitHubIntegrationSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_github`);
    return saved ? JSON.parse(saved) : INITIAL_GITHUB_SETTINGS;
  });

  // Persistent / Initial state
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [epics, setEpics] = useState<Epic[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_epics`);
    return saved ? JSON.parse(saved) : INITIAL_EPICS;
  });

  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sprints`);
    return saved ? JSON.parse(saved) : INITIAL_SPRINTS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [crmDeals, setCrmDeals] = useState<CRMDeal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deals`);
    return saved ? JSON.parse(saved) : INITIAL_CRM_DEALS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [events, setEvents] = useState<TaskEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_events`);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_comments`);
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'notif-init-1',
        title: '🔔 [Finance] Invoice DP Kick-Off Disetujui',
        message: 'Invoice INV/2026/10/LIB-001 (Termin DP 30%) untuk Perpustakaan Digital telah diverifikasi dan lunas.',
        type: 'finance',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        isRead: false,
        projectId: 'proj-perpustakaan',
        amount: 55500000,
        percentage: 30
      },
      {
        id: 'notif-init-2',
        title: '💼 [CRM] Closing Proyek Perpustakaan Digital',
        message: 'Deal DEAL-PERPUS-01 dikonversi ke Proyek Engineering. Pipeline termin 1, 2, 3 tercatat.',
        type: 'crm',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        isRead: true,
        projectId: 'proj-perpustakaan'
      }
    ];
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_epics`, JSON.stringify(epics));
  }, [epics]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sprints`, JSON.stringify(sprints));
  }, [sprints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_deals`, JSON.stringify(crmDeals));
  }, [crmDeals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_comments`, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rules`, JSON.stringify(automationRules));
  }, [automationRules]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);

  const logEvent = (taskId: string, eventType: TaskEvent['eventType'], fromValue?: string, toValue?: string, payload?: string) => {
    const roleName = role.toUpperCase();
    const newEvent: TaskEvent = {
      id: 'ev_' + Date.now() + Math.random().toString(36).substr(2, 4),
      taskId,
      actor: role === 'owner' ? 'Owner / Admin' : role === 'pm' ? 'Project Manager' : role === 'developer' ? 'Lead Developer' : 'System',
      actorRole: roleName,
      eventType,
      fromValue,
      toValue,
      payload,
      timestamp: new Date().toISOString()
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus, reason?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const oldStatus = t.status;
          logEvent(taskId, 'status_change', oldStatus, newStatus, reason ? `Alasan: ${reason}` : undefined);
          return {
            ...t,
            status: newStatus,
            lastStatusUpdated: new Date().toISOString()
          };
        }
        return t;
      })
    );
    addToast('info', 'Status Diperbarui', `Task dialihkan ke status ${newStatus}`);
  };

  const createTask = (newTaskData: Partial<Task>): Task => {
    const targetProject = projects.find((p) => p.id === (newTaskData.projectId || selectedProjectId)) || projects[0];
    const projectTasks = tasks.filter((t) => t.projectId === targetProject.id);
    const nextNum = 100 + projectTasks.length + 1;
    const taskKey = `${targetProject.code}-${nextNum}`;

    const task: Task = {
      id: 'task_' + Date.now(),
      key: taskKey,
      projectId: targetProject.id,
      type: newTaskData.type || 'Task',
      title: newTaskData.title || 'Untitled Task',
      description: newTaskData.description || '',
      status: newTaskData.status || (newTaskData.type === 'Bug' ? 'Baru' : 'Backlog'),
      priority: newTaskData.priority || 'Sedang',
      difficulty: newTaskData.difficulty,
      source: newTaskData.source || 'Manual',
      assigneeId: newTaskData.assigneeId || 'user-dev-1',
      reporterId: newTaskData.reporterId || 'user-pm',
      estimateHours: newTaskData.estimateHours || 4,
      timeLoggedHours: 0,
      startDate: newTaskData.startDate || new Date().toISOString().split('T')[0],
      dueDate: newTaskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      visibility: newTaskData.visibility || 'client_public',
      subtasks: newTaskData.subtasks || [],
      relations: newTaskData.relations || [],
      lastStatusUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => [task, ...prev]);
    logEvent(task.id, 'created', '', task.status, `Dibuat via ${task.source}`);
    addToast('success', 'Task Berhasil Dibuat', `${task.key}: ${task.title}`);
    return task;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            ...updates,
            lastStatusUpdated: new Date().toISOString()
          };
        }
        return t;
      })
    );
    addToast('success', 'Perubahan Disimpan');
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    addToast('info', 'Task Dihapus');
  };

  const addComment = (taskId: string, body: string, isInternal: boolean) => {
    const authorName = role === 'owner' ? 'Owner / Admin' : role === 'pm' ? 'Arya Pratama (PM)' : role === 'developer' ? 'Bagus Wicaksono (Dev)' : role === 'client' ? 'PIC Klien' : 'User';
    const newComment: Comment = {
      id: 'comm_' + Date.now(),
      taskId,
      author: authorName,
      authorRole: role.toUpperCase(),
      body,
      isInternal,
      createdAt: new Date().toISOString()
    };
    setComments((prev) => [...prev, newComment]);
    logEvent(taskId, 'comment_added', undefined, undefined, `${authorName} menambah komentar ${isInternal ? '(Internal)' : '(Publik)'}`);
    addToast('success', 'Komentar Terkirim');
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    const newSub: { id: string; title: string; completed: boolean } = {
      id: 'st_' + Date.now(),
      title,
      completed: false
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: [...t.subtasks, newSub] };
        }
        return t;
      })
    );
  };

  // Intelligent Orchestrator Engine (SOP ERP Fix Bug AI)
  const runIntelligentOrchestrator = (
    reportText: string, 
    context?: { taskKey?: string; projectId?: string }
  ): IntelligentOrchestratorResult => {
    const textLower = reportText.toLowerCase();

    // 1. Classification criteria according to ERP Intelligent Orchestrator specifications:
    // - EXPERT: database architecture, deadlock 40P01, race condition, security vulnerability, auth bypass, performance/memory leak, multi-system business logic. (Assigned to: Human Developer)
    // - LOW: simple syntax error, typo, form validation, minor CSS/HTML, null pointer check with narrow scope. (Assigned to: AI Agent)
    // - MEDIUM: boundary logic, rounding decimal, webhook retry, pagination, scheduler timing. (Assigned to: AI Agent)
    
    const isExpert = /deadlock|40p01|database|skema|migrasi|concurrency|race.?condition|vulnerability|security|keamanan|auth|bypass|memory.?leak|leak|double.?refund|double.?booking|double.?charge/i.test(textLower);
    
    const isLow = !isExpert && /typo|label|nullpointer|null.?pointer|null.?guard|cannot read propert|undefined|validasi.?form|nomor telepon|phone|margin|padding|css|html|format.?rupiah|titik.?ribuan|display|saltik/i.test(textLower);

    const complexity_level: 'LOW' | 'MEDIUM' | 'EXPERT' = isExpert ? 'EXPERT' : isLow ? 'LOW' : 'MEDIUM';
    const assigned_to: 'AI Agent' | 'Human Developer' = complexity_level === 'EXPERT' ? 'Human Developer' : 'AI Agent';

    let bug_analysis = '';
    const target_branch = 'production';
    let feature_branch_name = '';
    let recommended_commit_message = '';
    let next_action_step = '';

    const slug = context?.taskKey ? context.taskKey.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'live-bug';

    if (complexity_level === 'EXPERT') {
      if (/deadlock|40p01|race.?condition|booking/i.test(textLower)) {
        bug_analysis = 'Terjadi konflik konkurensi data kritis (deadlock 40P01 / race-condition) pada transaksi simultan yang memperebutkan row lock database.';
        feature_branch_name = `fix/${slug}-concurrency-deadlock-investigation`;
        recommended_commit_message = 'fix(database): apply deterministic row lock ordering and redlock distributed mutex';
      } else if (/auth|security|vulnerability|token/i.test(textLower)) {
        bug_analysis = 'Ditemukan celah keamanan (security vulnerability) pada otorisasi token RBAC yang berpotensi menyebabkan authorization bypass.';
        feature_branch_name = `fix/${slug}-auth-security-patch`;
        recommended_commit_message = 'fix(security): enforce strict rbac token validation and rate limiting';
      } else if (/memory.?leak|leak/i.test(textLower)) {
        bug_analysis = 'Terdeteksi degradasi performa akibat memory leak dan socket connection exhaustion pada background queue worker.';
        feature_branch_name = `fix/${slug}-memory-leak-performance`;
        recommended_commit_message = 'fix(perf): resolve socket connection leak in background queue worker';
      } else {
        bug_analysis = 'Terjadi anomali logika arsitektur database atau transaksi multi-sistem yang berisiko merusak integritas data produksi.';
        feature_branch_name = `fix/${slug}-critical-architecture-investigation`;
        recommended_commit_message = 'fix(core): overhaul transaction rollback handling and distributed lock';
      }
      next_action_step = 'Picu Safety Guardrail untuk memblokir auto-deploy AI. Susun Paket Diagnostik lengkap (RCA, affected files, opsi mitigasi) dan eskalasikan ke Lead Developer untuk penanganan manual.';
    } else if (complexity_level === 'LOW') {
      if (/nullpointer|null.?pointer|null/i.test(textLower) && /phone|telepon/i.test(textLower)) {
        bug_analysis = 'Terjadi error internal server akibat kurangnya validasi null pada input nomor telepon di UserController.';
        feature_branch_name = 'fix/null-phone-validation-user';
        recommended_commit_message = 'fix(user): add null pointer check for phone number field';
      } else if (/typo|label|eja|saltik/i.test(textLower)) {
        bug_analysis = 'Terjadi kesalahan penulisan teks (typo) pada label form antarmuka yang membingungkan pengguna.';
        feature_branch_name = `fix/${slug}-label-typo`;
        recommended_commit_message = 'fix(ui): correct label spelling and update localization dictionary';
      } else if (/css|margin|padding|layout/i.test(textLower)) {
        bug_analysis = 'Ditemukan ketidaksesuaian styling CSS/HTML minor yang menyebabkan layout overflow pada tampilan smartphone.';
        feature_branch_name = `fix/${slug}-css-layout-alignment`;
        recommended_commit_message = 'fix(style): resolve margin overflow and responsive flex alignment';
      } else {
        bug_analysis = 'Terdeteksi unhandled null/undefined value pada format tampilan komponen yang memicu runtime warning.';
        feature_branch_name = `fix/${slug}-null-guard`;
        recommended_commit_message = 'fix(view): add safe optional chaining and fallback empty state';
      }
      next_action_step = `Picu AI Coding Agent untuk melakukan checkout ke branch ${feature_branch_name} dan mulai proses perbaikan kode.`;
    } else {
      // MEDIUM
      if (/diskon|voucher|rounding|pembulatan/i.test(textLower)) {
        bug_analysis = 'Terjadi selisih pembulatan desimal floating-point saat mengkalkulasi diskon promosi bertingkat.';
        feature_branch_name = `fix/${slug}-discount-rounding-guard`;
        recommended_commit_message = 'fix(billing): enforce 2-decimal ceiling rounding and prevent negative subtotal';
      } else if (/libur|weekend|denda/i.test(textLower)) {
        bug_analysis = 'Kalkulasi denda keterlambatan belum mengecualikan hari libur nasional dan akhir pekan pada cron scheduler.';
        feature_branch_name = `fix/${slug}-holiday-fine-calculation`;
        recommended_commit_message = 'fix(scheduler): exclude national holidays and weekends from overdue calculation';
      } else {
        bug_analysis = 'Ditemukan kegagalan penanganan boundary edge-case atau webhook timeout yang membutuhkan exponential backoff retry.';
        feature_branch_name = `fix/${slug}-boundary-logic-retry`;
        recommended_commit_message = 'fix(service): implement safe boundary fallback and retry backoff';
      }
      next_action_step = `Picu AI Coding Agent untuk checkout branch ${feature_branch_name}, buat patch boundary logic, dan jalankan 5/5 regression unit tests.`;
    }

    return {
      bug_analysis,
      complexity_level,
      assigned_to,
      github_workflow: {
        target_branch,
        feature_branch_name,
        recommended_commit_message
      },
      next_action_step
    };
  };

  // AI Bug Automation Pipeline Actions (Live Production & Garansi 1 Bulan)
  const runAiFixer = async (taskId: string, categoryOverride?: 'kecil' | 'menengah' | 'besar') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const project = projects.find((p) => p.id === task.projectId);
    if (project?.killSwitchActive) {
      addToast('error', 'Kill Switch Aktif', 'Agen AI dinonaktifkan untuk proyek ini.');
      return;
    }

    // Step 1: Set to Dianalisis
    updateTaskStatus(taskId, 'Dianalisis', 'Intelligent Orchestrator memulai triage otomatis, evaluasi masa garansi 1 bulan, dan klasifikasi kompleksitas.');

    // Simulated short async pipeline
    await new Promise((res) => setTimeout(res, 900));

    // Run Intelligent Orchestrator analysis
    const orchestratorResult = runIntelligentOrchestrator(
      `${task.title}\n${task.description}`, 
      { taskKey: task.key, projectId: task.projectId }
    );

    // Determine category based on orchestrator result or override:
    let category: 'kecil' | 'menengah' | 'besar' = 'menengah';
    if (categoryOverride) {
      category = categoryOverride;
    } else if (orchestratorResult.complexity_level === 'EXPERT') {
      category = 'besar';
    } else if (orchestratorResult.complexity_level === 'LOW') {
      category = 'kecil';
    } else {
      category = 'menengah';
    }

    if (category === 'besar') {
      // 🚨 SAFETY GUARDRAIL TRIGGERED: BUG BESAR WAJIB DITANGANI MANUSIA!
      const diag: NonNullable<Task['diagnosticPackage']> = task.diagnosticPackage || {
        summary: `🚨 DETEKSI RISIKO KRITIS: Bug tergolong EXPERT / BESAR (${orchestratorResult.bug_analysis}). Sesuai standar ERP Intelligent Orchestrator, AI DILARANG melakukan auto-commit ke Production. Tiket dieskalasikan ke Lead Developer dengan paket diagnostik lengkap.`,
        reproductionSteps: [
          '1. Jalankan concurrent stress test (50 RPS dengan K6) pada endpoint transaksi',
          '2. Dua request mencoba mengakses row resource yang sama secara simultan',
          '3. Amati log database Postgres/Redis: Deadlock error code 40P01 / Lock acquisition timeout'
        ],
        affectedFiles: [
          { path: 'src/db/queries/transactionLock.ts', lineRange: 'L42-L88' },
          { path: 'src/services/concurrencyEngine.ts', lineRange: 'L105-L148' }
        ],
        sentryBreadcrumbs: [
          'db.query: BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE',
          'db.lock: Waiting for exclusive row lock on primary resource',
          'sentry.event: 40P01 deadlock detected - transaction aborted'
        ],
        suggestedFixes: [
          { option: 'Terapkan deterministik lock ordering (sort resource IDs sebelum query)', tradeOff: 'Mencegah deadlock sirkular, namun memerlukan penyusunan array urut di backend' },
          { option: 'Gunakan Redis Distributed Mutex (Redlock) dengan TTL 5 detik', tradeOff: 'Eksekusi sangat cepat, namun menambah dependensi state cluster Redis' },
          { option: 'Optimistic Concurrency Control dengan version column retry 3x', tradeOff: 'Tidak ada lock database, namun request client bisa mengalami retry delay' }
        ],
        branchName: orchestratorResult.github_workflow.feature_branch_name || `fix/${task.key.toLowerCase()}-investigation`,
        commandSnippet: `git checkout -b ${orchestratorResult.github_workflow.feature_branch_name || `fix/${task.key.toLowerCase()}`} origin/main`
      };

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'Perlu Manual',
                difficulty: 'Hard',
                severity: t.severity || 'S1 - Critical (Blocker)',
                priority: 'Hotfix',
                warrantyStatus: 'Garansi Proyek (Gratis)',
                confidenceScore: 46,
                confidenceReason: `Intelligent Orchestrator: Complexity EXPERT. ${orchestratorResult.next_action_step}`,
                diagnosticPackage: diag,
                orchestratorResult,
                branchName: orchestratorResult.github_workflow.feature_branch_name,
                requiresDoubleConfirmation: true,
                lastStatusUpdated: new Date().toISOString()
              }
            : t
        )
      );

      logEvent(
        taskId, 
        'manual_fallback', 
        'Dianalisis', 
        'Perlu Manual', 
        'Safety Guardrail Aktif: Bug BESAR dialihkan ke Human Engineer dengan Paket Diagnostik lengkap (Garansi 1 Bulan Aktif).'
      );
      addToast(
        'warning', 
        'Safety Guardrail: Eskalasi ke Manusia', 
        'Bug kategori BESAR wajib ditangani programmer manusia demi keselamatan produksi. Paket diagnostik telah disiapkan!'
      );
    } else if (category === 'menengah') {
      // 🟡 BUG MENENGAH: EKSEKUSI LANGSUNG OLEH AI DENGAN REGRESSION TEST
      const prNum = `PR #${Math.floor(Math.random() * 80) + 20}`;
      const branch = orchestratorResult.github_workflow.feature_branch_name || `ai/fix-${task.key.toLowerCase()}-logic`;
      const diffSnippet = `--- a/src/services/businessLogic.ts
+++ b/src/services/businessLogic.ts
@@ -15,8 +15,14 @@ export function processCalculation(input: any) {
+  // Automated boundary logic & rounding guard inserted by Intelligent Orchestrator AI
+  if (typeof input.amount !== 'number' || isNaN(input.amount)) {
+    return { status: 400, result: 0, error: 'Invalid numeric input' };
+  }
+  const safeSubtotal = Math.max(0, input.amount - (input.discount || 0));
+  const finalRounded = Math.round(safeSubtotal * 100) / 100;
   return executeOperation(finalRounded);
 }`;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'Menunggu Persetujuan',
                difficulty: 'Medium',
                severity: t.severity || 'S2 - Major',
                warrantyStatus: 'Garansi Proyek (Gratis)',
                confidenceScore: 84,
                confidenceReason: `Intelligent Orchestrator: Complexity MEDIUM. ${orchestratorResult.next_action_step}`,
                branchName: branch,
                prNumber: prNum,
                prDiff: diffSnippet,
                orchestratorResult,
                testResult: {
                  passed: true,
                  total: 5,
                  passedCount: 5,
                  failedCount: 0,
                  durationMs: 420,
                  logs: [
                    'PASS test/unit/businessLogic.test.ts',
                    '✓ should process valid input correctly (28ms)',
                    '✓ should prevent NaN floating point rounding error (15ms)',
                    '✓ should safely fallback when discount exceeds total (12ms)',
                    '✓ regression check: upstream billing unaffected (42ms)',
                    '✓ stress check: 500 payload iterations PASS (60ms)'
                  ]
                },
                lastStatusUpdated: new Date().toISOString()
              }
            : t
        )
      );

      logEvent(
        taskId, 
        'pr_created', 
        'Dianalisis', 
        'Menunggu Persetujuan', 
        `Intelligent Orchestrator AI menyelesaikan perbaikan Bug MENENGAH (${prNum}) pada branch ${branch}. Commit: "${orchestratorResult.github_workflow.recommended_commit_message}".`
      );
      addToast(
        'success', 
        'Bug Menengah Diperbaiki AI! 🚀', 
        `Agen membuka ${prNum}. Semua regression test lolos (5/5). Menunggu review Tech Lead.`
      );
    } else {
      // 🟢 BUG KECIL: EKSEKUSI LANGSUNG OLEH AI DENGAN MINIMAL PATCH
      const prNum = `PR #${Math.floor(Math.random() * 80) + 10}`;
      const branch = orchestratorResult.github_workflow.feature_branch_name || `ai/fix-${task.key.toLowerCase()}-auto`;
      const diffSnippet = `--- a/src/components/DisplayView.tsx
+++ b/src/components/DisplayView.tsx
@@ -12,4 +12,7 @@ export const DisplayView = ({ item }: Props) => {
+  // Guard null/undefined & format display safely by Intelligent Orchestrator AI
+  const safeLabel = (item?.title || 'N/A').trim();
   return <div className="text-sm font-medium">{safeLabel}</div>;
 };`;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'Menunggu Persetujuan',
                difficulty: 'Low',
                severity: t.severity || 'S3 - Minor',
                warrantyStatus: 'Garansi Proyek (Gratis)',
                confidenceScore: 96,
                confidenceReason: `Intelligent Orchestrator: Complexity LOW. ${orchestratorResult.next_action_step}`,
                branchName: branch,
                prNumber: prNum,
                prDiff: diffSnippet,
                orchestratorResult,
                testResult: {
                  passed: true,
                  total: 4,
                  passedCount: 4,
                  failedCount: 0,
                  durationMs: 280,
                  logs: [
                    'PASS test/components/DisplayView.test.tsx',
                    '✓ should render safe label when item is null (18ms)',
                    '✓ should trim whitespace from title (14ms)',
                    '✓ snapshot matches baseline (32ms)',
                    '✓ zero visual regression detected (40ms)'
                  ]
                },
                lastStatusUpdated: new Date().toISOString()
              }
            : t
        )
      );

      logEvent(
        taskId, 
        'pr_created', 
        'Dianalisis', 
        'Menunggu Persetujuan', 
        `Intelligent Orchestrator AI langsung mengeksekusi Bug KECIL (${prNum}) pada branch ${branch}. Commit: "${orchestratorResult.github_workflow.recommended_commit_message}".`
      );
      addToast(
        'success', 
        'Bug Kecil Diperbaiki Otomatis! ⚡', 
        `Agen AI langsung membuat patch ${prNum} untuk bug kecil. Siap diverifikasi QA!`
      );
    }
  };

  // Helper to inject a simulated live production bug under the 1-month warranty
  const createSimulatedBug = (projectId: string, category: 'kecil' | 'menengah' | 'besar'): Task => {
    const project = projects.find((p) => p.id === projectId) || projects[0];
    const bugNum = Math.floor(Math.random() * 800 + 100);
    const key = `${project.code}-${bugNum}`;

    let title = '';
    let description = '';
    let priority: TaskPriority = 'Sedang';
    let severity: BugSeverity = 'S3 - Minor';
    let difficulty: BugDifficulty = 'Low';

    if (category === 'kecil') {
      title = `[Live Prod] Typo Label & Missing Null Guard pada Form ${project.name}`;
      description = `Laporan dari pengguna di lingkungan live production: label input tidak konsisten dan melempar warning null saat form di-submit tanpa data opsional.`;
      priority = 'Rendah';
      severity = 'S3 - Minor';
      difficulty = 'Low';
    } else if (category === 'menengah') {
      title = `[Live Prod] Rounding Selisih Desimal & Webhook Retry Handling pada ${project.name}`;
      description = `Laporan telemetri Sentry: Terjadi selisih pembulatan desimal saat transaksi promo bertingkat serta webhook payment gateway perlu exponential backoff retry.`;
      priority = 'Sedang';
      severity = 'S2 - Major';
      difficulty = 'Medium';
    } else {
      title = `[Live Prod] Database Transaction Deadlock 40P01 & Race Condition Transaksi ${project.name}`;
      description = `Critical Incident Sentry: Dua request simultan memperebutkan row-level lock yang sama pada PostgreSQL/Redis, menyebabkan transaksi deadlock dibatalkan (40P01). Berisiko merusak integritas transaksi jika tidak ditangani developer manusia!`;
      priority = 'Hotfix';
      severity = 'S1 - Critical (Blocker)';
      difficulty = 'Hard';
    }

    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      key,
      projectId: project.id,
      type: 'Bug',
      title,
      description,
      status: 'Baru',
      priority,
      difficulty,
      severity,
      environment: 'Production',
      warrantyStatus: 'Garansi Proyek (Gratis)',
      slaDeadline: new Date(Date.now() + (category === 'besar' ? 4 : category === 'menengah' ? 24 : 48) * 3600000).toISOString(),
      source: 'Sentry',
      assigneeId: category === 'besar' ? 'user-dev-3' : 'user-dev-1',
      reporterId: 'user-qa',
      estimateHours: category === 'besar' ? 8 : category === 'menengah' ? 3 : 1,
      timeLoggedHours: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      visibility: 'internal',
      branchName: `fix/${key.toLowerCase()}`,
      subtasks: [
        { id: `st_${Date.now()}_1`, title: 'Verifikasi stack trace Sentry live production', completed: false },
        { id: `st_${Date.now()}_2`, title: category === 'besar' ? 'Investigasi manual & rancang lock deterministik' : 'AI code analysis & patch test', completed: false }
      ],
      relations: [],
      lastStatusUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => [newTask, ...prev]);
    logEvent(newTask.id, 'created', '', 'Baru', `Bug ${category.toUpperCase()} dilaporkan via Sentry di live production (Garansi 1 Bulan Aktif).`);
    addToast('info', `Bug ${category.toUpperCase()} Dibuat!`, `${newTask.key}: ${newTask.title}`);
    return newTask;
  };

  const approveAiPr = (taskId: string, notes?: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTaskStatus(taskId, 'Disetujui', notes || 'PR AI telah diverifikasi dan disetujui oleh manusia.');
    logEvent(taskId, 'pr_approved', 'Menunggu Persetujuan', 'Disetujui', notes || 'Disetujui untuk deploy.');
    addToast('success', 'PR Disetujui', 'Pekerjaan siap dideploy ke Staging.');
  };

  const rejectAiPr = (taskId: string, reason: string) => {
    updateTaskStatus(taskId, 'Ditolak', reason);
    logEvent(taskId, 'pr_rejected', 'Menunggu Persetujuan', 'Ditolak', `Alasan penolakan: ${reason}`);
    addToast('info', 'PR Ditolak', 'Umpan balik dicatat ke riwayat audit.');
  };

  const requestAiRevision = (taskId: string, revisionNotes: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'Dianalisis',
            confidenceReason: `Revisi diminta: "${revisionNotes}". Agen sedang menyusun patch baru.`,
            lastStatusUpdated: new Date().toISOString()
          };
        }
        return t;
      })
    );
    logEvent(taskId, 'pr_revised', 'Menunggu Persetujuan', 'Dianalisis', `Catatan revisi: ${revisionNotes}`);
    addToast('info', 'Revisi Diminta ke Agen', 'Agen AI menyusun ulang patch sesuai catatan review.');

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'Menunggu Persetujuan',
              confidenceScore: 91,
              confidenceReason: 'Patch diperbarui sesuai instruksi revisi manusia.',
              prDiff: (t.prDiff || '') + `\n// Revision update applied: ${revisionNotes}`,
              lastStatusUpdated: new Date().toISOString()
            };
          }
          return t;
        })
      );
      logEvent(taskId, 'pr_created', 'Dianalisis', 'Menunggu Persetujuan', 'Agen menyelesaikan revisi patch baru.');
      addToast('success', 'Patch Revisi Agen Siap Direview!');
    }, 1200);
  };

  const chooseManualFix = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'Perlu Manual',
            lastStatusUpdated: new Date().toISOString()
          };
        }
        return t;
      })
    );
    logEvent(taskId, 'manual_fallback', task.status, 'Perlu Manual', 'Programmer memilih jalur perbaikan manual.');
    addToast('info', 'Jalur Manual Dipilih', 'Cabang kerja dan diagnostik disiapkan.');
  };

  const submitHumanFix = (
    taskId: string, 
    data: { 
      mitigationOption: string; 
      patchCommitHash?: string; 
      devNotes: string; 
      timeSpentHours?: number; 
      advanceToQa?: boolean;
    }
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const commitHash = data.patchCommitHash || Math.random().toString(16).substring(2, 9);
    const targetStatus: TaskStatus = data.advanceToQa ? 'Deploy Staging' : 'Menunggu Persetujuan';

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: targetStatus,
            timeLoggedHours: (t.timeLoggedHours || 0) + (data.timeSpentHours || 2),
            preventiveMeasures: data.mitigationOption,
            branchName: t.branchName || `fix/${t.key.toLowerCase()}-human`,
            prNumber: `PR #${Math.floor(Math.random() * 50) + 150} (Senior Engineer)`,
            prDiff: `--- a/src/core/criticalService.ts\n+++ b/src/core/criticalService.ts\n@@ -50,6 +50,15 @@\n+// [HUMAN ENGINEER INTERVENTION - Commit: ${commitHash}]\n+// Solusi Arsitektur Terpilih: ${data.mitigationOption}\n+// Catatan Lead Developer: ${data.devNotes}\n+const safeLock = await acquireDistributedMutex(resourceKey, { timeoutMs: 2000 });\n+try {\n+  return await executeAtomicTransaction(payload);\n+} finally {\n+  await safeLock.release();\n+}`,
            testResult: {
              passed: true,
              total: 8,
              passedCount: 8,
              failedCount: 0,
              durationMs: 520,
              logs: [
                'PASS test/integration/concurrency.spec.ts',
                '✓ should prevent PostgreSQL deadlock 40P01 under 50 concurrent requests (85ms)',
                '✓ distributed mutex releases cleanly on network timeout (45ms)',
                '✓ regression check: zero double-spend / stock negative (110ms)',
                '✓ stress benchmark: 2,000 requests PASS (340ms)'
              ]
            },
            lastStatusUpdated: new Date().toISOString()
          };
        }
        return t;
      })
    );

    logEvent(
      taskId,
      'status_change',
      'Perlu Manual',
      targetStatus,
      `Programmer Manusia (Lead Developer) menyelesaikan penanganan Bug Besar: "${data.mitigationOption}". Commit: ${commitHash}. Catatan: ${data.devNotes}`
    );

    addToast(
      'success',
      'Perbaikan Bug Besar Berhasil! 🛡️',
      `Tiket ${task.key} telah ditangani engineer manusia dengan mitigasi "${data.mitigationOption}". Siap diverifikasi di Staging!`
    );
  };

  const deployToStaging = (taskId: string) => {
    updateTaskStatus(taskId, 'Deploy Staging', 'Trigger GitHub Actions: Deploy ke environment Staging');
    logEvent(taskId, 'deployed_staging', 'Disetujui', 'Deploy Staging', 'Build & smoke test staging lolos.');
    addToast('success', 'Staging Deployed', 'Aplikasi telah aktif di URL Staging untuk verifikasi QA.');
  };

  const deployToProduction = (taskId: string, doubleConfirmed = false): boolean => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    if (task.difficulty === 'Hard' && !doubleConfirmed) {
      addToast('error', 'Konfirmasi Ganda Diperlukan', 'Bug kategori Hard memerlukan konfirmasi ganda sebelum deploy ke production!');
      return false;
    }

    updateTaskStatus(taskId, 'Deploy Production', 'Deploy ke Production via GitHub Actions.');
    logEvent(taskId, 'deployed_production', task.status, 'Deploy Production', 'Versi baru rilis ke server production.');
    
    // Automatically transition to 'Dipantau' (Sentry health window)
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'Dipantau', lastStatusUpdated: new Date().toISOString() } : t))
      );
      addToast('info', 'Jendela Pemantauan Aktif', 'Sistem memantau error rate selama 30 menit pasca-deploy.');
    }, 800);

    return true;
  };

  const triggerRollback = (taskId: string, reason: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'Perlu Manual',
            priority: 'Hotfix',
            lastStatusUpdated: new Date().toISOString()
          };
        }
        return t;
      })
    );
    logEvent(taskId, 'rollback_triggered', 'Dipantau', 'Perlu Manual', `ROLLBACK OTOMATIS: ${reason}. Versi dikembalikan ke commit stabil.`);
    addToast('error', 'Rollback Otomatis Dijalankan!', `Sistem mendeteksi lonjakan error: "${reason}". Codebase dikembalikan.`);
  };

  // Software House Standard Bug Lifecycle Actions
  const triageBug = (taskId: string, data: {
    severity: BugSeverity;
    environment: BugEnvironment;
    warrantyStatus?: WarrantyStatus;
    slaDeadline?: string;
    assigneeId?: string;
  }) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedPriority: TaskPriority = 
            data.severity === 'S1 - Critical (Blocker)' ? 'Hotfix' :
            data.severity === 'S2 - Major' ? 'Tinggi' :
            data.severity === 'S3 - Minor' ? 'Sedang' : 'Rendah';

          return {
            ...t,
            severity: data.severity,
            environment: data.environment,
            warrantyStatus: data.warrantyStatus || t.warrantyStatus || 'Garansi Proyek (Gratis)',
            slaDeadline: data.slaDeadline || t.slaDeadline,
            priority: updatedPriority,
            assigneeId: data.assigneeId || t.assigneeId,
            status: t.status === 'Baru' ? 'Dianalisis' : t.status,
            lastStatusUpdated: new Date().toISOString()
          };
        }
        return t;
      })
    );

    logEvent(
      taskId,
      'bug_triaged',
      'Baru',
      'Dianalisis',
      `Triage Bug Selesai: Keparahan ${data.severity}, Lingkungan ${data.environment}, Status Biaya: ${data.warrantyStatus || 'Garansi Proyek'}.`
    );
    addToast('success', 'Triage Bug Dikonfirmasi', `Tingkat keparahan ${data.severity} disetujui. SLA tercatat.`);
  };

  const qaSignOff = (taskId: string, result: {
    passed: boolean;
    notes: string;
    testCasesCount?: number;
    passedCasesCount?: number;
    reopenReason?: string;
  }) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const testerName = role === 'qa' ? 'Siti Nurhaliza (QA Lead)' : 'QA Tester (Siti Nurhaliza)';
    const newSignOff: QASignOff = {
      testerId: 'user-qa',
      testerName,
      testedAt: new Date().toISOString(),
      environment: 'Staging',
      status: result.passed ? 'Passed' : 'Failed (Reopen)',
      notes: result.notes,
      testCasesCount: result.testCasesCount || 6,
      passedCasesCount: result.passed ? (result.testCasesCount || 6) : (result.passedCasesCount || 3),
      testedVersion: 'v-staging-latest'
    };

    if (result.passed) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'Disetujui',
                qaSignOff: newSignOff,
                lastStatusUpdated: new Date().toISOString()
              }
            : t
        )
      );
      logEvent(taskId, 'qa_pass', task.status, 'Disetujui', `QA Sign-Off Lolos: ${result.notes} (${newSignOff.passedCasesCount}/${newSignOff.testCasesCount} Test Cases Pass).`);
      addToast('success', 'Verifikasi QA Lolos!', 'Bug telah teruji di Staging dan siap dideploy ke Production.');
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'Perlu Manual',
                qaSignOff: newSignOff,
                lastStatusUpdated: new Date().toISOString()
              }
            : t
        )
      );
      logEvent(taskId, 'qa_fail', task.status, 'Perlu Manual', `QA Menolak (Reopen): ${result.reopenReason || result.notes}.`);
      addToast('error', 'Bug Re-opened oleh QA', `Temuan regresi dicatat: ${result.reopenReason || result.notes}`);
    }
  };

  const reopenBug = (taskId: string, reason: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'In Progress',
              lastStatusUpdated: new Date().toISOString()
            }
          : t
      )
    );
    logEvent(taskId, 'bug_reopened', undefined, 'In Progress', `Bug dibuka kembali: ${reason}`);
    addToast('warning', 'Bug Dibuka Kembali (Reopened)', `Dialihkan ke In Progress: ${reason}`);
  };

  const recordBugRca = (taskId: string, rca: string, preventiveMeasures?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              rootCauseAnalysis: rca,
              preventiveMeasures: preventiveMeasures || t.preventiveMeasures,
              lastStatusUpdated: new Date().toISOString()
            }
          : t
      )
    );
    logEvent(taskId, 'rca_recorded', undefined, undefined, `RCA Didokumentasikan: ${rca.slice(0, 80)}...`);
    addToast('success', 'Root Cause Analysis (RCA) Disimpan', 'Dokumentasi audit bug berhasil diarsipkan.');
  };

  const toggleKillSwitch = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const newState = !p.killSwitchActive;
          addToast(
            newState ? 'warning' : 'success',
            newState ? 'Kill Switch DIAKTIFKAN' : 'Kill Switch Dimatikan',
            newState ? 'Semua aktivitas agen Claude dihentikan untuk proyek ini.' : 'Agen Claude dapat kembali memproses task otomatis.'
          );
          return { ...p, killSwitchActive: newState };
        }
        return p;
      })
    );
  };

  const updateGithubSettings = (updates: Partial<GitHubIntegrationSettings>) => {
    setGithubSettings((prev) => {
      const updated = { ...prev, ...updates, lastSyncAt: new Date().toISOString() };
      localStorage.setItem(`${STORAGE_KEY}_github`, JSON.stringify(updated));
      return updated;
    });
    addToast('success', 'Pengaturan GitHub Disimpan', 'Konfigurasi integrasi repository dan branch telah diperbarui.');
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>): TeamMember => {
    const newId = 'user-gh-' + Date.now();
    const newMember: TeamMember = {
      ...member,
      id: newId
    };
    setTeamMembers((prev) => [...prev, newMember]);
    addToast('success', 'Kolaborator GitHub Ditambahkan', `${member.name} (@${member.githubUsername || 'user'}) berhasil ditambahkan.`);
    return newMember;
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addToast('success', 'Kolaborator GitHub Diperbarui');
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    addToast('info', 'Kolaborator GitHub Dihapus');
  };

  // Convert CRM Deal to Project with Automated GitHub Provisioning & Team Assignment
  const convertCrmDealToProject = (
    dealId: string, 
    customCode?: string, 
    customRepoName?: string, 
    moduleAssignments?: { epicKey: string; title: string; assigneeId: string; estimateHours?: number; description?: string }[]
  ): Project => {
    const deal = crmDeals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');

    const code = customCode || deal.dealCode.replace('DEAL-', '').slice(0, 8);
    const repoSlug = customRepoName || `${code.toLowerCase()}-core`;
    const fullRepoUrl = `github.com/${githubSettings.organization}/${repoSlug}`;
    const newProjectId = 'proj_' + Date.now();

    // Default modules if not customized
    const defaultModules: { epicKey: string; title: string; assigneeId: string; estimateHours?: number; description?: string }[] = [
      {
        epicKey: `${code}-EPIC-1`,
        title: 'Fondasi Sistem, Autentikasi & Database Schema',
        assigneeId: 'user-dev-1',
        estimateHours: 24,
        description: 'Inisialisasi arsitektur, auth, dan database schema.'
      },
      {
        epicKey: `${code}-EPIC-2`,
        title: 'Fitur Inti & Operasional Bisnis',
        assigneeId: 'user-dev-2',
        estimateHours: 36,
        description: 'Fitur operasional utama dan transaksi bisnis.'
      },
      {
        epicKey: `${code}-EPIC-3`,
        title: 'UAT, Pelaporan & Integrasi Billing',
        assigneeId: 'user-dev-3',
        estimateHours: 20,
        description: 'Pelaporan analitik, UAT, dan penagihan billing.'
      }
    ];

    const activeModules = moduleAssignments && moduleAssignments.length > 0 ? moduleAssignments : defaultModules;

    // Generate Epics
    const epicColors = ['#2563eb', '#059669', '#d97706', '#7c3aed'];
    const newEpics: Epic[] = activeModules.map((m, idx) => ({
      id: 'epic_' + Date.now() + '_' + idx,
      projectId: newProjectId,
      key: m.epicKey,
      title: m.title,
      description: `Modul pengerjaan ${m.title} dengan branch terisolasi`,
      color: epicColors[idx % epicColors.length]
    }));

    // Generate Branches automatically per module/epic
    const generatedBranches: ProjectBranch[] = [
      {
        name: githubSettings.defaultBranch,
        commitHash: '0f8c21a',
        moduleName: 'Main Production Branch',
        isDefault: true,
        lastUpdated: new Date().toISOString()
      },
      ...newEpics.map((ep, idx) => {
        const assignedMemberId = activeModules[idx]?.assigneeId || 'user-dev-1';
        const slug = ep.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);
        return {
          name: `${githubSettings.branchPrefixEpic}${ep.key.toLowerCase()}-${slug}`,
          commitHash: Math.random().toString(16).substring(2, 9),
          moduleName: ep.title,
          epicId: ep.id,
          assigneeId: assignedMemberId,
          isDefault: false,
          lastUpdated: new Date().toISOString()
        };
      })
    ];

    const newProject: Project = {
      id: newProjectId,
      code,
      name: deal.title,
      clientName: deal.clientName,
      clientEmail: deal.clientEmail,
      repoUrl: fullRepoUrl,
      sentryDsn: `https://o4508.ingest.sentry.io/api/${Math.floor(Math.random() * 900000 + 100000)}/envelope/`,
      status: 'Active',
      contractValue: deal.contractValue,
      contractType: 'Fixed Price',
      warrantyUntil: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      maintenanceQuotaHours: 15,
      maintenanceUsedHours: 0,
      killSwitchActive: false,
      workflowType: 'ai_automation',
      branches: generatedBranches,
      createdAt: new Date().toISOString()
    };

    // Create Sprint 1 for this project
    const newSprintId = 'sprint_' + Date.now();
    const newSprint: Sprint = {
      id: newSprintId,
      projectId: newProjectId,
      name: `Sprint 1: Inisialisasi Microservices, OPAC React & API Gateway`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      goal: `Selesaikan fondasi microservices Laravel, katalog buku OPAC React 19, Traefik API Gateway, dan test matrix QA`,
      status: 'active'
    };

    // Auto-create initial tasks distributed strictly according to the 5 team roles:
    // Jaka (Backend Dev), Aldyana (Frontend Dev), Parhan (QA), Asisyah (Project Manajer), Azi (Full stack)
    const isPerpus = deal.templateType === 'perpustakaan_microservices' || /perpustakaan|microservice/i.test(deal.title);

    let initialTasks: Task[] = [];

    if (isPerpus) {
      const getEpicId = (idx: number) => newEpics[idx % newEpics.length]?.id || newEpics[0]?.id;
      initialTasks = [
        // 1. Asisyah (Project Manajer)
        {
          id: `task_${Date.now()}_pm_1`,
          key: `${code}-101`,
          projectId: newProjectId,
          epicId: getEpicId(6),
          type: 'Task',
          title: '[PM] Kick-off Proyek & Finalisasi Dokumen Scope of Work (SOW)',
          description: `Rapat koordinasi kickoff dengan PIC ${deal.clientPic}, finalisasi termin ${deal.paymentTerms}, dan penetapan matriks RACI tim.`,
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-pm', // Asisyah (Project Manajer)
          reporterId: 'user-pm',
          estimateHours: 8,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'client_public',
          branchName: 'main',
          subtasks: [
            { id: `st_pm_1`, title: 'Undang rapat virtual PIC Rektorat & Perpustakaan', completed: false },
            { id: `st_pm_2`, title: 'Tanda tangan jadwal milestone & Berita Acara Kick-off', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_pm_2`,
          key: `${code}-102`,
          projectId: newProjectId,
          epicId: getEpicId(6),
          type: 'Task',
          title: '[PM] Sprint 1 Backlog Grooming & Definisi User Story Acceptance Criteria',
          description: 'Memimpin sesi backlog grooming bersama Jaka (Backend), Aldyana (Frontend), Azi (Fullstack), dan Parhan (QA).',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-pm', // Asisyah (Project Manajer)
          reporterId: 'user-pm',
          estimateHours: 12,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: 'main',
          subtasks: [
            { id: `st_pm_3`, title: 'Breakdown 18 user story arsitektur microservices', completed: false },
            { id: `st_pm_4`, title: 'Penguncian Definition of Done (DoD) bersama QA', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_pm_3`,
          key: `${code}-103`,
          projectId: newProjectId,
          epicId: getEpicId(6),
          type: 'Task',
          title: '[PM] Koordinasi Jadwal Demo UAT & Verifikasi Berita Acara Termin 1',
          description: 'Mengawasi burn-down velocity sprint dan memverifikasi kelengkapan dokumen Termin 1 (DP 30% Rp 55.500.000).',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-pm', // Asisyah (Project Manajer)
          reporterId: 'user-pm',
          estimateHours: 10,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: 'main',
          subtasks: [
            { id: `st_pm_5`, title: 'Presentasi progres mingguan ke kepala perpustakaan', completed: false },
            { id: `st_pm_6`, title: 'Koordinasi penagihan invoice termin 1 ke Finance', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 2. Jaka (Backend Dev)
        {
          id: `task_${Date.now()}_jaka_1`,
          key: `${code}-104`,
          projectId: newProjectId,
          epicId: getEpicId(0),
          type: 'Feature',
          title: '[Backend] Setup Microservice Katalog Buku Laravel 11 & Skema PostgreSQL',
          description: 'REST API master data ISBN, judul, pengarang, nomor DDC, dan lokasi rak fisik dengan Laravel 11 & PostgreSQL.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-3', // Jaka (Backend Dev)
          reporterId: 'user-pm',
          estimateHours: 24,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[1]?.name || 'feature/katalog-microservice',
          subtasks: [
            { id: `st_j1`, title: 'Migrasi database tabel books, authors, categories', completed: false },
            { id: `st_j2`, title: 'Resource Controller & FormRequest ISBN-13 validation', completed: false },
            { id: `st_j3`, title: 'Redis caching katalog buku populer dengan TTL 1 jam', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_jaka_2`,
          key: `${code}-105`,
          projectId: newProjectId,
          epicId: getEpicId(2),
          type: 'Feature',
          title: '[Backend] Engine Sirkulasi Peminjaman & Pengembalian dengan Redis Atomic Lock',
          description: 'Pencegahan race-condition saat 2 mahasiswa meminjam 1 eksemplar buku tersisa menggunakan Redis mutex lock, durasi pinjam 7 hari.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-3', // Jaka (Backend Dev)
          reporterId: 'user-pm',
          estimateHours: 28,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[3]?.name || 'feature/sirkulasi-engine',
          subtasks: [
            { id: `st_j4`, title: 'Endpoint POST /api/v1/circulation/borrow dengan atomic lock', completed: false },
            { id: `st_j5`, title: 'Validasi batas kuota maksimal 3 buku per mahasiswa', completed: false },
            { id: `st_j6`, title: 'Endpoint POST /api/v1/circulation/return untuk check-in', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_jaka_3`,
          key: `${code}-106`,
          projectId: newProjectId,
          epicId: getEpicId(2),
          type: 'Task',
          title: '[Backend] Service Perhitungan Denda Keterlambatan Rp 2.000/Hari via Laravel Scheduler',
          description: 'Cron scheduler harian jam 00:01 WIB: kalkulasi otomatis hari keterlambatan pengembalian buku dan auto-suspend kartu peminjam jika denda > Rp 20.000.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-3', // Jaka (Backend Dev)
          reporterId: 'user-pm',
          estimateHours: 16,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[3]?.name || 'feature/denda-scheduler',
          subtasks: [
            { id: `st_j7`, title: 'Artisan command CalculateOverdueFinesCommand', completed: false },
            { id: `st_j8`, title: 'Pengecualian hari libur nasional & akhir pekan', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_jaka_4`,
          key: `${code}-107`,
          projectId: newProjectId,
          epicId: getEpicId(0),
          type: 'Feature',
          title: '[Backend] Centralized JWT Sanctum Authentication & RBAC Pustakawan vs Mahasiswa',
          description: 'Otorisasi token bearer JWT terpusat di seluruh endpoint microservices Laravel untuk verifikasi status anggota aktif.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-3', // Jaka (Backend Dev)
          reporterId: 'user-pm',
          estimateHours: 20,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[1]?.name || 'feature/sanctum-rbac',
          subtasks: [
            { id: `st_j9`, title: 'Setup token refresh middleware Laravel Sanctum', completed: false },
            { id: `st_j10`, title: 'Rate limiting 120 req/menit per client token', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 3. Aldyana (Frontend Dev)
        {
          id: `task_${Date.now()}_ald_1`,
          key: `${code}-108`,
          projectId: newProjectId,
          epicId: getEpicId(1),
          type: 'Feature',
          title: '[Frontend] Slicing & State Management Katalog OPAC React 19 + Tailwind CSS',
          description: 'Portal pencarian buku publik mahasiswa (OPAC): live search instan, filter multi-kategori, dan visualisasi ketersediaan rak.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-2', // Aldyana (Frontend Dev)
          reporterId: 'user-pm',
          estimateHours: 26,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'client_public',
          branchName: generatedBranches[2]?.name || 'feature/react-portal-opac',
          subtasks: [
            { id: `st_a1`, title: 'BookSearchFilter dengan input debounce 300ms', completed: false },
            { id: `st_a2`, title: 'Grid kartu buku dengan badge status ketersediaan rak', completed: false },
            { id: `st_a3`, title: 'Modal detail buku dengan nomor panggil DDC & sinopsis', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_ald_2`,
          key: `${code}-109`,
          projectId: newProjectId,
          epicId: getEpicId(3),
          type: 'Feature',
          title: '[Frontend] Meja Sirkulasi Petugas: Scan Barcode ISBN & Quick Checkout Buku',
          description: 'Antarmuka kasir meja petugas perpustakaan: input otomatis scanner barcode USB/Bluetooth, checkout dalam detik, dan cetak slip thermal 58mm.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-2', // Aldyana (Frontend Dev)
          reporterId: 'user-pm',
          estimateHours: 22,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[4]?.name || 'feature/meja-sirkulasi',
          subtasks: [
            { id: `st_a4`, title: 'Event listener global scanner barcode keyboard-wedge', completed: false },
            { id: `st_a5`, title: 'Keranjang sirkulasi peminjaman multi-buku', completed: false },
            { id: `st_a6`, title: 'Integrasi cetak slip tanda terima thermal ESC/POS 58mm', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_ald_3`,
          key: `${code}-110`,
          projectId: newProjectId,
          epicId: getEpicId(3),
          type: 'Feature',
          title: '[Frontend] Dashboard Mahasiswa: Barcode Kartu Anggota Digital & Riwayat Pinjaman',
          description: 'Halaman dashboard personal anggota: render Barcode Code-128 NIM mahasiswa, daftar buku yang sedang dipinjam, dan countdown timer due date.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-2', // Aldyana (Frontend Dev)
          reporterId: 'user-pm',
          estimateHours: 20,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
          visibility: 'client_public',
          branchName: generatedBranches[4]?.name || 'feature/mahasiswa-dashboard',
          subtasks: [
            { id: `st_a7`, title: 'Komponen Barcode Code-128 digital kartu anggota', completed: false },
            { id: `st_a8`, title: 'Tabel riwayat pinjaman & tombol perpanjang mandiri 1x', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 4. Parhan (QA)
        {
          id: `task_${Date.now()}_par_1`,
          key: `${code}-111`,
          projectId: newProjectId,
          epicId: getEpicId(5),
          type: 'Task',
          title: '[QA] Susun Matrix Test Case Sirkulasi Peminjaman, Denda & Edge-Case Buku Rusak',
          description: 'Menyusun skenario pengujian komprehensif: 35 skenario transaksi peminjaman, pencegahan double-borrow, dan denda saat libur nasional.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-qa', // Parhan (QA)
          reporterId: 'user-pm',
          estimateHours: 18,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[6]?.name || 'qa/test-matrix-sirkulasi',
          subtasks: [
            { id: `st_p1`, title: 'Test matrix modul katalog pencarian & filter DDC', completed: false },
            { id: `st_p2`, title: 'Test matrix transaksi sirkulasi peminjaman & pengembalian', completed: false },
            { id: `st_p3`, title: 'Verifikasi penolakan peminjaman jika denda > Rp 20.000', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_par_2`,
          key: `${code}-112`,
          projectId: newProjectId,
          epicId: getEpicId(5),
          type: 'Task',
          title: '[QA] Uji Beban (Load Test) Microservices API Katalog via K6 Target 2.000 RPS',
          description: 'Simulasi lonjakan traffic mahasiswa saat awal semester baru (target 2.000 RPS): memastikan latency API < 150ms dan CPU usage < 65%.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-qa', // Parhan (QA)
          reporterId: 'user-pm',
          estimateHours: 16,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[6]?.name || 'qa/k6-load-testing',
          subtasks: [
            { id: `st_p4`, title: 'Script skenario K6 concurrent search buku', completed: false },
            { id: `st_p5`, title: 'Analisis connection pool PostgreSQL & Redis under stress', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_par_3`,
          key: `${code}-113`,
          projectId: newProjectId,
          epicId: getEpicId(5),
          type: 'Task',
          title: '[QA] Automation E2E Testing Skenario Peminjaman Buku via Playwright TypeScript',
          description: 'Automasi end-to-end browser test: flow login mahasiswa -> search katalog -> verifikasi checkout petugas -> assert stok rak berkurang.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-qa', // Parhan (QA)
          reporterId: 'user-pm',
          estimateHours: 24,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[6]?.name || 'qa/playwright-e2e',
          subtasks: [
            { id: `st_p6`, title: 'Setup framework Playwright TypeScript pada CI staging', completed: false },
            { id: `st_p7`, title: 'Script E2E sirkulasi peminjaman & verifikasi struk digital', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },

        // 5. Azi (Full stack)
        {
          id: `task_${Date.now()}_azi_1`,
          key: `${code}-114`,
          projectId: newProjectId,
          epicId: getEpicId(4),
          type: 'Feature',
          title: '[Fullstack] Setup API Gateway Traefik, Docker Compose Microservices & CORS',
          description: 'Arsitektur komunikasi antar-layanan: reverse proxy Traefik, routing /api/v1/catalog, /api/v1/circulation, dan portal frontend React 19.',
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-dev-1', // Azi (Full stack)
          reporterId: 'user-pm',
          estimateHours: 28,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'internal',
          branchName: generatedBranches[5]?.name || 'feature/api-gateway-docker',
          subtasks: [
            { id: `st_az1`, title: 'File docker-compose.yml multi-container (PHP-FPM, Vite, Postgres, Redis)', completed: false },
            { id: `st_az2`, title: 'Routing API Gateway Traefik dengan SSL Let\'s Encrypt otomatis', completed: false },
            { id: `st_az3`, title: 'Health check endpoint /healthz kelayakan container', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_azi_2`,
          key: `${code}-115`,
          projectId: newProjectId,
          epicId: getEpicId(4),
          type: 'Feature',
          title: '[Fullstack] Integrasi Webhook WhatsApp Gateway untuk Notifikasi H-1 Pengembalian Buku',
          description: 'Otomatis mengirim pesan resmi WhatsApp ke mahasiswa pada H-1 tanggal jatuh tempo untuk mencegah timbulnya denda.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-1', // Azi (Full stack)
          reporterId: 'user-pm',
          estimateHours: 20,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
          visibility: 'client_public',
          branchName: generatedBranches[5]?.name || 'feature/whatsapp-gateway',
          subtasks: [
            { id: `st_az4`, title: 'Webhook handler status delivery WhatsApp (SENT, READ)', completed: false },
            { id: `st_az5`, title: 'Antrian pengiriman via Laravel Queue Redis dengan auto-retry 3x', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `task_${Date.now()}_azi_3`,
          key: `${code}-116`,
          projectId: newProjectId,
          epicId: getEpicId(4),
          type: 'Feature',
          title: '[Fullstack] Layanan Export Rekap Statistik Sirkulasi Bulanan Perpustakaan ke PDF & Excel',
          description: 'Endpoint backend penghasil data agregat peminjaman per fakultas dan UI React untuk unduh laporan PDF/Excel resmi.',
          status: 'Backlog',
          priority: 'Sedang',
          source: 'Manual',
          assigneeId: 'user-dev-1', // Azi (Full stack)
          reporterId: 'user-pm',
          estimateHours: 18,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 13 * 86400000).toISOString().split('T')[0],
          visibility: 'internal',
          branchName: generatedBranches[5]?.name || 'feature/reporting-pdf-excel',
          subtasks: [
            { id: `st_az6`, title: 'Service export data menggunakan Laravel Excel (Maatwebsite)', completed: false },
            { id: `st_az7`, title: 'Template PDF resmi berlogo universitas via DomPDF', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
    } else {
      // Default fallback conversion
      initialTasks = [
        {
          id: 'task_' + Date.now() + '_0',
          key: `${code}-101`,
          projectId: newProjectId,
          epicId: newEpics[0].id,
          type: 'Task',
          title: 'Kick-off Proyek & Finalisasi Dokumen Scope of Work',
          description: `Bahas termin ${deal.paymentTerms} dan rincian modul bersama PIC ${deal.clientPic}`,
          status: 'Backlog',
          priority: 'Tinggi',
          source: 'Manual',
          assigneeId: 'user-pm',
          reporterId: 'user-pm',
          estimateHours: 6,
          timeLoggedHours: 0,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          sprintId: newSprintId,
          visibility: 'client_public',
          subtasks: [
            { id: 'st_c1', title: 'Undang meeting virtual PIC Klien', completed: false },
            { id: 'st_c2', title: 'Tanda tangan jadwal milestone & SOW', completed: false }
          ],
          relations: [],
          lastStatusUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        ...newEpics.map((ep, idx) => {
          const assignedMemberId = activeModules[idx]?.assigneeId || 'user-dev-1';
          const assignedBranch = generatedBranches[idx + 1]?.name;
          const assignedHours = activeModules[idx]?.estimateHours || 24;
          const customDesc = activeModules[idx]?.description || `Pengerjaan arsitektur dan fungsionalitas modul pada branch \`${assignedBranch}\`. Dikerjakan oleh lead engineer terpilih.`;
          return {
            id: `task_${Date.now()}_${idx + 1}`,
            key: `${code}-${102 + idx}`,
            projectId: newProjectId,
            epicId: ep.id,
            type: 'Task' as const,
            title: `Implementasi Modul: ${ep.title}`,
            description: customDesc,
            status: 'Backlog' as const,
            priority: 'Tinggi' as const,
            source: 'Manual' as const,
            assigneeId: assignedMemberId,
            reporterId: 'user-pm',
            estimateHours: assignedHours,
            timeLoggedHours: 0,
            startDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + (7 + idx * 4) * 86400000).toISOString().split('T')[0],
            sprintId: idx < 3 ? newSprintId : undefined,
            visibility: 'internal' as const,
            branchName: assignedBranch,
            subtasks: [
              { id: `st_mod_${idx}_1`, title: 'Inisialisasi kode modul & schema', completed: false },
              { id: `st_mod_${idx}_2`, title: 'Buat unit test coverage dasar', completed: false }
            ],
            relations: [],
            lastStatusUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        })
      ];
    }

    setProjects((prev) => [newProject, ...prev]);
    setEpics((prev) => [...prev, ...newEpics]);
    setSprints((prev) => [newSprint, ...prev]);
    setTasks((prev) => [...initialTasks, ...prev]);

    // Mark deal as Converted
    setCrmDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, status: 'Converted' } : d))
    );

    // Check multi-module developers
    const devModuleCount: Record<string, number> = {};
    activeModules.forEach((m) => {
      devModuleCount[m.assigneeId] = (devModuleCount[m.assigneeId] || 0) + 1;
    });
    const multiModuleDevsCount = Object.values(devModuleCount).filter((c) => c > 1).length;

    setSelectedProjectId(newProjectId);
    addToast(
      'success', 
      'Otomasi GitHub & Proyek Selesai!', 
      multiModuleDevsCount > 0
        ? `Repo ${fullRepoUrl} & ${generatedBranches.length} branch dibuat. Modul siap di Backlog (${multiModuleDevsCount} developer memegang lebih dari 1 modul).`
        : `Repo ${fullRepoUrl} dan ${generatedBranches.length} branch modul dibuat. Tugas telah dibagikan ke tim di kolom Backlog.`
    );
    return newProject;
  };

  // Create invoice from completed tasks
  const createInvoiceFromCompletedTasks = (projectId: string, taskIds: string[], type: Invoice['type'] = 'Maintenance Berkala'): Invoice => {
    const project = projects.find((p) => p.id === projectId) || projects[0];
    const selectedCompletedTasks = tasks.filter((t) => taskIds.includes(t.id));

    const hourlyRate = 350000; // Rp 350.000 / jam
    const items: InvoiceItem[] = selectedCompletedTasks.map((t) => {
      const hours = Math.max(1, t.timeLoggedHours || t.estimateHours);
      return {
        id: 'item_' + Math.random().toString(36).substr(2, 6),
        taskId: t.id,
        description: `Pekerjaan ${t.key}: ${t.title}`,
        hoursOrUnits: hours,
        ratePerUnit: hourlyRate,
        amount: hours * hourlyRate
      };
    });

    if (items.length === 0) {
      items.push({
        id: 'item_' + Date.now(),
        taskId: undefined,
        description: `Termin Pengerjaan Proyek ${project.name}`,
        hoursOrUnits: 1,
        ratePerUnit: 25000000,
        amount: 25000000
      });
    }

    const subtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
    const taxPpn = Math.round(subtotal * 0.11);
    const totalAmount = subtotal + taxPpn;

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: `INV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${project.code}-${Math.floor(Math.random() * 800 + 100)}`,
      projectId: project.id,
      clientName: project.clientName,
      type,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items,
      subtotal,
      discount: 0,
      taxPpn,
      totalAmount,
      status: 'Draft',
      notes: 'Pembayaran wajib dilakukan via transfer rekening resmi sebelum jatuh tempo.',
      bankAccount: {
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '883-091-2391',
        accountHolder: 'PT Digital Manjer Solusindo'
      }
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Mark tasks as billed to prevent double billing! (PRD 9: "Penanda ditagih")
    setTasks((prev) =>
      prev.map((t) => (taskIds.includes(t.id) ? { ...t, billedInvoiceId: newInvoice.id } : t))
    );

    addToast('success', 'Draft Invoice Dibuat', `${newInvoice.invoiceNumber} siap direview PM.`);
    return newInvoice;
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv))
    );
    addToast('info', 'Status Invoice Diperbarui', `Status saat ini: ${status}`);
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter((t) => t.status === 'Selesai');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const createCustomProgressInvoice = (params: {
    projectId: string;
    percentage: number;
    customAmount: number;
    title: string;
    notes?: string;
    dueDate?: string;
  }) => {
    const project = projects.find((p) => p.id === params.projectId) || projects[0];
    const currentProgress = getProjectProgress(project.id);

    // Rule: invoice can only be issued when progress > 10%
    if (currentProgress <= 10) {
      const errMsg = `Invoice belum dapat diterbitkan karena progres proyek "${project.name}" saat ini baru ${currentProgress}%. Sesuai SOP, progres minimal harus di atas 10%.`;
      addToast('error', 'Syarat Progres Belum Terpenuhi', errMsg);
      return { success: false, error: errMsg };
    }

    const subtotal = params.customAmount;
    const taxPpn = Math.round(subtotal * 0.11);
    const totalAmount = subtotal + taxPpn;

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: `INV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${project.code}-${Math.floor(Math.random() * 800 + 100)}`,
      projectId: project.id,
      clientName: project.clientName,
      type: 'Milestone Termin',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: params.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: 'item_' + Date.now(),
          taskId: undefined,
          description: params.title || `Termin ${params.percentage}% Proyek ${project.name}`,
          hoursOrUnits: 1,
          ratePerUnit: subtotal,
          amount: subtotal
        }
      ],
      subtotal,
      discount: 0,
      taxPpn,
      totalAmount,
      status: 'Terkirim ke Finance', // Sent directly to Finance!
      percentage: params.percentage,
      projectProgressAtIssue: currentProgress,
      notes: params.notes || 'Invoice diterbitkan otomatis berdasarkan capaian progres proyek > 10% dan diteruskan ke Finance.',
      bankAccount: {
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '883-091-2391',
        accountHolder: 'PT Digital Manjer Solusindo'
      }
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    const formatRupiah = (val: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    // 1. Notification for Finance
    addNotification({
      title: `🔔 [Finance] Invoice Baru Diterima: ${newInvoice.invoiceNumber}`,
      message: `Invoice termin ${params.percentage}% senilai ${formatRupiah(totalAmount)} untuk proyek "${project.name}" (Progres ${currentProgress}%) telah diterbitkan dan masuk ke antrean verifikasi Finance.`,
      type: 'finance',
      projectId: project.id,
      invoiceId: newInvoice.id,
      amount: totalAmount,
      percentage: params.percentage
    });

    // 2. Notification for CRM
    addNotification({
      title: `💼 [CRM] Update Finansial Deal: ${project.name}`,
      message: `Pipeline termin proyek "${project.name}" terupdate: Invoice ${newInvoice.invoiceNumber} (${params.percentage}%, ${formatRupiah(totalAmount)}) telah berhasil diajukan ke tim Finance.`,
      type: 'crm',
      projectId: project.id,
      invoiceId: newInvoice.id,
      amount: totalAmount,
      percentage: params.percentage
    });

    // Toasts for immediate feedback
    addToast('success', 'Terkirim ke Finance! 🚀', `Invoice ${newInvoice.invoiceNumber} (${params.percentage}%) berhasil dibuat dan dikirim ke Finance.`);
    addToast('info', 'Notifikasi CRM Terkirim! 💼', `Data pipeline pembayaran proyek "${project.name}" telah diperbarui.`);

    return { success: true, invoice: newInvoice };
  };

  const ingestBugReport = (data: {
    projectId: string;
    title: string;
    description: string;
    source: 'Web Form' | 'WhatsApp' | 'Sentry';
    priority?: TaskPriority;
    severity?: BugSeverity;
    environment?: BugEnvironment;
    sentryErrorDetails?: string;
    reproductionSteps?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    warrantyStatus?: WarrantyStatus;
  }): Task => {
    const defaultSeverity: BugSeverity = 
      data.severity || 
      (data.priority === 'Hotfix' ? 'S1 - Critical (Blocker)' : data.priority === 'Tinggi' ? 'S2 - Major' : 'S3 - Minor');

    const defaultSteps = data.reproductionSteps || [
      '1. Akses modul terkait pada sistem',
      '2. Masukkan input atau trigger aksi user',
      '3. Amati error / kegagalan respon sistem'
    ];

    const task = createTask({
      projectId: data.projectId,
      type: 'Bug',
      title: data.title,
      description: data.description + (data.sentryErrorDetails ? `\n\nStacktrace / Context:\n${data.sentryErrorDetails}` : ''),
      source: data.source,
      priority: data.priority || (defaultSeverity === 'S1 - Critical (Blocker)' ? 'Hotfix' : 'Tinggi'),
      severity: defaultSeverity,
      environment: data.environment || 'Production',
      warrantyStatus: data.warrantyStatus || 'Garansi Proyek (Gratis)',
      reproductionSteps: defaultSteps,
      expectedBehavior: data.expectedBehavior || 'Operasi berhasil diproses tanpa pesan galat dan state database konsisten.',
      actualBehavior: data.actualBehavior || (data.sentryErrorDetails ? 'Runtime exception ditangkap sistem' : 'Fungsi terhenti / error 500 ditampilkan'),
      status: 'Baru',
      visibility: 'client_public'
    });

    return task;
  };

  const resetDataToDefault = () => {
    localStorage.removeItem(`${STORAGE_KEY}_projects`);
    localStorage.removeItem(`${STORAGE_KEY}_tasks`);
    localStorage.removeItem(`${STORAGE_KEY}_epics`);
    localStorage.removeItem(`${STORAGE_KEY}_sprints`);
    localStorage.removeItem(`${STORAGE_KEY}_members`);
    localStorage.removeItem(`${STORAGE_KEY}_deals`);
    localStorage.removeItem(`${STORAGE_KEY}_invoices`);
    localStorage.removeItem(`${STORAGE_KEY}_events`);
    localStorage.removeItem(`${STORAGE_KEY}_comments`);
    localStorage.removeItem(`${STORAGE_KEY}_rules`);
    localStorage.removeItem(`${STORAGE_KEY}_github`);

    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setEpics(INITIAL_EPICS);
    setSprints(INITIAL_SPRINTS);
    setTeamMembers(INITIAL_MEMBERS);
    setCrmDeals(INITIAL_CRM_DEALS);
    setInvoices(INITIAL_INVOICES);
    setEvents(INITIAL_EVENTS);
    setComments(INITIAL_COMMENTS);
    setAutomationRules(INITIAL_RULES);
    setGithubSettings(INITIAL_GITHUB_SETTINGS);
    setSelectedProjectId('proj-perpustakaan');
    addToast('info', 'Data Direset', 'Semua data telah dikembalikan ke kondisi default demo.');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        selectedProjectId,
        setSelectedProjectId,
        activeProject,
        projects,
        tasks,
        epics,
        sprints,
        teamMembers,
        crmDeals,
        invoices,
        events,
        comments,
        automationRules,
        toasts,
        githubSettings,
        updateGithubSettings,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addToast,
        removeToast,
        updateTaskStatus,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        toggleSubtask,
        addSubtask,
        triageBug,
        qaSignOff,
        recordBugRca,
        reopenBug,
        runAiFixer,
        runIntelligentOrchestrator,
        createSimulatedBug,
        approveAiPr,
        rejectAiPr,
        requestAiRevision,
        chooseManualFix,
        submitHumanFix,
        deployToStaging,
        deployToProduction,
        triggerRollback,
        toggleKillSwitch,
        convertCrmDealToProject,
        createInvoiceFromCompletedTasks,
        updateInvoiceStatus,
        createCustomProgressInvoice,
        getProjectProgress,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        ingestBugReport,
        resetDataToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
