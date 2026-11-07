(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const SUPABASE_URL = "https://lltnosossejymzvddeee.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__mdO3XEbIwSJDnGXyqSlFg_g7TxWpSF";
  const CONTENT_TABLE = "portfolio_content";
  const domainRoute = window.location.pathname.match(/^\/domains\/([a-z0-9][a-z0-9-]*)\/?$/i);
  if (domainRoute) {
    document.documentElement.classList.add("is-domain-route");
    const domainPage = $("#domain-page");
    if (domainPage) {
      domainPage.hidden = false;
      $("#domain-page-content").textContent = "Loading domain…";
    }
  }

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

  const slugify = value => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const domainIcon = icon => ({
    code: "&lt;/&gt;", palette: "◒", feather: "✎", music: "♫",
    video: "▷", "book-open": "▤", trophy: "♜", "shield-check": "⬡"
  }[icon] || "✳");
  function renderDomainPage(web, projects, links) {
    if (!domainRoute) return;
    const slug = domainRoute[1].toLowerCase();
    const domain = (Array.isArray(web?.domains) ? web.domains : []).find(item => item.slug === slug && item.published !== false);
    const page = $("#domain-page-content");
    if (!domain) {
      page.innerHTML = `<h1>Domain not found</h1><p>This domain is unpublished or no longer available.</p>`;
      return;
    }
    document.title = `${domain.title} | thelonelystick`;
    const projectIds = new Set(Array.isArray(domain.featuredProjectIds) ? domain.featuredProjectIds : []);
    const socialIds = new Set(Array.isArray(domain.socialLinkIds) ? domain.socialLinkIds : []);
    const featuredProjects = projects.filter((project, index) =>
      projectIds.has(project.id || `project-${slugify(project.title) || index + 1}`) && project.visible !== false);
    const socialLinks = links.filter((link, index) =>
      socialIds.has(link.id || `social-${slugify(link.label) || index + 1}`));
    const externalUrl = safeLink(domain.url || "");
    const descriptionMeta = $('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = domain.description;
    page.innerHTML = `<span class="kicker">${escapeHTML(domain.themePresetId || domain.icon || "DOMAIN")}</span><h1>${escapeHTML(domain.title)}</h1><p>${escapeHTML(domain.description)}</p>${domain.pageContent ? `<div class="domain-page-copy">${escapeHTML(domain.pageContent)}</div>` : ""}${externalUrl ? `<a class="btn btn-gold" href="${escapeHTML(externalUrl)}" target="_blank" rel="noopener noreferrer">Visit ${escapeHTML(domain.title)} ↗</a>` : ""}${featuredProjects.length ? `<section><h2>Featured projects</h2><ul>${featuredProjects.map(project => `<li><a href="${escapeHTML(safeLink(project.url || "") || "#projects")}">${escapeHTML(project.title)}</a> — ${escapeHTML(project.description)}</li>`).join("")}</ul></section>` : ""}${socialLinks.length ? `<section><h2>Related links</h2><ul>${socialLinks.map(link => `<li><a href="${escapeHTML(safeLink(link.url || ""))}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)}</a></li>`).join("")}</ul></section>` : ""}`;
  }

  function renderOrganicWeb(web, projects, links) {
    const section = $("#web");
    const domains = Array.isArray(web?.domains)
      ? web.domains.filter(domain => domain && domain.published !== false && domain.hidden !== true)
        .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
      : [];
    section.hidden = web?.enabled === false || domains.length === 0;
    $("#web-title").textContent = web?.sectionTitle || "Welcome to my web";
    $("#web-subtitle").textContent = web?.sectionSubtitle || "";
    const canvas = $("#organic-web-canvas");
    const cards = $("#organic-web-domains");
    const list = $("#domain-accessible-list");
    if (section.hidden) {
      cards.replaceChildren();
      list.replaceChildren();
      $("#organic-web-threads").replaceChildren();
      renderDomainPage(web, projects, links);
      return;
    }
    cards.innerHTML = domains.map((domain, index) => {
      const x = Math.max(8, Math.min(92, Number(domain.position?.x) || 50));
      const y = Math.max(10, Math.min(90, Number(domain.position?.y) || 50));
      const path = `/domains/${encodeURIComponent(domain.slug)}`;
      const duration = Math.max(5, Math.min(14, 5 + Number(domain.threadLength || 60) / 10));
      return `<a class="organic-domain-card" href="${escapeHTML(path)}" style="--domain-x:${x}%;--domain-y:${y}%;--suspension-duration:${duration}s;--sway-delay:${(index % 6) * -.55}s" aria-label="Explore ${escapeHTML(domain.title)}: ${escapeHTML(domain.description)}"><span class="domain-attachment" aria-hidden="true"></span><span class="domain-icon" aria-hidden="true">${domainIcon(domain.icon)}</span><strong>${escapeHTML(domain.title)}</strong><span class="domain-description">${escapeHTML(domain.description)}</span><span class="domain-open" aria-hidden="true">Explore ↗</span></a>`;
    }).join("");
    list.innerHTML = domains.map(domain =>
      `<li><a href="${escapeHTML(`/domains/${encodeURIComponent(domain.slug)}`)}"><strong>${escapeHTML(domain.title)}</strong><span>${escapeHTML(domain.description)}</span></a></li>`
    ).join("");
    const point = domain => ({
      x: (Math.max(8, Math.min(92, Number(domain.position?.x) || 50)) * 10),
      y: (Math.max(10, Math.min(90, Number(domain.position?.y) || 50)) * 7) - 48
    });
    const paths = domains.map(domain => {
      const end = point(domain);
      const bend = Math.max(18, Math.min(100, Number(domain.threadLength) || 60));
      const controlX = (500 + end.x) / 2 + (end.x - 500) * .1;
      const controlY = (350 + end.y) / 2 - bend * .7;
      return `<path class="domain-thread" d="M500 350 Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}"/>`;
    });
    const byId = new Map(domains.map(domain => [domain.id, domain]));
    const connections = Array.isArray(web.connections) ? web.connections : [];
    connections.forEach(connection => {
      const from = byId.get(connection.from);
      const to = byId.get(connection.to);
      if (!from || !to || from.id === to.id) return;
      const a = point(from);
      const b = point(to);
      const bend = ((Number(from.threadLength) || 60) + (Number(to.threadLength) || 60)) / 2;
      paths.push(`<path class="domain-connection" d="M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((a.x + b.x) / 2).toFixed(1)} ${((a.y + b.y) / 2 - bend * .2).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}"/>`);
    });
    $("#organic-web-threads").innerHTML = paths.join("");
    canvas.style.setProperty("--domain-count", domains.length);
    renderDomainPage(web, projects, links);
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
    renderOrganicWeb(content.web || {}, Array.isArray(content.projects) ? content.projects : [], Array.isArray(content.links) ? content.links : []);
    const contact = content.contact && typeof content.contact === "object" ? content.contact : {};
    const email = String(contact.email || "").trim();
    const emailPath = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
    $("#contact-message").textContent = contact.message || "";
    $("#contact-email").href = emailPath ? `mailto:${emailPath}?subject=Hello` : "#";
    $("#contact-address").href = emailPath ? `mailto:${emailPath}` : "#";
    $("#contact-address").textContent = emailPath;
    const whatsapp = $("#contact-whatsapp");
    const whatsappNumber = String(contact.whatsapp || "").trim();
    const whatsappDigits = whatsappNumber.replace(/\D/g, "");
    const whatsappLinkNumber = whatsappDigits.length === 10 ? `91${whatsappDigits}` : whatsappDigits;
    whatsapp.hidden = !/^\d{11,15}$/.test(whatsappLinkNumber);
    whatsapp.href = whatsapp.hidden ? "#" : `https://wa.me/${whatsappLinkNumber}`;
    $("#social-links").innerHTML = (Array.isArray(content.links) ? content.links : []).map(link => {
      const href = safeLink(link.url || "");
      return link.label && href
        ? `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)} <span aria-hidden="true">↗</span></a>`
        : "";
    }).join("");
  }

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
