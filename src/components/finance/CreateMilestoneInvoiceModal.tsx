import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  DollarSign, 
  Percent, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Building, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  FileText,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Info
} from 'lucide-react';

interface CreateMilestoneInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const CreateMilestoneInvoiceModal: React.FC<CreateMilestoneInvoiceModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId
}) => {
  const { 
    projects, 
    selectedProjectId, 
    getProjectProgress, 
    createCustomProgressInvoice 
  } = useApp();

  const [targetProjectId, setTargetProjectId] = useState<string>(
    defaultProjectId || selectedProjectId || 'proj-perpustakaan'
  );

  const selectedProject = projects.find((p) => p.id === targetProjectId) || projects[0];
  const currentProgress = getProjectProgress(selectedProject?.id || '');
  const isProgressEligible = currentProgress > 10;

  // Custom Percentage and Nominal States
  const [percentage, setPercentage] = useState<number>(30);
  const [customNominal, setCustomNominal] = useState<number>(() => {
    return Math.round((selectedProject?.contractValue || 185000000) * 0.3);
  });
  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(() => {
    return new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync targetProjectId if defaultProjectId changes
  useEffect(() => {
    if (defaultProjectId) {
      setTargetProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  // Sync nominal when project or percentage changes
  useEffect(() => {
    if (selectedProject) {
      const calcNominal = Math.round(selectedProject.contractValue * (percentage / 100));
      setCustomNominal(calcNominal);
      if (!title || title.startsWith('Termin')) {
        setTitle(`Termin ${percentage}%: Capaian Progres Proyek ${selectedProject.name}`);
      }
    }
  }, [targetProjectId, percentage]);

  // Handle custom nominal input change (sync backward to percentage)
  const handleNominalChange = (valStr: string) => {
    const rawVal = parseInt(valStr.replace(/\D/g, ''), 10) || 0;
    setCustomNominal(rawVal);
    if (selectedProject && selectedProject.contractValue > 0) {
      const calcPercent = Math.min(100, Math.max(1, Number(((rawVal / selectedProject.contractValue) * 100).toFixed(1))));
      setPercentage(calcPercent);
    }
  };

  // Preset percentage shortcuts
  const handleSelectPreset = (presetPercent: number) => {
    setPercentage(presetPercent);
    if (selectedProject) {
      const calcNominal = Math.round(selectedProject.contractValue * (presetPercent / 100));
      setCustomNominal(calcNominal);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const subtotal = customNominal;
  const taxPpn = Math.round(subtotal * 0.11);
  const totalAmount = subtotal + taxPpn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProgressEligible) return;

    setIsSubmitting(true);
    const result = createCustomProgressInvoice({
      projectId: selectedProject.id,
      percentage,
      customAmount: customNominal,
      title: title.trim() || `Termin ${percentage}% Proyek ${selectedProject.name}`,
      notes: notes.trim() || undefined,
      dueDate
    });

    setIsSubmitting(false);
    if (result.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150 font-sans text-zinc-900">
      <div className="bg-white border border-zinc-200/90 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                <span>Terbitkan Invoice Termin & Kirim ke Finance</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  SOP Progres &gt; 10%
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Penerbitan tagihan termin custom persen & nominal dengan notifikasi terpadu ke Finance dan CRM.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* 1. Project Selector & Progress Validation Card */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 block">
              Pilih Proyek Aktif:
            </label>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full text-xs font-medium text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            >
              {projects.map((p) => {
                const prog = getProjectProgress(p.id);
                return (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name} (Progres: {prog}%)
                  </option>
                );
              })}
            </select>

            {/* Dynamic Project Status & Progress Gauge */}
            {selectedProject && (
              <div className={`p-4 rounded-xl border transition-all ${
                isProgressEligible 
                  ? 'bg-emerald-50/50 border-emerald-200/80' 
                  : 'bg-amber-50/60 border-amber-200/80'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-900">{selectedProject.clientName}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Nilai Kontrak: <strong className="text-zinc-900">{formatIDR(selectedProject.contractValue)}</strong>
                    </div>
                  </div>

                  {/* Progress Badge */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-zinc-900">{currentProgress}%</div>
                      <div className="text-[10px] text-zinc-400">Progres Selesai</div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                      isProgressEligible
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {isProgressEligible ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lolos Syarat (&gt; 10%)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Belum Lolos (&le; 10%)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="pt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                    <span>Ambang Batas Syarat Terbit Invoice: &gt; 10%</span>
                    <span className="font-mono">{currentProgress}% Tercapai</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden relative">
                    {/* 10% Marker Line */}
                    <div className="absolute left-[10%] top-0 bottom-0 w-0.5 bg-rose-500 z-10" title="Batas Minimal 10%" />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isProgressEligible ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, currentProgress))}%` }}
                    />
                  </div>
                </div>

                {/* Warning if NOT eligible */}
                {!isProgressEligible && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-amber-300 text-xs text-amber-900 flex items-start gap-2 shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">Ketentuan SOP Penagihan Belum Terpenuhi:</div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Invoice termin hanya dapat diterbitkan setelah progres pengerjaan melebihi <strong>10%</strong> (progres proyek saat ini baru <strong>{currentProgress}%</strong>). 
                        Silakan selesaikan minimal 1–2 tugas di <strong>Kanban Board</strong> untuk membuka akses penerbitan invoice.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Custom Percentage & Nominal Calculation Form (Disabled if <= 10%) */}
          <div className={`space-y-4 pt-2 transition-opacity ${!isProgressEligible ? 'opacity-40 pointer-events-none' : ''}`}>
            
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 block">
                Pilih Preset Termin Cepat:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { label: 'Termin DP (15%)', percent: 15 },
                  { label: 'Termin 1 (25%)', percent: 25 },
                  { label: 'Termin 2 (30%)', percent: 30 },
                  { label: 'Termin UAT (50%)', percent: 50 }
                ].map((preset) => (
                  <button
                    key={preset.percent}
                    type="button"
                    onClick={() => handleSelectPreset(preset.percent)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all ${
                      percentage === preset.percent
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bidirectional Inputs: Percentage & Nominal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Custom Percentage Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                  <span>Kustom Persentase Kontrak (%):</span>
                  <span className="font-mono text-emerald-700 font-bold">{percentage}%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={percentage}
                    onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold font-mono text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                  />
                  <Percent className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {/* Range Slider for Convenience */}
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                />
              </div>

              {/* Custom Nominal Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                  <span>Kustom Nominal Tagihan (IDR):</span>
                  <span className="text-[10px] text-zinc-400">Sinkron Otomatis</span>
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={customNominal.toLocaleString('id-ID')}
                    onChange={(e) => handleNominalChange(e.target.value)}
                    className="w-full text-xs font-bold font-mono text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                  />
                </div>
                <div className="text-[10px] text-zinc-400 text-right">
                  Dihitung dari {percentage}% x {formatIDR(selectedProject?.contractValue || 0)}
                </div>
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600">
                <span>Nilai Termin Pokok (Subtotal):</span>
                <span className="font-mono font-medium text-zinc-900">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>Pajak Pertambahan Nilai (PPN 11% UU HPP):</span>
                <span className="font-mono font-medium text-zinc-900">{formatIDR(taxPpn)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between font-bold text-zinc-900 text-sm">
                <span>Total Tagihan Nett yang Diteruskan:</span>
                <span className="font-mono text-emerald-700">{formatIDR(totalAmount)}</span>
              </div>
            </div>

            {/* Title / Milestone Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 block">
                Judul Tagihan / Capaian Milestone:
              </label>
              <input
                type="text"
                placeholder="Contoh: Termin 2 (30%): Sign-off Arsitektur & Prototype OPAC"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                required
              />
            </div>

            {/* Due Date & Bank Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Tanggal Jatuh Tempo:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Catatan Pembayaran (Rekening):
                </label>
                <input
                  type="text"
                  placeholder="Rekening BCA 883-091-2391 a/n PT Digital Manjer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs text-zinc-900 bg-zinc-50 border border-zinc-200/80 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Dual Notification Guarantee Banner */}
            <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs space-y-1 text-indigo-950">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Otomatisasi Notifikasi Ganda ke Finance & CRM:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                Saat tombol ditekan, status invoice langsung diset ke <strong>&apos;Terkirim ke Finance&apos;</strong> dan sistem otomatis mengirim notifikasi ke:
              </p>
              <ul className="text-[11px] space-y-0.5 list-disc list-inside text-indigo-900 font-medium">
                <li><strong>Divisi Finance:</strong> Notifikasi invoice baru untuk antrean penagihan & pencatatan piutang.</li>
                <li><strong>Divisi CRM:</strong> Update data pipeline pembayaran termin proyek terkait secara real-time.</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={!isProgressEligible || isSubmitting}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs ${
                isProgressEligible && !isSubmitting
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white active:scale-[0.98]'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Memproses...' : 'Terbitkan & Kirim ke Finance'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
