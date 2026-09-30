// Complaint & Pickup Tracking Module
const Tracking = {
  currentTab: "complaints", // 'complaints' or 'pickups'
  statusFilter: "all",
  searchQuery: "",
  selectedItem: null,

  init() {
    this.bindEvents();
    this.render();
  },

  render() {
    const listContainer = document.getElementById("tracking-cards-list");
    if (!listContainer) return;

    if (this.currentTab === "complaints") {
      this.renderComplaintsList(listContainer);
    } else {
      this.renderPickupsList(listContainer);
    }
  },

  renderComplaintsList(container) {
    let complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);

    // Apply Filter
    if (this.statusFilter !== "all") {
      complaints = complaints.filter(c => c.status === this.statusFilter);
    }

    // Apply Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      complaints = complaints.filter(c => 
        c.id.toLowerCase().includes(q) || 
        c.title.toLowerCase().includes(q) || 
        c.ward.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }

    if (complaints.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div class="text-4xl mb-2">🔍</div>
          <h4 class="text-base font-bold text-slate-700">No Complaints Match Your Criteria</h4>
          <p class="text-xs text-slate-500 mt-1">Try changing the status filter or search query, or report a new issue.</p>
          <button onclick="App.switchTab('report-issue')" class="btn btn-primary text-xs mt-4">Report an Issue Now</button>
        </div>
      `;
      return;
    }

    container.innerHTML = complaints.map(c => this.generateComplaintCard(c)).join("");
  },

  generateComplaintCard(c) {
    const statusMap = {
      submitted: { label: "Logged", class: "badge-submitted" },
      under_review: { label: "Under Review", class: "badge-under_review" },
      assigned: { label: "Crew Assigned", class: "badge-assigned" },
      in_progress: { label: "In Progress", class: "badge-in_progress" },
      resolved: { label: "Resolved", class: "badge-resolved" }
    };

    const st = statusMap[c.status] || { label: c.status, class: "badge-normal" };
    const urgencyClass = c.urgency === "critical" ? "badge-critical" : c.urgency === "urgent" ? "badge-urgent" : "badge-normal";
    const safeTitle = SecurityUtils.escapeHTML(c.title);
    const safeDesc = SecurityUtils.escapeHTML(c.description);
    const safeWard = SecurityUtils.escapeHTML(c.ward);
    const safeAddr = SecurityUtils.escapeHTML(c.address.split(',')[0]);
    const safeTeam = c.assignedTeam ? SecurityUtils.escapeHTML(c.assignedTeam) : '';
    const safePhoto = SecurityUtils.sanitizeUrl(c.photoUrl);
    const safeId = SecurityUtils.escapeHTML(c.id);

    return `
      <div class="eco-card p-5 hover:border-emerald-300 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ${safeId}
            </span>
            <span class="badge ${urgencyClass}">${SecurityUtils.escapeHTML(c.urgency)}</span>
            <span class="text-xs text-slate-400">• ${new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
          <span class="badge ${st.class}">${st.label}</span>
        </div>

        <div class="flex flex-col md:flex-row gap-4 mt-4">
          <div class="relative w-full md:w-36 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border">
            <img src="${safePhoto}" alt="${safeTitle}" class="w-full h-full object-cover">
            ${c.status === 'resolved' ? `
              <span class="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                ✓ Solved
              </span>` : ''}
          </div>

          <div class="flex-grow">
            <h4 class="text-base font-bold text-slate-800 leading-snug">${safeTitle}</h4>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">${safeDesc}</p>
            <div class="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-2.5">
              <span>📍 <strong class="text-slate-700">${safeWard}</strong></span>
              <span>🏢 ${safeAddr}</span>
              ${safeTeam ? `<span>🚚 <strong class="text-purple-700">${safeTeam}</strong></span>` : ''}
            </div>
          </div>

          <div class="flex flex-row md:flex-col justify-end gap-2 flex-shrink-0 pt-2 md:pt-0">
            <button onclick="Tracking.openDetailsModal('${safeId}')" class="btn btn-secondary text-xs py-2 px-3.5 w-full md:w-auto">
              View Timeline
            </button>
            ${c.status === 'resolved' ? `
              <button onclick="Tracking.openBeforeAfterModal('${safeId}')" class="btn btn-outline text-xs py-2 px-3.5 w-full md:w-auto">
                📸 Before/After
              </button>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  renderPickupsList(container) {
    let pickups = StorageManager.get("pickups", INITIAL_DATA.pickupRequests);

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      pickups = pickups.filter(p => 
        p.id.toLowerCase().includes(q) || 
        p.wasteTypeLabel.toLowerCase().includes(q) || 
        p.pickupAddress.toLowerCase().includes(q)
      );
    }

    if (pickups.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div class="text-4xl mb-2">📦</div>
          <h4 class="text-base font-bold text-slate-700">No Pickup Requests Found</h4>
          <p class="text-xs text-slate-500 mt-1">Schedule your doorstep collection for bulky items or e-waste.</p>
          <button onclick="App.switchTab('pickup-request')" class="btn btn-primary text-xs mt-4">Schedule Pickup</button>
        </div>
      `;
      return;
    }

    container.innerHTML = pickups.map(p => `
      <div class="eco-card p-5 hover:border-blue-300 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              ${SecurityUtils.escapeHTML(p.id)}
            </span>
            <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              ${SecurityUtils.escapeHTML(p.wasteTypeLabel)}
            </span>
          </div>
          <span class="badge ${p.status === 'completed' || p.status === 'collected' ? 'badge-resolved' : 'badge-assigned'}">
            ${SecurityUtils.escapeHTML(p.status.toUpperCase())}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
          <div>
            <span class="text-slate-400">Scheduled Date & Slot:</span>
            <p class="font-bold text-slate-800 text-sm mt-0.5">📅 ${SecurityUtils.escapeHTML(p.scheduledDate)}</p>
            <p class="text-slate-600">⏰ ${SecurityUtils.escapeHTML(p.timeSlot)}</p>
          </div>
          <div>
            <span class="text-slate-400">Items & Weight:</span>
            <p class="font-semibold text-slate-800 mt-0.5">${SecurityUtils.escapeHTML(p.itemsSummary)}</p>
            <p class="text-slate-500">Est. Weight: ${SecurityUtils.escapeHTML(p.estimatedWeight)}</p>
          </div>
          <div>
            <span class="text-slate-400">Assigned Collection Vehicle:</span>
            <p class="font-bold text-purple-700 mt-0.5">🚚 ${SecurityUtils.escapeHTML(p.assignedDriver || 'Assigning nearest route...')}</p>
            <p class="text-slate-500 truncate">📍 ${SecurityUtils.escapeHTML(p.pickupAddress)}</p>
          </div>
        </div>
      </div>
    `).join("");
  },

  openDetailsModal(id) {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const c = complaints.find(item => item.id === id);
    if (!c) return;
    this.selectedItem = c;

    const modalBody = document.getElementById("timeline-modal-body");
    if (!modalBody) return;

    // Timeline steps
    const steps = [
      { key: "submitted", title: "Complaint Logged", desc: "Citizen filed report with geo-location & photo proof" },
      { key: "under_review", title: "Officer Inspection", desc: "Sanitary inspector verified urgency & assigned ward zone" },
      { key: "assigned", title: "Crew & Truck Dispatched", desc: "Assigned vehicle allocated with automated route" },
      { key: "in_progress", title: "Cleanup in Action", desc: "Sanitation workers actively clearing spot" },
      { key: "resolved", title: "Resolved & Disinfected", desc: "Spot sanitized with lime powder; after photos verified" }
    ];

    const currentIdx = steps.findIndex(s => s.key === c.status);
    const effectiveIdx = currentIdx === -1 ? (c.status === "resolved" ? 4 : 1) : currentIdx;

    const safeId = SecurityUtils.escapeHTML(c.id);
    const safeWard = SecurityUtils.escapeHTML(c.ward);
    const safeTitle = SecurityUtils.escapeHTML(c.title);
    const safeCat = SecurityUtils.escapeHTML(c.categoryLabel);
    const safeReporter = SecurityUtils.escapeHTML(c.reportedBy?.name || 'Citizen');
    const safePhone = SecurityUtils.escapeHTML(c.reportedBy?.phone || 'Verified');
    const safeAddress = SecurityUtils.escapeHTML(c.address);
    const safeVolume = SecurityUtils.escapeHTML(c.estimatedVolume || 'Medium Pile');
    const safeDesc = SecurityUtils.escapeHTML(c.description);
    const safeTeam = c.assignedTeam ? SecurityUtils.escapeHTML(c.assignedTeam) : '';
    const safeNotes = c.resolutionNotes ? SecurityUtils.escapeHTML(c.resolutionNotes) : '';
    const safeFeedback = c.citizenFeedback ? SecurityUtils.escapeHTML(c.citizenFeedback) : '';
    const safePhoto = SecurityUtils.sanitizeUrl(c.photoUrl);
    const safeResPhoto = SecurityUtils.sanitizeUrl(c.resolutionPhotoUrl || INITIAL_DATA.samplePhotos.resolvedClean);

    modalBody.innerHTML = `
      <div class="p-6">
        <div class="flex items-start justify-between pb-4 border-b">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">${safeId}</span>
              <span class="text-xs font-semibold text-slate-500">${safeWard}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-800">${safeTitle}</h3>
          </div>
          <button onclick="App.closeModal('timeline-modal')" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Complaint Details</h4>
            <div class="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p><strong>Category:</strong> ${safeCat}</p>
              <p><strong>Reported By:</strong> ${safeReporter} (${safePhone})</p>
              <p><strong>Exact Location:</strong> ${safeAddress}</p>
              <p><strong>Volume:</strong> ${safeVolume}</p>
              <p><strong>Description:</strong> ${safeDesc}</p>
              ${safeTeam ? `<p><strong>Sanitation Unit:</strong> <span class="text-purple-700 font-bold">${safeTeam}</span></p>` : ''}
              ${safeNotes ? `<p><strong>Resolution Notes:</strong> <span class="text-emerald-700 font-medium">${safeNotes}</span></p>` : ''}
            </div>

            <div class="mt-4">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Site Photo</h4>
              <img src="${safePhoto}" class="w-full h-44 object-cover rounded-xl border shadow-sm">
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Progress Journey</h4>
            <div class="timeline-container">
              ${steps.map((step, idx) => {
                const isCompleted = idx <= effectiveIdx;
                const isActive = idx === effectiveIdx;
                return `
                  <div class="timeline-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                    <div class="timeline-dot">
                      ${isCompleted ? '✓' : (idx + 1)}
                    </div>
                    <div class="text-sm font-bold ${isActive ? 'text-emerald-700' : 'text-slate-800'}">
                      ${SecurityUtils.escapeHTML(step.title)}
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">${SecurityUtils.escapeHTML(step.desc)}</div>
                    ${isActive ? `<span class="inline-block mt-1 text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Current Phase</span>` : ''}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>

        <!-- Rating & Feedback Section if Resolved -->
        ${c.status === 'resolved' ? `
          <div class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h4 class="text-sm font-bold text-emerald-900 mb-1">Citizen Feedback & Rating</h4>
            <div class="flex items-center gap-1 text-amber-400 text-lg mb-2">
              ${[1, 2, 3, 4, 5].map(star => `
                <button onclick="Tracking.rateComplaint('${safeId}', ${star})" class="hover:scale-125 transition ${star <= (c.rating || 5) ? 'text-amber-500' : 'text-slate-300'}">★</button>
              `).join("")}
              <span class="text-xs text-emerald-700 font-bold ml-2">(${c.rating || 5}/5 Stars)</span>
            </div>
            <p class="text-xs text-emerald-800 italic">"${safeFeedback || 'Satisfied with fast cleaning and sanitation response!'}"</p>
          </div>
        ` : `
          <div class="flex justify-between items-center pt-3 border-t">
            <span class="text-xs text-slate-500">Need urgent escalation?</span>
            <button onclick="Tracking.escalateComplaint('${safeId}')" class="text-xs font-bold text-amber-600 hover:text-amber-700">
              ⚡ Escalate to Ward Head
            </button>
          </div>
        `}
      </div>
    `;

    App.openModal("timeline-modal");
  },

  openBeforeAfterModal(id) {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const c = complaints.find(item => item.id === id);
    if (!c) return;

    const modalBody = document.getElementById("before-after-modal-body");
    if (!modalBody) return;

    const safeId = SecurityUtils.escapeHTML(c.id);
    const safeTitle = SecurityUtils.escapeHTML(c.title);
    const safeNotes = c.resolutionNotes ? SecurityUtils.escapeHTML(c.resolutionNotes) : 'Debris removed and sidewalk disinfected.';
    const safePhoto = SecurityUtils.sanitizeUrl(c.photoUrl);
    const safeResPhoto = SecurityUtils.sanitizeUrl(c.resolutionPhotoUrl || INITIAL_DATA.samplePhotos.resolvedClean);

    modalBody.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between pb-3 border-b mb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-800">Resolution Verification: ${safeId}</h3>
            <p class="text-xs text-slate-500">${safeTitle}</p>
          </div>
          <button onclick="App.closeModal('before-after-modal')" class="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-rose-50 p-3 rounded-xl border border-rose-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-rose-800 uppercase tracking-wide">🔴 Before Cleanup</span>
              <span class="text-[11px] text-rose-600 font-semibold">${new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <img src="${safePhoto}" class="w-full h-56 object-cover rounded-lg border shadow-sm">
            <p class="text-xs text-slate-600 mt-2">Initial condition: Overflowing garbage heap reported by citizen.</p>
          </div>

          <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">🟢 After Cleanup</span>
              <span class="text-[11px] text-emerald-600 font-semibold">${c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'Resolved'}</span>
            </div>
            <img src="${safeResPhoto}" class="w-full h-56 object-cover rounded-lg border shadow-sm">
            <p class="text-xs text-slate-600 mt-2">${safeNotes}</p>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <button onclick="App.closeModal('before-after-modal')" class="btn btn-secondary text-xs">Close</button>
        </div>
      </div>
    `;

    App.openModal("before-after-modal");
  },

  rateComplaint(id, rating) {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const c = complaints.find(item => item.id === id);
    if (c) {
      c.rating = rating;
      StorageManager.set("complaints", complaints);
      App.showToast(`Feedback saved! Rated ${rating} stars.`);
      this.openDetailsModal(id);
    }
  },

  escalateComplaint(id) {
    App.showToast(`Urgent alert sent to Municipal Sanitation Officer for ticket ${id}!`);
  },

  trackSpecific(id) {
    App.switchTab("complaint-tracking");
    this.currentTab = "complaints";
    this.searchQuery = id;
    const searchInput = document.getElementById("tracking-search-input");
    if (searchInput) searchInput.value = id;
    this.render();
    setTimeout(() => {
      this.openDetailsModal(id);
    }, 200);
  },

  trackPickup(id) {
    App.switchTab("complaint-tracking");
    this.currentTab = "pickups";
    this.searchQuery = id;
    const searchInput = document.getElementById("tracking-search-input");
    if (searchInput) searchInput.value = id;
    const pickupTabBtn = document.getElementById("tracking-tab-pickups");
    if (pickupTabBtn) pickupTabBtn.click();
    this.render();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("tracking-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Tab switcher between Complaints & Pickups
    const compTab = document.getElementById("tracking-tab-complaints");
    const pickTab = document.getElementById("tracking-tab-pickups");
    if (compTab && pickTab) {
      compTab.addEventListener("click", () => {
        this.currentTab = "complaints";
        compTab.className = "px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow";
        pickTab.className = "px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200";
        document.getElementById("tracking-status-filters").classList.remove("hidden");
        this.render();
      });

      pickTab.addEventListener("click", () => {
        this.currentTab = "pickups";
        pickTab.className = "px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow";
        compTab.className = "px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200";
        document.getElementById("tracking-status-filters").classList.add("hidden");
        this.render();
      });
    }

    // Filter pills
    const filterBtns = document.querySelectorAll(".tracking-filter-btn");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active", "bg-slate-800", "text-white"));
        filterBtns.forEach(b => b.classList.add("bg-white", "text-slate-600"));
        btn.classList.add("active", "bg-slate-800", "text-white");
        btn.classList.remove("bg-white", "text-slate-600");
        this.statusFilter = btn.dataset.status;
        this.render();
      });
    });
  }
};
