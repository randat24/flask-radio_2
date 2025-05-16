let originalData = [];

function createRow(row) {
  const tr = document.createElement("tr");
  const cols = ["model", "number", "status", "sn", "location", "state", "who", "date", "returned", "notes"];
  cols.forEach(col => {
    const td = document.createElement("td");
    td.textContent = row[col] || "";
    tr.appendChild(td);
  });
  return tr;
}

function renderTable(data) {
  const tbody = document.querySelector("#radioTable tbody");
  tbody.innerHTML = "";
  data.forEach(row => tbody.appendChild(createRow(row)));
}

function applyFilters() {
  const text = document.getElementById("search").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const location = document.getElementById("locationFilter").value;
  const state = document.getElementById("stateFilter").value;

  const filtered = originalData.filter(row => {
    return (!status || row.status === status) &&
           (!location || row.location === location) &&
           (!state || row.state === state) &&
           Object.values(row).some(val => (val || "").toLowerCase().includes(text));
  });

  renderTable(filtered);
}

window.onload = () => {
  fetch("/load")
    .then(res => res.json())
    .then(json => {
      originalData = json;
      renderTable(originalData);
    });
};
