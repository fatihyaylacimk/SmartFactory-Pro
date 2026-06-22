const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const themeBtn = document.getElementById("themeBtn");
const pageTitle = document.getElementById("pageTitle");
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const globalSearch = document.getElementById("globalSearch");

let production = [
  { id: "PRD-1001", line: "Line A", product: "Steel Coil", target: 250, actual: 238, status: "Completed" },
  { id: "PRD-1002", line: "Line B", product: "Steel Bar", target: 180, actual: 165, status: "Running" },
  { id: "PRD-1003", line: "Line C", product: "Sheet Metal", target: 220, actual: 154, status: "Delayed" },
  { id: "PRD-1004", line: "Line D", product: "Pipe", target: 160, actual: 160, status: "Completed" },
  { id: "PRD-1005", line: "Line A", product: "Billet", target: 300, actual: 288, status: "Running" }
];

let machines = [
  { name: "Furnace A1", status: "Active", score: 94, temp: "1240°C" },
  { name: "Rolling Mill B2", status: "Active", score: 89, temp: "740°C" },
  { name: "Cooling Line C1", status: "Warning", score: 62, temp: "96°C" },
  { name: "Cutting Unit D4", status: "Active", score: 91, temp: "52°C" },
  { name: "Packaging Robot P3", status: "Active", score: 86, temp: "41°C" },
  { name: "Conveyor K7", status: "Maintenance", score: 48, temp: "N/A" }
];

let maintenance = [
  { ticket: "MT-701", machine: "Cooling Line C1", issue: "Temperature instability", priority: "High", status: "Open" },
  { ticket: "MT-702", machine: "Conveyor K7", issue: "Motor vibration", priority: "Medium", status: "In Progress" },
  { ticket: "MT-703", machine: "Rolling Mill B2", issue: "Oil inspection", priority: "Low", status: "Closed" }
];

let users = [
  { name: "Fatih Yaylacı", role: "Admin", department: "IT / Engineering" },
  { name: "Ahmet Demir", role: "Operator", department: "Production" },
  { name: "Elif Kaya", role: "Engineer", department: "Maintenance" }
];

let activities = [
  "System initialized successfully.",
  "Cooling Line C1 warning detected.",
  "Production report generated.",
  "Maintenance ticket MT-702 updated."
];

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "admin" && password === "1234") {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    renderAll();
  } else {
    alert("Wrong demo credentials. Use admin / 1234");
  }
});

logoutBtn.addEventListener("click", () => {
  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(item => item.classList.remove("active"));
    pages.forEach(page => page.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.page).classList.add("active");
    pageTitle.textContent = btn.textContent;
  });
});

document.getElementById("lineFilter").addEventListener("change", renderProductionTable);
document.getElementById("statusFilter").addEventListener("change", renderProductionTable);
globalSearch.addEventListener("input", () => {
  renderProductionTable();
  renderMachineGrid();
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  activities.unshift("Factory data refreshed.");
  production = production.map(item => ({
    ...item,
    actual: Math.max(80, item.actual + Math.floor(Math.random() * 31 - 10))
  }));
  renderAll();
});

document.getElementById("addProductionBtn").addEventListener("click", () => {
  openModal("Add Production Record", `
    <label>Line</label>
    <select id="newLine">
      <option>Line A</option>
      <option>Line B</option>
      <option>Line C</option>
      <option>Line D</option>
    </select>
    <label>Product</label>
    <input id="newProduct" value="Steel Coil">
    <label>Target</label>
    <input id="newTarget" type="number" value="200">
    <label>Actual</label>
    <input id="newActual" type="number" value="175">
    <label>Status</label>
    <select id="newStatus">
      <option>Completed</option>
      <option>Running</option>
      <option>Delayed</option>
    </select>
  `, () => {
    const id = "PRD-" + (1000 + production.length + 1);
    production.push({
      id,
      line: document.getElementById("newLine").value,
      product: document.getElementById("newProduct").value,
      target: Number(document.getElementById("newTarget").value),
      actual: Number(document.getElementById("newActual").value),
      status: document.getElementById("newStatus").value
    });
    activities.unshift(`${id} production record added.`);
    closeModal();
    renderAll();
  });
});

document.getElementById("addMaintenanceBtn").addEventListener("click", () => {
  openModal("Create Maintenance Request", `
    <label>Machine</label>
    <input id="newMachine" value="Furnace A1">
    <label>Issue</label>
    <input id="newIssue" value="Routine inspection">
    <label>Priority</label>
    <select id="newPriority">
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
    </select>
    <label>Status</label>
    <select id="newMStatus">
      <option>Open</option>
      <option>In Progress</option>
      <option>Closed</option>
    </select>
  `, () => {
    const ticket = "MT-" + (701 + maintenance.length);
    maintenance.push({
      ticket,
      machine: document.getElementById("newMachine").value,
      issue: document.getElementById("newIssue").value,
      priority: document.getElementById("newPriority").value,
      status: document.getElementById("newMStatus").value
    });
    activities.unshift(`${ticket} maintenance request created.`);
    closeModal();
    renderAll();
  });
});

document.getElementById("csvBtn").addEventListener("click", () => {
  const rows = [["ID","Line","Product","Target","Actual","Efficiency","Status"]];
  production.forEach(item => {
    rows.push([item.id, item.line, item.product, item.target, item.actual, getEfficiency(item) + "%", item.status]);
  });
  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "smartfactory-production-report.csv";
  a.click();
  URL.revokeObjectURL(url);
  activities.unshift("CSV report downloaded.");
  renderActivityLog();
});

document.getElementById("printBtn").addEventListener("click", () => {
  activities.unshift("PDF print report prepared.");
  renderActivityLog();
  window.print();
});

function getEfficiency(item) {
  return Math.round((item.actual / item.target) * 100);
}

function renderAll() {
  renderKpis();
  renderChart();
  renderProductionTable();
  renderMachineGrid();
  renderMaintenanceTable();
  renderActivityLog();
  renderReportSummary();
  renderUsers();
}

function renderKpis() {
  const totalActual = production.reduce((sum, item) => sum + item.actual, 0);
  const totalTarget = production.reduce((sum, item) => sum + item.target, 0);
  const efficiency = Math.round((totalActual / totalTarget) * 100);
  const activeCount = machines.filter(m => m.status === "Active").length;
  const openCount = maintenance.filter(m => m.status !== "Closed").length;

  document.getElementById("totalProduction").textContent = totalActual + " tons";
  document.getElementById("efficiency").textContent = efficiency + "%";
  document.getElementById("activeMachines").textContent = `${activeCount}/${machines.length}`;
  document.getElementById("openMaintenance").textContent = openCount;
}

function renderChart() {
  const chart = document.getElementById("productionChart");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [72, 82, 64, 88, 93, 76, 90];

  chart.innerHTML = values.map((value, index) => `
    <div class="bar" style="height:${value}%">
      <span>${days[index]}</span>
    </div>
  `).join("");
}

function renderProductionTable() {
  const tbody = document.getElementById("productionTable");
  const lineFilter = document.getElementById("lineFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const search = globalSearch.value.toLowerCase();

  const filtered = production.filter(item => {
    const matchLine = lineFilter === "all" || item.line === lineFilter;
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchSearch = Object.values(item).join(" ").toLowerCase().includes(search);
    return matchLine && matchStatus && matchSearch;
  });

  tbody.innerHTML = filtered.map(item => {
    const eff = getEfficiency(item);
    const badge = item.status === "Completed" ? "success" : item.status === "Running" ? "warning" : "danger";
    return `
      <tr>
        <td>${item.id}</td>
        <td>${item.line}</td>
        <td>${item.product}</td>
        <td>${item.target}</td>
        <td>${item.actual}</td>
        <td>${eff}%</td>
        <td><span class="badge ${badge}">${item.status}</span></td>
      </tr>
    `;
  }).join("");
}

function renderMachineGrid() {
  const grid = document.getElementById("machineGrid");
  const search = globalSearch.value.toLowerCase();

  const filtered = machines.filter(m => Object.values(m).join(" ").toLowerCase().includes(search));

  grid.innerHTML = filtered.map(machine => {
    const badge = machine.status === "Active" ? "success" : machine.status === "Warning" ? "warning" : "danger";
    return `
      <div class="machine-card">
        <h4>${machine.name}</h4>
        <span class="badge ${badge}">${machine.status}</span>
        <p>Temperature: <strong>${machine.temp}</strong></p>
        <div class="progress"><span style="width:${machine.score}%"></span></div>
        <small>Performance Score: ${machine.score}%</small>
      </div>
    `;
  }).join("");
}

function renderMaintenanceTable() {
  const tbody = document.getElementById("maintenanceTable");
  tbody.innerHTML = maintenance.map(item => {
    const badge = item.priority === "High" ? "danger" : item.priority === "Medium" ? "warning" : "success";
    return `
      <tr>
        <td>${item.ticket}</td>
        <td>${item.machine}</td>
        <td>${item.issue}</td>
        <td><span class="badge ${badge}">${item.priority}</span></td>
        <td>${item.status}</td>
      </tr>
    `;
  }).join("");
}

function renderActivityLog() {
  document.getElementById("activityLog").innerHTML = activities.slice(0, 8).map(item => `
    <div class="activity-item">${new Date().toLocaleString()} — ${item}</div>
  `).join("");
}

function renderReportSummary() {
  const totalActual = production.reduce((sum, item) => sum + item.actual, 0);
  const avgEfficiency = Math.round(production.reduce((sum, item) => sum + getEfficiency(item), 0) / production.length);
  const delayed = production.filter(item => item.status === "Delayed").length;
  const open = maintenance.filter(item => item.status !== "Closed").length;

  document.getElementById("reportSummary").innerHTML = `
    <div class="report-row"><span>Total Daily Production</span><strong>${totalActual} tons</strong></div>
    <div class="report-row"><span>Average Efficiency</span><strong>${avgEfficiency}%</strong></div>
    <div class="report-row"><span>Delayed Records</span><strong>${delayed}</strong></div>
    <div class="report-row"><span>Open Maintenance</span><strong>${open}</strong></div>
  `;
}

function renderUsers() {
  document.getElementById("userList").innerHTML = users.map(user => `
    <div class="user-row">
      <div>
        <strong>${user.name}</strong><br>
        <span>${user.department}</span>
      </div>
      <span class="badge success">${user.role}</span>
    </div>
  `).join("");
}

function openModal(title, body, onSave) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = body;
  document.getElementById("modal").classList.remove("hidden");

  const saveBtn = document.getElementById("saveModalBtn");
  saveBtn.onclick = onSave;
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

document.getElementById("closeModalBtn").addEventListener("click", closeModal);
