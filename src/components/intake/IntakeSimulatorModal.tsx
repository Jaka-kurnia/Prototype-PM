import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, MessageSquare, AlertCircle, Globe, Send, CheckCircle2, ShieldAlert, Sparkles, Terminal, Copy, Flame, Layers } from 'lucide-react';
import { TaskPriority, BugSeverity, BugEnvironment, WarrantyStatus } from '../../types';

interface IntakeSimulatorModalProps {
  onClose: () => void;
  onTaskCreated?: (taskId: string) => void;
}

export const IntakeSimulatorModal: React.FC<IntakeSimulatorModalProps> = ({ onClose, onTaskCreated }) => {
  const { projects, ingestBugReport, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sentry' | 'web'>('whatsapp');

  // WhatsApp simulation state
  const [waMessages, setWaMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Halo! Ini Helpdesk Otomatis Project Manjer. Silakan ketik format: #KODE-PROJECT [Deskripsi Masalah] untuk memicu investigasi dan pembuatan tiket otomatis.',
      time: '10:00'
    }
  ]);
  const [waInput, setWaInput] = useState('#POS-KLN Tombol cetak struk error 500 saat diskon 10%');

  // Sentry simulation state
  const [selectedSentryPreset, setSelectedSentryPreset] = useState<string>('preset1');

  // Web form state
  const [webProjectId, setWebProjectId] = useState(projects[0]?.id || '');
  const [webTitle, setWebTitle] = useState('');
  const [webDesc, setWebDesc] = useState('');
  const [webPriority, setWebPriority] = useState<TaskPriority>('Tinggi');
  const [webSeverity, setWebSeverity] = useState<BugSeverity>('S2 - Major');
  const [webEnv, setWebEnv] = useState<BugEnvironment>('Production');
  const [webWarranty, setWebWarranty] = useState<WarrantyStatus>('Garansi Proyek (Gratis)');
  const [webExpected, setWebExpected] = useState('');
  const [webActual, setWebActual] = useState('');

  const sentryPresets = {
    preset1: {
      title: 'TypeError: calculateTaxPB1 is undefined in taxEngine.ts',
      projectCode: 'POS-KLN',
      severity: 'S2 - Major' as BugSeverity,
      environment: 'Production' as BugEnvironment,
      errorDetails: `TypeError: Cannot read properties of undefined (reading 'calculateTaxPB1')
    at processReceipt (src/services/receipt.ts:42:15)
    at onClick (src/components/CheckoutModal.tsx:88:9)
Fingerprint: ['taxEngine', 'calculateTaxPB1', 'TypeError']
Occurrences: 18 events in 15 minutes
Environment: production · Release: pos-v2.14.0`
    },
    preset2: {
      title: 'PostgresDeadlock: transaction 889211 deadlocked in inventory lock',
      projectCode: 'POS-KLN',
      severity: 'S1 - Critical (Blocker)' as BugSeverity,
      environment: 'Production' as BugEnvironment,
      errorDetails: `error: deadlock detected (40P01)
Detail: Process 4122 waits for ShareLock on transaction 889211; blocked by process 4118.
Location: src/db/queries/inventory.ts:98
Fingerprint: ['postgres', 'deadlock', 'inventory']
Occurrences: 4 events in 2 minutes
Environment: production · Release: pos-v2.14.0`
    },
    preset3: {
      title: 'MidtransWebhookTimeout: HTTP 504 Gateway Timeout on /api/webhooks/qris',
      projectCode: 'ECOMM-LF',
      severity: 'S2 - Major' as BugSeverity,
      environment: 'Production' as BugEnvironment,
      errorDetails: `AxiosError: timeout of 10000ms exceeded on POST /api/webhooks/qris
    at IncomingMessage.<anonymous> (node_modules/axios/lib/adapters/http.js:639:15)
Fingerprint: ['midtrans', 'timeout', 'webhook']
Occurrences: 7 events in 30 minutes
Environment: production · Release: ecomm-v1.8.2`
    }
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waInput.trim()) return;

    const userText = waInput.trim();
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setWaMessages((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setWaInput('');

    // Check if contains #CODE
    const match = userText.match(/#([A-Z0-9-]+)\s+(.*)/i);
    setTimeout(() => {
      if (match) {
        const code = match[1].toUpperCase();
        const description = match[2];

        // Find project
        const project = projects.find((p) => p.code.toUpperCase().includes(code) || code.includes(p.code.toUpperCase())) || projects[0];

        const task = ingestBugReport({
          projectId: project.id,
          title: `[WhatsApp] ${description.slice(0, 60)}...`,
          description: `Laporan masuk via WhatsApp Gateway:\n\n"${description}"\n\nPelapor: +62 812-9988-xxxx (PIC Store Kopi Kenangan)`,
          source: 'WhatsApp',
          priority: 'Tinggi'
        });

        setWaMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `✅ Laporan diterima! Tiket ${task.key} telah dibuat untuk proyek ${project.name}. Tim teknis & Agen AI Claude sedang menganalisis akar masalah.`,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        if (onTaskCreated) onTaskCreated(task.id);
      } else {
        setWaMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: '⚠️ Format tidak lengkap. Mohon sertakan kode proyek di awal pesan (Contoh: `#POS-KLN printer kasir tidak merespon`).',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 600);
  };

  const handleTriggerSentry = () => {
    const preset = sentryPresets[selectedSentryPreset as keyof typeof sentryPresets];
    const project = projects.find((p) => p.code.includes(preset.projectCode)) || projects[0];

    const task = ingestBugReport({
      projectId: project.id,
      title: `[Sentry] ${preset.title}`,
      description: `Automated exception captured from Sentry DSN:\n\n${preset.errorDetails}`,
      source: 'Sentry',
      priority: preset.severity.startsWith('S1') ? 'Hotfix' : 'Tinggi',
      severity: preset.severity,
      environment: preset.environment,
      sentryErrorDetails: preset.errorDetails,
      expectedBehavior: 'Aplikasi berjalan lancar tanpa exception runtime 500.',
      actualBehavior: preset.title,
      reproductionSteps: [
        'Aplikasi menerima request transaksi pada rute terkait',
        'Parameter diteruskan ke engine service',
        'Terjadi crash runtime unhandled exception seperti tercatat pada log Sentry'
      ]
    });

    addToast('success', 'Event Sentry Diterima!', `Task bug ${task.key} otomatis dibuat dengan Severity ${preset.severity} dan antre di triage.`);
    if (onTaskCreated) onTaskCreated(task.id);
    onClose();
  };

  const handleSubmitWebForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webTitle.trim()) return;

    const parsedSteps = webDesc
      ? webDesc.split('\n').filter((l) => l.trim().length > 0)
      : undefined;

    const task = ingestBugReport({
      projectId: webProjectId,
      title: webTitle.trim(),
      description: webDesc.trim(),
      source: 'Web Form',
      priority: webSeverity.startsWith('S1') ? 'Hotfix' : webPriority,
      severity: webSeverity,
      environment: webEnv,
      expectedBehavior: webExpected.trim() || undefined,
      actualBehavior: webActual.trim() || undefined,
      reproductionSteps: parsedSteps
    });

    addToast('success', 'Tiket Bug Dibuat!', `Laporan ${task.key} berhasil dikirim ke antrean pengerjaan (${webSeverity}).`);
    if (onTaskCreated) onTaskCreated(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Simulator Kanal Masuk Laporan (PRD Bagian 7.5)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Uji penerimaan bug dari WhatsApp Bot Gateway, Sentry DSN Exception, dan Portal Web Klien.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'whatsapp' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Bot Gateway</span>
          </button>
          <button
            onClick={() => setActiveTab('sentry')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sentry' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Sentry Webhook</span>
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'web' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Portal Web Klien</span>
          </button>
        </div>

        {/* TAB 1: WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-3">
            {/* WhatsApp Chat Container */}
            <div className="bg-[#f0f2f5] rounded-xl overflow-hidden border border-slate-200">
              {/* WhatsApp header */}
              <div className="bg-[#008069] text-white px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    PM
                  </div>
                  <div>
                    <div className="font-bold leading-tight">Project Manjer Helpdesk Bot</div>
                    <div className="text-[10px] text-emerald-100">Online · Otomasi AI Aktif</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-100 bg-white/10 px-2 py-0.5 rounded">
                  WA-GATEWAY v1.0
                </span>
              </div>

              {/* Message scroll area */}
              <div className="p-4 h-64 overflow-y-auto space-y-2.5 bg-slate-100/60">
                {waMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] text-xs rounded-xl p-3 shadow-2xs ${
                      msg.sender === 'user'
                        ? 'ml-auto bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                        : 'mr-auto bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <span className="text-[9px] text-slate-400 self-end mt-1 font-mono">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendWhatsApp} className="p-2.5 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik #KODE-PROJECT deskripsi laporan..."
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008069] hover:bg-[#006e5a] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold">Preset Cepat:</span>
              <button
                type="button"
                onClick={() => setWaInput('#POS-KLN Kasir tidak bisa cetak struk Bluetooth printer error 500')}
                className="text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
              >
                Printer Bluetooth (#POS-KLN)
              </button>
              <button
                type="button"
                onClick={() => setWaInput('#ECOMM-LF Tombol checkout voucher diskon freeze saat promo gajian')}
                className="text-[11px] font-medium text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
              >
                Checkout Freeze (#ECOMM-LF)
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SENTRY */}
        {activeTab === 'sentry' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Pilih Payload Exception Sentry
              </label>
              <select
                value={selectedSentryPreset}
                onChange={(e) => setSelectedSentryPreset(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                <option value="preset1">TypeError: calculateTaxPB1 is undefined (POS-KLN - High Urgency)</option>
                <option value="preset2">PostgresDeadlock: Deadlock detected in inventory (POS-KLN - Hotfix)</option>
                <option value="preset3">MidtransWebhookTimeout: HTTP 504 on QRIS (ECOMM-LF - Medium)</option>
              </select>
            </div>

            {/* Sentry Stacktrace Log Preview */}
            <div className="bg-[#0f172a] text-slate-200 p-4 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto border border-slate-800 shadow-md leading-relaxed">
              <pre>{sentryPresets[selectedSentryPreset as keyof typeof sentryPresets].errorDetails}</pre>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200/90 rounded-xl text-xs text-indigo-950 space-y-1">
              <strong>Aturan Deduplikasi Fingerprint:</strong>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Event yang masuk akan otomatis dikelompokkan berdasarkan fingerprint exception. Tiket tidak dibuat ganda jika crash serupa sudah tercatat.
              </p>
            </div>

            <button
              onClick={handleTriggerSentry}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Simulasikan Webhook Sentry Masuk Sekarang</span>
            </button>
          </div>
        )}

        {/* TAB 3: WEB CLIENT FORM */}
        {activeTab === 'web' && (
          <form onSubmit={handleSubmitWebForm} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Pilih Proyek
              </label>
              <select
                value={webProjectId}
                onChange={(e) => setWebProjectId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Ringkasan Kendala *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Muncul layar putih saat klik tombol Bayar..."
                value={webTitle}
                onChange={(e) => setWebTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Langkah Reproduksi Masalah
              </label>
              <textarea
                rows={3}
                placeholder="1. Buka halaman kasir&#10;2. Masukkan diskon 50%&#10;3. Klik checkout"
                value={webDesc}
                onChange={(e) => setWebDesc(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Severity & Environment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tingkat Keparahan (Bug Severity) *
                </label>
                <select
                  value={webSeverity}
                  onChange={(e) => setWebSeverity(e.target.value as BugSeverity)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                >
                  <option value="S1 - Critical (Blocker)">S1 - Critical (Blocker / Data Loss, &lt; 4 Jam)</option>
                  <option value="S2 - Major">S2 - Major (Fitur Utama Rusak, 24 Jam)</option>
                  <option value="S3 - Minor">S3 - Minor (Kendala Ada Solusi, 3 Hari)</option>
                  <option value="S4 - Trivial">S4 - Trivial (Typo / Kosmetik UI)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Lingkungan Terdampak *
                </label>
                <select
                  value={webEnv}
                  onChange={(e) => setWebEnv(e.target.value as BugEnvironment)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                >
                  <option value="Production">Production (Live)</option>
                  <option value="Staging">Staging (Pre-Release)</option>
                  <option value="QA / Testing">QA / Testing</option>
                  <option value="Development">Development Local</option>
                </select>
              </div>
            </div>

            {/* Expected vs Actual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hasil yang Diharapkan (Expected)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Struk kasir berhasil tercetak dengan subtotal diskon yang benar..."
                  value={webExpected}
                  onChange={(e) => setWebExpected(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hasil Aktual / Pesan Galat (Actual)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Muncul alert Error 500 dan transaksi gagal tersimpan..."
                  value={webActual}
                  onChange={(e) => setWebActual(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Kirim Laporan Bug (SOP Software House)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
