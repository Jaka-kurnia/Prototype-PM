import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Task, 
  BugDifficulty, 
  BugSeverity, 
  TaskPriority, 
  TaskStatus, 
  BugEnvironment,
  IntelligentOrchestratorResult
} from '../../types';
import { 
  Bot, 
  ShieldCheck, 
  Power, 
  GitPullRequest, 
  AlertTriangle, 
  Play, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Layers, 
  RefreshCw,
  FileCode,
  Bug,
  Server,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  X,
  Plus,
  Send,
  RotateCcw,
  Globe,
  FileText,
  UserCheck,
  CheckSquare,
  Kanban as KanbanIcon,
  List as ListIcon,
  Zap,
  Shield,
  AlertCircle,
  Filter,
  ArrowUpRight,
  ChevronRight,
  Cpu,
  Code,
  GitBranch,
  GitCommit
} from 'lucide-react';

interface AiAutomationHubProps {
  onSelectTask: (task: Task) => void;
  onOpenIntakeModal: () => void;
}

export const AiAutomationHub: React.FC<AiAutomationHubProps> = ({ onSelectTask, onOpenIntakeModal }) => {
  const { 
    projects, 
    tasks, 
    selectedProjectId, 
    setSelectedProjectId,
    toggleKillSwitch, 
    activeProject, 
    runAiFixer,
    runIntelligentOrchestrator,
    createSimulatedBug,
    createTask,
    approveAiPr,
    rejectAiPr,
    requestAiRevision,
    deployToStaging,
    deployToProduction,
    triggerRollback,
    submitHumanFix,
    qaSignOff,
    updateTaskStatus,
    addToast,
    role
  } = useApp();

  // Primary view: Kanban pipeline or Table list
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'kecil' | 'menengah' | 'besar' | 'pr_review' | 'manual' | 'monitoring'>('all');
  
  // Simulation running state
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [runningActionText, setRunningActionText] = useState<string>('');

  // Selected ticket for execution dropdown
  const [selectedTaskForRun, setSelectedTaskForRun] = useState<string>('');

  // Drawer / Inspector modal state
  const [inspectedTask, setInspectedTask] = useState<Task | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'orchestrator' | 'solution' | 'qa_signoff' | 'telemetry'>('overview');
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Intelligent Orchestrator Console & Simulator state
  const [orchestratorInput, setOrchestratorInput] = useState<string>(
    'User mendapati error 500 saat mencoba klik tombol simpan profil jika kolom nomor telepon dikosongkan. Stacktrace: NullPointerException at UserController.java:45'
  );
  const [orchestratorResultState, setOrchestratorResultState] = useState<IntelligentOrchestratorResult | null>(() => {
    return runIntelligentOrchestrator(
      'User mendapati error 500 saat mencoba klik tombol simpan profil jika kolom nomor telepon dikosongkan. Stacktrace: NullPointerException at UserController.java:45',
      { taskKey: 'SIM-USER-45' }
    );
  });
  const [copiedJson, setCopiedJson] = useState(false);
  const [isExecutingOrchestratorPipeline, setIsExecutingOrchestratorPipeline] = useState(false);

  // Human intervention form state (for Big Bug)
  const [selectedMitigation, setSelectedMitigation] = useState<string>('');
  const [customCommitHash, setCustomCommitHash] = useState<string>('');
  const [humanDevNotes, setHumanDevNotes] = useState<string>('');
  const [humanTimeHours, setHumanTimeHours] = useState<number>(3);
  const [advanceDirectlyToQa, setAdvanceDirectlyToQa] = useState<boolean>(true);

  // QA Sign-Off form state
  const [qaNotes, setQaNotes] = useState<string>('');
  const [qaPassedCases, setQaPassedCases] = useState<number>(6);
  const [qaTotalCases, setQaTotalCases] = useState<number>(6);

  // New Bug Report modal state
  const [showNewBugModal, setShowNewBugModal] = useState(false);
  const [newBugCategory, setNewBugCategory] = useState<'kecil' | 'menengah' | 'besar'>('kecil');
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugDesc, setNewBugDesc] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<BugSeverity>('S3 - Minor');
  const [newBugSource, setNewBugSource] = useState<'Sentry' | 'WhatsApp' | 'Web Form'>('Sentry');

  // Double confirmation modal for production hotfix
  const [showDoubleConfirmDeploy, setShowDoubleConfirmDeploy] = useState<Task | null>(null);

  // Active project
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Bug tasks of current project
  const bugTasks = tasks.filter((t) => t.projectId === selectedProjectId && t.type === 'Bug');

  // Categorized bugs according to standard software house classification
  const smallBugs = bugTasks.filter((t) => 
    t.difficulty === 'Low' || 
    t.severity === 'S3 - Minor' || 
    t.severity === 'S4 - Trivial' ||
    /typo|null|undefined|label|footer|display|format|margin|padding|css/i.test(t.title)
  );

  const largeBugs = bugTasks.filter((t) => 
    t.difficulty === 'Hard' || 
    t.severity === 'S1 - Critical (Blocker)' || 
    t.status === 'Perlu Manual' ||
    /deadlock|database|40p01|concurrency|race.condition|migrasi|auth|token|refund|idempotency/i.test(t.title)
  );

  const mediumBugs = bugTasks.filter((t) => 
    !smallBugs.includes(t) && !largeBugs.includes(t)
  );

  const pendingApprovalBugs = bugTasks.filter((t) => t.status === 'Menunggu Persetujuan');
  const manualBugs = bugTasks.filter((t) => t.status === 'Perlu Manual');
  const monitoringBugs = bugTasks.filter((t) => ['Dipantau', 'Deploy Production', 'Deploy Staging'].includes(t.status));

  // Displayed bugs based on filter pill
  const displayedBugs = bugTasks.filter((t) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'kecil') return smallBugs.includes(t);
    if (categoryFilter === 'menengah') return mediumBugs.includes(t);
    if (categoryFilter === 'besar') return largeBugs.includes(t);
    if (categoryFilter === 'pr_review') return t.status === 'Menunggu Persetujuan';
    if (categoryFilter === 'manual') return t.status === 'Perlu Manual';
    if (categoryFilter === 'monitoring') return ['Dipantau', 'Deploy Production', 'Deploy Staging'].includes(t.status);
    return true;
  });

  // Kanban Pipeline Stages (Software House & Jira Standard)
  const pipelineColumns = [
    {
      id: 'triage',
      stepNum: '1',
      title: 'Triage Masuk',
      subtitle: 'Sentry / WhatsApp Klien',
      statuses: ['Baru', 'Dikonfirmasi', 'Dianalisis']
    },
    {
      id: 'in_progress',
      stepNum: '2',
      title: 'Pengerjaan Fix',
      subtitle: 'AI Auto-Fix / Programmer Manusia',
      statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual']
    },
    {
      id: 'pr_review',
      stepNum: '3',
      title: 'Code Review PR',
      subtitle: 'CI Regression Tests & Diff',
      statuses: ['Menunggu Persetujuan', 'In Review']
    },
    {
      id: 'staging_qa',
      stepNum: '4',
      title: 'QA Staging Sign-Off',
      subtitle: 'Verifikasi Server Staging',
      statuses: ['Disetujui', 'Deploy Staging', 'QA/Testing']
    },
    {
      id: 'production_hotfix',
      stepNum: '5',
      title: 'Hotfix Production',
      subtitle: 'Live 30-Menit Sentry Guard',
      statuses: ['Deploy Production', 'Dipantau', 'Selesai']
    }
  ];

  // Actions
  const handleRunManualSimulation = async () => {
    if (!selectedTaskForRun) return;
    setIsRunningSim(true);
    setRunningActionText('Menjalankan AI Triage & Fixer...');
    await runAiFixer(selectedTaskForRun);
    setIsRunningSim(false);
    setRunningActionText('');
    const updated = tasks.find((t) => t.id === selectedTaskForRun);
    if (updated) setInspectedTask(updated);
  };

  const handleTestCategory = async (cat: 'kecil' | 'menengah' | 'besar') => {
    setIsRunningSim(true);
    setRunningActionText(
      cat === 'besar' 
        ? 'Memicu Safety Guardrail: Menyusun Paket Diagnostik untuk Developer...' 
        : `Menjalankan AI Auto-Fix untuk Bug ${cat.toUpperCase()}...`
    );
    const newBug = createSimulatedBug(selectedProjectId, cat);
    setInspectedTask(newBug);
    await runAiFixer(newBug.id, cat);
    setIsRunningSim(false);
    setRunningActionText('');
    const updated = tasks.find((t) => t.id === newBug.id);
    if (updated) {
      setInspectedTask(updated);
      setInspectorTab('solution');
    }
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Intelligent Orchestrator Handlers
  const handleRunOrchestrator = (customText?: string) => {
    const text = customText !== undefined ? customText : orchestratorInput;
    if (customText !== undefined) {
      setOrchestratorInput(customText);
    }
    const result = runIntelligentOrchestrator(text, {
      taskKey: currentProject ? `${currentProject.code}-${Math.floor(Math.random() * 500 + 100)}` : 'ORCH-01',
      projectId: selectedProjectId
    });
    setOrchestratorResultState(result);
    addToast('info', 'Intelligent Orchestrator Selesai', `Klasifikasi: ${result.complexity_level} | Eksekutor: ${result.assigned_to}`);
  };

  const handleCopyJson = () => {
    if (!orchestratorResultState) return;
    navigator.clipboard.writeText(JSON.stringify(orchestratorResultState, null, 2));
    setCopiedJson(true);
    addToast('success', 'JSON Disalin!', 'Objek JSON valid Intelligent Orchestrator telah disalin ke clipboard.');
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExecuteOrchestratorToErp = async () => {
    if (!orchestratorResultState) return;
    setIsExecutingOrchestratorPipeline(true);

    const isExpert = orchestratorResultState.complexity_level === 'EXPERT';
    const isMedium = orchestratorResultState.complexity_level === 'MEDIUM';
    const cat: 'kecil' | 'menengah' | 'besar' = isExpert ? 'besar' : isMedium ? 'menengah' : 'kecil';

    const branchName = orchestratorResultState.github_workflow.feature_branch_name;
    const taskTitle = `[Live Prod] ${branchName.replace(/^fix\//, '').replace(/-/g, ' ').toUpperCase()}`;

    const newTask = createTask({
      projectId: selectedProjectId,
      type: 'Bug',
      title: taskTitle,
      description: `${orchestratorInput}\n\n[Ringkasan Analisis AI Orchestrator]\n${orchestratorResultState.bug_analysis}`,
      status: 'Baru',
      priority: isExpert ? 'Hotfix' : isMedium ? 'Sedang' : 'Rendah',
      difficulty: isExpert ? 'Hard' : isMedium ? 'Medium' : 'Low',
      severity: isExpert ? 'S1 - Critical (Blocker)' : isMedium ? 'S2 - Major' : 'S3 - Minor',
      environment: 'Production',
      warrantyStatus: 'Garansi Proyek (Gratis)',
      source: 'Sentry',
      assigneeId: isExpert ? 'user-dev-3' : 'user-dev-1',
      branchName: branchName,
      orchestratorResult: orchestratorResultState
    });

    setInspectedTask(newTask);
    await runAiFixer(newTask.id, cat);
    setIsExecutingOrchestratorPipeline(false);

    const refreshed = tasks.find((t) => t.id === newTask.id);
    if (refreshed) {
      setInspectedTask(refreshed);
      setInspectorTab(isExpert ? 'solution' : 'orchestrator');
    }
  };

  const handleCreateCustomBug = () => {
    if (!newBugTitle.trim()) return;
    const newBug = createSimulatedBug(selectedProjectId, newBugCategory);
    newBug.title = newBugTitle;
    if (newBugDesc.trim()) newBug.description = newBugDesc;
    newBug.severity = newBugSeverity;
    newBug.source = newBugSource;
    setShowNewBugModal(false);
    setNewBugTitle('');
    setNewBugDesc('');
    setInspectedTask(newBug);
    runAiFixer(newBug.id, newBugCategory);
  };

  const handleSubmitHumanIntervention = () => {
    if (!inspectedTask) return;
    const mitigation = selectedMitigation || inspectedTask.diagnosticPackage?.suggestedFixes[0]?.option || 'Deterministic Ordering & Redis Redlock Mutex';
    submitHumanFix(inspectedTask.id, {
      mitigationOption: mitigation,
      patchCommitHash: customCommitHash || Math.random().toString(16).substring(2, 9),
      devNotes: humanDevNotes || 'Penanganan manual bug besar selesai dan lolos stress testing.',
      timeSpentHours: humanTimeHours || 2.5,
      advanceToQa: advanceDirectlyToQa
    });

    const refreshed = tasks.find((t) => t.id === inspectedTask.id);
    if (refreshed) {
      setInspectedTask({
        ...refreshed,
        status: advanceDirectlyToQa ? 'Deploy Staging' : 'Menunggu Persetujuan'
      });
      setInspectorTab('qa_signoff');
    }
  };

  const handleQaSignOffSubmit = () => {
    if (!inspectedTask) return;
    qaSignOff(inspectedTask.id, {
      passed: true,
      notes: qaNotes || 'Seluruh skenario pengujian di staging lolos tanpa regresi. Siap deploy hotfix ke live production.',
      testCasesCount: qaTotalCases,
      passedCasesCount: qaPassedCases
    });
    setInspectedTask({
      ...inspectedTask,
      status: 'Disetujui',
      qaSignOff: {
        testerId: 'user-qa',
        testerName: 'Parhan (QA Lead)',
        testedAt: new Date().toISOString(),
        environment: 'Staging',
        status: 'Passed',
        notes: qaNotes || 'Smoke test & regression test staging lolos.',
        testCasesCount: qaTotalCases,
        passedCasesCount: qaPassedCases
      }
    });
  };

  const handleConfirmDeployProduction = (task: Task) => {
    deployToProduction(task.id, true);
    setShowDoubleConfirmDeploy(null);
    setInspectedTask({
      ...task,
      status: 'Deploy Production'
    });
    setInspectorTab('telemetry');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 font-sans text-zinc-900 pb-12">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* 1. HEADER: CLEAN STATUS & PRODUCTION WARRANTY CONSOLE */}
        <header className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Automasi Fix Bug AI &amp; Garansi Rilis
                </h1>
                <span className="text-zinc-300">/</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Production</span>
                </span>
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                  Masa Garansi 30 Hari (Rp 0 Bebas Biaya)
                </span>
              </div>

              <p className="text-xs text-zinc-500 max-w-3xl leading-relaxed">
                Sistem pemeliharaan resmi pasca go-live: Bug <strong>Kecil &amp; Menengah</strong> dieksekusi langsung oleh AI secara otomatis. Bug <strong>Besar &amp; Kritis</strong> memicu <em>Safety Guardrail</em> dan wajib ditangani programmer manusia dengan Paket Diagnostik lengkap.
              </p>

              {/* Project Tabs Selector */}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-zinc-400">Proyek Aktif:</span>
                <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        selectedProjectId === proj.id
                          ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-zinc-400 mr-1.5">{proj.code}</span>
                      <span>{proj.name.split('(')[0].trim().slice(0, 26)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Hosting & Control Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 text-xs space-y-1.5 min-w-[260px]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Live URL:</span>
                  <a 
                    href={currentProject?.liveUrl || 'https://demo.app'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-mono text-indigo-600 hover:underline flex items-center gap-1 font-semibold truncate max-w-[160px]"
                  >
                    <span>{currentProject?.liveUrl ? currentProject.liveUrl.replace('https://', '') : 'live-app.com'}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">SLA Garansi Rilis:</span>
                  <span className="font-semibold text-emerald-700">
                    {currentProject?.warrantyDaysLeft || 28} Hari Tersisa (Free SLA)
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200/60">
                  <span className="text-zinc-500">Sentry Webhook:</span>
                  <span className="font-mono text-[10px] text-zinc-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Terhubung (0.03% spike)</span>
                  </span>
                </div>
              </div>

              {/* Kill Switch Toggle */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex sm:flex-col justify-between items-center sm:items-end gap-2">
                <div className="sm:text-right">
                  <div className="text-[11px] font-bold text-zinc-900">Kill Switch AI</div>
                  <div className="text-[10px] text-zinc-500">
                    {currentProject?.killSwitchActive ? 'AI Dinonaktifkan' : 'AI Beroperasi'}
                  </div>
                </div>

                <button
                  onClick={() => currentProject && toggleKillSwitch(currentProject.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    currentProject?.killSwitchActive
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title="Matikan/Hidupkan agen AI secara darurat untuk proyek ini"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{currentProject?.killSwitchActive ? 'Nyalakan AI' : 'Hentikan AI'}</span>
                </button>
              </div>

            </div>
          </div>

          {currentProject?.killSwitchActive && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Perhatian:</strong> Kill Switch sedang aktif untuk <strong>{currentProject.name}</strong>. Semua automasi AI dihentikan dan tiket otomatis dialihkan ke antrean programmer manual.
              </span>
            </div>
          )}
        </header>

        {/* 2. ALUR STANDAR SOFTWARE HOUSE (4-STEP VISUAL BREADCRUMB) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Standar Alur Penanganan Bug Pasca-Rilis
            </h2>
            <span className="text-xs text-zinc-500">Standar Jira Service Management &amp; Software House</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                step: '01',
                title: 'Laporan Masuk (Garansi 30 Hari)',
                desc: 'Tiket masuk dari Sentry exception, WhatsApp klien, atau web helpdesk. SLA garansi Rp 0 aktif.',
                tag: 'Intake Otomatis'
              },
              {
                step: '02',
                title: 'Triage & Eksekusi Terukur',
                desc: 'Bug Kecil & Menengah langsung di-patch oleh AI. Bug Besar dialihkan ke programmer manusia.',
                tag: 'Batas Kewenangan'
              },
              {
                step: '03',
                title: 'Code Review & QA Staging',
                desc: 'Git diff ditinjau Tech Lead, 5/5 regression unit tests dijalankan, dan QA Lead memberi sign-off.',
                tag: 'Verifikasi Staging'
              },
              {
                step: '04',
                title: 'Hotfix Live & 30m Guard',
                desc: 'Deploy ke server live production dengan proteksi Sentry 30 menit dan auto-rollback jika error spike > 2%.',
                tag: 'Live Production'
              }
            ].map((st, i) => (
              <div 
                key={i} 
                className="bg-white border border-zinc-200/80 rounded-xl p-4 space-y-2 relative shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-zinc-400">{st.step}</span>
                  <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                    {st.tag}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 leading-snug">{st.title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. INTELLIGENT ORCHESTRATOR CONSOLE & JSON SIMULATOR (STANDAR JIRA ERP) */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="p-1.5 bg-zinc-900 text-white rounded-lg">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                  Intelligent Orchestrator: Konsol Analisis &amp; Routing Bug AI
                </h2>
                <span className="text-[11px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-full">
                  Format JSON Wajib
                </span>
                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Garansi 30 Hari Aktif
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Modul cerdas penerima laporan bug live production: Menganalisis stacktrace, mengklasifikasi tingkat kesulitan (<strong>LOW</strong> &amp; <strong>MEDIUM</strong> ke AI Agent, <strong>EXPERT</strong> ke Developer Manusia), serta menstrukturkan Conventional Commits GitHub.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyJson}
                disabled={!orchestratorResultState}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                title="Salin hasil JSON Orchestrator"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'JSON Tersalin!' : 'Salin JSON'}</span>
              </button>
              
              <button
                onClick={handleExecuteOrchestratorToErp}
                disabled={!orchestratorResultState || isExecutingOrchestratorPipeline || currentProject?.killSwitchActive}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isExecutingOrchestratorPipeline ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Eksekusi ke Pipeline Jira ERP</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Selector Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pilih Contoh Laporan Bug (Preset Cepat):</span>
              </span>
              <span className="text-[11px] text-zinc-400">Klik chip untuk menguji simulasi secara instan</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {[
                {
                  id: 'user_phone_null',
                  label: 'Contoh User: NullPointerException UserController.java:45',
                  badge: 'LOW (AI Agent)',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  text: 'User mendapati error 500 saat mencoba klik tombol simpan profil jika kolom nomor telepon dikosongkan. Stacktrace: NullPointerException at UserController.java:45'
                },
                {
                  id: 'deadlock_40p01',
                  label: 'Deadlock DB 40P01 Concurrency',
                  badge: 'EXPERT (Manusia)',
                  badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
                  text: 'Sentry Critical Alert: Deadlock 40P01 terdeteksi saat transaksi booking simultan memperebutkan row-level lock pada PostgreSQL table reservation_slots. Stacktrace: PSQLException: ERROR: deadlock detected at BookingService.ts:114'
                },
                {
                  id: 'voucher_rounding',
                  label: 'Rounding Selisih Voucher Promo',
                  badge: 'MEDIUM (AI Agent)',
                  badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                  text: 'Pengguna mendapati selisih pembulatan desimal diskon voucher promo bertingkat. Stacktrace: FloatingPointRoundingWarning at discountService.ts:32'
                },
                {
                  id: 'security_jwt',
                  label: 'Security RBAC Token Vulnerability',
                  badge: 'EXPERT (Manusia)',
                  badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
                  text: 'Sistem mendeteksi celah security vulnerability pada validasi token authorization RBAC di endpoint admin. Stacktrace: SecurityException at AuthMiddleware.java:88'
                },
                {
                  id: 'memory_leak',
                  label: 'Worker Queue Memory Leak',
                  badge: 'EXPERT (Manusia)',
                  badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
                  text: 'Degradasi performa worker background queue mengalami memory leak dan crash OOM setelah 4 jam running. Stacktrace: HeapOutOfMemoryError at QueueWorker.js:201'
                },
                {
                  id: 'typo_css',
                  label: 'Typo Form & CSS Margin Overflow',
                  badge: 'LOW (AI Agent)',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  text: 'Salah penulisan label form "Simpann Prrofil" dan overflow CSS margin pada layar mobile smartphone.'
                }
              ].map((preset) => {
                const isActive = orchestratorInput.trim() === preset.text.trim();
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleRunOrchestrator(preset.text)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                      isActive 
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Textarea & Analyze Action */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-zinc-700">
                Input Laporan Bug (Deskripsi, Error Log &amp; Stack Trace):
              </label>
              <span className="font-mono text-[11px] text-zinc-400">
                {orchestratorInput.length} karakter
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={orchestratorInput}
                onChange={(e) => setOrchestratorInput(e.target.value)}
                placeholder="Masukkan laporan bug dari live production, stacktrace, atau log Sentry..."
                className="w-full bg-zinc-50/60 border border-zinc-200 rounded-xl p-3.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all resize-y"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-zinc-500">
                💡 Mendukung input bebas dari Sentry, Firebase Crashlytics, email klien, maupun tiket bantuan.
              </p>

              <button
                onClick={() => handleRunOrchestrator()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Analisis dengan Intelligent Orchestrator</span>
              </button>
            </div>
          </div>

          {/* DUAL RESULTS PANEL: VISUAL CARDS & RAW VALID JSON TERMINAL */}
          {orchestratorResultState && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              
              {/* LEFT: VISUAL BREAKDOWN (5 cols) */}
              <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  
                  {/* Complexity & Executor Status */}
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Complexity Badge Card */}
                    <div className={`p-3.5 rounded-xl border space-y-1 ${
                      orchestratorResultState.complexity_level === 'EXPERT'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : orchestratorResultState.complexity_level === 'MEDIUM'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                        Tingkat Kesulitan:
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <span>
                          {orchestratorResultState.complexity_level === 'EXPERT' ? '🔴 EXPERT' :
                           orchestratorResultState.complexity_level === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium block opacity-80">
                        {orchestratorResultState.complexity_level === 'EXPERT' 
                          ? 'Arsitektur, DB Deadlock & Security' 
                          : orchestratorResultState.complexity_level === 'MEDIUM'
                            ? 'Logic Edge-Case & Rounding'
                            : 'Typo, Syntax & Minor CSS/HTML'}
                      </span>
                    </div>

                    {/* Assigned To Card */}
                    <div className={`p-3.5 rounded-xl border space-y-1 ${
                      orchestratorResultState.assigned_to === 'Human Developer'
                        ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                        : 'bg-sky-50/70 border-sky-200 text-sky-950'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                        Pelaksana (Assigned To):
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        {orchestratorResultState.assigned_to === 'Human Developer' ? (
                          <>
                            <UserCheck className="w-4 h-4 text-purple-600" />
                            <span>Developer Manusia</span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4 text-sky-600" />
                            <span>AI Agent</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-medium block opacity-80">
                        {orchestratorResultState.assigned_to === 'Human Developer' 
                          ? 'Safety Guardrail Aktif (Lead Dev)'
                          : 'Otomatis di-patch & di-test'}
                      </span>
                    </div>

                  </div>

                  {/* Bug Analysis Card */}
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Analisis Bug (bug_analysis):
                    </span>
                    <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                      {orchestratorResultState.bug_analysis}
                    </p>
                  </div>

                  {/* GitHub Workflow Card */}
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Workflow GitHub (Conventional Commits):
                    </span>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-mono text-[11px] bg-white p-2 rounded-lg border border-zinc-200">
                        <span className="text-zinc-500">Target Branch:</span>
                        <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                          {orchestratorResultState.github_workflow.target_branch}
                        </span>
                      </div>

                      <div className="flex items-center justify-between font-mono text-[11px] bg-white p-2 rounded-lg border border-zinc-200">
                        <span className="text-zinc-500">Feature Branch:</span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 truncate max-w-[200px]">
                          {orchestratorResultState.github_workflow.feature_branch_name}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] text-zinc-500">Commit Message Standar:</span>
                        <div className="p-2 bg-zinc-900 text-zinc-100 rounded-lg font-mono text-[11px] flex items-center justify-between">
                          <code className="text-emerald-300 truncate">
                            {orchestratorResultState.github_workflow.recommended_commit_message}
                          </code>
                          <button
                            onClick={() => handleCopyCommand(orchestratorResultState.github_workflow.recommended_commit_message)}
                            className="p-1 text-zinc-400 hover:text-white shrink-0 ml-2"
                            title="Salin Commit Message"
                          >
                            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Action Step Card */}
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Langkah ERP Selanjutnya (next_action_step):
                    </span>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      {orchestratorResultState.next_action_step}
                    </p>
                  </div>

                </div>

                {/* Bottom Trigger Button */}
                <button
                  onClick={handleExecuteOrchestratorToErp}
                  disabled={isExecutingOrchestratorPipeline || currentProject?.killSwitchActive}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
                >
                  {isExecutingOrchestratorPipeline ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Memproses Tiket di Pipeline Jira...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Eksekusi ke Pipeline Jira &amp; Buka Tiket</span>
                    </>
                  )}
                </button>
              </div>

              {/* RIGHT: RAW VALID JSON TERMINAL (7 cols) */}
              <div className="lg:col-span-7 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden shadow-inner">
                {/* Terminal Header */}
                <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="font-mono text-zinc-400 text-[11px] ml-2 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-cyan-400" />
                      <span>orchestrator_response.json</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                      200 OK • Valid JSON
                    </span>
                    <button
                      onClick={handleCopyJson}
                      className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all flex items-center gap-1"
                    >
                      {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedJson ? 'Tersalin' : 'Salin JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* JSON Body */}
                <div className="p-4 flex-1 overflow-x-auto font-mono text-xs text-zinc-100 leading-relaxed space-y-1">
                  <pre className="text-zinc-200">
                    <span className="text-zinc-500">&#123;</span>
                    {'\n'}  <span className="text-cyan-300">"bug_analysis"</span>: <span className="text-amber-200">"{orchestratorResultState.bug_analysis}"</span>,
                    {'\n'}  <span className="text-cyan-300">"complexity_level"</span>: <span className={
                      orchestratorResultState.complexity_level === 'EXPERT' ? 'text-rose-400 font-bold' :
                      orchestratorResultState.complexity_level === 'MEDIUM' ? 'text-amber-400 font-bold' :
                      'text-emerald-400 font-bold'
                    }>"{orchestratorResultState.complexity_level}"</span>,
                    {'\n'}  <span className="text-cyan-300">"assigned_to"</span>: <span className="text-indigo-300">"{orchestratorResultState.assigned_to}"</span>,
                    {'\n'}  <span className="text-cyan-300">"github_workflow"</span>: <span className="text-zinc-500">&#123;</span>
                    {'\n'}    <span className="text-sky-300">"target_branch"</span>: <span className="text-emerald-300">"{orchestratorResultState.github_workflow.target_branch}"</span>,
                    {'\n'}    <span className="text-sky-300">"feature_branch_name"</span>: <span className="text-emerald-300">"{orchestratorResultState.github_workflow.feature_branch_name}"</span>,
                    {'\n'}    <span className="text-sky-300">"recommended_commit_message"</span>: <span className="text-emerald-300">"{orchestratorResultState.github_workflow.recommended_commit_message}"</span>
                    {'\n'}  <span className="text-zinc-500">&#125;</span>,
                    {'\n'}  <span className="text-cyan-300">"next_action_step"</span>: <span className="text-amber-200">"{orchestratorResultState.next_action_step}"</span>
                    {'\n'}<span className="text-zinc-500">&#125;</span>
                  </pre>
                </div>

                {/* Footer notes */}
                <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Kontrak output ERP: Objek JSON valid tanpa markdown codeblock</span>
                  <span className="font-mono text-zinc-500">RFC 8259 Compliant</span>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* 4. MATRIKS 3 TINGKAT BUG & TOMBOL UJI SIMULASI LANGSUNG */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Matriks Batasan Eksekusi AI vs Programmer Manusia
              </h2>
              <p className="text-xs text-zinc-500">
                Pilih atau uji coba alur penanganan sesuai tingkat keparahan untuk melihat respon sistem secara langsung.
              </p>
            </div>

            {isRunningSim && runningActionText && (
              <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>{runningActionText}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Bug Kecil */}
            <div className="bg-white border border-zinc-200/90 hover:border-emerald-300 rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    🟢 Level 1: Bug Kecil (Low)
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">SLA &lt; 48 Jam</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Typo Label, CSS &amp; Null Guard
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Contoh: Salah eja label input, format mata uang tanpa titik ribuan, atau missing optional chaining (`?.`).
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/70 text-xs space-y-1">
                  <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Eksekusi: 100% Otomatis oleh AI</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    AI langsung membuat branch, menyusun patch minimal, menjalankan 4/4 unit tests, dan membuka PR ke Staging.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleTestCategory('kecil')}
                disabled={isRunningSim || currentProject?.killSwitchActive}
                className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>Uji Simulasi Bug Kecil (Auto-Fix)</span>
              </button>
            </div>

            {/* Card 2: Bug Menengah */}
            <div className="bg-white border border-zinc-200/90 hover:border-amber-300 rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    🟡 Level 2: Bug Menengah (Medium)
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">SLA &lt; 24 Jam</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Logic Edge-Case, Rounding &amp; Retry
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Contoh: Pembulatan desimal diskon voucher promo, kalkulasi denda hari libur, atau retry exponential backoff webhook.
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/70 text-xs space-y-1">
                  <div className="font-semibold text-amber-700 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Eksekusi: AI + Regression Suite</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    AI menyusun patch boundary logic, mengeksekusi 5/5 regression unit tests, dan membuka PR untuk approval Tech Lead.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleTestCategory('menengah')}
                disabled={isRunningSim || currentProject?.killSwitchActive}
                className="w-full py-2 px-3 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-amber-600" />
                <span>Uji Simulasi Bug Menengah (Auto-Fix)</span>
              </button>
            </div>

            {/* Card 3: Bug Besar */}
            <div className="bg-white border border-zinc-200/90 hover:border-rose-300 rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    🔴 Level 3: Bug Besar (Critical)
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">SLA &lt; 4 Jam</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Deadlock DB, Concurrency &amp; Auth
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Contoh: PostgreSQL deadlock 40P01, race condition booking saldo/lapangan, double payment, atau kebocoran otentikasi.
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/70 text-xs space-y-1">
                  <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Safety Guardrail: Wajib Programmer Manusia</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    AI menahan auto-commit. AI menyusun Paket Diagnostik lengkap (RCA &amp; opsi arsitektur), eskalasi ke Lead Developer.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleTestCategory('besar')}
                disabled={isRunningSim || currentProject?.killSwitchActive}
                className="w-full py-2 px-3 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Uji Simulasi Bug Besar (Eskalasi Manusia)</span>
              </button>
            </div>

          </div>
        </section>

        {/* 4. PAPAN ANTREAN TIKET JIRA (KANBAN / TABEL) */}
        <section className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          
          {/* Header Toolbar: Filters, View Toggle, and New Bug Button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" />
                <span>Papan Antrean Tiket Bug ({bugTasks.length} Tiket)</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Klik kartu tiket mana pun untuk membuka laci inspeksi detail, log pengujian, atau tindakan manual developer.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Switcher */}
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/60 text-xs">
                <button
                  onClick={() => setViewMode('pipeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                    viewMode === 'pipeline'
                      ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <KanbanIcon className="w-3.5 h-3.5" />
                  <span>Pipeline Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>Tabel Daftar</span>
                </button>
              </div>

              {/* Create Bug Button */}
              <button
                onClick={() => setShowNewBugModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Lapor Bug Baru</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            {[
              { id: 'all', label: `Semua (${bugTasks.length})` },
              { id: 'kecil', label: `🟢 Bug Kecil (${smallBugs.length})` },
              { id: 'menengah', label: `🟡 Bug Menengah (${mediumBugs.length})` },
              { id: 'besar', label: `🔴 Bug Besar (${largeBugs.length})` },
              { id: 'pr_review', label: `Review PR (${pendingApprovalBugs.length})` },
              { id: 'manual', label: `Wajib Manusia (${manualBugs.length})` },
              { id: 'monitoring', label: `Live Dipantau (${monitoringBugs.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap font-medium ${
                  categoryFilter === tab.id
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* KANBAN PIPELINE VIEW */}
          {viewMode === 'pipeline' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-2">
              {pipelineColumns.map((col) => {
                const colTasks = displayedBugs.filter((t) => col.statuses.includes(t.status));

                return (
                  <div 
                    key={col.id} 
                    className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 flex flex-col min-w-[220px] max-w-full space-y-3"
                  >
                    {/* Header Column */}
                    <div className="pb-2 border-b border-zinc-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                          <span className="font-mono text-[10px] text-zinc-400">{col.stepNum}.</span>
                          <span>{col.title}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">{col.subtitle}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-zinc-700 border border-zinc-200">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Column Tickets */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[580px] pr-0.5">
                      {colTasks.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 text-xs italic">
                          Tidak ada tiket
                        </div>
                      ) : (
                        colTasks.map((task) => {
                          const isSmall = smallBugs.includes(task);
                          const isLarge = largeBugs.includes(task);
                          const isMedium = !isSmall && !isLarge;

                          return (
                            <div
                              key={task.id}
                              onClick={() => setInspectedTask(task)}
                              className="p-3 bg-white border border-zinc-200/90 hover:border-zinc-400 rounded-xl cursor-pointer transition-all hover:shadow-xs space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-[10px]">
                                  {task.key}
                                </span>

                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  isLarge 
                                    ? 'bg-rose-50 text-rose-800 border-rose-200' 
                                    : isMedium
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  {isLarge ? 'Bug Besar' : isMedium ? 'Bug Menengah' : 'Bug Kecil'}
                                </span>
                              </div>

                              <h4 className="font-semibold text-zinc-900 text-xs line-clamp-2 leading-snug">
                                {task.title}
                              </h4>

                              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                                <span>{isLarge ? 'Developer Manusia' : 'Claude AI'}</span>
                                <span className="font-mono text-[10px]">
                                  {isLarge ? '< 4h' : isMedium ? '< 24h' : '< 48h'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE LIST VIEW */
            <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Key</th>
                    <th className="py-2.5 px-3">Judul Bug</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Penanggung Jawab</th>
                    <th className="py-2.5 px-3">SLA Garansi</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {displayedBugs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-400">
                        Tidak ada tiket pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    displayedBugs.map((task) => {
                      const isSmall = smallBugs.includes(task);
                      const isLarge = largeBugs.includes(task);
                      const isMedium = !isSmall && !isLarge;

                      return (
                        <tr 
                          key={task.id} 
                          onClick={() => setInspectedTask(task)}
                          className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-zinc-900">{task.key}</td>
                          <td className="py-3 px-3 font-medium text-zinc-900 max-w-sm truncate">{task.title}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isLarge 
                                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                                : isMedium
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {isLarge ? 'Bug Besar' : isMedium ? 'Bug Menengah' : 'Bug Kecil'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-zinc-700">{task.status}</td>
                          <td className="py-3 px-3 text-zinc-600">{isLarge ? 'Developer Manusia' : 'Claude AI'}</td>
                          <td className="py-3 px-3 font-mono text-zinc-500">{isLarge ? '< 4 Jam' : isMedium ? '< 24 Jam' : '< 48 Jam'}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedTask(task);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg"
                            >
                              Periksa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

        </section>

      </div>

      {/* 5. JIRA-STANDARD TICKET DETAIL MODAL / DRAWER */}
      {inspectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-start justify-between gap-4 bg-zinc-50/70">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                    {inspectedTask.key}
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-zinc-500">Bug Incident</span>
                  <span className="text-zinc-300">·</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask)
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : inspectedTask.difficulty === 'Medium' || mediumBugs.includes(inspectedTask)
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask)
                      ? '🔴 Bug Besar (Wajib Manusia)'
                      : inspectedTask.difficulty === 'Medium' || mediumBugs.includes(inspectedTask)
                        ? '🟡 Bug Menengah (AI Auto-Fix)'
                        : '🟢 Bug Kecil (AI Auto-Fix)'}
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-zinc-500 font-medium">Garansi 30 Hari Aktif</span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 leading-snug">
                  {inspectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setInspectedTask(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Bar */}
            <div className="flex border-b border-zinc-100 bg-white px-5 text-xs font-semibold gap-6 overflow-x-auto">
              <button
                onClick={() => setInspectorTab('overview')}
                className={`py-3 border-b-2 transition-all whitespace-nowrap ${
                  inspectorTab === 'overview'
                    ? 'border-zinc-900 text-zinc-900 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                1. Ikhtisar &amp; Alur Tiket
              </button>

              <button
                onClick={() => setInspectorTab('orchestrator')}
                className={`py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  inspectorTab === 'orchestrator'
                    ? 'border-cyan-600 text-cyan-700 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                <span>2. JSON Orchestrator &amp; Git</span>
              </button>

              <button
                onClick={() => setInspectorTab('solution')}
                className={`py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  inspectorTab === 'solution'
                    ? 'border-indigo-600 text-indigo-700 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask) ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>3. Paket Diagnostik &amp; Form Lead Dev</span>
                  </>
                ) : (
                  <>
                    <GitPullRequest className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3. Pull Request AI &amp; Unit Tests</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setInspectorTab('qa_signoff')}
                className={`py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  inspectorTab === 'qa_signoff'
                    ? 'border-purple-600 text-purple-700 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>4. QA Staging Sign-Off</span>
              </button>

              <button
                onClick={() => setInspectorTab('telemetry')}
                className={`py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  inspectorTab === 'telemetry'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>5. Hotfix Live &amp; Pemantauan 30m</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* TAB 1: OVERVIEW */}
              {inspectorTab === 'overview' && (
                <div className="space-y-5">
                  {/* Rule Banner */}
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                    inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask)
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}>
                    <div className="font-bold flex items-center gap-2">
                      {inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask) ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Ketentuan SOP: Bug Kategori BESAR Wajib Ditangani Programmer Manusia</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Ketentuan SOP: Bug Kategori KECIL/MENENGAH Dieksekusi Otomatis oleh AI</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px]">
                      {inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask)
                        ? 'Demi menjaga integritas database dan transaksi finansial di server live production, AI DILARANG melakukan auto-commit. AI hanya menyusun Paket Diagnostik (RCA, affected files, opsi arsitektur) dan tiket wajib dikerjakan oleh Senior Engineer.'
                        : 'Agen AI menganalisis AST kode, menyusun patch minimal terisolasi, mengeksekusi automated unit tests, dan membuka Pull Request secara langsung.'}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Status Tiket:</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">{inspectedTask.status}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Tingkat Keparahan:</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">{inspectedTask.severity || 'S2 - Major'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Penanggung Jawab:</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask)
                          ? 'Lead Backend (Manusia)'
                          : 'Claude AI Fixer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">SLA Batas Respon:</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">
                        {inspectedTask.difficulty === 'Hard' || largeBugs.includes(inspectedTask) ? '< 4 Jam' : '< 24 Jam'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-zinc-800 block">Deskripsi Galat:</span>
                    <p className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-700 leading-relaxed">
                      {inspectedTask.description}
                    </p>
                  </div>

                  {/* Steps to Reproduce */}
                  {inspectedTask.reproductionSteps && inspectedTask.reproductionSteps.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-zinc-800 block">Langkah Reproduksi Masalah:</span>
                      <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1 text-zinc-700">
                        {inspectedTask.reproductionSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="font-mono text-zinc-400 font-bold shrink-0">{idx + 1}.</span>
                            <span>{step.replace(/^[0-9]+\.\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {['Baru', 'Dianalisis'].includes(inspectedTask.status) && (
                    <div className="pt-2">
                      <button
                        onClick={async () => {
                          setIsRunningSim(true);
                          await runAiFixer(inspectedTask.id);
                          setIsRunningSim(false);
                          const updated = tasks.find((t) => t.id === inspectedTask.id);
                          if (updated) {
                            setInspectedTask(updated);
                            setInspectorTab('solution');
                          }
                        }}
                        disabled={isRunningSim || currentProject?.killSwitchActive}
                        className="w-full py-2.5 px-4 rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        {isRunningSim ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        <span>Jalankan Triage AI Sekarang (SOP Garansi 30 Hari)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INTELLIGENT ORCHESTRATOR JSON & GITHUB WORKFLOW */}
              {inspectorTab === 'orchestrator' && (() => {
                const orchResult = inspectedTask.orchestratorResult || runIntelligentOrchestrator(
                  `${inspectedTask.title}\n${inspectedTask.description}`,
                  { taskKey: inspectedTask.key, projectId: inspectedTask.projectId }
                );

                return (
                  <div className="space-y-5">
                    {/* Header banner */}
                    <div className="p-4 bg-zinc-900 text-white rounded-xl flex items-center justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-sm">Output Intelligent Orchestrator ERP</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Valid JSON RFC 8259
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Klasifikasi otomatis tingkat kesulitan, penentuan pelaksana (AI Agent vs Developer), dan kontrak GitHub Conventional Commits.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(orchResult, null, 2));
                          addToast('success', 'JSON Disalin!', 'Objek JSON telah disalin ke clipboard.');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all flex items-center gap-1.5 border border-zinc-700 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin JSON</span>
                      </button>
                    </div>

                    {/* Metadata & Classification Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        orchResult.complexity_level === 'EXPERT'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : orchResult.complexity_level === 'MEDIUM'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                          Tingkat Kesulitan (complexity_level):
                        </span>
                        <div className="font-bold text-sm">
                          {orchResult.complexity_level === 'EXPERT' ? '🔴 EXPERT' :
                           orchResult.complexity_level === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                        </div>
                        <span className="text-[10px] block opacity-80">
                          {orchResult.complexity_level === 'EXPERT' ? 'Arsitektur, Deadlock, Auth & Security' :
                           orchResult.complexity_level === 'MEDIUM' ? 'Edge-case, Rounding & Retry' : 'Typo, Syntax, Form Null Check'}
                        </span>
                      </div>

                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        orchResult.assigned_to === 'Human Developer'
                          ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                          : 'bg-sky-50/70 border-sky-200 text-sky-950'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                          Pelaksana (assigned_to):
                        </span>
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          {orchResult.assigned_to === 'Human Developer' ? (
                            <>
                              <UserCheck className="w-4 h-4 text-purple-600" />
                              <span>Human Developer</span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-4 h-4 text-sky-600" />
                              <span>AI Agent</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] block opacity-80">
                          {orchResult.assigned_to === 'Human Developer' ? 'Safety Guardrail Aktif (Wajib Manusia)' : 'Eksekusi Otomatis'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Target Branch:
                        </span>
                        <div className="font-mono font-bold text-xs text-zinc-900 bg-white p-1 rounded border border-zinc-200 inline-block">
                          {orchResult.github_workflow.target_branch}
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Origin branch live production
                        </span>
                      </div>
                    </div>

                    {/* GitHub Workflow & Conventional Commits Box */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                      <span className="font-bold text-zinc-800 block text-xs">
                        Rencana Branch &amp; Conventional Commit GitHub:
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[11px] text-zinc-500">Nama Feature Branch (feature_branch_name):</span>
                          <div className="p-2.5 bg-white border border-zinc-200 rounded-lg font-mono text-[11px] text-indigo-700 font-semibold flex items-center justify-between">
                            <span className="truncate">{orchResult.github_workflow.feature_branch_name}</span>
                            <button
                              onClick={() => handleCopyCommand(orchResult.github_workflow.feature_branch_name)}
                              className="p-1 text-zinc-400 hover:text-zinc-700"
                              title="Salin Branch"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] text-zinc-500">Pesan Komit Standar (recommended_commit_message):</span>
                          <div className="p-2.5 bg-white border border-zinc-200 rounded-lg font-mono text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
                            <span className="truncate">{orchResult.github_workflow.recommended_commit_message}</span>
                            <button
                              onClick={() => handleCopyCommand(orchResult.github_workflow.recommended_commit_message)}
                              className="p-1 text-zinc-400 hover:text-zinc-700"
                              title="Salin Commit Message"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-[11px] space-y-1">
                        <div className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Perintah Git Shell:</div>
                        <div className="text-cyan-300">git checkout -b {orchResult.github_workflow.feature_branch_name} origin/{orchResult.github_workflow.target_branch}</div>
                        <div className="text-emerald-300">git commit -m "{orchResult.github_workflow.recommended_commit_message}"</div>
                      </div>
                    </div>

                    {/* Next Action Step */}
                    <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                      <span className="font-bold text-zinc-800 block text-xs">
                        Langkah Konkret ERP Selanjutnya (next_action_step):
                      </span>
                      <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                        {orchResult.next_action_step}
                      </p>
                    </div>

                    {/* Syntax-Highlighted JSON Viewer */}
                    <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 font-mono text-xs shadow-inner">
                      <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px] flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
                          <Code className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Objek JSON Standar ERP Orchestrator (Tanpa Markdown Codeblock)</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">Format JSON Wajib Valid</span>
                      </div>
                      <div className="p-4 max-h-72 overflow-y-auto">
                        <pre className="text-zinc-200 text-xs">
                          <span className="text-zinc-500">&#123;</span>
                          {'\n'}  <span className="text-cyan-300">"bug_analysis"</span>: <span className="text-amber-200">"{orchResult.bug_analysis}"</span>,
                          {'\n'}  <span className="text-cyan-300">"complexity_level"</span>: <span className={
                            orchResult.complexity_level === 'EXPERT' ? 'text-rose-400 font-bold' :
                            orchResult.complexity_level === 'MEDIUM' ? 'text-amber-400 font-bold' :
                            'text-emerald-400 font-bold'
                          }>"{orchResult.complexity_level}"</span>,
                          {'\n'}  <span className="text-cyan-300">"assigned_to"</span>: <span className="text-indigo-300">"{orchResult.assigned_to}"</span>,
                          {'\n'}  <span className="text-cyan-300">"github_workflow"</span>: <span className="text-zinc-500">&#123;</span>
                          {'\n'}    <span className="text-sky-300">"target_branch"</span>: <span className="text-emerald-300">"{orchResult.github_workflow.target_branch}"</span>,
                          {'\n'}    <span className="text-sky-300">"feature_branch_name"</span>: <span className="text-emerald-300">"{orchResult.github_workflow.feature_branch_name}"</span>,
                          {'\n'}    <span className="text-sky-300">"recommended_commit_message"</span>: <span className="text-emerald-300">"{orchResult.github_workflow.recommended_commit_message}"</span>
                          {'\n'}  <span className="text-zinc-500">&#125;</span>,
                          {'\n'}  <span className="text-cyan-300">"next_action_step"</span>: <span className="text-amber-200">"{orchResult.next_action_step}"</span>
                          {'\n'}<span className="text-zinc-500">&#125;</span>
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: TECHNICAL SOLUTION (DIAGNOSTIC PACKAGE OR AI PR DIFF) */}
              {inspectorTab === 'solution' && (
                <div className="space-y-5">
                  {/* BIG BUG: DIAGNOSTIC DOSSIER & HUMAN DEVELOPER FORM */}
                  {(inspectedTask.difficulty === 'Hard' || inspectedTask.diagnosticPackage || largeBugs.includes(inspectedTask)) ? (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-900 font-medium">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Paket Diagnostik yang Disusun Agen AI untuk Lead Developer:</span>
                      </div>

                      {inspectedTask.diagnosticPackage ? (
                        <>
                          {/* Summary */}
                          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                            <span className="font-bold text-zinc-800 block">Ringkasan Analisis Teknis AI:</span>
                            <p className="text-zinc-700 leading-relaxed">{inspectedTask.diagnosticPackage.summary}</p>
                          </div>

                          {/* Affected Files */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-zinc-800 block">File &amp; Baris Kode Terdampak:</span>
                            <div className="space-y-1">
                              {inspectedTask.diagnosticPackage.affectedFiles.map((f, idx) => (
                                <div key={idx} className="p-2.5 bg-zinc-100 rounded-lg border border-zinc-200 font-mono text-[11px] flex items-center justify-between">
                                  <span className="text-zinc-900 font-semibold">{f.path}</span>
                                  <span className="text-rose-700 font-bold">{f.lineRange}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Sentry Breadcrumbs */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-zinc-800 block">Log Sentry Breadcrumbs:</span>
                            <div className="p-3.5 bg-zinc-900 text-zinc-200 rounded-xl font-mono text-[11px] space-y-1">
                              {inspectedTask.diagnosticPackage.sentryBreadcrumbs.map((b, idx) => (
                                <div key={idx} className="text-emerald-400">
                                  {b}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Suggested Architectural Mitigations */}
                          <div className="space-y-2">
                            <span className="font-bold text-zinc-800 block">Opsi Solusi Arsitektur yang Direkomendasikan:</span>
                            <div className="space-y-2">
                              {inspectedTask.diagnosticPackage.suggestedFixes.map((sol, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => setSelectedMitigation(sol.option)}
                                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                    selectedMitigation === sol.option
                                      ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300'
                                      : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                                  }`}
                                >
                                  <div className="font-bold text-zinc-900 flex items-center justify-between">
                                    <span>Opsi {idx + 1}: {sol.option}</span>
                                    {selectedMitigation === sol.option && (
                                      <span className="text-indigo-600 font-bold text-xs flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Dipilih</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-zinc-600 mt-1">
                                    <strong>Pertimbangan Trade-off:</strong> {sol.tradeOff}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Git Command */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-zinc-800 block">Branch Investigasi Developer:</span>
                            <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs flex items-center justify-between">
                              <code>{inspectedTask.diagnosticPackage.commandSnippet}</code>
                              <button
                                onClick={() => handleCopyCommand(inspectedTask.diagnosticPackage?.commandSnippet || '')}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                                title="Salin Perintah Git"
                              >
                                {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Human Intervention Form */}
                          <div className="p-4 bg-zinc-100 rounded-xl border border-zinc-300 space-y-3">
                            <div className="font-bold text-zinc-900 flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-indigo-600" />
                              <span>Formulir Penyelesaian oleh Programmer Manusia (Lead Developer):</span>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-zinc-700 block">
                                Catatan Penyelesaian / Commit Hash:
                              </label>
                              <input 
                                type="text"
                                placeholder="Contoh: Fix deadlock via deterministic lock ordering & redlock timeout (commit 98f12a)"
                                value={humanDevNotes}
                                onChange={(e) => setHumanDevNotes(e.target.value)}
                                className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={advanceDirectlyToQa}
                                  onChange={(e) => setAdvanceDirectlyToQa(e.target.checked)}
                                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                />
                                <span>Otomatis majukan ke antrean Staging untuk QA Lead Sign-Off</span>
                              </label>

                              <button
                                onClick={handleSubmitHumanIntervention}
                                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Simpan Perbaikan Manual &amp; Lanjut</span>
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-8 text-center text-zinc-400">
                          Paket diagnostik belum tersedia. Jalankan AI Triage terlebih dahulu.
                        </div>
                      )}
                    </div>
                  ) : (
                    /* SMALL & MEDIUM BUG: AI AUTO-FIX PULL REQUEST & DIFF */
                    <div className="space-y-4">
                      {/* PR Banner */}
                      <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 font-bold text-indigo-950">
                          <GitPullRequest className="w-4 h-4 text-indigo-600" />
                          <span>{inspectedTask.prNumber || 'PR Otomatis AI'}</span>
                          <span className="text-zinc-400 font-normal">pada branch</span>
                          <code className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-900 text-[11px]">
                            {inspectedTask.branchName || 'ai/fix-branch'}
                          </code>
                        </div>

                        {inspectedTask.testResult && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>CI Tests: {inspectedTask.testResult.passedCount}/{inspectedTask.testResult.total} Lolos ({inspectedTask.testResult.durationMs}ms)</span>
                          </span>
                        )}
                      </div>

                      {/* Diff Viewer */}
                      {inspectedTask.prDiff ? (
                        <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 font-mono text-xs">
                          <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px] flex justify-between">
                            <span>Patch Unified Git Diff yang Disusun AI</span>
                            <span>Auto-Generated AST Patch</span>
                          </div>
                          <div className="p-4 max-h-64 overflow-y-auto space-y-0.5">
                            {inspectedTask.prDiff.split('\n').map((line, idx) => {
                              const isAdd = line.startsWith('+');
                              const isDel = line.startsWith('-');
                              const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
                              return (
                                <div 
                                  key={idx}
                                  className={`px-2 py-0.5 rounded ${
                                    isAdd ? 'text-emerald-300 bg-emerald-950/40' :
                                    isDel ? 'text-rose-300 bg-rose-950/40' :
                                    isHeader ? 'text-sky-400 font-bold' : 'text-zinc-400'
                                  }`}
                                >
                                  {line}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-zinc-400">
                          Belum ada patch diff yang dibuat. Jalankan AI Triage terlebih dahulu.
                        </div>
                      )}

                      {/* Automated Test Logs */}
                      {inspectedTask.testResult && (
                        <div className="space-y-1.5">
                          <span className="font-bold text-zinc-800 block">Hasil Automated Test Runner:</span>
                          <div className="p-3.5 bg-zinc-900 text-zinc-300 rounded-xl font-mono text-[11px] space-y-1">
                            {inspectedTask.testResult.logs.map((log, idx) => (
                              <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : 'text-zinc-400'}>
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Review Buttons */}
                      {inspectedTask.status === 'Menunggu Persetujuan' && (
                        <div className="pt-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              requestAiRevision(inspectedTask.id, 'Optimasi boundary check dan pastikan fallback value terdefinisi');
                            }}
                            className="px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
                          >
                            Minta Revisi Patch ke AI
                          </button>

                          <button
                            onClick={() => {
                              approveAiPr(inspectedTask.id);
                              deployToStaging(inspectedTask.id);
                              setInspectedTask({ ...inspectedTask, status: 'Deploy Staging' });
                              setInspectorTab('qa_signoff');
                            }}
                            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui PR &amp; Deploy ke Staging</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: QA STAGING SIGN-OFF */}
              {inspectorTab === 'qa_signoff' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-purple-950">
                    <div className="font-bold flex items-center gap-1.5 text-purple-900">
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                      <span>Verifikasi Lingkungan Staging &amp; QA Sign-Off Resmi</span>
                    </div>
                    <p className="text-[11px] text-purple-900/80 leading-relaxed">
                      SOP Software House: Sebelum kode dirilis ke live production, QA Lead wajib memvalidasi reproduksi di server Staging dan menandatangani berita acara pengujian.
                    </p>
                  </div>

                  {/* Staging URL */}
                  <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-zinc-400" />
                      <span className="font-medium text-zinc-700">URL Server Staging:</span>
                      <a 
                        href={currentProject?.stagingUrl || 'https://staging.app'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-mono text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{currentProject?.stagingUrl || 'https://staging-app.agensi.dev'}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Staging Ready
                    </span>
                  </div>

                  {/* QA Sign-off Display */}
                  {inspectedTask.qaSignOff ? (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span>QA Sign-Off Resmi Diberikan: LULUS (Passed)</span>
                        <span className="text-[10px] font-mono text-emerald-700">
                          {new Date(inspectedTask.qaSignOff.testedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        <strong>Tester Bertanggung Jawab:</strong> {inspectedTask.qaSignOff.testerName}
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        <strong>Catatan Pengujian:</strong> {inspectedTask.qaSignOff.notes}
                      </p>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            if (inspectedTask.difficulty === 'Hard') {
                              setShowDoubleConfirmDeploy(inspectedTask);
                            } else {
                              deployToProduction(inspectedTask.id);
                              setInspectedTask({ ...inspectedTask, status: 'Deploy Production' });
                              setInspectorTab('telemetry');
                            }
                          }}
                          className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Lanjut Deploy Hotfix ke Live Production</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* QA Sign-Off Form */
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                      <span className="font-bold text-zinc-800 block">Formulir QA Sign-Off Parhan (QA Lead):</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block">Test Cases Lolos:</label>
                          <input 
                            type="number"
                            value={qaPassedCases}
                            onChange={(e) => setQaPassedCases(Number(e.target.value))}
                            className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs font-mono mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase block">Total Test Cases:</label>
                          <input 
                            type="number"
                            value={qaTotalCases}
                            onChange={(e) => setQaTotalCases(Number(e.target.value))}
                            className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs font-mono mt-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Catatan Verifikasi QA:</label>
                        <textarea
                          rows={2}
                          placeholder="Masukkan hasil pengujian fungsional dan verifikasi edge-case di staging..."
                          value={qaNotes}
                          onChange={(e) => setQaNotes(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleQaSignOffSubmit}
                          className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Berikan QA Sign-Off Formal (Passed)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TELEMETRY & 30-MIN SENTRY GUARD */}
              {inspectorTab === 'telemetry' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">SLA Response Limit:</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {inspectedTask.priority === 'Hotfix' ? '< 4 Jam (Blocker)' : '< 24 Jam (Major)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Garansi 30 Hari:</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block">Aktif (Rp 0 Bebas Biaya)</span>
                    </div>
                  </div>

                  {/* 30-Minute Sentry Monitoring Window */}
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between font-bold text-zinc-800">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span>Jendela Pemantauan Sentry 30 Menit Pasca-Deploy:</span>
                      </span>
                      <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        Error Spike: 0.03% (Stabil &lt; 2%)
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      Sistem telemetri mengawasi server live production secara terus-menerus. Jika terjadi lonjakan galat melebihi ambang batas 2.0%, fitur <strong>Auto-Rollback</strong> akan secara instan mengembalikan codebase ke commit rilis stabil sebelumnya dan membunyikan alarm darurat.
                    </p>

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => {
                          triggerRollback(inspectedTask.id, 'Simulasi lonjakan error spike 3.4% > 2% di live production');
                          setInspectedTask({ ...inspectedTask, status: 'Perlu Manual', priority: 'Hotfix' });
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Simulasi Error Spike &gt; 2% &amp; Auto-Rollback</span>
                      </button>

                      {inspectedTask.status !== 'Selesai' && (
                        <button
                          onClick={() => {
                            updateTaskStatus(inspectedTask.id, 'Selesai', 'Patch live production stabil selama 30 menit. Tiket ditutup.');
                            setInspectedTask({ ...inspectedTask, status: 'Selesai' });
                          }}
                          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tutup Tiket (Selesai &amp; Stabil)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                SOP Software House: Bug Kecil/Menengah dieksekusi AI, Bug Besar wajib programmer manusia.
              </span>
              <button
                onClick={() => setInspectedTask(null)}
                className="px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL: LAPOR BUG LIVE BARU (GARANSI 30 HARI) */}
      {showNewBugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Lapor Bug Live Production (Garansi 30 Hari)
                </h3>
              </div>
              <button
                onClick={() => setShowNewBugModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Judul Ringkasan Bug:</label>
                <input 
                  type="text"
                  placeholder="Contoh: Typo label form atau Deadlock saat checkout simultan..."
                  value={newBugTitle}
                  onChange={(e) => setNewBugTitle(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Kategori Tingkat SOP:</label>
                  <select
                    value={newBugCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setNewBugCategory(cat);
                      if (cat === 'besar') setNewBugSeverity('S1 - Critical (Blocker)');
                      else if (cat === 'menengah') setNewBugSeverity('S2 - Major');
                      else setNewBugSeverity('S3 - Minor');
                    }}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                  >
                    <option value="kecil">🟢 Bug Kecil (Auto-Fix AI)</option>
                    <option value="menengah">🟡 Bug Menengah (AI + Regression)</option>
                    <option value="besar">🔴 Bug Besar (Wajib Manusia)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Keparahan / Severity:</label>
                  <select
                    value={newBugSeverity}
                    onChange={(e) => setNewBugSeverity(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                  >
                    <option value="S1 - Critical (Blocker)">S1 - Critical (Blocker)</option>
                    <option value="S2 - Major">S2 - Major</option>
                    <option value="S3 - Minor">S3 - Minor</option>
                    <option value="S4 - Trivial">S4 - Trivial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Kanal Asal Laporan:</label>
                <select
                  value={newBugSource}
                  onChange={(e) => setNewBugSource(e.target.value as any)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="Sentry">Sentry Webhook (Exception Monitoring)</option>
                  <option value="WhatsApp">WhatsApp Helpdesk Klien</option>
                  <option value="Web Form">Portal Bantuan Pengguna</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Detail Deskripsi Masalah:</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan kronologi kemunculan galat di server live..."
                  value={newBugDesc}
                  onChange={(e) => setNewBugDesc(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] text-indigo-900">
                <strong>Kebijakan Garansi 30 Hari:</strong> Perbaikan bug ini sepenuhnya <strong>bebas biaya (Rp 0)</strong> di bawah SLA garansi software house pasca rilis.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setShowNewBugModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleCreateCustomBug}
                disabled={!newBugTitle.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-50"
              >
                Kirim &amp; Jalankan AI Triage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: DOUBLE CONFIRMATION UNTUK DEPLOY BUG BESAR */}
      {showDoubleConfirmDeploy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Konfirmasi Ganda (Double Sign-Off)
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Rilis Hotfix Bug Besar ke Server Live Production
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed">
              Tiket <strong>{showDoubleConfirmDeploy.key}</strong> ({showDoubleConfirmDeploy.title}) tergolong sebagai <strong>Bug Besar (Critical)</strong>. Anda akan melakukan rilis hotfix ke server live production <strong>{currentProject?.liveUrl}</strong>.
            </p>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs space-y-1">
              <div>✓ Paket Diagnostik telah ditinjau engineer manusia</div>
              <div>✓ QA Sign-Off Staging telah lulus</div>
              <div>✓ Jendela pemantauan Sentry 30 menit akan otomatis diaktifkan</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDoubleConfirmDeploy(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirmDeployProduction(showDoubleConfirmDeploy)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all"
              >
                Ya, Konfirmasi Deploy Production
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
