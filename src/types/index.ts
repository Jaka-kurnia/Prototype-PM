export type UserRole = 
  | 'owner' 
  | 'pm' 
  | 'developer' 
  | 'qa' 
  | 'finance' 
  | 'sales' 
  | 'client';

export type TaskType = 
  | 'Feature' 
  | 'Task' 
  | 'Bug' 
  | 'Revisi' 
  | 'Subtask' 
  | 'Maintenance';

export type TaskPriority = 'Hotfix' | 'Tinggi' | 'Sedang' | 'Rendah';

export type BugDifficulty = 'Low' | 'Medium' | 'Hard';

export type TaskStatus = 
  | 'Backlog'
  | 'To Do'
  | 'In Progress'
  | 'In Review'
  | 'QA/Testing'
  | 'Baru'
  | 'Dikonfirmasi'
  | 'Dianalisis'
  | 'Diperbaiki Agen'
  | 'Perlu Manual'
  | 'Menunggu Persetujuan'
  | 'Disetujui'
  | 'Deploy Staging'
  | 'Deploy Production'
  | 'Dipantau'
  | 'Selesai'
  | 'Ditolak';

export type TaskSource = 'Web Form' | 'WhatsApp' | 'Sentry' | 'Manual' | 'AI';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
}

export interface TaskRelation {
  targetKey: string;
  type: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates';
}

export interface DiagnosticPackage {
  summary: string;
  reproductionSteps: string[];
  affectedFiles: { path: string; lineRange: string }[];
  sentryBreadcrumbs: string[];
  suggestedFixes: { option: string; tradeOff: string }[];
  branchName: string;
  commandSnippet: string;
}

export interface OrchestratorGithubWorkflow {
  target_branch: string;
  feature_branch_name: string;
  recommended_commit_message: string;
}

export interface IntelligentOrchestratorResult {
  bug_analysis: string;
  complexity_level: 'LOW' | 'MEDIUM' | 'EXPERT';
  assigned_to: 'AI Agent' | 'Human Developer';
  github_workflow: OrchestratorGithubWorkflow;
  next_action_step: string;
}

export interface TestResult {
  passed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  logs: string[];
}

export type BugSeverity = 
  | 'S1 - Critical (Blocker)' 
  | 'S2 - Major' 
  | 'S3 - Minor' 
  | 'S4 - Trivial';

export type BugEnvironment = 'Production' | 'Staging' | 'QA / Testing' | 'Development';

export type WarrantyStatus = 
  | 'Garansi Proyek (Gratis)' 
  | 'Kuota Maintenance' 
  | 'Non-Garansi (Billable)';

export interface QASignOff {
  testerId: string;
  testerName: string;
  testedAt: string;
  environment: 'Staging' | 'Production';
  status: 'Passed' | 'Failed (Reopen)' | 'Pending';
  notes: string;
  testCasesCount?: number;
  passedCasesCount?: number;
  testedVersion?: string;
}

export interface Task {
  id: string;
  key: string;
  projectId: string;
  epicId?: string;
  parentTaskId?: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  difficulty?: BugDifficulty;
  severity?: BugSeverity;
  environment?: BugEnvironment;
  reproductionSteps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  rootCauseAnalysis?: string;
  preventiveMeasures?: string;
  warrantyStatus?: WarrantyStatus;
  slaDeadline?: string;
  qaSignOff?: QASignOff;
  confidenceScore?: number;
  confidenceReason?: string;
  source: TaskSource;
  assigneeId: string;
  reporterId: string;
  estimateHours: number;
  timeLoggedHours: number;
  startDate: string;
  dueDate: string;
  sprintId?: string;
  visibility: 'internal' | 'client_public';
  billedInvoiceId?: string | null;
  branchName?: string;
  prNumber?: string;
  prDiff?: string;
  testResult?: TestResult;
  diagnosticPackage?: DiagnosticPackage;
  orchestratorResult?: IntelligentOrchestratorResult;
  subtasks: Subtask[];
  relations: TaskRelation[];
  lastStatusUpdated: string; // ISO string
  createdAt: string;
  requiresDoubleConfirmation?: boolean;
}

export interface TaskEvent {
  id: string;
  taskId: string;
  actor: string;
  actorRole: string;
  eventType: 
    | 'status_change' 
    | 'ai_analysis' 
    | 'pr_created' 
    | 'pr_approved' 
    | 'pr_rejected' 
    | 'pr_revised' 
    | 'manual_fallback' 
    | 'deployed_staging' 
    | 'deployed_production' 
    | 'rollback_triggered' 
    | 'comment_added' 
    | 'time_logged'
    | 'created'
    | 'qa_pass'
    | 'qa_fail'
    | 'bug_triaged'
    | 'rca_recorded'
    | 'bug_reopened';
  fromValue?: string;
  toValue?: string;
  payload?: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface ProjectBranch {
  name: string;
  commitHash: string;
  moduleName: string;
  epicId?: string;
  assigneeId?: string;
  isDefault: boolean;
  lastUpdated: string;
}

export interface GitHubIntegrationSettings {
  isConnected: boolean;
  accountName: string;
  organization: string;
  authType: 'pat' | 'github_app';
  apiKey: string;
  tokenMasked: string;
  tokenScopes: string[];
  tokenExpiresAt: string;
  webhookSecret: string;
  webhookUrl: string;
  defaultBranch: string;
  repoVisibility: 'private' | 'public';
  autoCreateRepo: boolean;
  autoCreateEpicBranches: boolean;
  autoInviteCollaborators: boolean;
  autoSetupWorkflows: boolean;
  branchPrefixEpic: string;
  branchPrefixFeature: string;
  branchPrefixFix: string;
  enforceBranchProtection: boolean;
  requireReviews: boolean;
  minApprovals: number;
  requireStatusChecks: boolean;
  requireLinearHistory: boolean;
  lastSyncAt: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  clientName: string;
  clientEmail: string;
  repoUrl: string;
  sentryDsn: string;
  status: 'Active' | 'Maintenance' | 'Completed';
  contractValue: number; // in IDR
  contractType: 'Fixed Price' | 'Retainer / Maintenance';
  warrantyUntil: string;
  maintenanceQuotaHours: number;
  maintenanceUsedHours: number;
  killSwitchActive: boolean;
  workflowType: 'standard' | 'ai_automation';
  branches?: ProjectBranch[];
  createdAt: string;
  liveUrl?: string;
  stagingUrl?: string;
  hostingStatus?: 'Healthy' | 'Degraded' | 'Deploying';
  warrantyDaysLeft?: number;
}

export interface Epic {
  id: string;
  projectId: string;
  key: string;
  title: string;
  description: string;
  color: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: 'future' | 'active' | 'closed';
}

export interface TeamMember {
  id: string;
  name: string;
  role: 
    | 'Project Manager' 
    | 'Project Manajer' 
    | 'Senior Fullstack' 
    | 'Fullstack Engineer' 
    | 'Full stack' 
    | 'Frontend Engineer' 
    | 'Frontend Dev' 
    | 'Backend Engineer' 
    | 'Backend Dev' 
    | 'QA Tester' 
    | 'QA' 
    | 'DevOps';
  email: string;
  avatar: string;
  skills: string[];
  capacityHoursPerWeek: number;
  assignedHours: number;
  onLeave: boolean;
  activeProjects: string[];
  githubUsername?: string;
  githubPermission?: 'admin' | 'maintain' | 'write' | 'triage' | 'read';
  githubStatus?: 'active' | 'invited' | 'pending';
}

export interface CRMDeal {
  id: string;
  dealCode: string;
  title: string;
  clientName: string;
  clientPic: string;
  clientEmail: string;
  contractValue: number;
  currency: string;
  status: 'Closing/Won' | 'Converted' | 'Proposal';
  templateType: 'perpustakaan_microservices' | 'pos_warung' | 'booking_futsal' | 'pos_system' | 'ecommerce_platform' | 'corporate_portal' | 'mobile_app';
  scopeNotes: string;
  paymentTerms: string;
  closedDate: string;
}

export interface InvoiceItem {
  id: string;
  taskId?: string;
  description: string;
  hoursOrUnits: number;
  ratePerUnit: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  clientName: string;
  type: 'Milestone Termin' | 'Maintenance Berkala' | 'Final Handover' | 'Ad-hoc Fix';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxPpn: number; // 11%
  totalAmount: number;
  status: 'Draft' | 'Disetujui PM' | 'Terkirim ke Finance' | 'Terkirim ke Klien' | 'Lunas' | 'Jatuh Tempo';
  notes: string;
  percentage?: number;
  projectProgressAtIssue?: number;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'finance' | 'crm' | 'system';
  timestamp: string;
  isRead: boolean;
  projectId?: string;
  invoiceId?: string;
  amount?: number;
  percentage?: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
}
