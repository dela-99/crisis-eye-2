/* ==========================================================================
   📦 ARCHITECTURAL MOCK DATA STORAGE LOGS
   ========================================================================== */
const mockIncidents = [
    {
        id: 101,
        title: "Industrial Fire Outbreak",
        location: "Industrial Area, Accra Mall Sector",
        severity: "High",
        status: "Active",
        time: "2 mins ago"
    },
    {
        id: 102,
        title: "Multi-Vehicle Highway Collision",
        location: "Tema Motorway, Milestone 12",
        severity: "Medium",
        status: "Resolved",
        time: "22 mins ago"
    },
    {
        id: 103,
        title: "Flash Flood Surge Triage",
        location: "Kumasi South Basin, Ashanti Region",
        severity: "High",
        status: "Pending",
        time: "1 hr ago"
    },
    {
        id: 104,
        title: "Structural Failure / Building Collapse",
        location: "Koforidua Central Market Block C",
        severity: "High",
        status: "Active",
        time: "3 hrs ago"
    },
    {
        id: 105,
        title: "Localized Minor Grid Outage",
        location: "Takoradi Port Substation",
        severity: "Low",
        status: "Resolved",
        time: "5 hrs ago"
    },
    {
        id: 106,
        title: "Commercial Building Smoke Alarm",
        location: "Osu Oxford Street Retail complex",
        severity: "Low",
        status: "Pending",
        time: "6 hrs ago"
    }
];

// Local State Mutator copies
let incidentsData = [...mockIncidents];

/* ==========================================================================
   🏁 INITIALIZATION WORKFLOW
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initFilterListeners();
    renderAppCore();
    initScrollReveal(); // Initialize scroll reveal for animations
});

/* ==========================================================================
   🧭 NAVIGATION & VIEW HELPERS
   ========================================================================== */
function switchView(viewId) {
    const pageMap = {
        'home': 'index.html',
        'reports': 'report.html',
        'dashboard': 'dashboard.html',
        'map': 'map.html'
    };

    if (pageMap[viewId]) {
        window.location.href = pageMap[viewId];
    } else {
        window.location.href = 'index.html';
    }
}

/* ==========================================================================
   🎛️ SEARCH FILTERS IMPLEMENTATION ENGINE
   ========================================================================== */
function initFilterListeners() {
    const searchInput = document.getElementById("search-input");
    const severitySelect = document.getElementById("filter-severity");
    const statusSelect = document.getElementById("filter-status");

    if (searchInput) searchInput.addEventListener("input", executeFilterPipeline);
    if (severitySelect) severitySelect.addEventListener("change", executeFilterPipeline);
    if (statusSelect) statusSelect.addEventListener("change", executeFilterPipeline);
}

function executeFilterPipeline() {
    const searchQuery = document.getElementById("search-input").value.toLowerCase();
    const severityFilter = document.getElementById("filter-severity").value;
    const statusFilter = document.getElementById("filter-status").value;

    const filtered = incidentsData.filter(incident => {
        const matchesSearch = incident.title.toLowerCase().includes(searchQuery) || 
                              incident.location.toLowerCase().includes(searchQuery);
        const matchesSeverity = (severityFilter === "all") || (incident.severity === severityFilter);
        const matchesStatus = (statusFilter === "all") || (incident.status === statusFilter);

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    renderReportsList(filtered);
}

/* ==========================================================================
   🖼️ CORE RENDERING GRAPHICS CONTROLLER PIPELINE
   ========================================================================== */
function renderAppCore() {
    renderTickerAlerts();
    renderReportsList(incidentsData);
    calculateAndRenderAnalytics();
}

// 📰 Ticker Generator
function renderTickerAlerts() {
    const tickerContainer = document.getElementById("ticker-alerts");
    if (!tickerContainer) return;

    const activeAlerts = incidentsData.filter(i => i.status === "Active");
    if (activeAlerts.length === 0) {
        tickerContainer.textContent = "No active threats detected across national sectors.";
        return;
    }

    tickerContainer.textContent = activeAlerts.map(i => `[ALERT #${i.id}] ${i.title} (${i.location})`).join("  •  ");
}

// 📊 Reports List Card Builder
function renderReportsList(dataList) {
    const container = document.getElementById("reports-container");
    const counterBadge = document.getElementById("total-reports-badge");
    
    if (!container) return;
    container.innerHTML = "";

    if (counterBadge) counterBadge.textContent = `${dataList.length} Logged Case File(s) Visible`;

    if (dataList.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">
                No incidents match current filter conditions.
            </div>`;
        return;
    }

    dataList.forEach(incident => {
        const card = document.createElement("div");
        card.className = "glass-card incident-card";

        const severityClass = `badge-${incident.severity.toLowerCase()}`;
        let statusColorClass = "bg-warning";
        if (incident.status === "Active") statusColorClass = "bg-danger";
        if (incident.status === "Resolved") statusColorClass = "bg-success";

        card.innerHTML = `
            <div>
                <div class="card-top">
                    <div>
                        <h3 class="incident-title">${incident.title}</h3>
                        <div class="incident-loc">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            ${incident.location}
                        </div>
                    </div>
                    <span class="badge ${severityClass}">${incident.severity}</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="status-indicator-pill">
                    <span class="status-dot ${statusColorClass}"></span>
                    ${incident.status}
                </div>
                <span class="timestamp-lbl">${incident.time}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// 📈 Mathematical Matrix & Analytics Builder
function calculateAndRenderAnalytics() {
    const total = incidentsData.length;
    const active = incidentsData.filter(i => i.status === "Active").length;
    const pending = incidentsData.filter(i => i.status === "Pending").length;
    const resolved = incidentsData.filter(i => i.status === "Resolved").length;

    const high = incidentsData.filter(i => i.severity === "High").length;
    const medium = incidentsData.filter(i => i.severity === "Medium").length;
    const low = incidentsData.filter(i => i.severity === "Low").length;

    // Injections to Summary Panels
    safeSetText("stat-total", total);
    safeSetText("stat-active", active);
    safeSetText("stat-pending", pending);
    safeSetText("stat-resolved", resolved);

    // Injections to Status Donut Simulation Table Metrics
    safeSetText("matrix-active", active);
    safeSetText("matrix-pending", pending);
    safeSetText("matrix-resolved", resolved);

    // Calculate Percentages for Bar Fill UI Blocks
    adjustBarChartWidth("chart-bar-high", "chart-val-high", high, total);
    adjustBarChartWidth("chart-bar-medium", "chart-val-medium", medium, total);
    adjustBarChartWidth("chart-bar-low", "chart-val-low", low, total);

    // Build Activity logs
    renderActivityFeed();
}

/* ==========================================================================
   ✨ SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    revealElements.forEach(el => observer.observe(el));
}

function safeSetText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function adjustBarChartWidth(barId, valId, count, total) {
    const bar = document.getElementById(barId);
    const valueTxt = document.getElementById(valId);
    if (!bar || !valueTxt) return;

    const percentage = total > 0 ? (count / total) * 100 : 0;
    bar.style.width = `${percentage}%`;
    valueTxt.textContent = count;
}

function renderActivityFeed() {
    const logFeed = document.getElementById("activity-log-feed");
    if (!logFeed) return;

    logFeed.innerHTML = "";

    // Generate telemetry logs from active data arrays
    incidentsData.forEach((incident, index) => {
        const logEntry = document.createElement("div");
        logEntry.className = `log-entry log-${incident.severity.toLowerCase()}`;
        
        // Mock timestamps sequence offsets
        const secondsOffset = index * 14 + 12;

        logEntry.innerHTML = `
            <span>[LOG-TRG-${incident.id}] Triage Vector updated: "${incident.title}" placed under execution status: <strong>${incident.status}</strong></span>
            <span class="log-timestamp">T +${secondsOffset}s</span>
        `;
        logFeed.appendChild(logEntry);
    });
}

/* ==========================================================================
   🚨 SIMULATION INTERACTION TRIGGER EVENT (MUTATING STATE CONTROLLER)
   ========================================================================== */
function triggerMockAlert() {
    const titles = ["Chemical Spillage Leak", "Critical Biohazard Containment Alert", "Substation Transformer Explosion", "Major Port Structural Jam"];
    const locations = ["Tema Port Warehouse 4", "Accra Industrial Perimeter B", "Adabraka Infrastructure Node", "Medina Substation Hub"];
    const severities = ["High", "Medium", "Low"];
    
    // Choose randomized fields
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    const randomSev = severities[Math.floor(Math.random() * severities.length)];

    const newIncident = {
        id: 100 + incidentsData.length + 1,
        title: randomTitle,
        location: randomLoc,
        severity: randomSev,
        status: "Active",
        time: "Just Now"
    };

    // Prepend into state array
    incidentsData.unshift(newIncident);

    // Alert User via System Context Prompt UI Banner Flash
    alert(`🚨 SIMULATION NOTIFICATION:\nNew Emergency Dispatched!\nType: ${randomTitle}\nTarget Vector: ${randomLoc}\nSeverity: ${randomSev}\n\nCommand Metrics and Incident logs have been updated instantaneously.`);
    
    // For multi-page, we redirect to dashboard to see the new data
    window.location.href = 'dashboard.html';
}