/**
 * KanbanBoard Component (100% Native Vanilla JS ES Module)
 * Modeled after Atlassian Jira Software Cloud Board:
 * - Breadcrumbs & Board Header with Star Favorite
 * - Global Board Search with Clear
 * - Jira Assignee Avatar Filter Cluster (1-click avatar filter)
 * - Jira Quick Filter Chips: "Tugas Saya", "Diperbarui < 48 Jam" (PRD 3.3), "Bug Hotfix", "PR Review", "Belum Ditugaskan"
 * - Epics Filter Dropdown
 * - Full Swimlanes Support (PRD 6.4):
 *   1. Tanpa Swimlane (Standard Columns)
 *   2. Berdasarkan Epic (Accordion with color bars & progress)
 *   3. Berdasarkan Assignee (Roster rows)
 *   4. Berdasarkan Prioritas (Hotfix, Tinggi, Sedang, Rendah)
 * - WIP Limits with Visual Alert Violation (PRD 6.4)
 * - HTML5 Native Drag & Drop with Auto Status Update
 * - Milestone Progress Invoice (> 10%) Modal Trigger
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';
import { createTaskCard } from './TaskCard.js';
import { CreateMilestoneInvoiceModal } from './finance/CreateMilestoneInvoiceModal.js';

const KANBAN_COLUMNS = [
  {
    id: 'backlog',
    label: 'Backlog / Baru',
    statuses: ['Backlog', 'Baru'],
    headerClass: 'kanban-col__header--backlog'
  },
  {
    id: 'analysis_dev',
    label: 'Dianalisis & To Do',
    statuses: ['To Do', 'Dianalisis'],
    headerClass: 'kanban-col__header--analysis'
  },
  {
    id: 'in_progress',
    label: 'Pengerjaan (In Progress)',
    statuses: ['In Progress', 'Diperbaiki Agen', 'Perlu Manual'],
    headerClass: 'kanban-col__header--progress',
    limit: 6
  },
  {
    id: 'review_approval',
    label: 'Review / Persetujuan PR',
    statuses: ['In Review', 'Menunggu Persetujuan', 'Disetujui'],
    headerClass: 'kanban-col__header--review',
    limit: 5
  },
  {
    id: 'testing_deploy',
    label: 'QA & Deploy (Staging/Prod)',
    statuses: ['QA/Testing', 'Deploy Staging', 'Deploy Production', 'Dipantau'],
    headerClass: 'kanban-col__header--qa'
  },
  {
    id: 'done',
    label: 'Selesai & Diverifikasi',
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
    this.quickFilter = 'all'; // 'all' | 'my_issues' | 'recent_48h' | 'hotfix' | 'pr_review' | 'unassigned'
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
        // Match current role or default dev
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

    this.container.innerHTML = `
      <!-- 1. Jira Board Header -->
      <div class="kanban-board-header">
        <div class="kanban-board-breadcrumbs">
          <span>Proyek</span>
          <span>/</span>
          <span title="${projName}">${projName}</span>
          <span>/</span>
          <span style="font-weight: 600; color: var(--color-text-heading);">${projCode} Board</span>
        </div>

        <div class="kanban-board-title-row">
          <div class="kanban-board-title">
            <span>${projCode} Board</span>
            <button class="kanban-board-star-btn" title="Bintang Favorit">
              ${Icons.star('w-3.5 h-3.5', 14)}
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="kanbanInvoiceBtn" class="jira-btn ${progress > 10 ? 'jira-btn--primary' : 'jira-btn--default'}" style="font-size: 11px; padding: 4px 10px; height: 28px;">
              ${Icons.dollarSign('w-3 h-3', 12)}
              <span>Invoice Termin (${progress}%)</span>
            </button>

            <button id="kanbanAddTaskBtn" class="jira-btn jira-btn--primary" style="font-size: 11px; padding: 4px 12px; height: 28px;">
              <span style="font-size: 14px; line-height: 1; font-weight: bold;">+</span>
              <span>Buat Tiket</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Jira Filter Bar (Single-Row Proportional Toolbar) -->
      <div class="kanban-toolbar">
        <div class="kanban-toolbar__left">
          <!-- Search Box -->
          <div class="kanban-search">
            <span class="kanban-search__icon">${Icons.search('w-3.5 h-3.5', 13)}</span>
            <input
              type="text"
              id="kanbanSearchInput"
              class="kanban-search__input"
              placeholder="Cari task..."
              value="${state.searchQuery}"
            />
            ${state.searchQuery ? `<span id="kanbanClearSearchBtn" class="kanban-search__clear">${Icons.x('w-3 h-3', 12)}</span>` : ''}
          </div>

          <!-- Assignee Avatar Filter Cluster -->
          <div class="kanban-avatar-cluster" title="Filter berdasarkan Assignee">
            <button class="kanban-avatar-btn ${state.filterAssignee === 'all' ? 'kanban-avatar-btn--active' : ''}" data-assignee="all" style="background: white; font-size: 9px; font-weight: bold; color: var(--color-text-subtle);" title="Semua Tim">
              ALL
            </button>
            ${state.teamMembers.map((m) => `
              <button class="kanban-avatar-btn ${state.filterAssignee === m.id ? 'kanban-avatar-btn--active' : ''}" data-assignee="${m.id}" title="${m.name} (${m.role})">
                <img src="${m.avatar}" alt="${m.name}" />
              </button>
            `).join('')}
          </div>

          <!-- Quick Filters (Pills) -->
          <div class="kanban-pills">
            <button class="kanban-pill ${this.quickFilter === 'all' ? 'kanban-pill--active' : ''}" data-quick-filter="all">Semua</button>
            <button class="kanban-pill ${this.quickFilter === 'my_issues' ? 'kanban-pill--active' : ''}" data-quick-filter="my_issues">Tugas Saya</button>
            <button class="kanban-pill ${this.quickFilter === 'recent_48h' ? 'kanban-pill--active' : ''}" data-quick-filter="recent_48h" title="Status Diperbarui < 48 Jam">⏱️ &lt; 48 Jam</button>
            <button class="kanban-pill kanban-pill--rose ${this.quickFilter === 'hotfix' ? 'kanban-pill--active' : ''}" data-quick-filter="hotfix">🔥 Hotfix</button>
            <button class="kanban-pill ${this.quickFilter === 'pr_review' ? 'kanban-pill--active' : ''}" data-quick-filter="pr_review">PR Review</button>
          </div>
        </div>

        <div class="kanban-toolbar__right">
          <!-- Epic Dropdown -->
          ${projectEpics.length > 0 ? `
            <select id="kanbanEpicSelect" class="kanban-select">
              <option value="all">Semua Epic (${projectEpics.length})</option>
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
              <option value="epic" ${this.swimlaneMode === 'epic' ? 'selected' : ''}>Epik</option>
              <option value="assignee" ${this.swimlaneMode === 'assignee' ? 'selected' : ''}>Assignee</option>
              <option value="priority" ${this.swimlaneMode === 'priority' ? 'selected' : ''}>Prioritas</option>
            </select>
          </div>

          <!-- Ticket Count Stats -->
          <div class="kanban-stats">
            <span><strong>${filteredTasks.length}</strong> tiket</span>
          </div>

          <!-- Reset Filter -->
          ${(state.searchQuery || state.filterAssignee !== 'all' || state.filterEpic !== 'all' || this.quickFilter !== 'all') ? `
            <button id="kanbanResetBtn" class="jira-btn jira-btn--subtle" style="font-size: 10px; padding: 2px 6px; height: 24px;">
              Reset
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 3. Board Canvas & Swimlanes Container -->
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
      // Standard Columns Row
      const rowEl = document.createElement('div');
      rowEl.className = 'kanban-columns-row';
      this.renderColumnsInto(rowEl, filteredTasks, projectEpics);
      canvas.appendChild(rowEl);
    } else if (this.swimlaneMode === 'epic') {
      // Swimlanes by Epic
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

      // Issues without epic
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
      // Swimlanes by Assignee
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
      // Swimlanes by Priority
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
            <span class="kanban-col__title">${col.label}</span>
            <span class="kanban-col__wip-badge ${isOverWip ? 'kanban-col__wip-badge--over' : ''}">
              ${colTasks.length}${col.limit ? `/${col.limit}` : ''}
            </span>
          </div>
          <button class="kanban-col__add-btn" title="Tambah task ke kolom ${col.label}">
            <span style="font-size: 14px; font-weight: bold; line-height: 1;">+</span>
          </button>
        </div>
        ${isOverWip ? `
          <div class="kanban-col__wip-alert">
            ${Icons.alertTriangle('w-3 h-3', 12)}
            <span>Batas WIP terlampaui (Maks: ${col.limit})</span>
          </div>
        ` : ''}
      `;

      // Cards list
      const cardsList = document.createElement('div');
      cardsList.className = 'kanban-col__cards';

      if (colTasks.length === 0) {
        cardsList.innerHTML = `
          <div class="kanban-col__empty">
            <span>Kolom Kosong</span>
            <span style="font-size: 11px;">Drag tiket ke sini</span>
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
