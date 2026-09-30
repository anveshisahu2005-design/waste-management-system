// Waste Pickup Request Module
const Pickup = {
  selectedType: "e-waste",

  init() {
    this.renderWasteTypes();
    this.bindEvents();
    this.setDefaultDate();
  },

  setDefaultDate() {
    const dateInput = document.getElementById("pickup-date");
    if (!dateInput) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  },

  renderWasteTypes() {
    const types = [
      { id: "e-waste", icon: "💻", title: "Electronic Waste", subtitle: "Computers, TVs, cellphones, chargers, batteries" },
      { id: "bulk-furniture", icon: "🛋️", title: "Bulky Furniture", subtitle: "Couches, tables, mattresses, wooden scrap" },
      { id: "garden-green", icon: "🌿", title: "Garden & Green Waste", subtitle: "Tree branches, hedge trimmings, leaves" },
      { id: "bulk-recyclables", icon: "📦", title: "Bulk Cardboard / Metal", subtitle: "Relocation cartons, scrap metal, plastic barrels" },
      { id: "debris", icon: "🧱", title: "Renovation Debris", subtitle: "Tile fragments, drywall, plaster scraps" }
    ];

    const container = document.getElementById("pickup-type-grid");
    if (!container) return;

    container.innerHTML = types.map((t, idx) => `
      <label class="cursor-pointer">
        <input type="radio" name="pickupWasteType" value="${t.id}" class="peer sr-only" ${idx === 0 ? 'checked' : ''} onchange="Pickup.onTypeChange('${t.id}')">
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white peer-checked:border-emerald-600 peer-checked:bg-emerald-50/70 peer-checked:ring-2 peer-checked:ring-emerald-500/20 transition-all h-full hover:border-slate-300">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${t.icon}</span>
            <div>
              <div class="font-bold text-sm text-slate-800">${t.title}</div>
              <div class="text-[11px] text-slate-500">${t.subtitle}</div>
            </div>
          </div>
        </div>
      </label>
    `).join("");
  },

  onTypeChange(type) {
    this.selectedType = type;
    const hints = {
      "e-waste": "💡 Tip: E-Waste is safely recycled for valuable minerals and toxic neutralizers.",
      "bulk-furniture": "💡 Tip: Ensure items are disassembled if they cannot fit through doorframes.",
      "garden-green": "💡 Tip: Bundle tree branches with rope or place dry leaves in gunny sacks.",
      "bulk-recyclables": "💡 Tip: Flatten cardboard boxes so they occupy minimal truck space.",
      "debris": "💡 Tip: Max 5 bags per residential pickup slot; hazardous asbestos not accepted."
    };
    const tipEl = document.getElementById("pickup-type-hint");
    if (tipEl) tipEl.innerText = hints[type] || "";
  },

  bindEvents() {
    const form = document.getElementById("pickup-request-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitRequest(new FormData(form));
      });
    }
  },

  submitRequest(formData) {
    const wasteType = formData.get("pickupWasteType") || this.selectedType;
    const rawItems = formData.get("itemsSummary")?.trim();
    const weight = formData.get("estimatedWeight") || "20-50 kg";
    const date = formData.get("pickupDate");
    const slot = formData.get("timeSlot");
    const rawAddress = formData.get("pickupAddress")?.trim();
    const rawNotes = formData.get("specialNotes")?.trim();

    if (!rawItems || !rawAddress || !date) {
      App.showToast("Please provide items description, address, and date", "error");
      return;
    }

    const itemsSummary = SecurityUtils.escapeHTML(rawItems);
    const address = SecurityUtils.escapeHTML(rawAddress);
    const notes = SecurityUtils.escapeHTML(rawNotes || "No specific instructions");

    const typeLabels = {
      "e-waste": "Electronic & Appliance Waste",
      "bulk-furniture": "Bulky Household Furniture",
      "garden-green": "Garden & Green Waste",
      "bulk-recyclables": "Bulk Cardboard & Scrap",
      "debris": "Renovation Debris"
    };

    const user = Auth.getCurrentUser() || INITIAL_DATA.users[0];
    const newId = `PU-2026-${Math.floor(200 + Math.random() * 800)}`;
    const nowIso = new Date().toISOString();

    const newPickup = {
      id: newId,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone
      },
      wasteType,
      wasteTypeLabel: typeLabels[wasteType] || "Special Waste",
      itemsSummary,
      estimatedWeight: weight,
      scheduledDate: SecurityUtils.escapeHTML(date),
      timeSlot: SecurityUtils.escapeHTML(slot),
      pickupAddress: address,
      coordinates: { lat: 12.9716, lng: 77.5946 },
      status: "scheduled",
      assignedDriver: "Allocating closest route vehicle...",
      specialNotes: notes,
      createdAt: nowIso
    };

    const pickups = StorageManager.get("pickups", INITIAL_DATA.pickupRequests);
    pickups.unshift(newPickup);
    StorageManager.set("pickups", pickups);

    Auth.addEcoPoints(30);

    // Reset Form
    document.getElementById("pickup-request-form").reset();
    this.setDefaultDate();

    // Show Confirmation
    this.showConfirmation(newPickup);
  },

  showConfirmation(pickup) {
    const body = document.getElementById("pickup-success-body");
    if (!body) return;

    body.innerHTML = `
      <div class="p-6 text-center">
        <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
          🚚
        </div>
        <h3 class="text-2xl font-bold text-slate-800">Special Pickup Scheduled!</h3>
        <p class="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Our specialized collection vehicle has been scheduled for your doorstep.
        </p>

        <div class="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <span class="text-xs text-slate-500 font-semibold uppercase">Booking Ref</span>
            <span class="font-mono text-base font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              ${pickup.id}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <span class="text-slate-400">Date:</span>
              <p class="font-bold text-slate-700">${pickup.scheduledDate}</p>
            </div>
            <div>
              <span class="text-slate-400">Time Slot:</span>
              <p class="font-bold text-slate-700">${pickup.timeSlot}</p>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400">Items:</span>
              <p class="font-medium text-slate-700">${pickup.itemsSummary}</p>
            </div>
            <div class="col-span-2">
              <span class="text-slate-400">Address:</span>
              <p class="font-medium text-slate-700">${pickup.pickupAddress}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button onclick="Tracking.trackPickup('${pickup.id}'); App.closeModal('pickup-success-modal');" 
                  class="btn btn-primary text-sm py-2.5 px-5">
            📋 View in Tracking Portal
          </button>
          <button onclick="App.closeModal('pickup-success-modal');" class="btn btn-secondary text-sm py-2.5 px-5">
            Done
          </button>
        </div>
      </div>
    `;

    App.openModal("pickup-success-modal");
  }
};
