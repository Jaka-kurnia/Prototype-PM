/**
 * HrTeamView.js
 * HR & Team Workload Distribution View in 100% Native Vanilla JS.
 */

import { store } from '../../state/store.js';
import { Icons } from '../../utils/icons.js';

export class HrTeamView {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'hr-view';

    this.render();
    store.subscribe(() => {
      this.render();
    });
  }

  getElement() {
    return this.element;
  }

  render() {
    const state = store.getState();
    const { teamMembers, tasks, epics, projects } = state;

    this.element.innerHTML = `
      <div class="hr-container">
        <!-- Banner -->
        <div class="hr-banner">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="padding: 12px; background: var(--color-zinc-100); border: 1px solid rgba(228, 228, 231, 0.8); border-radius: 12px; color: var(--color-zinc-700); display: flex; align-items: center; justify-content: center;">
              ${Icons.users('', 24)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <h1 style="font-size: 16px; font-weight: 700; color: var(--color-zinc-900); margin: 0;">
                  Integrasi Tim HR &amp; Distribusi Workload
                </h1>
                <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: var(--color-zinc-100); color: var(--color-zinc-700); border: 1px solid rgba(228, 228, 231, 0.8);">
                  Data Resource Terhubung
                </span>
              </div>
              <p style="font-size: 12px; color: var(--color-zinc-500); margin: 4px 0 0 0;">
                Sinkronisasi kapasitas tim mingguan, beban jam tugas aktif, skill matrix, dan pemantauan multi-modul per developer.
              </p>
            </div>
          </div>
        </div>

        <!-- Members Card List -->
        <div class="hr-card-list">
          <div class="hr-card-header">
            <h2 style="font-size: 14px; font-weight: 700; color: var(--color-zinc-900); margin: 0;">
              Daftar Anggota Tim &amp; Kapasitas (${teamMembers.length} Orang)
            </h2>
            <span style="font-size: 12px; color: var(--color-zinc-500);">
              Kapasitas Standar: 40 Jam / Minggu
            </span>
          </div>

          <div>
            ${teamMembers.map(member => {
              const assignedTasks = tasks.filter(t => t.assigneeId === member.id && t.status !== 'Selesai');
              const totalAssignedHours = assignedTasks.reduce((acc, curr) => acc + (curr.estimateHours || 4), 0);
              const isOverloaded = totalAssignedHours > member.capacityHoursPerWeek;
              const loadPercentage = Math.round((totalAssignedHours / member.capacityHoursPerWeek) * 100);
              const distinctEpicIds = Array.from(new Set(assignedTasks.map(t => t.epicId).filter(Boolean)));
              const assignedEpics = epics.filter(e => distinctEpicIds.includes(e.id));
              const isMultiModule = assignedEpics.length > 1;

              return `
                <div class="hr-member-item">
                  <div class="hr-member-flex">
                    <!-- Profile & Skills -->
                    <div style="display: flex; align-items: flex-start; gap: 16px; flex: 1;">
                      <img src="${member.avatar}" alt="${member.name}" style="width: 48px; height: 48px; border-radius: 9999px; object-fit: cover; border: 1px solid rgba(228, 228, 231, 0.8);" />

                      <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                          <h3 style="font-size: 14px; font-weight: 700; color: var(--color-zinc-900); margin: 0;">${member.name}</h3>
                          <span style="font-size: 11px; font-weight: 500; color: var(--color-zinc-600); background: var(--color-zinc-100); border: 1px solid rgba(228, 228, 231, 0.8); padding: 2px 8px; border-radius: 9999px;">
                            ${member.role}
                          </span>
                          ${isMultiModule ? `
                            <span style="font-size: 10px; font-weight: 600; color: var(--color-zinc-800); background: var(--color-zinc-100); padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(228, 228, 231, 0.8); display: inline-flex; align-items: center; gap: 4px;">
                              ${Icons.layers('', 12)}
                              <span>Multi-Modul (${assignedEpics.length} Modul)</span>
                            </span>
                          ` : ''}
                          ${member.onLeave ? `
                            <span style="font-size: 10px; font-weight: 600; color: #b45309; background: #fffbeb; padding: 2px 8px; border-radius: 9999px; border: 1px solid #fde68a;">
                              Sedang Cuti
                            </span>
                          ` : `
                            <span style="font-size: 10px; font-weight: 600; color: #047857; background: #ecfdf5; padding: 2px 8px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                              Tersedia
                            </span>
                          `}
                        </div>

                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-zinc-500);">
                          <span>${member.email}</span>
                          ${member.githubUsername ? `
                            <span style="color: var(--color-zinc-300);">·</span>
                            <span style="display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--color-zinc-600); background: var(--color-zinc-100); padding: 2px 6px; border-radius: 4px;">
                              ${Icons.folderGit('', 12)}
                              <span>@${member.githubUsername}</span>
                            </span>
                          ` : ''}
                        </div>

                        <!-- Skills -->
                        <div style="display: flex; flex-wrap: wrap; gap: 6px; padding-top: 4px;">
                          ${member.skills.map(s => `
                            <span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: var(--color-zinc-50); border: 1px solid rgba(228, 228, 231, 0.8); color: var(--color-zinc-600);">
                              ${s}
                            </span>
                          `).join('')}
                        </div>

                        <!-- Active Assigned Modules -->
                        ${assignedEpics.length > 0 ? `
                          <div style="padding-top: 6px; display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                            <span style="font-size: 11px; font-weight: 600; color: var(--color-zinc-600); display: flex; align-items: center; gap: 6px;">
                              ${Icons.layers('', 12)}
                              <span>Modul Proyek yang Dikerjakan (${assignedEpics.length}):</span>
                            </span>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                              ${assignedEpics.map(ep => {
                                const epProj = projects.find(p => p.id === ep.projectId);
                                return `
                                  <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-family: var(--font-mono); font-weight: 600; padding: 2px 8px; border-radius: 9999px; border: 1px solid ${ep.color}40; background: ${ep.color}10; color: ${ep.color};" title="${epProj ? epProj.name + ' · ' : ''}${ep.title}">
                                    <span>${ep.key}</span>
                                    <span style="font-family: inherit; font-weight: normal; color: var(--color-zinc-600);">· ${ep.title}</span>
                                  </span>
                                `;
                              }).join('')}
                            </div>
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <!-- Workload Progress Bar & Warning -->
                    <div style="width: 100%; max-width: 280px; display: flex; flex-direction: column; gap: 8px;">
                      <div style="display: flex; justify-content: space-between; font-size: 12px;">
                        <span style="font-weight: 600; color: var(--color-zinc-700);">Beban Kerja Mingguan</span>
                        <div style="display: flex; align-items: center; gap: 4px; font-family: var(--font-mono);">
                          <span style="font-weight: 700; color: ${isOverloaded ? '#be123c' : 'var(--color-zinc-900)'};">
                            ${totalAssignedHours}j
                          </span>
                          <span style="color: var(--color-zinc-400);">/ ${member.capacityHoursPerWeek}j</span>
                          <span style="font-size: 11px; color: var(--color-zinc-500);">(${loadPercentage}%)</span>
                        </div>
                      </div>

                      <div class="hr-progress-bar">
                        <div class="hr-progress-fill" style="width: ${Math.min(100, loadPercentage)}%; background: ${isOverloaded ? '#f43f5e' : loadPercentage > 80 ? '#f59e0b' : '#10b981'};"></div>
                      </div>

                      ${isOverloaded ? `
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #be123c; font-weight: 600; background: #fff1f2; padding: 6px 10px; border-radius: 8px; border: 1px solid #fecdd3;">
                          ${Icons.alertTriangle('', 14)}
                          <span>Peringatan Overload: Kelebihan beban kerja!</span>
                        </div>
                      ` : `
                        <div style="font-size: 11px; color: var(--color-zinc-400);">
                          Aktif mengerjakan ${assignedTasks.length} task terbuka.
                        </div>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
