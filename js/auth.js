// Authentication & Session Management Module
// EcoClean Municipal Waste Management System
//
// Supported roles:
//   - citizen
//   - admin
//   - driver
//   - municipality_officer
//
// Citizen accounts can self-register.
// Municipality Officer accounts require the municipal access code.
// Admin/driver accounts remain provisioned accounts.

const Auth = {
  currentUser: null,

  // Change this code if you want a different demo municipality access code.
  MUNICIPAL_OFFICER_CODE: "MUNICIPAL-2026",

  init() {
    this.currentUser = StorageManager.get("current_user", null);

    // Validate session against the current stored user list.
    if (this.currentUser) {
      const users = StorageManager.get("users", INITIAL_DATA.users);
      const fresh = users.find(u => u.id === this.currentUser.id);

      this.currentUser = fresh || null;

      if (!fresh) {
        StorageManager.set("current_user", null);
      }
    }

    this.renderHeaderUser();
    this.enhanceRegistrationForm();
    this.bindEvents();
  },

  getCurrentUser() {
    return this.currentUser;
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  // Municipality officers have the same dashboard access
  // as municipal administrators.
  isAdmin() {
    return !!(
      this.currentUser &&
      (
        this.currentUser.role === "admin" ||
        this.currentUser.role === "municipality_officer"
      )
    );
  },

  isDriver() {
    return !!(
      this.currentUser &&
      this.currentUser.role === "driver"
    );
  },

  isMunicipalityOfficer() {
    return !!(
      this.currentUser &&
      this.currentUser.role === "municipality_officer"
    );
  },

  isCitizen() {
    return !!(
      this.currentUser &&
      this.currentUser.role === "citizen"
    );
  },

  getRoleLabel(role) {
    switch (role) {
      case "admin":
        return "Municipal Admin";

      case "municipality_officer":
        return "Municipality Officer";

      case "driver":
        return "Field Driver";

      default:
        return "Citizen";
    }
  },

  getRoleBadgeClass(role) {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";

      case "municipality_officer":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "driver":
        return "bg-amber-100 text-amber-700 border-amber-200";

      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  },

  renderHeaderUser() {
    const userContainer = document.getElementById("header-user-section");

    if (!userContainer) return;

    if (this.currentUser) {
      const roleBadgeClass = this.getRoleBadgeClass(this.currentUser.role);
      const roleLabel = this.getRoleLabel(this.currentUser.role);

      userContainer.innerHTML = `
        <div class="flex items-center gap-3">

          <div class="hidden md:flex flex-col text-right">

            <span class="text-sm font-bold text-slate-800">
              ${SecurityUtils.escapeHTML(this.currentUser.name)}
            </span>

            <div class="flex items-center gap-1.5 justify-end">

              <span class="text-xs px-2 py-0.5 rounded-full border font-semibold ${roleBadgeClass}">
                ${roleLabel}
              </span>

              ${
                this.currentUser.role === "citizen"
                  ? `
                    <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      🌱 ${this.currentUser.ecoPoints || 100} pts
                    </span>
                  `
                  : ""
              }

            </div>
          </div>

          <button
            id="profile-dropdown-btn"
            class="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-emerald-500 transition-all focus:outline-none"
            title="Profile"
          >
            <img
              src="${
                SecurityUtils.sanitizeUrl(this.currentUser.avatar) ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              }"
              alt="profile"
              class="w-9 h-9 rounded-full object-cover"
            >
          </button>

        </div>
      `;

      this.updateRoleBar();

    } else {

      userContainer.innerHTML = `
        <div class="flex items-center gap-2">

          <button
            id="nav-login-btn"
            class="btn btn-secondary text-sm py-1.5 px-3"
          >
            Log In
          </button>

          <button
            id="nav-register-btn"
            class="btn btn-primary text-sm py-1.5 px-3.5"
          >
            Sign Up
          </button>

        </div>
      `;

      const roleBar = document.getElementById("active-role-notice");

      if (roleBar) {
        roleBar.classList.add("hidden");
      }
    }
  },

  updateRoleBar() {
    const roleBar = document.getElementById("active-role-notice");

    if (!roleBar || !this.currentUser) return;

    if (
      this.currentUser.role === "admin" ||
      this.currentUser.role === "municipality_officer"
    ) {
      const isOfficer =
        this.currentUser.role === "municipality_officer";

      roleBar.className =
        isOfficer
          ? "bg-blue-900 text-blue-100 text-xs py-1.5 px-4 flex items-center justify-between"
          : "bg-purple-900 text-purple-100 text-xs py-1.5 px-4 flex items-center justify-between";

      roleBar.innerHTML = `
        <div class="flex items-center gap-2">

          <span class="inline-block w-2 h-2 rounded-full ${
            isOfficer
              ? "bg-blue-400"
              : "bg-emerald-400"
          } animate-pulse"></span>

          <span>
            <strong>
              ${
                isOfficer
                  ? "Municipality Officer Mode:"
                  : "Admin Mode Active:"
              }
            </strong>

            Logged in as
            ${SecurityUtils.escapeHTML(this.currentUser.name)}
          </span>

        </div>

        <button
          onclick="Auth.logout()"
          class="${
            isOfficer
              ? "text-blue-200"
              : "text-purple-200"
          } underline hover:text-white font-medium"
        >
          Log Out
        </button>
      `;

      roleBar.classList.remove("hidden");

    } else if (this.currentUser.role === "driver") {

      roleBar.className =
        "bg-amber-900 text-amber-100 text-xs py-1.5 px-4 flex items-center justify-between";

      roleBar.innerHTML = `
        <div class="flex items-center gap-2">

          <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>

          <span>
            <strong>Field Agent Mode:</strong>
            Logged in as
            ${SecurityUtils.escapeHTML(this.currentUser.name)}
          </span>

        </div>

        <button
          onclick="Auth.logout()"
          class="text-amber-200 underline hover:text-white font-medium"
        >
          Log Out
        </button>
      `;

      roleBar.classList.remove("hidden");

    } else {

      roleBar.classList.add("hidden");
    }
  },

  // Kept for compatibility with older cached HTML.
  quickSwitchRole() {
    App.showToast(
      "Role switching is disabled. Please log in with your assigned credentials.",
      "error"
    );
  },

  /*
   * Adds a registration type selector and municipality access-code
   * field to the existing registration form.
   *
   * This means you do NOT have to manually edit index.html just to
   * add the officer registration controls.
   */
  enhanceRegistrationForm() {
    const form = document.getElementById("register-form");

    if (!form) return;

    // Don't add the controls twice.
    if (document.getElementById("registration-account-type")) {
      return;
    }

    const existingNotice = form.querySelector("p.text-\\[11px\\]");

    const accountTypeWrapper = document.createElement("div");

    accountTypeWrapper.id = "registration-account-type-wrapper";

    accountTypeWrapper.innerHTML = `
      <label
        class="block text-xs font-bold text-slate-700 mb-1"
        for="registration-account-type"
      >
        Account Type
      </label>

      <select
        id="registration-account-type"
        name="accountType"
        class="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
      >
        <option value="citizen">
          Citizen
        </option>

        <option value="municipality_officer">
          Municipality Officer
        </option>
      </select>

      <p
        id="registration-account-type-help"
        class="text-[11px] text-slate-500 mt-1.5"
      >
        Citizen accounts can be created normally.
      </p>
    `;

    /*
     * Put account type before the existing municipal ward field.
     */
    const wardWrapper =
      form.querySelector('select[name="ward"]')?.closest("div");

    if (wardWrapper) {
      wardWrapper.parentNode.insertBefore(
        accountTypeWrapper,
        wardWrapper
      );
    } else {
      form.insertBefore(
        accountTypeWrapper,
        form.firstElementChild
      );
    }

    const codeWrapper = document.createElement("div");

    codeWrapper.id = "municipality-officer-code-wrapper";

    codeWrapper.className = "hidden";

    codeWrapper.innerHTML = `
      <label
        class="block text-xs font-bold text-slate-700 mb-1"
        for="municipality-officer-code"
      >
        Municipality Officer Access Code
      </label>

      <input
        type="password"
        id="municipality-officer-code"
        name="municipalityOfficerCode"
        placeholder="Enter municipal authorization code"
        autocomplete="off"
        class="w-full p-2.5 rounded-lg border border-blue-300 text-xs"
      >

      <p class="text-[11px] text-blue-600 mt-1.5">
        This code is required to create a Municipality Officer account.
      </p>
    `;

    accountTypeWrapper.insertAdjacentElement(
      "afterend",
      codeWrapper
    );

    const accountType =
      document.getElementById("registration-account-type");

    const updateRegistrationMode = () => {
      const selectedRole = accountType.value;

      const codeBox =
        document.getElementById(
          "municipality-officer-code-wrapper"
        );

      const codeInput =
        document.getElementById(
          "municipality-officer-code"
        );

      const help =
        document.getElementById(
          "registration-account-type-help"
        );

      const submitButton =
        form.querySelector('button[type="submit"]');

      if (selectedRole === "municipality_officer") {

        codeBox.classList.remove("hidden");

        codeInput.required = true;

        help.textContent =
          "Municipality Officer accounts can access the municipal control dashboard and require authorization.";

        help.className =
          "text-[11px] text-blue-600 mt-1.5";

        if (submitButton) {
          submitButton.textContent =
            "Create Municipality Officer Account";
        }

      } else {

        codeBox.classList.add("hidden");

        codeInput.required = false;
        codeInput.value = "";

        help.textContent =
          "Citizen accounts can be created normally.";

        help.className =
          "text-[11px] text-slate-500 mt-1.5";

        if (submitButton) {
          submitButton.textContent =
            "Complete Registration (+50 Eco-Points)";
        }
      }
    };

    accountType.addEventListener(
      "change",
      updateRegistrationMode
    );

    updateRegistrationMode();

    /*
     * Replace the old citizen-only notice if it exists.
     */
    if (existingNotice) {
      existingNotice.textContent =
        "Choose Citizen for a normal account or Municipality Officer if you have an authorized municipal access code.";
    }
  },

  bindEvents() {

    document.addEventListener("click", (e) => {

      if (e.target.closest("#profile-dropdown-btn")) {
        this.openProfileModal();
      }

      if (
        e.target.closest("#nav-login-btn") ||
        e.target.closest("#quick-login-trigger")
      ) {
        this.openLoginModal();
      }

      if (
        e.target.closest("#nav-register-btn") ||
        e.target.closest("#quick-register-trigger")
      ) {
        this.openRegisterModal();
      }
    });

    const regForm =
      document.getElementById("register-form");

    if (regForm) {

      regForm.addEventListener("submit", (e) => {

        e.preventDefault();

        this.handleRegister(
          new FormData(regForm)
        );
      });
    }

    const loginForm =
      document.getElementById("login-form");

    if (loginForm) {

      loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        this.handleLogin(
          new FormData(loginForm)
        );
      });
    }
  },

  handleRegister(formData) {

    const name =
      formData.get("name")?.trim();

    const username =
      formData.get("username")?.trim().toLowerCase();

    const email =
      formData.get("email")?.trim().toLowerCase();

    const phone =
      formData.get("phone")?.trim();

    const password =
      formData.get("password") || "";

    const ward =
      formData.get("ward") ||
      "Ward 4 - Green Valley";

    const address =
      formData.get("address")?.trim();

    const accountType =
      formData.get("accountType") ||
      "citizen";

    const municipalityOfficerCode =
      formData.get("municipalityOfficerCode") ||
      "";

    if (
      !name ||
      !username ||
      !email ||
      !phone ||
      !password
    ) {
      App.showToast(
        "Please fill in name, username, email, phone and password",
        "error"
      );

      return;
    }

    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {

      App.showToast(
        "Username: 3-30 chars, letters/numbers/._- only",
        "error"
      );

      return;
    }

    const pwCheck =
      SecurityUtils.validatePassword(password);

    if (!pwCheck.valid) {

      App.showToast(
        pwCheck.error,
        "error"
      );

      return;
    }

    /*
     * Validate account type.
     */
    const allowedRegistrationRoles = [
      "citizen",
      "municipality_officer"
    ];

    if (!allowedRegistrationRoles.includes(accountType)) {

      App.showToast(
        "Invalid account type selected",
        "error"
      );

      return;
    }

    /*
     * Municipality Officer authorization.
     */
    if (accountType === "municipality_officer") {

      if (
        municipalityOfficerCode.trim() !==
        this.MUNICIPAL_OFFICER_CODE
      ) {

        App.showToast(
          "Invalid municipality officer authorization code",
          "error"
        );

        return;
      }
    }

    const users =
      StorageManager.get(
        "users",
        INITIAL_DATA.users
      );

    if (
      users.some(
        u =>
          (u.email || "").toLowerCase() ===
          email
      )
    ) {

      App.showToast(
        "An account with this email already exists",
        "error"
      );

      return;
    }

    if (
      users.some(
        u =>
          (u.username || "").toLowerCase() ===
          username
      )
    ) {

      App.showToast(
        "Username already taken, choose another",
        "error"
      );

      return;
    }

    /*
     * Build the new account.
     */
    const newUser = {
      id:
        "usr_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 7),

      name:
        SecurityUtils.escapeHTML(name),

      username,

      email,

      passwordHash:
        SecurityUtils.hashPassword(password),

      phone:
        SecurityUtils.escapeHTML(phone),

      ward,

      address:
        SecurityUtils.escapeHTML(
          address || "City Center"
        ),

      role:
        accountType,

      ecoPoints:
        accountType === "citizen"
          ? 50
          : 0,

      department:
        accountType === "municipality_officer"
          ? "Municipal Solid Waste Management"
          : undefined,

      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",

      createdAt:
        new Date().toISOString()
    };

    users.push(newUser);

    /*
     * Persist account.
     */
    StorageManager.set(
      "users",
      users
    );

    /*
     * Start session.
     *
     * We intentionally keep the same user object here because
     * existing project code expects current_user to contain the
     * user's id, role and profile information.
     */
    this.currentUser = newUser;

    StorageManager.set(
      "current_user",
      this.currentUser
    );

    App.closeModal("auth-modal");

    this.renderHeaderUser();

    if (accountType === "municipality_officer") {

      App.showToast(
        `Municipality Officer account created successfully. Welcome ${name}!`
      );

      /*
       * Open municipal dashboard.
       */
      setTimeout(() => {
        App.switchTab("admin-dashboard");
      }, 150);

    } else {

      App.showToast(
        `Welcome ${name}! +50 Eco-Points added.`
      );

      setTimeout(() => {
        App.switchTab("report-issue");
      }, 150);
    }
  },

  handleLogin(formData) {

    const identifier =
      (
        formData.get("identifier") ||
        formData.get("email") ||
        ""
      )
        .trim()
        .toLowerCase();

    const password =
      formData.get("password") || "";

    if (!identifier || !password) {

      App.showToast(
        "Enter your email/username and password",
        "error"
      );

      return;
    }

    const users =
      StorageManager.get(
        "users",
        INITIAL_DATA.users
      );

    const matched =
      users.find(
        u =>
          (u.email || "").toLowerCase() ===
            identifier ||
          (u.username || "").toLowerCase() ===
            identifier
      );

    if (!matched) {

      App.showToast(
        "No account found for that email/username",
        "error"
      );

      return;
    }

    /*
     * Migrate any old plaintext password accounts.
     */
    if (
      matched.password &&
      !matched.passwordHash
    ) {

      matched.passwordHash =
        SecurityUtils.hashPassword(
          matched.password
        );

      delete matched.password;

      StorageManager.set(
        "users",
        users
      );
    }

    if (
      !matched.passwordHash ||
      !SecurityUtils.verifyPassword(
        password,
        matched.passwordHash
      )
    ) {

      App.showToast(
        "Incorrect password",
        "error"
      );

      return;
    }

    /*
     * Successful login.
     */
    this.currentUser = matched;

    StorageManager.set(
      "current_user",
      matched
    );

    App.closeModal("auth-modal");

    this.renderHeaderUser();

    const roleLabel =
      this.getRoleLabel(matched.role);

    App.showToast(
      `Logged in as ${matched.name} (${roleLabel})`
    );

    /*
     * Municipality officer and admin go to the
     * municipal dashboard.
     */
    if (
      matched.role === "admin" ||
      matched.role === "municipality_officer" ||
      matched.role === "driver"
    ) {

      setTimeout(() => {
        App.switchTab("admin-dashboard");
      }, 150);

    } else {

      setTimeout(() => {
        App.switchTab("complaint-tracking");
      }, 150);
    }
  },

  addEcoPoints(points) {

    if (!this.currentUser) return;

    this.currentUser.ecoPoints =
      (this.currentUser.ecoPoints || 0) +
      points;

    StorageManager.set(
      "current_user",
      this.currentUser
    );

    const users =
      StorageManager.get(
        "users",
        INITIAL_DATA.users
      );

    const idx =
      users.findIndex(
        u =>
          u.id ===
          this.currentUser.id
      );

    if (idx !== -1) {

      users[idx] =
        this.currentUser;

      StorageManager.set(
        "users",
        users
      );
    }

    this.renderHeaderUser();

    App.showToast(
      `🎉 Earned +${points} Eco-Points for civic participation!`
    );
  },

  openProfileModal() {

    const modalContent =
      document.getElementById(
        "profile-modal-body"
      );

    if (
      !modalContent ||
      !this.currentUser
    ) {
      return;
    }

    const roleLabel =
      this.getRoleLabel(
        this.currentUser.role
      );

    const roleClass =
      this.getRoleBadgeClass(
        this.currentUser.role
      );

    const isMunicipal =
      this.currentUser.role === "admin" ||
      this.currentUser.role === "municipality_officer" ||
      this.currentUser.role === "driver";

    modalContent.innerHTML = `
      <div class="p-6">

        <div class="flex items-center gap-4 mb-6 pb-4 border-b">

          <img
            src="${SecurityUtils.sanitizeUrl(this.currentUser.avatar)}"
            class="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow"
            alt="Profile photo"
          >

          <div class="min-w-0">

            <h3 class="text-xl font-bold text-slate-800">
              ${SecurityUtils.escapeHTML(this.currentUser.name)}
            </h3>

            <p class="text-xs text-slate-500 break-all">
              ${SecurityUtils.escapeHTML(this.currentUser.email)}
              ${
                this.currentUser.phone
                  ? ` • ${SecurityUtils.escapeHTML(this.currentUser.phone)}`
                  : ""
              }
            </p>

            <div class="flex flex-wrap items-center gap-2 mt-2">

              <span class="px-2.5 py-0.5 text-xs font-bold rounded-full border ${roleClass}">
                ${SecurityUtils.escapeHTML(roleLabel)}
              </span>

              <span class="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                ${SecurityUtils.escapeHTML(
                  this.currentUser.ward ||
                  "Central Zone"
                )}
              </span>

            </div>

            ${
              this.currentUser.username
                ? `
                  <p class="text-[11px] text-slate-400 mt-1">
                    Username:
                    <strong>
                      ${SecurityUtils.escapeHTML(
                        this.currentUser.username
                      )}
                    </strong>
                  </p>
                `
                : ""
            }

          </div>

        </div>

        ${
          isMunicipal
            ? `
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">

                <div class="flex items-center gap-2 mb-1">
                  <span>🏛️</span>

                  <strong class="text-sm text-blue-900">
                    Municipal Account
                  </strong>
                </div>

                <p class="text-xs text-blue-700 leading-relaxed">
                  This account has municipal access and can use
                  the centralized waste-management dashboard.
                </p>

                ${
                  this.currentUser.department
                    ? `
                      <p class="text-xs text-blue-800 font-semibold mt-2">
                        Department:
                        ${SecurityUtils.escapeHTML(
                          this.currentUser.department
                        )}
                      </p>
                    `
                    : ""
                }

              </div>
            `
            : ""
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">

            <span class="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              Eco-Points Balance
            </span>

            <div class="text-3xl font-extrabold text-emerald-800 mt-1">
              🌱 ${
                this.currentUser.ecoPoints ||
                0
              }
            </div>

            <p class="text-[11px] text-emerald-600 mt-1">
              Community participation
            </p>

          </div>

          <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">

            <span class="text-xs text-blue-700 font-semibold uppercase tracking-wider">
              Reports Logged
            </span>

            <div class="text-3xl font-extrabold text-blue-800 mt-1">
              📋 ${this.getUserReportCount()}
            </div>

            <p class="text-[11px] text-blue-600 mt-1">
              ${
                isMunicipal
                  ? "Municipal account"
                  : "Citizen contribution"
              }
            </p>

          </div>

        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

            <div>
              <span class="text-slate-400 block mb-0.5">
                Ward
              </span>

              <strong class="text-slate-700">
                ${SecurityUtils.escapeHTML(
                  this.currentUser.ward ||
                  "Not specified"
                )}
              </strong>
            </div>

            <div>
              <span class="text-slate-400 block mb-0.5">
                Address
              </span>

              <strong class="text-slate-700">
                ${SecurityUtils.escapeHTML(
                  this.currentUser.address ||
                  "Not specified"
                )}
              </strong>
            </div>

          </div>

        </div>

        <div class="flex justify-between items-center pt-2">

          <button
            onclick="Auth.logout()"
            class="text-sm font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
          >
            Log Out
          </button>

          ${
            isMunicipal
              ? `
                <button
                  onclick="App.closeModal('profile-modal'); App.switchTab('admin-dashboard')"
                  class="btn btn-primary text-sm"
                >
                  Open Dashboard
                </button>
              `
              : `
                <button
                  onclick="App.closeModal('profile-modal')"
                  class="btn btn-secondary text-sm"
                >
                  Close
                </button>
              `
          }

        </div>

      </div>
    `;

    App.openModal(
      "profile-modal"
    );
  },

  getUserReportCount() {

    const complaints =
      StorageManager.get(
        "complaints",
        INITIAL_DATA.complaints
      );

    return complaints.filter(
      c =>
        c.reportedBy?.id ===
        this.currentUser?.id
    ).length;
  },

  openLoginModal() {

    const loginTab =
      document.getElementById(
        "tab-login-btn"
      );

    if (loginTab) {
      loginTab.click();
    }

    App.openModal(
      "auth-modal"
    );
  },

  openRegisterModal() {

    const regTab =
      document.getElementById(
        "tab-register-btn"
      );

    if (regTab) {
      regTab.click();
    }

    App.openModal(
      "auth-modal"
    );

    /*
     * The controls may not exist if this function is triggered
     * before init(), so make sure they are available.
     */
    this.enhanceRegistrationForm();
  },

  logout() {

    this.currentUser = null;

    StorageManager.set(
      "current_user",
      null
    );

    App.closeModal(
      "profile-modal"
    );

    this.renderHeaderUser();

    App.showToast(
      "You have been logged out"
    );

    App.switchTab(
      "report-issue"
    );
  }
};
