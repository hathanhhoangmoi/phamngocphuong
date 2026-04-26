document.body.classList.add("preload");

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    document.body.classList.remove("preload");
  });
});

const targets = Array.from(document.querySelectorAll("[data-tab-target]"));
const panels = Array.from(document.querySelectorAll(".tab-panel"));
const tabShell = document.getElementById("content-tabs");
const printButton = document.getElementById("print-report");
const salaryRows = Array.from(document.querySelectorAll(".salary-row"));
const salaryHeadcount = document.getElementById("salary-headcount");
const salaryMonthlyTotal = document.getElementById("salary-monthly-total");
const salaryYearlyTotal = document.getElementById("salary-yearly-total");
const salaryResetButton = document.getElementById("salary-reset");
const salaryStorageKey = "fanola-salary-planner-v1";

function setActiveTab(tabName, options = {}) {
  const { updateHash = true, scrollIntoView = false } = options;

  targets.forEach((trigger) => {
    const isActive = trigger.dataset.tabTarget === tabName;
    trigger.classList.toggle("is-active", isActive);

    if (trigger.matches('[role="tab"]')) {
      trigger.setAttribute("aria-selected", String(isActive));
      trigger.setAttribute("tabindex", isActive ? "0" : "-1");
    }
  });

  panels.forEach((panel) => {
    const isActive = panel.id === `panel-${tabName}`;
    panel.hidden = !isActive;

    requestAnimationFrame(() => {
      panel.classList.toggle("is-active", isActive);
    });
  });

  if (updateHash) {
    history.replaceState(null, "", `#${tabName}`);
  }

  if (scrollIntoView && tabShell) {
    tabShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

targets.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    setActiveTab(trigger.dataset.tabTarget, {
      updateHash: true,
      scrollIntoView: !trigger.matches('[role="tab"]'),
    });
  });
});

document.addEventListener("keydown", (event) => {
  const activeTab = document.querySelector('.tab-button.is-active');
  if (!activeTab) return;

  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const currentIndex = tabButtons.indexOf(activeTab);

  if (event.key === "ArrowRight") {
    const next = tabButtons[(currentIndex + 1) % tabButtons.length];
    next.focus();
    setActiveTab(next.dataset.tabTarget);
  }

  if (event.key === "ArrowLeft") {
    const previous = tabButtons[(currentIndex - 1 + tabButtons.length) % tabButtons.length];
    previous.focus();
    setActiveTab(previous.dataset.tabTarget);
  }
});

const hash = window.location.hash.replace("#", "");
const availableTabs = new Set(["overview", "strategy", "team"]);
setActiveTab(availableTabs.has(hash) ? hash : "overview", { updateHash: false });

if (printButton) {
  printButton.addEventListener("click", () => {
    window.print();
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function sanitizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function getSalaryDefaults() {
  const defaults = {};

  salaryRows.forEach((row) => {
    const role = row.dataset.salaryRole;
    defaults[role] = {
      qty: row.querySelector(".salary-qty")?.value ?? "0",
      amount: row.querySelector(".salary-amount")?.value ?? "0",
    };
  });

  return defaults;
}

const salaryDefaults = getSalaryDefaults();

function getStoredSalaryState() {
  try {
    return localStorage.getItem(salaryStorageKey);
  } catch (error) {
    return null;
  }
}

function setStoredSalaryState(value) {
  try {
    localStorage.setItem(salaryStorageKey, value);
  } catch (error) {
    return;
  }
}

function clearStoredSalaryState() {
  try {
    localStorage.removeItem(salaryStorageKey);
  } catch (error) {
    return;
  }
}

function saveSalaryState() {
  if (!salaryRows.length) return;

  const state = {};

  salaryRows.forEach((row) => {
    const role = row.dataset.salaryRole;
    state[role] = {
      qty: row.querySelector(".salary-qty")?.value ?? "0",
      amount: row.querySelector(".salary-amount")?.value ?? "0",
    };
  });

  setStoredSalaryState(JSON.stringify(state));
}

function updateSalarySummary() {
  if (!salaryRows.length) return;

  let totalHeadcount = 0;
  let totalMonthly = 0;

  salaryRows.forEach((row) => {
    const qtyInput = row.querySelector(".salary-qty");
    const amountInput = row.querySelector(".salary-amount");
    const subtotalEl = row.querySelector(".salary-subtotal");
    const qty = sanitizeNumber(qtyInput?.value);
    const amount = sanitizeNumber(amountInput?.value);
    const subtotal = qty * amount;

    totalHeadcount += qty;
    totalMonthly += subtotal;

    if (subtotalEl) {
      subtotalEl.textContent = formatCurrency(subtotal);
    }
  });

  if (salaryHeadcount) salaryHeadcount.textContent = String(totalHeadcount);
  if (salaryMonthlyTotal) salaryMonthlyTotal.textContent = formatCurrency(totalMonthly);
  if (salaryYearlyTotal) salaryYearlyTotal.textContent = formatCurrency(totalMonthly * 12);
}

function loadSalaryState() {
  if (!salaryRows.length) return;

  const rawState = getStoredSalaryState();
  if (!rawState) {
    updateSalarySummary();
    return;
  }

  try {
    const state = JSON.parse(rawState);

    salaryRows.forEach((row) => {
      const role = row.dataset.salaryRole;
      const savedRole = state[role];
      if (!savedRole) return;

      const qtyInput = row.querySelector(".salary-qty");
      const amountInput = row.querySelector(".salary-amount");

      if (qtyInput && savedRole.qty !== undefined) qtyInput.value = savedRole.qty;
      if (amountInput && savedRole.amount !== undefined) amountInput.value = savedRole.amount;
    });
  } catch (error) {
    clearStoredSalaryState();
  }

  updateSalarySummary();
}

salaryRows.forEach((row) => {
  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      updateSalarySummary();
      saveSalaryState();
    });
  });
});

if (salaryResetButton) {
  salaryResetButton.addEventListener("click", () => {
    salaryRows.forEach((row) => {
      const role = row.dataset.salaryRole;
      const defaults = salaryDefaults[role];
      if (!defaults) return;

      const qtyInput = row.querySelector(".salary-qty");
      const amountInput = row.querySelector(".salary-amount");

      if (qtyInput) qtyInput.value = defaults.qty;
      if (amountInput) amountInput.value = defaults.amount;
    });

    updateSalarySummary();
    saveSalaryState();
  });
}

loadSalaryState();
