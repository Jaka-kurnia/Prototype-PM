/**
 * Sidebar Component (100% Native Vanilla JS ES Module)
 * Modeled after Atlassian Jira Software Cloud Project Navigation Sidebar:
 * - Project Header with Avatar, Project Code/Name & "Software project" Category
 * - Collapsible / Expandable Button (< / >) & Mobile Drawer Support
 * - Grouped Navigation Categories with Uniform 16px Vector Icons:
 *   1. PERENCANAAN (PLANNING): Modul Proyek, Timeline / Roadmap, Backlog & Sprints, Papan Kanban
 *   2. PENGEMBANGAN & AI: Otomasi Fix Bug (AI Hub), GitHub & Cabang Modul
 *   3. OPERASIONAL & BISNIS: Daftar Pekerjaan (JQL Grid), Tim HR & Workload, CRM Deals Won, Finance & Invoices, Portal Klien (Service Desk)
 * - Project Settings Footer
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';

export class Sidebar {
  constructor() {
    this.container = document.createElement('aside');
    this.container.className = 'sidebar';
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'sidebar-backdrop';
    this.isCollapsed = false;
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });

    this.backdrop.addEventListener('click', () => {
      store.toggleMobileSidebar(false);
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.container.classList.add('sidebar--collapsed');
    } else {
      this.container.classList.remove('sidebar--collapsed');
    }
    this.render();
  }

  render() {
    const state = store.getState();
    const activeProject = store.getActiveProject();
    const projectTasks = store.getProjectTasks();
    const crmWonCount = (state.crmDeals || []).filter((d) => d.status === 'Closing/Won').length;
    const unbilledCount = projectTasks.filter((t) => t.status === 'Selesai' && !t.billedInvoiceId).length;

    // Sync mobile drawer state
    if (state.isMobileSidebarOpen) {
      this.container.classList.add('sidebar--mobile-open');
      this.backdrop.classList.add('sidebar-backdrop--visible');
    } else {
      this.container.classList.remove('sidebar--mobile-open');
      this.backdrop.classList.remove('sidebar-backdrop--visible');
    }

    const projCode = activeProject ? activeProject.code : 'PROJ';
    const projName = activeProject ? activeProject.name : 'Proyek Software House';

    this.container.innerHTML = `
      <!-- Collapse Toggle Button -->
      <button id="sidebarCollapseBtn" class="sidebar__collapse-toggle" title="${this.isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}">
        ${this.isCollapsed ? Icons.chevronRight('w-3.5 h-3.5', 14) : Icons.chevronLeft('w-3.5 h-3.5', 14)}
      </button>

      <!-- Project Header Banner (Jira Style) -->
      <div id="sidebarProjectHeader" class="sidebar__project-header" style="cursor: pointer;" title="Buka Modul Proyek">
        <div class="sidebar__project-avatar" title="${projName}">
          ${projCode.slice(0, 3)}
        </div>
        <div class="sidebar__project-info">
          <span class="sidebar__project-title" title="${projName}">${projName}</span>
          <span class="sidebar__project-category">Software project · ${projCode}</span>
        </div>
      </div>

      <!-- Navigation Sections Container -->
      <div class="sidebar__nav-container">
        <!-- 1. PLANNING (PERENCANAAN) -->
        <div class="sidebar__nav-section">
          <div class="sidebar__section-title">Perencanaan</div>

          <button class="sidebar__nav-item ${state.activeTab === 'project' ? 'sidebar__nav-item--active' : ''}" data-tab="project" title="Modul Proyek (Overview, Tasks Kanban, Activity &amp; Tim)">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.grid('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Modul Proyek</span>
            </div>
          </button>
          
          <button class="sidebar__nav-item ${state.activeTab === 'timeline' ? 'sidebar__nav-item--active' : ''}" data-tab="timeline" title="Timeline &amp; Roadmap">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.calendar('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Timeline / Roadmap</span>
            </div>
          </button>

          <button class="sidebar__nav-item ${state.activeTab === 'backlog' ? 'sidebar__nav-item--active' : ''}" data-tab="backlog" title="Backlog &amp; Sprint Planning">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.layers('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Backlog &amp; Sprints</span>
            </div>
          </button>

          <button class="sidebar__nav-item ${state.activeTab === 'kanban' ? 'sidebar__nav-item--active' : ''}" data-tab="kanban" title="Papan Kanban Proyek">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.kanban('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Papan Kanban</span>
            </div>
            <span class="sidebar__badge">${projectTasks.length}</span>
          </button>
        </div>

        <!-- 2. DEVELOPMENT & AI (PENGEMBANGAN) -->
        <div class="sidebar__nav-section">
          <div class="sidebar__section-title">Pengembangan &amp; AI</div>

          <button class="sidebar__nav-item ${state.activeTab === 'ai_hub' ? 'sidebar__nav-item--active' : ''}" data-tab="ai_hub" title="Otomasi Fix Bug AI">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.bot('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Otomasi Fix Bug AI</span>
            </div>
          </button>

          <button class="sidebar__nav-item ${state.activeTab === 'github' ? 'sidebar__nav-item--active' : ''}" data-tab="github" title="Integrasi GitHub &amp; Cabang Modul">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.gitBranch('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">GitHub &amp; Cabang</span>
            </div>
          </button>
        </div>

        <!-- 3. OPERATIONS & BUSINESS (OPERASIONAL & BISNIS) -->
        <div class="sidebar__nav-section">
          <div class="sidebar__section-title">Operasional &amp; Bisnis</div>

          <button class="sidebar__nav-item ${state.activeTab === 'list' ? 'sidebar__nav-item--active' : ''}" data-tab="list" title="Daftar Pekerjaan &amp; JQL">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.listTodo('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Daftar Pekerjaan (JQL)</span>
            </div>
          </button>

          <button class="sidebar__nav-item ${state.activeTab === 'team' ? 'sidebar__nav-item--active' : ''}" data-tab="team" title="Beban Kerja &amp; Kapasitas Tim HR">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.users('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Tim HR &amp; Workload</span>
            </div>
          </button>

          <button class="sidebar__nav-item ${state.activeTab === 'crm' ? 'sidebar__nav-item--active' : ''}" data-tab="crm" title="Integrasi CRM Deals Won">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.briefcase('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">CRM Deals Won</span>
            </div>
            ${crmWonCount > 0 ? `<span class="sidebar__badge" style="background-color: #e3fcef; color: #006644;">${crmWonCount}</span>` : ''}
          </button>

          <button class="sidebar__nav-item ${state.activeTab === 'finance' ? 'sidebar__nav-item--active' : ''}" data-tab="finance" title="Modul Finance &amp; Invoices">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.dollarSign('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Finance &amp; Invoices</span>
            </div>
            ${unbilledCount > 0 ? `<span class="sidebar__badge" style="background-color: #fff0b3; color: #172b4d;">${unbilledCount}</span>` : ''}
          </button>

          <button class="sidebar__nav-item ${state.activeTab === 'client' ? 'sidebar__nav-item--active' : ''}" data-tab="client" title="Service Desk &amp; Portal Klien">
            <div class="sidebar__nav-item-left">
              <span class="sidebar__nav-item-icon">${Icons.shieldCheck('w-4 h-4', 16)}</span>
              <span class="sidebar__nav-item-label">Service Desk / Klien</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Project Settings Footer -->
      <div class="sidebar__footer">
        <button id="sidebarSettingsBtn" class="sidebar__settings-btn" title="Pengaturan Proyek &amp; GitHub">
          ${Icons.settings('w-4 h-4', 16)}
          <span>Pengaturan Proyek</span>
        </button>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Project header click -> navigate to project module
    const projectHeader = this.container.querySelector('#sidebarProjectHeader');
    if (projectHeader) {
      projectHeader.addEventListener('click', () => {
        store.setActiveTab('project');
      });
    }

    // Collapse toggle button
    const collapseBtn = this.container.querySelector('#sidebarCollapseBtn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCollapse();
      });
    }

    // Nav items
    this.container.querySelectorAll('.sidebar__nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) store.setActiveTab(tab);
      });
    });

    // Project settings button
    const settingsBtn = this.container.querySelector('#sidebarSettingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        store.setActiveTab('github');
      });
    }
  }

  getBackdrop() {
    return this.backdrop;
  }

  getElement() {
    return this.container;
  }
}
