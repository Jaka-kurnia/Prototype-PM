/**
 * BacklogView Component (100% Native Vanilla JS ES Module)
 * Setara Atlassian Jira Software Cloud Backlog & Sprint Planning:
 * - Left Collapsible Jira Epics Drawer with Epic Progress Bars & 1-Click Filtering
 * - Top Jira Breadcrumbs & Sprint Action Controls
 * - 5-Role Workload Matrix Cards (Jaka Backend, Aldyana Frontend, Parhan QA, Asisyah PM, Azi Fullstack)
 * - Tri-color Story Points / Hours Indicators (To Do, In Progress, Done)
 * - Active Sprint Container with "Selesaikan Sprint" (Complete Sprint) flow
 * - Backlog Pool Container with "Buat Sprint" trigger
 * - Inline Quick Issue Creation (+ Buat masalah)
 * - Jira Issue Rows with type icons, issue key links, epic tags, status lozenges, and assignees
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class BacklogView {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'backlog-view-container';

    this.onSelectTask = options.onSelectTask || ((task) => store.openTaskDetail(task));
    this.onOpenCreateTask = options.onOpenCreateTask || (() => store.openCreateTaskModal());

    this.filterAssignee = 'all';
    this.filterEpic = 'all';
    this.filterType = 'all';
    this.searchQuery = '';
    this.isEpicsPanelOpen = true;
    this.isSprintCollapsed = false;
    this.isBacklogCollapsed = false;

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

  getRoleBadge(roleName = '') {
    const r = roleName.toLowerCase();
    if (r.includes('backend')) {
      return { label: 'Backend Dev', bg: '#deebff', color: '#0747a6' };
    }
    if (r.includes('frontend')) {
      return { label: 'Frontend Dev', bg: '#e6fcff', color: '#008da6' };
    }
    if (r.includes('qa') || r.includes('test')) {
      return { label: 'QA Engineer', bg: '#eae6ff', color: '#403294' };
    }
    if (r.includes('manajer') || r.includes('manager') || r.includes('pm')) {
      return { label: 'Project Manajer', bg: '#fff0b3', color: '#172b4d' };
    }
    return { label: 'Full stack', bg: '#deebff', color: '#0052cc' };
  }

  getStatusBadge(status) {
    switch (status) {
      case 'Selesai':
        return { label: 'SELESAI', bg: '#e3fcef', color: '#006644' };
      case 'In Progress':
      case 'Diperbaiki Agen':
        return { label: 'IN PROGRESS', bg: '#deebff', color: '#0747a6' };
      case 'In Review':
      case 'Menunggu Persetujuan':
        return { label: 'IN REVIEW', bg: '#fff0b3', color: '#172b4d' };
      case 'QA/Testing':
      case 'Deploy Staging':
        return { label: 'QA STAGING', bg: '#eae6ff', color: '#403294' };
      case 'Perlu Manual':
      case 'Ditolak':
        return { label: 'PERLU MANUAL', bg: '#ffebe6', color: '#bf2600' };
      default:
        return { label: 'TO DO', bg: '#dfe1e6', color: '#42526e' };
    }
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const projectTasks = store.getProjectTasks();
    const projectSprints = (state.sprints || []).filter(s => s.projectId === state.selectedProjectId);
    const projectEpics = store.getProjectEpics();
    const teamMembers = state.teamMembers || [];

    const activeSprint = projectSprints.find(s => s.status === 'active') || projectSprints[0];

    const matchesFilters = (t) => {
      if (this.filterAssignee !== 'all' && t.assigneeId !== this.filterAssignee) return false;
      if (this.filterEpic !== 'all' && t.epicId !== this.filterEpic) return false;
      if (this.filterType !== 'all' && t.type !== this.filterType) return false;
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchesKey = t.key.toLowerCase().includes(q);
        const matchesTitle = t.title.toLowerCase().includes(q);
        if (!matchesKey && !matchesTitle) return false;
      }
      return true;
    };

    const activeSprintTasks = projectTasks.filter(t => t.sprintId === activeSprint?.id && matchesFilters(t));
    const backlogPoolTasks = projectTasks.filter(t => (!t.sprintId || t.sprintId !== activeSprint?.id) && matchesFilters(t));

    // Calculate story points / hours breakdown
    const calcBreakdown = (taskList) => {
      let todo = 0, inprog = 0, done = 0;
      taskList.forEach(t => {
        const h = t.estimateHours || 1;
        if (t.status === 'Selesai') done += h;
        else if (['In Progress', 'In Review', 'QA/Testing', 'Deploy Staging', 'Diperbaiki Agen'].includes(t.status)) inprog += h;
        else todo += h;
      });
      return { todo, inprog, done, total: todo + inprog + done };
    };

    const sprintPoints = calcBreakdown(activeSprintTasks);
    const backlogPoints = calcBreakdown(backlogPoolTasks);

    this.element.innerHTML = `
      <div class="jira-backlog-layout">
        
        <!-- 1. Left Jira Epics Panel (Collapsible) -->
        <aside class="jira-epics-panel ${this.isEpicsPanelOpen ? '' : 'collapsed'}">
          <div class="jira-epics-panel__header">
            <span class="jira-epics-panel__title">
              ${Icons.layers('', 14)}
              <span>Epik Proyek</span>
            </span>
            <button id="closeEpicsPanelBtn" class="jira-btn jira-btn--subtle" style="padding: 2px 6px;" title="Tutup Panel Epik">
              ${Icons.chevronLeft('', 14)}
            </button>
          </div>

          <div class="jira-epics-panel__list">
            <!-- All Issues Filter option -->
            <div class="jira-epic-item ${this.filterEpic === 'all' ? 'active' : ''}" data-epic-id="all">
              <div class="jira-epic-item__title-row">
                <span class="jira-epic-item__name">
                  <span>Semua Masalah</span>
                </span>
                <span style="font-size: 11px; font-weight: 700; color: #5e6c84;">${projectTasks.length}</span>
              </div>
            </div>

            <!-- Issues without Epic -->
            <div class="jira-epic-item ${this.filterEpic === 'none' ? 'active' : ''}" data-epic-id="none">
              <div class="jira-epic-item__title-row">
                <span class="jira-epic-item__name" style="color: #6b778c;">
                  <span>Tanpa Epik</span>
                </span>
                <span style="font-size: 11px; font-weight: 600; color: #6b778c;">
                  ${projectTasks.filter(t => !t.epicId).length}
                </span>
              </div>
            </div>

            <div style="height: 1px; background-color: #ebecf0; margin: 4px 0;"></div>

            <!-- List of Epics -->
            ${projectEpics.map(epic => {
              const epicTasks = projectTasks.filter(t => t.epicId === epic.id);
              const doneCount = epicTasks.filter(t => t.status === 'Selesai').length;
              const percentDone = epicTasks.length > 0 ? Math.round((doneCount / epicTasks.length) * 100) : 0;
              const isSelected = this.filterEpic === epic.id;

              return `
                <div class="jira-epic-item ${isSelected ? 'active' : ''}" data-epic-id="${epic.id}">
                  <div class="jira-epic-item__title-row">
                    <span class="jira-epic-item__name" title="${epic.title}">
                      <span style="width: 10px; height: 10px; border-radius: 2px; background-color: ${epic.color}; flex-shrink: 0;"></span>
                      <span style="overflow: hidden; text-overflow: ellipsis;">${epic.title}</span>
                    </span>
                    <span style="font-size: 11px; font-weight: 700; color: #5e6c84; font-family: var(--font-mono);">
                      ${doneCount}/${epicTasks.length}
                    </span>
                  </div>

                  <div class="jira-epic-item__bar">
                    <div class="jira-epic-item__bar-fill" style="width: ${percentDone}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom Add Epic Action -->
          <div style="padding: 10px 12px; border-top: 1px solid var(--jira-border, #dfe1e6); background-color: #fafbfc;">
            <button id="addEpicBtn" class="jira-btn jira-btn--default" style="width: 100%; font-size: 12px; justify-content: center; gap: 6px;">
              ${Icons.plus('', 14)}
              <span>+ Buat Epik Baru</span>
            </button>
          </div>
        </aside>

        <!-- 2. Main Work Area -->
        <main class="jira-backlog-main">
          
          <!-- Top Header & Breadcrumb -->
          <div class="jira-backlog-header">
            <div>
              <div class="jira-backlog-header__crumbs">
                <span>Proyek</span>
                <span>/</span>
                <span style="font-weight: 600; color: #172b4d;">${activeProject?.name || 'Perpustakaan Digital'}</span>
                <span>/</span>
                <span style="color: #0052cc; font-weight: 700;">Backlog</span>
              </div>
              <h1 class="jira-backlog-header__title">Backlog &amp; Perencanaan Sprint</h1>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="completeSprintBtn" class="jira-btn jira-btn--default" style="font-size: 12px; gap: 6px;">
                ${Icons.checkCircle('', 14)}
                <span>Selesaikan Sprint</span>
              </button>

              <button id="openCreateTaskBacklogBtn" class="jira-btn jira-btn--primary" style="font-size: 12px; gap: 6px;">
                ${Icons.plus('', 14)}
                <span>+ Buat Masalah</span>
              </button>
            </div>
          </div>

          <!-- Controls Bar (Filter Search, Epic Drawer Toggle, Quick Filters) -->
          <div class="jira-backlog-controls">
            <div class="jira-backlog-controls__left">
              ${!this.isEpicsPanelOpen ? `
                <button id="openEpicsPanelBtn" class="jira-btn jira-btn--default" style="font-size: 12px; gap: 6px;">
                  ${Icons.layers('', 14)}
                  <span>Tampilkan Epik</span>
                </button>
              ` : ''}

              <!-- Search input -->
              <div class="jira-filter-search">
                <span class="search-icon">${Icons.search('', 14)}</span>
                <input id="backlogSearchInput" type="text" placeholder="Cari di backlog..." value="${this.escapeHtml(this.searchQuery)}" />
              </div>

              <!-- Quick Filter Chips -->
              <div style="display: flex; gap: 6px; align-items: center;">
                <button class="jira-filter-chip ${this.filterType === 'all' && this.filterAssignee === 'all' ? 'active' : ''}" id="filterAllBtn">
                  Semua
                </button>
                <button class="jira-filter-chip ${this.filterAssignee === 'usr-2' ? 'active' : ''}" id="filterMyIssuesBtn">
                  Tugas Saya
                </button>
                <button class="jira-filter-chip ${this.filterType === 'Bug' ? 'active' : ''}" id="filterBugBtn">
                  <i class="fi fi-rr-flame"></i> Bug &amp; Hotfix
                </button>
              </div>

              ${this.filterEpic !== 'all' ? `
                <div style="font-size: 11px; font-weight: 600; color: #0052cc; background: #deebff; padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                  <span>Filter Epik: ${projectEpics.find(e => e.id === this.filterEpic)?.title || 'Dipilih'}</span>
                  <button id="clearEpicFilterBtn" style="border: none; background: none; color: #0052cc; cursor: pointer; padding: 0;"><i class="fi fi-rr-cross"></i></button>
                </div>
              ` : ''}
            </div>

            <div style="font-size: 12px; color: #5e6c84;">
              Total: <strong>${activeSprintTasks.length + backlogPoolTasks.length}</strong> tiket
            </div>
          </div>

          <!-- 3. 5-Role Workload Matrix Cards (PRD Section 6.5) -->
          <div class="jira-workload-matrix">
            <div class="jira-workload-matrix__header">
              <span style="display: flex; align-items: center; gap: 6px;">
                ${Icons.users('', 14)}
                <span>Matriks Kapasitas 5 Role Developer (Jira Resource Allocation):</span>
              </span>
              ${this.filterAssignee !== 'all' ? `
                <button id="resetRoleFilterBtn" style="font-size: 11px; font-weight: 600; color: #0052cc; background: none; border: none; cursor: pointer;">
                  Reset Filter Role
                </button>
              ` : ''}
            </div>

            <div class="jira-workload-grid">
              ${teamMembers.map(m => {
                const mTasks = projectTasks.filter(t => t.assigneeId === m.id);
                const mHours = mTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);
                const capLimit = m.capacity || 40;
                const capPercent = Math.min(Math.round((mHours / capLimit) * 100), 100);
                const roleBadge = this.getRoleBadge(m.role);
                const isSelected = this.filterAssignee === m.id;
                const isOverloaded = mHours > capLimit;

                return `
                  <div class="jira-workload-card ${isSelected ? 'active' : ''}" data-member-id="${m.id}" title="Klik untuk filter task ${m.name}">
                    <div class="jira-workload-card__top">
                      <div class="jira-workload-card__user">
                        <img src="${m.avatar}" alt="${m.name}" class="jira-workload-card__avatar" />
                        <span>${m.name}</span>
                      </div>
                      <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px; background: ${roleBadge.bg}; color: ${roleBadge.color}; text-transform: uppercase;">
                        ${roleBadge.label}
                      </span>
                    </div>

                    <div class="jira-workload-card__meta">
                      <span>${mTasks.length} tiket</span>
                      <span style="font-family: var(--font-mono); font-weight: 700; color: ${isOverloaded ? '#bf2600' : '#172b4d'};">
                        ${mHours}h / ${capLimit}h ${isOverloaded ? '<i class="fi fi-rr-triangle-warning"></i> Overload' : ''}
                      </span>
                    </div>

                    <div class="jira-workload-card__bar">
                      <div class="jira-workload-card__bar-fill" style="width: ${capPercent}%; background-color: ${isOverloaded ? '#bf2600' : capPercent > 75 ? '#ffab00' : '#36b37e'};"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4. Active Sprint Container -->
          <div class="jira-sprint-container">
            <div class="jira-sprint-header">
              <div class="jira-sprint-header__left">
                <button id="toggleSprintBtn" class="jira-sprint-toggle" title="Collapse / Expand Sprint">
                  ${this.isSprintCollapsed ? Icons.chevronRight('', 16) : Icons.chevronDown('', 16)}
                </button>
                <div class="jira-sprint-title">
                  <span>${activeSprint?.name || 'LIB Sprint 1 (Aktif)'}</span>
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #e3fcef; color: #006644;">
                    ● AKTIF
                  </span>
                </div>
                <span class="jira-sprint-dates">
                  ${activeSprint?.startDate || '12 Okt 2026'} - ${activeSprint?.endDate || '26 Okt 2026'} (14 Hari)
                </span>
              </div>

              <div class="jira-sprint-header__right">
                <!-- Jira Tri-color Points Lozenge -->
                <div class="jira-points-group" title="To Do: ${sprintPoints.todo}h, In Progress: ${sprintPoints.inprog}h, Done: ${sprintPoints.done}h">
                  <span class="jira-point-badge jira-point-badge--todo">${sprintPoints.todo}</span>
                  <span class="jira-point-badge jira-point-badge--inprogress">${sprintPoints.inprog}</span>
                  <span class="jira-point-badge jira-point-badge--done">${sprintPoints.done}</span>
                </div>

                <button class="jira-btn jira-btn--default" id="completeSprintHeaderBtn" style="font-size: 11px; padding: 4px 10px;">
                  Selesaikan Sprint
                </button>
              </div>
            </div>

            ${!this.isSprintCollapsed ? `
              <div class="jira-issue-list">
                ${activeSprintTasks.length === 0 ? `
                  <div style="padding: 24px; text-align: center; color: #6b778c; font-size: 12px; font-style: italic;">
                    Tidak ada masalah pada sprint ini. Tarik atau pindahkan tiket dari backlog di bawah.
                  </div>
                ` : activeSprintTasks.map(t => this.renderJiraIssueRow(t, teamMembers, projectEpics, true)).join('')}
              </div>

              <div class="jira-quick-create inline-create-trigger" data-sprint-id="${activeSprint?.id}">
                ${Icons.plus('', 14)}
                <span>+ Buat masalah di sprint ini</span>
              </div>
            ` : ''}
          </div>

          <!-- 5. Backlog Pool Container -->
          <div class="jira-backlog-container">
            <div class="jira-backlog-header-bar">
              <div class="jira-backlog-header__left">
                <button id="toggleBacklogBtn" class="jira-sprint-toggle" title="Collapse / Expand Backlog">
                  ${this.isBacklogCollapsed ? Icons.chevronRight('', 16) : Icons.chevronDown('', 16)}
                </button>
                <div class="jira-sprint-title">
                  <span>Backlog</span>
                  <span style="font-size: 11px; font-weight: 600; color: #5e6c84;">
                    (${backlogPoolTasks.length} masalah)
                  </span>
                </div>
              </div>

              <div class="jira-backlog-header__right">
                <!-- Jira Tri-color Points Lozenge -->
                <div class="jira-points-group">
                  <span class="jira-point-badge jira-point-badge--todo">${backlogPoints.todo}</span>
                  <span class="jira-point-badge jira-point-badge--inprogress">${backlogPoints.inprog}</span>
                  <span class="jira-point-badge jira-point-badge--done">${backlogPoints.done}</span>
                </div>

                <button class="jira-btn jira-btn--default" id="createSprintBtn" style="font-size: 11px; padding: 4px 10px;">
                  + Buat Sprint Baru
                </button>
              </div>
            </div>

            ${!this.isBacklogCollapsed ? `
              <div class="jira-issue-list">
                ${backlogPoolTasks.length === 0 ? `
                  <div style="padding: 24px; text-align: center; color: #6b778c; font-size: 12px; font-style: italic;">
                    Seluruh tiket telah dialokasikan ke sprint aktif.
                  </div>
                ` : backlogPoolTasks.map(t => this.renderJiraIssueRow(t, teamMembers, projectEpics, false, activeSprint?.id)).join('')}
              </div>

              <div class="jira-quick-create inline-create-trigger" data-sprint-id="">
                ${Icons.plus('', 14)}
                <span>+ Buat masalah di backlog</span>
              </div>
            ` : ''}
          </div>

        </main>
      </div>
    `;
  }

  renderJiraIssueRow(task, teamMembers, epics, isInSprint, activeSprintId) {
    const assignee = teamMembers.find(m => m.id === task.assigneeId);
    const epic = epics.find(e => e.id === task.epicId);
    const roleBadge = this.getRoleBadge(assignee?.role || '');
    const statusBadge = this.getStatusBadge(task.status);

    return `
      <div class="jira-issue-row" data-task-id="${task.id}">
        <div class="jira-issue-row__left">
          <span class="jira-issue-handle" title="Drag to reorder">${Icons.gripVertical('', 14)}</span>

          <span class="jira-issue-type-icon" title="Tipe: ${task.type}">
            ${task.type === 'Bug' ? Icons.bug('text-rose-600', 14) : task.type === 'Feature' ? Icons.sparkles('text-indigo-600', 14) : Icons.checkSquare('text-slate-400', 14)}
          </span>

          <a href="javascript:void(0)" class="jira-issue-key open-task-detail-link" data-task-id="${task.id}" title="Klik untuk membuka detail">
            ${task.key}
          </a>

          <span class="jira-issue-title open-task-detail-link" data-task-id="${task.id}" title="${this.escapeHtml(task.title)}">
            ${this.escapeHtml(task.title)}
          </span>

          ${epic ? `
            <span class="jira-issue-epic" style="background-color: ${epic.color}20; color: ${epic.color}; border: 1px solid ${epic.color}50;" title="Epik: ${epic.title}">
              ${epic.title}
            </span>
          ` : ''}

          <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px; background: ${roleBadge.bg}; color: ${roleBadge.color}; text-transform: uppercase; white-space: nowrap;">
            ${roleBadge.label}
          </span>
        </div>

        <div class="jira-issue-row__right">
          <span class="jira-issue-status" style="background-color: ${statusBadge.bg}; color: ${statusBadge.color};">
            ${statusBadge.label}
          </span>

          ${assignee ? `
            <img src="${assignee.avatar}" alt="${assignee.name}" title="${assignee.name} (${assignee.role})" class="jira-issue-avatar" />
          ` : `
            <span style="width: 22px; height: 22px; border-radius: 50%; background: #ebecf0; display: inline-flex; align-items: center; justify-content: center; color: #6b778c;" title="Unassigned">
              ${Icons.user('', 12)}
            </span>
          `}

          <span class="jira-issue-estimate" title="Estimasi jam">
            ${task.estimateHours || 1}h
          </span>

          ${isInSprint ? `
            <button class="jira-btn jira-btn--subtle move-task-btn" data-task-id="${task.id}" data-target-sprint="" style="font-size: 11px; padding: 3px 8px;" title="Keluarkan task ke Backlog Pool">
              Keluarkan
            </button>
          ` : `
            <button class="jira-btn jira-btn--default move-task-btn" data-task-id="${task.id}" data-target-sprint="${activeSprintId}" style="font-size: 11px; padding: 3px 10px;" title="Masukkan ke Sprint Aktif">
              + Ke Sprint
            </button>
          `}
        </div>
      </div>
    `;
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  attachEvents() {
    this.element.addEventListener('click', (e) => {
      // Toggle epics drawer
      if (e.target.closest('#closeEpicsPanelBtn')) {
        this.isEpicsPanelOpen = false;
        this.render();
        return;
      }
      if (e.target.closest('#openEpicsPanelBtn')) {
        this.isEpicsPanelOpen = true;
        this.render();
        return;
      }

      // Toggle sprint collapsible
      if (e.target.closest('#toggleSprintBtn')) {
        this.isSprintCollapsed = !this.isSprintCollapsed;
        this.render();
        return;
      }

      // Toggle backlog collapsible
      if (e.target.closest('#toggleBacklogBtn')) {
        this.isBacklogCollapsed = !this.isBacklogCollapsed;
        this.render();
        return;
      }

      // Open Create Task
      if (e.target.closest('#openCreateTaskBacklogBtn') || e.target.closest('.inline-create-trigger')) {
        this.onOpenCreateTask();
        return;
      }

      // Add Epic Button
      if (e.target.closest('#addEpicBtn')) {
        const title = prompt('Masukkan Judul Epik Baru (contoh: Modul Integrasi Pembayaran):');
        if (title && title.trim()) {
          const newEpic = {
            id: 'epic-' + Date.now(),
            projectId: store.getState().selectedProjectId,
            title: title.trim(),
            color: '#6554c0'
          };
          store.setState({ epics: [...store.getState().epics, newEpic] });
          store.addToast('success', 'Epik Berhasil Dibuat', `Epik "${title}" telah ditambahkan.`);
        }
        return;
      }

      // Create Sprint Button
      if (e.target.closest('#createSprintBtn')) {
        const sprintCount = (store.getState().sprints || []).length + 1;
        const newSprint = {
          id: 'sprint-' + Date.now(),
          projectId: store.getState().selectedProjectId,
          name: `LIB Sprint ${sprintCount}`,
          status: 'future',
          startDate: '2026-11-01',
          endDate: '2026-11-14'
        };
        store.setState({ sprints: [...store.getState().sprints, newSprint] });
        store.addToast('success', 'Sprint Dibuat', `Sprint "${newSprint.name}" berhasil ditambahkan.`);
        return;
      }

      // Complete Sprint
      if (e.target.closest('#completeSprintBtn') || e.target.closest('#completeSprintHeaderBtn')) {
        store.addToast('success', 'Sprint Dituntaskan!', 'Pekerjaan yang belum tuntas otomatis dialihkan ke sprint berikutnya.');
        return;
      }

      // Filter epic click
      const epicItem = e.target.closest('.jira-epic-item');
      if (epicItem) {
        this.filterEpic = epicItem.dataset.epicId;
        this.render();
        return;
      }

      // Clear epic filter
      if (e.target.closest('#clearEpicFilterBtn')) {
        this.filterEpic = 'all';
        this.render();
        return;
      }

      // Role filter card click
      const roleCard = e.target.closest('.jira-workload-card');
      if (roleCard) {
        const mId = roleCard.dataset.memberId;
        this.filterAssignee = this.filterAssignee === mId ? 'all' : mId;
        this.render();
        return;
      }

      // Reset role filter
      if (e.target.closest('#resetRoleFilterBtn')) {
        this.filterAssignee = 'all';
        this.render();
        return;
      }

      // Quick filter buttons
      if (e.target.closest('#filterAllBtn')) {
        this.filterType = 'all';
        this.filterAssignee = 'all';
        this.render();
        return;
      }
      if (e.target.closest('#filterMyIssuesBtn')) {
        this.filterAssignee = 'usr-2'; // Aldyana Frontend / current active user
        this.render();
        return;
      }
      if (e.target.closest('#filterBugBtn')) {
        this.filterType = this.filterType === 'Bug' ? 'all' : 'Bug';
        this.render();
        return;
      }

      // Open task detail link
      const taskLink = e.target.closest('.open-task-detail-link');
      if (taskLink) {
        const tId = taskLink.dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === tId);
        if (task) {
          this.onSelectTask(task);
        }
        return;
      }

      // Move task to / from sprint
      const moveBtn = e.target.closest('.move-task-btn');
      if (moveBtn) {
        const tId = moveBtn.dataset.taskId;
        const targetSprint = moveBtn.dataset.targetSprint || undefined;
        store.updateTask(tId, { sprintId: targetSprint });
        store.addToast('info', 'Task Dipindahkan', targetSprint ? 'Task dimasukkan ke sprint aktif.' : 'Task dikembalikan ke backlog pool.');
        return;
      }
    });

    // Search input event
    this.element.addEventListener('input', (e) => {
      if (e.target.id === 'backlogSearchInput') {
        this.searchQuery = e.target.value;
        const activeSprint = (store.getState().sprints || []).find(s => s.status === 'active');
        const activeSprintTasks = store.getProjectTasks().filter(t => t.sprintId === activeSprint?.id);
        const backlogPoolTasks = store.getProjectTasks().filter(t => !t.sprintId || t.sprintId !== activeSprint?.id);

        // Update list without losing focus
        const listContainers = this.element.querySelectorAll('.jira-issue-list');
        if (listContainers.length >= 2) {
          // Re-render
          this.render();
          const newSearchInput = this.element.querySelector('#backlogSearchInput');
          if (newSearchInput) {
            newSearchInput.focus();
            newSearchInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
          }
        }
      }
    });
  }
}
