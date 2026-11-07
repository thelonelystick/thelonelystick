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

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
  const safeImage = value => {
    if (!value) return "";
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value)) return value;
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const safeLink = value => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const defaults = [
    {kind:"astro",meta:"WEB PROJECT · INTERACTIVE EXPERIENCE",tags:["Web Development","UI Design","Research"],url:"https://astro-gpt-rho.vercel.app"},
    {kind:"scarlet",meta:"AI CONCEPT · PRODUCTIVITY",tags:["AI Assistants","Product Thinking"]},
    {kind:"purpledevs",meta:"BRAND CONCEPT · DIGITAL SERVICES",tags:["Web Services","Branding","AI Tools"]},
    {kind:"fuzion",meta:"EDTECH CONCEPT · DASHBOARD",tags:["EdTech","Dashboard UX","Firebase"]}
  ];
  const artFor = kind => ({
    astro:'<div class="planet"></div><div class="planet-ring"></div>',
    scarlet:'<div class="ai-panel"><div class="panel-top"><i></i><i></i><i></i><span>SCARLET / ASSISTANT</span></div><div class="soundwave"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div><div class="ai-caption">A SECOND BRAIN, DESIGNED AROUND YOU</div></div>',
    purpledevs:'<div class="pd-mark">P<span>D</span></div><div class="pd-orbit"></div>',
    fuzion:'<div class="edu-card"><span class="edu-star">✳</span><strong>Learn with clarity.</strong><div class="edu-lines"><i></i><i></i><i></i></div><small>STUDENT · TEACHER · PARENT</small></div>'
  }[kind] || '<span class="custom-project-mark">PROJECT</span>');
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem("bhawishya-site-content") || "null");
  } catch (error) {
    console.warn("Could not load locally saved site content.", error);
  }
  if (saved) {
    const title = $("[data-editable='heroTitle']");
    const lead = $("[data-editable='heroLead']");
    if (title && saved.heroTitle) {
      title.innerHTML = escapeHTML(saved.heroTitle)
        .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
        .replace(/&lt;span class=&quot;gold-text&quot;&gt;/gi, '<span class="gold-text">')
        .replace(/&lt;\/span&gt;/gi, "</span>");
    }
    if (lead && saved.heroLead) lead.textContent = saved.heroLead;

    const heroImage = safeImage(saved.heroImage || "");
    const heroVisual = $(".hero-visual");
    const heroImageElement = $("#hero-display-image");
    if (heroVisual && heroImageElement && heroImage) {
      heroImageElement.src = heroImage;
      heroImageElement.hidden = false;
      heroVisual.classList.add("has-image");
    }
    if (Array.isArray(saved.projects)) {
      const grid = $("#project-grid");
      if (grid) {
        grid.innerHTML = saved.projects.map((project, index) => {
          const item = {...(defaults[index] || {}), ...project};
          const image = safeImage(item.image || "");
          const url = safeLink(item.url || "");
          const tags = Array.isArray(item.tags) ? item.tags : [];
          return `<article class="project-card"><div class="project-art ${escapeHTML(item.kind || "custom")}"${image ? ' data-has-image="true"' : ""}><span class="art-label">${escapeHTML(item.meta || "PROJECT")}</span><span class="art-number">${String(index + 1).padStart(2, "0")}</span>${image ? `<img class="project-image" src="${escapeHTML(image)}" alt="${escapeHTML(item.title)}">` : artFor(item.kind)}${!image && item.kind === "astro" ? `<div class="art-word">${escapeHTML(item.title)}<span>✳</span></div>` : ""}</div><div class="project-body"><div class="project-meta">${escapeHTML(item.meta || "PROJECT")}</div><div class="project-title"><h3>${escapeHTML(item.title)}</h3>${url ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escapeHTML(item.title)}">↗</a>` : ""}</div><p>${escapeHTML(item.description)}</p><div class="tags">${tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}</div></div></article>`;
        }).join("");
      }
    }
    const contact = saved.contact || {};
    const email = String(contact.email || "sooryavanshibhawishya@gmail.com").trim();
    const message = $("#contact-message");
    const emailButton = $("#contact-email");
    const emailAddress = $("#contact-address");
    if (message && contact.message) message.textContent = contact.message;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const emailPath = encodeURIComponent(email).replace(/%40/gi, "@");
      const mailto = `mailto:${emailPath}?subject=Hello%20Bhawishya`;
      if (emailButton) emailButton.href = mailto;
      if (emailAddress) {
        emailAddress.href = `mailto:${emailPath}`;
        emailAddress.textContent = email;
      }
    }
  }
  try {
    const savedLinks = JSON.parse(localStorage.getItem("bhawishya-social-links") || "null");
    const container = $("#social-links");
    if (container && Array.isArray(savedLinks)) {
      container.innerHTML = savedLinks.map(link => {
        const href = safeLink(link.url || "");
        return link.label && href ? `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)} <span aria-hidden="true">↗</span></a>` : "";
      }).join("");
    }
  } catch (error) {
    console.warn("Could not load locally saved social links.", error);
  }
})();
