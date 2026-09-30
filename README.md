# 🌱 EcoClean - Municipal Smart Waste Management System

A modern, responsive, centralized web application engineered to solve urban waste management bottlenecks: overflowing community bins, delayed door-to-door collections, improper source segregation, and the absence of centralized municipal hotspot telemetry.

---

## 🚀 Quick Start Instructions

You can run and explore the application immediately using either method:

### Method 1: Instant Launch (Double-click)
Double-click `start-website.bat` in the project directory, or double-click `index.html` to open it in Chrome, Edge, or Firefox.

### Method 2: Local HTTP Server (Python)
Open PowerShell in this directory and run:
```powershell
python server.py
```
This automatically starts the server and opens `http://localhost:3000/index.html` in your browser.

---

## 🌟 Core Specifications & Implemented Features

### 1. 👤 User Registration and Login
- **Multi-Role Authentication**: Seamless support for **Citizens**, **Municipal Officers / Admins**, and **Sanitation Fleet Drivers**.
- **Interactive Quick-Role Switcher**: Switch between demo accounts with 1 click:
  - 👤 **Citizen Account**: `anveshi@citizen.org` (Anveshi Sharma, Ward 4)
  - 🛡️ **Municipal Admin**: `officer.verma@citycorp.gov.in` (Officer Rajesh Verma, Chief Sanitary Inspector)
  - 🚚 **Field Driver**: `driver.ramesh@cleanfleet.org` (Ramesh Kumar, Compactor Truck #KA-05-GT-4821)
- **Eco-Points & Civic Tier System**: Citizens earn points (+50 for reporting, +30 for special pickups, +5 for quiz answers) tracking their contribution to city cleanliness.
- **Persistent State**: Full `localStorage` persistence preserves user registrations, sessions, complaints, and changes across page reloads.

### 2. 🚨 Report Waste Issues
- **Comprehensive Issue Categories**:
  - 🗑️ Overflowing Public Bin
  - 🏔️ Illegal Dumping / Construction Debris Heaps
  - 🛣️ Road & Pavement Littering
  - 🚚 Missed Scheduled Collection
  - ☣️ Hazardous / Chemical / Medical Waste
  - 🌊 Clogged Storm Drains / Gutters
- **Photo Upload & Instant Sample Picker**:
  - Upload photos from phone/computer or snap camera proof.
  - One-click sample photo selector for rapid demo testing.
- **Location Selector & Interactive Map**:
  - Auto-Detect GPS coordinates via HTML5 Geolocation.
  - Interactive click-to-pin map for accurate latitude/longitude coordinates.
  - Ward dropdown and street landmark input.
- **Urgency Levels**: Normal (48 hrs), Urgent (24 hrs), Critical (4-6 hrs emergency response).
- **Automated Ticket Generation**: Generates official municipal tracking IDs (e.g., `WM-2026-1042`).

### 3. 🚚 Waste Pickup Request
- **Special & On-Demand Doorstep Collection**:
  - 💻 Electronic Waste (E-Waste: PCs, TVs, batteries, cables)
  - 🛋️ Bulky Household Furniture (mattresses, tables, wood)
  - 🌿 Garden & Green Waste (tree branches, lawn clippings)
  - 📦 Bulk Recyclables (relocation cardboard, scrap metal)
  - 🧱 Renovation & Minor Debris
- **Scheduling**: Choose preferred date and time slots (Morning, Afternoon, Evening).
- **Free Municipal Quota**: Displays household annual quota tracking.
- **Confirmation**: Produces booking reference codes (e.g., `PU-2026-301`).

### 4. 🔍 Complaint Tracking & Transparency
- **Real-Time Search & Status Filtering**: Filter complaints and doorstep pickup requests by ID, Ward, Category, or Status (`Logged`, `Under Review`, `In Progress`, `Resolved`).
- **Visual 5-Step Journey Timeline**:
  1. *Complaint Logged* (Citizen submission timestamp and photo)
  2. *Officer Inspection* (Urgency validation by Ward Officer)
  3. *Crew & Truck Dispatched* (Driver and vehicle assignment details)
  4. *Cleanup in Action* (Active progress on site)
  5. *Resolved & Disinfected* (Resolution notes and completion timestamp)
- **Before & After Photo Comparison**: Side-by-side verification dialog showing the initial report photo vs. the sanitized cleanup photo.
- **Citizen Feedback & Star Rating**: Citizens can rate resolution quality (1 to 5 stars) and submit reviews.
- **Emergency Escalation**: One-click escalation to Ward Sanitation Officer.

### 5. 🛡️ Admin & Hotspots Dashboard
- **Executive KPIs**: Real-time counters for Total Reports, Resolved Today (%), Active Operations, and Identified Waste Hotspots.
- **Waste Hotspot Heatmap & Radar**:
  - Visualized interactive map of city wards.
  - Pulsating radar markers color-coded by severity (High Risk, Moderate, Low).
  - Clicking any hotspot displays chronic dumping history, predominant waste stream, and 1-click **Instant Rapid Crew Dispatch**.
- **Sanitation Fleet Dispatcher Table**:
  - Assign complaints to available sanitation teams (`Green Fleet Unit 04`, `Rapid Response Crew`, `Hazmat Team`, `Metro Sweeper`).
  - Update complaint phase and add official field notes.
  - Attach verified "After Cleanup" proof photos.
- **Doorstep Pickup Manifest**: Dispatch drivers and mark pickups as Collected.
- **CSV Data Export**: One-click download of the complete municipal records as a `.csv` spreadsheet.

### 6. 📚 Waste Awareness & Segregation Section
- **6-Bin Color-Coded Segregation Guide**:
  - 🟢 **Green Bin**: Wet / Biodegradable Waste
  - 🔵 **Blue Bin**: Dry / Clean Recyclables
  - 🔴 **Red Bin**: Domestic Hazardous Waste
  - 🟡 **Yellow Bin**: Sanitary & Bio-Medical Waste
  - 🟣 **Purple Bin**: E-Waste / Electronics
  - ⚫ **Black Bin**: Inert & Non-Recyclable Waste
  - Includes Accepted Items, Prohibited Items, and practical Pro-Tips.
  - Real-time search filter (type any item to find its bin instantly).
- **"Sort the Waste" Gamified Mini-Game**:
  - Interactive quiz testing knowledge on everyday household waste items.
  - Score counter, streak multiplier, instant educational explanations, and celebratory endings.
- **Community Eco-Savings & Carbon Calculator**:
  - Live interactive sliders for Paper, Plastic, and Food Waste.
  - Dynamic calculations for Water Conserved (Liters), Trees Saved, CO₂ Emissions Prevented (kg CO₂e), and Organic Compost Produced.
- **Golden Rules of Waste Segregation**: Practical DOs and DON'Ts for households and residential societies.

---

## 📁 Project Structure

```
waste-management-system/
│
├── index.html              # Main single-page application UI
├── server.py               # Python HTTP server with auto-launch
├── start-website.bat       # Windows launcher
├── README.md               # Documentation & specifications guide
│
├── css/
│   └── styles.css          # Eco-theme styles, timelines, maps, modals, badges
│
└── js/
    ├── data.js             # Initial database, users, complaints, hotspots, bins, quiz
    ├── auth.js             # Registration, login, roles (Citizen, Admin, Driver), points
    ├── report.js           # Waste reporting form, GPS auto-detect, pin map, photo upload
    ├── pickup.js           # On-demand pickup booking & slot manager
    ├── tracking.js         # Visual 5-step timeline, search, before/after photos, rating
    ├── admin.js            # KPI metrics, hotspot map, fleet assignment, CSV export
    ├── awareness.js        # 6-Bin guide, search, sorting quiz game, eco calculator
    └── app.js              # Coordinator, tab router, modals, toast alert notifications
```
