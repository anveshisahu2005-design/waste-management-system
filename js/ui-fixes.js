/* EcoClean UI/UX fixes and municipality account improvements */
(function () {
  "use strict";

  const MUNICIPAL_OFFICER_CODE = "MUNICIPAL-2026";

  function esc(value) {
    if (typeof SecurityUtils !== "undefined" && SecurityUtils.escapeHTML) {
      return SecurityUtils.escapeHTML(String(value ?? ""));
    }
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function getUsers() {
    const users = StorageManager.get("users", INITIAL_DATA.users);
    const seedById = new Map(INITIAL_DATA.users.map(u => [u.id, u]));
    // Repair missing provisioned accounts without overwriting existing citizen data.
    INITIAL_DATA.users.filter(u => u.role === "admin" || u.role === "driver").forEach(seed => {
      if (!users.some(u => u.id === seed.id)) users.push({ ...seed });
    });
    StorageManager.set("users", users);
    return users;
  }

  function hideUnwantedNavigation() {
    const selectors = [
      '.nav-tab-btn[data-tab="report-issue"]',
      '.nav-tab-btn[data-tab="pickup-request"]',
      '[onclick*="switchTab(\'report-issue\')"]',
      '[onclick*="switchTab(\'pickup-request\')"]'
    ];
    document.querySelectorAll(selectors.join(",")).forEach(el => {
      // Keep the actual report/pickup functionality available internally; remove only navigation/quick actions.
      if (el.closest("#mobile-drawer") || el.closest("nav") || el.closest(".eco-hero-gradient") || el.closest("footer")) {
        el.remove();
      }
    });

    document.querySelectorAll('.eco-hero-gradient button').forEach(btn => {
      const text = (btn.textContent || "").toLowerCase();
      if (text.includes("play sorting quiz") ||
          text.includes("report waste issue") ||
          text.includes("schedule pickup")) btn.remove();
    });

    const logo = document.querySelector(".glass-header .flex.items-center.gap-3.cursor-pointer");
    if (logo) {
      logo.setAttribute("title", "Go to Track Status");
      logo.setAttribute("onclick", "App.switchTab('complaint-tracking')");
    }
  }

  function improveTabs() {
    const visibleTabs = Array.from(document.querySelectorAll(".nav-tabs-wrapper .nav-tab-btn"));
    visibleTabs.forEach(btn => {
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", btn.classList.contains("active") ? "true" : "false");
    });
    const originalSwitch = App.switchTab.bind(App);
    App.switchTab = function (tabId) {
      originalSwitch(tabId);
      document.querySelectorAll(".nav-tabs-wrapper .nav-tab-btn").forEach(btn => {
        const active = btn.dataset.tab === tabId;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    };
  }

  function addOfficerFields() {
    const form = document.getElementById("register-form");
    if (!form || document.getElementById("account-type")) return;

    const typeWrap = document.createElement("div");
    typeWrap.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
          <select id="account-type" name="accountType"
                  class="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold">
            <option value="citizen">Citizen</option>
            <option value="admin">Municipality Officer</option>
          </select>
        </div>
        <div id="officer-code-wrap" class="hidden">
          <label class="block text-xs font-bold text-slate-700 mb-1">Municipal Officer Code</label>
          <input id="officer-code" type="password" name="officerCode"
                 placeholder="Enter officer access code"
                 class="w-full p-2.5 rounded-lg border border-slate-300 text-xs">
        </div>
      </div>
    `;
    form.prepend(typeWrap);

    const type = document.getElementById("account-type");
    const codeWrap = document.getElementById("officer-code-wrap");
    const code = document.getElementById("officer-code");

    function sync() {
      const officer = type.value === "admin";
      codeWrap.classList.toggle("hidden", !officer);
      code.required = officer;
      form.querySelector('[name="ward"]')?.closest("div")?.previousElementSibling;
    }
    type.addEventListener("change", sync);
    sync();

    const note = form.querySelector("p.text-\\[11px\\]");
    if (note) note.textContent = "Citizens may register normally. Municipality officers can create an officer account using the municipal access code.";
  }

  function patchRegistration() {
    const originalRegister = Auth.handleRegister.bind(Auth);
    Auth.handleRegister = function (formData) {
      const accountType = formData.get("accountType") || "citizen";
      if (accountType !== "admin") return originalRegister(formData);

      const officerCode = formData.get("officerCode") || "";
      if (officerCode !== MUNICIPAL_OFFICER_CODE) {
        App.showToast("Invalid municipal officer access code.", "error");
        return;
      }

      const name = (formData.get("name") || "").trim();
      const username = (formData.get("username") || "").trim().toLowerCase();
      const email = (formData.get("email") || "").trim().toLowerCase();
      const phone = (formData.get("phone") || "").trim();
      const password = formData.get("password") || "";
      const ward = formData.get("ward") || "Central Municipal Zone";
      const address = (formData.get("address") || "Municipal Corporation Office").trim();

      if (!name || !username || !email || !phone || !password) {
        App.showToast("Please complete all required officer fields.", "error");
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

      const users = getUsers();
      if (users.some(u => (u.email || "").toLowerCase() === email)) {
        App.showToast("An account with this email already exists.", "error");
        return;
      }
      if (users.some(u => (u.username || "").toLowerCase() === username)) {
        App.showToast("Username already taken.", "error");
        return;
      }

      const officer = {
        id: "usr_officer_" + Date.now(),
        name: SecurityUtils.escapeHTML(name),
        username,
        email,
        passwordHash: SecurityUtils.hashPassword(password),
        phone: SecurityUtils.escapeHTML(phone),
        role: "admin",
        ward: SecurityUtils.escapeHTML(ward),
        address: SecurityUtils.escapeHTML(address),
        department: "Solid Waste & Sanitation Directorate",
        designation: "Municipality Officer",
        ecoPoints: 0,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
      };

      users.push(officer);
      StorageManager.set("users", users);
      this.currentUser = officer;
      StorageManager.set("current_user", officer);
      App.closeModal("auth-modal");
      this.renderHeaderUser();
      App.showToast(`Welcome ${name}! Municipality Officer account created.`);
      App.switchTab("admin-dashboard");
    };
  }

  function patchLogin() {
    const originalLogin = Auth.handleLogin.bind(Auth);
    Auth.handleLogin = function (formData) {
      // Merge/repair seeded municipal accounts before matching credentials.
      getUsers();
      return originalLogin(formData);
    };
  }

  function patchProfile() {
    Auth.openProfileModal = function () {
      const modalContent = document.getElementById("profile-modal-body");
      const user = Auth.getCurrentUser();
      if (!modalContent || !user) {
        App.showToast("Please sign in to view your profile.", "warning");
        Auth.openLoginModal();
        return;
      }

      const roleLabel = user.role === "admin" ? "Municipality Officer"
        : user.role === "driver" ? "Field Driver" : "Citizen";
      const reportCount = Auth.getUserReportCount ? Auth.getUserReportCount() : 0;
      const pickupCount = (StorageManager.get("pickups", INITIAL_DATA.pickupRequests) || [])
        .filter(p => p.user?.id === user.id).length;

      modalContent.innerHTML = `
        <div class="p-5 sm:p-7 profile-panel">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b">
            <img src="${esc(user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")}"
                 onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';"
                 class="w-20 h-20 rounded-full object-cover border-4 border-emerald-100 shadow"
                 alt="${esc(user.name)} profile photo">
            <div class="min-w-0 flex-1">
              <h3 class="text-xl font-extrabold text-slate-800 truncate">${esc(user.name)}</h3>
              <p class="text-xs text-slate-500 break-all mt-1">${esc(user.email || "")}</p>
              <p class="text-xs text-slate-500 mt-1">${esc(user.phone || "Phone not provided")}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">${roleLabel}</span>
                <span class="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700">${esc(user.ward || "Central Zone")}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
            <div class="profile-stat-card bg-emerald-50 border border-emerald-200">
              <span>🌱 Eco Points</span>
              <strong>${Number(user.ecoPoints || 0)}</strong>
            </div>
            <div class="profile-stat-card bg-blue-50 border border-blue-200">
              <span>📋 Reports</span>
              <strong>${reportCount}</strong>
            </div>
            <div class="profile-stat-card bg-violet-50 border border-violet-200">
              <span>🚚 Pickups</span>
              <strong>${pickupCount}</strong>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-400 block mb-1">Username</span>
              <strong class="text-slate-700">${esc(user.username || "—")}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-400 block mb-1">Department</span>
              <strong class="text-slate-700">${esc(user.department || "Citizen Services")}</strong>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
              <span class="text-slate-400 block mb-1">Address</span>
              <strong class="text-slate-700 break-words">${esc(user.address || "Not provided")}</strong>
            </div>
          </div>

          <div class="flex justify-between items-center gap-3 pt-5 mt-5 border-t">
            <button onclick="Auth.logout()" class="text-sm font-semibold text-rose-600 hover:text-rose-800">Log Out</button>
            <button onclick="App.closeModal('profile-modal')" class="btn btn-secondary text-sm">Close</button>
          </div>
        </div>
      `;
      App.openModal("profile-modal");
    };
  }

  function addFaqQuestionBox() {
    const faqCard = Array.from(document.querySelectorAll(".eco-card")).find(card =>
      (card.querySelector("h4")?.textContent || "").trim() === "Frequent Questions"
    );
    if (!faqCard || faqCard.querySelector("#faq-question-form")) return;

    const formWrap = document.createElement("div");
    formWrap.className = "mt-4 pt-4 border-t border-slate-200";
    formWrap.innerHTML = `
      <form id="faq-question-form" class="space-y-2">
        <label class="text-xs font-bold text-slate-700">Ask a Question</label>
        <textarea id="faq-question-input" rows="2" maxlength="500"
          placeholder="Type your waste-management question..."
          class="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"></textarea>
        <div class="flex justify-between items-center gap-2">
          <span class="text-[10px] text-slate-400">Maximum 500 characters</span>
          <button type="submit" class="btn btn-primary text-xs py-2 px-3">Submit Question</button>
        </div>
      </form>
      <div id="faq-user-questions" class="space-y-2 mt-3"></div>
    `;
    faqCard.appendChild(formWrap);

    const render = () => {
      const questions = StorageManager.get("faq_questions", []);
      const list = document.getElementById("faq-user-questions");
      if (!list) return;
      list.innerHTML = questions.slice(-3).reverse().map(q => `
        <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px]">
          <div class="font-semibold text-slate-700">Q: ${esc(q.question)}</div>
          <div class="text-emerald-700 mt-1">✓ Submitted to the municipal help desk</div>
        </div>
      `).join("");
    };

    document.getElementById("faq-question-form").addEventListener("submit", e => {
      e.preventDefault();
      const input = document.getElementById("faq-question-input");
      const question = input.value.trim();
      if (!question) {
        App.showToast("Please enter your question.", "warning");
        return;
      }
      const questions = StorageManager.get("faq_questions", []);
      questions.push({
        id: "faq_" + Date.now(),
        question,
        createdAt: new Date().toISOString(),
        userId: Auth.getCurrentUser()?.id || null
      });
      StorageManager.set("faq_questions", questions);
      input.value = "";
      render();
      App.showToast("Your question has been submitted to the municipal help desk.");
    });
    render();
  }

  function improveSamplePhotos() {
    const picker = document.getElementById("sample-photo-picker");
    if (!picker || !INITIAL_DATA.samplePhotos) return;
    const samples = [
      ["overflowing", "Overflowing Bin"],
      ["illegalDump", "Illegal Dump"],
      ["roadLitter", "Road Litter"],
      ["ewaste", "E-Waste"]
    ];
    picker.innerHTML = `
      <div class="sample-photo-gallery">
        <div class="sample-photo-heading">
          <div><strong>Sample Waste Photos</strong><span>Use these images for a quick demonstration.</span></div>
        </div>
        <div class="sample-photo-grid">
          ${samples.map(([key, label]) => `
            <button type="button" class="sample-photo-card" onclick="Report.selectSamplePhoto('${INITIAL_DATA.samplePhotos[key]}')">
              <img src="${esc(INITIAL_DATA.samplePhotos[key])}" alt="${label}" loading="lazy"
                   onerror="this.style.display='none';">
              <span>${label}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function init() {
    hideUnwantedNavigation();
    improveTabs();
    addOfficerFields();
    patchRegistration();
    patchLogin();
    patchProfile();
    addFaqQuestionBox();
    improveSamplePhotos();
    getUsers();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
