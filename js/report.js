// Report Waste Issues Module
const Report = {
  currentPhoto: null,
  selectedCoords: { lat: 12.9716, lng: 77.5946 }, // Default city coords

  init() {
    this.bindEvents();
    this.renderCategoryOptions();
    this.renderSamplePhotos();
    this.setupLocationPin();
  },

  renderCategoryOptions() {
    const categories = [
      { id: "overflowing-bin", icon: "🗑️", title: "Overflowing Public Bin", desc: "Bins spilling over onto footpaths and roads" },
      { id: "illegal-dumping", icon: "🏔️", title: "Illegal Dumping / Open Pile", desc: "Unauthorized commercial dumping or debris heaps" },
      { id: "street-litter", icon: "🛣️", title: "Road & Pavement Litter", desc: "Scattered single-use plastics, beverage cups & wrappers" },
      { id: "missed-pickup", icon: "🚚", title: "Missed Scheduled Collection", desc: "Door-to-door sanitation truck did not arrive" },
      { id: "hazardous-waste", icon: "☣️", title: "Hazardous / Chemical Hazard", desc: "Spilled chemicals, broken glass, batteries, dead animals" },
      { id: "clogged-drain", icon: "🌊", title: "Clogged Storm Drain", desc: "Plastics and waste choking roadside rainwater gutters" }
    ];

    const container = document.getElementById("issue-category-grid");
    if (!container) return;

    container.innerHTML = categories.map((cat, idx) => `
      <label class="cursor-pointer">
        <input type="radio" name="category" value="${cat.id}" class="peer sr-only" ${idx === 0 ? 'checked' : ''} required>
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white peer-checked:border-emerald-600 peer-checked:bg-emerald-50/60 peer-checked:ring-2 peer-checked:ring-emerald-500/20 transition-all h-full flex flex-col justify-between hover:border-slate-300">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${cat.icon}</span>
            <div>
              <div class="font-bold text-sm text-slate-800">${cat.title}</div>
              <div class="text-[11px] text-slate-500 leading-tight mt-0.5">${cat.desc}</div>
            </div>
          </div>
        </div>
      </label>
    `).join("");
  },

  renderSamplePhotos() {
    const samples = [
      { key: "overflowing", label: "Overflowing Bin", url: INITIAL_DATA.samplePhotos.overflowing },
      { key: "illegalDump", label: "Illegal Dump Heap", url: INITIAL_DATA.samplePhotos.illegalDump },
      { key: "roadLitter", label: "Roadside Litter", url: INITIAL_DATA.samplePhotos.roadLitter },
      { key: "ewaste", label: "Discarded E-Waste", url: INITIAL_DATA.samplePhotos.ewaste }
    ];

    const container = document.getElementById("sample-photo-picker");
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center gap-2 overflow-x-auto py-1">
        <span class="text-xs font-semibold text-slate-500 whitespace-nowrap">Or pick sample:</span>
        ${samples.map(s => `
          <button type="button" onclick="Report.selectSamplePhoto('${s.url}')" 
                  class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:text-emerald-700 whitespace-nowrap transition">
            <img src="${s.url}" class="w-4 h-4 rounded object-cover">
            <span>${s.label}</span>
          </button>
        `).join("")}
      </div>
    `;
  },

  selectSamplePhoto(url) {
    this.currentPhoto = url;
    this.updatePhotoPreview(url);
    App.showToast("Sample photo selected for demonstration");
  },

  updatePhotoPreview(url) {
    const previewContainer = document.getElementById("photo-preview-wrapper");
    const previewImg = document.getElementById("photo-preview-img");
    const uploadPlaceholder = document.getElementById("photo-upload-placeholder");

    if (url) {
      previewImg.src = url;
      previewContainer.classList.remove("hidden");
      uploadPlaceholder.classList.add("hidden");
    } else {
      previewContainer.classList.add("hidden");
      uploadPlaceholder.classList.remove("hidden");
      this.currentPhoto = null;
    }
  },

  setupLocationPin() {
    const mapBox = document.getElementById("report-pin-map");
    if (!mapBox) return;

    mapBox.addEventListener("click", (e) => {
      const rect = mapBox.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const pin = document.getElementById("report-map-pin");
      if (pin) {
        pin.style.left = `${x}px`;
        pin.style.top = `${y}px`;
        pin.classList.remove("hidden");
      }

      // Calculate approximate coords from click offset
      const latOffset = ((rect.height / 2 - y) / rect.height) * 0.04;
      const lngOffset = ((x - rect.width / 2) / rect.width) * 0.04;
      this.selectedCoords = {
        lat: Number((12.9716 + latOffset).toFixed(4)),
        lng: Number((77.5946 + lngOffset).toFixed(4))
      };

      const coordsDisplay = document.getElementById("report-coords-tag");
      if (coordsDisplay) {
        coordsDisplay.innerText = `Pin: ${this.selectedCoords.lat}° N, ${this.selectedCoords.lng}° E`;
        coordsDisplay.classList.remove("hidden");
      }
    });
  },

  detectGPS() {
    if (!navigator.geolocation) {
      App.showToast("Geolocation is not supported by your browser", "warning");
      return;
    }

    App.showToast("Fetching your GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.selectedCoords = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4))
        };
        const coordsDisplay = document.getElementById("report-coords-tag");
        if (coordsDisplay) {
          coordsDisplay.innerText = `GPS: ${this.selectedCoords.lat}° N, ${this.selectedCoords.lng}° E (Accurate)`;
          coordsDisplay.classList.remove("hidden");
        }
        App.showToast("GPS coordinates locked successfully!");
      },
      (err) => {
        console.warn("GPS error:", err);
        // Fallback simulated GPS
        this.selectedCoords = { lat: 12.9734, lng: 77.5922 };
        const coordsDisplay = document.getElementById("report-coords-tag");
        if (coordsDisplay) {
          coordsDisplay.innerText = `Simulated GPS: 12.9734° N, 77.5922° E`;
          coordsDisplay.classList.remove("hidden");
        }
        App.showToast("Location locked (City Center)");
      },
      { timeout: 8000 }
    );
  },

  bindEvents() {
    // File upload
    const fileInput = document.getElementById("report-photo-input");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const validation = SecurityUtils.validateImageFile(file);
          if (!validation.valid) {
            App.showToast(validation.error, "error");
            fileInput.value = "";
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            this.currentPhoto = SecurityUtils.sanitizeUrl(event.target.result);
            this.updatePhotoPreview(this.currentPhoto);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Clear photo
    const removePhotoBtn = document.getElementById("remove-photo-btn");
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener("click", () => {
        this.updatePhotoPreview(null);
        if (fileInput) fileInput.value = "";
      });
    }

    // GPS button
    const gpsBtn = document.getElementById("detect-gps-btn");
    if (gpsBtn) {
      gpsBtn.addEventListener("click", () => this.detectGPS());
    }

    // Form submit
    const reportForm = document.getElementById("report-issue-form");
    if (reportForm) {
      reportForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitReport(new FormData(reportForm));
      });
    }
  },

  submitReport(formData) {
    const category = formData.get("category");
    const urgency = formData.get("urgency") || "normal";
    const ward = formData.get("ward") || "Ward 4 - Green Valley";
    const rawAddress = formData.get("address")?.trim();
    const rawDescription = formData.get("description")?.trim();
    const volume = formData.get("volume") || "Medium Pile";

    if (!rawAddress || !rawDescription) {
      App.showToast("Please provide the address and description", "error");
      return;
    }

    if (rawAddress.length > 300) {
      App.showToast("Address is too long (max 300 characters)", "warning");
      return;
    }

    if (rawDescription.length > 2000) {
      App.showToast("Description is too long (max 2000 characters)", "warning");
      return;
    }

    const address = SecurityUtils.escapeHTML(rawAddress);
    const description = SecurityUtils.escapeHTML(rawDescription);

    // Category labels lookup
    const catLabels = {
      "overflowing-bin": "Overflowing Public Bin",
      "illegal-dumping": "Illegal Dumping / Debris",
      "street-litter": "Road & Pavement Litter",
      "missed-pickup": "Missed Scheduled Collection",
      "hazardous-waste": "Hazardous & Chemical Waste",
      "clogged-drain": "Clogged Storm Drain"
    };

    const user = Auth.getCurrentUser() || INITIAL_DATA.users[0];
    const newId = `WM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const nowFormatted = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    // Use selected photo or fallback to category sample
    const finalPhoto = SecurityUtils.sanitizeUrl(this.currentPhoto || INITIAL_DATA.samplePhotos.overflowing);

    const newComplaint = {
      id: newId,
      title: `${catLabels[category] || 'Waste Issue'} at ${address.split(',')[0]}`,
      category,
      categoryLabel: catLabels[category] || "General Waste Issue",
      urgency,
      status: "submitted",
      description,
      reportedBy: {
        id: user.id,
        name: user.name,
        phone: user.phone
      },
      ward,
      address,
      coordinates: this.selectedCoords,
      estimatedVolume: volume,
      photoUrl: finalPhoto,
      createdAt: nowIso,
      timeline: [
        {
          status: "submitted",
          title: "Complaint Logged",
          timestamp: nowFormatted,
          detail: `Logged by ${user.name}. Automated notification sent to ${ward} sanitation cell.`
        }
      ]
    };

    const complaints = StorageManager.get("complaints", INITIAL_DATA.complaints);
    complaints.unshift(newComplaint);
    StorageManager.set("complaints", complaints);

    // Reward citizen with Eco-Points
    Auth.addEcoPoints(50);

    // Reset form
    document.getElementById("report-issue-form").reset();
    this.updatePhotoPreview(null);

    // Show celebratory confirmation modal
    this.showConfirmationModal(newComplaint);
  },

  showConfirmationModal(complaint) {
    const modalBody = document.getElementById("report-success-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6 text-center">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
          ✓
        </div>
        <h3 class="text-2xl font-bold text-slate-800">Issue Reported Successfully!</h3>
        <p class="text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
          Thank you for keeping our city clean. Your report has been dispatched to the municipal sanitation team.
        </p>

        <div class="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <span class="text-xs text-slate-500 font-semibold uppercase">Tracking ID</span>
            <span class="font-mono text-base font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ${complaint.id}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <span class="text-slate-400">Category:</span>
              <p class="font-bold text-slate-700">${complaint.categoryLabel}</p>
            </div>
            <div>
              <span class="text-slate-400">Urgency:</span>
              <p class="font-bold uppercase text-amber-600">${complaint.urgency}</p>
            </div>
            <div class="col-span-2 mt-1">
              <span class="text-slate-400">Location:</span>
              <p class="font-semibold text-slate-700">${complaint.address}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button onclick="Tracking.trackSpecific('${complaint.id}'); App.closeModal('report-success-modal');" 
                  class="btn btn-primary text-sm py-2.5 px-5">
            🔍 Track Status Now
          </button>
          <button onclick="App.closeModal('report-success-modal');" class="btn btn-secondary text-sm py-2.5 px-5">
            Submit Another Report
          </button>
        </div>
      </div>
    `;

    App.openModal("report-success-modal");
  }
};
