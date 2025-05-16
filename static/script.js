
let originalData = [];
let editable = false;

const models = ["R7", "DP4400", "DP4400e", "DP4401e"];
const statuses = ["Не учтеная", "Списаная", "Учтеная"];
const locations = ["РЕР", "КСП", "БПЛА"];
const states = ["На КСП", "Выдано", "На выход", "Утеряна", "Неизвестно", "Дежурная"];

function toggleEdit() {
  editable = !editable;
  document.getElementById("editToggle").innerText = editable ? "Завершить редактирование" : "Редактировать таблицу";
  renderTable(originalData);
}

function createInput(value = "", type = "text", col) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value || "";
  input.setAttribute("data-col", col);
  input.disabled = !editable;
  return input;
}

function createSelect(options, selected, col) {
  const select = document.createElement("select");
  select.setAttribute("data-col", col);
  select.disabled = !editable;
  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = o.textContent = opt;
    if (opt === selected) o.selected = true;
    select.appendChild(o);
  });
  select.onchange = () => handleStateChange(select.closest("tr"));
  return select;
}

function handleStateChange(row) {
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
}

function createRow(row = {}) {
  const tr = document.createElement("tr");
  tr.appendChild(cell(createSelect(models, row.model, "model")));
  tr.appendChild(cell(createInput(row.number, "text", "number")));
  tr.appendChild(cell(createSelect(statuses, row.status, "status")));
  tr.appendChild(cell(createInput(row.sn, "text", "sn")));
  tr.appendChild(cell(createSelect(locations, row.location, "location")));
  tr.appendChild(cell(createSelect(states, row.state, "state")));
  tr.appendChild(cell(createInput(row.who, "text", "who")));
  tr.appendChild(cell(createInput(row.date, "date", "date")));
  tr.appendChild(cell(createInput(row.returned, "date", "returned")));
  tr.appendChild(cell(createInput(row.notes, "text", "notes")));
  return tr;
}

function cell(content) {
  const td = document.createElement("td");
  td.appendChild(content);
  return td;
}

function renderTable(data) {
  const tbody = document.querySelector("#radioTable tbody");
  tbody.innerHTML = "";
  data.forEach(row => tbody.appendChild(createRow(row)));
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
  }).then(() => alert("Изменения сохранены!"));
}

function addRow() {
  originalData.push({
    model: "", number: "", status: "", sn: "", location: "",
    state: "", who: "", date: "", returned: "", notes: ""
  });
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
