// App Master Coordinator & Router
const App = {
  activeTab: "report-issue",

  init() {
    // Initialize components
    Auth.init();
    Report.init();
    Pickup.init();
    Tracking.init();
    Admin.init();
    Awareness.init();

    this.bindGlobalEvents();
    this.handleInitialRoute();
  },

  switchTab(tabId) {
    // Frontend route guard: admin dashboard requires provisioned admin/driver session.
    // (Real enforcement must live on backend later; this stops casual tab-click bypass.)
    if (tabId === "admin-dashboard" && typeof Auth !== "undefined") {
      const u = Auth.getCurrentUser && Auth.getCurrentUser();
      if (!u ||(u.role !== "admin" && u.role !== "driver" && u.role !== "municipality_officer")) 
      {
        this.showToast("Admin dashboard requires municipal login. Please sign in.", "error");
        if (typeof Auth.openLoginModal === "function") Auth.openLoginModal();
        return;
      }
    }
    this.activeTab = tabId;

    // Update Nav Buttons
    const tabButtons = document.querySelectorAll(".nav-tab-btn");
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update Sections
    const sections = document.querySelectorAll(".app-section");
    sections.forEach(sec => {
      if (sec.id === `section-${tabId}`) {
        sec.classList.remove("hidden");
      } else {
        sec.classList.add("hidden");
      }
    });

    // Refresh tab-specific components
    if (tabId === "complaint-tracking") {
      Tracking.render();
    } else if (tabId === "admin-dashboard") {
      Admin.renderKPIs();
      Admin.renderHotspots();
      Admin.renderComplaintsTable();
      Admin.renderPickupsTable();
    } else if (tabId === "waste-awareness") {
      Awareness.renderBinsGuide();
    }

    // Scroll smoothly to main view
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "auto";
    }
  },

  showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
    
    const icon = type === 'error' ? '⚠️' : type === 'warning' ? '🔔' : '🌱';
    toast.innerHTML = `
      <span>${icon}</span>
      <div class="flex-grow font-medium">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  },

  bindGlobalEvents() {
    // Tab Clicks
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Modal background close
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("open");
          document.body.style.overflow = "auto";
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.open").forEach(m => {
          m.classList.remove("open");
        });
        document.body.style.overflow = "auto";
      }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileDrawer = document.getElementById("mobile-drawer");
    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileDrawer.classList.toggle("hidden");
      });
    }
  },

  handleInitialRoute() {
    const hash = window.location.hash.replace("#", "");
    const validTabs = ["report-issue", "pickup-request", "complaint-tracking", "admin-dashboard", "waste-awareness"];
    if (validTabs.includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab("report-issue");
    }
  }
};

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
