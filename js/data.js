// Initial Seed Data and Mock Database Store for Waste Management System

const INITIAL_DATA = {
  users: [
    {
      id: "usr_citizen_1",
      name: "Anveshi Sahu",
      username: "anveshi",
      email: "anveshi@citizen.org",
      // Demo password: Citizen@2026 (stored hashed)
      passwordHash: "a6eb804daa611",
      phone: "+91 98765 43210",
      role: "citizen",
      ward: "Ward 4 - Green Valley",
      address: "Flat 402, Palm Heights, Green Valley Rd",
      ecoPoints: 240,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr_admin_1",
      name: "Officer Rajesh Verma",
      username: "admin",
      email: "admin@citycorp.gov.in",
      // Provisioned municipal credential — password: Admin@2026 (stored hashed, never self-registerable)
      passwordHash: "bee0b8af028ca",
      phone: "+91 94480 11223",
      role: "admin",
      ward: "Central Municipal Zone",
      department: "Solid Waste & Sanitation Directorate",
      designation: "Chief Sanitary Inspector",
      ecoPoints: 500,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr_driver_1",
      name: "Ramesh Kumar",
      username: "driver",
      email: "driver@cleanfleet.org",
      // Provisioned fleet credential — password: Driver@2026 (stored hashed)
      passwordHash: "1fa8e27cbd6ca1",
      phone: "+91 97722 33445",
      role: "driver",
      ward: "Ward 4 & Ward 5 Hub",
      vehicle: "Hydraulic Compactor Truck #KA-05-GT-4821",
      ecoPoints: 310,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    }
  ],

  sanitationTeams: [
    { id: "team_1", name: "Green Fleet Unit 04", lead: "Ramesh Kumar", vehicle: "Hydraulic Tipper #KA-05-GT-4821", phone: "+91 97722 33445", ward: "Ward 4 - Green Valley", activeJobs: 1 },
    { id: "team_2", name: "Central Rapid Response Crew", lead: "Sunil Shinde", vehicle: "Mini Compactor #KA-03-EM-9921", phone: "+91 98451 22344", ward: "Ward 2 - East Market", activeJobs: 2 },
    { id: "team_3", name: "Hazmat & Special Waste Team", lead: "Dr. Arvind Rao", vehicle: "Bio-Safety Van #KA-01-HZ-1008", phone: "+91 96320 88990", ward: "All Wards (Special)", activeJobs: 1 },
    { id: "team_4", name: "Metro Hub Sweep & Wash Unit", lead: "Mohan Lal", vehicle: "Street Sweeper Truck #KA-02-SW-3320", phone: "+91 91234 56780", ward: "Ward 5 - Metro Hub", activeJobs: 0 }
  ],

  samplePhotos: {
    overflowing: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    illegalDump: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    roadLitter: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80",
    ewaste: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80",
    resolvedClean: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80"
  },

  complaints: [
    {
      id: "WM-2026-1042",
      title: "Severely Overflowing Public Bin near Central Market",
      category: "overflowing-bin",
      categoryLabel: "Overflowing Public Bin",
      urgency: "critical",
      status: "resolved",
      description: "Community 500L bin has been overflowing for 3 days. Stray dogs and rodents spreading waste across the road, causing unbearable stench.",
      reportedBy: {
        id: "usr_citizen_1",
        name: "Anveshi Sharma",
        phone: "+91 98765 43210"
      },
      ward: "Ward 4 - Green Valley",
      address: "Opposite Fresh Veggies Gate 3, 14th Main Rd, Green Valley",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      estimatedVolume: "Large Dump (500L+)",
      photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
      resolutionPhotoUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80",
      resolutionNotes: "Dispatched compactor truck #KA-05-GT-4821. 820 kg of mixed garbage cleared, bin sanitized with lime powder and disinfectant spray.",
      assignedTeam: "Green Fleet Unit 04 (Lead: Ramesh Kumar)",
      createdAt: "2026-09-28T08:15:00Z",
      resolvedAt: "2026-09-28T14:30:00Z",
      rating: 5,
      citizenFeedback: "Prompt response! Within 6 hours the spot was completely cleared and disinfected. Excellent job by driver Ramesh!",
      timeline: [
        { status: "submitted", title: "Complaint Logged", timestamp: "2026-09-28 08:15 AM", detail: "Report registered by Citizen via Web Portal with photo proof." },
        { status: "under_review", title: "Inspected by Ward Officer", timestamp: "2026-09-28 09:20 AM", detail: "Officer Rajesh Verma validated urgency level as Critical." },
        { status: "assigned", title: "Crew Assigned", timestamp: "2026-09-28 10:00 AM", detail: "Assigned to Green Fleet Unit 04 with Tipper #KA-05-GT-4821." },
        { status: "in_progress", title: "Cleanup in Action", timestamp: "2026-09-28 12:45 PM", detail: "Crew arrived on-site, cleared 820kg waste." },
        { status: "resolved", title: "Resolved & Disinfected", timestamp: "2026-09-28 02:30 PM", detail: "Area sanitized. Before & After verification photos uploaded." }
      ]
    },
    {
      id: "WM-2026-1088",
      title: "Illegal Construction Debris & Plastic Dumping on Vacant Plot",
      category: "illegal-dumping",
      categoryLabel: "Illegal Dumping / Debris",
      urgency: "urgent",
      status: "in_progress",
      description: "Commercial mini-truck dumped concrete bags, plastic packaging, and discarded gypsum boards at night in the empty corner plot.",
      reportedBy: {
        id: "usr_citizen_2",
        name: "Pooja Hegde",
        phone: "+91 91234 56789"
      },
      ward: "Ward 2 - East Market",
      address: "Plot #48, 8th Cross, Behind Sub-Registrar Office, East Market",
      coordinates: { lat: 12.9780, lng: 77.6010 },
      estimatedVolume: "Commercial Heap (~2 Tons)",
      photoUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
      assignedTeam: "Central Rapid Response Crew (Lead: Sunil Shinde)",
      createdAt: "2026-09-29T19:40:00Z",
      timeline: [
        { status: "submitted", title: "Complaint Logged", timestamp: "2026-09-29 07:40 PM", detail: "Night report submitted with GPS location." },
        { status: "under_review", title: "Verified by Sanitation Cell", timestamp: "2026-09-30 07:15 AM", detail: "Notice issued to plot owner. Debris removal authorized." },
        { status: "assigned", title: "Assigned to JCB & Loader Crew", timestamp: "2026-09-30 08:30 AM", detail: "Sunil Shinde dispatched with mini-excavator." },
        { status: "in_progress", title: "Excavator on Site", timestamp: "2026-09-30 09:10 AM", detail: "Loader loading debris onto 10-wheel truck." }
      ]
    },
    {
      id: "WM-2026-1104",
      title: "Road Litter & Scattered Food Wrappers near Metro Station",
      category: "street-litter",
      categoryLabel: "Road & Pavement Litter",
      urgency: "urgent",
      status: "under_review",
      description: "Street food vendors and commuters have left beverage cups, polythene bags, and leftover food scattered across the footpath.",
      reportedBy: {
        id: "usr_citizen_3",
        name: "Karan Patel",
        phone: "+91 97654 32190"
      },
      ward: "Ward 5 - Metro Hub",
      address: "Footpath alongside Metro Gate 2, Ring Rd Junction",
      coordinates: { lat: 12.9650, lng: 77.5850 },
      estimatedVolume: "Medium Scattered (~50kg)",
      photoUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80",
      createdAt: "2026-09-30T06:50:00Z",
      timeline: [
        { status: "submitted", title: "Complaint Logged", timestamp: "2026-09-30 06:50 AM", detail: "Commuter flagged heavy footpath garbage." },
        { status: "under_review", title: "Under Ward Officer Review", timestamp: "2026-09-30 07:30 AM", detail: "Route inspector verifying street sweeper schedule." }
      ]
    },
    {
      id: "WM-2026-1115",
      title: "Missed Door-to-Door Morning Garbage Collection",
      category: "missed-pickup",
      categoryLabel: "Missed Scheduled Collection",
      urgency: "normal",
      status: "submitted",
      description: "The municipal auto-tipper did not arrive today on 3rd Cross. Over 30 residential houses have segregated wet & dry bins waiting outside.",
      reportedBy: {
        id: "usr_citizen_1",
        name: "Anveshi Sharma",
        phone: "+91 98765 43210"
      },
      ward: "Ward 4 - Green Valley",
      address: "3rd Cross, Block B, Green Valley Township",
      coordinates: { lat: 12.9730, lng: 77.5910 },
      estimatedVolume: "30 Households",
      photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
      createdAt: "2026-09-30T08:30:00Z",
      timeline: [
        { status: "submitted", title: "Complaint Logged", timestamp: "2026-09-30 08:30 AM", detail: "Residential society report logged." }
      ]
    },
    {
      id: "WM-2026-1120",
      title: "Hazardous Chemical Containers & Broken Glass on Pedestrian Walk",
      category: "hazardous-waste",
      categoryLabel: "Hazardous & Chemical Waste",
      urgency: "critical",
      status: "in_progress",
      description: "Leaking solvent drum and broken laboratory glass dumped near public park entrance. Pungent chemical odor; pedestrians at risk of injury.",
      reportedBy: {
        id: "usr_citizen_4",
        name: "Sneha Nair",
        phone: "+91 99887 76655"
      },
      ward: "Ward 3 - Science City",
      address: "Opp. Rose Garden Entrance, 2nd Avenue, Science City",
      coordinates: { lat: 12.9690, lng: 77.6050 },
      estimatedVolume: "Hazardous Drums (~100L)",
      photoUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80",
      assignedTeam: "Hazmat & Special Waste Team (Lead: Dr. Arvind Rao)",
      createdAt: "2026-09-30T07:10:00Z",
      timeline: [
        { status: "submitted", title: "Critical Hazard Reported", timestamp: "2026-09-30 07:10 AM", detail: "Emergency alert triggered for chemical waste." },
        { status: "under_review", title: "Priority Escaped by Control Room", timestamp: "2026-09-30 07:22 AM", detail: "Dispatched specialized Hazmat unit." },
        { status: "assigned", title: "Hazmat Team En Route", timestamp: "2026-09-30 07:35 AM", detail: "Vehicle #KA-01-HZ-1008 carrying neutralizer and protective gear." },
        { status: "in_progress", title: "Cordoned & Neutralizing", timestamp: "2026-09-30 08:15 AM", detail: "Chemical spill absorbent applied; glass collected in bio-hazard containers." }
      ]
    }
  ],

  pickupRequests: [
    {
      id: "PU-2026-301",
      user: { id: "usr_citizen_1", name: "Anveshi Sharma", phone: "+91 98765 43210" },
      wasteType: "e-waste",
      wasteTypeLabel: "Electronic & Appliance Waste",
      itemsSummary: "1 Old 32\" CRT TV, 1 Microwave Oven, 3 Desktop CPU towers, 12 Rechargeable batteries",
      estimatedWeight: "45 kg",
      scheduledDate: "2026-10-02",
      timeSlot: "10:00 AM - 01:00 PM",
      pickupAddress: "Flat 402, Palm Heights, Green Valley Rd, Ward 4",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      status: "scheduled",
      assignedDriver: "Ramesh Kumar (Tipper #KA-05-GT-4821)",
      specialNotes: "Lift is working. Security guard will guide to flat 402.",
      createdAt: "2026-09-29T14:00:00Z"
    },
    {
      id: "PU-2026-302",
      user: { id: "usr_citizen_2", name: "Pooja Hegde", phone: "+91 91234 56789" },
      wasteType: "bulk-furniture",
      wasteTypeLabel: "Bulky Household Furniture",
      itemsSummary: "Broken wooden dining table (6-seater), 1 worn spring mattress, 2 plastic chairs",
      estimatedWeight: "80 kg",
      scheduledDate: "2026-10-01",
      timeSlot: "02:00 PM - 05:00 PM",
      pickupAddress: "Bungalow #19, 4th Main, East Market, Ward 2",
      coordinates: { lat: 12.9780, lng: 77.6010 },
      status: "driver_assigned",
      assignedDriver: "Sunil Shinde (Tipper #KA-03-EM-9921)",
      specialNotes: "Items kept outside driveway for easy truck loading.",
      createdAt: "2026-09-29T16:30:00Z"
    },
    {
      id: "PU-2026-303",
      user: { id: "usr_citizen_5", name: "Vikram Sengupta", phone: "+91 98111 22334" },
      wasteType: "garden-green",
      wasteTypeLabel: "Garden & Green Waste",
      itemsSummary: "Tree branch prunings, dry leaves, and grass clippings in 8 gunny bags",
      estimatedWeight: "65 kg",
      scheduledDate: "2026-09-30",
      timeSlot: "08:00 AM - 11:00 AM",
      pickupAddress: "House 55, Lake View Enclave, Ward 4",
      coordinates: { lat: 12.9695, lng: 77.5930 },
      status: "collected",
      assignedDriver: "Ramesh Kumar",
      specialNotes: "Direct garden gate access.",
      createdAt: "2026-09-28T11:00:00Z",
      collectedAt: "2026-09-30T09:45:00Z"
    }
  ],

  hotspots: [
    {
      id: "hs_1",
      name: "Central Vegetable Market Junction",
      ward: "Ward 4 - Green Valley",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      severity: "high",
      complaintCount: 14,
      avgResolutionTime: "3.5 hrs",
      primaryType: "Overflowing Organic & Plastic Waste",
      riskNote: "High pedestrian footfall; commercial fruit and vegetable vendors dumping daily.",
      status: "Active Monitoring"
    },
    {
      id: "hs_2",
      name: "East Industrial Ring Corner",
      ward: "Ward 2 - East Market",
      coordinates: { lat: 12.9780, lng: 77.6010 },
      severity: "high",
      complaintCount: 11,
      avgResolutionTime: "5.2 hrs",
      primaryType: "Construction Debris & Chemical Slag",
      riskNote: "Night dumping hotspot by unregistered commercial transporters.",
      status: "CCTV Installation Planned"
    },
    {
      id: "hs_3",
      name: "Metro Gate 2 Interchange",
      ward: "Ward 5 - Metro Hub",
      coordinates: { lat: 12.9650, lng: 77.5850 },
      severity: "medium",
      complaintCount: 8,
      avgResolutionTime: "2.1 hrs",
      primaryType: "Single-Use Plastics & Food Wrappers",
      riskNote: "Transit crowd peak hours; needs twin 240L segregated bins.",
      status: "Extra Bins Deployed"
    },
    {
      id: "hs_4",
      name: "Science City canal underpass",
      ward: "Ward 3 - Science City",
      coordinates: { lat: 12.9690, lng: 77.6050 },
      severity: "high",
      complaintCount: 9,
      avgResolutionTime: "6.0 hrs",
      primaryType: "Clogged Storm Drains & Packaging Waste",
      riskNote: "Prone to water-logging during monsoon due to bottle dams.",
      status: "Weekly Desilting Scheduled"
    },
    {
      id: "hs_5",
      name: "Green Valley 7th Cross Park",
      ward: "Ward 4 - Green Valley",
      coordinates: { lat: 12.9750, lng: 77.5920 },
      severity: "low",
      complaintCount: 3,
      avgResolutionTime: "1.8 hrs",
      primaryType: "Fallen Leaves & Dog Waste",
      riskNote: "Residential park with proactive resident committee.",
      status: "Under Control"
    }
  ],

  binsGuide: [
    {
      id: "bin-green",
      title: "Wet / Biodegradable Waste",
      colorName: "Green Bin",
      colorCode: "#16a34a",
      bgClass: "bg-emerald-50 border-emerald-500 text-emerald-800",
      badgeClass: "bg-emerald-600 text-white",
      description: "Organic kitchen and food waste that decomposes naturally into organic compost.",
      accepted: [
        "Vegetable & fruit peels",
        "Leftover cooked meals & stale bread",
        "Tea bags & coffee grounds",
        "Eggshells & meat bones",
        "Wilted flowers & garden grass",
        "Soiled food paper napkins"
      ],
      notAccepted: [
        "Plastic wrappers or cling film",
        "Glass bottles",
        "Chemical cleaners",
        "Sanitary pads or diapers"
      ],
      disposalTip: "Collect without plastic liner or use certified 100% compostable corn-starch bags."
    },
    {
      id: "bin-blue",
      title: "Dry / Recyclables",
      colorName: "Blue Bin",
      colorCode: "#2563eb",
      bgClass: "bg-blue-50 border-blue-500 text-blue-800",
      badgeClass: "bg-blue-600 text-white",
      description: "Non-biodegradable, clean and dry materials that can be remanufactured into new products.",
      accepted: [
        "Newspapers, magazines & books",
        "Cardboard & carton shipping boxes",
        "Rinsed plastic bottles (PET) & containers",
        "Aluminium soda cans & tin food cans",
        "Clean glass bottles and jars",
        "Milk and juice tetra paks (rinsed)"
      ],
      notAccepted: [
        "Oil-soaked pizza boxes",
        "Broken window mirrors",
        "Medical needles or syringes",
        "Wet organic kitchen waste"
      ],
      disposalTip: "Always rinse milk pouches and cans so they are free of food residue before tossing into blue bin."
    },
    {
      id: "bin-red",
      title: "Domestic Hazardous Waste",
      colorName: "Red Bin",
      colorCode: "#dc2626",
      bgClass: "bg-rose-50 border-rose-500 text-rose-800",
      badgeClass: "bg-rose-600 text-white",
      description: "Toxic, flammable, corrosive, or dangerous household substances requiring special treatment.",
      accepted: [
        "Lead-acid and rechargeable batteries",
        "CFL bulbs & fluorescent tube-lights",
        "Pesticides, rodent poison & insecticides",
        "Expired prescription medicines & ointments",
        "Synthetic paints, thinners & solvents",
        "Used engine oil containers"
      ],
      notAccepted: [
        "General kitchen waste",
        "Ordinary office paper",
        "Uncontaminated plastic bags"
      ],
      disposalTip: "Wrap in a red bag or keep in marked original container. Never dump into open gutters or regular garbage."
    },
    {
      id: "bin-yellow",
      title: "Sanitary & Bio-Medical",
      colorName: "Yellow Bin",
      colorCode: "#d97706",
      bgClass: "bg-amber-50 border-amber-500 text-amber-800",
      badgeClass: "bg-amber-600 text-white",
      description: "Personal hygiene items and dressings that pose infection risks to sanitation workers.",
      accepted: [
        "Sanitary napkins & tampons",
        "Baby and adult diapers",
        "Used surgical & cloth masks",
        "Gauze, bandages & cotton swabs",
        "Disposable razors and hair trimmings",
        "Medical gloves"
      ],
      notAccepted: [
        "Sharps without puncture-proof container",
        "Household dry recyclables",
        "Kitchen vegetable peels"
      ],
      disposalTip: "Always wrap securely in old newspaper and mark with a red 'X' or cross symbol to alert the collector."
    },
    {
      id: "bin-purple",
      title: "E-Waste / Electronics",
      colorName: "Purple Bin",
      colorCode: "#7c3aed",
      bgClass: "bg-purple-50 border-purple-500 text-purple-800",
      badgeClass: "bg-purple-600 text-white",
      description: "Discarded electrical and electronic equipment containing precious metals and toxic heavy elements.",
      accepted: [
        "Dead smartphones, chargers & cables",
        "Computer keyboards, mice & hard drives",
        "Lithium-ion power banks & earphones",
        "Printed circuit boards (PCBs)",
        "Electric kettles, irons & toasters",
        "Calculators & remote controls"
      ],
      notAccepted: [
        "Standard alkaline AA/AAA batteries (put in Red)",
        "Fluorescent tubes (put in Red)"
      ],
      disposalTip: "Book an on-demand municipal E-Waste pickup or drop at authorized E-Waste recycling collection centers."
    },
    {
      id: "bin-black",
      title: "Inert & Non-Recyclable",
      colorName: "Black Bin",
      colorCode: "#374151",
      bgClass: "bg-slate-50 border-slate-600 text-slate-800",
      badgeClass: "bg-slate-700 text-white",
      description: "Non-hazardous, non-recyclable, and non-biodegradable debris destined for scientific landfill or energy recovery.",
      accepted: [
        "Floor dust & vacuum cleaner sweepings",
        "Cigarette butts & matchsticks",
        "Broken ceramic plates & tea mugs",
        "Cat litter & bird cage droppings",
        "Multi-layer soiled foil packets"
      ],
      notAccepted: [
        "Clean cardboard and paper",
        "Compostable food leftovers",
        "Intact electronics"
      ],
      disposalTip: "Minimize inert waste by choosing unpackaged groceries and repairable household utensils."
    }
  ],

  quizQuestions: [
    {
      id: "q1",
      item: "Banana Peels and Leftover Rice",
      itemEmoji: "🍌",
      question: "Which bin should you throw food leftovers and fruit peels into?",
      options: [
        { label: "Green Bin (Wet / Biodegradable)", binId: "bin-green", isCorrect: true },
        { label: "Blue Bin (Dry Recyclables)", binId: "bin-blue", isCorrect: false },
        { label: "Black Bin (Inert Waste)", binId: "bin-black", isCorrect: false },
        { label: "Red Bin (Hazardous Waste)", binId: "bin-red", isCorrect: false }
      ],
      explanation: "Food waste is 100% biodegradable and converts into rich organic fertilizer through aerobic composting!"
    },
    {
      id: "q2",
      item: "Rinsed Plastic Milk Pouch & Soda Cans",
      itemEmoji: "🥤",
      question: "Where should clean plastic pouches and aluminium cans go?",
      options: [
        { label: "Green Bin (Wet Waste)", binId: "bin-green", isCorrect: false },
        { label: "Blue Bin (Dry / Recyclables)", binId: "bin-blue", isCorrect: true },
        { label: "Yellow Bin (Sanitary Waste)", binId: "bin-yellow", isCorrect: false },
        { label: "Black Bin (Inert Waste)", binId: "bin-black", isCorrect: false }
      ],
      explanation: "Dry plastics and metals can be melted down and re-engineered into new goods over 10+ times, reducing virgin petroleum usage."
    },
    {
      id: "q3",
      item: "Expired Paracetamol Tablets & Cough Syrup",
      itemEmoji: "💊",
      question: "Expired medicines can poison ground water. Which bin is correct?",
      options: [
        { label: "Blue Bin (Dry Recyclables)", binId: "bin-blue", isCorrect: false },
        { label: "Green Bin (Wet Waste)", binId: "bin-green", isCorrect: false },
        { label: "Red Bin (Domestic Hazardous)", binId: "bin-red", isCorrect: true },
        { label: "Yellow Bin (Sanitary)", binId: "bin-yellow", isCorrect: false }
      ],
      explanation: "Pharmaceuticals are toxic to aquatic ecosystems and bacteria; they require high-temperature incineration by authorized hazardous waste facilities."
    },
    {
      id: "q4",
      item: "Used Smartphone & Tangled USB Charger",
      itemEmoji: "📱",
      question: "How should discarded digital gadgets and chargers be classified?",
      options: [
        { label: "Purple Bin (E-Waste Hub)", binId: "bin-purple", isCorrect: true },
        { label: "Green Bin (Wet Waste)", binId: "bin-green", isCorrect: false },
        { label: "Black Bin (Inert Waste)", binId: "bin-black", isCorrect: false },
        { label: "Blue Bin (General Recyclables)", binId: "bin-blue", isCorrect: false }
      ],
      explanation: "E-waste contains precious elements like gold, copper, and palladium, alongside toxic lead and cadmium that require specialized dismantling."
    },
    {
      id: "q5",
      item: "Used Sanitary Pads & Baby Diapers",
      itemEmoji: "🩹",
      question: "What is the responsible way to dispose of sanitary waste?",
      options: [
        { label: "Wrap in newspaper and put in Yellow Bin", binId: "bin-yellow", isCorrect: true },
        { label: "Throw loosely into Blue Bin", binId: "bin-blue", isCorrect: false },
        { label: "Flush down the toilet", binId: "flush", isCorrect: false },
        { label: "Mix with Green vegetable compost", binId: "bin-green", isCorrect: false }
      ],
      explanation: "Wrapping in newspaper marked with a red cross protects sanitation workers from bio-hazard pathogens and prevents septic drain blockages."
    },
    {
      id: "q6",
      item: "Greasy Oil-Soaked Pizza Box",
      itemEmoji: "🍕",
      question: "Can an oily cheese-stained cardboard pizza box be recycled in the Blue Bin?",
      options: [
        { label: "No! Oil ruins paper recycling fibers. Tear oily part for Composting/Inert", binId: "special", isCorrect: true },
        { label: "Yes, all cardboard always goes into Blue Bin", binId: "bin-blue", isCorrect: false },
        { label: "Put in Purple E-Waste", binId: "bin-purple", isCorrect: false },
        { label: "Burn it in the backyard", binId: "burn", isCorrect: false }
      ],
      explanation: "Food grease cannot be separated from paper pulp fibers during water-slurry recycling. Compost clean cardboard, discard greasy parts with wet/inert waste."
    }
  ]
};

// LocalStorage Helper with Fallback
class StorageManager {
  static get(key, defaultVal) {
    try {
      const data = localStorage.getItem(`eco_waste_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.warn("Storage read error:", e);
      return defaultVal;
    }
  }

  static set(key, val) {
    try {
      localStorage.setItem(`eco_waste_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  }

 static initData() {
    if (!localStorage.getItem("eco_waste_complaints")) {
      this.set("complaints", INITIAL_DATA.complaints);
    }

    if (!localStorage.getItem("eco_waste_pickups")) {
      this.set("pickups", INITIAL_DATA.pickupRequests);
    }

    /*
     * Keep all official seed accounts and preserve locally-created
     * accounts that use the hashed-password authentication system.
     *
     * This is important for municipality officers:
     * previously only citizen accounts were preserved, so a newly
     * registered officer disappeared after a page refresh.
     */
    const existingUsers = this.get("users", []);
    const updatedUsers = [...INITIAL_DATA.users];

    for (const u of existingUsers) {
      /*
       * Official seed accounts always use the trusted seed version.
       * This prevents duplicate admin/driver/citizen seed accounts.
       */
      if (
        updatedUsers.some(
          seed =>
            seed.id === u.id ||
            seed.email === u.email ||
            (u.username && seed.username === u.username)
        )
      ) {
        continue;
      }

      /*
       * Preserve locally-created accounts.
       *
       * Citizens, municipality officers/admins and drivers are all
       * allowed to persist as long as they use passwordHash.
       */
      if ( u.passwordHash &&
  (
    u.role === "citizen" ||
    u.role === "admin" ||
    u.role === "driver" ||
    u.role === "municipality_officer"
  )
) {
  updatedUsers.push(u);
}

      /*
       * Never preserve legacy plaintext passwords.
       */
    }

    this.set("users", updatedUsers);

    if (!localStorage.getItem("eco_waste_hotspots")) {
      this.set("hotspots", INITIAL_DATA.hotspots);
    }

    /*
     * Restore the current logged-in user only if that account still
     * exists. Otherwise fall back to the default citizen account.
     */
    const current = this.get("current_user", null);

    if (
      !current ||
      !updatedUsers.some(u => u.id === current.id)
    ) {
      this.set("current_user", INITIAL_DATA.users[0]);
    }
  }
}

// Initialize on script load
StorageManager.initData();
