import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, AlertTriangle, CheckCircle2, Clock, Calendar, ShieldCheck, Briefcase, FolderGit2, Layers } from 'lucide-react';

export const HrTeamView: React.FC = () => {
  const { teamMembers, tasks, epics, projects } = useApp();

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 border border-zinc-200/80 rounded-xl text-zinc-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-medium text-zinc-900 tracking-tight">
                  Integrasi Tim HR & Distribusi Workload
                </h1>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80">
                  Data Resource Terhubung
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Sinkronisasi kapasitas tim mingguan, beban jam tugas aktif, skill matrix, dan pemantauan multi-modul per developer.
              </p>
            </div>
          </div>
        </div>

        {/* Members Cards / Workload Table */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-900">
              Daftar Anggota Tim & Kapasitas ({teamMembers.length} Orang)
            </h2>
            <span className="text-xs text-zinc-500 font-normal">
              Kapasitas Standar: 40 Jam / Minggu
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {teamMembers.map((member) => {
              const assignedTasks = tasks.filter((t) => t.assigneeId === member.id && t.status !== 'Selesai');
              const totalAssignedHours = assignedTasks.reduce((acc, curr) => acc + (curr.estimateHours || 4), 0);
              const isOverloaded = totalAssignedHours > member.capacityHoursPerWeek;
              const loadPercentage = Math.round((totalAssignedHours / member.capacityHoursPerWeek) * 100);
              const distinctEpicIds = Array.from(new Set(assignedTasks.map((t) => t.epicId).filter(Boolean)));
              const assignedEpics = epics.filter((e) => distinctEpicIds.includes(e.id));
              const isMultiModule = assignedEpics.length > 1;

              return (
                <div key={member.id} className="p-6 hover:bg-zinc-50/60 transition-colors duration-150">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Profile & Skills */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-200/80 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-sm font-medium text-zinc-900">{member.name}</h3>
                          <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/60 px-2.5 py-0.5 rounded-full">
                            {member.role}
                          </span>
                          {isMultiModule && (
                            <span className="text-[10px] font-medium text-zinc-800 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200/80 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-zinc-600" />
                              <span>Multi-Modul ({assignedEpics.length} Modul)</span>
                            </span>
                          )}
                          {member.onLeave ? (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                              Sedang Cuti
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                              Tersedia
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>{member.email}</span>
                          {member.githubUsername && (
                            <>
                              <span className="text-zinc-300">·</span>
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-600 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-md">
                                <FolderGit2 className="w-3 h-3 text-zinc-400" />
                                <span>@{member.githubUsername}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {member.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-normal text-zinc-600 bg-zinc-50 border border-zinc-200/80 px-2.5 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Active Assigned Modules */}
                        {assignedEpics.length > 0 && (
                          <div className="pt-2 flex flex-col gap-1.5 text-xs">
                            <span className="text-[11px] font-medium text-zinc-600 flex items-center gap-1.5">
                              <Layers className="w-3 h-3 text-zinc-500" />
                              <span>Modul Proyek yang Dikerjakan ({assignedEpics.length}):</span>
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {assignedEpics.map((ep) => {
                                const epProj = projects.find(p => p.id === ep.projectId);
                                return (
                                  <span
                                    key={ep.id}
                                    className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border"
                                    style={{ 
                                      backgroundColor: `${ep.color}10`, 
                                      color: ep.color, 
                                      borderColor: `${ep.color}35` 
                                    }}
                                    title={`${epProj ? epProj.name + ' · ' : ''}${ep.title}`}
                                  >
                                    <span>{ep.key}</span>
                                    <span className="font-sans font-normal text-zinc-600 max-w-[130px] truncate">· {ep.title}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Workload Progress Bar & Warning */}
                    <div className="w-full lg:w-72 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-700">Beban Kerja Mingguan</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className={isOverloaded ? 'text-rose-700 font-medium' : 'text-zinc-900 font-medium'}>
                            {totalAssignedHours}j
                          </span>
                          <span className="text-zinc-400">/ {member.capacityHoursPerWeek}j</span>
                          <span className="text-zinc-500 text-[11px]">({loadPercentage}%)</span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOverloaded
                              ? 'bg-rose-500'
                              : loadPercentage > 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, loadPercentage)}%` }}
                        />
                      </div>

                      {/* Warning if overloaded */}
                      {isOverloaded ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200/60">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                          <span>Peringatan Overload: Kelebihan beban kerja!</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-400 font-normal">
                          Aktif mengerjakan {assignedTasks.length} task terbuka.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
