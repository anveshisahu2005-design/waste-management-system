// Waste Awareness & Segregation Education Module
const Awareness = {
  currentQuizIndex: 0,
  quizScore: 0,
  quizStreak: 0,
  itemSearchQuery: "",

  init() {
    this.renderBinsGuide();
    this.renderQuiz();
    this.setupCalculator();
    this.bindEvents();
  },

  renderBinsGuide() {
    const bins = INITIAL_DATA.binsGuide;
    const container = document.getElementById("bins-guide-grid");
    if (!container) return;

    let filtered = bins;
    if (this.itemSearchQuery.trim()) {
      const q = this.itemSearchQuery.toLowerCase();
      filtered = bins.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.colorName.toLowerCase().includes(q) ||
        b.accepted.some(item => item.toLowerCase().includes(q)) ||
        b.notAccepted.some(item => item.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200">
          <p class="text-sm text-slate-500 font-medium">No waste category found matching "<strong>${this.itemSearchQuery}</strong>". Try searching for "plastic", "batteries", "peels", or "medicine".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(b => `
      <div class="bin-card eco-card p-5 border-t-[6px]" style="border-top-color: ${b.colorCode};">
        <div class="flex items-center justify-between mb-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm" style="background-color: ${b.colorCode};">
            ${b.colorName}
          </span>
          <span class="text-xs font-semibold text-slate-400">Segregation Rule</span>
        </div>

        <h4 class="text-base font-bold text-slate-800">${b.title}</h4>
        <p class="text-xs text-slate-500 mt-1 leading-relaxed">${b.description}</p>

        <div class="mt-4 pt-3 border-t border-slate-100">
          <div class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>✓ What goes in:</span>
          </div>
          <ul class="text-xs text-slate-700 space-y-1 mb-3">
            ${b.accepted.slice(0, 4).map(item => `
              <li class="flex items-start gap-1.5">
                <span class="text-emerald-500 font-bold">•</span>
                <span>${item}</span>
              </li>
            `).join("")}
          </ul>

          <div class="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <span>✗ Do NOT put:</span>
          </div>
          <ul class="text-xs text-slate-500 space-y-1">
            ${b.notAccepted.slice(0, 2).map(item => `
              <li class="flex items-start gap-1.5">
                <span class="text-rose-400 font-bold">×</span>
                <span>${item}</span>
              </li>
            `).join("")}
          </ul>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl">
          <p class="text-[11px] text-slate-600 font-medium">
            <strong class="text-slate-800">Pro Tip:</strong> ${b.disposalTip}
          </p>
        </div>
      </div>
    `).join("");
  },

  renderQuiz() {
    const questions = INITIAL_DATA.quizQuestions;
    const q = questions[this.currentQuizIndex];
    const container = document.getElementById("quiz-card-container");
    if (!container) return;

    if (!q) {
      // Quiz Finished State
      container.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <div class="text-5xl mb-3">🎉</div>
          <h3 class="text-2xl font-bold text-slate-800">Waste Sorting Champion!</h3>
          <p class="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            You scored <strong class="text-emerald-700">${this.quizScore} points</strong> with a max streak of <strong>${this.quizStreak}</strong>!
          </p>
          <div class="my-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl inline-block text-left text-xs">
            <span class="font-bold text-emerald-800 block mb-1">Impact of your knowledge:</span>
            <span>Properly segregated waste eliminates 90% of toxic landfill leachate and protects city sanitation workers.</span>
          </div>
          <div class="flex justify-center gap-3">
            <button onclick="Awareness.resetQuiz()" class="btn btn-primary text-xs py-2 px-4">
              Play Again 🔄
            </button>
            <button onclick="App.switchTab('report-issue')" class="btn btn-secondary text-xs py-2 px-4">
              Report an Issue
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="eco-card p-6 bg-white">
        <div class="flex items-center justify-between pb-3 border-b mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Question ${this.currentQuizIndex + 1} of ${questions.length}
            </span>
            <span class="text-xs font-semibold text-slate-400">Quiz Game</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              🔥 Streak: ${this.quizStreak}
            </span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ⭐ Score: ${this.quizScore}
            </span>
          </div>
        </div>

        <div class="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 mb-5">
          <div class="text-5xl mb-2">${q.itemEmoji}</div>
          <h4 class="text-xl font-bold text-slate-800">${q.item}</h4>
          <p class="text-xs text-slate-500 mt-1">${q.question}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="quiz-options-wrapper">
          ${q.options.map((opt, idx) => `
            <button onclick="Awareness.answerQuiz(${idx})" class="quiz-option-btn" id="quiz-opt-${idx}">
              <span>${opt.label}</span>
              <span class="text-slate-300 text-sm">→</span>
            </button>
          `).join("")}
        </div>

        <div id="quiz-explanation-box" class="hidden mt-4 p-4 rounded-xl text-xs transition-all"></div>
      </div>
    `;
  },

  answerQuiz(idx) {
    const q = INITIAL_DATA.quizQuestions[this.currentQuizIndex];
    if (!q) return;

    const opt = q.options[idx];
    const explanationBox = document.getElementById("quiz-explanation-box");

    // Disable all option buttons
    const btns = document.querySelectorAll(".quiz-option-btn");
    btns.forEach(b => b.disabled = true);

    const chosenBtn = document.getElementById(`quiz-opt-${idx}`);

    if (opt.isCorrect) {
      if (chosenBtn) chosenBtn.classList.add("correct");
      this.quizScore += 10 + (this.quizStreak * 2);
      this.quizStreak++;
      Auth.addEcoPoints(5); // Mini bonus

      explanationBox.className = "mt-4 p-4 rounded-xl text-xs bg-emerald-50 border border-emerald-300 text-emerald-900";
      explanationBox.innerHTML = `
        <div class="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
          <span>✓ Correct!</span>
          <span>(+${10 + (this.quizStreak * 2)} points)</span>
        </div>
        <p>${q.explanation}</p>
        <button onclick="Awareness.nextQuizQuestion()" class="btn btn-primary text-xs py-1.5 px-3 mt-3">
          Next Question →
        </button>
      `;
      explanationBox.classList.remove("hidden");
    } else {
      if (chosenBtn) chosenBtn.classList.add("wrong");
      this.quizStreak = 0;

      // Highlight the correct one
      q.options.forEach((o, i) => {
        if (o.isCorrect) {
          const correctBtn = document.getElementById(`quiz-opt-${i}`);
          if (correctBtn) correctBtn.classList.add("correct");
        }
      });

      explanationBox.className = "mt-4 p-4 rounded-xl text-xs bg-rose-50 border border-rose-300 text-rose-900";
      explanationBox.innerHTML = `
        <div class="font-bold mb-1 text-rose-800">✗ Not quite right!</div>
        <p>${q.explanation}</p>
        <button onclick="Awareness.nextQuizQuestion()" class="btn btn-secondary text-xs py-1.5 px-3 mt-3">
          Continue →
        </button>
      `;
      explanationBox.classList.remove("hidden");
    }
  },

  nextQuizQuestion() {
    this.currentQuizIndex++;
    this.renderQuiz();
  },

  resetQuiz() {
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizStreak = 0;
    this.renderQuiz();
  },

  setupCalculator() {
    const paperSlider = document.getElementById("calc-paper");
    const plasticSlider = document.getElementById("calc-plastic");
    const wetSlider = document.getElementById("calc-wet");

    const updateCalc = () => {
      const paperKg = Number(paperSlider?.value || 10);
      const plasticKg = Number(plasticSlider?.value || 5);
      const wetKg = Number(wetSlider?.value || 15);

      // Display slider values
      const pVal = document.getElementById("calc-paper-val");
      const plVal = document.getElementById("calc-plastic-val");
      const wVal = document.getElementById("calc-wet-val");
      if (pVal) pVal.innerText = `${paperKg} kg/month`;
      if (plVal) plVal.innerText = `${plasticKg} kg/month`;
      if (wVal) wVal.innerText = `${wetKg} kg/month`;

      // Calculations
      // Paper: 26 L water per kg, 0.017 trees per kg, 1.2 kg CO2 per kg
      // Plastic: 1.8 kg CO2 per kg, 5.7 kWh energy
      // Wet: 0.4 kg compost, 0.8 kg Methane CO2e avoided
      const waterSaved = Math.round(paperKg * 26);
      const treesSaved = Number((paperKg * 0.017).toFixed(2));
      const co2Prevented = Math.round((paperKg * 1.2) + (plasticKg * 1.8) + (wetKg * 0.8));
      const compostMade = Number((wetKg * 0.4).toFixed(1));

      const resWater = document.getElementById("calc-res-water");
      const resTrees = document.getElementById("calc-res-trees");
      const resCo2 = document.getElementById("calc-res-co2");
      const resCompost = document.getElementById("calc-res-compost");

      if (resWater) resWater.innerText = `${waterSaved} Liters`;
      if (resTrees) resTrees.innerText = `${treesSaved} Trees`;
      if (resCo2) resCo2.innerText = `${co2Prevented} kg CO₂e`;
      if (resCompost) resCompost.innerText = `${compostMade} kg`;
    };

    [paperSlider, plasticSlider, wetSlider].forEach(slider => {
      if (slider) {
        slider.addEventListener("input", updateCalc);
      }
    });

    // Initial calculation
    updateCalc();
  },

  bindEvents() {
    const searchInput = document.getElementById("awareness-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.itemSearchQuery = e.target.value;
        this.renderBinsGuide();
      });
    }
  }
};
