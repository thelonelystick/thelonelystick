(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const SUPABASE_URL = "https://lltnosossejymzvddeee.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__mdO3XEbIwSJDnGXyqSlFg_g7TxWpSF";
  const CONTENT_TABLE = "portfolio_content";

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[character]));

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
  const themeToggle = $("#theme-toggle");
  const root = document.documentElement;
  let activeProfilePhotos = [];
  let activeHeroImage = "";
  let theme = localStorage.getItem("bhawishya-theme") ||
    (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");
  function applyTheme(next) {
    theme = next === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    renderProfilePhotos();
    if (!themeToggle) return;
    const light = theme === "light";
    themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    themeToggle.title = light ? "Switch to Solar dark theme" : "Switch to Lunar light theme";
    const icon = $("span:first-child", themeToggle);
    const label = $(".theme-toggle-label", themeToggle);
    if (icon) icon.textContent = light ? "☾" : "☼";
    if (label) label.textContent = light ? "Lunar" : "Solar";
  }
  applyTheme(theme);
  themeToggle?.addEventListener("click", () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("bhawishya-theme", next);
    applyTheme(next);
  });

  const safeImage = value => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  function renderProfilePhotos() {
    const displayStack = $("#home-display-stack");
    const heroVisual = $(".hero-visual");
    const heroImageElement = $("#hero-display-image");
    if (!displayStack || !heroVisual || !heroImageElement) return;
    const photos = activeProfilePhotos
      .filter(photo => {
        if (!photo || photo.visible === false || !safeImage(photo.url)) return false;
        const photoTheme = ["dark", "light"].includes(photo.theme) ? photo.theme : "both";
        return photoTheme === "both" || photoTheme === theme;
      })
      .slice(0, 3);
    displayStack.classList.toggle("is-single", photos.length === 1);
    displayStack.innerHTML = photos.map((photo, index) =>
      `<img class="home-display-photo home-display-photo-${index + 1}" src="${escapeHTML(safeImage(photo.url))}" alt="${escapeHTML(photo.alt || `Home display image ${index + 1}`)}" loading="lazy" decoding="async">`
    ).join("");
    displayStack.hidden = photos.length === 0;
    heroVisual.classList.toggle("has-display-photos", photos.length > 0);
    heroImageElement.hidden = photos.length > 0 || !activeHeroImage;
    if (activeHeroImage && photos.length === 0) {
      heroImageElement.src = activeHeroImage;
      heroVisual.classList.add("has-image");
    } else {
      heroImageElement.removeAttribute("src");
      heroVisual.classList.remove("has-image");
    }
    $$("img", displayStack).forEach(image => image.addEventListener("error", () => {
      console.warn("A home display photo could not be loaded.");
      image.remove();
      const remainingPhotos = $$("img", displayStack);
      heroVisual.classList.toggle("has-display-photos", remainingPhotos.length > 0);
      displayStack.hidden = remainingPhotos.length === 0;
      if (remainingPhotos.length === 0) {
        heroImageElement.hidden = !activeHeroImage;
        if (activeHeroImage) {
          heroImageElement.src = activeHeroImage;
          heroVisual.classList.add("has-image");
        }
      }
    }, {once: true}));
  }
  const safeLink = value => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const defaultArt = kind => ({
    astro: '<div class="planet"></div><div class="planet-ring"></div>',
    scarlet: '<div class="ai-panel"><div class="panel-top"><i></i><i></i><i></i></div><div class="soundwave"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div></div>',
    purpledevs: '<div class="pd-orbit"></div>',
    fuzion: '<div class="edu-card"><span class="edu-star">✳</span><div class="edu-lines"><i></i><i></i><i></i></div></div>'
  }[kind] || '<span class="custom-project-mark"></span>');
  const projectMarkup = (project, index) => {
    const kind = ["astro", "scarlet", "purpledevs", "fuzion"].includes(project.kind) ? project.kind : "custom";
    const image = safeImage(project.image || "");
    const destination = safeLink(project.url || "");
    let domain = "";
    try { domain = destination ? new URL(destination).hostname.replace(/^www\./, "") : "Portfolio preview"; }
    catch { domain = "Portfolio preview"; }
    const tags = Array.isArray(project.tags) ? project.tags : [];
    const art = image
      ? `<img class="project-image" src="${escapeHTML(image)}" alt="${escapeHTML(project.title)} project preview" loading="lazy" decoding="async">`
      : `${defaultArt(kind)}<div class="art-word">${escapeHTML(project.title)}<span>✳</span></div>`;
    const inner = `<div class="browser-bar"><span class="browser-controls" aria-hidden="true"><i></i><i></i><i></i></span><span class="browser-title">${escapeHTML(project.title)}</span><span class="browser-domain">${escapeHTML(domain)}</span></div><div class="project-art ${kind}${image ? " has-screenshot" : ""}"><span class="art-label">${escapeHTML(project.meta || "PROJECT")}</span><span class="art-number">${String(index + 1).padStart(2, "0")}</span>${art}</div><div class="project-body"><div class="project-meta">${escapeHTML(project.meta || "PROJECT")}</div><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description)}</p><div class="tags">${tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}</div></div>`;
    return destination
      ? `<a class="project-card" href="${escapeHTML(destination)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHTML(project.title)} project">${inner}</a>`
      : `<article class="project-card">${inner}</article>`;
  };

  function renderProjects(projects) {
    const visible = projects.filter(project => project.visible !== false);
    const projectGrid = $("#project-grid");
    projectGrid.dataset.count = String(visible.length);
    projectGrid.innerHTML = visible.map(projectMarkup).join("");
    $$(".project-image", projectGrid).forEach(image => image.addEventListener("error", () => {
      console.warn("A project preview image could not be loaded.");
      const art = image.closest(".project-art");
      const card = image.closest(".project-card");
      const kind = ["astro", "scarlet", "purpledevs", "fuzion"].find(name => art.classList.contains(name)) || "custom";
      image.remove();
      art.classList.remove("has-screenshot");
      art.insertAdjacentHTML("beforeend", `${defaultArt(kind)}<div class="art-word">${escapeHTML($("h3", card).textContent)}<span>✳</span></div>`);
    }, {once: true}));
    $("#web-domain-cards").innerHTML = visible.slice(0, 4).map(project => {
      const destination = safeLink(project.url || "");
      const label = `<span class="domain-index">DOMAIN / ${escapeHTML((project.meta || "PROJECT").split(" · ")[0])}</span><strong>${escapeHTML(project.title)}</strong>`;
      return destination
        ? `<a class="web-domain-card" href="${escapeHTML(destination)}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span></a>`
        : `<div class="web-domain-card">${label}</div>`;
    }).join("");
    $$(".project-card").forEach(card => {
      card.addEventListener("pointerenter", () => {
        $$(".project-card.is-raised").forEach(active => active.classList.remove("is-raised"));
        card.classList.add("is-raised");
      });
      card.addEventListener("focusin", () => {
        $$(".project-card.is-raised").forEach(active => active.classList.remove("is-raised"));
        card.classList.add("is-raised");
      });
    });
  }

  function renderRichText(element, value) {
    if (!element) return;
    element.innerHTML = escapeHTML(value || "")
      .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
      .replace(/&lt;span class=&quot;(gold-text|gold|dim)&quot;&gt;/gi, '<span class="$1">')
      .replace(/&lt;\/span&gt;/gi, "</span>");
  }
  function renderCopy(siteCopy = {}) {
    $$("[data-copy]").forEach(element => {
      const value = siteCopy[element.dataset.copy];
      if (["heroTitle", "aboutTitle", "projectsTitle", "learningTitle", "contactTitle"].includes(element.dataset.copy)) {
        renderRichText(element, value);
      } else {
        element.textContent = typeof value === "string" ? value : "";
      }
    });
    const principles = Array.isArray(siteCopy.principles) ? siteCopy.principles : [];
    $("#principles-list").innerHTML = principles.map((principle, index) =>
      `<div><span>${String(index + 1).padStart(2, "0")}</span> ${escapeHTML(principle)}</div>`
    ).join("");
    const groups = Array.isArray(siteCopy.toolGroups) ? siteCopy.toolGroups : [];
    $("#toolkit-list").innerHTML = `${groups.map(group =>
      `<div class="tool-group"><h3>${escapeHTML(group.title || "")}</h3><div class="pills">${(Array.isArray(group.items) ? group.items : []).map(item => `<span>${escapeHTML(item)}</span>`).join("")}</div></div>`
    ).join("")}<div class="learning-note"><span class="gold">✳</span> <span data-copy="learningNote">${escapeHTML(siteCopy.learningNote || "")}</span></div>`;
  }
  function renderContent(saved) {
    const content = saved && typeof saved === "object" ? saved : {};
    activeProfilePhotos = Array.isArray(content.profilePhotos) ? content.profilePhotos : [];
    renderCopy(content.siteCopy || {});
    const heroLead = $("[data-copy='heroLead']");
    if (heroLead) heroLead.textContent = content.siteCopy?.heroLead || "";
    activeHeroImage = safeImage(content.heroImage || "");
    const heroImageElement = $("#hero-display-image");
    heroImageElement.onerror = () => {
      console.warn("The featured homepage image could not be loaded.");
      heroImageElement.hidden = true;
      $(".hero-visual").classList.remove("has-image");
    };
    renderProfilePhotos();

    renderProjects(Array.isArray(content.projects) ? content.projects : []);
    const contact = content.contact && typeof content.contact === "object" ? content.contact : {};
    const email = String(contact.email || "").trim();
    const emailPath = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
    $("#contact-message").textContent = contact.message || "";
    $("#contact-email").href = emailPath ? `mailto:${emailPath}?subject=Hello` : "#";
    $("#contact-address").href = emailPath ? `mailto:${emailPath}` : "#";
    $("#contact-address").textContent = emailPath;
    $("#social-links").innerHTML = (Array.isArray(content.links) ? content.links : []).map(link => {
      const href = safeLink(link.url || "");
      return link.label && href
        ? `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)} <span aria-hidden="true">↗</span></a>`
        : "";
    }).join("");
  }

  function setPageInert(inert) {
    [$(".header"), $("main"), $("footer")].forEach(element => {
      if (element) element.inert = inert;
    });
  }
  const welcome = $("#welcome-entry");
  const reveal = $("#web-reveal");
  let introEntered = false;
  function closeWelcome(destination) {
    welcome.classList.add("is-dismissed");
    welcome.setAttribute("aria-hidden", "true");
    welcome.setAttribute("aria-modal", "false");
    setPageInert(false);
    try { sessionStorage.setItem("portfolio-intro-entered", "1"); }
    catch (error) { console.warn("Could not save the intro preference for this tab.", error); }
    if (destination) {
      window.location.hash = destination;
    } else {
      $(".brand", $(".header"))?.focus();
    }
    setTimeout(() => { welcome.hidden = true; }, window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 500);
  }
  function enterWelcome() {
    if (introEntered) return;
    introEntered = true;
    welcome.classList.add("is-entering");
    welcome.focus();
    $("#entry-enter").disabled = true;
    $("#entry-skip").disabled = true;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const revealNavigation = () => {
      reveal.setAttribute("aria-hidden", "false");
      welcome.classList.add("is-revealed");
      $("#web-continue").focus();
    };
    setTimeout(revealNavigation, reduceMotion ? 0 : 680);
  }
  let alreadyEntered = false;
  try { alreadyEntered = sessionStorage.getItem("portfolio-intro-entered") === "1"; }
  catch (error) { console.warn("Could not read the intro preference for this tab.", error); }
  if (alreadyEntered) {
    welcome.hidden = true;
    welcome.setAttribute("aria-hidden", "true");
  } else {
    setPageInert(true);
    $("#entry-enter").focus();
  }
  $("#entry-enter").addEventListener("click", enterWelcome);
  $("#entry-skip").addEventListener("click", () => closeWelcome());
  $("#web-continue").addEventListener("click", () => closeWelcome());
  $$(".web-node").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    closeWelcome(link.getAttribute("href"));
  }));
  welcome.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeWelcome();
    }
  });

  if (!window.supabase?.createClient) {
    console.error("Supabase client unavailable; portfolio content was not loaded.");
    return;
  }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  void client.from(CONTENT_TABLE).select("content").eq("id", "published").maybeSingle()
    .then(({data, error}) => {
      if (error) throw error;
      if (!data?.content || typeof data.content !== "object") {
        throw new Error("Published portfolio content is missing from the database.");
      }
      renderContent(data.content);
    })
    .catch(error => console.error("Could not load published portfolio content.", error));
})();
