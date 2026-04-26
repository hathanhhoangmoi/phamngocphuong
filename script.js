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
