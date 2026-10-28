/**
 * KanbanBoard Component (100% Native Vanilla JS ES Module)
 * Enhanced Atlassian Jira Software Cloud Board with:
 * - Informative Multi-Tier Header:
 *   1. Project Breadcrumbs, Board Title, Star Favorite, Sprint Badge, Dates & Actions
 *   2. Workflow Stage Progress Strip (6 Stages: Backlog, To Do, In Progress, Review PR, QA Staging, Done)
 *   3. Active Sprint Goal & SLA Bug Guarantee Status Pill
 * - Quick Filter Bar: Search, Assignee Avatars, Flow Filter Pills, Epic Selector, Swimlane Selector
 * - Spacious Column & Card layout (no cramped text)
 * - 100% Flaticon Icons (Zero raw emojis)
 * - Full Native Drag & Drop with reactive status updates
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';
import { createTaskCard } from './TaskCard.js';
import { CreateMilestoneInvoiceModal } from './finance/CreateMilestoneInvoiceModal.js';

const KANBAN_COLUMNS = [
  {
    id: 'backlog',
    label: 'Backlog / Baru',
    stepNumber: '1',
    statuses: ['Backlog', 'Baru'],
    headerClass: 'kanban-col__header--backlog'
  },
  {
    id: 'analysis_dev',
    label: 'Dianalisis & To Do',
    stepNumber: '2',
    statuses: ['To Do', 'Dianalisis'],
    headerClass: 'kanban-col__header--analysis'
  },
  {
    id: 'in_progress',
    label: 'Pengerjaan (In Progress)',
    stepNumber: '3',
    statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'],
    headerClass: 'kanban-col__header--progress',
    limit: 6
  },
  {
    id: 'review_approval',
    label: 'Review / Persetujuan PR',
    stepNumber: '4',
    statuses: ['In Review', 'Menunggu Persetujuan', 'Disetujui'],
    headerClass: 'kanban-col__header--review',
    limit: 5
  },
  {
    id: 'testing_deploy',
    label: 'QA & Deploy (Staging/Prod)',
    stepNumber: '5',
    statuses: ['QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau'],
    headerClass: 'kanban-col__header--qa'
  },
  {
    id: 'done',
    label: 'Selesai & Diverifikasi',
    stepNumber: '6',
    statuses: ['Selesai'],
    headerClass: 'kanban-col__header--done'
  }
];

export class KanbanBoard {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'kanban-view';
    this.unsubscribe = null;

    // Local Board Controls State
    this.currentProjectId = store.getState().selectedProjectId;
    this.swimlaneMode = 'none'; // 'none' | 'epic' | 'assignee' | 'priority'
    this.quickFilter = 'all'; // 'all' | 'my_issues' | 'recent_48h' | 'hotfix' | 'pr_review' | 'qa_phase' | 'unassigned'
    this.collapsedSwimlanes = new Set();

    this.milestoneModal = new CreateMilestoneInvoiceModal();
    document.body.appendChild(this.milestoneModal.getElement());

    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe((state) => {
      if (state.selectedProjectId !== this.currentProjectId) {
        this.currentProjectId = state.selectedProjectId;
        this.render();
      } else {
        this.updateBoardData();
      }
    });
  }

  getFilteredTasksForBoard() {
    const state = store.getState();
    const projectTasks = store.getProjectTasks();
    const { searchQuery, filterAssignee, filterEpic } = state;

    return projectTasks.filter((task) => {
      // Client role visibility
      if (state.role === 'client' && task.visibility !== 'client_public') {
        return false;
      }

      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchKey = task.key ? task.key.toLowerCase().includes(q) : false;
        const matchTitle = task.title ? task.title.toLowerCase().includes(q) : false;
        const matchDesc = task.description ? task.description.toLowerCase().includes(q) : false;
        if (!matchKey && !matchTitle && !matchDesc) return false;
      }

      // Assignee filter
      if (filterAssignee !== 'all') {
        if (task.assigneeId !== filterAssignee) return false;
      }

      // Epic filter
      if (filterEpic !== 'all') {
        if (task.epicId !== filterEpic) return false;
      }

      // Quick Filters
      if (this.quickFilter === 'my_issues') {
        const currentUserDevId = state.role === 'pm' ? 'user-pm' : state.role === 'qa' ? 'user-qa' : 'user-dev-1';
        if (task.assigneeId !== currentUserDevId) return false;
      } else if (this.quickFilter === 'recent_48h') {
        if (!task.lastStatusUpdated) return false;
        const diffMs = Date.now() - new Date(task.lastStatusUpdated).getTime();
        if (diffMs > 48 * 3600000) return false;
      } else if (this.quickFilter === 'hotfix') {
        const isHotfix = task.priority === 'Hotfix' || (task.severity && task.severity.startsWith('S1'));
        if (!isHotfix) return false;
      } else if (this.quickFilter === 'pr_review') {
        if (task.status !== 'Menunggu Persetujuan' && task.status !== 'In Review') return false;
      } else if (this.quickFilter === 'qa_phase') {
        if (task.status !== 'QA/Testing' && task.status !== 'Deploy Staging') return false;
      } else if (this.quickFilter === 'unassigned') {
        if (task.assigneeId) return false;
      }

      return true;
    });
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const projectTasks = store.getProjectTasks();
    const projectEpics = store.getProjectEpics();
    const filteredTasks = this.getFilteredTasksForBoard();
    const progress = store.getProjectProgress(state.selectedProjectId);

    const projCode = activeProject ? activeProject.code : 'PROJ';
    const projName = activeProject ? activeProject.name : 'Sistem Software House';

    // Active Sprint Info
    const activeSprint = (state.sprints || []).find((s) => s.projectId === state.selectedProjectId && s.status === 'active') || {
      name: 'Sprint 1 (Aktif)',
      startDate: '2026-10-18',
      endDate: '2026-11-01',
      goal: 'Deliver REST API microservices katalog, Redis atomic lock untuk sirkulasi, dan OPAC React SPA'
    };

    // Calculate stage counts matching the 6 flow stages
    const countBacklog = projectTasks.filter((t) => ['Backlog', 'Baru'].includes(t.status)).length;
    const countTodo = projectTasks.filter((t) => ['To Do', 'Dianalisis'].includes(t.status)).length;
    const countInProgress = projectTasks.filter((t) => ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'].includes(t.status)).length;
    const countReview = projectTasks.filter((t) => ['In Review', 'Menunggu Persetujuan', 'Disetujui'].includes(t.status)).length;
    const countQA = projectTasks.filter((t) => ['QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau'].includes(t.status)).length;
    const countDone = projectTasks.filter((t) => t.status === 'Selesai').length;

    this.container.innerHTML = `
      <!-- ========================================================
           TIER 1: BOARD TITLE & WORKFLOW ACTION CONTROLS
           ======================================================== -->
      <div class="kanban-board-header">
        <div class="kanban-board-breadcrumbs">
          <span>Proyek</span>
          <span>/</span>
          <span title="${projName}">${projName}</span>
          <span>/</span>
          <span class="kanban-breadcrumb-code">${projCode} Board</span>
        </div>

        <div class="kanban-board-title-row">
          <div class="kanban-board-title-wrap">
            <h1 class="kanban-board-title">${projCode} Board</h1>
            
            <button class="kanban-board-star-btn" title="Tandai Bintang Favorit">
              ${Icons.star('w-4 h-4', 15)}
            </button>

            <!-- Active Sprint Badge -->
            <div class="kanban-sprint-badge" title="Sprint Aktif Saat Ini">
              <i class="fi fi-rr-flag"></i>
              <span>${activeSprint.name}</span>
            </div>

            <!-- Sprint Dates -->
            <div class="kanban-sprint-dates" title="Periode Sprint">
              <i class="fi fi-rr-calendar"></i>
              <span>${activeSprint.startDate} &ndash; ${activeSprint.endDate}</span>
            </div>
          </div>

          <!-- Header Action Buttons -->
          <div class="kanban-header-actions">
            <!-- SOP Guide Button -->
            <button id="kanbanSopGuideBtn" class="jira-btn jira-btn--default" title="Buka Dokumentasi SOP Alur Kerja">
              <i class="fi fi-rr-book-alt"></i>
              <span>Panduan SOP</span>
            </button>

            <!-- Simulator Button -->
            <button id="kanbanSimulasiBtn" class="jira-btn jira-btn--default" title="Simulasi Multi-Channel Intake (Telegram Bot / Sentry / Web Portal)">
              <i class="fi fi-rr-bolt" style="color: #f59e0b;"></i>
              <span>Simulasi Tiket</span>
            </button>

            <!-- Invoice Milestone Button -->
            <button id="kanbanInvoiceBtn" class="jira-btn ${progress >= 10 ? 'jira-btn--primary' : 'jira-btn--default'}" title="${progress >= 10 ? 'Terbitkan Invoice Termin (Syarat Progres ≥ 10% Terpenuhi)' : 'Invoice Termin Belum Dapat Diterbitkan (Syarat Progres Minimal ≥ 10%)'}">
              <i class="fi fi-rr-dollar"></i>
              <span>Invoice Termin (${progress}%)</span>
            </button>

            <!-- Primary Create Ticket Button -->
            <button id="kanbanAddTaskBtn" class="jira-btn jira-btn--primary" title="Buat Tiket Baru (Shortcut: 'c')">
              <i class="fi fi-rr-plus"></i>
              <span>Buat Tiket</span>
              <kbd class="kanban-btn-kbd">c</kbd>
            </button>
          </div>
        </div>

        <!-- ========================================================
             TIER 2: WORKFLOW STAGE PROGRESS & SLA BANNER
             ======================================================== -->
        <div class="kanban-flow-strip">
          <div class="kanban-flow-stages">
            <div class="kanban-flow-stage" title="Tahap 1: Laporan baru dan backlog backlog produk">
              <span class="kanban-stage-num">1</span>
              <span class="kanban-stage-name">Backlog</span>
              <span class="kanban-stage-count">${countBacklog}</span>
            </div>
            <i class="fi fi-rr-angle-small-right kanban-flow-arrow"></i>

            <div class="kanban-flow-stage" title="Tahap 2: Tiket yang telah dianalisis arsitektur dan siap dieksekusi">
              <span class="kanban-stage-num">2</span>
              <span class="kanban-stage-name">To Do</span>
              <span class="kanban-stage-count">${countTodo}</span>
            </div>
            <i class="fi fi-rr-angle-small-right kanban-flow-arrow"></i>

            <div class="kanban-flow-stage kanban-flow-stage--active" title="Tahap 3: Sedang dikerjakan oleh developer (Batas WIP: 6)">
              <span class="kanban-stage-num">3</span>
              <span class="kanban-stage-name">In Progress</span>
              <span class="kanban-stage-count kanban-stage-count--wip">${countInProgress}/6</span>
            </div>
            <i class="fi fi-rr-angle-small-right kanban-flow-arrow"></i>

            <div class="kanban-flow-stage" title="Tahap 4: Pull Request kode menunggu persetujuan review lead">
              <span class="kanban-stage-num">4</span>
              <span class="kanban-stage-name">Review PR</span>
              <span class="kanban-stage-count">${countReview}</span>
            </div>
            <i class="fi fi-rr-angle-small-right kanban-flow-arrow"></i>

            <div class="kanban-flow-stage" title="Tahap 5: Pengujian QA di server staging &amp; load testing K6">
              <span class="kanban-stage-num">5</span>
              <span class="kanban-stage-name">QA Staging</span>
              <span class="kanban-stage-count">${countQA}</span>
            </div>
            <i class="fi fi-rr-angle-small-right kanban-flow-arrow"></i>

            <div class="kanban-flow-stage kanban-flow-stage--done" title="Tahap 6: Lolos UAT dan diverifikasi selesai">
              <span class="kanban-stage-num">6</span>
              <span class="kanban-stage-name">Selesai</span>
              <span class="kanban-stage-count">${countDone}</span>
            </div>
          </div>

          <div class="kanban-flow-info">
            <span class="kanban-flow-pill kanban-flow-pill--sla" title="Ketentuan SLA S1 Respons 2 Jam &amp; Garansi 12 Bulan">
              <i class="fi fi-rr-shield-check"></i>
              <span>Garansi 12 Bulan Aktif</span>
            </span>
            <span class="kanban-flow-pill kanban-flow-pill--goal" title="Target Utama Sprint Ini">
              <i class="fi fi-rr-target"></i>
              <span><strong>Target:</strong> ${activeSprint.goal ? activeSprint.goal.slice(0, 75) + '...' : 'Selesaikan microservices katalog & OPAC React'}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- ========================================================
           TIER 3: FILTER & CONTROL TOOLBAR
           ======================================================== -->
      <div class="kanban-toolbar">
        <div class="kanban-toolbar__left">
          <!-- Quick Search -->
          <div class="kanban-search">
            <span class="kanban-search__icon">${Icons.search('w-3.5 h-3.5', 13)}</span>
            <input
              type="text"
              id="kanbanSearchInput"
              class="kanban-search__input"
              placeholder="Cari task, kode, atau isu..."
              value="${state.searchQuery}"
            />
            ${state.searchQuery ? `<span id="kanbanClearSearchBtn" class="kanban-search__clear">${Icons.x('w-3 h-3', 12)}</span>` : ''}
          </div>

          <!-- Assignee Avatar Filter Cluster -->
          <div class="kanban-avatar-cluster" title="Filter berdasarkan Assignee Engineer">
            <button class="kanban-avatar-btn ${state.filterAssignee === 'all' ? 'kanban-avatar-btn--active' : ''}" data-assignee="all" title="Semua Anggota Tim">
              ALL
            </button>
            ${state.teamMembers.map((m) => `
              <button class="kanban-avatar-btn ${state.filterAssignee === m.id ? 'kanban-avatar-btn--active' : ''}" data-assignee="${m.id}" title="${m.name} (${m.role})">
                <img src="${m.avatar}" alt="${m.name}" />
              </button>
            `).join('')}
          </div>

          <!-- Quick Filter Pills -->
          <div class="kanban-pills">
            <button class="kanban-pill ${this.quickFilter === 'all' ? 'kanban-pill--active' : ''}" data-quick-filter="all">Semua (${projectTasks.length})</button>
            <button class="kanban-pill ${this.quickFilter === 'my_issues' ? 'kanban-pill--active' : ''}" data-quick-filter="my_issues">Tugas Saya</button>
            <button class="kanban-pill ${this.quickFilter === 'recent_48h' ? 'kanban-pill--active' : ''}" data-quick-filter="recent_48h" title="Status Diperbarui < 48 Jam"><i class="fi fi-rr-clock"></i> &lt; 48 Jam</button>
            <button class="kanban-pill kanban-pill--rose ${this.quickFilter === 'hotfix' ? 'kanban-pill--active' : ''}" data-quick-filter="hotfix"><i class="fi fi-rr-flame"></i> Hotfix / S1</button>
            <button class="kanban-pill ${this.quickFilter === 'pr_review' ? 'kanban-pill--active' : ''}" data-quick-filter="pr_review">PR Review</button>
            <button class="kanban-pill ${this.quickFilter === 'qa_phase' ? 'kanban-pill--active' : ''}" data-quick-filter="qa_phase">QA Staging</button>
          </div>
        </div>

        <div class="kanban-toolbar__right">
          <!-- Epic Selector -->
          ${projectEpics.length > 0 ? `
            <select id="kanbanEpicSelect" class="kanban-select" title="Filter berdasarkan Modul Epik">
              <option value="all">Semua Epik (${projectEpics.length})</option>
              ${projectEpics.map((ep) => `
                <option value="${ep.id}" ${state.filterEpic === ep.id ? 'selected' : ''}>${ep.key}: ${ep.title}</option>
              `).join('')}
            </select>
          ` : ''}

          <!-- Swimlane Selector -->
          <div class="kanban-swimlane-control">
            <span style="font-size: 11px; color: var(--color-text-subtle);">Swimlane:</span>
            <select id="kanbanSwimlaneSelect" class="kanban-select" style="font-weight: 600;">
              <option value="none" ${this.swimlaneMode === 'none' ? 'selected' : ''}>Tanpa Swimlane</option>
              <option value="epic" ${this.swimlaneMode === 'epic' ? 'selected' : ''}>Berdasarkan Epik</option>
              <option value="assignee" ${this.swimlaneMode === 'assignee' ? 'selected' : ''}>Berdasarkan Assignee</option>
              <option value="priority" ${this.swimlaneMode === 'priority' ? 'selected' : ''}>Berdasarkan Prioritas</option>
            </select>
          </div>

          <!-- Total Count Stats -->
          <div class="kanban-stats">
            <span><strong>${filteredTasks.length}</strong> tiket</span>
          </div>

          <!-- Reset Filter Button -->
          ${(state.searchQuery || state.filterAssignee !== 'all' || state.filterEpic !== 'all' || this.quickFilter !== 'all') ? `
            <button id="kanbanResetBtn" class="jira-btn jira-btn--subtle" style="font-size: 11px; padding: 3px 8px; height: 26px;">
              Reset Filter
            </button>
          ` : ''}
        </div>
      </div>

      <!-- ========================================================
           BOARD CANVAS & COLUMNS (SPACIOUS WIDE COLUMNS WITH SCROLL)
           ======================================================== -->
      <div id="kanbanCanvasContainer" class="kanban-canvas"></div>
    `;

    this.attachEvents();
    this.renderCanvas();
  }

  renderCanvas() {
    const canvas = this.container.querySelector('#kanbanCanvasContainer');
    if (!canvas) return;

    const state = store.getState();
    const projectEpics = store.getProjectEpics();
    const filteredTasks = this.getFilteredTasksForBoard();

    canvas.innerHTML = '';

    if (this.swimlaneMode === 'none') {
      const rowEl = document.createElement('div');
      rowEl.className = 'kanban-columns-row';
      this.renderColumnsInto(rowEl, filteredTasks, projectEpics);
      canvas.appendChild(rowEl);
    } else if (this.swimlaneMode === 'epic') {
      projectEpics.forEach((ep) => {
        const epTasks = filteredTasks.filter((t) => t.epicId === ep.id);
        const isCollapsed = this.collapsedSwimlanes.has(ep.id);
        const swimlaneEl = this.createSwimlaneContainer(
          ep.id,
          `${ep.key} · ${ep.title}`,
          epTasks.length,
          ep.color,
          isCollapsed
        );

        if (!isCollapsed) {
          const rowEl = document.createElement('div');
          rowEl.className = 'kanban-columns-row';
          this.renderColumnsInto(rowEl, epTasks, projectEpics);
          swimlaneEl.appendChild(rowEl);
        }

        canvas.appendChild(swimlaneEl);
      });

      const noEpicTasks = filteredTasks.filter((t) => !t.epicId);
      if (noEpicTasks.length > 0) {
        const isCollapsed = this.collapsedSwimlanes.has('no-epic');
        const swimlaneEl = this.createSwimlaneContainer(
          'no-epic',
          'Tiket Tanpa Epic Modul',
          noEpicTasks.length,
          '#64748b',
          isCollapsed
        );

        if (!isCollapsed) {
          const rowEl = document.createElement('div');
          rowEl.className = 'kanban-columns-row';
          this.renderColumnsInto(rowEl, noEpicTasks, projectEpics);
          swimlaneEl.appendChild(rowEl);
        }

        canvas.appendChild(swimlaneEl);
      }
    } else if (this.swimlaneMode === 'assignee') {
      state.teamMembers.forEach((m) => {
        const mTasks = filteredTasks.filter((t) => t.assigneeId === m.id);
        if (mTasks.length === 0) return;
        const isCollapsed = this.collapsedSwimlanes.has(m.id);
        const swimlaneEl = this.createSwimlaneContainer(
          m.id,
          `${m.name} (${m.role})`,
          mTasks.length,
          '#0052cc',
          isCollapsed
        );

        if (!isCollapsed) {
          const rowEl = document.createElement('div');
          rowEl.className = 'kanban-columns-row';
          this.renderColumnsInto(rowEl, mTasks, projectEpics);
          swimlaneEl.appendChild(rowEl);
        }

        canvas.appendChild(swimlaneEl);
      });
    } else if (this.swimlaneMode === 'priority') {
      const priorities = ['Hotfix', 'Tinggi', 'Sedang', 'Rendah'];
      priorities.forEach((pri) => {
        const priTasks = filteredTasks.filter((t) => t.priority === pri);
        if (priTasks.length === 0) return;
        const isCollapsed = this.collapsedSwimlanes.has(pri);
        const color = pri === 'Hotfix' ? '#bf2600' : pri === 'Tinggi' ? '#ff5630' : pri === 'Sedang' ? '#ffab00' : '#36b37e';
        const swimlaneEl = this.createSwimlaneContainer(
          pri,
          `Prioritas: ${pri}`,
          priTasks.length,
          color,
          isCollapsed
        );

        if (!isCollapsed) {
          const rowEl = document.createElement('div');
          rowEl.className = 'kanban-columns-row';
          this.renderColumnsInto(rowEl, priTasks, projectEpics);
          swimlaneEl.appendChild(rowEl);
        }

        canvas.appendChild(swimlaneEl);
      });
    }
  }

  createSwimlaneContainer(id, title, count, badgeColor, isCollapsed) {
    const swimlane = document.createElement('div');
    swimlane.className = 'kanban-swimlane';

    swimlane.innerHTML = `
      <div class="kanban-swimlane__header" data-swimlane-id="${id}">
        <div class="kanban-swimlane__left">
          <span class="kanban-swimlane__arrow" style="${isCollapsed ? 'transform: rotate(-90deg);' : ''}">
            ${Icons.chevronDown('w-4 h-4', 16)}
          </span>
          <span style="border-left: 3px solid ${badgeColor}; padding-left: 8px;">${title}</span>
          <span class="kanban-swimlane__badge">${count}</span>
        </div>
        <div style="font-size: 11px; color: var(--color-text-subtle);">
          ${isCollapsed ? 'Klik untuk perluas swimlane' : 'Klik untuk ciutkan'}
        </div>
      </div>
    `;

    const header = swimlane.querySelector('.kanban-swimlane__header');
    header.addEventListener('click', () => {
      if (this.collapsedSwimlanes.has(id)) {
        this.collapsedSwimlanes.delete(id);
      } else {
        this.collapsedSwimlanes.add(id);
      }
      this.renderCanvas();
    });

    return swimlane;
  }

  renderColumnsInto(containerRow, tasksList, epicsList) {
    const state = store.getState();

    KANBAN_COLUMNS.forEach((col) => {
      const colTasks = tasksList.filter((t) => col.statuses.includes(t.status));
      const isOverWip = col.limit ? colTasks.length > col.limit : false;

      const colEl = document.createElement('div');
      colEl.className = `kanban-col ${isOverWip ? 'kanban-col--wip-exceeded' : ''}`;
      colEl.setAttribute('data-col-id', col.id);

      // Drag and drop listeners
      colEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        colEl.classList.add('kanban-col--dragover');
      });

      colEl.addEventListener('dragleave', () => {
        colEl.classList.remove('kanban-col--dragover');
      });

      colEl.addEventListener('drop', (e) => {
        e.preventDefault();
        colEl.classList.remove('kanban-col--dragover');
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
          store.updateTaskStatus(taskId, col.statuses[0]);
        }
      });

      // Header HTML
      colEl.innerHTML = `
        <div class="kanban-col__header ${col.headerClass}">
          <div class="kanban-col__title-wrapper">
            <span class="kanban-col__step-num">${col.stepNumber}</span>
            <span class="kanban-col__title">${col.label}</span>
            <span class="kanban-col__wip-badge ${isOverWip ? 'kanban-col__wip-badge--over' : ''}">
              ${colTasks.length}${col.limit ? `/${col.limit}` : ''}
            </span>
          </div>
          <button class="kanban-col__add-btn" title="Tambah tiket ke ${col.label}">
            <i class="fi fi-rr-plus" style="font-size: 11px;"></i>
          </button>
        </div>
        ${isOverWip ? `
          <div class="kanban-col__wip-alert">
            <i class="fi fi-rr-exclamation" style="font-size: 11px;"></i>
            <span>Batas WIP terlampaui (Maksimal: ${col.limit} pekerjaan)</span>
          </div>
        ` : ''}
      `;

      // Cards list container
      const cardsList = document.createElement('div');
      cardsList.className = 'kanban-col__cards';

      if (colTasks.length === 0) {
        cardsList.innerHTML = `
          <div class="kanban-col__empty">
            <i class="fi fi-rr-box-open" style="font-size: 20px; color: #cbd5e1; margin-bottom: 4px;"></i>
            <span>Kolom Kosong</span>
            <span style="font-size: 11px; color: #94a3b8;">Drag tiket ke sini untuk memindahkan</span>
          </div>
        `;
      } else {
        colTasks.forEach((task) => {
          const taskCardEl = createTaskCard(
            task,
            state.teamMembers,
            epicsList,
            (selectedTask) => store.openTaskDetail(selectedTask)
          );
          cardsList.appendChild(taskCardEl);
        });
      }

      colEl.appendChild(cardsList);

      const addBtn = colEl.querySelector('.kanban-col__add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          store.openCreateTaskModal();
        });
      }

      containerRow.appendChild(colEl);
    });
  }

  attachEvents() {
    // Search input
    const searchInput = this.container.querySelector('#kanbanSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        store.setSearchQuery(e.target.value);
      });
    }

    const clearSearch = this.container.querySelector('#kanbanClearSearchBtn');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        store.setSearchQuery('');
      });
    }

    // Assignee avatar filter cluster
    this.container.querySelectorAll('.kanban-avatar-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aId = btn.dataset.assignee;
        if (store.getState().filterAssignee === aId && aId !== 'all') {
          store.setFilterAssignee('all');
        } else {
          store.setFilterAssignee(aId);
        }
      });
    });

    // Quick filter pills
    this.container.querySelectorAll('.kanban-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const qf = pill.dataset.quickFilter;
        if (qf) {
          this.quickFilter = qf;
          this.render();
        }
      });
    });

    // Epic select
    const epicSelect = this.container.querySelector('#kanbanEpicSelect');
    if (epicSelect) {
      epicSelect.addEventListener('change', (e) => {
        store.setFilterEpic(e.target.value);
      });
    }

    // Swimlane select
    const swimlaneSelect = this.container.querySelector('#kanbanSwimlaneSelect');
    if (swimlaneSelect) {
      swimlaneSelect.addEventListener('change', (e) => {
        this.swimlaneMode = e.target.value;
        this.renderCanvas();
      });
    }

    // Reset filters button
    const resetBtn = this.container.querySelector('#kanbanResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.quickFilter = 'all';
        store.resetFilters();
      });
    }

    // SOP Guide button
    const sopGuideBtn = this.container.querySelector('#kanbanSopGuideBtn');
    if (sopGuideBtn) {
      sopGuideBtn.addEventListener('click', () => {
        const sopModal = document.querySelector('.sop-guide-modal') || document.querySelector('.modal-dialog--sop');
        if (sopModal) {
          sopModal.closest('.modal-overlay').classList.add('modal-overlay--open');
        } else {
          store.addToast('info', 'Panduan SOP', 'Buku panduan alur kerja software house dibuka.');
        }
      });
    }

    // Simulasi button
    const simulasiBtn = this.container.querySelector('#kanbanSimulasiBtn');
    if (simulasiBtn) {
      simulasiBtn.addEventListener('click', () => {
        store.openIntakeModal();
      });
    }

    // Invoice button
    const invoiceBtn = this.container.querySelector('#kanbanInvoiceBtn');
    if (invoiceBtn) {
      invoiceBtn.addEventListener('click', () => {
        this.milestoneModal.open(store.getState().selectedProjectId);
      });
    }

    // Add task button
    const addTaskBtn = this.container.querySelector('#kanbanAddTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        store.openCreateTaskModal();
      });
    }
  }

  updateBoardData() {
    this.renderCanvas();
  }

  getElement() {
    return this.container;
  }
}
