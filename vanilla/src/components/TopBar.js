/**
 * TopBar Component (100% Native Vanilla JS ES Module)
 * Modeled after Atlassian Jira Software Cloud Global Navigation:
 * - Left: 9-dots App Switcher / Mobile Menu Toggle, PM Jira Logo, Brand title, Breadcrumb & Project Dropdown
 * - Center: Responsive Centered Global Search Bar with '/' keyboard shortcut
 * - Right: Jira Iconic "+ Buat" Action Button ('c' key), Role Switcher (RBAC),
 *          Notification Center with Real-time Count, Reset Demo, and User Profile
 */

import { store } from '../state/store.js';
import { Icons } from '../utils/icons.js';
import { NotificationPopover } from './common/NotificationPopover.js';

const ROLES = [
  { id: 'owner', label: 'Owner / Admin' },
  { id: 'pm', label: 'Project Manager' },
  { id: 'developer', label: 'Developer' },
  { id: 'qa', label: 'QA / Tester' },
  { id: 'finance', label: 'Finance' },
  { id: 'sales', label: 'Sales (CRM)' },
  { id: 'client', label: 'Klien (Portal)' }
];

const TAB_LABELS = {
  project: 'Modul Proyek',
  timeline: 'Timeline / Roadmap',
  backlog: 'Backlog & Sprints',
  kanban: 'Papan Kanban',
  ai_hub: 'Otomasi Fix Bug AI',
  github: 'GitHub & Cabang',
  list: 'Daftar Pekerjaan (JQL)',
  team: 'Tim HR & Workload',
  crm: 'CRM Deals Won',
  finance: 'Finance & Invoices',
  client: 'Service Desk / Klien'
};

export class TopBar {
  constructor() {
    this.container = document.createElement('header');
    this.container.className = 'topbar';
    this.notifPopover = new NotificationPopover();
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.render();
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  render() {
    const state = store.getState();
    const unreadNotifs = state.notifications ? state.notifications.filter((n) => !n.isRead).length : 0;
    const activeTabLabel = TAB_LABELS[state.activeTab] || 'Papan Kanban';

    this.container.innerHTML = `
      <!-- Left: App Switcher, Logo & Project Breadcrumb -->
      <div class="topbar__left">
        <!-- 9-Dots App Switcher & Mobile Sidebar Trigger -->
        <button id="topbarAppSwitcher" class="topbar__app-switcher" title="Buka Navigasi / Menu Aplikasi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="5" r="2.2"></circle>
            <circle cx="12" cy="5" r="2.2"></circle>
            <circle cx="19" cy="5" r="2.2"></circle>
            <circle cx="5" cy="12" r="2.2"></circle>
            <circle cx="12" cy="12" r="2.2"></circle>
            <circle cx="19" cy="12" r="2.2"></circle>
            <circle cx="5" cy="19" r="2.2"></circle>
            <circle cx="12" cy="19" r="2.2"></circle>
            <circle cx="19" cy="19" r="2.2"></circle>
          </svg>
        </button>

        <!-- Brand Group -->
        <div class="topbar__brand-group" id="topbarBrandHome" style="cursor: pointer;" title="Ke Beranda Papan Kanban">
          <div class="topbar__jira-logo">PM</div>
          <span class="topbar__brand-title">
            Project Manjer
            <span class="topbar__brand-badge">Enterprise</span>
          </span>
        </div>

        <!-- Breadcrumb Divider -->
        <span class="topbar__divider">/</span>

        <!-- Current Project Selector Dropdown -->
        <div class="topbar__project-wrapper" title="Pilih Proyek Aktif">
          <select id="topbarProjectSelect" class="topbar__project-select">
            ${state.projects.map((p) => `
              <option value="${p.id}" ${state.selectedProjectId === p.id ? 'selected' : ''}>
                ${p.code} · ${p.name}
              </option>
            `).join('')}
          </select>
          <span class="topbar__project-chevron">${Icons.chevronDown('', 12)}</span>
        </div>

        <!-- Active Page Context Breadcrumb -->
        <span class="topbar__divider topbar__context-sep">/</span>
        <span class="topbar__context-page" title="Halaman Aktif: ${activeTabLabel}">${activeTabLabel}</span>
      </div>

      <!-- Center: Responsive Global Quick Search Bar -->
      <div class="topbar__center">
        <div class="topbar__search-container">
          <span class="topbar__search-icon">${Icons.search('w-3.5 h-3.5', 14)}</span>
          <input
            type="text"
            id="topbarSearchInput"
            class="topbar__search-input"
            placeholder="Cari tiket, isu, atau kode..."
            value="${state.searchQuery || ''}"
            autocomplete="off"
            spellcheck="false"
          />
          <kbd class="topbar__search-shortcut" title="Tekan '/' untuk mencari">/</kbd>
        </div>
      </div>

      <!-- Right: Action Buttons, RBAC Role, Notification, Avatar -->
      <div class="topbar__right">
        <!-- Jira Iconic Primary "+ Buat" Button -->
        <button id="topbarCreateTaskBtn" class="topbar__create-btn" title="Buat Tiket Baru (Shortcut: 'c')">
          <span class="topbar__create-plus">+</span>
          <span>Buat</span>
          <kbd class="topbar__create-key">c</kbd>
        </button>

        <!-- Role Switcher (RBAC Simulation) -->
        <div class="topbar__role-badge" title="Ganti Peran Pengguna (RBAC Simulation)">
          <span class="topbar__role-label">Peran:</span>
          <select id="topbarRoleSelect" class="topbar__role-select">
            ${ROLES.map((r) => `
              <option value="${r.id}" ${state.role === r.id ? 'selected' : ''}>${r.label}</option>
            `).join('')}
          </select>
        </div>

        <!-- Notification Bell -->
        <div class="topbar__notif-wrapper">
          <button id="topbarNotifBtn" class="topbar__icon-btn" title="Notifikasi Tim">
            ${Icons.bell('w-4 h-4', 16)}
            ${unreadNotifs > 0 ? '<span class="topbar__notif-badge"></span>' : ''}
          </button>
        </div>

        <!-- Reset Demo Data Button -->
        <button id="topbarResetBtn" class="topbar__icon-btn" title="Kembalikan Data Demo ke Default Awal">
          ${Icons.refresh('w-3.5 h-3.5', 14)}
        </button>

        <!-- User Profile Avatar -->
        <img
          id="topbarAvatarBtn"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
          alt="Avatar"
          class="topbar__avatar"
          title="Login sebagai: ${state.role.toUpperCase()} — Klik untuk profil &amp; kapasitas tim"
        />
      </div>
    `;

    // Append popover to notification button container
    const notifWrapper = this.container.querySelector('.topbar__notif-wrapper');
    if (notifWrapper) {
      notifWrapper.appendChild(this.notifPopover.getElement());
    }

    this.attachEvents();
  }

  attachEvents() {
    // App switcher / mobile menu toggle
    const appSwitcher = this.container.querySelector('#topbarAppSwitcher');
    if (appSwitcher) {
      appSwitcher.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          store.toggleMobileSidebar();
        } else {
          const collapseBtn = document.getElementById('sidebarCollapseBtn');
          if (collapseBtn) collapseBtn.click();
        }
      });
    }

    // Brand click -> go to Kanban
    const brandHome = this.container.querySelector('#topbarBrandHome');
    if (brandHome) {
      brandHome.addEventListener('click', () => {
        store.setActiveTab('kanban');
      });
    }

    // Project switcher
    const projectSelect = this.container.querySelector('#topbarProjectSelect');
    if (projectSelect) {
      projectSelect.addEventListener('change', (e) => {
        store.setSelectedProjectId(e.target.value);
      });
    }

    // Create task button
    const createBtn = this.container.querySelector('#topbarCreateTaskBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        store.openCreateTaskModal();
      });
    }

    // Search input
    const searchInput = this.container.querySelector('#topbarSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        store.setSearchQuery(e.target.value);
      });
    }

    // Role switcher
    const roleSelect = this.container.querySelector('#topbarRoleSelect');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        store.setRole(e.target.value);
      });
    }

    // Notification button
    const notifBtn = this.container.querySelector('#topbarNotifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.notifPopover.toggle();
      });
    }

    // Reset button
    const resetBtn = this.container.querySelector('#topbarResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Kembalikan data proyek ke default awal?')) {
          store.resetDataToDefault();
        }
      });
    }

    // Avatar click -> navigate to HR Team view
    const avatarBtn = this.container.querySelector('#topbarAvatarBtn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        store.setActiveTab('team');
      });
    }
  }

  getElement() {
    return this.container;
  }

  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
