import React from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Invoice } from '../../types';
import { 
  Building2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Bug, 
  Sparkles, 
  ShieldCheck, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface ClientPortalViewProps {
  onSelectTask: (task: Task) => void;
  onOpenIntakeModal: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  onSelectTask,
  onOpenIntakeModal,
  onSelectInvoice
}) => {
  const { activeProject, tasks, invoices, selectedProjectId } = useApp();

  // Public tasks only
  const clientTasks = tasks.filter(
    (t) => t.projectId === selectedProjectId && t.visibility === 'client_public'
  );

  const clientInvoices = invoices.filter((i) => i.projectId === selectedProjectId);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const remainingQuota = activeProject
    ? Math.max(0, activeProject.maintenanceQuotaHours - activeProject.maintenanceUsedHours)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Client Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  Portal Transparansi Klien · {activeProject?.clientName}
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Garansi & SLA Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Proyek: <strong className="text-slate-800">{activeProject?.name} ({activeProject?.code})</strong> · Masa Garansi s/d {activeProject?.warrantyUntil}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenIntakeModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lapor Masalah / Bug Baru</span>
          </button>
        </div>

        {/* Status Quota & Service Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-medium text-slate-500">Kuota Maintenance Bulanan</span>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-bold font-mono text-slate-900">{remainingQuota} jam</span>
              <span className="text-xs text-slate-400">tersisa dari {activeProject?.maintenanceQuotaHours} jam</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${((remainingQuota / (activeProject?.maintenanceQuotaHours || 1)) * 100)}%`
                }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-medium text-slate-500">Pekerjaan Publik Aktif</span>
            <div className="text-xl font-bold font-mono text-slate-900 pt-1">
              {clientTasks.filter((t) => t.status !== 'Selesai').length} Task Sedang Berjalan
            </div>
            <p className="text-[11px] text-slate-500">
              {clientTasks.filter((t) => t.status === 'Selesai').length} task telah selesai & terverifikasi.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-medium text-slate-500">SLA Tanggap Cepat</span>
            <div className="text-xl font-bold font-mono text-emerald-700 pt-1">
              &lt; 1 Jam Respons
            </div>
            <p className="text-[11px] text-slate-500">
              Laporan via WhatsApp & Web terhubung otomatis ke on-call developer.
            </p>
          </div>
        </div>

        {/* Task Tracking Table for Client */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Progres Pengerjaan Fitur & Bug Anda ({clientTasks.length})
            </h2>
            <span className="text-xs text-slate-500">
              Update real-time dari sistem internal
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {clientTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-xs">
                Belum ada tiket atau laporan pengerjaan publik.
              </div>
            ) : (
              clientTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-800">{task.key}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{task.type}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">
                        Diperbarui: {new Date(task.lastStatusUpdated).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900">{task.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded ${
                      task.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'Menunggu Persetujuan' || task.status === 'QA/Testing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoices List for Client */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Riwayat Tagihan & Invoice ({clientInvoices.length})
            </h2>
            <span className="text-xs text-slate-500">
              Dapat diunduh / dicetak langsung
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {clientInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-xs">
                Belum ada tagihan yang diterbitkan untuk proyek ini.
              </div>
            ) : (
              clientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{inv.type}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Jatuh Tempo: {inv.dueDate} · {inv.items.length} item rincian
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-900">{formatIDR(inv.totalAmount)}</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        inv.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                      Buka PDF →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
