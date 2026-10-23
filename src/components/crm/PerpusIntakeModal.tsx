import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Users, 
  Workflow, 
  CheckCircle2, 
  ArrowRight, 
  Server, 
  Database, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  ExternalLink, 
  GitBranch, 
  ChevronRight, 
  X, 
  Smartphone, 
  Cpu, 
  Terminal, 
  CheckSquare, 
  Calendar, 
  BadgeCheck,
  Search,
  Barcode,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PerpusIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProject: (projectId: string) => void;
  onOpenConvertDeal?: () => void;
}

export const PerpusIntakeModal: React.FC<PerpusIntakeModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProject,
  onOpenConvertDeal
}) => {
  const { teamMembers, projects, setSelectedProjectId } = useApp();
  const [activeTab, setActiveTab] = useState<'stages' | 'modules' | 'roles' | 'architecture' | 'contract'>('stages');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState<number>(0);

  if (!isOpen) return null;

  const perpusProject = projects.find(p => p.id === 'proj-perpustakaan' || p.code === 'LIB-DIG');

  // 6 Tahapan Alur Penerimaan CRM
  const stages = [
    {
      step: '01',
      title: 'Deal Won & Closing CRM',
      subtitle: 'Kualifikasi Kebutuhan & Kesepakatan Kontrak',
      icon: DollarSign,
      color: 'from-blue-500 to-indigo-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
      description: 'PIC Kampus (Kepala Perpustakaan Dra. Hj. Ratna Wulandari) menyetujui penawaran kontrak Rp 185 Juta dengan arsitektur microservices terdistribusi. Deal status berubah menjadi Closing/Won di sistem CRM.',
      deliverables: [
        'Dokumen Kontrak Fixed Price (Rp 185.000.000)',
        'Kesepakatan Termin 30% - 40% - 30%',
        'Garansi sistem 12 bulan (hingga Oktober 2027)'
      ],
      actor: 'Account Executive & Client PIC'
    },
    {
      step: '02',
      title: 'Technical Scoping & Arsitektur Microservices',
      subtitle: 'Decoupling Monolith ke Service Terisolasi',
      icon: Cpu,
      color: 'from-indigo-500 to-violet-600',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      description: 'Lead Architect & PM memetakan kebutuhan kampus menjadi 2 microservice backend Laravel 11 (Katalog & Sirkulasi), 2 portal frontend React 19 (OPAC Mahasiswa & Kasir Petugas), serta 1 Reverse Proxy Gateway.',
      deliverables: [
        'Arsitektur Domain-Driven Design (DDD)',
        'Spesifikasi Kontrak REST API (OpenAPI 3.1)',
        'Redis Atomic Lock untuk sirkulasi buku'
      ],
      actor: 'Asisyah (PM) & Azi (Fullstack/Lead)'
    },
    {
      step: '03',
      title: 'Otomasi GitHub Provisioning & Branch Per Modul',
      subtitle: 'Multi-Branch Git Workflow Otomatis',
      icon: GitBranch,
      color: 'from-violet-500 to-purple-600',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
      description: 'Webhook konversi CRM otomatis menginisialisasi repository GitHub dan membuat 5 isolated feature branch yang ditugaskan ke masing-masing developer sesuai spesialisasinya.',
      deliverables: [
        'Repo: github.com/softwarehouse/perpustakaan-digital-microservices',
        'Branch feature/katalog-microservice (Laravel 11)',
        'Branch feature/react-portal-opac (React 19)',
        'Branch feature/api-gateway-docker (Traefik)'
      ],
      actor: 'GitHub CI/CD Automation Webhook'
    },
    {
      step: '04',
      title: 'Otomasi Backlog Generation & Alokasi 5 Role',
      subtitle: 'Injeksi User Stories & Workload Balancing',
      icon: Layers,
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      description: 'Sistem men-generate 27 user story dan task teknis lengkap dengan kriteria penerimaan (Acceptance Criteria), estimasi jam, bobot story point, dan langsung mendarat di Sprint 1 Backlog.',
      deliverables: [
        'Jaka (Backend): 3 task arsitektur DB & sirkulasi (64 jam)',
        'Aldyana (Frontend): 3 task OPAC & scanner barcode (62 jam)',
        'Parhan (QA): 2 task security pentest & matrix testing (30 jam)',
        'Asisyah (PM): 3 task tata kelola & UAT rektorat (34 jam)',
        'Azi (Fullstack): 2 task gateway Docker & logging (34 jam)'
      ],
      actor: 'Asisyah (PM) & AI Backlog Synthesizer'
    },
    {
      step: '05',
      title: 'Eksekusi Sprint, CI/CD Docker & Testing QA',
      subtitle: 'Siklus Pengerjaan 14 Hari & Verifikasi Staging',
      icon: Terminal,
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      description: 'Developer melakukan commit ke branch masing-masing. GitHub Actions menjalankan unit test PHPUnit, build Docker container, dan deploy preview ke staging server untuk diuji oleh QA Parhan dengan K6 stress test.',
      deliverables: [
        'Pull Request Review & Linting Otomatis',
        'Load Test K6 lolos 2.000 concurrent RPS',
        'QA Sign-Off verifikasi Staging lulus 100%'
      ],
      actor: 'Jaka, Aldyana, Azi, & Parhan (QA)'
    },
    {
      step: '06',
      title: 'UAT Rektorat, Go-Live & Penagihan Termin',
      subtitle: 'Serah Terima Resmi & Aktivasi Garansi',
      icon: BadgeCheck,
      color: 'from-teal-500 to-emerald-600',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/80',
      description: 'Presentasi UAT di hadapan Kepala Perpustakaan & Tim IT Rektorat. Setelah Berita Acara UAT ditandatangani, branch di-merge ke main, aplikasi go-live, dan invoice Termin 2 & 3 diterbitkan ke Finance.',
      deliverables: [
        'Berita Acara Serah Terima (BAST) Kampus',
        'Invoice Termin 2 (40%) & Termin 3 (30%) Terbit',
        'Aktivasi Kuota Pemeliharaan 25 Jam & Garansi 12 Bulan'
      ],
      actor: 'Asisyah (PM) & Finance Accounting'
    }
  ];

  // 7 Modul Lengkap Aplikasi Perpustakaan Digital
  const modules = [
    {
      code: 'LIB-EPIC-1',
      title: 'Microservice Katalog Buku, Pengarang & ISBN',
      badge: 'Laravel 11 Backend API',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/70',
      assignee: 'Jaka',
      assigneeRole: 'Backend Dev',
      assigneeAvatar: 'JK',
      estimate: '24 Jam',
      stack: ['Laravel 11', 'PostgreSQL 16', 'Redis Cache', 'ISBN-13 Validator'],
      description: 'Microservice mandiri yang mengelola data master buku, entitas pengarang, penerbit, nomor panggil DDC (Dewey Decimal Classification), dan metadata cover buku.',
      features: [
        {
          name: 'Skema Database PostgreSQL E-Catalog',
          detail: 'Tabel books, authors, book_copies, categories, dan index full-text tsvector pada judul dan nama pengarang.'
        },
        {
          name: 'Validasi Algoritma Checksum ISBN-13',
          detail: 'Validasi ketat 13 digit angka standar perpustakaan nasional via FormRequest Laravel.'
        },
        {
          name: 'Redis Cache Layer Katalog Populer (TTL 1 Jam)',
          detail: 'Penyimpanan cache query daftar buku trending untuk respon API super cepat (< 25ms).'
        },
        {
          name: 'RESTful Resource API Endpoints',
          detail: 'Endpoint GET /api/v1/books, GET /api/v1/books/{id}, POST /api/v1/books dengan pagination cursor.'
        }
      ]
    },
    {
      code: 'LIB-EPIC-2',
      title: 'Portal Katalog Pencarian OPAC & Detail Buku',
      badge: 'React 19 SPA Frontend',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200/70',
      assignee: 'Aldyana',
      assigneeRole: 'Frontend Dev',
      assigneeAvatar: 'AL',
      estimate: '26 Jam',
      stack: ['React 19', 'Tailwind CSS', 'TanStack Query', 'Lucide Icons'],
      description: 'Portal publik Online Public Access Catalog (OPAC) yang diakses mahasiswa melalui browser desktop, tablet kampus, maupun smartphone untuk mencari dan memesan buku.',
      features: [
        {
          name: 'Pencarian Instan Debounced Full-Text',
          detail: 'Pencarian judul/pengarang dengan auto-suggest keyword 300ms tanpa reload halaman.'
        },
        {
          name: 'Filter Multi-Faset (Kategori, Tahun, Bahasa)',
          detail: 'Sidebar filter interaktif dengan visualisasi tag chip aktif dan reset otomatis.'
        },
        {
          name: 'Visualisasi Status Ketersediaan & Lokasi Rak',
          detail: 'Badge status "Tersedia di Rak A-04" atau "Sedang Dipinjam (Kembali 24 Okt)" dengan warna kontras.'
        },
        {
          name: 'Halaman Detail Buku & Preview Sinopsis',
          detail: 'Informasi komprehensif buku: nomor DDC, sinopsis, daftar cetakan, dan tombol Booking/Reservasi.'
        }
      ]
    },
    {
      code: 'LIB-EPIC-3',
      title: 'Microservice Sirkulasi Peminjaman & Engine Denda',
      badge: 'Laravel 11 Backend API',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/70',
      assignee: 'Jaka',
      assigneeRole: 'Backend Dev',
      assigneeAvatar: 'JK',
      estimate: '28 Jam',
      stack: ['Laravel 11', 'Redis Atomic Mutex', 'Laravel Scheduler', 'Postgres Transaction'],
      description: 'Jantung transaksi sirkulasi perpustakaan: mencatat transaksi peminjaman buku, batas durasi pinjam 7 hari, pengembalian, perpanjangan, dan sanksi denda keterlambatan.',
      features: [
        {
          name: 'Redis Atomic Distributed Lock (Anti Double-Borrow)',
          detail: 'Mencegah kondisi race condition jika 2 mahasiswa meminjam 1 eksemplar buku tersisa secara bersamaan.'
        },
        {
          name: 'Validasi Kuota Peminjaman (Maksimal 3 Buku)',
          detail: 'Pengecekan otomatis limit pinjaman mahasiswa dan blokir jika ada denda belum lunas > Rp 20.000.'
        },
        {
          name: 'Engine Kalkulasi Denda Keterlambatan Rp 2.000/Hari',
          detail: 'Cron scheduler otomatis berjalan setiap malam jam 00:01 WIB menghitung denda per hari telat.'
        },
        {
          name: 'Log Audit Transaksi & Riwayat Eksemplar',
          detail: 'Pencatatan riwayat siapa peminjam buku, tanggal pinjam, tanggal kembali, dan nama petugas jaga.'
        }
      ]
    },
    {
      code: 'LIB-EPIC-4',
      title: 'Meja Sirkulasi Petugas & Dashboard Mahasiswa',
      badge: 'React 19 SPA Frontend',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200/70',
      assignee: 'Aldyana',
      assigneeRole: 'Frontend Dev',
      assigneeAvatar: 'AL',
      estimate: '22 Jam',
      stack: ['React 19', 'Barcode Scanner API', 'Thermal ESC/POS', 'Zustand State'],
      description: 'Antarmuka khusus petugas meja sirkulasi perpustakaan untuk memproses peminjaman/pengembalian kilat via barcode scanner serta portal mandiri mahasiswa.',
      features: [
        {
          name: 'Scanner Barcode Cepat (Kartu Mahasiswa & Buku)',
          detail: 'Input keyboard-wedge barcode scanner 1D/2D instan dengan validasi bunyi beep konfirmasi.'
        },
        {
          name: 'Cetak Bukti Peminjaman Slip Thermal 58mm',
          detail: 'Format cetak kuitansi thermal ringkas mencantumkan tanggal batas pengembalian buku.'
        },
        {
          name: 'Dashboard Riwayat & Status Pinjaman Mahasiswa',
          detail: 'Panel akun mahasiswa menampilkan buku aktif, countdown hari tersisa, dan riwayat bebas pustaka.'
        },
        {
          name: 'Modul Cetak Label Barcode Punggung Buku',
          detail: 'Fitur cetak stiker nomor panggil DDC dan barcode buku untuk ditempel pada fisik buku baru.'
        }
      ]
    },
    {
      code: 'LIB-EPIC-5',
      title: 'API Gateway, Docker Containerization & WhatsApp Bot',
      badge: 'Infrastruktur & DevOps (Fullstack)',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/70',
      assignee: 'Azi',
      assigneeRole: 'Full stack Dev',
      assigneeAvatar: 'AZ',
      estimate: '28 Jam',
      stack: ['Traefik Gateway', 'Docker Compose', 'Fonnte/Twilio WA API', 'Prometheus & Grafana'],
      description: 'Infrastruktur orkestrasi terpusat yang menghubungkan seluruh microservices, routing domain, rate limiting, serta notifikasi otomatis WhatsApp pengingat buku.',
      features: [
        {
          name: 'Traefik Reverse Proxy API Gateway & SSL Otomatis',
          detail: 'Routing lalu lintas HTTP/2, SSL Let’s Encrypt, CORS header, dan pemblokiran serangan DDoS.'
        },
        {
          name: 'Multi-Container Docker Compose Orchestrator',
          detail: 'Setup 5 container terisolasi: app-katalog, app-sirkulasi, frontend-react, postgres-db, dan redis-cache.'
        },
        {
          name: 'WhatsApp Reminder Gateway Otomatis H-1 Pengembalian',
          detail: 'Bot WhatsApp otomatis mengirimkan pesan santun pengingat H-1 sebelum buku jatuh tempo jam 08.00 WIB.'
        },
        {
          name: 'Observability & Monitoring Grafana/Prometheus',
          detail: 'Monitoring real-time traffic RPS, database latency p99, dan alert bot Telegram jika ada service down.'
        }
      ]
    },
    {
      code: 'LIB-EPIC-6',
      title: 'Test Matrix Sirkulasi, K6 Load Testing & QA Sign-Off',
      badge: 'Quality Assurance & Security',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/70',
      assignee: 'Parhan',
      assigneeRole: 'QA Engineer',
      assigneeAvatar: 'PR',
      estimate: '20 Jam',
      stack: ['K6 Load Test', 'Playwright E2E', 'OWASP ZAP', 'PHPUnit Test Matrix'],
      description: 'Rangkaian pengujian jaminan kualitas menyeluruh: dari pengujian fungsional sirkulasi, uji beban konkurensi tinggi, audit keamanan, hingga verifikasi cross-browser.',
      features: [
        {
          name: 'Stress Test K6 (2.000 Concurrent Requests/Sec)',
          detail: 'Simulasi lonjakan traffic mahasiswa saat jam buka perpustakaan dengan target response time < 200ms.'
        },
        {
          name: 'Security Pentest: SQL Injection Guard & Rate Limiter',
          detail: 'Audit keamanan OWASP Top 10 pada endpoint pencarian OPAC dan mekanisme sanitasi query.'
        },
        {
          name: 'Cross-Browser Matrix Testing (Safari, Chrome, Firefox)',
          detail: 'Verifikasi render layout responsif di desktop Mac/Windows, iPad meja baca, dan Android mahasiswa.'
        },
        {
          name: 'Verifikasi Formal QA Sign-Off Staging Gatekeeper',
          detail: 'Pemeriksaan checklist 32 kriteria penerimaan sebelum kode diizinkan merge ke production.'
        }
      ]
    },
    {
      code: 'LIB-EPIC-7',
      title: 'Sprint Backlog, UAT Stakeholder & Tata Kelola Proyek',
      badge: 'Project Management & Governance',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      assignee: 'Asisyah',
      assigneeRole: 'Project Manajer',
      assigneeAvatar: 'AS',
      estimate: '14 Jam',
      stack: ['Scrum Sprint Planning', 'UAT Acceptance Sign-Off', 'RACI Matrix', 'Finance Invoicing'],
      description: 'Tata kelola proyek perangkat lunak profesional: memimpin sprint planning, koordinasi stakeholder kampus, mitigasi risiko integrasi, dan penagihan termin finansial.',
      features: [
        {
          name: 'Sprint Planning & Breakdown User Story',
          detail: 'Penyusunan alokasi kapasitas jam kerja 5 engineer dan penentuan Definition of Done (DoD).'
        },
        {
          name: 'Rapat Kickoff & Berita Acara Scope of Work (SOW)',
          detail: 'Penyelarasan kebutuhan bersama Kepala Perpustakaan & Tim Puskom IT Kampus.'
        },
        {
          name: 'Sesi UAT (User Acceptance Testing) Bersama Pustakawan',
          detail: 'Pendampingan uji coba langsung petugas perpustakaan di meja sirkulasi kampus.'
        },
        {
          name: 'Verifikasi Termin Finansial & Handover Berita Acara',
          detail: 'Penerbitan faktur tagihan Termin 1, 2, dan 3 sesuai capaian milestone yang disepakati.'
        }
      ]
    }
  ];

  // 5 Role Tim
  const teamRoster = [
    {
      id: 'user-dev-3',
      name: 'Jaka',
      role: 'Backend Dev',
      badge: 'Laravel & Database Specialist',
      avatar: 'JK',
      avatarBg: 'bg-sky-600',
      allocatedHours: 52,
      assignedEpics: ['LIB-EPIC-1 (Katalog Buku)', 'LIB-EPIC-3 (Engine Sirkulasi & Denda)'],
      focus: 'Mengembangkan REST API Laravel 11, migrasi PostgreSQL, Redis distributed lock, dan cron scheduler denda keterlambatan.'
    },
    {
      id: 'user-dev-2',
      name: 'Aldyana',
      role: 'Frontend Dev',
      badge: 'React & UI/UX Specialist',
      avatar: 'AL',
      avatarBg: 'bg-cyan-600',
      allocatedHours: 48,
      assignedEpics: ['LIB-EPIC-2 (Portal OPAC)', 'LIB-EPIC-4 (Meja Sirkulasi Barcode)'],
      focus: 'Membangun portal pencarian OPAC debounced, visualisasi rak buku, antarmuka kasir scanner barcode, dan cetak slip thermal 58mm.'
    },
    {
      id: 'user-dev-1',
      name: 'Azi',
      role: 'Full stack',
      badge: 'DevOps, Gateway & Fullstack',
      avatar: 'AZ',
      avatarBg: 'bg-indigo-600',
      allocatedHours: 46,
      assignedEpics: ['LIB-EPIC-5 (API Gateway, Docker & WhatsApp)'],
      focus: 'Mengonfigurasi Traefik reverse proxy, orchestrator Docker Compose multi-service, gateway bot WhatsApp, dan dashboard Grafana.'
    },
    {
      id: 'user-qa',
      name: 'Parhan',
      role: 'QA',
      badge: 'Quality Assurance & Pentester',
      avatar: 'PR',
      avatarBg: 'bg-rose-600',
      allocatedHours: 34,
      assignedEpics: ['LIB-EPIC-6 (Test Matrix & K6 Load Testing)'],
      focus: 'Membuat script K6 load test 2.000 RPS, uji penetrasi keamanan SQLi pada OPAC, pengujian cross-browser, dan sertifikasi QA Sign-Off.'
    },
    {
      id: 'user-pm',
      name: 'Asisyah',
      role: 'Project Manajer',
      badge: 'PM & Agile Scrum Master',
      avatar: 'AS',
      avatarBg: 'bg-emerald-600',
      allocatedHours: 34,
      assignedEpics: ['LIB-EPIC-7 (Tata Kelola Sprint & UAT Rektorat)'],
      focus: 'Memimpin sprint grooming, koordinasi stakeholder rektorat kampus, manajemen risiko API SSO, dan validasi dokumen termin pembayaran.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-3 md:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-auto shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-zinc-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 px-6 border-b border-zinc-200/80 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs text-lg font-bold">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Alur Penerimaan CRM: Sistem Perpustakaan Digital Kampus
                </h2>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                  Laravel Microservices & React 19 SPA
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                  LIB-DIG
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Panduan komprehensif alur penerimaan dari closing CRM, technical scoping, GitHub provisioning, alokasi 5 role tim, hingga UAT.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {perpusProject && (
              <button
                onClick={() => {
                  setSelectedProjectId(perpusProject.id);
                  onNavigateToProject(perpusProject.id);
                  onClose();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
              >
                <span>Buka Proyek Perpus di Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Linear Style) */}
        <div className="flex items-center px-6 border-b border-zinc-200/80 bg-white gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('stages')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'stages'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>1. Alur 6 Tahapan Penerimaan</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'modules'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Semua 7 Modul & Fitur Rinci ({modules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'roles'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Pembagian 5 Role Tim ({teamRoster.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'architecture'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>4. Arsitektur Microservices</span>
          </button>

          <button
            onClick={() => setActiveTab('contract')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'contract'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>5. Kontrak, Termin & SLA</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 space-y-6">

          {/* TAB 1: 6 TAHAPAN ALUR PENERIMAAN */}
          {activeTab === 'stages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 border border-zinc-200/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    SOP Penerimaan Standar Software House (Linear / Vercel Grade)
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Dari penutupan negosiasi penjualan di CRM hingga serah terima UAT aplikasi perpustakaan kampus.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Total Siklus: 2 Sprint (28 Hari)
                </span>
              </div>

              {/* Step cards timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stages.map((st, idx) => {
                  const Icon = st.icon;
                  return (
                    <div
                      key={st.step}
                      className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.badgeColor}`}>
                            Langkah {st.step}
                          </span>
                          <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-zinc-900">
                            {st.title}
                          </h4>
                          <div className="text-[11px] text-zinc-400 font-medium">
                            {st.subtitle}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {st.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 space-y-2">
                        <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          Deliverable Utama:
                        </div>
                        <ul className="space-y-1">
                          {st.deliverables.map((d, dIdx) => (
                            <li key={dIdx} className="text-[11px] text-zinc-700 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="text-[10px] text-zinc-500 font-mono bg-zinc-50 p-1.5 rounded border border-zinc-200/60 mt-2">
                          PIC: {st.actor}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SEMUA 7 MODUL & FITUR RINCI */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left module selector */}
              <div className="lg:col-span-5 space-y-2">
                <div className="text-xs font-medium text-zinc-500 px-1 mb-2">
                  Daftar 7 Modul Terdistribusi:
                </div>
                {modules.map((m, idx) => {
                  const isSelected = selectedModuleIdx === idx;
                  return (
                    <button
                      key={m.code}
                      onClick={() => setSelectedModuleIdx(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-white border-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-zinc-900/10'
                          : 'bg-white/70 border-zinc-200/80 hover:bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {m.code}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                            {m.badge}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-zinc-900 line-clamp-1">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                          <span>Assignee: <strong className="text-zinc-800">{m.assignee}</strong> ({m.assigneeRole})</span>
                          <span>·</span>
                          <span className="font-mono text-zinc-600">{m.estimate}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-zinc-900 translate-x-0.5' : 'text-zinc-300'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Right module detail */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-5">
                {(() => {
                  const curr = modules[selectedModuleIdx];
                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                              {curr.code}
                            </span>
                            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${curr.badgeColor}`}>
                              {curr.badge}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-900">
                            {curr.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{curr.estimate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-medium">
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{curr.assignee} ({curr.assigneeRole})</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {curr.description}
                      </p>

                      {/* Tech stack tags */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Komponen & Teknologi yang Digunakan:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {curr.stack.map(st => (
                            <span key={st} className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/70">
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Features List */}
                      <div className="space-y-2.5 pt-2">
                        <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                          <span>Fitur-Fitur & Spesifikasi Teknis:</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {curr.features.map((feat, fIdx) => (
                            <div key={fIdx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                              <div className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span>{feat.name}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 pl-3.5 leading-relaxed">
                                {feat.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: PEMBAGIAN 5 ROLE TIM */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 border border-zinc-200/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">
                    Matriks Distribusi Beban Kerja 5 Anggota Tim Software House
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Alokasi tugas spesifik tanpa tumpang tindih untuk kelancaran sprint release.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium px-3 py-1 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                    Total: 214 Jam Kerja
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamRoster.map(m => (
                  <div
                    key={m.id}
                    className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${m.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                          {m.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-zinc-900">
                            {m.name}
                          </div>
                          <div className="text-xs text-zinc-500 font-medium">
                            {m.role}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 inline-block">
                        {m.badge}
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {m.focus}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 space-y-2">
                      <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Modul Tanggung Jawab:
                      </div>
                      <div className="space-y-1">
                        {m.assignedEpics.map((ep, eIdx) => (
                          <div key={eIdx} className="text-[11px] font-mono text-zinc-700 bg-zinc-50 p-1.5 rounded border border-zinc-200/60">
                            {ep}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-zinc-500">Estimasi Sprint 1:</span>
                        <span className="font-mono font-semibold text-zinc-900">{m.allocatedHours} Jam</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ARSITEKTUR TEKNIS MICROSERVICES */}
          {activeTab === 'architecture' && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Topologi Arsitektur Terdistribusi (Laravel 11 Microservices + React 19)
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Arsitektur dirancang anti single-point-of-failure (SPOF) dengan pemisahan domain layanan dan database caching.
                </p>
              </div>

              {/* Architecture visual diagram */}
              <div className="p-6 rounded-xl bg-zinc-950 text-white font-mono text-xs space-y-6 overflow-x-auto">
                <div className="text-center text-zinc-400 pb-2 border-b border-zinc-800">
                  [CLIENT DEVICES: Mahasiswa OPAC, Meja Petugas Barcode, Smart Mobile]
                </div>

                <div className="flex items-center justify-center">
                  <div className="bg-blue-600/20 border border-blue-500/40 text-blue-300 p-3 rounded-lg text-center w-full max-w-lg">
                    <div className="font-bold text-white">Traefik Reverse Proxy API Gateway (Port 80/443)</div>
                    <div className="text-[11px] text-blue-200/80 mt-0.5">SSL Auto-Renewal, CORS, Rate Limiting (100 req/min), Auth JWT Verification</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service 1 */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-sky-400 font-bold">
                      <span>SERVICE A: Katalog Buku</span>
                      <span className="text-[10px] bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">Laravel 11 API</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      • Port Internal: 8001<br />
                      • Database: PostgreSQL (Schema: catalog)<br />
                      • Cache: Redis db-0 (TTL 3600s)<br />
                      • Fitur: ISBN Checksum, Metadata Pengarang, DDC
                    </div>
                  </div>

                  {/* Service 2 */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-amber-400 font-bold">
                      <span>SERVICE B: Sirkulasi & Denda</span>
                      <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">Laravel 11 Engine</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      • Port Internal: 8002<br />
                      • Database: PostgreSQL (Schema: circulation)<br />
                      • Mutex: Redis Distributed Lock (Anti Double-Borrow)<br />
                      • Worker: Laravel Cron Scheduler (Denda Rp 2.000/hari)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service 3 Frontend */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>FRONTEND: Portal OPAC & Kasir</span>
                      <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">React 19 SPA</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      • Nginx Static Alpine (Port 3000)<br />
                      • Barcode Scanner Web API & ESC/POS Thermal Print<br />
                      • Debounced Instant Full-text Search (&lt; 50ms)<br />
                      • Offline Fallback Service Worker
                    </div>
                  </div>

                  {/* Service 4 Integrasi */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>INTEGRASI: WA Gateway & Audit</span>
                      <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">Worker Daemon</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      • WhatsApp Fonnte Cloud API (Reminder H-1)<br />
                      • Sentry Error Ingestion envelope pipeline<br />
                      • Prometheus Metric Exporter (RPS & Latency p99)<br />
                      • Grafana Dashboards untuk IT Rektorat
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KONTRAK, TERMIN & SLA */}
          {activeTab === 'contract' && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Struktur Komersial, Termin Penagihan & Garansi Pemeliharaan
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Kontrak disepakati resmi antara PT Agensi Software House dan Universitas Nusantara Cendekia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Termin 1 (Kick-off & GitHub)</div>
                  <div className="text-lg font-bold text-zinc-900">Rp 55.500.000</div>
                  <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                    DP 30% Terbayar
                  </span>
                  <p className="text-xs text-zinc-500 pt-1">
                    Syarat pencairan: Tanda tangan kontrak, kick-off meeting, dan inisialisasi repository GitHub.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Termin 2 (Staging & UAT Sign-Off)</div>
                  <div className="text-lg font-bold text-zinc-900">Rp 74.000.000</div>
                  <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                    Milestone 40%
                  </span>
                  <p className="text-xs text-zinc-500 pt-1">
                    Syarat pencairan: Selesainya integrasi 7 modul di Staging dan lolos pengujian UAT Pustakawan.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Termin 3 (Go-Live & Handover)</div>
                  <div className="text-lg font-bold text-zinc-900">Rp 55.500.000</div>
                  <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Pelunasan 30%
                  </span>
                  <p className="text-xs text-zinc-500 pt-1">
                    Syarat pencairan: Deployment ke domain resmi kampus dan penyerahan dokumentasi teknis.
                  </p>
                </div>
              </div>

              {/* SLA & Maintenance Guarantee */}
              <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Garansi & Service Level Agreement (SLA) Pasca Go-Live:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-zinc-900">• Durasi Garansi Bug:</span>
                    <span>12 Bulan (Hingga Oktober 2027) tanpa biaya tambahan untuk semua bug fungsional.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-zinc-900">• Kuota Maintenance:</span>
                    <span>25 Jam / Bulan untuk request revisi minor dan asistensi pemeliharaan data.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-zinc-900">• SLA Tanggap Kritis (S1):</span>
                    <span>Maksimal 2 Jam respons dan penyelesaian patch cepat dalam 6 jam.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-zinc-900">• Backup Data:</span>
                    <span>Automated daily snapshot database PostgreSQL ke cold storage terenkripsi S3.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-zinc-200/80 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sistem CRM terhubung dengan Backlog, Kanban Board & GitHub Actions</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenConvertDeal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenConvertDeal();
                }}
                className="px-3.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200/80 transition-colors"
              >
                Buka Wizard Konversi CRM
              </button>
            )}

            {perpusProject && (
              <button
                onClick={() => {
                  setSelectedProjectId(perpusProject.id);
                  onNavigateToProject(perpusProject.id);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all"
              >
                <span>Lihat Proyek Perpustakaan di Kanban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
