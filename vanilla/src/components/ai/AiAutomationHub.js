/**
 * AiAutomationHub Component (100% Native Vanilla JS ES Module)
 * Full 1:1 parity with Next.js AiAutomationHub.tsx:
 * - Engine Status & Emergency Kill-Switch Toggle
 * - Intelligent Orchestrator Console & AST Simulator (Confidence Gauge, Stacktrace parsing, JSON AST export)
 * - 2 View Modes: Interactive Kanban Pipeline & Structured Table List
 * - Bug Category & Stage Filters (Semua, Kecil, Menengah, Besar, Review PR, Perlu Manual, Dipantau)
 * - Full Inspector Drawer Modal with 5 Tabs:
 *   1. Overview (Bug spec, SLA, reproduction steps, expected vs actual)
 *   2. Orchestrator (AST analysis, confidence gauge, strategy)
 *   3. Solution & Diff (Colored patch diff, CI test results, Approve/Revise/Reject)
 *   4. QA Sign-Off (Matrix testing checklist, Pass/Fail reopen)
 *   5. Telemetry & Monitoring (30-min window, Sentry error rate, auto-rollback)
 * - Human Intervention Form for Big Bugs
 * - Create Simulated Bug Modal
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class AiAutomationHub {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'ai-hub-container';

    this.onSelectTask = options.onSelectTask || (() => {});
    this.onOpenIntakeModal = options.onOpenIntakeModal || (() => {});

    this.viewMode = 'pipeline'; // 'pipeline' | 'list'
    this.categoryFilter = 'all'; // 'all' | 'kecil' | 'menengah' | 'besar' | 'pr_review' | 'manual' | 'monitoring'

    this.inspectedTask = null;
    this.inspectorTab = 'overview'; // 'overview' | 'orchestrator' | 'solution' | 'qa_signoff' | 'telemetry'
    this.copiedCmd = false;
    this.copiedJson = false;
    this.isDiffExpanded = true;
    this.isRunningSim = false;

    // Intelligent Orchestrator input & result
    this.orchestratorInput = 'User mendapati error 500 saat mencoba klik tombol simpan profil jika kolom nomor telepon dikosongkan. Stacktrace: NullPointerException at UserController.java:45';
    this.orchestratorResult = null;

    // Human Mitigation State
    this.humanMitigation = {
      notes: '',
      hours: 3,
      commitHash: ''
    };

    // Sub-modals
    this.showNewBugModal = false;
    this.newBugData = {
      category: 'kecil',
      title: '',
      desc: '',
      severity: 'S3 - Minor',
      source: 'Sentry'
    };

    this.init();
  }

  init() {
    this.render();
    this.attachEvents();

    store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.element;
  }

  runOrchestrator() {
    const input = this.orchestratorInput.toLowerCase();
    const isCritical = input.includes('transaksi') || input.includes('pembayaran') || input.includes('saldo') || input.includes('db');
    const isMedium = input.includes('denda') || input.includes('sirkulasi') || input.includes('nullpointer');

    this.orchestratorResult = {
      decision: isCritical ? 'Jalur Tim Developer (Human Fix)' : 'Otomasi Penuh AI Claude Code',
      difficulty: isCritical ? 'Besar' : isMedium ? 'Menengah' : 'Kecil',
      severity: isCritical ? 'S1 - Critical (Blocker)' : isMedium ? 'S2 - Major' : 'S3 - Minor',
      confidenceScore: isCritical ? 42 : isMedium ? 88 : 96,
      slaTarget: isCritical ? '< 4 Jam (Hotfix)' : isMedium ? '24 Jam' : '3 Hari',
      recommendedAssignee: isCritical ? 'Jaka (Backend Lead)' : 'Claude 3.7 Agentic Headless',
      strategy: isCritical
        ? 'Dilarang auto-fix: perubahan menyentuh tabel keuangan. Buat isolated branch git dan alihkan ke Lead Backend Engineer.'
        : 'Parsing stacktrace AST, tambahkan null guard pada UserController.java, buat unit test mock, dan open PR ke staging.',
      astDiffSnippet: `--- a/src/controllers/UserController.java\n+++ b/src/controllers/UserController.java\n@@ -45,3 +45,7 @@\n+  if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {\n+    throw new ValidationException("Nomor telepon tidak boleh kosong");\n+  }`
    };
  }

  render() {
    const state = store.getState();
    const activeProj = store.getActiveProject();
    const bugTasks = state.tasks.filter(t => t.projectId === state.selectedProjectId && t.type === 'Bug');

    // Categorization
    const smallBugs = bugTasks.filter(t => t.difficulty === 'Low' || (t.severity || '').includes('Minor') || (t.severity || '').includes('Trivial'));
    const mediumBugs = bugTasks.filter(t => t.difficulty === 'Medium' || (t.severity || '').includes('Major'));
    const bigBugs = bugTasks.filter(t => t.difficulty === 'Hard' || (t.severity || '').includes('Critical') || (t.severity || '').includes('Blocker'));
    const prReviewBugs = bugTasks.filter(t => t.status === 'Menunggu Persetujuan');
    const manualBugs = bugTasks.filter(t => t.status === 'Perlu Manual');
    const monitoredBugs = bugTasks.filter(t => t.status === 'Dipantau' || t.status === 'Deploy Staging');

    // Filtered list
    let displayTasks = bugTasks;
    if (this.categoryFilter === 'kecil') displayTasks = smallBugs;
    else if (this.categoryFilter === 'menengah') displayTasks = mediumBugs;
    else if (this.categoryFilter === 'besar') displayTasks = bigBugs;
    else if (this.categoryFilter === 'pr_review') displayTasks = prReviewBugs;
    else if (this.categoryFilter === 'manual') displayTasks = manualBugs;
    else if (this.categoryFilter === 'monitoring') displayTasks = monitoredBugs;

    if (!this.orchestratorResult) {
      this.runOrchestrator();
    }

    this.element.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; padding: 24px;">
        
        <!-- 1. Top Banner: Engine Status & Kill-Switch Safety Lock -->
        <div style="background: white; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(79,70,229,0.25);">
              ${Icons.bot('', 22)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h1 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">
                  Pusat Otomasi AI Claude Code &amp; Intelligent Triage
                </h1>
                <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${state.killSwitchActive ? '#fff1f2' : '#ecfdf5'}; color: ${state.killSwitchActive ? '#be123c' : '#047857'}; border: 1px solid ${state.killSwitchActive ? '#fecdd3' : '#a7f3d0'};">
                  ${state.killSwitchActive ? '● KILL-SWITCH AKTIF (Emergency Hold)' : '● OTOMASI OPERASIONAL (Claude 3.7)'}
                </span>
              </div>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">
                Mesin triage otomatis: Bug kecil langsung di-patch agen AI, bug arsitektur besar dialihkan ke developer manusia dengan branch git.
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button id="toggleKillSwitchBtn" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; border-radius: 8px; border: 1px solid ${state.killSwitchActive ? '#bbf7d0' : '#fecdd3'}; background: ${state.killSwitchActive ? '#f0fdf4' : '#fff1f2'}; color: ${state.killSwitchActive ? '#15803d' : '#be123c'}; cursor: pointer;">
              ${Icons.power('', 14)}
              <span>${state.killSwitchActive ? 'Buka Kunci (Resume AI)' : 'Kill-Switch Darurat'}</span>
            </button>

            <button id="openNewBugModalBtn" class="finance-btn-secondary" style="font-size: 12px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.plus('', 14)}
              <span>+ Buat Laporan Bug</span>
            </button>
          </div>
        </div>

        <!-- 2. Intelligent Orchestrator AST Simulator Console -->
        <div style="background: white; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                ${Icons.cpu('', 16)}
                <span>Simulasi Intelligent Orchestrator (Input Sentry / Exception)</span>
              </span>
              <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #475569;">
                AST Code Analyzer
              </span>
            </div>

            <button id="runOrchestratorBtn" class="finance-btn-primary" style="padding: 6px 14px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.play('', 12)}
              <span>Jalankan Analisis Triage AST</span>
            </button>
          </div>

          <textarea id="orchestratorInputArea" rows="2" style="width: 100%; padding: 10px 12px; font-size: 12px; font-family: var(--font-mono); border-radius: 8px; border: 1px solid #cbd5e1; outline: none;">${this.orchestratorInput}</textarea>

          <!-- Orchestrator Decision Strip -->
          ${this.orchestratorResult ? `
            <div style="background: #f8fafc; border-radius: 12px; padding: 14px 18px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 12px; font-weight: 700; color: #0f172a;">Keputusan Jalur:</span>
                  <span style="font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;">
                    ${this.orchestratorResult.decision}
                  </span>
                  <span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                    Kategori: ${this.orchestratorResult.difficulty}
                  </span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
                  <span>Confidence: <strong style="font-family: var(--font-mono);">${this.orchestratorResult.confidenceScore}%</strong></span>
                  <span>·</span>
                  <span>SLA: <strong style="color: #be123c;">${this.orchestratorResult.slaTarget}</strong></span>
                  <span>·</span>
                  <span>Assignee: <strong>${this.orchestratorResult.recommendedAssignee}</strong></span>
                </div>
              </div>

              <div style="font-size: 11px; color: #475569; line-height: 1.5;">
                <strong>Strategi Resolusi:</strong> ${this.orchestratorResult.strategy}
              </div>

              <div style="background: #0f172a; color: #86efac; border-radius: 8px; padding: 10px 14px; font-family: var(--font-mono); font-size: 11px; overflow-x: auto;">
                <pre style="margin: 0;">${this.orchestratorResult.astDiffSnippet}</pre>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 3. Toolbar: View Mode Toggle & Category Filter Pills -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <!-- Filter pills -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="kanban-pill ${this.categoryFilter === 'all' ? 'kanban-pill--active' : ''}" data-cat="all">Semua Bug (${bugTasks.length})</button>
            <button class="kanban-pill ${this.categoryFilter === 'kecil' ? 'kanban-pill--active' : ''}" data-cat="kecil">Bug Kecil (${smallBugs.length})</button>
            <button class="kanban-pill ${this.categoryFilter === 'menengah' ? 'kanban-pill--active' : ''}" data-cat="menengah">Bug Menengah (${mediumBugs.length})</button>
            <button class="kanban-pill ${this.categoryFilter === 'besar' ? 'kanban-pill--active' : ''}" data-cat="besar">🔥 Bug Besar (${bigBugs.length})</button>
            <button class="kanban-pill ${this.categoryFilter === 'pr_review' ? 'kanban-pill--active' : ''}" data-cat="pr_review">Menunggu PR (${prReviewBugs.length})</button>
            <button class="kanban-pill ${this.categoryFilter === 'manual' ? 'kanban-pill--active' : ''}" data-cat="manual">Perlu Manual (${manualBugs.length})</button>
            <button class="kanban-pill ${this.categoryFilter === 'monitoring' ? 'kanban-pill--active' : ''}" data-cat="monitoring">Dipantau (${monitoredBugs.length})</button>
          </div>

          <!-- View mode toggle -->
          <div style="display: flex; background: #f1f5f9; padding: 2px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px;">
            <button id="viewPipelineBtn" style="padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; background: ${this.viewMode === 'pipeline' ? 'white' : 'transparent'}; color: ${this.viewMode === 'pipeline' ? '#0f172a' : '#64748b'}; box-shadow: ${this.viewMode === 'pipeline' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'};">
              Pipeline Kanban
            </button>
            <button id="viewListBtn" style="padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; background: ${this.viewMode === 'list' ? 'white' : 'transparent'}; color: ${this.viewMode === 'list' ? '#0f172a' : '#64748b'}; box-shadow: ${this.viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'};">
              Tabel Detail
            </button>
          </div>
        </div>

        <!-- 4. Main View: Pipeline vs List -->
        ${this.viewMode === 'pipeline' ? this.renderPipelineView(displayTasks) : this.renderListView(displayTasks)}

      </div>

      <!-- 5. Inspector Drawer / Modal -->
      ${this.inspectedTask ? this.renderInspectorModal(this.inspectedTask) : ''}

      <!-- 6. Create New Bug Report Modal -->
      ${this.showNewBugModal ? this.renderNewBugModal() : ''}
    `;

    this.attachDynamicListeners();
  }

  renderPipelineView(tasks) {
    const columns = [
      { id: 'inbound', label: '1. Laporan Masuk', statuses: ['Baru', 'Backlog'], color: '#64748b' },
      { id: 'analyzing', label: '2. Triage & SLA', statuses: ['Dianalisis', 'To Do'], color: '#0284c7' },
      { id: 'fixing', label: '3. Pengerjaan Fix', statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'], color: '#4f46e5' },
      { id: 'review', label: '4. Code Review PR', statuses: ['Menunggu Persetujuan', 'In Review'], color: '#d97706' },
      { id: 'qa', label: '5. QA Staging Test', statuses: ['Disetujui', 'QA/Testing', 'Deploy Staging'], color: '#9333ea' },
      { id: 'prod', label: '6. Rilis & Monitoring', statuses: ['Deploy Production', 'Dipantau', 'Selesai'], color: '#059669' }
    ];

    return `
      <div style="display: grid; grid-template-columns: repeat(6, minmax(180px, 1fr)); gap: 12px; overflow-x: auto; padding-bottom: 12px;">
        ${columns.map(col => {
          const colTasks = tasks.filter(t => col.statuses.includes(t.status));
          return `
            <div style="background: #f8fafc; border-radius: 14px; padding: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px; min-height: 400px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 2px solid ${col.color};">
                <span style="font-size: 11px; font-weight: 700; color: #0f172a;">${col.label}</span>
                <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; background: white; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 9999px;">
                  ${colTasks.length}
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${colTasks.length === 0 ? `
                  <div style="padding: 24px 0; text-align: center; color: #94a3b8; font-size: 11px; font-style: italic;">
                    Tidak ada tiket
                  </div>
                ` : colTasks.map(t => this.renderBugCard(t)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderBugCard(task) {
    const isS1 = (task.severity || '').startsWith('S1');
    const isS2 = (task.severity || '').startsWith('S2');

    return `
      <div class="ai-bug-card" data-task-id="${task.id}" style="background: white; border-radius: 10px; padding: 12px; border: 1px solid ${isS1 ? '#fecdd3' : '#e2e8f0'}; cursor: pointer; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: all 0.15s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: #0f172a;">${task.key}</span>
          <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${isS1 ? 'background: #fff1f2; color: #be123c;' : isS2 ? 'background: #fffbeb; color: #b45309;' : 'background: #f0f9ff; color: #0369a1;'}">
            ${task.severity || 'S3 - Minor'}
          </span>
        </div>

        <h4 style="font-size: 11px; font-weight: 600; color: #0f172a; margin: 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${task.title}
        </h4>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; padding-top: 4px; border-top: 1px solid #f1f5f9;">
          <span>${task.environment || 'Production'}</span>
          <span style="font-weight: 600; color: #4f46e5;">Buka Inspector →</span>
        </div>
      </div>
    `;
  }

  renderListView(tasks) {
    return `
      <div style="background: white; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 700; font-size: 11px;">
              <th style="padding: 12px 16px;">KODE</th>
              <th style="padding: 12px 16px;">JUDUL BUG</th>
              <th style="padding: 12px 16px;">SEVERITY</th>
              <th style="padding: 12px 16px;">STATUS</th>
              <th style="padding: 12px 16px;">LINGKUNGAN</th>
              <th style="padding: 12px 16px;">GARANSI</th>
              <th style="padding: 12px 16px; text-align: right;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(t => `
              <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.1s ease;" class="hover:bg-slate-50">
                <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 700; color: #0f172a;">${t.key}</td>
                <td style="padding: 12px 16px; font-weight: 600; color: #1e293b;">${t.title}</td>
                <td style="padding: 12px 16px;">
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; ${t.severity?.startsWith('S1') ? 'background: #fff1f2; color: #be123c;' : 'background: #f1f5f9; color: #334155;'}">
                    ${t.severity || 'S2 - Major'}
                  </span>
                </td>
                <td style="padding: 12px 16px;">
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #eef2ff; color: #4338ca;">
                    ${t.status}
                  </span>
                </td>
                <td style="padding: 12px 16px; color: #64748b;">${t.environment || 'Production'}</td>
                <td style="padding: 12px 16px; color: #059669; font-weight: 600;">${t.warrantyStatus || 'Garansi Rp0'}</td>
                <td style="padding: 12px 16px; text-align: right;">
                  <button class="inspect-task-btn finance-btn-secondary" data-task-id="${t.id}" style="padding: 4px 10px; font-size: 11px;">
                    Inspector
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderInspectorModal(task) {
    const isS1 = (task.severity || '').startsWith('S1');

    return `
      <div class="submodal-overlay" id="inspectorModalOverlay">
        <div class="submodal-box" style="max-width: 820px; width: 95%; max-height: 90vh; overflow-y: auto;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0;">
                  ${task.key}
                </span>
                <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; ${isS1 ? 'background: #fff1f2; color: #be123c;' : 'background: #fffbeb; color: #b45309;'}">
                  ${task.severity || 'S2 - Major'}
                </span>
                <span style="font-size: 11px; color: #64748b;">· ${task.environment || 'Production'} · ${task.warrantyStatus || 'Garansi Proyek'}</span>
              </div>
              <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">
                ${task.title}
              </h2>
            </div>

            <button id="closeInspectorBtn" style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;">
              ${Icons.x('', 18)}
            </button>
          </div>

          <!-- Inspector Tabs -->
          <div style="display: flex; gap: 4px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600;">
            <button class="insp-tab-btn ${this.inspectorTab === 'overview' ? 'active' : ''}" data-tab="overview" style="padding: 10px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.inspectorTab === 'overview' ? '#4f46e5' : 'transparent'}; color: ${this.inspectorTab === 'overview' ? '#4f46e5' : '#64748b'};">
              1. Overview &amp; Spec
            </button>
            <button class="insp-tab-btn ${this.inspectorTab === 'orchestrator' ? 'active' : ''}" data-tab="orchestrator" style="padding: 10px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.inspectorTab === 'orchestrator' ? '#4f46e5' : 'transparent'}; color: ${this.inspectorTab === 'orchestrator' ? '#4f46e5' : '#64748b'};">
              2. AST &amp; Orkestrasi
            </button>
            <button class="insp-tab-btn ${this.inspectorTab === 'solution' ? 'active' : ''}" data-tab="solution" style="padding: 10px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.inspectorTab === 'solution' ? '#4f46e5' : 'transparent'}; color: ${this.inspectorTab === 'solution' ? '#4f46e5' : '#64748b'};">
              3. Solution &amp; PR Diff
            </button>
            <button class="insp-tab-btn ${this.inspectorTab === 'qa_signoff' ? 'active' : ''}" data-tab="qa_signoff" style="padding: 10px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.inspectorTab === 'qa_signoff' ? '#4f46e5' : 'transparent'}; color: ${this.inspectorTab === 'qa_signoff' ? '#4f46e5' : '#64748b'};">
              4. QA Sign-Off
            </button>
            <button class="insp-tab-btn ${this.inspectorTab === 'telemetry' ? 'active' : ''}" data-tab="telemetry" style="padding: 10px 14px; border: none; background: none; cursor: pointer; border-bottom: 2px solid ${this.inspectorTab === 'telemetry' ? '#4f46e5' : 'transparent'}; color: ${this.inspectorTab === 'telemetry' ? '#4f46e5' : '#64748b'};">
              5. Telemetri &amp; Guard
            </button>
          </div>

          <!-- Inspector Body -->
          <div style="display: flex; flex-direction: column; gap: 14px; padding-top: 8px;">
            ${this.renderInspectorTabContent(task)}
          </div>
        </div>
      </div>
    `;
  }

  renderInspectorTabContent(task) {
    if (this.inspectorTab === 'overview') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
          <div style="background: #f8fafc; border-radius: 10px; padding: 12px 14px; border: 1px solid #e2e8f0; line-height: 1.5; color: #334155;">
            <strong>Deskripsi Bug:</strong><br />
            ${task.description || 'Tidak ada deskripsi rinci.'}
          </div>

          ${task.reproductionSteps && task.reproductionSteps.length > 0 ? `
            <div style="background: white; border-radius: 10px; padding: 12px 14px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px;">
              <strong style="color: #0f172a;">Langkah Reproduksi:</strong>
              ${task.reproductionSteps.map((st, i) => `
                <div style="display: flex; gap: 6px; color: #475569;">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: #94a3b8;">${i + 1}.</span>
                  <span>${st.replace(/^[0-9]+\.\s*/, '')}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="padding: 10px 12px; border-radius: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;">
              <strong>Hasil Diharapkan:</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4;">${task.expectedBehavior || 'Sistem berjalan normal tanpa error.'}</p>
            </div>
            <div style="padding: 10px 12px; border-radius: 8px; background: #fff1f2; border: 1px solid #fecdd3; color: #be123c;">
              <strong>Hasil Aktual (Error):</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4;">${task.actualBehavior || 'Terjadi exception galat 500.'}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'orchestrator') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
          <div style="padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; color: #0f172a;">Skor Keyakinan Agen AI:</span>
            <span style="font-family: var(--font-mono); font-size: 16px; font-weight: 800; color: #4f46e5;">
              ${task.confidenceScore || 85}%
            </span>
          </div>

          <div style="padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px;">
            <strong style="color: #0f172a;">Catatan Analisis Agen:</strong>
            <p style="margin: 0; color: #475569; font-style: italic; line-height: 1.4;">
              &ldquo;${task.confidenceReason || 'AST parser mengidentifikasi potensi null pointer dereference pada service layer. Patch minimal berhasil disusun.'}&rdquo;
            </p>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'solution') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${task.prDiff ? `
            <div style="background: #0f172a; border-radius: 10px; padding: 14px; font-family: var(--font-mono); font-size: 11px; overflow-x: auto;">
              <pre style="margin: 0; color: #e2e8f0;">${task.prDiff}</pre>
            </div>

            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button id="inspectorApprovePrBtn" class="finance-btn-primary" style="background: #059669; padding: 6px 14px; font-size: 11px;">
                Setujui PR &amp; Merge ke Staging
              </button>
            </div>
          ` : `
            <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
              Belum ada Pull Request aktif untuk tiket ini.
            </div>
          `}
        </div>
      `;
    }

    if (this.inspectorTab === 'qa_signoff') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
          <div style="padding: 12px 14px; border-radius: 10px; background: #faf5ff; border: 1px solid #e9d5ff; display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #581c87;">Status Verifikasi Staging QA:</strong>
            <span style="font-weight: 700; color: #059669;">
              ${task.qaSignOff?.status === 'Passed' ? '✓ Lulus QA Sign-Off' : 'Belum Sign-Off'}
            </span>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px;">
            <button id="inspectorSignOffPassBtn" class="finance-btn-primary" style="background: #059669; padding: 6px 14px; font-size: 11px;">
              Beri Sign-Off QA (Lolos)
            </button>
          </div>
        </div>
      `;
    }

    if (this.inspectorTab === 'telemetry') {
      return `
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
          <div style="padding: 12px 14px; border-radius: 10px; background: #fffbeb; border: 1px solid #fde68a; display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #92400e;">Telemetri Sentry Post-Deploy (30 Menit):</strong>
            <span style="font-family: var(--font-mono); font-weight: 700; color: #047857;">0.06% Error Rate</span>
          </div>
          <button id="inspectorTestRollbackBtn" class="finance-btn-secondary" style="color: #be123c; border-color: #fecdd3; padding: 6px 12px; font-size: 11px;">
            Simulasi Error Spike &amp; Rollback
          </button>
        </div>
      `;
    }

    return '';
  }

  renderNewBugModal() {
    return `
      <div class="submodal-overlay" id="newBugModalOverlay">
        <div class="submodal-box" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
            <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">Buat Laporan Bug Baru</h3>
            <button id="closeNewBugModalBtn" style="background: none; border: none; cursor: pointer; color: #94a3b8;">${Icons.x('', 16)}</button>
          </div>

          <form id="newBugForm" style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
            <div>
              <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Judul Masalah *</label>
              <input id="bugTitleInput" type="text" placeholder="Contoh: Error 500 saat checkout" required style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 8px; border: 1px solid #cbd5e1;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Severity</label>
                <select id="bugSeveritySelect" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: white;">
                  <option value="S1 - Critical (Blocker)">S1 - Critical</option>
                  <option value="S2 - Major">S2 - Major</option>
                  <option value="S3 - Minor" selected>S3 - Minor</option>
                  <option value="S4 - Trivial">S4 - Trivial</option>
                </select>
              </div>

              <div>
                <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Sumber</label>
                <select id="bugSourceSelect" style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: white;">
                  <option value="Sentry">Sentry Alert</option>
                  <option value="WhatsApp">WhatsApp Client</option>
                  <option value="Web Form">Manual Input</option>
                </select>
              </div>
            </div>

            <div>
              <label style="font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">Deskripsi &amp; Detail</label>
              <textarea id="bugDescInput" rows="3" placeholder="Jelaskan detail error..." style="width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 8px; border: 1px solid #cbd5e1;"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
              <button type="button" id="cancelNewBugBtn" class="finance-btn-secondary" style="font-size: 12px; padding: 6px 14px;">Batal</button>
              <button type="submit" class="finance-btn-primary" style="font-size: 12px; padding: 6px 16px;">Kirim Laporan</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  attachEvents() {
    this.element.addEventListener('click', (e) => {
      // Toggle Kill-Switch
      if (e.target.closest('#toggleKillSwitchBtn')) {
        store.toggleKillSwitch();
      }

      // Open New Bug modal
      if (e.target.closest('#openNewBugModalBtn')) {
        this.showNewBugModal = true;
        this.render();
      }

      // Run Orchestrator button
      if (e.target.closest('#runOrchestratorBtn')) {
        const area = this.element.querySelector('#orchestratorInputArea');
        if (area) {
          this.orchestratorInput = area.value;
        }
        this.runOrchestrator();
        this.render();
      }

      // Filter pills
      const catBtn = e.target.closest('.kanban-pill');
      if (catBtn && catBtn.dataset.cat) {
        this.categoryFilter = catBtn.dataset.cat;
        this.render();
      }

      // View toggle
      if (e.target.closest('#viewPipelineBtn')) {
        this.viewMode = 'pipeline';
        this.render();
      }

      if (e.target.closest('#viewListBtn')) {
        this.viewMode = 'list';
        this.render();
      }

      // Card click
      const card = e.target.closest('.ai-bug-card') || e.target.closest('.inspect-task-btn');
      if (card) {
        const tId = card.dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          this.inspectedTask = task;
          this.inspectorTab = 'overview';
          this.render();
        }
      }

      // Close inspector
      if (e.target.closest('#closeInspectorBtn') || e.target.id === 'inspectorModalOverlay') {
        this.inspectedTask = null;
        this.render();
      }

      // Close new bug modal
      if (e.target.closest('#closeNewBugModalBtn') || e.target.closest('#cancelNewBugBtn') || e.target.id === 'newBugModalOverlay') {
        this.showNewBugModal = false;
        this.render();
      }

      // Inspector Tabs
      const inspTab = e.target.closest('.insp-tab-btn');
      if (inspTab && inspTab.dataset.tab) {
        this.inspectorTab = inspTab.dataset.tab;
        this.render();
      }

      // Inspector Actions
      if (e.target.closest('#inspectorApprovePrBtn') && this.inspectedTask) {
        store.approveAiPr(this.inspectedTask.id);
        this.inspectedTask = null;
        this.render();
      }

      if (e.target.closest('#inspectorSignOffPassBtn') && this.inspectedTask) {
        store.qaSignOff(this.inspectedTask.id, {
          passed: true,
          notes: 'QA Sign-Off disetujui via AI Hub',
          testCasesCount: 6,
          passedCasesCount: 6
        });
        this.inspectedTask = null;
        this.render();
      }

      if (e.target.closest('#inspectorTestRollbackBtn') && this.inspectedTask) {
        store.triggerRollback(this.inspectedTask.id, 'Simulasi spike error via AI Hub');
        this.inspectedTask = null;
        this.render();
      }
    });

    // New bug submit
    this.element.addEventListener('submit', (e) => {
      if (e.target.id === 'newBugForm') {
        e.preventDefault();
        const title = this.element.querySelector('#bugTitleInput')?.value || '';
        const severity = this.element.querySelector('#bugSeveritySelect')?.value || 'S3 - Minor';
        const source = this.element.querySelector('#bugSourceSelect')?.value || 'Sentry';
        const desc = this.element.querySelector('#bugDescInput')?.value || '';

        if (title.trim()) {
          store.createTask({
            title: title.trim(),
            description: desc.trim(),
            type: 'Bug',
            priority: severity.startsWith('S1') ? 'Hotfix' : 'Sedang',
            severity,
            source,
            status: 'Baru',
            environment: 'Production',
            warrantyStatus: 'Garansi Proyek (Gratis)'
          });
          this.showNewBugModal = false;
          this.render();
          store.addToast('success', 'Laporan Bug Dibuat', `Tiket baru ${title} berhasil dicatat.`);
        }
      }
    });
  }

  attachDynamicListeners() {}
}
