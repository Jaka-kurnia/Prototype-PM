import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CRMDeal, TeamMember } from '../../types';
import { 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Building, 
  DollarSign, 
  Calendar, 
  Layers,
  FolderGit2,
  GitBranch,
  User,
  Clock,
  ExternalLink,
  ShieldCheck,
  Plus,
  Trash2,
  Settings,
  Loader2,
  Check,
  Store,
  Info,
  CheckSquare,
  Users,
  UserCheck,
  SlidersHorizontal,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Workflow,
  FileText,
  CheckCircle,
  Eye,
  BookOpen
} from 'lucide-react';
import { PerpusIntakeModal } from './PerpusIntakeModal';

interface CrmDealsViewProps {
  onNavigateToProject: (projectId: string) => void;
  onNavigateToSettings?: () => void;
}

interface ModuleDraft {
  id: string;
  epicKey: string;
  title: string;
  description?: string;
  assigneeId: string;
  contributorIds?: string[];
  estimateHours: number;
}

interface TemplateDefinition {
  id: string;
  name: string;
  badge: string;
  icon: string;
  summary: string;
  modules: {
    keySuffix: string;
    title: string;
    description: string;
    defaultAssigneeId: string;
    estimateHours: number;
  }[];
}

const TEMPLATES: Record<string, TemplateDefinition> = {
  perpustakaan_microservices: {
    id: 'perpustakaan_microservices',
    name: 'Sistem Perpustakaan Digital Kampus (Laravel Microservices & React SPA)',
    badge: 'Microservices & Edu Tech',
    icon: '📚',
    summary: 'Arsitektur microservices terdistribusi: Microservice Katalog Laravel 11, Engine Sirkulasi & Denda Redis Mutex, Portal OPAC React 19, API Gateway Traefik, WhatsApp Reminder, dan Testing QA K6/Playwright.',
    modules: [
      {
        keySuffix: 'EPIC-1',
        title: 'Microservice Katalog Buku, Pengarang & ISBN (Laravel Backend)',
        description: 'REST API microservice buku dengan Laravel 11, skema PostgreSQL, Redis caching, dan validasi ISBN-13.',
        defaultAssigneeId: 'user-dev-3', // Jaka (Backend Dev)
        estimateHours: 24
      },
      {
        keySuffix: 'EPIC-2',
        title: 'Portal Katalog Pencarian OPAC & Detail Buku (React Frontend)',
        description: 'Antarmuka pencarian cepat full-text judul/penulis, filter multi-kategori buku, dan visualisasi ketersediaan di rak.',
        defaultAssigneeId: 'user-dev-2', // Aldyana (Frontend Dev)
        estimateHours: 26
      },
      {
        keySuffix: 'EPIC-3',
        title: 'Microservice Sirkulasi Peminjaman & Perhitungan Denda (Laravel Backend)',
        description: 'Logika transaksi peminjaman, batas durasi pinjam 7 hari, denda otomatis Rp 2.000/hari, dan atomic lock.',
        defaultAssigneeId: 'user-dev-3', // Jaka (Backend Dev)
        estimateHours: 28
      },
      {
        keySuffix: 'EPIC-4',
        title: 'Meja Sirkulasi Petugas & Dashboard Mahasiswa (React Frontend)',
        description: 'UI kasir peminjaman barcode scanner kartu mahasiswa & buku, riwayat aktif pinjaman, dan slip checkout thermal.',
        defaultAssigneeId: 'user-dev-2', // Aldyana (Frontend Dev)
        estimateHours: 22
      },
      {
        keySuffix: 'EPIC-5',
        title: 'API Gateway, Docker Containerization & WhatsApp Reminder (Fullstack)',
        description: 'Reverse proxy Traefik/Nginx, orchestrator Docker Compose, dan bot WhatsApp notifikasi pengembalian H-1.',
        defaultAssigneeId: 'user-dev-1', // Azi (Full stack)
        estimateHours: 28
      },
      {
        keySuffix: 'EPIC-6',
        title: 'Matrix Test Case Sirkulasi, K6 Load Test & Staging QA Sign-Off (QA)',
        description: 'Rangkaian pengujian integrasi sirkulasi buku, stress test 2.000 concurrent RPS via K6, dan sign-off UAT.',
        defaultAssigneeId: 'user-qa', // Parhan (QA)
        estimateHours: 20
      },
      {
        keySuffix: 'EPIC-7',
        title: 'Sprint Backlog, UAT Stakeholder & Tata Kelola Proyek (PM)',
        description: 'Dokumentasi user story, koordinasi kickoff meeting kepala perpustakaan, dan verifikasi termin tagihan.',
        defaultAssigneeId: 'user-pm', // Asisyah (PM)
        estimateHours: 14
      }
    ]
  },
  pos_warung: {
    id: 'pos_warung',
    name: 'Sistem POS Warung Makan & Kelontong Nusantara (5 Modul Lengkap)',
    badge: 'Rekomendasi UKM / Warung',
    icon: '🍲',
    summary: 'Kebutuhan lengkap warung makan & sembako: kasir cepat layar sentuh, potong stok resep bahan baku, QRIS dinamis, rekap tutup kasir, dan otorisasi PIN owner.',
    modules: [
      {
        keySuffix: 'EPIC-1',
        title: 'Kasir Layar Sentuh & Cetak Struk ESC/POS Thermal 58mm',
        description: 'Input pesanan menu makanan/sembako cepat, hitung kembalian instan, diskon porsi/promo, dan cetak struk thermal 58mm bluetooth serta e-struk WhatsApp.',
        defaultAssigneeId: 'user-dev-1',
        estimateHours: 28
      },
      {
        keySuffix: 'EPIC-2',
        title: 'Manajemen Menu, Resep Bahan Baku & Pengurangan Stok Dapur',
        description: 'Katalog menu (porsi biasa, jumbo, level pedas) dan sembako, auto-potong stok bahan baku (beras, minyak, ayam, telur) saat pesanan selesai, dan alert belanja pasar.',
        defaultAssigneeId: 'user-dev-3',
        estimateHours: 36
      },
      {
        keySuffix: 'EPIC-3',
        title: 'Integrasi Pembayaran QRIS Dinamis & Manajemen Kas Laci Warung',
        description: 'Integrasi QRIS dinamis real-time (GoPay, OVO, Dana, ShopeePay, BCA) dan pencatatan kas laci (kas modal awal, kas keluar belanja bumbu/es, kas bon).',
        defaultAssigneeId: 'user-dev-2',
        estimateHours: 24
      },
      {
        keySuffix: 'EPIC-4',
        title: 'Rekap Tutup Kasir (End of Day / Z-Report) & Laporan Laba Bersih',
        description: 'Rekap tutup kasir harian per shift, laporan omzet kotor, modal bahan (HPP), laba bersih harian/bulanan, dan menu terlaris (best seller) via HP Owner.',
        defaultAssigneeId: 'user-dev-1',
        estimateHours: 20
      },
      {
        keySuffix: 'EPIC-5',
        title: 'Multi-Kasir, Shift Karyawan & Otorisasi PIN Owner untuk Void',
        description: 'Login kasir cepat berbasis PIN 4-digit saat ganti shift jaga, audit log kasir, dan pengamanan otorisasi PIN Owner saat pembatalan/void transaksi.',
        defaultAssigneeId: 'user-qa',
        estimateHours: 16
      }
    ]
  },
  booking_futsal: {
    id: 'booking_futsal',
    name: 'Sistem Booking Lapangan Futsal & Kasir Sewa (5 Modul Lengkap)',
    badge: 'Olahraga & Sport Hub',
    icon: '⚽',
    summary: 'Sistem sewa lapangan futsal real-time: kalender slot interaktif, DP QRIS dinamis countdown 15 menit, kasir kantin & sewa rompi/bola, WhatsApp ticket QR, dan rekap okupansi.',
    modules: [
      {
        keySuffix: 'EPIC-1',
        title: 'Manajemen Lapangan, Grid Jadwal Interaktif & Anti Double-Booking',
        description: 'Kalender visual pemilihan jam per lapangan (Rumput Sintetis / Vinyl Interlock), lock slot otomatis saat checkout, dan sinkronisasi real-time mencegah bentrok jadwal.',
        defaultAssigneeId: 'user-dev-1',
        estimateHours: 28
      },
      {
        keySuffix: 'EPIC-2',
        title: 'Pembayaran Down Payment (DP), QRIS Dinamis & Timer Kedaluwarsa 15 Menit',
        description: 'Generate kode bayar QRIS dinamis untuk DP (Rp 50.000 atau 30%), webhook verifikasi payment otomatis, dan countdown timer pembatalan jika telat bayar.',
        defaultAssigneeId: 'user-dev-2',
        estimateHours: 24
      },
      {
        keySuffix: 'EPIC-3',
        title: 'Rental Perlengkapan (Rompi Tim/Sepatu/Bola/Wasit) & POS Kasir Kantin',
        description: 'Add-on sewa perlengkapan pertandingan (rompi 2 warna, wasit resmi, bola match) dan kasir POS cepat untuk minuman isotonik/air mineral di venue.',
        defaultAssigneeId: 'user-dev-3',
        estimateHours: 20
      },
      {
        keySuffix: 'EPIC-4',
        title: 'WhatsApp Gateway Tiket QR Code & Broadcast Reminder H-2 Jam',
        description: 'Pengiriman otomatis bukti booking digital berisi QR Code check-in lapangan via WhatsApp resmi, serta notifikasi pengingat otomatis H-2 jam sebelum kick-off.',
        defaultAssigneeId: 'user-dev-1',
        estimateHours: 22
      },
      {
        keySuffix: 'EPIC-5',
        title: 'Pelunasan di Lokasi, Rekap Kasir Tutup Shift & Laporan Okupansi Lapangan',
        description: 'Antarmuka kasir resepsionis untuk scan QR tiket, pelunasan sisa bayar (cash/debit/QRIS), rekap kasir harian per shift, dan analitik okupansi peak vs non-peak hour.',
        defaultAssigneeId: 'user-qa',
        estimateHours: 18
      }
    ]
  },
  pos_system: {
    id: 'pos_system',
    name: 'Sistem ERP Klinik Gigi & Medika Prima (3 Modul)',
    badge: 'Kesehatan & Klinik',
    icon: '🏥',
    summary: 'Pendaftaran pasien, rekam medis odontogram interaktif, kasir farmasi obat, dan integrasi BPJS SatuSehat.',
    modules: [
      {
        keySuffix: 'EPIC-1',
        title: 'Pendaftaran Pasien & Rekam Medis Odontogram Interaktif',
        description: 'Rekam medis digital gigi odontogram, riwayat tindakan medis, dan reservasi dokter.',
        defaultAssigneeId: 'user-dev-1',
        estimateHours: 32
      },
      {
        keySuffix: 'EPIC-2',
        title: 'Kasir Klinik, Farmasi Obat & Billing Tindakan Medis',
        description: 'Penagihan tindakan medis, resep obat farmasi, dan cetak kuitansi rujukan.',
        defaultAssigneeId: 'user-dev-2',
        estimateHours: 28
      },
      {
        keySuffix: 'EPIC-3',
        title: 'Integrasi API BPJS SatuSehat & Pelaporan Dinkes',
        description: 'Koneksi API SatuSehat Kemenkes dan sinkronisasi rujukan faskes.',
        defaultAssigneeId: 'user-dev-3',
        estimateHours: 24
      }
    ]
  },
  ecommerce_platform: {
    id: 'ecommerce_platform',
    name: 'Marketplace B2B Material & Multi-Gudang (3 Modul)',
    badge: 'B2B & Logistik',
    icon: '🏗️',
    summary: 'Katalog grosir semen & baja, sistem kredit tenor tempo (TOP 30/60 Hari), dan manajemen multi-gudang distributor.',
    modules: [
      {
        keySuffix: 'EPIC-1',
        title: 'Katalog Grosir, Booking PO & Negosiasi Harga Volume',
        description: 'Katalog semen, baja, dan material berat dengan diskon kuantitas.',
        defaultAssigneeId: 'user-dev-1',
        estimateHours: 36
      },
      {
        keySuffix: 'EPIC-2',
        title: 'Sistem Kredit Tenor Tempo (Term of Payment 30/60 Hari)',
        description: 'Manajemen limit kredit kontraktor, verifikasi invoice tempo, dan penagihan otomatis.',
        defaultAssigneeId: 'user-dev-3',
        estimateHours: 32
      },
      {
        keySuffix: 'EPIC-3',
        title: 'Sinkronisasi Multi-Gudang Distributor & Armada Ekspedisi',
        description: 'Manajemen stok gudang regional dan tracking surat jalan armada truk.',
        defaultAssigneeId: 'user-dev-2',
        estimateHours: 28
      }
    ]
  }
};

export const CrmDealsView: React.FC<CrmDealsViewProps> = ({ 
  onNavigateToProject,
  onNavigateToSettings 
}) => {
  const { crmDeals, convertCrmDealToProject, teamMembers, githubSettings, projects } = useApp();
  
  const [selectedDeal, setSelectedDeal] = useState<CRMDeal | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('pos_warung');
  const [customProjectCode, setCustomProjectCode] = useState('');
  const [customRepoName, setCustomRepoName] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showPerpusModal, setShowPerpusModal] = useState(false);
  
  // Custom modules with team assignments & branches
  const [modules, setModules] = useState<ModuleDraft[]>([]);
  
  // Wizard steps (1: Identitas & Git, 2: Modul & Tim, 3: Review Blueprint)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState<boolean>(true);

  // Provisioning animation & live terminal logs state
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState<number>(0);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);

  // Multi-Module Developer Assignment Helper States
  const [showMultiModuleAssignModal, setShowMultiModuleAssignModal] = useState(false);
  const [multiAssignTargetDevId, setMultiAssignTargetDevId] = useState<string>('user-dev-1');
  const [multiAssignSelectedModIds, setMultiAssignSelectedModIds] = useState<string[]>([]);
  const [soloDevId, setSoloDevId] = useState<string>('user-dev-1');

  // Quick action: Assign all modules to single developer (Solo Dev mode)
  const handleAssignAllToDeveloper = (devId: string) => {
    setModules(modules.map(m => ({ ...m, assigneeId: devId })));
  };

  // Quick action: Distribute round robin
  const handleDistributeRoundRobin = () => {
    const devs = teamMembers.filter(m => 
      m.role.toLowerCase().includes('engineer') || 
      m.role.toLowerCase().includes('fullstack') || 
      m.role.toLowerCase().includes('developer')
    );
    const pool = devs.length > 0 ? devs : teamMembers;
    setModules(modules.map((m, idx) => ({
      ...m,
      assigneeId: pool[idx % pool.length].id
    })));
  };

  // Quick action: Multi-select modules for a specific developer
  const handleApplyMultiModuleAssignment = () => {
    if (multiAssignSelectedModIds.length === 0) return;
    setModules(modules.map(m => {
      if (multiAssignSelectedModIds.includes(m.id)) {
        return { ...m, assigneeId: multiAssignTargetDevId };
      }
      return m;
    }));
    setShowMultiModuleAssignModal(false);
  };

  const applyTemplateToModules = (templateKey: string, projectCode: string) => {
    const template = TEMPLATES[templateKey] || TEMPLATES.pos_warung;
    const newModules: ModuleDraft[] = template.modules.map((m, idx) => ({
      id: `mod_${Date.now()}_${idx}`,
      epicKey: `${projectCode}-${m.keySuffix}`,
      title: m.title,
      description: m.description,
      assigneeId: m.defaultAssigneeId || teamMembers[idx % teamMembers.length]?.id || 'user-dev-1',
      contributorIds: [],
      estimateHours: m.estimateHours
    }));
    setModules(newModules);
    setSelectedTemplateKey(templateKey);
  };

  const handleOpenConvert = (deal: CRMDeal) => {
    setSelectedDeal(deal);
    const code = deal.dealCode.replace('DEAL-', '').slice(0, 7).toUpperCase();
    setCustomProjectCode(code);
    
    // Choose appropriate template
    const templateKey = deal.templateType in TEMPLATES ? deal.templateType : 'pos_warung';
    setSelectedTemplateKey(templateKey);

    const repoSlug = `${code.toLowerCase()}-${templateKey.replace(/_/g, '-')}`;
    setCustomRepoName(repoSlug);

    applyTemplateToModules(templateKey, code);

    setWizardStep(1);
    setShowConvertModal(true);
    setIsProvisioning(false);
    setProvisioningStep(0);
    setProvisioningLogs([]);
  };

  const handleTemplateChange = (newKey: string) => {
    if (!selectedDeal) return;
    applyTemplateToModules(newKey, customProjectCode || 'POS-WRG');
    setCustomRepoName(`${customProjectCode.toLowerCase()}-${newKey.replace(/_/g, '-')}`);
  };

  const handleAddModule = () => {
    const nextIdx = modules.length + 1;
    const newMod: ModuleDraft = {
      id: 'mod_' + Date.now(),
      epicKey: `${customProjectCode || 'PROJ'}-EPIC-${nextIdx}`,
      title: `Modul Tambahan #${nextIdx}`,
      description: 'Pengembangan modul kustom sesuai permintaan spesifik klien.',
      assigneeId: teamMembers[nextIdx % teamMembers.length]?.id || 'user-dev-1',
      estimateHours: 20
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (id: string) => {
    if (modules.length <= 1) return;
    setModules(modules.filter(m => m.id !== id));
  };

  const handleUpdateModule = (id: string, updates: Partial<ModuleDraft>) => {
    setModules(modules.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleConfirmConvert = () => {
    if (!selectedDeal) return;
    
    setIsProvisioning(true);
    setProvisioningStep(1);
    setProvisioningLogs([
      `[00.08s] [INIT] Menginisialisasi konversi deal: ${selectedDeal.dealCode} (${selectedDeal.title})`,
      `[00.15s] [PM] Membuat entity proyek '${customProjectCode}' dengan termin ${selectedDeal.paymentTerms}`,
      `[00.22s] [SOW] Menyusun dokumen cakupan ${modules.length} modul dan kuota garansi 180 hari`,
      `[00.31s] [PIPELINE] Mengatur seluruh status modul & task ke status awal 'Backlog / Baru'`
    ]);

    // Step 2: GitHub Repository Creation
    setTimeout(() => {
      setProvisioningStep(2);
      setProvisioningLogs(prev => [
        ...prev,
        `[00.72s] [GITHUB-API] POST https://api.github.com/orgs/${githubSettings.organization}/repos`,
        `[00.88s] [GITHUB-API] Repository github.com/${githubSettings.organization}/${customRepoName} berhasil dibuat (Status: 201 Created)`,
        `[01.02s] [GIT-INIT] Menetapkan default branch: '${githubSettings.defaultBranch}' & proteksi PR rule`
      ]);
      
      // Step 3: Module Branches Creation
      setTimeout(() => {
        setProvisioningStep(3);
        const branchLogs = modules.map((m, idx) => {
          const branchSlug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
          const branchName = `${githubSettings.branchPrefixEpic}${m.epicKey.toLowerCase()}-${branchSlug}`;
          const dev = teamMembers.find(t => t.id === m.assigneeId)?.name || 'Dev';
          return `[01.${50 + idx * 10}s] [BRANCH] git branch '${branchName}' dibuat dari '${githubSettings.defaultBranch}' (Lead: ${dev})`;
        });
        setProvisioningLogs(prev => [
          ...prev,
          `[01.35s] [ORCHESTRATION] Mengotomasi ${modules.length} branch modular di GitHub:`,
          ...branchLogs
        ]);
        
        // Step 4: Tasks Assignment & Backlog Placement
        setTimeout(() => {
          setProvisioningStep(4);
          const devModuleMap: Record<string, string[]> = {};
          modules.forEach(m => {
            const dev = teamMembers.find(t => t.id === m.assigneeId)?.name || 'Developer';
            if (!devModuleMap[dev]) devModuleMap[dev] = [];
            devModuleMap[dev].push(m.title);
          });
          const allocationSummary = Object.entries(devModuleMap).map(([dev, modList]) => 
            `[02.15s] [ASSIGN] ${dev} memegang ${modList.length} modul: ${modList.join(', ')}`
          );

          setProvisioningLogs(prev => [
            ...prev,
            `[02.05s] [BACKLOG] Men-generate ${modules.length + 1} task kick-off dan menempatkannya di kolom Backlog...`,
            ...allocationSummary,
            `[02.40s] [COMPLETE] Proyek berhasil diinisialisasi! Mengalihkan ke Kanban Board...`
          ]);

          setTimeout(() => {
            const formattedModules = modules.map(m => ({
              epicKey: m.epicKey,
              title: m.title,
              description: m.description,
              assigneeId: m.assigneeId,
              contributorIds: m.contributorIds,
              estimateHours: m.estimateHours
            }));

            const newProj = convertCrmDealToProject(
              selectedDeal.id, 
              customProjectCode.trim().toUpperCase(),
              customRepoName.trim(),
              formattedModules
            );
            
            setShowConvertModal(false);
            setIsProvisioning(false);
            onNavigateToProject(newProj.id);
          }, 1100);
        }, 900);
      }, 850);
    }, 700);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Integrasi CRM (Pipeline Deal Won → Project PM)
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Alur Bisnis PRD 5.1
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deal closing otomatis disinkronkan dari CRM. 1-klik untuk generate proyek, inisialisasi repository GitHub, buat branch modul otomatis, dan membagikan tugas ke tim langsung di kolom <strong>Backlog / Baru</strong>.
              </p>
            </div>
          </div>

          {onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Pengaturan Integrasi GitHub</span>
            </button>
          )}
        </div>

        {/* Informative Workflow Guide: Alur Konversi CRM -> PM & Git */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Infografis Alur Konversi: Dari Deal Closing Menuju Pipeline PM & GitHub
                </h3>
                <p className="text-[11px] text-slate-500">
                  Transisi otomatis dari sales CRM ke tim developer tanpa setup manual yang berbelit
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
            >
              <span>{showWorkflowGuide ? 'Sembunyikan Diagram' : 'Tampilkan Diagram'}</span>
            </button>
          </div>

          {showWorkflowGuide && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
              {/* Step 1 */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Langkah 1</span>
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <div className="font-bold text-xs text-slate-900">1. Deal Closed Won</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Deal di CRM closing. Data nilai kontrak, termin pembayaran (misal 50-30-20), PIC klien, dan ruang lingkup modul tersinkronisasi.
                </p>
                <div className="text-[10px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                  SLA Garansi: 180 hari
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">Langkah 2</span>
                  <FolderGit2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="font-bold text-xs text-slate-900">2. Identitas & Repo Git</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Menentukan kode unik proyek (misal <code className="text-indigo-700 font-bold">POS-WRG</code>) dan inisialisasi repository GitHub private pada organisasi.
                </p>
                <div className="text-[10px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200 truncate">
                  github.com/{githubSettings.organization}/*
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">Langkah 3</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="font-bold text-xs text-slate-900">3. Distribusi Engineer (Multi-Modul)</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pilih modul & tentukan lead engineer. <strong>1 developer dapat memegang lebih dari 1 modul</strong> (tersedia mode Solo Dev atau Bagi Rata Tim).
                </p>
                <div className="text-[10px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                  Beban jam kerja terpantau
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Langkah 4</span>
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-bold text-xs text-slate-900">4. Otomasi Branch & Backlog</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  GitHub otomatis membuat branch terisolasi <code className="text-emerald-700 font-bold">epic/*</code> per modul, dan seluruh task mendarat di kolom <strong>Backlog / Baru</strong>.
                </p>
                <div className="text-[10px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                  Siap untuk Sprint Planning
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Highlight Card for Perpustakaan Digital Kampus (Linear / Vercel style) */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs text-lg shrink-0 mt-0.5">
                📚
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-zinc-900">
                    Alur Penerimaan CRM: Sistem Perpustakaan Digital Kampus (Laravel Microservices & React SPA)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                    7 Modul Terdistribusi
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    5 Role Terpetakan
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/70">
                    Rp 185.000.000
                  </span>
                </div>
                <p className="text-xs text-zinc-500 max-w-3xl leading-relaxed">
                  Alur lengkap end-to-end: dari intake closing CRM (Universitas Nusantara Cendekia), technical scoping microservices (Katalog & Sirkulasi Laravel 11, OPAC React 19, Traefik Gateway), isolasi branch Git, injeksi 27 user story ke 5 role (Jaka, Aldyana, Parhan, Asisyah, Azi), stress test K6 2.000 RPS, hingga UAT dan penagihan 3 termin.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowPerpusModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 hover:text-zinc-900 border border-zinc-200/80 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Lihat Alur & 7 Modul Perpus</span>
              </button>

              {crmDeals.find(d => d.templateType === 'perpustakaan_microservices' && d.status !== 'Converted') ? (
                <button
                  onClick={() => {
                    const perpusDeal = crmDeals.find(d => d.templateType === 'perpustakaan_microservices');
                    if (perpusDeal) handleOpenConvert(perpusDeal);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-150"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Konversi Deal Perpus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    const perpusProj = projects.find(p => p.id === 'proj-perpustakaan' || p.code === 'LIB-DIG');
                    if (perpusProj) onNavigateToProject(perpusProj.id);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 rounded-lg transition-all duration-150"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Buka Proyek Perpus di Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-zinc-900">
                Daftar Deal Closing / Won Siap Dikonversi ({crmDeals.length})
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pilih deal closing untuk inisialisasi proyek dan pembuatan repository GitHub secara instan ke status Backlog.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 font-medium">
              ● Webhook CRM Real-time
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {crmDeals.map((deal) => {
              const isConverted = deal.status === 'Converted';
              const isWarung = deal.templateType === 'pos_warung';
              const isPerpus = deal.templateType === 'perpustakaan_microservices';

              return (
                <div key={deal.id} className={`p-6 transition-colors duration-150 ${isPerpus ? 'bg-blue-50/15 hover:bg-blue-50/30' : isWarung ? 'bg-amber-50/15 hover:bg-amber-50/30' : 'hover:bg-zinc-50/60'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60 px-2 py-0.5 rounded-md">
                          {deal.dealCode}
                        </span>
                        <span className="text-zinc-300">·</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                          isConverted ? 'bg-zinc-100 text-zinc-600 border-zinc-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}>
                          {deal.status}
                        </span>
                        {isPerpus && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/60 flex items-center gap-1">
                            <span>📚</span> Microservices Perpus (7 Modul)
                          </span>
                        )}
                        {isWarung && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                            <span>🍲</span> POS Warung Makan
                          </span>
                        )}
                        <span className="text-zinc-300">·</span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          Closing: {deal.closedDate}
                        </span>
                      </div>

                      <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                        <span>{deal.title}</span>
                      </h3>

                      <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
                        {deal.scopeNotes}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-medium text-zinc-700">{deal.clientName}</span>
                          <span>(PIC: {deal.clientPic})</span>
                        </div>
                        <span className="text-zinc-300">·</span>
                        <div className="flex items-center gap-1.5 font-medium text-zinc-900">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono">{formatIDR(deal.contractValue)}</span>
                        </div>
                        <span className="text-zinc-300">·</span>
                        <span className="text-zinc-400 text-[11px] italic">
                          Termin: {deal.paymentTerms}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isPerpus && (
                        <button
                          onClick={() => setShowPerpusModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 rounded-lg border border-zinc-200/80 transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Alur & 7 Modul</span>
                        </button>
                      )}

                      {isConverted ? (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Sudah Menjadi Proyek Aktif</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenConvert(deal)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-150"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Konversi ke Proyek PM</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Convert & Automated GitHub Provisioning Modal */}
      {showConvertModal && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-200/80 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 px-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                    <span>Konversi Proyek CRM & Otomasi GitHub Repository</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                      Pipeline PRD 5.1 & 6.4
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Alur informatif 3-tahap dari validasi deal sales hingga penempatan task di kolom <strong className="font-medium text-zinc-700">Backlog / Baru</strong>.
                  </p>
                </div>
              </div>
              <button
                disabled={isProvisioning}
                onClick={() => setShowConvertModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            {/* Stepper Navigation (Only shown when not provisioning) */}
            {!isProvisioning && (
              <div className="bg-zinc-50/90 border-b border-zinc-200/80 px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 sm:gap-3 font-medium">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                      wizardStep === 1
                        ? 'bg-zinc-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                        : wizardStep > 1
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100/70'
                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-medium">1</span>
                    <span>Identitas & Git</span>
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />

                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                      wizardStep === 2
                        ? 'bg-zinc-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                        : wizardStep > 2
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100/70'
                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-medium">2</span>
                    <span>Modul & Tim (Multi-Modul)</span>
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />

                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                      wizardStep === 3
                        ? 'bg-zinc-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-medium">3</span>
                    <span>Review Blueprint & Eksekusi</span>
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-500 bg-white px-2.5 py-1 rounded-md border border-zinc-200/80">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target: Seluruh Task Masuk ke <strong className="font-medium text-zinc-700">Backlog / Baru</strong></span>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {isProvisioning ? (
                /* High-Fidelity Provisioning Screen with Live Console Terminal */
                <div className="py-4 space-y-6">
                  {/* Top Spinner & Status */}
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm mx-auto">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Menjalankan Otomasi Inisialisasi Proyek & Repository GitHub...
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-lg mx-auto">
                        Membangun entitas proyek, mengeksekusi REST API GitHub, mengisolasi branch modul, dan mendistribusikan task ke status <strong>Backlog / Baru</strong>.
                      </p>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="max-w-md mx-auto pt-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Kemajuan Eksekusi</span>
                        <span className="font-mono text-indigo-700 font-bold">{Math.min(100, provisioningStep * 25)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full shadow-xs"
                          style={{ width: `${Math.min(100, provisioningStep * 25)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Pipeline Stage Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                    {/* Stage 1 */}
                    <div className={`p-3 rounded-xl border text-xs transition-all ${
                      provisioningStep > 1 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : provisioningStep === 1 
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tahap 1</span>
                        {provisioningStep > 1 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : provisioningStep === 1 ? (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="font-bold text-[11px] text-slate-900">Entity Proyek PM</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Kode: {customProjectCode}</div>
                    </div>

                    {/* Stage 2 */}
                    <div className={`p-3 rounded-xl border text-xs transition-all ${
                      provisioningStep > 2 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : provisioningStep === 2 
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tahap 2</span>
                        {provisioningStep > 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : provisioningStep === 2 ? (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="font-bold text-[11px] text-slate-900">Repository GitHub</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono truncate">{customRepoName}</div>
                    </div>

                    {/* Stage 3 */}
                    <div className={`p-3 rounded-xl border text-xs transition-all ${
                      provisioningStep > 3 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : provisioningStep === 3 
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tahap 3</span>
                        {provisioningStep > 3 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : provisioningStep === 3 ? (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="font-bold text-[11px] text-slate-900">Branch Modular</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{modules.length} branch `epic/*`</div>
                    </div>

                    {/* Stage 4 */}
                    <div className={`p-3 rounded-xl border text-xs transition-all ${
                      provisioningStep >= 4 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tahap 4</span>
                        {provisioningStep >= 4 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="font-bold text-[11px] text-slate-900">Backlog Pipeline</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{modules.length + 1} task siap estimasi</div>
                    </div>
                  </div>

                  {/* Real-Time Live Console Terminal Logs */}
                  <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>live-orchestrator-output.log</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        STREAMING
                      </span>
                    </div>
                    <div className="p-3.5 font-mono text-[11px] leading-relaxed text-slate-300 max-h-48 overflow-y-auto space-y-1">
                      {provisioningLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-slate-600 select-none">&gt;</span>
                          <span className={
                            log.includes('COMPLETE') || log.includes('201 Created') 
                              ? 'text-emerald-400 font-bold' 
                              : log.includes('INIT') || log.includes('ORCHESTRATION') 
                              ? 'text-indigo-300 font-semibold' 
                              : log.includes('BRANCH')
                              ? 'text-amber-300'
                              : 'text-slate-300'
                          }>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* WIZARD STEP 1: Identitas & Git */}
                  {wizardStep === 1 && (
                    <div className="space-y-5">
                      {/* Deal Summary */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="flex flex-wrap items-center justify-between text-slate-500 text-[11px] gap-2">
                          <div className="flex items-center gap-2">
                            <span>Deal CRM: <strong className="text-slate-800 font-mono">{selectedDeal.dealCode}</strong></span>
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Closing / Won</span>
                          </div>
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            Nilai Kontrak: {formatIDR(selectedDeal.contractValue)}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-slate-900">{selectedDeal.title}</div>
                        <div className="flex flex-wrap items-center gap-4 text-slate-600 text-xs">
                          <div>Klien: <strong className="text-slate-800">{selectedDeal.clientName}</strong></div>
                          <div>PIC: <strong className="text-slate-800">{selectedDeal.clientPic}</strong></div>
                          <div>Termin: <strong className="text-slate-800 font-mono">{selectedDeal.paymentTerms}</strong></div>
                          <div>SLA Garansi: <strong className="text-emerald-700">180 Hari</strong></div>
                        </div>
                      </div>

                      {/* Section 1: Template Selection */}
                      <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-indigo-600" />
                            <span>Pilihan Arsitektur Template Modul:</span>
                          </label>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                            {modules.length} Modul Terload
                          </span>
                        </div>

                        <select
                          value={selectedTemplateKey}
                          onChange={(e) => handleTemplateChange(e.target.value)}
                          className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {Object.values(TEMPLATES).map((tmpl) => (
                            <option key={tmpl.id} value={tmpl.id}>
                              {tmpl.icon} {tmpl.name}
                            </option>
                          ))}
                        </select>

                        <p className="text-[11px] text-slate-600">
                          {TEMPLATES[selectedTemplateKey]?.summary}
                        </p>
                      </div>

                      {/* Section 2: Project & Repo Configuration */}
                      <div className="space-y-3 pt-2">
                        <div className="font-bold text-slate-900 flex items-center justify-between text-xs uppercase tracking-wider text-slate-500">
                          <span>Konfigurasi Identitas Proyek & Repositori Git</span>
                          <span className="text-[10px] text-indigo-600 font-semibold lowercase bg-indigo-50 px-2 py-0.5 rounded">
                            status awal: backlog / baru
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Kode Unik Proyek (Project Key):
                            </label>
                            <input
                              type="text"
                              required
                              value={customProjectCode}
                              onChange={(e) => {
                                const newCode = e.target.value.toUpperCase();
                                setCustomProjectCode(newCode);
                                setModules(modules.map((m, idx) => ({
                                  ...m,
                                  epicKey: `${newCode}-EPIC-${idx + 1}`
                                })));
                              }}
                              placeholder="e.g. POS-WRG"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Digunakan sebagai prefix task (misal {customProjectCode || 'CODE'}-101).</p>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
                              Nama Repository GitHub:
                            </label>
                            <input
                              type="text"
                              required
                              value={customRepoName}
                              onChange={(e) => setCustomRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                              placeholder="e.g. pos-warung-core"
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Slug repositori GitHub di bawah organisasi {githubSettings.organization}.</p>
                          </div>
                        </div>

                        {/* Repo URL Live Preview */}
                        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2 truncate">
                            <FolderGit2 className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-slate-400">github.com/{githubSettings.organization}/</span>
                            <span className="text-emerald-400 font-bold truncate">{customRepoName || 'nama-repo'}</span>
                          </div>
                          <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
                            {githubSettings.repoVisibility.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Informative Explanation of the Process */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-[11px] text-slate-600 space-y-1.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                          <Info className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Apa yang terjadi setelah konversi?</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          <li>Repository GitHub diinisialisasi dengan branch <code className="text-slate-800 font-bold font-mono">{githubSettings.defaultBranch}</code>.</li>
                          <li>Branch modular <code className="text-indigo-700 font-bold font-mono">epic/*</code> dibuat otomatis untuk setiap modul agar pengerjaan developer terisolasi.</li>
                          <li>Seluruh modul dan task otomatis mendarat di kolom <strong>Backlog / Baru</strong> agar PM & Tech Lead dapat melakukan estimasi dan sprint planning dengan tenang.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {/* WIZARD STEP 2: Modul & Tim (Multi-Modul) */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                          <span>2. Rincian Modul & Penugasan Tim (Mendukung Multi-Modul per Dev)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          1 developer dapat memegang lebih dari 1 modul sekaligus. Branch Git dan task masing-masing modul tetap dibuat terpisah di Backlog.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMultiAssignSelectedModIds(modules.map(m => m.id));
                            setShowMultiModuleAssignModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition-colors shadow-2xs"
                          title="Tugaskan 1 developer untuk beberapa modul sekaligus"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-indigo-600" />
                          <span>Alokasi Multi-Modul</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddModule}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah Modul</span>
                        </button>
                      </div>
                    </div>

                    {/* Developer Multi-Module Workload & Allocation Matrix */}
                    <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Matriks Alokasi Developer ({teamMembers.filter(m => modules.some(mod => mod.assigneeId === m.id)).length} Engineer Terlibat)</span>
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Fleksibilitas 1-ke-Banyak Modul Aktif
                        </span>
                      </div>

                      {/* Developer cards row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {teamMembers.map((member) => {
                          const assignedMods = modules.filter(m => m.assigneeId === member.id);
                          const totalHours = assignedMods.reduce((s, m) => s + m.estimateHours, 0);
                          const isAssigned = assignedMods.length > 0;
                          const isMulti = assignedMods.length > 1;

                          return (
                            <div 
                              key={member.id}
                              className={`p-2.5 rounded-lg border text-xs transition-all ${
                                isMulti 
                                  ? 'bg-indigo-50/50 border-indigo-200 shadow-2xs ring-1 ring-indigo-200/50' 
                                  : isAssigned 
                                  ? 'bg-white border-slate-200' 
                                  : 'bg-white/60 border-dashed border-slate-200 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-2 truncate">
                                  <img 
                                    src={member.avatar} 
                                    alt={member.name} 
                                    className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="truncate">
                                    <div className="font-bold text-slate-900 truncate text-[11px]">{member.name}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                                  </div>
                                </div>

                                {isMulti ? (
                                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white shadow-2xs">
                                    {assignedMods.length} Modul
                                  </span>
                                ) : isAssigned ? (
                                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    1 Modul
                                  </span>
                                ) : (
                                  <span className="shrink-0 text-[10px] text-slate-400 italic">
                                    0 Modul
                                  </span>
                                )}
                              </div>

                              {isAssigned && (
                                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                                  <div className="flex items-center gap-1 font-mono truncate max-w-[140px]">
                                    {assignedMods.map(m => (
                                      <span key={m.id} className="px-1 py-0.2 rounded bg-white text-indigo-700 border border-slate-200 font-bold truncate">
                                        {m.epicKey.split('-').pop()}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="font-mono font-semibold text-slate-700 shrink-0">
                                    {totalHours} Jam
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Multi-Module Assignment Presets */}
                      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">Penugasan Cepat:</span>
                          
                          {/* Solo Dev Tool */}
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                            <span className="text-[10px] text-slate-500 px-1 font-medium">Solo Dev (1 Dev semua modul):</span>
                            <select
                              value={soloDevId}
                              onChange={(e) => setSoloDevId(e.target.value)}
                              className="text-[11px] font-semibold text-slate-800 bg-slate-50 rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              {teamMembers.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAssignAllToDeveloper(soloDevId)}
                              className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-0.5 rounded transition-colors"
                            >
                              Terapkan
                            </button>
                          </div>

                          {/* Round Robin */}
                          <button
                            type="button"
                            onClick={handleDistributeRoundRobin}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg transition-colors"
                          >
                            <span>👥 Bagi Rata Tim</span>
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-500 italic">
                          Total Estimasi: <strong className="font-mono text-slate-900">{modules.reduce((s, m) => s + m.estimateHours, 0)} Jam</strong>
                        </span>
                      </div>
                    </div>

                    {/* Notification about Backlog status */}
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Status Otomatis:</strong> Seluruh {modules.length} modul ini akan langsung masuk ke kolom <strong>Backlog / Baru</strong> agar PM & Lead Engineer dapat merencanakan sprint dan estimasi awal.
                      </span>
                    </div>

                    <div className="space-y-3">
                      {modules.map((mod, idx) => {
                        const branchSlug = mod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
                        const branchName = `${githubSettings.branchPrefixEpic}${mod.epicKey.toLowerCase()}-${branchSlug}`;
                        const assignedMember = teamMembers.find(t => t.id === mod.assigneeId);
                        const otherModulesForDev = modules.filter(m => m.assigneeId === mod.assigneeId);
                        const isMultiForThisDev = otherModulesForDev.length > 1;

                        return (
                          <div 
                            key={mod.id} 
                            className={`p-4 rounded-xl border space-y-2.5 transition-all shadow-2xs ${
                              isMultiForThisDev 
                                ? 'bg-white border-indigo-200 hover:border-indigo-300' 
                                : 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                                  {mod.epicKey}
                                </span>
                                <span className="text-slate-500 text-xs font-semibold">Modul #{idx + 1}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-200 text-slate-700">
                                  Target: Backlog
                                </span>

                                {isMultiForThisDev && (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3 text-indigo-600" />
                                    <span>Multi-Modul ({otherModulesForDev.length} modul oleh {assignedMember?.name?.split(' ')[0]})</span>
                                  </span>
                                )}
                              </div>

                              {modules.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveModule(mod.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                  title="Hapus modul ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={mod.title}
                                onChange={(e) => handleUpdateModule(mod.id, { title: e.target.value })}
                                placeholder="Nama modul pengerjaan"
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />

                              {mod.description && (
                                <p className="text-[11px] text-slate-500 bg-white/70 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                                  {mod.description}
                                </p>
                              )}

                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 pt-0.5">
                                <GitBranch className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>Branch Otomatis:</span>
                                <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate">
                                  {branchName}
                                </span>
                              </div>
                            </div>

                            {/* Assignee Selection & Estimate */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Engineer Penanggung Jawab (Lead Modul)
                                  </label>
                                  {isMultiForThisDev && (
                                    <span className="text-[10px] font-semibold text-indigo-600">
                                      Pegang {otherModulesForDev.length} Modul
                                    </span>
                                  )}
                                </div>
                                
                                <div className="relative">
                                  <select
                                    value={mod.assigneeId}
                                    onChange={(e) => handleUpdateModule(mod.id, { assigneeId: e.target.value })}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  >
                                    {teamMembers.map((member) => {
                                      const mCount = modules.filter(m => m.assigneeId === member.id).length;
                                      return (
                                        <option key={member.id} value={member.id}>
                                          {member.name} ({member.role}) {mCount > 0 ? `· [${mCount} Modul]` : ''}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>

                                {isMultiForThisDev && (
                                  <p className="text-[10px] text-indigo-700 mt-1 font-medium flex items-center gap-1">
                                    <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                                    <span>Developer ini juga ditugaskan di modul: {otherModulesForDev.filter(m => m.id !== mod.id).map(m => m.epicKey).join(', ')}</span>
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  Estimasi Pengerjaan Awal
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="4"
                                    max="120"
                                    value={mod.estimateHours}
                                    onChange={(e) => handleUpdateModule(mod.id, { estimateHours: parseInt(e.target.value) || 8 })}
                                    className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 text-center"
                                  />
                                  <span className="text-slate-500 text-xs">Jam</span>
                                  {assignedMember?.githubUsername && (
                                    <span className="ml-auto text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                                      @{assignedMember.githubUsername}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  )}

                  {/* WIZARD STEP 3: Review Blueprint & Eksekusi */}
                  {wizardStep === 3 && (
                    <div className="space-y-5">
                      {/* Blueprint Header */}
                      <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                            <Workflow className="w-4 h-4 text-indigo-400" />
                            <span>Executive Blueprint: Arsitektur Eksekusi Proyek</span>
                          </span>
                          <span className="text-[11px] font-mono bg-indigo-800/80 px-2.5 py-0.5 rounded text-indigo-200">
                            Target: Kolom Backlog / Baru
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-indigo-800/60">
                          <div>
                            <div className="text-[10px] text-indigo-300">Nilai Kontrak</div>
                            <div className="text-sm font-bold text-white font-mono">{formatIDR(selectedDeal.contractValue)}</div>
                            <div className="text-[10px] text-indigo-400 font-mono">Termin {selectedDeal.paymentTerms}</div>
                          </div>

                          <div>
                            <div className="text-[10px] text-indigo-300">Total Modul</div>
                            <div className="text-sm font-bold text-white font-mono">{modules.length} Modul Epic</div>
                            <div className="text-[10px] text-indigo-400 font-mono">{modules.reduce((s, m) => s + m.estimateHours, 0)} Jam Kerja</div>
                          </div>

                          <div>
                            <div className="text-[10px] text-indigo-300">Distribusi Tim</div>
                            <div className="text-sm font-bold text-white font-mono">
                              {teamMembers.filter(m => modules.some(mod => mod.assigneeId === m.id)).length} Engineer
                            </div>
                            <div className="text-[10px] text-indigo-400">
                              {modules.some(m => modules.filter(o => o.assigneeId === m.assigneeId).length > 1) 
                                ? 'Multi-modul aktif' 
                                : '1 modul per developer'}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] text-indigo-300">Repository GitHub</div>
                            <div className="text-sm font-bold text-emerald-400 font-mono truncate">{customRepoName}</div>
                            <div className="text-[10px] text-indigo-400 font-mono">{githubSettings.organization} (Private)</div>
                          </div>
                        </div>
                      </div>

                      {/* Summary Table: Modules, Git Branches, and Engineers */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Rincian Pembagian Modul & Branch GitHub Otomatis</span>
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Semua task otomatis berstatus <strong className="text-indigo-600">Backlog</strong>
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/50 text-[11px] text-slate-500 font-semibold border-b border-slate-100">
                              <tr>
                                <th className="p-3">Kode Epic</th>
                                <th className="p-3">Nama Modul</th>
                                <th className="p-3">Branch Git Otomatis</th>
                                <th className="p-3">Engineer Ditugaskan</th>
                                <th className="p-3 text-right">Estimasi</th>
                                <th className="p-3 text-center">Status Awal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                              {modules.map((m) => {
                                const branchSlug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
                                const branchName = `${githubSettings.branchPrefixEpic}${m.epicKey.toLowerCase()}-${branchSlug}`;
                                const dev = teamMembers.find(t => t.id === m.assigneeId);
                                const isMulti = modules.filter(o => o.assigneeId === m.assigneeId).length > 1;

                                return (
                                  <tr key={m.id} className="hover:bg-slate-50/60">
                                    <td className="p-3 font-mono font-bold text-indigo-700">{m.epicKey}</td>
                                    <td className="p-3 font-semibold text-slate-900">{m.title}</td>
                                    <td className="p-3 font-mono text-slate-600">{branchName}</td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={dev?.avatar} 
                                          alt={dev?.name} 
                                          className="w-5 h-5 rounded-full object-cover border border-slate-200" 
                                        />
                                        <span className="font-semibold text-slate-800">{dev?.name}</span>
                                        {isMulti && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                                            Multi
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-3 text-right font-mono font-semibold text-slate-700">{m.estimateHours}j</td>
                                    <td className="p-3 text-center">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                        Backlog / Baru
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* SLA & Protection Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                          <div className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>180 Hari Garansi Bug</span>
                          </div>
                          <p className="text-[10px] text-emerald-800">
                            Bug pasca serah terima diperbaiki bebas biaya dengan SLA respon &lt;24 jam.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1">
                          <div className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>15 Jam Kuota Maintenance</span>
                          </div>
                          <p className="text-[10px] text-indigo-800">
                            Kuota perubahan minor bulanan aktif selama masa kontrak berlangsung.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                          <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Proteksi Termin Kontrak</span>
                          </div>
                          <p className="text-[10px] text-amber-800">
                            Proyek dilindungi fitur Kill-Switch sesuai termin pembayaran {selectedDeal.paymentTerms}.
                          </p>
                        </div>
                      </div>

                      {/* Final Informative Callout */}
                      <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-950 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Siap Dikonversi ke Proyek PM:</strong> Klik tombol eksekusi di bawah untuk menjalankan integrasi otomatis. Setelah selesai, Anda akan langsung dialihkan ke papan Kanban proyek di mana seluruh modul dan task tersusun rapi di kolom <strong>Backlog / Baru</strong> untuk segera direview bersama tim.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer with Stepper Controls */}
            {!isProvisioning && (
              <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium">Tahap {wizardStep} dari 3:</span>
                  <span className="font-bold text-slate-800">
                    {wizardStep === 1 ? 'Identitas & Git' : wizardStep === 2 ? 'Modul & Tim' : 'Review Blueprint & Eksekusi'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {wizardStep === 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowConvertModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizardStep(2)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all hover:shadow-indigo-200"
                      >
                        <span>Lanjut: Atur Modul & Tim</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {wizardStep === 2 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Kembali</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizardStep(3)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all hover:shadow-indigo-200"
                      >
                        <span>Lanjut: Review Blueprint & Eksekusi</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {wizardStep === 3 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setWizardStep(2)}
                        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Kembali ke Modul</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmConvert}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:shadow-indigo-300"
                      >
                        <FolderGit2 className="w-4 h-4" />
                        <span>Konfirmasi & Jalankan Eksekusi Otomasi</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Module Developer Assignment Modal */}
      {showMultiModuleAssignModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Alokasikan 1 Developer ke Banyak Modul</h4>
                  <p className="text-[11px] text-slate-500">Tentukan modul mana saja yang akan ditugaskan ke developer ini</p>
                </div>
              </div>
              <button
                onClick={() => setShowMultiModuleAssignModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  1. Pilih Developer Penanggung Jawab:
                </label>
                <select
                  value={multiAssignTargetDevId}
                  onChange={(e) => setMultiAssignTargetDevId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    2. Pilih Modul yang Dikerjakan ({multiAssignSelectedModIds.length} dari {modules.length} dipilih):
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMultiAssignSelectedModIds(modules.map(m => m.id))}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setMultiAssignSelectedModIds([])}
                      className="text-slate-500 hover:underline"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {modules.map((m) => {
                    const isChecked = multiAssignSelectedModIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMultiAssignSelectedModIds([...multiAssignSelectedModIds, m.id]);
                              } else {
                                setMultiAssignSelectedModIds(multiAssignSelectedModIds.filter(id => id !== m.id));
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <div className="truncate">
                            <span className="font-mono text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 mr-1.5">
                              {m.epicKey}
                            </span>
                            <span className="font-semibold">{m.title}</span>
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-500">
                          {m.estimateHours}j
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMultiModuleAssignModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={multiAssignSelectedModIds.length === 0}
                onClick={handleApplyMultiModuleAssignment}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
              >
                Terapkan ke {multiAssignSelectedModIds.length} Modul Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational & Interactive Perpus Intake Modal */}
      <PerpusIntakeModal
        isOpen={showPerpusModal}
        onClose={() => setShowPerpusModal(false)}
        onNavigateToProject={onNavigateToProject}
        onOpenConvertDeal={() => {
          const perpusDeal = crmDeals.find(d => d.templateType === 'perpustakaan_microservices');
          if (perpusDeal) handleOpenConvert(perpusDeal);
        }}
      />
    </div>
  );
};
