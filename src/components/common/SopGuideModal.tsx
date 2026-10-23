import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Users, 
  GitBranch, 
  ShieldCheck, 
  DollarSign, 
  Terminal, 
  Clock, 
  Award, 
  Sparkles, 
  Send, 
  Bot, 
  FileText, 
  ListOrdered,
  Zap,
  FolderGit2
} from 'lucide-react';

interface SopGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const SopGuideModal: React.FC<SopGuideModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  if (!isOpen) return null;

  const sopSteps = [
    {
      step: 1,
      title: '1. Inbound Klien & CRM Deals',
      badge: 'CRM Intake',
      color: 'from-blue-600 to-indigo-600',
      icon: Send,
      targetTab: 'crm',
      tabLabel: 'Buka CRM Deals',
      summary: 'Proses penerimaan proyek baru dari calon klien hingga status Deal Won / Closing.',
      details: [
        {
          heading: 'Inbound Laporan / Kebutuhan Klien',
          desc: 'Klien mengajukan spesifikasi proyek (contoh: Perpustakaan Digital Kampus, Booking Lapangan Futsal, atau POS Multi-Outlet). Kebutuhan dicatat dalam CRM Deal dengan kode unik, estimasi nilai kontrak, dan durasi pengerjaan.'
        },
        {
          heading: 'Technical Feasibility & Proposal',
          desc: 'Project Manager bersama Tech Lead menyusun proposal teknis, membagi kebutuhan klien ke dalam modul arsitektur (Backend REST API, Frontend SPA, API Gateway).'
        },
        {
          heading: 'Closing Deal & Kesepakatan Termin',
          desc: 'Saat status deal menjadi "Closing/Won", klien menyetujui DP 30% dan SLA Garansi 12 Bulan. Deal siap dikonversi menjadi proyek engineering aktif.'
        }
      ]
    },
    {
      step: 2,
      title: '2. Otomatisasi Git & Branch Per Modul',
      badge: 'Git Provisioning',
      color: 'from-sky-600 to-blue-600',
      icon: GitBranch,
      targetTab: 'crm',
      tabLabel: 'Lihat Konversi Git',
      summary: 'Sistem secara otomatis menginisialisasi repository GitHub dan membuat branch per modul.',
      details: [
        {
          heading: '1-Click Deal Conversion',
          desc: 'Tombol "Konversi ke Proyek" di CRM otomatis mengenerate repository GitHub dengan branch strategy standar industri: `main` (Production), `staging` (QA Testbed), dan `feature/*` atau `epic/*` terisolasi per modul.'
        },
        {
          heading: 'Multi-Module Branch Isolation',
          desc: 'Setiap modul independen (misal: feature/katalog-microservice, feature/react-portal-opac) mendapatkan branch sendiri untuk mencegah merge conflict.'
        },
        {
          heading: 'Webhook & CI/CD Pipeline Ready',
          desc: 'Integrasi GitHub token disinkronkan sehingga commit dan pull request langsung terpantau di papan Kanban.'
        }
      ]
    },
    {
      step: 3,
      title: '3. Backlog, Sprint & Alokasi 5 Role Tim',
      badge: 'Sprint Planning',
      color: 'from-indigo-600 to-purple-600',
      icon: Users,
      targetTab: 'backlog',
      tabLabel: 'Buka Backlog & Sprint',
      summary: 'Pemecahan Epics ke User Stories, estimasi jam kerja, dan pembagian tugas ke 5 spesialis.',
      details: [
        {
          heading: 'Distribusi Beban Kerja ke 5 Role Software House',
          desc: 'Tugas didistribusikan secara proporsional kepada: 1) Project Manager, 2) Senior Backend Engineer (Laravel), 3) Frontend Engineer (React SPA), 4) DevOps/Infrastructure Engineer, dan 5) QA Test Engineer.'
        },
        {
          heading: 'Sprint 1 & Sprint 2 Milestones',
          desc: 'Pekerjaan dibagi dalam sprint 2 mingguan. Sprint 1 berfokus pada Core Backend Microservices & API Gateway, sedangkan Sprint 2 berfokus pada Frontend UI & Integrasi.'
        },
        {
          heading: 'Estimasi Jam & Story Points',
          desc: 'Setiap task memiliki estimasi waktu (jam) dan tingkat prioritas (Hotfix, Tinggi, Sedang, Rendah).'
        }
      ]
    },
    {
      step: 4,
      title: '4. Kanban Board & Otomatisasi Checklist',
      badge: 'Development & Kanban',
      color: 'from-amber-600 to-orange-600',
      icon: Terminal,
      targetTab: 'kanban',
      tabLabel: 'Buka Papan Kanban',
      summary: 'Pengerjaan tugas dengan alur checklist subtask cerdas yang otomatis memajukan fase kerja.',
      details: [
        {
          heading: '6 Kolom Papan Kanban Standar',
          desc: 'Alur kerja berjalan transparan melalui kolom: 1) Backlog/Baru → 2) Dianalisis → 3) In Progress → 4) Menunggu Persetujuan PR → 5) QA/Testing → 6) Selesai.'
        },
        {
          heading: '⚡ Alur Otomatisasi Checklist Subtask',
          desc: 'Ketika developer atau user mencentang subtask pertama di modal detail, task otomatis berpindah ke "In Progress". Ketika seluruh checklist tuntas (100%), task otomatis berpindah ke "Menunggu Persetujuan (Code Review PR)".'
        },
        {
          heading: '6-Phase Stepper Interaktif',
          desc: 'Setiap tahapan siklus kerja di modal detail dapat diklik secara langsung untuk memindahkan status tugas secara instan dengan jejak audit otomatis.'
        }
      ]
    },
    {
      step: 5,
      title: '5. Code Review PR & QA Staging Sign-Off',
      badge: 'QA & Review',
      color: 'from-purple-600 to-pink-600',
      icon: Award,
      targetTab: 'kanban',
      tabLabel: 'Lihat Review PR',
      summary: 'Pemeriksaan kode git diff oleh Tech Lead dan verifikasi regresi oleh QA Engineer di Staging.',
      details: [
        {
          heading: 'Code Review Pull Request (Lead Engineer)',
          desc: 'Tech Lead memeriksa git diff, test coverage unit test, dan standar arsitektur sebelum menyetujui merge branch ke `staging`.'
        },
        {
          heading: 'Verifikasi QA di Lingkungan Staging',
          desc: 'QA Engineer menjalankan skenario pengujian fungsional, smoke test, dan matrix test case. Tiket hanya dapat lolos jika QA Sign-Off bertanda LULUS.'
        },
        {
          heading: 'Reopen & Regresi Guard',
          desc: 'Jika ditemukan anomali atau bug baru saat uji staging, QA Engineer dapat langsung menekan tombol "Gagal / Reopen Bug" dengan alasan teknis.'
        }
      ]
    },
    {
      step: 6,
      title: '6. Rilis Production, SLA Garansi & Termin',
      badge: 'Release & Finance',
      color: 'from-emerald-600 to-teal-600',
      icon: ShieldCheck,
      targetTab: 'finance',
      tabLabel: 'Buka Modul Finance',
      summary: 'Deployment aman ke server Production, pemantauan telemetri, dan penagihan termin kontrak.',
      details: [
        {
          heading: 'Syarat Penerbitan Invoice Termin (SOP Progres > 10%)',
          desc: 'SOP software house mewajibkan progres pengerjaan proyek harus di atas 10% sebelum invoice termin dapat diterbitkan. Sistem menyediakan form kustom persentase (%) dan kustom nominal (IDR) yang tersinkronisasi secara dua arah.'
        },
        {
          heading: 'Otomatisasi Kirim ke Finance & Notifikasi Ganda ke CRM',
          desc: 'Saat invoice termin dibuat, status tagihan otomatis diset ke "Terkirim ke Finance". Sistem sekaligus mendispatch notifikasi real-time ke modul Finance (antrean pencatatan piutang) dan modul CRM (update pipeline termin pembayaran deal klien).'
        },
        {
          heading: 'Masa Garansi 1 Bulan Pasca Go-Live & Automasi Bug AI Setara Jira',
          desc: 'Aplikasi yang telah live production atau dihosting mendapatkan masa garansi 1 bulan (30 hari) bebas biaya (Rp 0). Bug Kecil & Menengah dieksekusi secara otomatis dan langsung oleh AI (auto-patch, automated regression test, dan PR). Sedangkan Bug Besar (kritis/database/concurrency/auth) wajib ditangani oleh programmer manusia demi keselamatan integritas data produksi, dilengkapi Paket Diagnostik lengkap yang disiapkan AI.'
        }
      ]
    }
  ];

  const currentStep = sopSteps.find((s) => s.step === activeStepTab) || sopSteps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200/90 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-zinc-900">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                Buku Panduan Standar SOP Perusahaan Software House
              </h2>
              <p className="text-xs text-zinc-500">
                Alur lengkap hulu ke hilir dari Penerimaan CRM, Git, Kanban, QA Staging, hingga Rilis & Garansi.
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

        {/* 6 Step Navigation Tabs (Linear style) */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/70 overflow-x-auto px-6 pt-2 shrink-0 gap-1.5">
          {sopSteps.map((step) => {
            const Icon = step.icon;
            const isActive = step.step === activeStepTab;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStepTab(step.step)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-zinc-900 bg-white text-zinc-900 shadow-xs'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {step.step}
                </span>
                <span>{step.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* Step Hero Summary */}
          <div className="bg-gradient-to-r from-zinc-50 to-indigo-50/30 p-5 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                  Tahapan Ke-{currentStep.step} dari 6
                </span>
                <span className="text-xs font-bold text-zinc-700">
                  {currentStep.title}
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-800 leading-snug">
                {currentStep.summary}
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateTab(currentStep.targetTab);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-xs shrink-0"
            >
              <span>{currentStep.tabLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Detail Cards per Step */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentStep.details.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2 flex flex-col justify-between hover:border-zinc-300 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold font-mono flex items-center justify-center shrink-0 border border-indigo-200/80">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900">
                      {item.heading}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>SOP Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>

          {/* 3 Active Projects Integration Summary */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 text-xs text-zinc-600 space-y-2">
            <div className="font-semibold text-zinc-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-zinc-700" />
              <span>3 Kasus Dummy Proyek Nyata yang Telah Diintegrasikan:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                <div className="font-bold text-zinc-900">1. Perpustakaan Digital Kampus</div>
                <div className="text-zinc-500 mt-0.5">Laravel 11 Microservices, React 19 OPAC, Sirkulasi & Denda.</div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                <div className="font-bold text-zinc-900">2. Arena Futsal Pro</div>
                <div className="text-zinc-500 mt-0.5">Booking slot interaktif, QRIS DP dinamis, POS sewa rompi & kantin.</div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                <div className="font-bold text-zinc-900">3. POS Multi-Outlet Kopi Kenangan</div>
                <div className="text-zinc-500 mt-0.5">Kasir offline-first IndexedDB, atomic inventory sync, split bill.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/80 shrink-0 text-xs">
          <div className="text-zinc-500">
            Gunakan panduan ini untuk memahami dan mendemonstrasikan SOP software house.
          </div>

          <div className="flex items-center gap-2">
            {activeStepTab > 1 && (
              <button
                onClick={() => setActiveStepTab(activeStepTab - 1)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-medium transition-colors"
              >
                ← Tahap Sebelumnya
              </button>
            )}

            {activeStepTab < 6 ? (
              <button
                onClick={() => setActiveStepTab(activeStepTab + 1)}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-colors"
              >
                Tahap Selanjutnya →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
              >
                Tutup & Mulai Pengerjaan ✓
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
