import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskType, TaskPriority, BugSeverity, BugEnvironment, WarrantyStatus } from '../../types';
import { X, Sparkles, Bug, CheckSquare, Flame, FileText, Calendar, Clock, User, Layers, ShieldAlert, AlertTriangle } from 'lucide-react';

interface CreateTaskModalProps {
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose }) => {
  const { createTask, projects, selectedProjectId, teamMembers, epics, addToast } = useApp();

  const [projectId, setProjectId] = useState(selectedProjectId);
  const [type, setType] = useState<TaskType>('Task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Sedang');
  const [assigneeId, setAssigneeId] = useState(teamMembers[1]?.id || '');
  const [epicId, setEpicId] = useState('');
  const [estimateHours, setEstimateHours] = useState(4);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [visibility, setVisibility] = useState<'client_public' | 'internal'>('client_public');

  // Software House Standard Bug Tracking Fields
  const [severity, setSeverity] = useState<BugSeverity>('S2 - Major');
  const [environment, setEnvironment] = useState<BugEnvironment>('Production');
  const [warrantyStatus, setWarrantyStatus] = useState<WarrantyStatus>('Garansi Proyek (Gratis)');
  const [reproStepsText, setReproStepsText] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');

  const projectEpics = epics.filter((e) => e.projectId === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const stepsArray = reproStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    createTask({
      projectId,
      type,
      title: title.trim(),
      description: description.trim(),
      priority: type === 'Bug' ? (severity === 'S1 - Critical (Blocker)' ? 'Hotfix' : severity === 'S2 - Major' ? 'Tinggi' : 'Sedang') : priority,
      severity: type === 'Bug' ? severity : undefined,
      environment: type === 'Bug' ? environment : undefined,
      warrantyStatus: type === 'Bug' ? warrantyStatus : undefined,
      reproductionSteps: stepsArray.length > 0 ? stepsArray : undefined,
      expectedBehavior: expectedBehavior.trim() || undefined,
      actualBehavior: actualBehavior.trim() || undefined,
      assigneeId,
      epicId: epicId || undefined,
      estimateHours: Number(estimateHours),
      dueDate,
      visibility,
      source: 'Manual',
      status: type === 'Bug' ? 'Baru' : 'To Do'
    });

    onClose();
  };

  const priorityOptions: { value: TaskPriority; label: string; icon?: React.ReactNode; color: string }[] = [
    { value: 'Hotfix', label: 'Hotfix', icon: <Flame className="w-3.5 h-3.5 text-rose-600" />, color: 'border-rose-300 text-rose-800 bg-rose-50' },
    { value: 'Tinggi', label: 'Tinggi', color: 'border-amber-300 text-amber-800 bg-amber-50' },
    { value: 'Sedang', label: 'Sedang', color: 'border-slate-300 text-slate-800 bg-slate-50' },
    { value: 'Rendah', label: 'Rendah', color: 'border-slate-200 text-slate-600 bg-slate-50' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Buat Pekerjaan Baru</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tambahkan task, fitur, bug, atau permintaan revisi ke backlog proyek.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project & Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Target Proyek
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Tipe Pekerjaan
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Task">Task Standar</option>
                <option value="Feature">Feature (Fitur Baru)</option>
                <option value="Bug">Bug (Masalah / Kerusakan)</option>
                <option value="Revisi">Revisi (Change Request)</option>
                <option value="Maintenance">Maintenance Berkala</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Judul Pekerjaan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Sinkronisasi data stok barang multi-warehouse..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Deskripsi Ringkas / Ringkasan Error *
            </label>
            <textarea
              rows={2}
              placeholder="Rincian masalah, modul yang terdampak, atau konteks error..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs text-slate-900 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Software House Bug Ticket Standard Specification */}
          {type === 'Bug' && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3.5">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Standar Tiket Bug Software House (SOP QA & Triage)</span>
              </div>

              {/* Severity & Environment & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
                    Keparahan (Severity) *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                    className="w-full text-xs font-bold text-slate-900 bg-white border border-rose-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="S1 - Critical (Blocker)">S1 - Critical (Blocker, SLA &lt; 4 Jam)</option>
                    <option value="S2 - Major">S2 - Major (Fitur Utama, SLA 24 Jam)</option>
                    <option value="S3 - Minor">S3 - Minor (Workaround Ada, SLA 3 Hari)</option>
                    <option value="S4 - Trivial">S4 - Trivial (Kosmetik/Typo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
                    Lingkungan Terdampak *
                  </label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as BugEnvironment)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-rose-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Production">Production (Live Server)</option>
                    <option value="Staging">Staging (Pre-Release)</option>
                    <option value="QA / Testing">QA / Testing Lab</option>
                    <option value="Development">Development Local</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
                    Kategori Biaya / Garansi *
                  </label>
                  <select
                    value={warrantyStatus}
                    onChange={(e) => setWarrantyStatus(e.target.value as WarrantyStatus)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-rose-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Garansi Proyek (Gratis)">Garansi Proyek (Rp 0 - Bebas Biaya)</option>
                    <option value="Kuota Maintenance">Potong Kuota Retainer</option>
                    <option value="Non-Garansi (Billable)">Non-Garansi (Ditagihkan)</option>
                  </select>
                </div>
              </div>

              {/* Reproduction Steps */}
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Langkah-Langkah Reproduksi (Steps to Reproduce) *
                </label>
                <textarea
                  rows={2}
                  placeholder="1. Masuk ke halaman kasir&#10;2. Masukkan diskon promo voucher&#10;3. Klik checkout"
                  value={reproStepsText}
                  onChange={(e) => setReproStepsText(e.target.value)}
                  className="w-full text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Expected vs Actual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Hasil yang Diharapkan (Expected)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Transaksi berhasil tanpa error 500"
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Hasil Aktual yang Terjadi (Actual)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tombol membeku, muncul error uncaught exception"
                    value={actualBehavior}
                    onChange={(e) => setActualBehavior(e.target.value)}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Priority Segmented Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Prioritas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`py-2 px-2 text-xs rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? `${opt.color} ring-2 ring-indigo-500/30 font-bold shadow-2xs`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Epic & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Modul Epic
              </label>
              <select
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5"
              >
                <option value="">(Tanpa Epic)</option>
                {projectEpics.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimates, Due Date & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Estimasi (Jam)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={estimateHours}
                onChange={(e) => setEstimateHours(Number(e.target.value))}
                className="w-full text-xs font-mono font-semibold text-slate-900 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Visibilitas
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50/80 border border-slate-200 rounded-lg p-2.5"
              >
                <option value="client_public">Publik Klien</option>
                <option value="internal">Internal Saja</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Simpan & Tambahkan Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
