/**
 * CreateTaskModal Component (100% Native Vanilla JS ES Module)
 * Setara Atlassian Jira Cloud "Create Issue" Dialog:
 * - Target Project Selector
 * - Job Type Selector (Task, Feature/Story, Bug, Revisi, Maintenance)
 * - Jira Standard Fields: Summary (Judul), Description, Priority Lozenges
 * - Software House Bug Ticket Standard Specification (Severity S1-S4, Environment, Warranty, Reproduction Steps, Expected vs Actual)
 * - Dynamic Epic Module Picker based on Target Project
 * - Team Assignee (with 5-role model)
 * - Estimate Hours, Due Date, and Client/Internal Visibility
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';

export class CreateTaskModal {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'modal-backdrop';
    this.unsubscribe = null;

    // Form Local State
    const state = store.getState();
    this.projectId = state.selectedProjectId || 'proj-perpustakaan';
    this.type = 'Task';
    this.title = '';
    this.description = '';
    this.priority = 'Sedang';
    this.assigneeId = state.teamMembers[1]?.id || 'user-dev-1';
    this.epicId = '';
    this.estimateHours = 4;
    this.dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    this.visibility = 'client_public';

    // Bug tracking fields
    this.severity = 'S2 - Major';
    this.environment = 'Production';
    this.warrantyStatus = 'Garansi Proyek (Gratis)';
    this.reproStepsText = '';
    this.expectedBehavior = '';
    this.actualBehavior = '';

    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.update();
    });

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        store.closeCreateTaskModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && store.getState().isCreateTaskModalOpen) {
        store.closeCreateTaskModal();
      }
    });
  }

  update() {
    const isOpen = store.getState().isCreateTaskModalOpen;
    if (isOpen) {
      if (!this.container.classList.contains('modal-backdrop--open')) {
        this.projectId = store.getState().selectedProjectId;
        this.container.classList.add('modal-backdrop--open');
        this.render();
      }
    } else {
      this.container.classList.remove('modal-backdrop--open');
    }
  }

  render() {
    const state = store.getState();
    const projectEpics = state.epics.filter((e) => e.projectId === this.projectId);

    const priorityOptions = [
      { value: 'Hotfix', label: '🔥 Hotfix', colorClass: 'priority-hotfix' },
      { value: 'Tinggi', label: '▲ Tinggi', colorClass: 'priority-tinggi' },
      { value: 'Sedang', label: '■ Sedang', colorClass: 'priority-sedang' },
      { value: 'Rendah', label: '▼ Rendah', colorClass: 'priority-rendah' }
    ];

    this.container.innerHTML = `
      <div class="modal-dialog modal-dialog--create" style="max-width: 640px; width: 100%;">
        
        <!-- Jira Modal Header -->
        <div class="modal-header">
          <div class="modal-header__title-group">
            <div>
              <h2 style="font-size: 16px; font-weight: 700; color: #172b4d; margin: 0;">Buat Masalah (Create Issue)</h2>
              <p style="font-size: 11px; color: #5e6c84; margin: 2px 0 0 0;">
                Tambahkan task, fitur, bug, atau perbaikan ke backlog dan sprint aktif.
              </p>
            </div>
          </div>
          <button id="createModalCloseBtn" class="modal-header__close-btn" title="Batal (Esc)">
            ${Icons.x('', 16)}
          </button>
        </div>

        <!-- Form Body -->
        <form id="createTaskForm" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; max-height: calc(88vh - 120px); overflow-y: auto;">
          
          <!-- Project & Type Selector -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                Proyek Target *
              </label>
              <select id="taskTargetProjectSelect" style="width: 100%; font-size: 12px; font-weight: 600; color: #172b4d; background: #fafbfc; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 7px 10px;">
                ${state.projects.map((p) => `
                  <option value="${p.id}" ${p.id === this.projectId ? 'selected' : ''}>
                    ${p.code} · ${p.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                Tipe Masalah (Issue Type) *
              </label>
              <select id="taskTypeSelect" style="width: 100%; font-size: 12px; font-weight: 600; color: #172b4d; background: #fafbfc; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 7px 10px;">
                <option value="Task" ${this.type === 'Task' ? 'selected' : ''}>Task Standar</option>
                <option value="Feature" ${this.type === 'Feature' ? 'selected' : ''}>Feature (Fitur Baru)</option>
                <option value="Bug" ${this.type === 'Bug' ? 'selected' : ''}>Bug (Masalah / Kerusakan)</option>
                <option value="Revisi" ${this.type === 'Revisi' ? 'selected' : ''}>Revisi (Change Request)</option>
                <option value="Maintenance" ${this.type === 'Maintenance' ? 'selected' : ''}>Maintenance Berkala</option>
              </select>
            </div>
          </div>

          <!-- Summary / Title -->
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
              Ringkasan / Judul Pekerjaan *
            </label>
            <input
              type="text"
              id="taskTitleInput"
              required
              placeholder="Contoh: Sinkronisasi data stok barang multi-warehouse..."
              value="${this.escapeHtml(this.title)}"
              style="width: 100%; font-size: 13px; font-weight: 600; color: #172b4d; background: #ffffff; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 8px 10px;"
            />
          </div>

          <!-- Description -->
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
              Deskripsi
            </label>
            <textarea
              id="taskDescTextarea"
              rows="3"
              placeholder="Jelaskan kebutuhan fungsional, konteks teknis, atau catatan pengujian..."
              style="width: 100%; font-size: 12px; color: #172b4d; background: #ffffff; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 8px 10px;"
            >${this.escapeHtml(this.description)}</textarea>
          </div>

          <!-- Software House Bug Ticket Standard Specification (If Bug) -->
          ${this.type === 'Bug' ? `
            <div style="padding: 14px 16px; border-radius: 6px; border: 1px solid #ffbdad; background-color: #ffebe6; display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; color: #bf2600; font-weight: 700; font-size: 12px;">
                ${Icons.shieldAlert('', 16)}
                <span>Standar Tiket Bug Software House (SOP QA &amp; Triage)</span>
              </div>

              <!-- Severity & Environment & Warranty -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-size: 10px; font-weight: 700; color: #bf2600; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                    Keparahan (Severity) *
                  </label>
                  <select id="bugSeveritySelect" style="width: 100%; font-size: 11px; font-weight: 700; color: #172b4d; background: white; border: 1px solid #ffbdad; border-radius: 4px; padding: 6px 8px;">
                    <option value="S1 - Critical (Blocker)" ${this.severity === 'S1 - Critical (Blocker)' ? 'selected' : ''}>S1 - Critical (Blocker, SLA &lt; 4 Jam)</option>
                    <option value="S2 - Major" ${this.severity === 'S2 - Major' ? 'selected' : ''}>S2 - Major (Fitur Utama, SLA 24 Jam)</option>
                    <option value="S3 - Minor" ${this.severity === 'S3 - Minor' ? 'selected' : ''}>S3 - Minor (Workaround Ada, SLA 3 Hari)</option>
                    <option value="S4 - Trivial" ${this.severity === 'S4 - Trivial' ? 'selected' : ''}>S4 - Trivial (Kosmetik/Typo)</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 10px; font-weight: 700; color: #bf2600; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                    Lingkungan Terdampak *
                  </label>
                  <select id="bugEnvSelect" style="width: 100%; font-size: 11px; font-weight: 600; color: #172b4d; background: white; border: 1px solid #ffbdad; border-radius: 4px; padding: 6px 8px;">
                    <option value="Production" ${this.environment === 'Production' ? 'selected' : ''}>Production (Live Server)</option>
                    <option value="Staging" ${this.environment === 'Staging' ? 'selected' : ''}>Staging (Pre-Release)</option>
                    <option value="QA / Testing" ${this.environment === 'QA / Testing' ? 'selected' : ''}>QA / Testing Lab</option>
                    <option value="Development" ${this.environment === 'Development' ? 'selected' : ''}>Development Local</option>
                  </select>
                </div>

                <div>
                  <label style="font-size: 10px; font-weight: 700; color: #bf2600; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                    Kategori Biaya / Garansi *
                  </label>
                  <select id="bugWarrantySelect" style="width: 100%; font-size: 11px; font-weight: 600; color: #172b4d; background: white; border: 1px solid #ffbdad; border-radius: 4px; padding: 6px 8px;">
                    <option value="Garansi Proyek (Gratis)" ${this.warrantyStatus === 'Garansi Proyek (Gratis)' ? 'selected' : ''}>Garansi Proyek (Rp 0 - Bebas Biaya)</option>
                    <option value="Kuota Maintenance" ${this.warrantyStatus === 'Kuota Maintenance' ? 'selected' : ''}>Potong Kuota Retainer</option>
                    <option value="Non-Garansi (Billable)" ${this.warrantyStatus === 'Non-Garansi (Billable)' ? 'selected' : ''}>Non-Garansi (Ditagihkan)</option>
                  </select>
                </div>
              </div>

              <!-- Reproduction Steps -->
              <div>
                <label style="font-size: 10px; font-weight: 700; color: #172b4d; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                  Langkah-Langkah Reproduksi (Steps to Reproduce) *
                </label>
                <textarea
                  id="bugReproStepsTextarea"
                  rows="2"
                  placeholder="1. Masuk ke halaman kasir&#10;2. Masukkan diskon promo voucher&#10;3. Klik checkout"
                  style="width: 100%; font-size: 11px; font-family: monospace; color: #172b4d; background: white; border: 1px solid #dfe1e6; border-radius: 4px; padding: 6px 8px;"
                >${this.escapeHtml(this.reproStepsText)}</textarea>
              </div>

              <!-- Expected vs Actual -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-size: 10px; font-weight: 700; color: #172b4d; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                    Hasil yang Diharapkan (Expected)
                  </label>
                  <input
                    type="text"
                    id="bugExpectedInput"
                    placeholder="Contoh: Transaksi berhasil tanpa error 500"
                    value="${this.escapeHtml(this.expectedBehavior)}"
                    style="width: 100%; font-size: 11px; color: #172b4d; background: white; border: 1px solid #dfe1e6; border-radius: 4px; padding: 6px 8px;"
                  />
                </div>
                <div>
                  <label style="font-size: 10px; font-weight: 700; color: #172b4d; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                    Hasil Aktual yang Terjadi (Actual Error)
                  </label>
                  <input
                    type="text"
                    id="bugActualInput"
                    placeholder="Contoh: Tombol membeku, muncul error uncaught exception"
                    value="${this.escapeHtml(this.actualBehavior)}"
                    style="width: 100%; font-size: 11px; color: #172b4d; background: white; border: 1px solid #dfe1e6; border-radius: 4px; padding: 6px 8px;"
                  />
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Priority Selector -->
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 6px;">
              Prioritas
            </label>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
              ${priorityOptions.map((opt) => {
                const isSelected = this.priority === opt.value;
                let bgStyle = 'background: white; border-color: var(--jira-border, #dfe1e6); color: #5e6c84;';
                if (isSelected) {
                  if (opt.value === 'Hotfix') bgStyle = 'background: #ffebe6; border-color: #ffbdad; color: #bf2600; font-weight: 700;';
                  else if (opt.value === 'Tinggi') bgStyle = 'background: #fff0b3; border-color: #ffe380; color: #172b4d; font-weight: 700;';
                  else if (opt.value === 'Sedang') bgStyle = 'background: #fafbfc; border-color: #dfe1e6; color: #172b4d; font-weight: 700;';
                  else bgStyle = 'background: #fafbfc; border-color: #dfe1e6; color: #5e6c84; font-weight: 700;';
                }
                return `
                  <button
                    type="button"
                    class="priority-btn"
                    data-priority="${opt.value}"
                    style="padding: 7px; font-size: 12px; border-radius: 4px; border: 1px solid; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; transition: all 0.1s; ${bgStyle}"
                  >
                    <span>${opt.label}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Epic & Assignee -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                Tautkan ke Epik
              </label>
              <select id="taskEpicSelect" style="width: 100%; font-size: 12px; font-weight: 500; color: #172b4d; background: #fafbfc; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 7px 10px;">
                <option value="">(Tanpa Epik)</option>
                ${projectEpics.map((ep) => `
                  <option value="${ep.id}" ${ep.id === this.epicId ? 'selected' : ''}>
                    ${ep.title}
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                Assignee
              </label>
              <select id="taskAssigneeSelect" style="width: 100%; font-size: 12px; font-weight: 500; color: #172b4d; background: #fafbfc; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 7px 10px;">
                ${state.teamMembers.map((m) => `
                  <option value="${m.id}" ${m.id === this.assigneeId ? 'selected' : ''}>
                    ${m.name} (${m.role})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Estimates, Due Date & Visibility -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                Estimasi (Jam)
              </label>
              <input
                type="number"
                id="taskHoursInput"
                min="1"
                max="120"
                value="${this.estimateHours}"
                style="width: 100%; font-size: 12px; font-family: monospace; font-weight: 600; color: #172b4d; background: #fafbfc; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 7px 10px;"
              />
            </div>

            <div>
              <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                Jatuh Tempo (Due Date)
              </label>
              <input
                type="date"
                id="taskDueDateInput"
                value="${this.dueDate}"
                style="width: 100%; font-size: 12px; font-family: monospace; font-weight: 500; color: #172b4d; background: #fafbfc; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 7px 10px;"
              />
            </div>

            <div>
              <label style="font-size: 11px; font-weight: 700; color: #5e6c84; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 4px;">
                Visibilitas
              </label>
              <select id="taskVisibilitySelect" style="width: 100%; font-size: 12px; font-weight: 500; color: #172b4d; background: #fafbfc; border: 1px solid var(--jira-border, #dfe1e6); border-radius: 4px; padding: 7px 10px;">
                <option value="client_public" ${this.visibility === 'client_public' ? 'selected' : ''}>Publik (Klien)</option>
                <option value="internal" ${this.visibility === 'internal' ? 'selected' : ''}>Internal Saja</option>
              </select>
            </div>
          </div>

          <!-- Footer Actions -->
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding-top: 14px; border-top: 1px solid var(--jira-border, #dfe1e6); margin-top: 4px;">
            <button
              type="button"
              id="createModalCancelBtn"
              class="jira-btn jira-btn--default"
            >
              Batal
            </button>
            <button
              type="submit"
              class="jira-btn jira-btn--primary"
            >
              Buat Masalah
            </button>
          </div>
        </form>
      </div>
    `;

    this.attachEvents();
  }

  escapeHtml(text = '') {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#createModalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => store.closeCreateTaskModal());

    const cancelBtn = this.container.querySelector('#createModalCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => store.closeCreateTaskModal());

    // Project change: update epics
    const projectSelect = this.container.querySelector('#taskTargetProjectSelect');
    if (projectSelect) {
      projectSelect.addEventListener('change', (e) => {
        this.projectId = e.target.value;
        this.epicId = '';
        this.render();
      });
    }

    // Type change: toggle bug view
    const typeSelect = this.container.querySelector('#taskTypeSelect');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.type = e.target.value;
        this.render();
      });
    }

    // Priority buttons
    this.container.querySelectorAll('.priority-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.priority = btn.dataset.priority;
        this.render();
      });
    });

    // Form submit
    const form = this.container.querySelector('#createTaskForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleInput = this.container.querySelector('#taskTitleInput');
        const descInput = this.container.querySelector('#taskDescTextarea');
        const hoursInput = this.container.querySelector('#taskHoursInput');
        const dueDateInput = this.container.querySelector('#taskDueDateInput');
        const visSelect = this.container.querySelector('#taskVisibilitySelect');
        const assigneeSelect = this.container.querySelector('#taskAssigneeSelect');
        const epicSelect = this.container.querySelector('#taskEpicSelect');

        const title = titleInput ? titleInput.value.trim() : '';
        if (!title) return;

        const description = descInput ? descInput.value.trim() : '';
        const estimateHours = hoursInput ? Number(hoursInput.value) || 4 : 4;
        const dueDate = dueDateInput ? dueDateInput.value : '';
        const visibility = visSelect ? visSelect.value : 'client_public';
        const assigneeId = assigneeSelect ? assigneeSelect.value : '';
        const epicId = epicSelect ? epicSelect.value : '';

        // If bug, get bug fields
        let severity = undefined;
        let environment = undefined;
        let warrantyStatus = undefined;
        let reproductionSteps = undefined;
        let expectedBehavior = undefined;
        let actualBehavior = undefined;

        if (this.type === 'Bug') {
          const sevSelect = this.container.querySelector('#bugSeveritySelect');
          const envSelect = this.container.querySelector('#bugEnvSelect');
          const warSelect = this.container.querySelector('#bugWarrantySelect');
          const reproText = this.container.querySelector('#bugReproStepsTextarea');
          const expInput = this.container.querySelector('#bugExpectedInput');
          const actInput = this.container.querySelector('#bugActualInput');

          severity = sevSelect ? sevSelect.value : 'S2 - Major';
          environment = envSelect ? envSelect.value : 'Production';
          warrantyStatus = warSelect ? warSelect.value : 'Garansi Proyek (Gratis)';
          expectedBehavior = expInput ? expInput.value.trim() : undefined;
          actualBehavior = actInput ? actInput.value.trim() : undefined;

          if (reproText && reproText.value.trim()) {
            reproductionSteps = reproText.value
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }

        const taskPriority = this.type === 'Bug'
          ? (severity === 'S1 - Critical (Blocker)' ? 'Hotfix' : severity === 'S2 - Major' ? 'Tinggi' : 'Sedang')
          : this.priority;

        store.createTask({
          projectId: this.projectId,
          type: this.type,
          title,
          description,
          priority: taskPriority,
          severity,
          environment,
          warrantyStatus,
          reproductionSteps,
          expectedBehavior,
          actualBehavior,
          assigneeId,
          epicId: epicId || undefined,
          estimateHours,
          dueDate,
          visibility,
          source: 'Manual',
          status: this.type === 'Bug' ? 'Baru' : 'To Do'
        });

        // Reset form
        this.title = '';
        this.description = '';
        this.reproStepsText = '';
        this.expectedBehavior = '';
        this.actualBehavior = '';
      });
    }
  }

  getElement() {
    return this.container;
  }
}
