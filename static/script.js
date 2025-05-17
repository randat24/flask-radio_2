document.getElementById("inventoryTable").addEventListener("blur", e => {
  const td = e.target;
  if (td.tagName === "TD" && td.dataset.field) {
    const tr = td.closest("tr");
    const id = tr.dataset.id;
    const field = td.dataset.field;
    const value = td.textContent.trim();

    fetch("/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, field, value })
    }).then(() => location.reload());
  }
}, true);

document.getElementById("inventoryTable").addEventListener("change", e => {
  const select = e.target;
  if (select.tagName === "SELECT" && select.dataset.field) {
    const tr = select.closest("tr");
    const id = tr.dataset.id;
    let value = select.value;
    const field = select.dataset.field;

    if (value === "__add_new__") {
      const newValue = prompt("Введите новое значение:");
      if (!newValue) return;
      value = newValue.trim();
      const newOpt = document.createElement("option");
      newOpt.value = value;
      newOpt.text = value;
      newOpt.selected = true;
      select.add(newOpt);
    }

    fetch("/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, field, value })
    }).then(() => location.reload());
  }
});

const addBtn = document.getElementById("addRow");
if (addBtn) {
  addBtn.addEventListener("click", () => {
    localStorage.setItem("scrollToBottom", "true");
    fetch("/add", { method: "POST" }).then(() => location.reload());
  });
}

document.getElementById("deleteSelected").addEventListener("click", () => {
  const ids = Array.from(document.querySelectorAll(".row-checkbox:checked"))
    .map(cb => cb.closest("tr").dataset.id);

  if (ids.length === 0) {
    alert("Выберите хотя бы одну строку.");
    return;
  }

  if (!confirm(`Удалить ${ids.length} записей? Это действие необратимо.`)) return;

  fetch("/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids })
  }).then(() => location.reload());
});

document.getElementById("selectAll").addEventListener("change", e => {
  const checked = e.target.checked;
  document.querySelectorAll(".row-checkbox").forEach(cb => cb.checked = checked);
});

document.getElementById("searchInput").addEventListener("input", e => {
  const filter = e.target.value.toLowerCase();
  document.querySelectorAll("#inventoryTable tbody tr").forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
});

// Дублируем действия для нижних кнопок
document.getElementById("addRowBottom").addEventListener("click", () => {
  fetch("/add", { method: "POST" }).then(() => location.reload());
});

document.getElementById("deleteSelectedBottom").addEventListener("click", () => {
  document.getElementById("deleteSelected").click();
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("scrollToBottom") === "true") {
    const container = document.querySelector(".table-container") || window;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    localStorage.removeItem("scrollToBottom");
  }
});