import React, { useState } from 'react';
import { ArrowRight, Bot, ShieldCheck, FileCheck, RefreshCw, Send, Zap, ChevronDown, ChevronUp, Layers, CheckCircle2, BookOpen } from 'lucide-react';
import { SopGuideModal } from './SopGuideModal';

interface WorkflowStepperProps {
  onNavigateTab: (tab: string) => void;
  onOpenIntakeModal: () => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ onNavigateTab, onOpenIntakeModal }) => {
  const [activeFlow, setActiveFlow] = useState<'flowB' | 'flowA'>('flowB');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showSopGuide, setShowSopGuide] = useState<boolean>(false);

  return (
    <div className="bg-white border-b border-zinc-200/80 px-6 py-2.5 transition-all shrink-0">
      <div className="max-w-7xl mx-auto">
        {/* Top Slim Control Ribbon */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {/* Flow Switcher (Segmented Control) */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
              <button
                onClick={() => setActiveFlow('flowB')}
                className={`px-3 py-1 rounded-md font-medium transition-all duration-150 ${
                  activeFlow === 'flowB'
                    ? 'bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                SOP Bug & QA
              </button>
              <button
                onClick={() => setActiveFlow('flowA')}
                className={`px-3 py-1 rounded-md font-medium transition-all duration-150 ${
                  activeFlow === 'flowA'
                    ? 'bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                CRM → PM → Finance
              </button>
            </div>

            {/* Quick 1-line breadcrumb when collapsed */}
            {!isExpanded && (
              <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-500 font-mono truncate">
                <span className="text-zinc-300">·</span>
                {activeFlow === 'flowB' ? (
                  <span className="flex items-center gap-1.5 text-zinc-600">
                    <span>1. Intake (WA/Sentry)</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span>2. Triage SLA</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span>3. Fix & Patch</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span>4. PR Review</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span>5. QA Staging</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span className="text-emerald-700 font-medium">6. Prod Guard</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-zinc-600">
                    <span>1. CRM Closing</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span>2. Konversi Repo Git</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span>3. Alokasi Multi-Modul Dev</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span>4. Sprint Board</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-300" />
                    <span className="text-emerald-700 font-medium">5. Termin (&gt; 10% Progres)</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSopGuide(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              title="Buka Buku Panduan 6 Tahapan Standar SOP Software House"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Panduan SOP</span>
            </button>

            <button
              onClick={onOpenIntakeModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulasi Laporan</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-all duration-150"
              title={isExpanded ? 'Ringkas tampilan alur' : 'Perluas detail tahapan alur'}
            >
              <span className="hidden sm:inline">{isExpanded ? 'Tutup Peta' : 'Peta Alur'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Detailed Interactive Pipeline */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-zinc-100 animate-in fade-in duration-150">
            {activeFlow === 'flowB' ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zinc-600">
                  <button
                    onClick={onOpenIntakeModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg shrink-0 text-zinc-800 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    title="Klik untuk membuka simulator intake bug"
                  >
                    <Send className="w-3.5 h-3.5 text-zinc-600" />
                    <span>1. Laporan Masuk (Sentry/WA)</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('kanban')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg shrink-0 text-zinc-800 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    title="Triage tingkat keparahan (S1 Blocker s/d S4), SLA timer, dan cek Garansi Proyek"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. Triage & SLA (S1-S4 / Garansi)</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('ai_hub')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/70 rounded-lg shrink-0 text-indigo-900 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    title="Pengerjaan fix: Bug Kecil/Menengah langsung otomatis AI, Bug Besar dialihkan ke programmer manusia"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3. Fix AI (Kecil/Menengah) vs Manusia (Besar)</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('kanban')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/60 hover:bg-amber-50 border border-amber-200/70 rounded-lg shrink-0 text-amber-900 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    title="Review oleh Tech Lead: Git diff check, CI regression test, merge ke staging"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>4. Code Review (PR & CI)</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('kanban')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50/60 hover:bg-purple-50 border border-purple-200/70 rounded-lg shrink-0 text-purple-900 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    title="Pengujian di server Staging oleh QA Engineer, verifikasi reproduksi & sign-off formal"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>5. QA Staging Sign-Off</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('ai_hub')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/70 rounded-lg shrink-0 text-emerald-900 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    title="Rilis Production, pemantauan 30 menit pasca deploy dengan auto-rollback guard, dan penulisan RCA"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>6. Rilis Prod, Guard & RCA</span>
                  </button>
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>Prinsip utama: <strong className="text-zinc-700 font-medium">Manusia berwenang penuh.</strong> Tidak ada rilis production tanpa QA sign-off dan Tech Lead approval.</span>
                  <span className="text-zinc-800 font-medium cursor-pointer hover:underline" onClick={() => onNavigateTab('kanban')}>Buka Board →</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zinc-600">
                  <button
                    onClick={() => onNavigateTab('crm')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg shrink-0 text-zinc-800 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <span>1. CRM Deal Closing (Won)</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('crm')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg shrink-0 text-zinc-800 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <span>2. Konversi Repo & Branch Git</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('team')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg shrink-0 text-zinc-800 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <span>3. Alokasi Multi-Modul Dev</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('kanban')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg shrink-0 text-zinc-800 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <span>4. Pengerjaan Sprint & Task</span>
                  </button>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />

                  <button
                    onClick={() => onNavigateTab('finance')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/70 rounded-lg shrink-0 text-emerald-900 font-medium transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <span>5. Invoice Termin (Progres &gt; 10%)</span>
                  </button>
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>Satu developer dapat memegang lebih dari satu modul secara paralel saat konversi CRM dilakukan.</span>
                  <span className="text-zinc-800 font-medium cursor-pointer hover:underline" onClick={() => onNavigateTab('crm')}>Buka CRM →</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SopGuideModal */}
      <SopGuideModal
        isOpen={showSopGuide}
        onClose={() => setShowSopGuide(false)}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
