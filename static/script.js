const models = ["R7", "DP4400", "DP4400e", "DP4401e"];
const statuses = ["Не учтеная", "Списаная", "Учтеная"];
const locations = ["РЕР", "КСП", "БПЛА"];
const states = ["На КСП", "Выдано", "На выход", "Утеряна", "Неизвестно", "Дежурная"];
let editable = false;

function createInput(value = "", type = "text", disabled = false) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  input.disabled = !editable || disabled;
  input.onchange = saveData;
  return input;
}

function createSelect(options, value = "") {
  const select = document.createElement("select");
  select.disabled = !editable;
  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = o.text = opt;
    if (opt === value) o.selected = true;
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

function addRow(row = {}) {
  const tr = document.createElement("tr");
  const cells = [
    createSelect(models, row.model),                          // модель
    createInput(row.number),                                  // номер
    createSelect(statuses, row.status),                       // статус
    createInput(row.sn),                                      // sn
    createSelect(locations, row.location),                    // где сейчас
    createSelect(states, row.state),                          // статут
    createInput(row.who),                                     // кто получил
    createInput(row.date || "", "date"),                      // дата
    createInput(row.returned || "", "date"),                  // сдали
    createInput(row.notes || "")                              // примечание
  ];
  const fields = ["model", "number", "status", "sn", "location", "state", "who", "date", "returned", "notes"];
  cells.forEach((el, i) => el.setAttribute("data-col", fields[i]));
  cells.forEach(cell => {
    const td = document.createElement("td");
    td.appendChild(cell);
    tr.appendChild(td);
  });
  document.querySelector("#radioTable tbody").appendChild(tr);
}

function toggleEdit() {
  editable = !editable;
  document.getElementById("editToggle").innerText = editable ? "Завершить редактирование" : "Редактировать таблицу";
  document.querySelectorAll("input, select").forEach(el => el.disabled = !editable);
}

function saveData() {
  const rows = document.querySelectorAll("#radioTable tbody tr");
  const data = Array.from(rows).map(row => {
    const get = (selector) => row.querySelector(`[data-col='${selector}']`).value;
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
  fetch("/save", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ data })
  });
}

window.onload = () => {
  fetch("/load")
    .then(res => res.json())
    .then(json => json.forEach(addRow));
};
