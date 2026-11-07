(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const menuToggle = $(".menu-toggle");
  const nav = $(".nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    $$("a", nav).forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
      }
    });
  }

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const toggle = $("#theme-toggle");
  const root = document.documentElement;
  let theme = localStorage.getItem("bhawishya-theme") ||
    (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");

  function applyTheme(next) {
    theme = next === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    if (!toggle) return;
    const isLight = theme === "light";
    toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    toggle.title = isLight ? "Switch to Solar dark theme" : "Switch to Lunar light theme";
    const icon = toggle.querySelector("span:first-child");
    const label = toggle.querySelector(".theme-toggle-label");
    if (icon) icon.textContent = isLight ? "☾" : "☼";
    if (label) label.textContent = isLight ? "Lunar" : "Solar";
  }
  applyTheme(theme);
  toggle?.addEventListener("click", () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("bhawishya-theme", next);
    applyTheme(next);
  });

  try {
    const saved = JSON.parse(localStorage.getItem("bhawishya-site-content") || "null");
    if (saved) {
      const title = $("[data-editable='heroTitle']");
      const lead = $("[data-editable='heroLead']");
      if (title && saved.heroTitle) title.innerHTML = saved.heroTitle;
      if (lead && saved.heroLead) lead.textContent = saved.heroLead;
      if (Array.isArray(saved.projects)) {
        $$(".project-card").forEach((card, i) => {
          const project = saved.projects[i];
          if (!project) return;
          const heading = $(".project-title h3", card);
          const description = $(".project-body > p", card);
          if (heading && project.title) heading.textContent = project.title;
          if (description && project.description) description.textContent = project.description;
        });
      }
    }
  } catch (error) {
    console.warn("Could not load locally saved site content.", error);
  }
})();
