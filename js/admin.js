// Admin Dashboard & Hotspot Analytics Module
const Admin = {
  wardFilter: "all",
  categoryFilter: "all",
  statusFilter: "all",

  init() {
    this.renderKPIs();
    this.renderHotspots();
    this.renderComplaintsTable();
    this.renderPickupsTable();
    this.bindEvents();
  },

  renderKPIs() {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const pickups = StorageManager.get("pickups", INITIAL_DATA.pickupRequests);
    const hotspots = StorageManager.get("hotspots", INITIAL_DATA.hotspots);

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === "resolved").length;
    const inProgress = complaints.filter(c => c.status === "in_progress" || c.status === "assigned").length;
    const critical = complaints.filter(c => c.urgency === "critical" && c.status !== "resolved").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const kpiContainer = document.getElementById("admin-kpis-grid");
    if (!kpiContainer) return;

    kpiContainer.innerHTML = `
      <div class="eco-card p-4 border-l-4 border-l-emerald-500 bg-white">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
          <span class="text-xl">📋</span>
        </div>
        <div class="text-2xl font-black text-slate-800 mt-2">${total}</div>
        <span class="text-[11px] text-emerald-600 font-semibold">Across all 5 Municipal Wards</span>
      </div>

      <div class="eco-card p-4 border-l-4 border-l-blue-500 bg-white">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Today</span>
          <span class="text-xl">✅</span>
        </div>
        <div class="text-2xl font-black text-blue-700 mt-2">${resolved} <span class="text-xs font-bold text-slate-500">(${resolutionRate}%)</span></div>
        <span class="text-[11px] text-blue-600 font-semibold">Avg. turnaround: 3.4 hrs</span>
      </div>

      <div class="eco-card p-4 border-l-4 border-l-amber-500 bg-white">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Operations</span>
          <span class="text-xl">🚚</span>
        </div>
        <div class="text-2xl font-black text-amber-700 mt-2">${inProgress}</div>
        <span class="text-[11px] text-amber-600 font-semibold">4 Teams on active field routes</span>
      </div>

      <div class="eco-card p-4 border-l-4 border-l-rose-500 bg-white">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Hotspots Flagged</span>
          <span class="text-xl">🔥</span>
        </div>
        <div class="text-2xl font-black text-rose-700 mt-2">${hotspots.length} <span class="text-xs text-rose-500 font-bold">(${critical} Urgent)</span></div>
        <span class="text-[11px] text-rose-600 font-semibold">Automated sensor & citizen alerts</span>
      </div>
    `;
  },

  renderHotspots() {
    const hotspots = StorageManager.get("hotspots", INITIAL_DATA.hotspots);
    const container = document.getElementById("admin-hotspots-canvas");
    const listContainer = document.getElementById("admin-hotspots-list");

    if (!container || !listContainer) return;

    // Render interactive map visualization pins
    container.innerHTML = `
      <div class="map-svg-grid relative w-full h-full">
        <!-- City Boundary Outline -->
        <div class="absolute inset-4 border-2 border-dashed border-emerald-300 rounded-2xl pointer-events-none opacity-40"></div>
        <div class="absolute top-2 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-700 border shadow-sm">
          🗺️ Municipal Zone Central Map (Live Sensors & Citizen Complaints)
        </div>

        ${hotspots.map((hs, idx) => {
          // Calculate grid positioning percentages
          const posX = 18 + (idx * 17) % 65;
          const posY = 20 + (idx * 22) % 60;
          const colorClass = hs.severity === "high" ? "bg-rose-500" : hs.severity === "medium" ? "bg-amber-500" : "bg-emerald-500";
          const pulseColor = hs.severity === "high" ? "rgba(239, 68, 68, 0.5)" : "rgba(245, 158, 11, 0.5)";

          return `
            <div class="map-marker-pin" style="left: ${posX}%; top: ${posY}%;" onclick="Admin.viewHotspot('${hs.id}')">
              <div class="hotspot-radar-pulse" style="background-color: ${pulseColor}; left: 50%; top: 50%;"></div>
              <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white ring-2 ring-slate-900/10 hover:scale-125 transition">
                ${hs.complaintCount}
              </div>
              <div class="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap pointer-events-none opacity-90">
                ${hs.name.split(' ')[0]}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Render Hotspot summary list
    listContainer.innerHTML = hotspots.map(hs => `
      <div class="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition cursor-pointer" onclick="Admin.viewHotspot('${hs.id}')">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800">${hs.name}</span>
          <span class="badge ${hs.severity === 'high' ? 'badge-critical' : hs.severity === 'medium' ? 'badge-urgent' : 'badge-normal'}">
            ${hs.severity.toUpperCase()}
          </span>
        </div>
        <p class="text-[11px] text-slate-500 mt-1">${hs.ward} • ${hs.primaryType}</p>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
          <span class="text-slate-600 font-medium">🚨 <strong>${hs.complaintCount}</strong> active reports</span>
          <span class="text-emerald-700 font-bold hover:underline">Dispatch Team →</span>
        </div>
      </div>
    `).join("");
  },

  viewHotspot(id) {
    const hotspots = StorageManager.get("hotspots", INITIAL_DATA.hotspots);
    const hs = hotspots.find(h => h.id === id);
    if (!hs) return;

    const modalBody = document.getElementById("admin-action-modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between pb-3 border-b mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔥</span>
            <div>
              <h3 class="text-lg font-bold text-slate-800">${hs.name}</h3>
              <p class="text-xs text-slate-500">${hs.ward}</p>
            </div>
          </div>
          <button onclick="App.closeModal('admin-action-modal')" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <div class="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border mb-5">
          <div class="flex justify-between">
            <span class="text-slate-500">Risk Severity Level:</span>
            <span class="font-bold uppercase ${hs.severity === 'high' ? 'text-rose-600' : 'text-amber-600'}">${hs.severity}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Active Citizen Complaints:</span>
            <span class="font-bold text-slate-800">${hs.complaintCount} reports</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Predominant Waste Stream:</span>
            <span class="font-semibold text-slate-700">${hs.primaryType}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Current Status:</span>
            <span class="font-bold text-purple-700">${hs.status}</span>
          </div>
          <div class="pt-2 border-t">
            <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Field Intelligence Note:</span>
            <p class="text-slate-700 mt-1">${hs.riskNote}</p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button onclick="Admin.dispatchQuickUnit('${hs.name}', '${hs.ward}'); App.closeModal('admin-action-modal');" class="btn btn-primary text-xs py-2.5">
            ⚡ Instant Dispatch Rapid Sanitation Team
          </button>
          <button onclick="Admin.filterByWard('${hs.ward}'); App.closeModal('admin-action-modal');" class="btn btn-secondary text-xs py-2">
            Filter All Tickets in this Ward
          </button>
        </div>
      </div>
    `;

    App.openModal("admin-action-modal");
  },

  dispatchQuickUnit(spotName, ward) {
    App.showToast(`🚨 Compactor Unit Dispatched to ${spotName}!`);
  },

  filterByWard(ward) {
    this.wardFilter = ward;
    const wardSelect = document.getElementById("admin-ward-filter");
    if (wardSelect) wardSelect.value = ward;
    this.renderComplaintsTable();
  },

  renderComplaintsTable() {
    let complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);

    if (this.wardFilter !== "all") {
      complaints = complaints.filter(c => c.ward === this.wardFilter);
    }
    if (this.statusFilter !== "all") {
      complaints = complaints.filter(c => c.status === this.statusFilter);
    }

    const tableBody = document.getElementById("admin-complaints-tbody");
    if (!tableBody) return;

    if (complaints.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-xs text-slate-500">
            No complaints found for the selected ward & status filters.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = complaints.map(c => {
      const statusBadge = {
        submitted: "badge-submitted",
        under_review: "badge-under_review",
        assigned: "badge-assigned",
        in_progress: "badge-in_progress",
        resolved: "badge-resolved"
      }[c.status] || "badge-normal";

      const safeId = SecurityUtils.escapeHTML(c.id);
      const safeTitle = SecurityUtils.escapeHTML(c.title);
      const safeCategory = SecurityUtils.escapeHTML(c.categoryLabel);
      const safeWard = SecurityUtils.escapeHTML(c.ward);
      const safeUrgency = SecurityUtils.escapeHTML(c.urgency);
      const safeStatus = SecurityUtils.escapeHTML(c.status.replace('_', ' '));
      const safeTeam = c.assignedTeam ? SecurityUtils.escapeHTML(c.assignedTeam.split('(')[0]) : '<span class="text-slate-400 italic">Unassigned</span>';

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/70 text-xs transition">
          <td class="py-3 px-3 font-mono font-bold text-emerald-800">${safeId}</td>
          <td class="py-3 px-3">
            <div class="font-bold text-slate-800 text-xs">${safeTitle}</div>
            <div class="text-[11px] text-slate-400">${safeCategory}</div>
          </td>
          <td class="py-3 px-3 text-slate-600 font-medium">${safeWard}</td>
          <td class="py-3 px-3">
            <span class="badge ${c.urgency === 'critical' ? 'badge-critical' : c.urgency === 'urgent' ? 'badge-urgent' : 'badge-normal'}">
              ${safeUrgency}
            </span>
          </td>
          <td class="py-3 px-3">
            <span class="badge ${statusBadge}">${safeStatus}</span>
          </td>
          <td class="py-3 px-3 text-slate-600">
            ${c.assignedTeam ? `<span class="text-purple-700 font-semibold">${safeTeam}</span>` : safeTeam}
          </td>
          <td class="py-3 px-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="Admin.openAssignModal('${safeId}')" class="px-2 py-1 bg-white border border-slate-200 hover:border-purple-400 rounded text-[11px] font-semibold text-purple-700 hover:bg-purple-50">
                Assign
              </button>
              <button onclick="Admin.openStatusModal('${safeId}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-[11px] font-semibold text-white">
                Status
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  renderPickupsTable() {
    const pickups = StorageManager.get("pickups", INITIAL_DATA.pickupRequests);
    const tableBody = document.getElementById("admin-pickups-tbody");
    if (!tableBody) return;

    tableBody.innerHTML = pickups.map(p => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs transition">
        <td class="py-3 px-3 font-mono font-bold text-blue-800">${SecurityUtils.escapeHTML(p.id)}</td>
        <td class="py-3 px-3 font-semibold text-slate-800">${SecurityUtils.escapeHTML(p.wasteTypeLabel)}</td>
        <td class="py-3 px-3 text-slate-600">${SecurityUtils.escapeHTML(p.user.name)} (${SecurityUtils.escapeHTML(p.user.phone)})</td>
        <td class="py-3 px-3 text-slate-600">${SecurityUtils.escapeHTML(p.scheduledDate)} (${SecurityUtils.escapeHTML(p.timeSlot)})</td>
        <td class="py-3 px-3">
          <span class="badge ${p.status === 'collected' ? 'badge-resolved' : 'badge-assigned'}">
            ${SecurityUtils.escapeHTML(p.status)}
          </span>
        </td>
        <td class="py-3 px-3 text-slate-600">${SecurityUtils.escapeHTML(p.assignedDriver || 'Pending')}</td>
        <td class="py-3 px-3 text-right">
          <button onclick="Admin.completePickup('${SecurityUtils.escapeHTML(p.id)}')" class="px-2 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100">
            ${p.status === 'collected' ? '✓ Collected' : 'Mark Collected'}
          </button>
        </td>
      </tr>
    `).join("");
  },

  openAssignModal(complaintId) {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const c = complaints.find(item => item.id === complaintId);
    if (!c) return;

    const teams = INITIAL_DATA.sanitationTeams;
    const modalBody = document.getElementById("admin-action-modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between pb-3 border-b mb-4">
          <h3 class="text-base font-bold text-slate-800">Assign Sanitation Fleet: ${c.id}</h3>
          <button onclick="App.closeModal('admin-action-modal')" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <p class="text-xs text-slate-600 mb-4">Location: <strong>${c.address} (${c.ward})</strong></p>

        <div class="space-y-2 mb-6">
          ${teams.map(t => `
            <label class="block p-3 border rounded-xl hover:border-emerald-500 cursor-pointer bg-white transition">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <input type="radio" name="selectedTeam" value="${t.name} (Lead: ${t.lead})" class="text-emerald-600 focus:ring-emerald-500" ${c.assignedTeam?.includes(t.name) ? 'checked' : ''}>
                  <div>
                    <div class="text-xs font-bold text-slate-800">${t.name}</div>
                    <div class="text-[11px] text-slate-500">${t.vehicle} • ${t.phone}</div>
                  </div>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  ${t.activeJobs} Active Jobs
                </span>
              </div>
            </label>
          `).join("")}
        </div>

        <div class="flex justify-end gap-2">
          <button onclick="App.closeModal('admin-action-modal')" class="btn btn-secondary text-xs">Cancel</button>
          <button onclick="Admin.saveAssignment('${c.id}')" class="btn btn-primary text-xs">Confirm Dispatch</button>
        </div>
      </div>
    `;

    App.openModal("admin-action-modal");
  },

  saveAssignment(complaintId) {
    const selected = document.querySelector('input[name="selectedTeam"]:checked');
    if (!selected) {
      App.showToast("Please choose a sanitation team", "warning");
      return;
    }

    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const c = complaints.find(item => item.id === complaintId);
    if (c) {
      c.assignedTeam = selected.value;
      if (c.status === "submitted" || c.status === "under_review") {
        c.status = "assigned";
      }
      c.timeline.push({
        status: "assigned",
        title: "Fleet Dispatched",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detail: `Allocated to ${selected.value}`
      });

      StorageManager.set("complaints", complaints);
      App.closeModal("admin-action-modal");
      this.renderKPIs();
      this.renderComplaintsTable();
      App.showToast(`Sanitation crew assigned to ${c.id}!`);
    }
  },

  openStatusModal(complaintId) {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const c = complaints.find(item => item.id === complaintId);
    if (!c) return;

    const modalBody = document.getElementById("admin-action-modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between pb-3 border-b mb-4">
          <h3 class="text-base font-bold text-slate-800">Update Status: ${c.id}</h3>
          <button onclick="App.closeModal('admin-action-modal')" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">New Resolution Status:</label>
            <select id="update-status-select" class="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800">
              <option value="submitted" ${c.status === 'submitted' ? 'selected' : ''}>1. Complaint Logged</option>
              <option value="under_review" ${c.status === 'under_review' ? 'selected' : ''}>2. Under Review</option>
              <option value="assigned" ${c.status === 'assigned' ? 'selected' : ''}>3. Crew Assigned</option>
              <option value="in_progress" ${c.status === 'in_progress' ? 'selected' : ''}>4. Cleanup In Progress</option>
              <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>5. Resolved & Sanitized</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Resolution Report & Field Notes:</label>
            <textarea id="update-status-notes" rows="3" class="w-full p-2.5 rounded-lg border border-slate-300" placeholder="e.g. 500kg waste removed by compactor. Disinfected with sodium hypochlorite spray.">${c.resolutionNotes || ''}</textarea>
          </div>

          <div id="after-photo-group">
            <label class="block font-bold text-slate-700 mb-1">After-Cleanup Proof Photo:</label>
            <div class="flex items-center gap-2">
              <button type="button" onclick="Admin.attachCleanPhoto()" class="btn btn-secondary text-xs py-1.5 px-3">
                📷 Attach Verified Clean Photo
              </button>
              <span id="attached-clean-status" class="text-emerald-700 font-semibold text-[11px]"></span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button onclick="App.closeModal('admin-action-modal')" class="btn btn-secondary text-xs">Cancel</button>
          <button onclick="Admin.saveStatus('${c.id}')" class="btn btn-primary text-xs">Update Record</button>
        </div>
      </div>
    `;

    App.openModal("admin-action-modal");
  },

  attachedCleanPhotoUrl: null,

  attachCleanPhoto() {
    this.attachedCleanPhotoUrl = INITIAL_DATA.samplePhotos.resolvedClean;
    const tag = document.getElementById("attached-clean-status");
    if (tag) tag.innerText = "✓ Attached (Cleaned Site)";
    App.showToast("Verified clean photo attached");
  },

  saveStatus(complaintId) {
    const newStatus = document.getElementById("update-status-select").value;
    const notes = document.getElementById("update-status-notes").value;

    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const c = complaints.find(item => item.id === complaintId);
    if (c) {
      c.status = newStatus;
      if (notes) c.resolutionNotes = notes;
      if (newStatus === "resolved") {
        c.resolvedAt = new Date().toISOString();
        if (this.attachedCleanPhotoUrl) {
          c.resolutionPhotoUrl = this.attachedCleanPhotoUrl;
        }
      }

      c.timeline.push({
        status: newStatus,
        title: `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detail: notes || "Updated by Municipal Control Room"
      });

      StorageManager.set("complaints", complaints);
      App.closeModal("admin-action-modal");
      this.renderKPIs();
      this.renderComplaintsTable();
      App.showToast(`Updated ticket ${c.id} to ${newStatus.toUpperCase()}`);
    }
  },

  completePickup(pickupId) {
    const pickups = StorageManager.get("pickups", INITIAL_DATA.pickupRequests);
    const p = pickups.find(item => item.id === pickupId);
    if (p) {
      p.status = "collected";
      p.collectedAt = new Date().toISOString();
      StorageManager.set("pickups", pickups);
      this.renderPickupsTable();
      App.showToast(`Doorstep pickup ${p.id} marked as Collected & Disposed!`);
    }
  },

  exportCSV() {
    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    const headers = ["ID", "Title", "Category", "Ward", "Urgency", "Status", "ReportedBy", "CreatedAt", "ResolvedAt"];
    const rows = complaints.map(c => [
      SecurityUtils.sanitizeCSV(c.id),
      SecurityUtils.sanitizeCSV(c.title),
      SecurityUtils.sanitizeCSV(c.category),
      SecurityUtils.sanitizeCSV(c.ward),
      SecurityUtils.sanitizeCSV(c.urgency),
      SecurityUtils.sanitizeCSV(c.status),
      SecurityUtils.sanitizeCSV(c.reportedBy?.name || 'Anonymous'),
      SecurityUtils.sanitizeCSV(c.createdAt),
      SecurityUtils.sanitizeCSV(c.resolvedAt || 'N/A')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Municipal_Waste_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    App.showToast("Exported municipal report to CSV");
  },

  bindEvents() {
    const wardFilter = document.getElementById("admin-ward-filter");
    if (wardFilter) {
      wardFilter.addEventListener("change", (e) => {
        this.wardFilter = e.target.value;
        this.renderComplaintsTable();
      });
    }

    const statusFilter = document.getElementById("admin-status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.statusFilter = e.target.value;
        this.renderComplaintsTable();
      });
    }

    const exportBtn = document.getElementById("admin-export-csv-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCSV());
    }
  }
};
