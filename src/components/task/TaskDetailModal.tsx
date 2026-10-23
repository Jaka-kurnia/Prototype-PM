import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, TaskPriority, BugSeverity, BugEnvironment, WarrantyStatus, QASignOff } from '../../types';
import { 
  X, 
  Bot,
  Bug, 
  Sparkles, 
  CheckSquare, 
  GitPullRequest, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Clock, 
  User, 
  Tag, 
  Calendar, 
  FileCode, 
  RefreshCw, 
  Send, 
  Lock, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  ExternalLink,
  Flame,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Layers,
  History,
  MessageSquare,
  FileText,
  GitBranch,
  ShieldAlert,
  ChevronUp,
  Share2,
  SlidersHorizontal,
  Award,
  CheckCircle,
  FileSearch,
  Code,
  ListOrdered,
  Wrench,
  AlertOctagon,
  HelpCircle,
  Zap
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task: initialTask, onClose }) => {
  const { 
    tasks, 
    updateTask, 
    updateTaskStatus, 
    deleteTask, 
    teamMembers, 
    comments, 
    events, 
    epics,
    sprints,
    addComment, 
    toggleSubtask, 
    addSubtask,
    runAiFixer,
    approveAiPr,
    rejectAiPr,
    requestAiRevision,
    chooseManualFix,
    deployToStaging,
    deployToProduction,
    triggerRollback,
    triageBug,
    qaSignOff,
    reopenBug,
    recordBugRca,
    addToast,
    role
  } = useApp();

  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isDiffExpanded, setIsDiffExpanded] = useState(true);
  
  // Modals for Review actions
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showDoubleConfirmModal, setShowDoubleConfirmModal] = useState(false);
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);

  // Software House Standard Bug Tracking Modals & States
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageSeverity, setTriageSeverity] = useState<BugSeverity>('S2 - Major');
  const [triageEnv, setTriageEnv] = useState<BugEnvironment>('Production');
  const [triageWarranty, setTriageWarranty] = useState<WarrantyStatus>('Garansi Proyek (Gratis)');
  const [triageAssignee, setTriageAssignee] = useState<string>('');

  const [showQaModal, setShowQaModal] = useState(false);
  const [qaIsPass, setQaIsPass] = useState(true);
  const [qaNotes, setQaNotes] = useState('');
  const [qaCasesCount, setQaCasesCount] = useState(6);
  const [qaPassedCount, setQaPassedCount] = useState(6);
  const [qaReopenReason, setQaReopenReason] = useState('');

  const [showRcaModal, setShowRcaModal] = useState(false);
  const [rcaInput, setRcaInput] = useState('');
  const [preventiveInput, setPreventiveInput] = useState('');

  const [fixingTrack, setFixingTrack] = useState<'team_dev' | 'ai_agent'>('team_dev');
  const [showManualPrModal, setShowManualPrModal] = useState(false);
  const [manualPrTitle, setManualPrTitle] = useState('');
  const [manualPrDiff, setManualPrDiff] = useState('');

  if (!initialTask) return null;

  // Always get freshest task instance from state
  const currentTask = tasks.find((t) => t.id === initialTask.id) || initialTask;
  const taskComments = comments.filter((c) => c.taskId === currentTask.id);
  const taskEvents = events.filter((e) => e.taskId === currentTask.id);

  const assignee = teamMembers.find((m) => m.id === currentTask.assigneeId);
  const reporter = teamMembers.find((m) => m.id === currentTask.reporterId);
  const epic = epics.find((e) => e.id === currentTask.epicId);
  const sprint = sprints.find((s) => s.id === currentTask.sprintId);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskStatus(currentTask.id, newStatus);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentTask.key);
    setCopiedKey(true);
    addToast('info', 'Tersalin!', `Kode ${currentTask.key} disalin ke clipboard.`);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    addToast('info', 'Perintah Tersalin!', cmd);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(currentTask.id, commentText.trim(), isInternalComment);
    setCommentText('');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(currentTask.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleTriggerAiFix = async () => {
    setIsSimulatingAgent(true);
    await runAiFixer(currentTask.id);
    setIsSimulatingAgent(false);
  };

  const handleApprovePr = () => {
    approveAiPr(currentTask.id);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    rejectAiPr(currentTask.id, rejectReason.trim());
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleConfirmRevision = () => {
    if (!revisionNotes.trim()) return;
    requestAiRevision(currentTask.id, revisionNotes.trim());
    setShowRevisionModal(false);
    setRevisionNotes('');
  };

  const handleProdDeployClick = () => {
    if (currentTask.difficulty === 'Hard') {
      setShowDoubleConfirmModal(true);
    } else {
      deployToProduction(currentTask.id, true);
    }
  };

  const handleDoubleConfirmProd = () => {
    deployToProduction(currentTask.id, true);
    setShowDoubleConfirmModal(false);
  };

  const handleOpenTriage = () => {
    setTriageSeverity(currentTask.severity || 'S2 - Major');
    setTriageEnv(currentTask.environment || 'Production');
    setTriageWarranty(currentTask.warrantyStatus || 'Garansi Proyek (Gratis)');
    setTriageAssignee(currentTask.assigneeId || teamMembers[1]?.id || '');
    setShowTriageModal(true);
  };

  const handleConfirmTriage = () => {
    triageBug(currentTask.id, {
      severity: triageSeverity,
      environment: triageEnv,
      warrantyStatus: triageWarranty,
      assigneeId: triageAssignee,
      slaDeadline: triageSeverity === 'S1 - Critical (Blocker)'
        ? new Date(Date.now() + 4 * 3600000).toISOString()
        : triageSeverity === 'S2 - Major'
        ? new Date(Date.now() + 24 * 3600000).toISOString()
        : new Date(Date.now() + 72 * 3600000).toISOString()
    });
    setShowTriageModal(false);
  };

  const handleOpenQa = (isPass: boolean) => {
    setQaIsPass(isPass);
    setQaNotes(isPass 
      ? 'Verifikasi Staging berhasil. Seluruh alur reproduksi bug telah tervalidasi dan regression test lolos.' 
      : 'Ditemukan regresi saat uji coba: response belum konsisten pada skenario edge-case.');
    setQaCasesCount(6);
    setQaPassedCount(isPass ? 6 : 4);
    setQaReopenReason(isPass ? '' : 'Regresi terdeteksi pada skenario uji reproduksi.');
    setShowQaModal(true);
  };

  const handleConfirmQa = () => {
    qaSignOff(currentTask.id, {
      passed: qaIsPass,
      notes: qaNotes.trim(),
      testCasesCount: Number(qaCasesCount),
      passedCasesCount: qaIsPass ? Number(qaCasesCount) : Number(qaPassedCount),
      reopenReason: qaIsPass ? undefined : qaReopenReason.trim()
    });
    setShowQaModal(false);
  };

  const handleOpenRca = () => {
    setRcaInput(currentTask.rootCauseAnalysis || '');
    setPreventiveInput(currentTask.preventiveMeasures || '');
    setShowRcaModal(true);
  };

  const handleConfirmRca = () => {
    recordBugRca(currentTask.id, rcaInput.trim(), preventiveInput.trim());
    setShowRcaModal(false);
  };

  const handleOpenManualPr = () => {
    setManualPrTitle(`fix(${currentTask.key.toLowerCase()}): perbaikan oleh ${assignee?.name || 'developer'}`);
    setManualPrDiff(
      currentTask.prDiff ||
`--- a/src/modules/coreService.ts
+++ b/src/modules/coreService.ts
@@ -10,6 +10,10 @@
+  // Manual bugfix patch applied by ${assignee?.name || 'Lead Engineer'}
+  if (param === null || param === undefined) {
+    throw new ValidationError("Parameter wajib diisi");
+  }
`
    );
    setShowManualPrModal(true);
  };

  const handleConfirmManualPr = () => {
    if (!manualPrTitle.trim()) return;
    const branch = currentTask.branchName || `fix/${currentTask.key.toLowerCase()}-hotfix`;
    const prNum = currentTask.prNumber || `PR #${Math.floor(Math.random() * 80) + 20}`;
    updateTask(currentTask.id, {
      status: 'Menunggu Persetujuan',
      prNumber: prNum,
      branchName: branch,
      prDiff: manualPrDiff.trim(),
      testResult: {
        passed: true,
        total: 6,
        passedCount: 6,
        failedCount: 0,
        durationMs: 480,
        logs: [
          'PASS test/unit/manualPatch.test.ts',
          '✓ reproduces original bug failure and asserts fixed state (38ms)',
          '✓ smoke test on adjacent modules passes without side-effect (65ms)',
          '✓ lint and typecheck clean (0 errors)'
        ]
      }
    });
    setShowManualPrModal(false);
    addToast('success', 'Pull Request Manual Dibuat', `${prNum} siap direview Tech Lead.`);
  };

  const completedSubtasksCount = currentTask.subtasks.filter((s) => s.completed).length;
  const progressPercent = currentTask.subtasks.length > 0 
    ? Math.round((completedSubtasksCount / currentTask.subtasks.length) * 100) 
    : 0;

  // 6-Phase Lifecycle Definition for Software House Workflow
  const lifecyclePhases = [
    {
      step: 1,
      targetStatus: 'Baru' as TaskStatus,
      label: currentTask.type === 'Bug' ? '1. Laporan Masuk' : '1. Backlog & Spec',
      subtitle: 'Inbound / Backlog',
      active: ['Baru', 'Backlog'].includes(currentTask.status),
      done: !['Baru', 'Backlog'].includes(currentTask.status)
    },
    {
      step: 2,
      targetStatus: 'Dianalisis' as TaskStatus,
      label: currentTask.type === 'Bug' ? '2. Triage & SLA' : '2. Scope & Arsitektur',
      subtitle: 'Analisis Teknis',
      active: ['Dianalisis', 'To Do'].includes(currentTask.status),
      done: !['Baru', 'Backlog', 'Dianalisis', 'To Do'].includes(currentTask.status)
    },
    {
      step: 3,
      targetStatus: 'In Progress' as TaskStatus,
      label: currentTask.type === 'Bug' ? '3. Pengerjaan Fix' : '3. Coding Sprint',
      subtitle: 'Development',
      active: ['In Progress', 'Perlu Manual', 'Diperbaiki Agen'].includes(currentTask.status),
      done: ['Menunggu Persetujuan', 'Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status)
    },
    {
      step: 4,
      targetStatus: 'Menunggu Persetujuan' as TaskStatus,
      label: '4. Code Review PR',
      subtitle: 'Review & CI/CD',
      active: ['Menunggu Persetujuan', 'In Review'].includes(currentTask.status),
      done: ['Disetujui', 'QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status)
    },
    {
      step: 5,
      targetStatus: 'QA/Testing' as TaskStatus,
      label: currentTask.type === 'Bug' ? '5. QA Staging Test' : '5. QA & Staging UAT',
      subtitle: 'Verifikasi Staging',
      active: ['QA/Testing', 'Deploy Staging', 'Disetujui'].includes(currentTask.status),
      done: ['Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status)
    },
    {
      step: 6,
      targetStatus: 'Selesai' as TaskStatus,
      label: currentTask.type === 'Bug' ? '6. Rilis & Garansi' : '6. Production Live',
      subtitle: 'Live Production',
      active: ['Deploy Production', 'Dipantau', 'Selesai'].includes(currentTask.status),
      done: currentTask.status === 'Selesai'
    }
  ];

  const currentPhaseIndex = lifecyclePhases.findIndex((p) => p.active);
  const nextPhase = currentPhaseIndex >= 0 && currentPhaseIndex < lifecyclePhases.length - 1 
    ? lifecyclePhases[currentPhaseIndex + 1] 
    : null;
  const prevPhase = currentPhaseIndex > 0 
    ? lifecyclePhases[currentPhaseIndex - 1] 
    : null;

  const handleMoveToPhase = (targetStatus: TaskStatus, phaseLabel: string) => {
    if (targetStatus === currentTask.status) return;
    updateTaskStatus(
      currentTask.id,
      targetStatus,
      `Dipindahkan ke tahapan: ${phaseLabel}`
    );
    addToast('success', 'Fase Berpindah!', `Tugas berhasil dipindahkan ke: ${phaseLabel}`);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const targetSubtask = currentTask.subtasks.find((s) => s.id === subtaskId);
    if (!targetSubtask) return;

    const willBeCompleted = !targetSubtask.completed;
    const updatedSubtasks = currentTask.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: willBeCompleted } : s
    );
    const newCompletedCount = updatedSubtasks.filter((s) => s.completed).length;
    const totalCount = updatedSubtasks.length;
    const isNowAllDone = totalCount > 0 && newCompletedCount === totalCount;

    // Toggle subtask in context
    toggleSubtask(currentTask.id, subtaskId);

    // Auto-advance logic:
    // 1. If checking first subtask while in 'Baru' or 'Backlog' or 'To Do' -> auto advance to 'In Progress'
    if (willBeCompleted && ['Baru', 'Backlog', 'To Do'].includes(currentTask.status)) {
      updateTaskStatus(currentTask.id, 'In Progress', `Subtask "${targetSubtask.title}" mulai dicentang. Pengerjaan dimulai.`);
      addToast('info', 'Fase Berpindah: In Progress', `Tugas otomatis masuk ke kolom "In Progress" karena subtask mulai dikerjakan.`);
      return;
    }

    // 2. If 100% of subtasks are now completed:
    if (isNowAllDone) {
      if (['In Progress', 'Perlu Manual', 'Diperbaiki Agen', 'Dianalisis'].includes(currentTask.status)) {
        updateTaskStatus(currentTask.id, 'Menunggu Persetujuan', 'Seluruh checklist subtask tuntas 100%. Diajukan untuk Code Review PR.');
        addToast('success', 'Checklist 100% Tuntas! 🚀', 'Semua subtask selesai! Tugas otomatis berpindah ke tahap "Review PR / Persetujuan".');
      } else if (currentTask.status === 'Menunggu Persetujuan') {
        updateTaskStatus(currentTask.id, 'QA/Testing', 'PR telah lolos verifikasi subtask, masuk ke QA Staging.');
        addToast('success', 'Masuk Pengujian QA 🧪', 'Tugas otomatis beralih ke tahap QA/Testing.');
      } else if (['QA/Testing', 'Deploy Staging', 'Disetujui'].includes(currentTask.status)) {
        updateTaskStatus(currentTask.id, 'Selesai', 'Seluruh pengujian subtask QA selesai.');
        addToast('success', 'Tugas Selesai & Terverifikasi! 🎉', 'Tugas otomatis berpindah ke kolom Selesai.');
      }
      return;
    }

    // 3. If unchecking while status is Selesai -> revert to In Progress
    if (!willBeCompleted && currentTask.status === 'Selesai') {
      updateTaskStatus(currentTask.id, 'In Progress', `Subtask "${targetSubtask.title}" batal dicentang. Tugas dibuka kembali.`);
      addToast('warning', 'Tugas Dibuka Kembali', 'Subtask belum tuntas, tugas kembali ke In Progress.');
      return;
    }

    // Regular info
    if (willBeCompleted) {
      addToast('info', 'Subtask Dicentang', `${newCompletedCount}/${totalCount} subtask tuntas.`);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Menunggu Persetujuan':
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
      case 'Diperbaiki Agen':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Perlu Manual':
      case 'Ditolak':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Deploy Staging':
      case 'Deploy Production':
      case 'Dipantau':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-slate-900/20 overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {/* Task Key badge with copy */}
            <button
              onClick={handleCopyKey}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold transition-colors"
              title="Klik untuk menyalin kode tiket"
            >
              <span>{currentTask.key}</span>
              {copiedKey ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              )}
            </button>

            <span className="text-slate-300">/</span>

            {/* Type indicator */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              {currentTask.type === 'Bug' ? (
                <span className="flex items-center gap-1 text-rose-600">
                  <Bug className="w-3.5 h-3.5" />
                  <span>Bug</span>
                </span>
              ) : currentTask.type === 'Feature' ? (
                <span className="flex items-center gap-1 text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Feature</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-700">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentTask.type}</span>
                </span>
              )}
            </div>

            {epic && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: epic.color }} />
                  {epic.title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Status Dropdown Pill */}
            <div className="relative">
              <select
                value={currentTask.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className={`text-xs font-bold px-3 py-1.5 pr-7 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-colors ${getStatusColor(currentTask.status)}`}
              >
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Baru">Baru (Laporan Masuk)</option>
                <option value="Dianalisis">Dianalisis (AI Triage)</option>
                <option value="Menunggu Persetujuan">Menunggu Persetujuan PR</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Perlu Manual">Perlu Manual</option>
                <option value="Deploy Staging">Deploy Staging</option>
                <option value="Deploy Production">Deploy Production</option>
                <option value="Dipantau">Dipantau (Post-Deploy)</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Tutup dialog (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column (Main Work Area: 8 of 12 cols = ~67%) */}
          <div className="lg:col-span-8 p-6 sm:p-7 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {currentTask.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>Dibuat {new Date(currentTask.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>·</span>
                <span>Terakhir diperbarui {new Date(currentTask.lastStatusUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                {currentTask.visibility === 'client_public' ? (
                  <>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Publik (Dapat dilihat klien)
                    </span>
                  </>
                ) : (
                  <>
                    <span>·</span>
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Internal Saja
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive 6-Phase Software House Lifecycle Stepper (Clickable & Dynamic) */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Alur Siklus 6 Fase Standar Software House
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Klik tahapan di bawah untuk memindahkan tiket, atau centang subtask untuk auto-advance.
                    </p>
                  </div>
                </div>

                {/* Quick Advance / Revert Buttons */}
                <div className="flex items-center gap-2">
                  {prevPhase && (
                    <button
                      onClick={() => handleMoveToPhase(prevPhase.targetStatus, prevPhase.label)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                      title={`Mundur ke: ${prevPhase.label}`}
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span className="hidden sm:inline">Mundur</span>
                    </button>
                  )}

                  {nextPhase && (
                    <button
                      onClick={() => handleMoveToPhase(nextPhase.targetStatus, nextPhase.label)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs"
                      title={`Lanjut ke: ${nextPhase.label}`}
                    >
                      <span>Lanjut Fase</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 6 Clickable Phase Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-[11px]">
                {lifecyclePhases.map((phase) => (
                  <button
                    key={phase.step}
                    type="button"
                    onClick={() => handleMoveToPhase(phase.targetStatus, phase.label)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 group relative ${
                      phase.active
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                        : phase.done
                        ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200 hover:bg-emerald-100/90 hover:border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 w-full">
                      <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                        phase.active ? 'text-indigo-200' : phase.done ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        Phase {phase.step}
                      </span>
                      {phase.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : phase.active ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-400 shrink-0 transition-colors" />
                      )}
                    </div>
                    <div>
                      <div className={`font-bold leading-snug line-clamp-1 ${
                        phase.active ? 'text-white' : phase.done ? 'text-emerald-950 font-semibold' : 'text-slate-800'
                      }`}>
                        {phase.label}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 ${
                        phase.active ? 'text-indigo-100' : phase.done ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {phase.active ? '● Sedang Aktif' : phase.done ? '✓ Tuntas' : 'Klik untuk pindah'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Software House Standard Bug Tracking & Fixing Suite */}
            {currentTask.type === 'Bug' && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
                {/* 1. Software House Bug Overview Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Severity Badge with SLA */}
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                        (currentTask.severity || '').startsWith('S1')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : (currentTask.severity || '').startsWith('S2')
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}>
                        {(currentTask.severity || '').startsWith('S1') ? (
                          <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>{currentTask.severity || 'S2 - Major'}</span>
                      </span>
                    </div>

                    {/* Environment Badge */}
                    <span className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{currentTask.environment || 'Production'}</span>
                    </span>

                    {/* Warranty Status Badge */}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentTask.warrantyStatus || 'Garansi Proyek (Rp 0)'}</span>
                    </span>

                    {/* SLA Target indicator */}
                    <span className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {(currentTask.severity || '').startsWith('S1') 
                          ? 'SLA Target: < 4 Jam (Hotfix)' 
                          : (currentTask.severity || '').startsWith('S2')
                          ? 'SLA Target: 24 Jam' 
                          : 'SLA Target: 3 Hari'}
                      </span>
                    </span>
                  </div>

                  {/* Triage action button */}
                  <button
                    onClick={handleOpenTriage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Triage & Atur SLA</span>
                  </button>
                </div>

                {/* 3. Bug Specification & Steps to Reproduce */}
                {(currentTask.reproductionSteps || currentTask.expectedBehavior || currentTask.actualBehavior) && (
                  <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <FileSearch className="w-4 h-4 text-rose-600" />
                        <span>Spesifikasi Reproduksi Bug & Ekspektasi QA</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">
                        Reporter: {reporter?.name || currentTask.source}
                      </span>
                    </div>

                    {/* Reproduction steps */}
                    {currentTask.reproductionSteps && currentTask.reproductionSteps.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">
                          Langkah Reproduksi (Steps to Reproduce):
                        </span>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs text-slate-700">
                          {currentTask.reproductionSteps.map((st, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="font-mono text-slate-400 font-bold shrink-0">{i + 1}.</span>
                              <span>{st.replace(/^[0-9]+\.\s*/, '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expected vs Actual Comparison */}
                    {(currentTask.expectedBehavior || currentTask.actualBehavior) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {currentTask.expectedBehavior && (
                          <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 text-emerald-950">
                            <div className="font-bold text-[11px] flex items-center gap-1.5 text-emerald-800 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hasil yang Diharapkan (Expected):</span>
                            </div>
                            <p className="leading-relaxed">{currentTask.expectedBehavior}</p>
                          </div>
                        )}

                        {currentTask.actualBehavior && (
                          <div className="p-3 bg-rose-50/80 rounded-lg border border-rose-200 text-rose-950">
                            <div className="font-bold text-[11px] flex items-center gap-1.5 text-rose-800 mb-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Hasil Aktual (Actual Error):</span>
                            </div>
                            <p className="leading-relaxed">{currentTask.actualBehavior}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Fixing Execution Console: Dual Track (Tim Developer vs Otomasi AI) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  {/* Track Tabs */}
                  <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
                    <button
                      onClick={() => setFixingTrack('team_dev')}
                      className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        fixingTrack === 'team_dev'
                          ? 'border-indigo-600 bg-white text-indigo-950 font-bold'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Jalur Tim Developer (SOP Software House)</span>
                    </button>
                    <button
                      onClick={() => setFixingTrack('ai_agent')}
                      className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        fixingTrack === 'ai_agent'
                          ? 'border-indigo-600 bg-white text-indigo-950 font-bold'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Otomasi Agen AI (Claude Code Headless)</span>
                    </button>
                  </div>

                  {/* Track Content */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {fixingTrack === 'team_dev' ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            {assignee && (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {assignee ? assignee.name : 'Belum Ditugaskan'}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {assignee ? `${assignee.role} · Lead Bugfixer` : 'Pilih developer untuk menangani tiket'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {currentTask.status === 'Baru' || currentTask.status === 'Dianalisis' ? (
                              <button
                                onClick={() => updateTaskStatus(currentTask.id, 'In Progress', 'Developer memulai investigasi & pengerjaan fix')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Mulai Pengerjaan (Set In Progress)</span>
                              </button>
                            ) : (
                              <button
                                onClick={handleOpenManualPr}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                              >
                                <GitPullRequest className="w-3.5 h-3.5" />
                                <span>Buka Pull Request Manual</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Git Branch & Checkout Command */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                              <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Branch Kerja Git (Konvensi Software House):</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              Target Merge: <code className="text-indigo-600 font-bold">staging</code>
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-[#0f172a] text-slate-200 rounded-xl font-mono text-xs shadow-inner">
                            <code>git checkout -b {currentTask.branchName || `fix/${currentTask.key.toLowerCase()}-hotfix`} origin/staging</code>
                            <button
                              onClick={() => handleCopyCommand(`git checkout -b ${currentTask.branchName || `fix/${currentTask.key.toLowerCase()}-hotfix`} origin/staging`)}
                              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                              title="Salin perintah git checkout"
                            >
                              {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Otomasi Triage & Patch Agen Claude Code
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Agen menganalisis AST kode, mereproduksi exception Sentry, dan menyusun patch minimal.
                            </p>
                          </div>

                          <button
                            onClick={handleTriggerAiFix}
                            disabled={isSimulatingAgent}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm disabled:opacity-50"
                          >
                            {isSimulatingAgent ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Menganalisis AST & Reproduksi...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Jalankan AI Triage & Fix</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Classification & Confidence */}
                        {currentTask.confidenceScore && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="font-semibold text-slate-700">Skor Keyakinan Agen:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">{currentTask.confidenceScore}%</span>
                                <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      currentTask.confidenceScore > 80 ? 'bg-emerald-500' : currentTask.confidenceScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${currentTask.confidenceScore}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            {currentTask.confidenceReason && (
                              <p className="text-xs text-slate-600 italic leading-relaxed">
                                &ldquo;{currentTask.confidenceReason}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Pull Request & Code Review Stage (Tech Lead Review) */}
                {currentTask.status === 'Menunggu Persetujuan' && currentTask.prDiff && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200/80">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                        <GitPullRequest className="w-4 h-4 text-indigo-600" />
                        <span>{currentTask.prNumber || 'Pull Request'}</span>
                        <span className="text-slate-400 font-normal">pada branch</span>
                        <code className="bg-white/90 px-2 py-0.5 rounded border border-indigo-200 font-mono text-[11px] text-indigo-900">
                          {currentTask.branchName || 'fix/branch'}
                        </code>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CI Unit Tests: Lolos ({currentTask.testResult ? `${currentTask.testResult.passedCount}/${currentTask.testResult.total} Pass` : 'Lolos'})</span>
                      </div>
                    </div>

                    {/* Diff Viewer Card */}
                    <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Perubahan Kode (Patch Diff)</span>
                        </div>
                        <button
                          onClick={() => setIsDiffExpanded(!isDiffExpanded)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                        >
                          <span>{isDiffExpanded ? 'Kecilkan' : 'Perluas'}</span>
                          {isDiffExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {isDiffExpanded && (
                        <div className="p-3.5 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed">
                          <pre className="text-slate-200">
                            {currentTask.prDiff.split('\n').map((line, idx) => {
                              const isAdd = line.startsWith('+');
                              const isDel = line.startsWith('-');
                              const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
                              return (
                                <div
                                  key={idx}
                                  className={`px-2 py-0.5 ${
                                    isAdd
                                      ? 'text-emerald-300 bg-emerald-950/40'
                                      : isDel
                                      ? 'text-rose-300 bg-rose-950/40'
                                      : isHeader
                                      ? 'text-sky-400 font-bold'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {line}
                                </div>
                              );
                            })}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Reviewer Action Buttons */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Keputusan Review Tech Lead / Peer Reviewer:</span>
                        </span>
                        <span className="text-[11px] text-slate-500">Persetujuan meloloskan kode ke Staging QA</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          onClick={handleApprovePr}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui PR & Merge ke Staging</span>
                        </button>

                        <button
                          onClick={() => setShowRevisionModal(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Minta Revisi Kode</span>
                        </button>

                        <button
                          onClick={() => chooseManualFix(currentTask.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-all"
                        >
                          <FileCode className="w-3.5 h-3.5 text-slate-500" />
                          <span>Jalur Manual Programmer</span>
                        </button>

                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all ml-auto"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Tolak (Reject)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. QA Staging Verification & Sign-Off Section (SOP Software House) */}
                {['Disetujui', 'QA/Testing', 'Deploy Staging'].includes(currentTask.status) && (
                  <div className="p-4 sm:p-5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                            Verifikasi Staging oleh QA Engineer
                          </h4>
                          <p className="text-[11px] text-purple-800">
                            Tester Bertugas: <strong>Siti Nurhaliza (QA Tester)</strong> · Lingkungan: <strong>Staging Server</strong>
                          </p>
                        </div>
                      </div>

                      {currentTask.qaSignOff?.status === 'Passed' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>QA Sign-Off: LULUS ({currentTask.qaSignOff.passedCasesCount}/{currentTask.qaSignOff.testCasesCount})</span>
                        </span>
                      )}
                    </div>

                    {/* QA Checklist */}
                    <div className="bg-white p-3.5 rounded-lg border border-purple-200/80 text-xs text-slate-700 space-y-2">
                      <div className="font-semibold text-slate-900 text-[11px]">Checklist Pengujian Staging:</div>
                      <div className="space-y-1.5 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Verifikasi skenario reproduksi bug: Galat tidak terjadi lagi pada branch staging</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Smoke test modul terkait & edge-case skenario batas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Regression test: modul transaksi, login, dan pelaporan berfungsi normal</span>
                        </div>
                      </div>

                      {currentTask.qaSignOff?.notes && (
                        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs italic text-slate-700">
                          &ldquo;{currentTask.qaSignOff.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* QA Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenQa(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Beri Sign-Off QA (Lolos Staging)</span>
                        </button>

                        <button
                          onClick={() => handleOpenQa(false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Gagal / Reopen Bug (Ada Regresi)</span>
                        </button>
                      </div>

                      <button
                        onClick={handleProdDeployClick}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-colors ml-auto"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Lanjut Rilis ke Production</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. Post-Deploy Monitoring & Rollback Window */}
                {currentTask.status === 'Dipantau' && (
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                        <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                        <span>Jendela Pemantauan Aktif (30 Menit Pasca-Deploy Production)</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Error Rate: 0.06% (Normal)
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem sedang memantau telemetri Sentry secara real-time. Jika lonjakan error melebihi 2%, rollback otomatis akan dieksekusi secara instan.
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <button
                        onClick={() => triggerRollback(currentTask.id, 'Error spike Sentry terdeteksi 3.8% pasca deploy')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg transition-colors shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                        <span>Uji Simulasi Error Spike & Auto-Rollback</span>
                      </button>

                      <button
                        onClick={() => updateTaskStatus(currentTask.id, 'Selesai', 'Periode pemantauan tuntas tanpa error.')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors ml-auto shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Tandai Selesai & Stabil</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 8. Root Cause Analysis (RCA) & Garansi Proyek Documentation */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-slate-600" />
                      <span>Root Cause Analysis (RCA) & Catatan Garansi</span>
                    </span>
                    <button
                      onClick={handleOpenRca}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                    >
                      {currentTask.rootCauseAnalysis ? 'Edit RCA' : '+ Tulis RCA'}
                    </button>
                  </div>

                  {currentTask.rootCauseAnalysis ? (
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-900 block mb-0.5">Akar Masalah:</span>
                        <p className="leading-relaxed">{currentTask.rootCauseAnalysis}</p>
                      </div>
                      {currentTask.preventiveMeasures && (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-900 block mb-0.5">Langkah Pencegahan:</span>
                          <p className="leading-relaxed">{currentTask.preventiveMeasures}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded border border-slate-200">
                      Belum ada dokumentasi RCA untuk tiket ini. Klik &quot;+ Tulis RCA&quot; untuk mencatat audit teknis.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Deskripsi Pekerjaan
              </h3>
              <div className="text-xs text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 whitespace-pre-line font-sans">
                {currentTask.description || <span className="text-slate-400 italic">Belum ada deskripsi spesifik.</span>}
              </div>
            </div>

            {/* Subtasks Section with Interactive Progress & Auto-Advancement */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Subtask & Checklist SOP
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {completedSubtasksCount} dari {currentTask.subtasks.length} ({progressPercent}%)
                  </span>
                </div>

                {nextPhase && (
                  <button
                    type="button"
                    onClick={() => handleMoveToPhase(nextPhase.targetStatus, nextPhase.label)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  >
                    <span>Lanjut ke {nextPhase.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {currentTask.subtasks.length > 0 && (
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Auto-Advance Rule Explanatory Banner */}
              <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-2.5 rounded-xl border border-indigo-200/70 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-indigo-600 text-white shrink-0">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] text-indigo-950 font-medium leading-relaxed">
                    <strong>Alur Fase Otomatis:</strong> Mencentang subtask langsung memajukan fase kerja sesuai SOP (Baru → In Progress → Review PR → QA → Selesai).
                  </span>
                </div>
              </div>

              {/* Subtasks list */}
              <div className="space-y-1.5">
                {currentTask.subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => handleToggleSubtask(st.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs group ${
                      st.completed
                        ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className={`flex-1 transition-all ${st.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'}`}>
                      {st.title}
                    </span>
                    {st.completed ? (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                        ✓ Tuntas
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Klik untuk centang
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Add subtask inline input */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="+ Tambah subtask baru..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                >
                  Tambah
                </button>
              </form>
            </div>

            {/* Comments & Activity Audit Trail */}
            <div className="pt-2">
              <div className="flex border-b border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'comments'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Komentar & Diskusi ({taskComments.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Jejak Audit Aktivitas ({taskEvents.length})</span>
                </button>
              </div>

              {/* Comments Tab Content */}
              {activeTab === 'comments' && (
                <div className="pt-4 space-y-4">
                  <div className="space-y-3">
                    {taskComments.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-2">Belum ada diskusi atau komentar.</div>
                    ) : (
                      taskComments.map((c) => (
                        <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{c.author}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({c.authorRole})</span>
                              {c.isInternal && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Internal
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{c.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment box */}
                  <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                    <textarea
                      rows={2}
                      placeholder="Tulis tanggapan atau koordinasi teknis..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-0"
                        />
                        <span>Tandai Komentar Internal (Rahasia dari Klien)</span>
                      </label>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Kirim Komentar</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* History Audit Log Content */}
              {activeTab === 'history' && (
                <div className="pt-4 space-y-3 max-h-72 overflow-y-auto">
                  {taskEvents.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3 text-xs text-slate-600 py-1.5 border-b border-slate-100 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ev.actor}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(ev.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {ev.eventType === 'status_change' && (
                            <span>Mengubah status: <code className="font-bold text-slate-800">{ev.fromValue}</code> → <code className="font-bold text-slate-800">{ev.toValue}</code></span>
                          )}
                          {ev.payload && <div className="text-slate-500 mt-0.5">{ev.payload}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sticky Metadata Sidebar: 4 of 12 cols = ~33%) */}
          <div className="lg:col-span-4 p-6 sm:p-7 bg-slate-50/50 space-y-5">
            {/* Priority Section */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Prioritas
              </span>
              <select
                value={currentTask.priority}
                onChange={(e) => updateTask(currentTask.id, { priority: e.target.value as TaskPriority })}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 shadow-2xs"
              >
                <option value="Hotfix">🔥 Hotfix (Mendesak)</option>
                <option value="Tinggi">▲ Tinggi</option>
                <option value="Sedang">■ Sedang</option>
                <option value="Rendah">▼ Rendah</option>
              </select>
            </div>

            {/* Assignee Card */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Assignee (Penerima Tugas)
              </span>
              <select
                value={currentTask.assigneeId}
                onChange={(e) => updateTask(currentTask.id, { assigneeId: e.target.value })}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg p-2 shadow-2xs"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Pelapor (Reporter)
              </span>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                {reporter && (
                  <img
                    src={reporter.avatar}
                    alt={reporter.name}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="font-medium text-slate-900">{reporter?.name || 'Sentry System'}</span>
                <span className="text-[10px] text-slate-400">({currentTask.source})</span>
              </div>
            </div>

            {/* Sprint & Dates */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80">
              {sprint && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Sprint
                  </span>
                  <div className="text-xs font-medium text-slate-800 bg-white p-2 rounded-lg border border-slate-200 truncate">
                    {sprint.name}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Jatuh Tempo (Due Date)
                </span>
                <input
                  type="date"
                  value={currentTask.dueDate}
                  onChange={(e) => updateTask(currentTask.id, { dueDate: e.target.value })}
                  className="w-full text-xs font-mono font-medium text-slate-800 bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              {/* Estimates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Estimasi (Jam)
                  </span>
                  <input
                    type="number"
                    value={currentTask.estimateHours}
                    onChange={(e) => updateTask(currentTask.id, { estimateHours: Number(e.target.value) })}
                    className="w-full text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Jam Tercatat
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={currentTask.timeLoggedHours}
                    onChange={(e) => updateTask(currentTask.id, { timeLoggedHours: Number(e.target.value) })}
                    className="w-full text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            {/* Billing Status */}
            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Status Tagihan Finance
              </span>
              {currentTask.billedInvoiceId ? (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sudah Ditagih ({currentTask.billedInvoiceId})</span>
                </div>
              ) : (
                <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>Belum Ditagih</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Siap masuk invoice</span>
                </div>
              )}
            </div>

            {/* Owner Delete button */}
            {role === 'owner' && (
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus task ${currentTask.key}?`)) {
                      deleteTask(currentTask.id);
                      onClose();
                    }
                  }}
                  className="w-full text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg border border-rose-200 transition-colors font-semibold"
                >
                  Hapus Tiket Pekerjaan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Tolak PR Otomatis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sebutkan alasan penolakan agar tercatat di jejak audit dan menjadi bahan perbaikan otomatis agen:
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Diff tidak menangani edge-case promo 100% atau berpotensi breaking change..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Konfirmasi Tolak PR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Minta Revisi ke Agen AI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ketik arahan atau koreksi kode yang perlu diperbaiki ulang oleh Claude Code:
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Tolong gunakan pembulatan ke bawah Math.floor dan pastikan unit test promo ditambahkan..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRevision}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Kirim Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Double Confirmation Modal for 'Hard' Bug Deploy */}
      {showDoubleConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-2.5 text-rose-700">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold">Otorisasi Ganda: Bug Kategori Hard / Kritis</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perubahan ini menyentuh struktur data kritis / transaksi pembayaran. Sesuai PRD 7.2, rilis ke production membutuhkan konfirmasi ganda eksplisit.
            </p>
            <div className="p-3 bg-rose-50 text-rose-900 rounded-lg border border-rose-200 text-xs">
              Pastikan Anda telah melakukan verifikasi smoke test di Staging dan siap memantau telemetri error selama 30 menit ke depan.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDoubleConfirmModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDoubleConfirmProd}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Konfirmasi Deploy Production
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Triage & SLA Modal (SOP Software House) */}
      {showTriageModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-900">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold">Triage & Konfigurasi SLA Bug (Standar Software House)</h3>
              </div>
              <button onClick={() => setShowTriageModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Severity */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tingkat Keparahan (Bug Severity) *
                </label>
                <select
                  value={triageSeverity}
                  onChange={(e) => setTriageSeverity(e.target.value as BugSeverity)}
                  className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="S1 - Critical (Blocker)">S1 - Critical / Blocker (System Down / Data Loss, SLA &lt; 4 Jam)</option>
                  <option value="S2 - Major">S2 - Major (Fitur Inti Rusak, SLA 24 Jam)</option>
                  <option value="S3 - Minor">S3 - Minor (Fungsi Terganggu, Workaround Ada, SLA 3 Hari)</option>
                  <option value="S4 - Trivial">S4 - Trivial (Typo / Kosmetik UI, SLA Rilis Reguler)</option>
                </select>
              </div>

              {/* Environment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Lingkungan Terdampak
                  </label>
                  <select
                    value={triageEnv}
                    onChange={(e) => setTriageEnv(e.target.value as BugEnvironment)}
                    className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="Production">Production (Live)</option>
                    <option value="Staging">Staging (Pre-Release)</option>
                    <option value="QA / Testing">QA / Testing</option>
                    <option value="Development">Development Local</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status Garansi Proyek
                  </label>
                  <select
                    value={triageWarranty}
                    onChange={(e) => setTriageWarranty(e.target.value as WarrantyStatus)}
                    className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="Garansi Proyek (Gratis)">Garansi Proyek (Rp 0 - Bebas Biaya)</option>
                    <option value="Kuota Maintenance">Potong Kuota Retainer</option>
                    <option value="Non-Garansi (Billable)">Non-Garansi (Ditagihkan)</option>
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Assignee Lead Engineer
                </label>
                <select
                  value={triageAssignee}
                  onChange={(e) => setTriageAssignee(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowTriageModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmTriage}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Simpan & Konfirmasi Triage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QA Sign-Off / Reopen Modal (SOP Software House) */}
      {showQaModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              {qaIsPass ? (
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {qaIsPass ? 'QA Sign-Off: Lolos Verifikasi Staging' : 'QA Sign-Off: Gagal (Reopen Bug)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tester: <strong>Siti Nurhaliza (QA Tester)</strong> · Staging Pre-Release
                </p>
              </div>
            </div>

            {qaIsPass ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Catatan Pengujian & Validasi QA *
                  </label>
                  <textarea
                    rows={3}
                    value={qaNotes}
                    onChange={(e) => setQaNotes(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                    placeholder="Tuliskan modul yang diuji, hasil smoke test, dan konfirmasi tidak ada regresi..."
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium">
                  <span>Hasil Test Case: 6 / 6 Berhasil (100% Pass)</span>
                  <span className="font-bold text-emerald-700">Siap Rilis Prod</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-rose-800 block mb-1">
                    Alasan Reopen / Temuan Regresi *
                  </label>
                  <textarea
                    rows={3}
                    value={qaReopenReason}
                    onChange={(e) => setQaReopenReason(e.target.value)}
                    className="w-full text-xs p-3 border border-rose-300 rounded-lg focus:ring-1 focus:ring-rose-500"
                    placeholder="Sebutkan langkah pengujian yang gagal, screenshot, atau pesan error yang masih muncul..."
                  />
                </div>
                <div className="p-3 bg-rose-50 text-rose-900 rounded-lg text-xs">
                  Tiket akan otomatis dikembalikan ke status <strong>In Progress / Perlu Manual</strong> agar developer segera memperbaiki temuan.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowQaModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmQa}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-xs ${
                  qaIsPass ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {qaIsPass ? 'Terbitkan Sign-Off Lolos (Passed)' : 'Re-open Bug ke Developer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RCA Documentation Modal (SOP Software House) */}
      {showRcaModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-900">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold">Dokumentasi Root Cause Analysis (RCA)</h3>
              </div>
              <button onClick={() => setShowRcaModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dokumentasikan akar masalah teknis dan langkah mitigasi jangka panjang untuk knowledge base software house:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Akar Masalah Teknis (Root Cause) *
                </label>
                <textarea
                  rows={3}
                  value={rcaInput}
                  onChange={(e) => setRcaInput(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  placeholder="Mengapa bug ini bisa terjadi? (Contoh: edge-case pembagian 0 saat voucher 100%, missing index database, race condition...)"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Langkah Pencegahan (Preventive Measures) *
                </label>
                <textarea
                  rows={2}
                  value={preventiveInput}
                  onChange={(e) => setPreventiveInput(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  placeholder="Apa yang dilakukan agar masalah serupa tidak terulang? (Contoh: penambahan unit test regression di CI, lint rule...)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRcaModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRca}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Simpan Dokumentasi RCA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Manual Pull Request Modal (Tim Developer) */}
      {showManualPrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-900">
                <GitPullRequest className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold">Buka Pull Request Manual (Kirim ke Review)</h3>
              </div>
              <button onClick={() => setShowManualPrModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Kirimkan hasil perbaikan branch developer untuk direview oleh Tech Lead sebelum dimerge ke Staging:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Judul Pull Request *
                </label>
                <input
                  type="text"
                  value={manualPrTitle}
                  onChange={(e) => setManualPrTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ringkasan Patch / Git Diff *
                </label>
                <textarea
                  rows={4}
                  value={manualPrDiff}
                  onChange={(e) => setManualPrDiff(e.target.value)}
                  className="w-full font-mono text-[11px] p-2.5 bg-[#0f172a] text-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span>Target Branch: <code className="font-bold text-indigo-600">staging</code></span>
                <span>Branch: <code className="text-slate-800">{currentTask.branchName || `fix/${currentTask.key.toLowerCase()}`}</code></span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowManualPrModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmManualPr}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Buka Pull Request & Kirim Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
