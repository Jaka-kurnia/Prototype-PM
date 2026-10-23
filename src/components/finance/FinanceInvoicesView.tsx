import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { CreateMilestoneInvoiceModal } from './CreateMilestoneInvoiceModal';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Plus, 
  Printer, 
  Download, 
  ArrowUpRight, 
  Send, 
  Check, 
  Building,
  FileCheck,
  X,
  Percent,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Bell
} from 'lucide-react';

export const FinanceInvoicesView: React.FC = () => {
  const { 
    invoices, 
    projects, 
    tasks, 
    selectedProjectId, 
    createInvoiceFromCompletedTasks, 
    updateInvoiceStatus, 
    role,
    getProjectProgress,
    addToast 
  } = useApp();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneTargetProjectId, setMilestoneTargetProjectId] = useState<string>(selectedProjectId || 'proj-perpustakaan');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [invoiceType, setInvoiceType] = useState<Invoice['type']>('Maintenance Berkala');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Terkirim ke Finance' | 'Disetujui PM' | 'Terkirim ke Klien' | 'Lunas'>('all');

  // Filter tasks that are completed and not yet billed for selected project
  const unbilledCompletedTasks = tasks.filter(
    (t) => t.projectId === selectedProjectId && t.status === 'Selesai' && !t.billedInvoiceId
  );

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleOpenMilestoneModal = (projectId?: string) => {
    setMilestoneTargetProjectId(projectId || selectedProjectId || 'proj-perpustakaan');
    setShowMilestoneModal(true);
  };

  const handleOpenCreateInvoice = () => {
    setSelectedTaskIds(unbilledCompletedTasks.map((t) => t.id));
    setShowCreateModal(true);
  };

  const handleConfirmCreateInvoice = () => {
    const inv = createInvoiceFromCompletedTasks(selectedProjectId, selectedTaskIds, invoiceType);
    setShowCreateModal(false);
    setSelectedInvoice(inv);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-4 sm:p-6 font-sans text-zinc-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Banner with Overview & Primary Actions */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 shadow-2xs">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-zinc-900 tracking-tight">
                  Modul Invoice & Sinkronisasi Finance
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  SOP Progres &gt; 10%
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Notifikasi Terpadu Finance &amp; CRM
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
                Penerbitan tagihan termin custom persen &amp; nominal dengan syarat capaian progres &gt; 10%. Otomatis mengirim notifikasi ke divisi Finance &amp; CRM pada tiap project yang dikerjakan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenMilestoneModal()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-xl shadow-xs transition-all"
            >
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Terbitkan Invoice Termin (Progres &gt; 10%)</span>
            </button>

            <button
              onClick={handleOpenCreateInvoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-xl transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invoice Task Selesai ({unbilledCompletedTasks.length})</span>
            </button>
          </div>
        </div>

        {/* Project Milestone Invoicing Status Grid (3 Projects: Perpustakaan, Futsal, POS) */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Status Kelayakan Penagihan Termin Proyek (SOP Progres &gt; 10%)</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluasi progres tiap project secara real-time. Invoice termin hanya dapat diterbitkan bila progres melebihi ambang 10%.
              </p>
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              Ambang Batas Minimum: <strong className="text-emerald-700">&gt; 10%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const progress = getProjectProgress(proj.id);
              const isEligible = progress > 10;
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const completedTasksCount = projTasks.filter((t) => t.status === 'Selesai').length;

              return (
                <div 
                  key={proj.id}
                  className={`rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between gap-4 ${
                    isEligible 
                      ? 'bg-emerald-50/20 border-emerald-200/70 hover:border-emerald-300' 
                      : 'bg-amber-50/25 border-amber-200/60 hover:border-amber-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Project Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                          {proj.code}
                        </span>
                        <h3 className="text-xs font-bold text-zinc-900 mt-1 line-clamp-1" title={proj.name}>
                          {proj.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 line-clamp-1">{proj.clientName}</p>
                      </div>

                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 ${
                        isEligible
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {isEligible ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Lolos (&gt; 10%)</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Belum (&le; 10%)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Contract Value & Task Stats */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/50">
                      <span className="text-zinc-500">Nilai Kontrak:</span>
                      <span className="font-mono font-bold text-zinc-900">{formatIDR(proj.contractValue)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Task Selesai:</span>
                      <span className="font-mono font-medium text-zinc-700">{completedTasksCount} / {projTasks.length} task</span>
                    </div>

                    {/* Progress Gauge */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-zinc-500">Capaian Progres:</span>
                        <span className="font-mono font-bold text-zinc-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden relative">
                        {/* 10% red marker line */}
                        <div 
                          className="absolute left-[10%] top-0 bottom-0 w-0.5 bg-rose-500 z-10" 
                          title="Batas Minimum SOP 10%" 
                        />
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isEligible ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(3, progress))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isEligible ? (
                      <button
                        onClick={() => handleOpenMilestoneModal(proj.id)}
                        className="w-full py-2 px-3 text-xs font-semibold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Percent className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Terbitkan Invoice ({progress}%)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          disabled
                          className="w-full py-2 px-3 text-xs font-medium rounded-xl text-zinc-400 bg-zinc-100 border border-zinc-200/80 cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Belum Mencapai 10% ({progress}%)</span>
                        </button>
                        <p className="text-[10px] text-amber-800 text-center leading-tight">
                          Selesaikan minimal 1 task di Kanban Board untuk membuka penagihan termin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automated Notification Guarantee Info Box */}
        <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-blue-50/70 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-indigo-900 flex items-center gap-2">
                <span>Alur Otomasi Notifikasi Ganda ke Finance &amp; CRM:</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white text-indigo-700 border border-indigo-200 font-semibold">
                  Dual-Channel Broadcast
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-900/80">
                Setiap kali invoice termin berhasil diterbitkan, sistem otomatis mendispatch notifikasi real-time ke modul <strong>Finance</strong> (verifikasi piutang) dan modul <strong>CRM</strong> (update timeline pembayaran klien), serta langsung mengupdate lonceng notifikasi di TopBar.
              </p>
            </div>
          </div>
        </div>

        {/* Invoices List Section */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="px-6 py-4 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Daftar Tagihan &amp; Riwayat Invoice ({invoices.length})
              </h2>
              <span className="text-xs text-zinc-500">
                Mata Uang: IDR (Rupiah) · Pajak Pertambahan Nilai (PPN): 11% UU HPP
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-medium">
              {[
                { id: 'all', label: `Semua (${invoices.length})` },
                { id: 'Terkirim ke Finance', label: `Terkirim ke Finance (${invoices.filter((i) => i.status === 'Terkirim ke Finance').length})` },
                { id: 'Disetujui PM', label: 'Disetujui PM' },
                { id: 'Terkirim ke Klien', label: 'Terkirim ke Klien' },
                { id: 'Lunas', label: 'Lunas' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === tab.id
                      ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                Tidak ada invoice pada status ini.
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'Lunas';
                const isSentToFinance = inv.status === 'Terkirim ke Finance';
                const isSentToClient = inv.status === 'Terkirim ke Klien';
                const isApprovedPm = inv.status === 'Disetujui PM';

                return (
                  <div key={inv.id} className="p-5 hover:bg-zinc-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-zinc-300">·</span>
                        
                        {/* Status Badge */}
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : isSentToFinance
                              ? 'bg-teal-50 text-teal-800 border-teal-200 font-bold'
                              : isApprovedPm 
                                ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                : isSentToClient
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isSentToFinance && <Send className="w-3 h-3 text-teal-600" />}
                          {isPaid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{inv.status}</span>
                        </span>

                        <span className="text-zinc-300">·</span>
                        <span className="text-xs text-zinc-600 font-medium">{inv.type}</span>

                        {inv.percentage && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                            Termin {inv.percentage}%
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-700">
                        Klien: <strong className="text-zinc-900">{inv.clientName}</strong> · Tanggal Jatuh Tempo: <span className="font-medium">{inv.dueDate}</span>
                      </div>

                      <div className="text-[11px] text-zinc-500">
                        Rincian: {inv.items.length} item penagihan · Subtotal: {formatIDR(inv.subtotal)} + PPN (11%): {formatIDR(inv.taxPpn)}
                      </div>

                      {inv.notes && (
                        <div className="text-[11px] text-zinc-500 italic max-w-2xl">
                          Catatan: &ldquo;{inv.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-zinc-900">
                          {formatIDR(inv.totalAmount)}
                        </div>
                        <div className="text-[10px] text-zinc-400">Total Tagihan (Nett)</div>
                      </div>

                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl transition-colors"
                      >
                        Buka Invoice
                      </button>

                      {/* Quick status transitions based on workflow */}
                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'Disetujui PM')}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                        >
                          Setujui (PM)
                        </button>
                      )}

                      {inv.status === 'Disetujui PM' && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'Terkirim ke Finance')}
                          className="px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim ke Finance</span>
                        </button>
                      )}

                      {inv.status === 'Terkirim ke Finance' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'Terkirim ke Klien')}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Kirim ke Klien</span>
                          </button>
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'Lunas')}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Tandai Lunas</span>
                          </button>
                        </div>
                      )}

                      {inv.status === 'Terkirim ke Klien' && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'Lunas')}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Tandai Lunas</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 1. Custom Percentage & Nominal Milestone Modal (SOP Progress > 10%) */}
      <CreateMilestoneInvoiceModal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        defaultProjectId={milestoneTargetProjectId}
      />

      {/* 2. Create Invoice From Completed Tasks Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">
                Penyusunan Invoice Baru dari Task Selesai
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Jenis Invoice:</label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value as any)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                >
                  <option value="Maintenance Berkala">Maintenance Berkala (Bulanan / Tiket)</option>
                  <option value="Milestone Termin">Milestone Termin Kontrak</option>
                  <option value="Final Handover">Final Handover Proyek</option>
                  <option value="Ad-hoc Fix">Ad-hoc Fix di luar garansi</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  Pilih Pekerjaan Berstatus Selesai yang Belum Ditagih:
                </label>
                {unbilledCompletedTasks.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-500 italic">
                    Semua task selesai telah ditagih. Invoice akan dibuat dengan item dasar milestone.
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 border border-zinc-200 rounded-xl p-2 bg-zinc-50">
                    {unbilledCompletedTasks.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(t.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTaskIds((prev) => [...prev, t.id]);
                            } else {
                              setSelectedTaskIds((prev) => prev.filter((id) => id !== t.id));
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="font-mono text-zinc-900 font-bold">{t.key}</span>
                        <span className="text-zinc-700 truncate">{t.title}</span>
                        <span className="ml-auto font-mono text-zinc-500">{t.timeLoggedHours || t.estimateHours} jam</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateInvoice}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-colors"
              >
                Buat Draft Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed Invoice View / Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 print:p-0">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-zinc-200 print:shadow-none print:border-none print:max-h-none">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                    DM
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-zinc-900">PT Digital Manjer Solusindo</h2>
                    <p className="text-[11px] text-zinc-500">Software House &amp; Cloud Architecture</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 mt-2 space-y-0.5">
                  <p>Cyber 2 Tower Lt. 18, Jakarta Selatan</p>
                  <p>NPWP: 01.883.912.4-012.000</p>
                  <p>Email: billing@digitalmanjer.dev</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-bold text-zinc-900 block">{selectedInvoice.invoiceNumber}</span>
                <span className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  selectedInvoice.status === 'Lunas' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : selectedInvoice.status === 'Terkirim ke Finance'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  Status: {selectedInvoice.status}
                </span>
                <p className="text-zinc-500 mt-1 text-[11px]">Jenis: {selectedInvoice.type}</p>
                {selectedInvoice.percentage && (
                  <p className="text-indigo-700 font-semibold text-[11px]">Termin {selectedInvoice.percentage}%</p>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80">
              <div>
                <span className="text-zinc-500 block mb-0.5">Ditagihkan Kepada:</span>
                <span className="font-bold text-zinc-900 block">{selectedInvoice.clientName}</span>
                <span className="text-zinc-600">ID Proyek: {selectedInvoice.projectId}</span>
              </div>
              <div className="text-right space-y-0.5">
                <div>
                  <span className="text-zinc-500">Tanggal Terbit: </span>
                  <span className="font-medium text-zinc-800">{selectedInvoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Jatuh Tempo: </span>
                  <span className="font-medium text-rose-700">{selectedInvoice.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                  <th className="py-2">Deskripsi Layanan / Tiket</th>
                  <th className="py-2 text-right">Kuantitas</th>
                  <th className="py-2 text-right">Tarif (IDR)</th>
                  <th className="py-2 text-right">Jumlah (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {selectedInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 text-zinc-800 font-medium">{item.description}</td>
                    <td className="py-2.5 text-right tabular-nums text-zinc-600">{item.hoursOrUnits} {item.taskId ? 'jam' : 'paket'}</td>
                    <td className="py-2.5 text-right tabular-nums text-zinc-600">{formatIDR(item.ratePerUnit)}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold text-zinc-900">{formatIDR(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-zinc-200 pt-3 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="tabular-nums font-medium text-zinc-900">{formatIDR(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN (11% UU HPP):</span>
                  <span className="tabular-nums font-medium text-zinc-900">{formatIDR(selectedInvoice.taxPpn)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-1.5 text-sm font-bold text-zinc-900">
                  <span>Total Tagihan (Nett):</span>
                  <span className="tabular-nums text-emerald-700 font-bold">{formatIDR(selectedInvoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Bank details & signature */}
            <div className="border-t border-zinc-200 pt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="text-zinc-600">
                <span className="font-semibold text-zinc-800 block mb-1">Instruksi Pembayaran Bank:</span>
                <p>Bank: {selectedInvoice.bankAccount.bankName}</p>
                <p className="font-mono font-semibold text-zinc-900">No. Rekening: {selectedInvoice.bankAccount.accountNumber}</p>
                <p>A.N: {selectedInvoice.bankAccount.accountHolder}</p>
              </div>
              <div className="text-right text-zinc-500">
                <p>Disahkan oleh:</p>
                <div className="h-10" />
                <p className="font-semibold text-zinc-900">Arya Pratama</p>
                <p className="text-[11px]">Finance &amp; Project Controller</p>
              </div>
            </div>

            {/* Actions for print & close */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 print:hidden">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
