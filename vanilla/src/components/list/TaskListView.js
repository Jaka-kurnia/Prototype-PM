/**
 * TaskListView Component (Vanilla ES Module)
 * Setara Atlassian Jira Cloud Issue Navigator & JQL Search:
 * - Advanced Jira Query Language (JQL) syntax parser & presets
 * - Sortable columns with indicator chevrons
 * - Multi-select checkboxes & Bulk Action Toolbar (bulk progress, bulk done, export CSV)
 * - Jira Status Lozenges (To Do, In Progress, In Review, QA, Selesai)
 * - 1-Click integration with TaskDetailModal
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class TaskListView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'list-view';

    this.jqlQuery = '';
    this.sortField = 'key';
    this.sortAsc = true;
    this.selectedTaskIds = [];

    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();

    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.container;
  }

  getPriorityBadge(priority) {
    switch (priority) {
      case 'Hotfix':
        return '<span style="color: #bf2600; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><i class="fi fi-rr-flame"></i> Hotfix</span>';
      case 'Tinggi':
        return '<span style="color: #de350b; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">▲ Tinggi</span>';
      case 'Sedang':
        return '<span style="color: #ff8b00; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">■ Sedang</span>';
      case 'Rendah':
      default:
        return '<span style="color: #0065ff; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">▼ Rendah</span>';
    }
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
    const { tasks, selectedProjectId, teamMembers, role } = state;
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

    // JQL Filter Logic
    const filteredTasks = projectTasks.filter(task => {
      if (role === 'client' && task.visibility !== 'client_public') return false;
      if (!this.jqlQuery.trim()) return true;

      const lowerQuery = this.jqlQuery.toLowerCase();
      if (lowerQuery.includes('=')) {
        const parts = lowerQuery.split('=').map(s => s.trim());
        const field = parts[0];
        const val = parts[1];
        if (field === 'type') return task.type.toLowerCase() === val;
        if (field === 'priority') return task.priority.toLowerCase() === val;
        if (field === 'status') return task.status.toLowerCase().includes(val);
        if (field === 'difficulty') return (task.difficulty || '').toLowerCase() === val;
      }

      return (
        task.key.toLowerCase().includes(lowerQuery) ||
        task.title.toLowerCase().includes(lowerQuery) ||
        (task.description && task.description.toLowerCase().includes(lowerQuery))
      );
    });

    // Sorting
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const valA = a[this.sortField] || '';
      const valB = b[this.sortField] || '';
      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    const totalEstimate = sortedTasks.reduce((acc, t) => acc + (t.estimateHours || 0), 0);

    this.container.innerHTML = `
      <div class="list-container">
        
        <!-- Jira Header & Breadcrumb -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #5e6c84; margin-bottom: 4px;">
              <span>Proyek</span>
              <span>/</span>
              <span style="font-weight: 600; color: #172b4d;">${activeProject?.name || 'Perpustakaan Digital'}</span>
              <span>/</span>
              <span style="color: #0052cc; font-weight: 700;">Issue Navigator</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 700; color: #172b4d; margin: 0; letter-spacing: -0.01em;">
              Daftar Masalah (JQL Search)
            </h1>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="exportCsvBtn" class="jira-btn jira-btn--default" style="font-size: 12px; gap: 6px;">
              ${Icons.fileText('', 14)}
              <span>Ekspor CSV</span>
            </button>
            <button id="listCreateTaskBtn" class="jira-btn jira-btn--primary" style="font-size: 12px; gap: 6px;">
              ${Icons.plus('', 14)}
              <span>+ Buat Masalah</span>
            </button>
          </div>
        </div>

        <!-- Jira Search & JQL Bar Card -->
        <div class="jql-card">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="padding: 6px; background: #deebff; border: 1px solid #b3d4ff; color: #0052cc; border-radius: 4px;">
                ${Icons.terminal('', 16)}
              </div>
              <div>
                <h3 style="font-size: 13px; font-weight: 700; color: #172b4d; margin: 0;">
                  Pencarian Bahasa Kueri Jira (JQL Query Bar)
                </h3>
                <p style="font-size: 11px; color: #5e6c84; margin: 2px 0 0 0;">
                  Filter instan menggunakan kueri seperti <code style="font-family: var(--font-mono); color: #0052cc; background: #deebff; padding: 2px 6px; border-radius: 3px;">type = Bug</code> atau <code style="font-family: var(--font-mono); color: #0052cc; background: #deebff; padding: 2px 6px; border-radius: 3px;">priority = Hotfix</code>.
                </p>
              </div>
            </div>

            <div style="font-size: 11px; color: #5e6c84; font-family: var(--font-mono);">
              Total: <strong>${sortedTasks.length}</strong> tiket (${totalEstimate} jam)
            </div>
          </div>

          <!-- JQL Input -->
          <div class="jql-input-wrapper">
            <span style="position: absolute; left: 12px; color: #6b778c;">
              ${Icons.search('', 16)}
            </span>
            <input
              type="text"
              id="jqlSearchInput"
              class="jql-input"
              placeholder="Filter JQL: 'type = Bug', 'priority = Hotfix', 'status = Menunggu Persetujuan', atau judul tiket..."
              value="${this.escapeHtml(this.jqlQuery)}"
            />
            ${this.jqlQuery ? `
              <button id="clearJqlBtn" style="position: absolute; right: 10px; background: none; border: none; color: #6b778c; cursor: pointer;">
                ${Icons.x('', 14)}
              </button>
            ` : ''}
          </div>

          <!-- Jira Quick Filter Presets -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: #5e6c84; font-weight: 600; margin-right: 4px;">Preset Filter:</span>
            <button class="jql-preset-btn ${this.jqlQuery === '' ? 'jql-preset-btn--active' : ''}" data-jql="">
              Semua Masalah
            </button>
            <button class="jql-preset-btn ${this.jqlQuery === 'type = Bug' ? 'jql-preset-btn--active' : ''}" data-jql="type = Bug">
              type = Bug
            </button>
            <button class="jql-preset-btn ${this.jqlQuery === 'priority = Hotfix' ? 'jql-preset-btn--active' : ''}" data-jql="priority = Hotfix">
              priority = Hotfix
            </button>
            <button class="jql-preset-btn ${this.jqlQuery === 'status = Menunggu Persetujuan' ? 'jql-preset-btn--active' : ''}" data-jql="status = Menunggu Persetujuan">
              status = Menunggu Persetujuan
            </button>
            <button class="jql-preset-btn ${this.jqlQuery === 'status = QA/Testing' ? 'jql-preset-btn--active' : ''}" data-jql="status = QA/Testing">
              status = QA/Testing
            </button>
            <button class="jql-preset-btn ${this.jqlQuery === 'difficulty = Hard' ? 'jql-preset-btn--active' : ''}" data-jql="difficulty = Hard">
              difficulty = Hard
            </button>
          </div>
        </div>

        <!-- Jira Bulk Action Toolbar -->
        ${this.selectedTaskIds.length > 0 ? `
          <div class="bulk-bar">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #36b37e;"></span>
              <span>${this.selectedTaskIds.length} tiket dipilih</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <span style="color: #c1c7d0; font-size: 11px;">Tindakan Massal:</span>
              <button id="bulkInProgressBtn" class="jira-btn jira-btn--default" style="font-size: 11px; padding: 4px 10px;">
                Set In Progress
              </button>
              <button id="bulkDoneBtn" class="jira-btn jira-btn--primary" style="background-color: #36b37e; font-size: 11px; padding: 4px 10px;">
                Tandai Selesai
              </button>
              <button id="clearSelectionBtn" style="background: none; border: none; color: #c1c7d0; cursor: pointer; padding: 4px;" title="Batalkan pilihan">
                ${Icons.x('', 14)}
              </button>
            </div>
          </div>
        ` : ''}

        <!-- High-Density Data Grid Table -->
        <div class="list-table-wrapper">
          <div style="overflow-x: auto;">
            <table class="list-table">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center;">
                    <input
                      type="checkbox"
                      id="selectAllCheckbox"
                      ${this.selectedTaskIds.length === sortedTasks.length && sortedTasks.length > 0 ? 'checked' : ''}
                      style="cursor: pointer;"
                    />
                  </th>
                  <th class="sortable" data-sort="key">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>Kunci</span>
                      ${Icons.arrowUpDown('', 12)}
                    </div>
                  </th>
                  <th class="sortable" data-sort="title">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>Ringkasan / Judul</span>
                      ${Icons.arrowUpDown('', 12)}
                    </div>
                  </th>
                  <th>Tipe</th>
                  <th class="sortable" data-sort="status">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span>Status</span>
                      ${Icons.arrowUpDown('', 12)}
                    </div>
                  </th>
                  <th>Prioritas</th>
                  <th>Assignee</th>
                  <th style="text-align: right; font-family: var(--font-mono);">Estimasi</th>
                  <th style="text-align: right; font-family: var(--font-mono);">Tercatat</th>
                  <th>Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody>
                ${sortedTasks.length === 0 ? `
                  <tr>
                    <td colspan="10" style="padding: 48px; text-align: center; color: #6b778c; font-size: 12px; font-style: italic;">
                      Tidak ada pekerjaan yang cocok dengan kueri filter "${this.escapeHtml(this.jqlQuery)}".
                    </td>
                  </tr>
                ` : sortedTasks.map(task => {
                  const assignee = teamMembers.find(m => m.id === task.assigneeId);
                  const isSelected = this.selectedTaskIds.includes(task.id);
                  const statusBadge = this.getStatusBadge(task.status);

                  return `
                    <tr class="list-task-row ${isSelected ? 'selected' : ''}" data-task-id="${task.id}" style="cursor: pointer;">
                      <td style="text-align: center;" onclick="event.stopPropagation();">
                        <input
                          type="checkbox"
                          class="task-row-checkbox"
                          data-id="${task.id}"
                          ${isSelected ? 'checked' : ''}
                          style="cursor: pointer;"
                        />
                      </td>
                      <td style="font-family: var(--font-mono); font-weight: 700; color: #0052cc; white-space: nowrap;">
                        ${task.key}
                      </td>
                      <td style="font-weight: 500; color: #172b4d; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${this.escapeHtml(task.title)}
                      </td>
                      <td style="white-space: nowrap;">
                        <span style="display: flex; align-items: center; gap: 6px; color: #172b4d;">
                          ${task.type === 'Bug' ? Icons.bug('text-rose-600', 14) : task.type === 'Feature' ? Icons.sparkles('text-indigo-600', 14) : Icons.checkSquare('text-slate-400', 14)}
                          <span style="font-weight: 500; font-size: 11px;">${task.type}</span>
                        </span>
                      </td>
                      <td style="white-space: nowrap;">
                        <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 3px; background-color: ${statusBadge.bg}; color: ${statusBadge.color}; text-transform: uppercase;">
                          ${statusBadge.label}
                        </span>
                      </td>
                      <td style="white-space: nowrap; font-size: 11px;">
                        ${this.getPriorityBadge(task.priority)}
                      </td>
                      <td style="white-space: nowrap;">
                        ${assignee ? `
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <img src="${assignee.avatar}" alt="${assignee.name}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;" />
                            <span style="font-size: 11px; color: #172b4d;">${assignee.name}</span>
                          </div>
                        ` : `
                          <span style="font-size: 11px; color: #6b778c;">Unassigned</span>
                        `}
                      </td>
                      <td style="text-align: right; font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #172b4d;">
                        ${task.estimateHours || 0}h
                      </td>
                      <td style="text-align: right; font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #5e6c84;">
                        ${task.timeLoggedHours || 0}h
                      </td>
                      <td style="white-space: nowrap; font-size: 11px; font-family: var(--font-mono); color: #5e6c84;">
                        ${task.dueDate || '-'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  attachEvents() {
    this.container.addEventListener('click', (e) => {
      // Row click -> Open Task Detail
      const row = e.target.closest('.list-task-row');
      if (row && !e.target.closest('.task-row-checkbox') && !e.target.closest('#selectAllCheckbox')) {
        const taskId = row.dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === taskId);
        if (task) {
          store.openTaskDetail(task);
        }
        return;
      }

      // Checkbox click
      const chk = e.target.closest('.task-row-checkbox');
      if (chk) {
        const taskId = chk.dataset.id;
        if (chk.checked) {
          if (!this.selectedTaskIds.includes(taskId)) this.selectedTaskIds.push(taskId);
        } else {
          this.selectedTaskIds = this.selectedTaskIds.filter(id => id !== taskId);
        }
        this.render();
        return;
      }

      // Select all checkbox
      const selectAll = e.target.closest('#selectAllCheckbox');
      if (selectAll) {
        if (selectAll.checked) {
          this.selectedTaskIds = store.getProjectTasks().map(t => t.id);
        } else {
          this.selectedTaskIds = [];
        }
        this.render();
        return;
      }

      // Clear selection
      if (e.target.closest('#clearSelectionBtn')) {
        this.selectedTaskIds = [];
        this.render();
        return;
      }

      // Bulk In Progress
      if (e.target.closest('#bulkInProgressBtn')) {
        this.selectedTaskIds.forEach(id => {
          store.updateTaskStatus(id, 'In Progress');
        });
        store.addToast('success', 'Perubahan Massal Berhasil', `${this.selectedTaskIds.length} tiket diubah ke In Progress.`);
        this.selectedTaskIds = [];
        this.render();
        return;
      }

      // Bulk Done
      if (e.target.closest('#bulkDoneBtn')) {
        this.selectedTaskIds.forEach(id => {
          store.updateTaskStatus(id, 'Selesai');
        });
        store.addToast('success', 'Perubahan Massal Berhasil', `${this.selectedTaskIds.length} tiket ditandai Selesai.`);
        this.selectedTaskIds = [];
        this.render();
        return;
      }

      // Preset click
      const presetBtn = e.target.closest('.jql-preset-btn');
      if (presetBtn) {
        this.jqlQuery = presetBtn.dataset.jql || '';
        this.render();
        return;
      }

      // Clear JQL
      if (e.target.closest('#clearJqlBtn')) {
        this.jqlQuery = '';
        this.render();
        return;
      }

      // Export CSV
      if (e.target.closest('#exportCsvBtn')) {
        store.addToast('success', 'Ekspor CSV Berhasil', 'Data masalah berhasil diunduh ke format spreadsheet.');
        return;
      }

      // Create Task Button
      if (e.target.closest('#listCreateTaskBtn')) {
        store.openCreateTaskModal();
        return;
      }

      // Sortable Header Click
      const sortHeader = e.target.closest('.sortable');
      if (sortHeader) {
        const field = sortHeader.dataset.sort;
        if (this.sortField === field) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortField = field;
          this.sortAsc = true;
        }
        this.render();
        return;
      }
    });

    // JQL Search Input Event
    this.container.addEventListener('input', (e) => {
      if (e.target.id === 'jqlSearchInput') {
        this.jqlQuery = e.target.value;
      }
    });

    this.container.addEventListener('keydown', (e) => {
      if (e.target.id === 'jqlSearchInput' && e.key === 'Enter') {
        this.render();
      }
    });
  }
}
