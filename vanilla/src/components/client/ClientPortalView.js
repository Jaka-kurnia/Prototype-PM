/**
 * ClientPortalView.js
 * Client Transparency Portal in 100% Native Vanilla JS.
 * Dilengkapi integrasi Telegram Bot API Resmi (@ProjectManjerBot) sesuai PRD v3.0.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class ClientPortalView {
  constructor(options = {}) {
    this.element = document.createElement('div');
    this.element.className = 'client-view';

    this.onSelectTask = options.onSelectTask || (() => {});
    this.onOpenIntakeModal = options.onOpenIntakeModal || (() => {});
    this.onSelectInvoice = options.onSelectInvoice || (() => {});

    this.render();
    this.bindEvents();

    store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.element;
  }

  formatIDR(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  }

  render() {
    const state = store.getState();
    const { activeProject, tasks, invoices, selectedProjectId } = state;

    const clientTasks = tasks.filter(
      (t) => t.projectId === selectedProjectId && t.visibility === 'client_public'
    );
    const clientInvoices = invoices.filter((i) => i.projectId === selectedProjectId);

    const remainingQuota = activeProject
      ? Math.max(0, activeProject.maintenanceQuotaHours - activeProject.maintenanceUsedHours)
      : 0;

    this.element.innerHTML = `
      <div class="client-container">
        <!-- 1. Welcome Card -->
        <div class="client-banner">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="padding: 12px; background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 10px; color: #059669; display: flex; align-items: center; justify-content: center;">
              ${Icons.building('', 24)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h1 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">
                  Portal Transparansi Klien · ${activeProject?.clientName || 'Klien'}
                </h1>
                <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
                  Garansi &amp; SLA Aktif
                </span>
              </div>
              <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">
                Proyek: <strong style="color: #1e293b;">${activeProject?.name || ''} (${activeProject?.code || ''})</strong> · Masa Garansi s/d ${activeProject?.warrantyUntil || '2027'}
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button id="clientOpenTelegramBtn" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; border-radius: 8px; border: 1px solid #bce2f7; background: #ebf5fb; color: #0077b6; cursor: pointer;">
              ${Icons.telegram('', 14)}
              <span>Buka @ProjectManjerBot</span>
            </button>
            <button id="clientReportBugBtn" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 12px; font-weight: 600; border-radius: 8px; border: none; background: #4f46e5; color: white; cursor: pointer;">
              ${Icons.plus('', 14)}
              <span>Lapor Masalah / Bug Baru</span>
            </button>
          </div>
        </div>

        <!-- Telegram Bot Official Integration Card (PRD v3.0) -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 10px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: #24a1de; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${Icons.telegram('', 20)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 13px; font-weight: 700; color: #0369a1;">Kanal Telegram Bot Resmi Terhubung (@ProjectManjerBot)</span>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #dcfce7; color: #15803d; border: 1px solid #86efac;">
                  <i class="fi fi-rr-check" style="font-size: 9px; margin-right: 2px;"></i>Chat Terverifikasi
                </span>
              </div>
              <p style="font-size: 12px; color: #475569; margin: 2px 0 0 0;">
                Gunakan perintah <code>/status [TIKET]</code> untuk lacak progres, <code>/help</code> untuk panduan, atau kirim kendala langsung via Telegram untuk auto-triage AI.
              </p>
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-size: 11px; color: #64748b;">Kode Tautan Akun:</div>
            <code style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #0284c7; background: white; padding: 2px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">LNK-${activeProject?.code || 'POS'}-88219</code>
          </div>
        </div>

        <!-- 2. Quota & SLA Grid -->
        <div class="client-grid-stats">
          <div class="client-stat-card">
            <span style="font-size: 12px; font-weight: 500; color: #64748b;">Kuota Maintenance Bulanan</span>
            <div style="display: flex; align-items: baseline; gap: 6px; padding-top: 4px;">
              <span style="font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: #0f172a;">${remainingQuota} jam</span>
              <span style="font-size: 11px; color: #94a3b8;">tersisa dari ${activeProject?.maintenanceQuotaHours || 40} jam</span>
            </div>
            <div style="width: 100%; background: #f1f5f9; height: 6px; border-radius: 9999px; overflow: hidden; margin-top: 8px;">
              <div style="height: 100%; border-radius: 9999px; background: #10b981; width: ${((remainingQuota / (activeProject?.maintenanceQuotaHours || 1)) * 100)}%;"></div>
            </div>
          </div>

          <div class="client-stat-card">
            <span style="font-size: 12px; font-weight: 500; color: #64748b;">Pekerjaan Publik Aktif</span>
            <div style="font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: #0f172a; padding-top: 4px;">
              ${clientTasks.filter((t) => t.status !== 'Selesai').length} Task Sedang Berjalan
            </div>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
              ${clientTasks.filter((t) => t.status === 'Selesai').length} task telah selesai &amp; terverifikasi.
            </p>
          </div>

          <div class="client-stat-card">
            <span style="font-size: 12px; font-weight: 500; color: #64748b;">SLA Tanggap Cepat (PRD v3.0)</span>
            <div style="font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: #047857; padding-top: 4px;">
              &lt; 30 Menit (S1) / &lt; 2 Jam (S2)
            </div>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">
              Laporan via Telegram Bot &amp; Web terhubung otomatis ke on-call developer.
            </p>
          </div>
        </div>

        <!-- 3. Task Tracking Table -->
        <div class="client-card-table">
          <div class="client-table-header">
            <h2 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">
              Progres Pengerjaan Fitur &amp; Bug Anda (${clientTasks.length})
            </h2>
            <span style="font-size: 12px; color: #64748b;">
              Update real-time dari sistem internal
            </span>
          </div>

          <div>
            ${clientTasks.length === 0 ? `
              <div style="padding: 32px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
                Belum ada tiket atau laporan pengerjaan publik.
              </div>
            ` : clientTasks.map(task => `
              <div class="client-task-row" data-task-id="${task.id}" style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; transition: background-color 0.15s ease;">
                <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: #1e293b;">${task.key}</span>
                    <span style="color: #cbd5e1;">·</span>
                    <span style="color: #64748b;">${task.type}</span>
                    <span style="color: #cbd5e1;">·</span>
                    <span style="color: #94a3b8;">Diperbarui: ${new Date(task.lastStatusUpdated).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">${task.title}</h3>
                </div>

                <div>
                  <span style="font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 6px; ${
                    task.status === 'Selesai'
                      ? 'background: #d1fae5; color: #065f46;'
                      : task.status === 'QA/Testing'
                      ? 'background: #fef3c7; color: #92400e;'
                      : 'background: #f1f5f9; color: #334155;'
                  }">
                    ${task.status}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. Invoices List for Client -->
        <div class="client-card-table">
          <div class="client-table-header">
            <h2 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0;">
              Riwayat Tagihan &amp; Invoice (${clientInvoices.length})
            </h2>
            <span style="font-size: 12px; color: #64748b;">
              Dapat diunduh / dicetak langsung
            </span>
          </div>

          <div>
            ${clientInvoices.length === 0 ? `
              <div style="padding: 32px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
                Belum ada tagihan yang diterbitkan untuk proyek ini.
              </div>
            ` : clientInvoices.map(inv => `
              <div class="client-invoice-row" data-invoice-id="${inv.id}" style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; transition: background-color 0.15s ease;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: #0f172a;">${inv.invoiceNumber}</span>
                    <span style="color: #cbd5e1;">·</span>
                    <span style="color: #64748b;">${inv.type}</span>
                  </div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    Jatuh Tempo: ${inv.dueDate} · ${inv.items.length} item rincian
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="text-align: right;">
                    <div style="font-size: 13px; font-weight: 700; font-family: var(--font-mono); color: #0f172a;">${this.formatIDR(inv.totalAmount)}</div>
                    <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; ${
                      inv.status === 'Lunas' ? 'background: #d1fae5; color: #065f46;' : 'background: #fef3c7; color: #92400e;'
                    }">
                      ${inv.status}
                    </span>
                  </div>
                  <button style="font-size: 12px; font-weight: 600; color: #4f46e5; background: none; border: none; cursor: pointer;">
                    Buka PDF &rarr;
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target.closest('#clientReportBugBtn') || e.target.closest('#clientOpenTelegramBtn')) {
        this.onOpenIntakeModal();
      }

      const taskRow = e.target.closest('.client-task-row');
      if (taskRow) {
        const taskId = taskRow.dataset.taskId;
        const task = store.getState().tasks.find(t => t.id === taskId);
        if (task) this.onSelectTask(task);
      }

      const invRow = e.target.closest('.client-invoice-row');
      if (invRow) {
        store.setActiveTab('finance');
      }
    });
  }
}
