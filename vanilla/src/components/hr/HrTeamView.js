/**
 * HrTeamView.js
 * People & Resource Workload Distribution View (Atlassian Jira People Equivalent)
 * 100% Native Vanilla JS, Zero Inline Style Clutter, Interactive Search & Role Filter.
 */

import { store } from "../../state/store.js";
import { Icons } from "../../utils/icons.js";

export class HrTeamView {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "hr-view";

    this.searchQuery = "";
    this.roleFilter = "all";

    this.render();
    this.bindEvents();

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

    // Filter members
    const filteredMembers = teamMembers.filter((m) => {
      if (this.roleFilter !== "all" && !m.role.toLowerCase().includes(this.roleFilter.toLowerCase())) {
        return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchRole = m.role.toLowerCase().includes(q);
        const matchSkill = (m.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchRole && !matchSkill) return false;
      }
      return true;
    });

    // Global workload stats
    const totalCapacity = teamMembers.reduce((acc, m) => acc + (m.capacityHoursPerWeek || 40), 0);
    const activeTasks = tasks.filter((t) => t.status !== "Selesai");
    const totalAssignedHours = activeTasks.reduce((acc, t) => acc + (t.estimateHours || 4), 0);
    const avgUtilization = totalCapacity > 0 ? Math.round((totalAssignedHours / totalCapacity) * 100) : 0;
    const availableCount = teamMembers.filter((m) => !m.onLeave).length;

    this.element.innerHTML = `
      <div class="hr-container">
        <!-- 1. Page Header Banner -->
        <div class="hr-banner">
          <div class="hr-banner__left">
            <div class="hr-banner__icon">
              ${Icons.users("", 22)}
            </div>
            <div>
              <div class="hr-banner__title-row">
                <h1 class="hr-banner__title">Manajemen Tim HR &amp; Distribusi Workload</h1>
                <span class="jira-badge jira-badge--done">Resource Terhubung</span>
              </div>
              <p class="hr-banner__desc">
                Pemantauan kapasitas jam mingguan, beban kerja tugas aktif, matriks keahlian, dan alokasi multi-modul engineer.
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button id="hrManageAccessBtn" class="jira-btn jira-btn--default" title="Kelola Akses GitHub &amp; Collaborator">
              ${Icons.folderGit("", 14)}
              <span>Akses GitHub</span>
            </button>
            <button id="hrViewBacklogBtn" class="jira-btn jira-btn--primary" title="Lihat Alokasi di Sprint Backlog">
              ${Icons.layers("", 14)}
              <span>Alokasi Sprint</span>
            </button>
          </div>
        </div>

        <!-- 2. KPI Summary Strip -->
        <div class="hr-kpi-grid">
          <div class="hr-kpi-card">
            <span class="hr-kpi-card__label">Total Personel Tim</span>
            <span class="hr-kpi-card__value">${teamMembers.length} Orang</span>
            <span class="hr-kpi-card__sub">${availableCount} aktif tersedia · ${teamMembers.length - availableCount} cuti</span>
          </div>

          <div class="hr-kpi-card">
            <span class="hr-kpi-card__label">Kapasitas Mingguan</span>
            <span class="hr-kpi-card__value">${totalCapacity} Jam</span>
            <span class="hr-kpi-card__sub">Standar 40 jam kerja / minggu per engineer</span>
          </div>

          <div class="hr-kpi-card">
            <span class="hr-kpi-card__label">Beban Tugas Aktif</span>
            <span class="hr-kpi-card__value" style="color: var(--jira-blue);">${totalAssignedHours} Jam</span>
            <span class="hr-kpi-card__sub">Tersebar pada ${activeTasks.length} tiket yang sedang berjalan</span>
          </div>

          <div class="hr-kpi-card">
            <span class="hr-kpi-card__label">Rata-Rata Utilisasi</span>
            <span class="hr-kpi-card__value" style="color: ${avgUtilization > 90 ? "#de350b" : "#006644"};">${avgUtilization}%</span>
            <span class="hr-kpi-card__sub">${avgUtilization > 90 ? "Perlu redistribusi beban tugas" : "Distribusi beban kerja proporsional"}</span>
          </div>
        </div>

        <!-- 3. Filter & Search Toolbar -->
        <div class="hr-toolbar">
          <div class="hr-toolbar__left">
            <div class="hr-search-wrap">
              <span class="hr-search-icon">${Icons.search("", 14)}</span>
              <input
                type="text"
                id="hrSearchInput"
                class="hr-search-input"
                placeholder="Cari nama engineer, role, atau keahlian..."
                value="${this.searchQuery}"
              />
            </div>

            <div class="hr-role-pills">
              ${[
                { id: "all", label: "Semua Role" },
                { id: "Project Manajer", label: "PM" },
                { id: "Backend", label: "Backend" },
                { id: "Frontend", label: "Frontend" },
                { id: "Full stack", label: "Fullstack" },
                { id: "QA", label: "QA / Tester" },
              ]
                .map(
                  (r) => `
                <button class="hr-role-pill ${this.roleFilter === r.id ? "hr-role-pill--active" : ""}" data-role="${r.id}">
                  ${r.label}
                </button>
              `,
                )
                .join("")}
            </div>
          </div>

          <div style="font-size: 12px; color: var(--color-text-subtle);">
            Menampilkan <strong>${filteredMembers.length}</strong> dari ${teamMembers.length} anggota
          </div>
        </div>

        <!-- 4. Members Workload List -->
        <div class="hr-card-list">
          <div class="hr-card-header">
            <h2 class="hr-card-header__title">Daftar Anggota Tim &amp; Kapasitas (${filteredMembers.length} Orang)</h2>
            <span class="hr-card-header__meta">Klik pada anggota untuk memfilter tugas mereka di Papan Kanban</span>
          </div>

          <div>
            ${
              filteredMembers.length === 0
                ? `
              <div style="padding: 32px; text-align: center; color: var(--color-text-subtle); font-size: 13px;">
                Tidak ada anggota tim yang cocok dengan pencarian atau filter.
              </div>
            `
                : filteredMembers
                    .map((member) => {
                      const assignedTasks = tasks.filter((t) => t.assigneeId === member.id && t.status !== "Selesai");
                      const memberHours = assignedTasks.reduce((acc, curr) => acc + (curr.estimateHours || 4), 0);
                      const cap = member.capacityHoursPerWeek || 40;
                      const isOverloaded = memberHours > cap;
                      const loadPercentage = Math.round((memberHours / cap) * 100);
                      const distinctEpicIds = Array.from(new Set(assignedTasks.map((t) => t.epicId).filter(Boolean)));
                      const assignedEpics = epics.filter((e) => distinctEpicIds.includes(e.id));
                      const isMultiModule = assignedEpics.length > 1;

                      return `
                <div class="hr-member-item">
                  <div class="hr-member-flex">
                    <!-- Profile & Skills -->
                    <div class="hr-member-profile">
                      <img src="${member.avatar}" alt="${member.name}" class="hr-member-avatar" />

                      <div class="hr-member-info">
                        <div class="hr-member-name-row">
                          <h3 class="hr-member-name">${member.name}</h3>
                          <span class="hr-member-role-badge">${member.role}</span>
                          ${
                            isMultiModule
                              ? `
                            <span class="jira-badge jira-badge--qa">
                              ${Icons.layers("", 11)}
                              <span>Multi-Modul (${assignedEpics.length})</span>
                            </span>
                          `
                              : ""
                          }
                          ${
                            member.onLeave
                              ? `
                            <span class="jira-badge jira-badge--review">Sedang Cuti</span>
                          `
                              : `
                            <span class="jira-badge jira-badge--done">Tersedia</span>
                          `
                          }
                        </div>

                        <div class="hr-member-contact">
                          <span>${member.email || `${member.name.toLowerCase().replace(/\s+/g, ".")}@softwarehouse.id`}</span>
                          ${
                            member.githubUsername
                              ? `
                            <span>·</span>
                            <span class="hr-github-pill">
                              ${Icons.folderGit("", 11)}
                              <span>@${member.githubUsername}</span>
                            </span>
                          `
                              : ""
                          }
                        </div>

                        <!-- Skills -->
                        <div class="hr-skills-row">
                          ${(member.skills || ["Software Engineering", "Agile Scrum"])
                            .map(
                              (s) => `
                            <span class="hr-skill-tag">${s}</span>
                          `,
                            )
                            .join("")}
                        </div>

                        <!-- Active Assigned Modules -->
                        ${
                          assignedEpics.length > 0
                            ? `
                          <div class="hr-epics-section">
                            <span class="hr-epics-label">
                              ${Icons.layers("", 12)}
                              <span>Modul Epik Aktif (${assignedEpics.length}):</span>
                            </span>
                            <div class="hr-epics-list">
                              ${assignedEpics
                                .map((ep) => {
                                  const epProj = projects.find((p) => p.id === ep.projectId);
                                  return `
                                  <span class="hr-epic-chip" style="border: 1px solid ${ep.color}40; background: ${ep.color}12; color: ${ep.color};" title="${epProj ? epProj.name + " · " : ""}${ep.title}">
                                    <span>${ep.key}</span>
                                    <span style="font-family: var(--font-sans); font-weight: 500; color: var(--color-text-body);">· ${ep.title}</span>
                                  </span>
                                `;
                                })
                                .join("")}
                            </div>
                          </div>
                        `
                            : ""
                        }
                      </div>
                    </div>

                    <!-- Workload Progress Bar & Actions -->
                    <div class="hr-workload-col">
                      <div class="hr-workload-header">
                        <span class="hr-workload-label">Beban Kerja Mingguan</span>
                        <div class="hr-workload-numbers">
                          <span style="font-weight: 700; color: ${isOverloaded ? "#bf2600" : "var(--color-text-heading)"};">
                            ${memberHours}j
                          </span>
                          <span style="color: var(--color-text-subtle);">/ ${cap}j (${loadPercentage}%)</span>
                        </div>
                      </div>

                      <div class="hr-progress-bar">
                        <div class="hr-progress-fill" style="width: ${Math.min(100, loadPercentage)}%; background: ${isOverloaded ? "#de350b" : loadPercentage > 80 ? "#ffab00" : "#006644"};"></div>
                      </div>

                      ${
                        isOverloaded
                          ? `
                        <div class="hr-overload-alert">
                          ${Icons.alertTriangle("", 13)}
                          <span>Overload: Melebihi kapasitas mingguan!</span>
                        </div>
                      `
                          : ""
                      }

                      <div class="hr-workload-meta">
                        <span>Mengerjakan <strong>${assignedTasks.length}</strong> task aktif</span>
                        <button class="jira-btn jira-btn--subtle hr-filter-board-btn" data-member-id="${member.id}" style="padding: 3px 8px; font-size: 11.5px;">
                          Lihat Tugas &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
                    })
                    .join("")
            }
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.element.addEventListener("input", (e) => {
      if (e.target.id === "hrSearchInput") {
        this.searchQuery = e.target.value;
        this.render();
        const input = this.element.querySelector("#hrSearchInput");
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    });

    this.element.addEventListener("click", (e) => {
      const rolePill = e.target.closest(".hr-role-pill");
      if (rolePill) {
        this.roleFilter = rolePill.dataset.role;
        this.render();
      }

      if (e.target.closest("#hrManageAccessBtn")) {
        store.setActiveTab("github");
      }

      if (e.target.closest("#hrViewBacklogBtn")) {
        store.setActiveTab("backlog");
      }

      const filterBoardBtn = e.target.closest(".hr-filter-board-btn");
      if (filterBoardBtn) {
        const memberId = filterBoardBtn.dataset.memberId;
        store.setFilterAssignee(memberId);
        store.setActiveTab("kanban");
      }
    });
  }
}
