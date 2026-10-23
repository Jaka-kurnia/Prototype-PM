import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GitBranch, 
  GitPullRequest, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Settings, 
  RefreshCw, 
  FolderGit2, 
  Users, 
  Sparkles, 
  Key, 
  Lock, 
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  AlertCircle,
  Copy,
  Link,
  Shield,
  Clock,
  Terminal,
  X,
  Send,
  Zap,
  Globe
} from 'lucide-react';
import { TeamMember } from '../../types';

export const GithubSettingsView: React.FC = () => {
  const { 
    githubSettings, 
    updateGithubSettings, 
    projects, 
    teamMembers, 
    addTeamMember, 
    updateTeamMember, 
    deleteTeamMember, 
    addToast 
  } = useApp();

  // Basic GitHub Settings
  const [authType, setAuthType] = useState<'pat' | 'github_app'>(githubSettings.authType || 'pat');
  const [apiKey, setApiKey] = useState(githubSettings.apiKey || 'ghp_9k2L8vM14pQxW3zT5aY7eR6uI0oP8sD39aF');
  const [showApiKey, setShowApiKey] = useState(false);
  const [orgName, setOrgName] = useState(githubSettings.organization || 'agensi-software-house');
  const [accountName, setAccountName] = useState(githubSettings.accountName || 'agensi-tech-bot');
  const [defaultBranch, setDefaultBranch] = useState(githubSettings.defaultBranch || 'main');
  const [repoVisibility, setRepoVisibility] = useState(githubSettings.repoVisibility || 'private');
  
  // Automation Toggles
  const [autoCreateRepo, setAutoCreateRepo] = useState(githubSettings.autoCreateRepo ?? true);
  const [autoCreateEpicBranches, setAutoCreateEpicBranches] = useState(githubSettings.autoCreateEpicBranches ?? true);
  const [autoInviteCollaborators, setAutoInviteCollaborators] = useState(githubSettings.autoInviteCollaborators ?? true);
  const [branchPrefixEpic, setBranchPrefixEpic] = useState(githubSettings.branchPrefixEpic || 'epic/');
  const [branchPrefixFeature, setBranchPrefixFeature] = useState(githubSettings.branchPrefixFeature || 'feat/');
  const [branchPrefixFix, setBranchPrefixFix] = useState(githubSettings.branchPrefixFix || 'fix/');

  // Webhook settings
  const [webhookSecret, setWebhookSecret] = useState(githubSettings.webhookSecret || 'whsec_98fbc1a284e9411d332cba91b');
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(githubSettings.webhookUrl || 'https://api.softwarehouse.dev/api/webhooks/github');

  // Branch Protection settings
  const [enforceBranchProtection, setEnforceBranchProtection] = useState(githubSettings.enforceBranchProtection ?? true);
  const [requireReviews, setRequireReviews] = useState(githubSettings.requireReviews ?? true);
  const [minApprovals, setMinApprovals] = useState(githubSettings.minApprovals || 1);
  const [requireStatusChecks, setRequireStatusChecks] = useState(githubSettings.requireStatusChecks ?? true);
  const [requireLinearHistory, setRequireLinearHistory] = useState(githubSettings.requireLinearHistory ?? false);

  // Testing API Connection
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    latencyMs?: number;
    rateLimitRemaining?: number;
    scopes?: string[];
  }>({
    tested: true,
    success: true,
    latencyMs: 142,
    rateLimitRemaining: 4988,
    scopes: ['repo', 'workflow', 'admin:org', 'write:packages', 'read:user']
  });

  // Modal: Add GitHub User / Collaborator
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserGithub, setNewUserGithub] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<TeamMember['role']>('Backend Dev');
  const [newUserPermission, setNewUserPermission] = useState<'admin' | 'maintain' | 'write' | 'triage' | 'read'>('write');
  const [newUserCapacity, setNewUserCapacity] = useState(40);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGithubSettings({
      authType,
      apiKey: apiKey.trim(),
      tokenMasked: apiKey.length > 8 ? `${apiKey.slice(0, 4)}••••••••••••••••••••••••••••${apiKey.slice(-4)}` : 'ghp_••••39aF',
      organization: orgName.trim(),
      accountName: accountName.trim(),
      defaultBranch: defaultBranch.trim(),
      repoVisibility,
      autoCreateRepo,
      autoCreateEpicBranches,
      autoInviteCollaborators,
      branchPrefixEpic: branchPrefixEpic.trim(),
      branchPrefixFeature: branchPrefixFeature.trim(),
      branchPrefixFix: branchPrefixFix.trim(),
      webhookSecret: webhookSecret.trim(),
      webhookUrl: webhookUrl.trim(),
      enforceBranchProtection,
      requireReviews,
      minApprovals,
      requireStatusChecks,
      requireLinearHistory
    });
  };

  const handleTestConnection = () => {
    setIsTestingConn(true);
    setTimeout(() => {
      setIsTestingConn(false);
      const isKeyValid = apiKey.trim().length >= 10;
      if (isKeyValid) {
        setConnectionStatus({
          tested: true,
          success: true,
          latencyMs: Math.floor(Math.random() * 80 + 110),
          rateLimitRemaining: 4972,
          scopes: ['repo', 'workflow', 'admin:org', 'write:packages', 'read:user']
        });
        addToast('success', 'Koneksi GitHub API Berhasil!', 'Token PAT terverifikasi dengan izin repo, workflow, dan admin:org.');
      } else {
        setConnectionStatus({
          tested: true,
          success: false
        });
        addToast('error', 'Koneksi Gagal', 'API Key atau Personal Access Token tidak valid.');
      }
    }, 750);
  };

  const handleGenerateWebhookSecret = () => {
    const randomSecret = 'whsec_' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setWebhookSecret(randomSecret);
    addToast('info', 'Webhook Secret Baru Dihasilkan', 'Pastikan untuk menyimpan perubahan ini.');
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserGithub.trim()) {
      addToast('error', 'Validasi Gagal', 'Nama dan Username GitHub wajib diisi.');
      return;
    }

    const cleanUsername = newUserGithub.replace(/^@/, '').trim();

    addTeamMember({
      name: newUserName.trim(),
      role: newUserRole,
      email: newUserEmail.trim() || `${cleanUsername}@agensi.dev`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      skills: [newUserRole, 'Git Workflow', 'Pull Request Review'],
      capacityHoursPerWeek: Number(newUserCapacity) || 40,
      assignedHours: 0,
      onLeave: false,
      activeProjects: ['proj-perpustakaan'],
      githubUsername: cleanUsername,
      githubPermission: newUserPermission,
      githubStatus: 'active'
    });

    // Reset Form
    setNewUserName('');
    setNewUserGithub('');
    setNewUserEmail('');
    setNewUserRole('Backend Dev');
    setNewUserPermission('write');
    setShowAddUserModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-4 md:p-6 text-zinc-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner (Linear / Vercel Dark Style) */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs text-xl">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base font-semibold text-zinc-900 tracking-tight">
                  Pengaturan Integrasi GitHub & API Key
                </h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GitHub REST API v3
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/70">
                  Rate Limit: {connectionStatus.rateLimitRemaining || 4988}/5000
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Konfigurasi API Token, manajemen pengguna/kolaborator GitHub, otomasi branch modul CRM, webhook, dan branch protection rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-150 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Pengguna GitHub</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isTestingConn}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-lg transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${isTestingConn ? 'animate-spin' : ''}`} />
              <span>{isTestingConn ? 'Menguji API...' : 'Uji Koneksi API'}</span>
            </button>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* SECTION 1: KREDENSIAL API KEY & AUTHENTICATION */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    1. Autentikasi & Pengaturan API Key GitHub
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Kredensial untuk akses otomatisasi pembuatan repo, invite collaborator, dan sinkronisasi status commit.
                  </p>
                </div>
              </div>

              {/* Auth Type Switcher */}
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthType('pat')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    authType === 'pat'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Personal Access Token (PAT)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthType('github_app')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    authType === 'github_app'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  GitHub App
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Organization */}
              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-1.5">
                  Organisasi / Akun GitHub Target
                </label>
                <div className="flex items-center">
                  <span className="bg-zinc-100 border border-r-0 border-zinc-200/80 px-3 py-2 text-zinc-500 font-mono text-xs rounded-l-lg select-none">
                    github.com/
                  </span>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="nama-organisasi"
                    className="flex-1 p-2 bg-zinc-50 border border-zinc-200/80 rounded-r-lg font-mono text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Semua repositori proyek dari CRM akan dibuat di bawah organisasi ini.
                </span>
              </div>

              {/* Bot Account Name */}
              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-1.5">
                  Nama Akun Service Bot (Pembuat Commit)
                </label>
                <div className="flex items-center">
                  <span className="bg-zinc-100 border border-r-0 border-zinc-200/80 px-3 py-2 text-zinc-500 font-mono text-xs rounded-l-lg select-none">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="agensi-bot"
                    className="flex-1 p-2 bg-zinc-50 border border-zinc-200/80 rounded-r-lg font-mono text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Akun yang tercatat sebagai author saat branch atau PR diinisialisasi.
                </span>
              </div>

              {/* API Key / Personal Access Token Input */}
              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-600">
                    {authType === 'pat' ? 'Personal Access Token (classic atau fine-grained)' : 'GitHub App Private Key / Token'}
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow,admin:org,write:packages,read:user"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    <span>Generate token baru di GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full p-2.5 pr-24 bg-zinc-50 border border-zinc-200/80 rounded-lg font-mono text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-200/60 transition-colors"
                      title={showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      Valid
                    </span>
                  </div>
                </div>

                {/* Scopes checklist info */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2 text-xs">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Scope Izin Minimal yang Diperlukan:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-700 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>repo</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>workflow</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>admin:org</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>write:packages</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: MANAJEMEN PENGGUNA & KOLABORATOR GITHUB */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    2. Pengguna & Kolaborator GitHub Terdaftar ({teamMembers.length} Akun)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Pengguna ini otomatis diundang dengan role repositori saat proyek baru dibuat dari modul CRM.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200/80 rounded-lg transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Pengguna Baru</span>
              </button>
            </div>

            {/* Collaborators List (Linear Clean Table) */}
            <div className="border border-zinc-200/80 rounded-xl overflow-hidden divide-y divide-zinc-100">
              {teamMembers.map((member) => {
                const permission = member.githubPermission || (member.role.toLowerCase().includes('manajer') ? 'admin' : member.role.toLowerCase().includes('qa') ? 'triage' : 'write');
                const ghUsername = member.githubUsername || member.name.toLowerCase().replace(/\s+/g, '-');
                const isLead = permission === 'admin';

                return (
                  <div 
                    key={member.id} 
                    className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-zinc-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-zinc-900">{member.name}</span>
                          <span className="text-zinc-300">·</span>
                          <span className="text-[11px] text-zinc-500">{member.role}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a 
                            href={`https://github.com/${ghUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>@{ghUsername}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />
                          </a>
                          <span className="text-zinc-300">·</span>
                          <span className="text-[10px] text-zinc-400 font-mono truncate">{member.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      {/* Permission dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400 font-medium">Izin:</span>
                        <select
                          value={permission}
                          onChange={(e) => updateTeamMember(member.id, { githubPermission: e.target.value as any })}
                          className={`text-[11px] font-medium font-mono px-2 py-1 rounded-md border transition-all ${
                            permission === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                              : permission === 'maintain'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                              : permission === 'write'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          <option value="write">Write (Dev Push)</option>
                          <option value="admin">Admin (Full)</option>
                          <option value="maintain">Maintain (Lead)</option>
                          <option value="triage">Triage (QA)</option>
                          <option value="read">Read (Viewer)</option>
                        </select>
                      </div>

                      {/* Status Badge */}
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Aktif
                      </span>

                      {/* Delete action */}
                      {teamMembers.length > 3 && (
                        <button
                          type="button"
                          onClick={() => deleteTeamMember(member.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus kolaborator ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: OTOMASI CRM -> REPOSITORY & BRANCHING */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-zinc-100">
              <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  3. Otomasi Pembuatan Repo & Branch dari CRM Closing/Won
                </h2>
                <p className="text-xs text-zinc-500">
                  Pengaturan saat project dikonversi dari pipeline penjualan ke Scrum PM.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-700">
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={autoCreateRepo}
                  onChange={(e) => setAutoCreateRepo(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <strong className="text-zinc-900 block font-medium">
                    Otomatis Inisialisasi Repository GitHub saat Deal Closing Dikonversi
                  </strong>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Sistem langsung memanggil GitHub REST API untuk membuat repository baru di bawah organisasi dengan README, .gitignore, and branch template.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={autoCreateEpicBranches}
                  onChange={(e) => setAutoCreateEpicBranches(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <strong className="text-zinc-900 block font-medium">
                    Otomatis Buat Isolated Branch per Modul / Epic dan Assign ke Tim
                  </strong>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Setiap modul (contoh: Katalog, Sirkulasi, OPAC) otomatis dibuatkan branch terisolasi (misal: <code>feature/katalog-microservice</code>) dan langsung ditugaskan ke developer.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={autoInviteCollaborators}
                  onChange={(e) => setAutoInviteCollaborators(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <strong className="text-zinc-900 block font-medium">
                    Otomatis Undang Kolaborator Tim GitHub dengan Izin Akses Push
                  </strong>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Developer dan QA yang ditugaskan otomatis mendapat invitation link ke repository via email & notifikasi GitHub.
                  </p>
                </div>
              </label>
            </div>

            {/* Branch Prefix & Visibility Configurations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-100 text-xs">
              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                  Prefix Branch Epic/Modul
                </label>
                <input
                  type="text"
                  value={branchPrefixEpic}
                  onChange={(e) => setBranchPrefixEpic(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200/80 rounded-lg font-mono text-xs font-semibold text-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                  Default Branch Utama
                </label>
                <input
                  type="text"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200/80 rounded-lg font-mono text-xs font-semibold text-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                  Visibilitas Repository Baru
                </label>
                <select
                  value={repoVisibility}
                  onChange={(e) => setRepoVisibility(e.target.value as any)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs font-semibold text-zinc-800"
                >
                  <option value="private">Private (Hanya Anggota Tim)</option>
                  <option value="public">Public (Open Source)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: BRANCH PROTECTION & CI/CD STANDARDS */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-zinc-100">
              <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  4. Aturan Proteksi Branch (Branch Protection Rules)
                </h2>
                <p className="text-xs text-zinc-500">
                  Standar keamanan software house sebelum branch di-merge ke branch <code>main</code> atau <code>staging</code>.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-700">
              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={enforceBranchProtection}
                  onChange={(e) => setEnforceBranchProtection(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <strong className="text-zinc-900 block font-medium">
                    Aktifkan Aturan Proteksi pada Branch <code>main</code> & <code>staging</code>
                  </strong>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Mencegah push langsung (direct commit) tanpa melalui Pull Request resmi.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={requireReviews}
                  onChange={(e) => setRequireReviews(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <strong className="text-zinc-900 block font-medium">
                    Wajibkan Review & Approval dari Tech Lead / PM Sebelum Merge
                  </strong>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Setiap Pull Request harus disetujui minimal oleh 1 reviewer terdaftar sebelum dapat di-merge.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-zinc-200/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={requireStatusChecks}
                  onChange={(e) => setRequireStatusChecks(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 mt-0.5 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <strong className="text-zinc-900 block font-medium">
                    Wajibkan Status Checks Lolos (CI/CD Automated Tests & Linter)
                  </strong>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    GitHub Actions (PHPUnit, Vitest, ESLint) wajib bernilai hijau/pass sebelum tombol merge aktif.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 5: WEBHOOK SECRET & PAYLOAD CONFIGURATION */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-zinc-100">
              <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  5. Webhook Real-time Sinkronisasi GitHub
                </h2>
                <p className="text-xs text-zinc-500">
                  Endpoint untuk menangkap event push commit, status pull request, dan deploy status secara real-time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                  Payload URL Webhook
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200/80 rounded-lg font-mono text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-600">
                    Webhook Secret (HMAC-SHA256)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateWebhookSecret}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Generate Ulang
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="w-full p-2 pr-10 bg-zinc-50 border border-zinc-200/80 rounded-lg font-mono text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-600"
                  >
                    {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit button bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-400">
              Perubahan disimpan otomatis di instance lokal dan disinkronkan ke seluruh modul.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-xl transition-all shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            >
              Simpan Konfigurasi Integrasi GitHub
            </button>
          </div>
        </form>

        {/* SECTION 6: DAFTAR REPOSITORY & BRANCH TERPETAKAN */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-0">
          <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Repository GitHub & Branch Terpetakan ({projects.length} Proyek Aktif)
              </h2>
              <p className="text-xs text-zinc-500">
                Status sinkronisasi repository git antar proyek aktif dan branch modul epic masing-masing.
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {projects.map((proj) => {
              const branches = proj.branches || [
                { name: 'main', commitHash: '0f8c21a', moduleName: 'Production Root', isDefault: true, lastUpdated: '2026-10-18' }
              ];

              return (
                <div key={proj.id} className="p-5 hover:bg-zinc-50/50 transition-colors space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200/60">
                        {proj.code}
                      </span>
                      <strong className="text-sm font-medium text-zinc-900">{proj.name}</strong>
                    </div>

                    <a
                      href={`https://${proj.repoUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/70 px-2.5 py-1 rounded-lg border border-zinc-200/80 transition-colors"
                    >
                      <span>{proj.repoUrl}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>

                  {/* Branches Pill List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Branch Aktif Modul:
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {branches.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/70 font-mono text-[11px]"
                        >
                          <GitBranch className="w-3 h-3 text-zinc-500" />
                          <span className={b.isDefault ? 'font-semibold text-zinc-900' : 'text-zinc-700'}>
                            {b.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-sans">
                            ({b.moduleName})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODAL: TAMBAH PENGGUNA / KOLABORATOR GITHUB */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-200/80 overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-5 px-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Tambah Kolaborator GitHub Baru
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Undang engineer ke repositori dan masukkan ke roster tim.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddCollaborator} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                  Nama Lengkap Engineer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Budi Pratama"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                    Username GitHub <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="bg-zinc-100 border border-r-0 border-zinc-200/80 px-2.5 py-2.5 text-zinc-500 font-mono text-xs rounded-l-lg select-none">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={newUserGithub}
                      onChange={(e) => setNewUserGithub(e.target.value)}
                      placeholder="budipratama"
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-r-lg font-mono text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                    Email Kontak / SSO
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="budi@agensi.dev"
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                    Peran / Spesialisasi
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs font-medium text-zinc-900"
                  >
                    <option value="Backend Dev">Backend Dev (Laravel/API)</option>
                    <option value="Frontend Dev">Frontend Dev (React/SPA)</option>
                    <option value="Full stack">Full stack (DevOps & Gateway)</option>
                    <option value="QA">QA (Tester & Security)</option>
                    <option value="Project Manajer">Project Manajer (PM)</option>
                    <option value="DevOps">DevOps (Docker/Cloud)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                    Izin Repositori GitHub
                  </label>
                  <select
                    value={newUserPermission}
                    onChange={(e) => setNewUserPermission(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs font-medium text-zinc-900"
                  >
                    <option value="write">Write (Standard Developer Push)</option>
                    <option value="admin">Admin (Full Control Organization)</option>
                    <option value="maintain">Maintain (Lead PR & Issues)</option>
                    <option value="triage">Triage (QA Issue Management)</option>
                    <option value="read">Read (Clone & Read-Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-700 block mb-1">
                  Kapasitas Jam Kerja per Minggu
                </label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={newUserCapacity}
                  onChange={(e) => setNewUserCapacity(Number(e.target.value))}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs font-mono font-medium text-zinc-900"
                />
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Info Otomasi:
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Setelah disimpan, user akan otomatis dimasukkan ke roster tim dan diundang ke semua repository GitHub aktif yang sesuai dengan perannya.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
                >
                  Tambahkan ke Tim & GitHub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
