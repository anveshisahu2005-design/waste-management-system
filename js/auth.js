// Authentication & Session Management Module
// Secure model: role comes ONLY from stored user record.
// Login = email/username + password. No role picker.
// Registration always creates role=citizen. Admin/driver accounts are
// provisioned by municipality (see INITIAL_DATA.users) and can never self-register.
const Auth = {
  currentUser: null,

  init() {
    this.currentUser = StorageManager.get("current_user", null);
    // Validate session still maps to a known user (prevents stale localStorage)
    if (this.currentUser) {
      const users = StorageManager.get("users", INITIAL_DATA.users);
      const fresh = users.find(u => u.id === this.currentUser.id);
      this.currentUser = fresh || null;
      if (!fresh) StorageManager.set("current_user", null);
    }
    this.renderHeaderUser();
    this.bindEvents();
  },

  getCurrentUser() {
    return this.currentUser;
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  isAdmin() {
    return this.currentUser && this.currentUser.role === "admin";
  },

  isDriver() {
    return this.currentUser && this.currentUser.role === "driver";
  },

  isCitizen() {
    return this.currentUser && this.currentUser.role === "citizen";
  },

  renderHeaderUser() {
    const userContainer = document.getElementById("header-user-section");
    if (!userContainer) return;

    if (this.currentUser) {
      const roleBadgeClass = this.currentUser.role === "admin"
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : this.currentUser.role === "driver"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-emerald-100 text-emerald-700 border-emerald-200";

      const roleLabel = this.currentUser.role === "admin" ? "Municipal Admin"
        : this.currentUser.role === "driver" ? "Field Driver" : "Citizen";

      userContainer.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="hidden md:flex flex-col text-right">
            <span class="text-sm font-bold text-slate-800">${SecurityUtils.escapeHTML(this.currentUser.name)}</span>
            <div class="flex items-center gap-1.5 justify-end">
              <span class="text-xs px-2 py-0.5 rounded-full border font-semibold ${roleBadgeClass}">${roleLabel}</span>
              ${this.currentUser.role === 'citizen' ? `
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  🌱 ${this.currentUser.ecoPoints || 100} pts
                </span>` : ''}
            </div>
          </div>
          <button id="profile-dropdown-btn" class="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-emerald-500 transition-all focus:outline-none" title="Profile">
            <img src="${SecurityUtils.sanitizeUrl(this.currentUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}"
                  alt="profile"
                  class="w-9 h-9 rounded-full object-cover">
          </button>
        </div>
      `;
      this.updateRoleBar();
    } else {
      userContainer.innerHTML = `
        <div class="flex items-center gap-2">
          <button id="nav-login-btn" class="btn btn-secondary text-sm py-1.5 px-3">Log In</button>
          <button id="nav-register-btn" class="btn btn-primary text-sm py-1.5 px-3.5">Sign Up</button>
        </div>
      `;
      const roleBar = document.getElementById("active-role-notice");
      if (roleBar) roleBar.classList.add("hidden");
    }
  },

  updateRoleBar() {
    const roleBar = document.getElementById("active-role-notice");
    if (!roleBar || !this.currentUser) return;
    if (this.currentUser.role === "admin") {
      roleBar.className = "bg-purple-900 text-purple-100 text-xs py-1.5 px-4 flex items-center justify-between";
      roleBar.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span><strong>Admin Mode Active:</strong> Logged in as ${SecurityUtils.escapeHTML(this.currentUser.name)}</span>
        </div>
        <button onclick="Auth.logout()" class="text-purple-200 underline hover:text-white font-medium">Log Out</button>
      `;
      roleBar.classList.remove("hidden");
    } else if (this.currentUser.role === "driver") {
      roleBar.className = "bg-amber-900 text-amber-100 text-xs py-1.5 px-4 flex items-center justify-between";
      roleBar.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span><strong>Field Agent Mode:</strong> Logged in as ${SecurityUtils.escapeHTML(this.currentUser.name)}</span>
        </div>
        <button onclick="Auth.logout()" class="text-amber-200 underline hover:text-white font-medium">Log Out</button>
      `;
      roleBar.classList.remove("hidden");
    } else {
      roleBar.classList.add("hidden");
    }
  },

  // DISABLED: previous demo backdoor allowed anyone to self-promote to admin.
  // Kept as stub so old cached HTML doesn't throw; always blocked.
  quickSwitchRole() {
    App.showToast("Role switching is disabled. Please log in with your provisioned credentials.", "error");
  },

  bindEvents() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("#profile-dropdown-btn")) {
        this.openProfileModal();
      }
      if (e.target.closest("#nav-login-btn") || e.target.closest("#quick-login-trigger")) {
        this.openLoginModal();
      }
      if (e.target.closest("#nav-register-btn") || e.target.closest("#quick-register-trigger")) {
        this.openRegisterModal();
      }
    });

    const regForm = document.getElementById("register-form");
    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister(new FormData(regForm));
      });
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin(new FormData(loginForm));
      });
    }
  },

  handleRegister(formData) {
    const name = formData.get("name")?.trim();
    const username = formData.get("username")?.trim().toLowerCase();
    const email = formData.get("email")?.trim().toLowerCase();
    const phone = formData.get("phone")?.trim();
    const password = formData.get("password") || "";
    const ward = formData.get("ward");
    const address = formData.get("address")?.trim();

    if (!name || !username || !email || !phone || !password) {
      App.showToast("Please fill in name, username, email, phone and password", "error");
      return;
    }
    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
      App.showToast("Username: 3-30 chars, letters/numbers/._- only", "error");
      return;
    }
    const pwCheck = SecurityUtils.validatePassword(password);
    if (!pwCheck.valid) {
      App.showToast(pwCheck.error, "error");
      return;
    }

    const users = StorageManager.get("users", INITIAL_DATA.users);
    if (users.some(u => u.email.toLowerCase() === email)) {
      App.showToast("An account with this email already exists", "error");
      return;
    }
    if (users.some(u => (u.username || "").toLowerCase() === username)) {
      App.showToast("Username already taken, choose another", "error");
      return;
    }

    // SECURITY: role is ALWAYS citizen here. Admin/driver must be provisioned.
    const newUser = {
      id: "usr_" + Date.now(),
      name: SecurityUtils.escapeHTML(name),
      username,
      email,
      passwordHash: SecurityUtils.hashPassword(password),
      phone: SecurityUtils.escapeHTML(phone),
      ward: ward || "Ward 4 - Green Valley",
      address: SecurityUtils.escapeHTML(address || "City Center"),
      role: "citizen",
      ecoPoints: 50,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
    };

    users.push(newUser);
    StorageManager.set("users", users);
    const sessionUser = { ...newUser };
    delete sessionUser.passwordHash;
    // keep hash out of session object where possible; re-attach id only
    this.currentUser = users.find(u => u.id === newUser.id);
    StorageManager.set("current_user", this.currentUser);

    App.closeModal("auth-modal");
    this.renderHeaderUser();
    App.showToast(`Welcome ${name}! +50 Eco-Points added.`);
    App.switchTab("report-issue");
  },

  handleLogin(formData) {
    const identifier = (formData.get("identifier") || formData.get("email") || "").trim().toLowerCase();
    const password = formData.get("password") || "";

    if (!identifier || !password) {
      App.showToast("Enter your email/username and password", "error");
      return;
    }

    const users = StorageManager.get("users", INITIAL_DATA.users);
    const matched = users.find(u =>
      u.email.toLowerCase() === identifier ||
      (u.username || "").toLowerCase() === identifier
    );

    if (!matched) {
      App.showToast("No account found for that email/username", "error");
      return;
    }

    // Migrate legacy plaintext accounts if any slipped in (one-time, then persist hashed)
    if (matched.password && !matched.passwordHash) {
      matched.passwordHash = SecurityUtils.hashPassword(matched.password);
      delete matched.password;
      StorageManager.set("users", users);
    }

    if (!matched.passwordHash || !SecurityUtils.verifyPassword(password, matched.passwordHash)) {
      App.showToast("Incorrect password", "error");
      return;
    }

    this.currentUser = matched;
    StorageManager.set("current_user", matched);

    App.closeModal("auth-modal");
    this.renderHeaderUser();
    App.showToast(`Logged in as ${matched.name} (${matched.role.toUpperCase()})`);

    if (matched.role === "admin" || matched.role === "driver") {
      App.switchTab("admin-dashboard");
    } else {
      App.switchTab("complaint-tracking");
    }
  },

  addEcoPoints(points) {
    if (!this.currentUser) return;
    this.currentUser.ecoPoints = (this.currentUser.ecoPoints || 0) + points;
    StorageManager.set("current_user", this.currentUser);

    const users = StorageManager.get("users", INITIAL_DATA.users);
    const idx = users.findIndex(u => u.id === this.currentUser.id);
    if (idx !== -1) {
      users[idx] = this.currentUser;
      StorageManager.set("users", users);
    }
    this.renderHeaderUser();
    App.showToast(`🎉 Earned +${points} Eco-Points for civic participation!`);
  },

  openProfileModal() {
    const modalContent = document.getElementById("profile-modal-body");
    if (!modalContent || !this.currentUser) return;

    modalContent.innerHTML = `
      <div class="p-6">
        <div class="flex items-center gap-4 mb-6 pb-4 border-b">
          <img src="${SecurityUtils.sanitizeUrl(this.currentUser.avatar)}"
                class="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow">
          <div>
            <h3 class="text-xl font-bold text-slate-800">${SecurityUtils.escapeHTML(this.currentUser.name)}</h3>
            <p class="text-xs text-slate-500">${SecurityUtils.escapeHTML(this.currentUser.email)} • ${SecurityUtils.escapeHTML(this.currentUser.phone || '')}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                ${SecurityUtils.escapeHTML(this.currentUser.role.toUpperCase())}
              </span>
              <span class="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                ${SecurityUtils.escapeHTML(this.currentUser.ward || 'Central Zone')}
              </span>
            </div>
            ${this.currentUser.username ? `<p class="text-[11px] text-slate-400 mt-1">Username: <strong>${SecurityUtils.escapeHTML(this.currentUser.username)}</strong></p>` : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
            <span class="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Eco-Points Balance</span>
            <div class="text-3xl font-extrabold text-emerald-800 mt-1">🌱 ${this.currentUser.ecoPoints || 120}</div>
            <p class="text-[11px] text-emerald-600 mt-1">Tier: Green Guardian (Level 3)</p>
          </div>
          <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
            <span class="text-xs text-blue-700 font-semibold uppercase tracking-wider">Reports Logged</span>
            <div class="text-3xl font-extrabold text-blue-800 mt-1">📋 ${this.getUserReportCount()}</div>
            <p class="text-[11px] text-blue-600 mt-1">Active contributor in Ward</p>
          </div>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs text-slate-500">
          Admin and driver accounts are provisioned by the municipality. Citizens cannot self-upgrade roles.
        </div>

        <div class="flex justify-between items-center pt-2">
          <button onclick="Auth.logout()" class="text-sm font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5">
            Log Out
          </button>
          <button onclick="App.closeModal('profile-modal')" class="btn btn-secondary text-sm">Close</button>
        </div>
      </div>
    `;
    App.openModal("profile-modal");
  },

  getUserReportCount() {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    return complaints.filter(c => c.reportedBy?.id === this.currentUser?.id).length;
  },

  openLoginModal() {
    const loginTab = document.getElementById("tab-login-btn");
    if (loginTab) loginTab.click();
    App.openModal("auth-modal");
  },

  openRegisterModal() {
    const regTab = document.getElementById("tab-register-btn");
    if (regTab) regTab.click();
    App.openModal("auth-modal");
  },

  logout() {
    this.currentUser = null;
    StorageManager.set("current_user", null);
    App.closeModal("profile-modal");
    this.renderHeaderUser();
    App.showToast("You have been logged out");
    App.switchTab("report-issue");
  }
};
