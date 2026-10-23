/**
 * IntakeSimulatorModal.js
 * Multi-Channel Intake & Automated Bug Ingestion Simulator (WhatsApp, Sentry, Web Form).
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class IntakeSimulatorModal {
  constructor(options = {}) {
    this.isOpen = false;
    this.activeTab = 'whatsapp';
    this.onTaskCreated = options.onTaskCreated || (() => {});

    this.waMessages = [
      {
        sender: 'bot',
        text: 'Halo! Ini Helpdesk Otomatis Project Manjer. Silakan ketik format: #KODE-PROJECT [Deskripsi Masalah] untuk memicu investigasi dan pembuatan tiket otomatis.',
        time: '10:00'
      }
    ];
    this.waInput = '#POS-KLN Tombol cetak struk error 500 saat diskon 10%';
    this.selectedSentryPreset = 'preset1';

    this.element = document.createElement('div');
    this.element.className = 'intake-modal-overlay';
    this.element.style.display = 'none';

    this.bindEvents();

    store.subscribe((state) => {
      if (state.isIntakeModalOpen && !this.isOpen) {
        this.open();
      } else if (!state.isIntakeModalOpen && this.isOpen) {
        this.isOpen = false;
        this.element.style.display = 'none';
      }
    });
  }

  getElement() {
    return this.element;
  }

  open() {
    this.isOpen = true;
    this.element.style.display = 'flex';
    this.render();
  }

  close() {
    this.isOpen = false;
    this.element.style.display = 'none';
    store.closeIntakeModal();
  }

  render() {
    if (!this.isOpen) return;

    const state = store.getState();
    const { projects } = state;

    this.element.innerHTML = `
      <div class="intake-modal-box">
        <!-- Header -->
        <div class="intake-modal-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: #059669; color: white; display: flex; align-items: center; justify-content: center;">
              ${Icons.bot('', 20)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 15px; font-weight: 700; color: var(--color-zinc-900); margin: 0;">
                  Simulator Multi-Channel Intake &amp; Bug Ingestion
                </h2>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;">
                  AI Auto-Triage
                </span>
              </div>
              <p style="font-size: 12px; color: var(--color-zinc-500); margin: 2px 0 0 0;">
                Uji coba alur masuk laporan bug dari WhatsApp Klien, Webhook Sentry, dan Portal Web.
              </p>
            </div>
          </div>

          <button id="closeIntakeModalBtn" style="background: none; border: none; cursor: pointer; color: var(--color-zinc-400); padding: 4px;">
            ${Icons.x('', 18)}
          </button>
        </div>

        <!-- Channel Tabs -->
        <div style="display: flex; border-bottom: 1px solid var(--color-zinc-200); background: var(--color-zinc-50); padding: 0 24px;">
          ${[
            { id: 'whatsapp', label: 'WhatsApp Bot Klien', icon: Icons.messageSquare('', 14) },
            { id: 'sentry', label: 'Sentry Webhook Exception', icon: Icons.terminal('', 14) },
            { id: 'web', label: 'Formulir Web Klien', icon: Icons.globe('', 14) }
          ].map(t => `
            <button class="intake-channel-btn ${this.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; font-size: 12px; font-weight: ${this.activeTab === t.id ? '700' : '500'}; color: ${this.activeTab === t.id ? 'var(--color-zinc-900)' : 'var(--color-zinc-500)'}; border-bottom: 2px solid ${this.activeTab === t.id ? 'var(--color-zinc-900)' : 'transparent'}; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer;">
              <span>${t.icon}</span>
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Tab Body -->
        <div style="padding: 24px; overflow-y: auto;">
          ${this.renderTabBody(projects)}
        </div>
      </div>
    `;

    // Auto scroll chat
    if (this.activeTab === 'whatsapp') {
      const container = this.element.querySelector('#waChatContainer');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }

  renderTabBody(projects) {
    if (this.activeTab === 'whatsapp') {
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="intake-chat-container" id="waChatContainer" style="border-radius: 12px; border: 1px solid #d1d7db;">
            ${this.waMessages.map(m => `
              <div class="intake-chat-msg ${m.sender}">
                <div>${m.text}</div>
                <div class="intake-chat-time">${m.time}</div>
              </div>
            `).join('')}
          </div>

          <form id="waChatForm" style="display: flex; gap: 8px;">
            <input id="waChatInput" type="text" value="${this.waInput}" placeholder="Ketik #KODE-PROYEK [pesan]..." style="flex: 1; padding: 10px 14px; font-size: 13px; border-radius: 12px; border: 1px solid rgba(228, 228, 231, 0.8); outline: none;" />
            <button type="submit" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 12px; border: none; background: #059669; color: white; font-weight: 600; cursor: pointer;">
              ${Icons.send('', 14)}
              <span>Kirim</span>
            </button>
          </form>

          <div style="font-size: 11px; color: var(--color-zinc-500); display: flex; align-items: center; gap: 6px;">
            <span>Contoh cepat:</span>
            <button type="button" class="quick-wa-btn" data-text="#LIB-DIG Katalog buku tidak bisa filter berdasarkan tahun terbit" style="background: var(--color-zinc-100); border: 1px solid var(--color-zinc-200); border-radius: 6px; padding: 2px 8px; font-size: 11px; cursor: pointer;">
              #LIB-DIG Filter Katalog
            </button>
            <button type="button" class="quick-wa-btn" data-text="#POS-KLN Printer kasir thermal tidak keluar kertas" style="background: var(--color-zinc-100); border: 1px solid var(--color-zinc-200); border-radius: 6px; padding: 2px 8px; font-size: 11px; cursor: pointer;">
              #POS-KLN Printer Kasir
            </button>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'sentry') {
      const presets = {
        preset1: {
          title: 'TypeError: calculateTaxPB1 is undefined in taxEngine.ts',
          projectCode: 'POS-KLN',
          severity: 'S2 - Major',
          env: 'Production'
        },
        preset2: {
          title: 'PostgresDeadlock: transaction 889211 deadlocked in inventory lock',
          projectCode: 'POS-KLN',
          severity: 'S1 - Critical (Blocker)',
          env: 'Production'
        },
        preset3: {
          title: 'MidtransWebhookTimeout: HTTP 504 Gateway Timeout on /api/webhooks/qris',
          projectCode: 'ECOMM-LF',
          severity: 'S2 - Major',
          env: 'Production'
        }
      };

      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Pilih Tangkapan Exception Sentry:</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${Object.entries(presets).map(([k, v]) => `
                <label style="padding: 12px; border-radius: 12px; border: 1px solid ${this.selectedSentryPreset === k ? 'var(--color-zinc-900)' : 'rgba(228, 228, 231, 0.8)'}; background: ${this.selectedSentryPreset === k ? 'var(--color-zinc-50)' : 'white'}; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="radio" name="sentryPreset" value="${k}" ${this.selectedSentryPreset === k ? 'checked' : ''} style="accent-color: var(--color-zinc-900);" />
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: var(--color-zinc-900); font-family: var(--font-mono);">${v.title}</div>
                      <div style="font-size: 11px; color: var(--color-zinc-500); margin-top: 2px;">Kode Proyek: <strong>${v.projectCode}</strong> · Lingkungan: <strong>${v.env}</strong></div>
                    </div>
                  </div>
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #fee2e2; color: #991b1b;">
                    ${v.severity}
                  </span>
                </label>
              `).join('')}
            </div>
          </div>

          <button id="triggerSentryBtn" style="padding: 10px 18px; border-radius: 12px; border: none; background: #e11d48; color: white; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            ${Icons.zap('', 14)}
            <span>Simulasi Kirim Payload Sentry Webhook</span>
          </button>
        </div>
      `;
    }

    if (this.activeTab === 'web') {
      return `
        <form id="webIntakeForm" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Proyek:</label>
              <select id="webProjectSelect" style="padding: 8px 12px; font-size: 12px; border-radius: 10px; border: 1px solid rgba(228, 228, 231, 0.8);">
                ${projects.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('')}
              </select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Tingkat Keparahan:</label>
              <select id="webSeveritySelect" style="padding: 8px 12px; font-size: 12px; border-radius: 10px; border: 1px solid rgba(228, 228, 231, 0.8);">
                <option value="S1 - Critical (Blocker)">S1 - Critical (Blocker)</option>
                <option value="S2 - Major" selected>S2 - Major</option>
                <option value="S3 - Minor">S3 - Minor</option>
              </select>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Judul Bug / Kendala:</label>
            <input id="webTitleInput" type="text" placeholder="Contoh: Pembayaran QRIS tidak otomatis update status transaksi" required style="padding: 8px 12px; font-size: 12px; border-radius: 10px; border: 1px solid rgba(228, 228, 231, 0.8);" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 12px; font-weight: 600; color: var(--color-zinc-700);">Deskripsi &amp; Langkah Reproduksi:</label>
            <textarea id="webDescInput" rows="3" placeholder="Jelaskan alur terjadinya masalah secara detail..." required style="padding: 8px 12px; font-size: 12px; border-radius: 10px; border: 1px solid rgba(228, 228, 231, 0.8); resize: vertical;"></textarea>
          </div>

          <button type="submit" style="padding: 10px 18px; border-radius: 12px; border: none; background: var(--color-zinc-900); color: white; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            ${Icons.send('', 14)}
            <span>Kirim Tiket Laporan</span>
          </button>
        </form>
      `;
    }

    return '';
  }

  bindEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element || e.target.closest('#closeIntakeModalBtn')) {
        this.close();
      }

      const channelBtn = e.target.closest('.intake-channel-btn');
      if (channelBtn) {
        this.activeTab = channelBtn.dataset.tab;
        this.render();
      }

      const quickBtn = e.target.closest('.quick-wa-btn');
      if (quickBtn) {
        this.waInput = quickBtn.dataset.text;
        const inputEl = this.element.querySelector('#waChatInput');
        if (inputEl) inputEl.value = this.waInput;
      }

      if (e.target.closest('#triggerSentryBtn')) {
        const presets = {
          preset1: {
            title: 'TypeError: calculateTaxPB1 is undefined in taxEngine.ts',
            projectCode: 'POS-KLN',
            severity: 'S2 - Major',
            env: 'Production',
            details: 'TypeError: Cannot read properties of undefined (reading \'calculateTaxPB1\') at processReceipt (taxEngine.ts:42)'
          },
          preset2: {
            title: 'PostgresDeadlock: transaction 889211 deadlocked in inventory lock',
            projectCode: 'POS-KLN',
            severity: 'S1 - Critical (Blocker)',
            env: 'Production',
            details: 'error: deadlock detected (40P01) Process 4122 waits for ShareLock'
          },
          preset3: {
            title: 'MidtransWebhookTimeout: HTTP 504 Gateway Timeout on /api/webhooks/qris',
            projectCode: 'ECOMM-LF',
            severity: 'S2 - Major',
            env: 'Production',
            details: 'AxiosError: timeout of 10000ms exceeded on POST /api/webhooks/qris'
          }
        };

        const chosen = presets[this.selectedSentryPreset] || presets.preset1;
        const state = store.getState();
        const proj = state.projects.find(p => p.code.includes(chosen.projectCode)) || state.projects[0];

        const task = store.ingestBugReport({
          projectId: proj.id,
          title: `[Sentry] ${chosen.title}`,
          description: chosen.details,
          source: 'Sentry',
          priority: chosen.severity.startsWith('S1') ? 'Hotfix' : 'Tinggi',
          severity: chosen.severity,
          environment: chosen.env
        });

        this.close();
        if (this.onTaskCreated && task) this.onTaskCreated(task.id);
      }
    });

    this.element.addEventListener('change', (e) => {
      if (e.target.name === 'sentryPreset') {
        this.selectedSentryPreset = e.target.value;
      }
    });

    this.element.addEventListener('submit', (e) => {
      if (e.target.id === 'waChatForm') {
        e.preventDefault();
        const inputEl = this.element.querySelector('#waChatInput');
        const text = inputEl ? inputEl.value.trim() : '';
        if (!text) return;

        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        this.waMessages.push({ sender: 'user', text, time });
        this.waInput = '';

        const match = text.match(/#([A-Z0-9-]+)\s+(.*)/i);
        setTimeout(() => {
          if (match) {
            const code = match[1].toUpperCase();
            const desc = match[2];
            const state = store.getState();
            const proj = state.projects.find(p => p.code.toUpperCase().includes(code) || code.includes(p.code.toUpperCase())) || state.projects[0];

            const task = store.ingestBugReport({
              projectId: proj.id,
              title: `[WhatsApp] ${desc.slice(0, 50)}...`,
              description: `Laporan masuk via WhatsApp Gateway:\n\n"${desc}"\n\nPelapor: +62 812-9988-xxxx (PIC Klien)`,
              source: 'WhatsApp',
              priority: 'Tinggi'
            });

            this.waMessages.push({
              sender: 'bot',
              text: `✅ Laporan diterima! Tiket ${task.key} telah dibuat untuk proyek ${proj.name}. AI Automation Hub sedang menganalisis akar masalah.`,
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });
            this.render();
            if (this.onTaskCreated && task) this.onTaskCreated(task.id);
          } else {
            this.waMessages.push({
              sender: 'bot',
              text: '⚠️ Format tidak lengkap. Mohon sertakan kode proyek di awal pesan (Contoh: `#POS-KLN printer kasir tidak merespon`).',
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });
            this.render();
          }
        }, 500);

        this.render();
      }

      if (e.target.id === 'webIntakeForm') {
        e.preventDefault();
        const pId = this.element.querySelector('#webProjectSelect')?.value;
        const sev = this.element.querySelector('#webSeveritySelect')?.value;
        const title = this.element.querySelector('#webTitleInput')?.value || '';
        const desc = this.element.querySelector('#webDescInput')?.value || '';

        const task = store.ingestBugReport({
          projectId: pId,
          title,
          description: desc,
          source: 'Web Portal',
          priority: sev.startsWith('S1') ? 'Hotfix' : 'Tinggi',
          severity: sev
        });

        this.close();
        if (this.onTaskCreated && task) this.onTaskCreated(task.id);
      }
    });
  }
}
