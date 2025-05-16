let originalData = [];

const models = ["R7", "DP4400", "DP4400e", "DP4401e"];
const statuses = ["Не учтеная", "Списаная", "Учтеная"];
const locations = ["РЕР", "КСП", "БПЛА"];
const states = ["На КСП", "Выдано", "На выход", "Утеряна", "Неизвестно", "Дежурная"];

function createInput(value = "", type = "text", col) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value || "";
  input.setAttribute("data-col", col);
  input.oninput = saveData;
  return input;
}

function createSelect(options, selected, col) {
  const select = document.createElement("select");
  select.setAttribute("data-col", col);
  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = o.textContent = opt;
    if (opt === selected) o.selected = true;
    select.appendChild(o);
  });
  select.onchange = (e) => {
    const row = e.target.closest("tr");
    const state = row.querySelector("[data-col='state']").value;
    const dateInput = row.querySelector("[data-col='date']");
    const returnedInput = row.querySelector("[data-col='returned']");
    const today = new Date().toISOString().split("T")[0];
    if (state === "Выдано" || state === "На выход") {
      dateInput.value = today;
    }
    if (state === "На КСП") {
      returnedInput.value = today;
      dateInput.value = "";
    }
    saveData();
  };
  return select;
}

function createEditableRow(row = {}) {
  const tr = document.createElement("tr");
  tr.appendChild(createCell(createSelect(models, row.model, "model")));
  tr.appendChild(createCell(createInput(row.number, "text", "number")));
  tr.appendChild(createCell(createSelect(statuses, row.status, "status")));
  tr.appendChild(createCell(createInput(row.sn, "text", "sn")));
  tr.appendChild(createCell(createSelect(locations, row.location, "location")));
  tr.appendChild(createCell(createSelect(states, row.state, "state")));
  tr.appendChild(createCell(createInput(row.who, "text", "who")));
  tr.appendChild(createCell(createInput(row.date, "date", "date")));
  tr.appendChild(createCell(createInput(row.returned, "date", "returned")));
  tr.appendChild(createCell(createInput(row.notes, "text", "notes")));
  document.querySelector("#radioTable tbody").appendChild(tr);
}

function createCell(child) {
  const td = document.createElement("td");
  td.appendChild(child);
  return td;
}

function renderTable(data) {
  document.querySelector("#radioTable tbody").innerHTML = "";
  data.forEach(createEditableRow);
}

function applyFilters() {
  const search = document.getElementById("search").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const location = document.getElementById("locationFilter").value;
  const state = document.getElementById("stateFilter").value;

  const filtered = originalData.filter(row => {
    return (!status || row.status === status) &&
           (!location || row.location === location) &&
           (!state || row.state === state) &&
           Object.values(row).some(v => (v || "").toLowerCase().includes(search));
  });

  renderTable(filtered);
}

function saveData() {
  const rows = document.querySelectorAll("#radioTable tbody tr");
  const newData = Array.from(rows).map(row => {
    const get = sel => row.querySelector(`[data-col='${sel}']`).value;
    return {
      model: get("model"),
      number: get("number"),
      status: get("status"),
      sn: get("sn"),
      location: get("location"),
      state: get("state"),
      who: get("who"),
      date: get("date"),
      returned: get("returned"),
      notes: get("notes")
    };
  });
  originalData = newData;
  fetch("/save", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ data: newData })
  });
}

function addRow() {
  originalData.push({});
  applyFilters();
}

window.onload = () => {
  fetch("/load")
    .then(res => res.json())
    .then(json => {
      originalData = json;
      applyFilters();
    });
}