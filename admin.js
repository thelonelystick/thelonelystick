(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const SUPABASE_URL = "https://lltnosossejymzvddeee.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__mdO3XEbIwSJDnGXyqSlFg_g7TxWpSF";
  const ADMIN_EMAIL = "sooryavanshibhawishya@gmail.com";
  const ADMIN_REDIRECT_URL = "https://thelonelystick.vercel.app/admin";
  const BUCKET = "portfolio-media";
  const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
  const slugify = value => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const DOMAIN_SEEDS = [
    ["tech", "Tech", "Software, development, digital products, and technical experiments.", "code", 20, 22, 65],
    ["art", "Art", "Visual art, illustrations, design, and creative experiments.", "palette", 76, 20, 72],
    ["poet", "Poet", "Poetry, reflections, words, and original writing.", "feather", 49, 43, 58],
    ["music", "Music", "Music, sound, compositions, and audio experiments.", "music", 15, 67, 70],
    ["vlog", "Vlog", "Personal videos, adventures, experiences, and everyday stories.", "video", 83, 66, 75],
    ["edu", "Edu", "Educational content, explanations, tutorials, and learning resources.", "book-open", 35, 81, 62],
    ["sport", "Sport", "Sports, fitness, training, activities, and personal progress.", "trophy", 67, 84, 68],
    ["cyber", "Cyber", "Cybersecurity, ethical hacking, digital safety, and security research.", "shield-check", 51, 59, 64]
  ];
  const makeDefaultThemePresets = () => [
    {id: "solar", name: "Solar", backgroundColor: "#242424", surfaceColor: "#2d2d2d", textColor: "#e8c76d", mutedColor: "#c0b17e", accentColor: "#e4c15f", borderColor: "#6e6040", headingFont: "Manrope", bodyFont: "DM Sans", backgroundMotif: "grain", cardAppearance: "solid", transitionStyle: "silk", hoverBehavior: "lift", audioTrack: ""},
    {id: "lunar", name: "Lunar", backgroundColor: "#f0eafa", surfaceColor: "#faf7ff", textColor: "#39275b", mutedColor: "#665580", accentColor: "#6b45a6", borderColor: "#9677bd", headingFont: "Manrope", bodyFont: "DM Sans", backgroundMotif: "none", cardAppearance: "glass", transitionStyle: "fade", hoverBehavior: "glow", audioTrack: ""}
  ];
  const makeDefaultWeb = (published = true) => {
    const now = new Date().toISOString();
    return {
      enabled: true,
      sectionTitle: "Welcome to my web",
      sectionSubtitle: "Eight worlds. One mind. Explore what I create.",
      domains: DOMAIN_SEEDS.map(([id, title, description, icon, x, y, threadLength], index) => ({
        id, slug: id, title, description, icon, published, hidden: false, displayOrder: index + 1,
        themePresetId: "solar", position: {x, y}, threadLength, pagePath: `/domains/${id}`,
        pageContent: "", url: "", featuredProjectIds: [], socialLinkIds: [], articles: [], media: [], createdAt: now, updatedAt: now
      })),
      connections: [],
      themePresets: makeDefaultThemePresets()
    };
  };
  const normalizeConnection = connection => ({
    ...connection,
    from: String(connection?.from || ""),
    to: String(connection?.to || ""),
    curvature: Number.isFinite(Number(connection?.curvature)) ? Number(connection.curvature) : 0,
    opacity: Number.isFinite(Number(connection?.opacity)) ? Number(connection.opacity) : 0.28,
    width: Number.isFinite(Number(connection?.width)) ? Number(connection.width) : 1,
    visible: connection?.visible !== false,
    animated: connection?.animated === true
  });
  function normalizeWeb(savedWeb) {
    if (!savedWeb || typeof savedWeb !== "object") return makeDefaultWeb(true);
    const now = new Date().toISOString();
    const savedDomains = Array.isArray(savedWeb.domains) ? savedWeb.domains : [];
    const domains = savedDomains.map((savedDomain, index) => {
      const domain = savedDomain && typeof savedDomain === "object" ? savedDomain : {};
      const slug = typeof domain.slug === "string" ? domain.slug : slugify(domain.title) || `domain-${index + 1}`;
      const coordinate = value => value !== null && value !== "" && Number.isFinite(Number(value)) ? Number(value) : 50;
      return {
        ...domain,
        id: typeof domain.id === "string" ? domain.id : `domain-${slugify(slug || domain.title) || index + 1}`,
        slug,
        title: typeof domain.title === "string" ? domain.title : "Untitled domain",
        description: typeof domain.description === "string" ? domain.description : "",
        icon: typeof domain.icon === "string" ? domain.icon : "code",
        published: domain.published !== false,
        hidden: domain.hidden === true,
        displayOrder: domain.displayOrder !== null && domain.displayOrder !== "" && Number.isInteger(Number(domain.displayOrder)) ? Number(domain.displayOrder) : index + 1,
        themePresetId: typeof domain.themePresetId === "string" ? domain.themePresetId : "solar",
        position: {x: coordinate(domain.position?.x), y: coordinate(domain.position?.y)},
        threadLength: domain.threadLength !== null && domain.threadLength !== "" && Number.isFinite(Number(domain.threadLength)) ? Number(domain.threadLength) : 65,
        pagePath: typeof domain.pagePath === "string" ? domain.pagePath : `/domains/${slug}`,
        pageContent: typeof domain.pageContent === "string" ? domain.pageContent : "",
        url: typeof domain.url === "string" ? domain.url : "",
        featuredProjectIds: Array.isArray(domain.featuredProjectIds) ? domain.featuredProjectIds : [],
        socialLinkIds: Array.isArray(domain.socialLinkIds) ? domain.socialLinkIds : [],
        articles: Array.isArray(domain.articles) ? domain.articles : [],
        media: Array.isArray(domain.media) ? domain.media : [],
        createdAt: domain.createdAt || now,
        updatedAt: domain.updatedAt || now
      };
    });
    const byId = new Set(domains.map(domain => domain.id));
    const legacy = [];
    savedDomains.forEach((savedDomain, index) => {
      const domain = savedDomain && typeof savedDomain === "object" ? savedDomain : {};
      (Array.isArray(domain.connections) ? domain.connections : []).forEach(otherId => {
        legacy.push({from: domains[index].id, to: typeof otherId === "string" ? otherId : otherId?.to});
      });
    });
    const allConnections = [
      ...(Array.isArray(savedWeb.connections) ? savedWeb.connections : []),
      ...legacy
    ].map(normalizeConnection);
    const seen = new Set();
    const connections = allConnections.filter(edge => {
      if (!edge.from || !edge.to || edge.from === edge.to || !byId.has(edge.from) || !byId.has(edge.to)) return false;
      const key = [edge.from, edge.to].sort().join("\u0000");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const themePresets = Array.isArray(savedWeb.themePresets) && savedWeb.themePresets.some(preset => preset && typeof preset === "object")
      ? savedWeb.themePresets.filter(preset => preset && typeof preset === "object")
      : makeDefaultThemePresets();
    const presetIds = new Set(themePresets.map(preset => preset.id));
    return {
      ...savedWeb,
      enabled: savedWeb.enabled !== false,
      sectionTitle: typeof savedWeb.sectionTitle === "string" ? savedWeb.sectionTitle : "Welcome to my web",
      sectionSubtitle: typeof savedWeb.sectionSubtitle === "string" ? savedWeb.sectionSubtitle : "",
      domains: domains.map(domain => {
        const {connections: legacyConnections, ...cleanDomain} = domain;
        return {...cleanDomain, themePresetId: presetIds.has(domain.themePresetId) ? domain.themePresetId : themePresets[0]?.id || ""};
      }),
      connections,
      themePresets
    };
  }
  let content = {
    siteCopy: {},
    heroImage: "",
    profilePhotos: [],
    contact: {email: "", message: "", whatsapp: ""},
    web: makeDefaultWeb(),
    links: [],
    projects: []
  };
  let links = [];
  let authClient;
  let contentLoaded = false;
  let loadingContent;
  let hasSavedWebRecord = false;
  let webDraftConnections = [];
  let themePresetDrafts = [];

  const esc = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[character]));
  const isWebUrl = value => {
    try { return ["http:", "https:"].includes(new URL(value).protocol); }
    catch { return false; }
  };
  const toast = message => {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("show");
    setTimeout(() => element.classList.remove("show"), 2400);
  };
  const setStatus = (selector, message, error = false) => {
    const element = $(selector);
    element.textContent = message;
    element.classList.toggle("error", error);
  };
  const names = {
    overview: ["Overview", "Good to see you."],
    homepage: ["Homepage content", "Shape your introduction."],
    projects: ["Projects & domains", "Keep your work up to date."],
    "web-domains": ["Web Domains", "Shape your organic web."],
    media: ["Media library", "Manage your profile photos."],
    contact: ["Contact details", "Make it easy to reach you."],
    appearance: ["Appearance", "Set the mood."],
    links: ["Social links", "Connect your worlds."],
    inbox: ["Contact inbox", "Messages and enquiries."]
  };
  function view(name) {
    if (!names[name]) return;
    $$(".view").forEach(element => element.classList.toggle("active", element.id === `view-${name}`));
    $$(".side-link").forEach(element => element.classList.toggle("active", element.dataset.view === name));
    $("#crumb").textContent = names[name][0];
    $("#page-title").textContent = names[name][1];
    $("#sidebar").classList.remove("open");
  }
  $$(".side-link").forEach(button => button.addEventListener("click", () => view(button.dataset.view)));
  $$("[data-go]").forEach(button => button.addEventListener("click", () => view(button.dataset.go)));
  $("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

  async function loadPublishedContent() {
    if (loadingContent) return loadingContent;
    loadingContent = (async () => {
      setStatus("#content-backend-status", "Loading published content…");
      const {data, error} = await authClient.from("portfolio_content")
        .select("content").eq("id", "published").maybeSingle();
      if (error) {
        const setupError = ["PGRST205", "42P01"].includes(error.code)
          ? "Portfolio database table is missing. Run all SQL migrations in supabase/migrations, then reload this page."
          : error.code === "42501"
            ? "Supabase denied access to portfolio content. Check the migration's read/write policies and your admin account."
            : `Could not load published content: ${error.message}`;
        throw new Error(setupError);
      }
      if (!data?.content || typeof data.content !== "object") {
        throw new Error("Published portfolio content is missing. Run the Supabase portfolio migrations before editing.");
      }
      const saved = data?.content && typeof data.content === "object" ? data.content : {};
      hasSavedWebRecord = !!saved.web && typeof saved.web === "object";
      if (!saved.siteCopy || typeof saved.siteCopy !== "object" ||
          !("heroTitle" in saved.siteCopy) || !("heroLead" in saved.siteCopy)) {
        throw new Error("Database page copy is missing. Run 20261108022000_portfolio_site_copy.sql, then reload this page.");
      }
      content = {
        ...saved,
        siteCopy: saved.siteCopy && typeof saved.siteCopy === "object" ? saved.siteCopy : {},
        heroImage: typeof saved.heroImage === "string" ? saved.heroImage : "",
        contact: saved.contact && typeof saved.contact === "object" ? saved.contact : {email: "", message: "", whatsapp: ""},
        profilePhotos: Array.isArray(saved.profilePhotos) ? saved.profilePhotos.slice(0, 6) : [],
        links: (Array.isArray(saved.links) ? saved.links : []).map((link, index) => ({
          ...link, id: link.id || `social-${slugify(link.label) || index + 1}`
        })),
        projects: (Array.isArray(saved.projects) ? saved.projects : []).map((project, index) => ({
          ...project, id: project.id || `project-${slugify(project.title) || index + 1}`
        })),
        web: normalizeWeb(saved.web)
      };
      webDraftConnections = structuredClone(content.web.connections);
      themePresetDrafts = structuredClone(content.web.themePresets);
      links = content.links;
      contentLoaded = true;
      renderHome();
      renderProjects();
      renderContact();
      renderLinks();
      renderProfilePhotos();
      renderDomains();
      if (!hasSavedWebRecord) {
        setStatus("#domain-publish-status", "No published web configuration exists; the initial eight domains are staged as a draft. Publish domains to make them live.");
      }
      $("#owner-email").textContent = ADMIN_EMAIL;
      setStatus("#content-backend-status", "Connected · Published content");
      return content;
    })();
    try { return await loadingContent; }
    catch (error) {
      loadingContent = null;
      setStatus("#content-backend-status", error.message, true);
      throw error;
    }
  }
  async function publishContent(includeWebDraft = false) {
    if (!contentLoaded) throw new Error("Published content is not loaded. Check the Supabase connection and retry.");
    const savedContent = {...content};
    if (!hasSavedWebRecord && !includeWebDraft) delete savedContent.web;
    const {error} = await authClient.from("portfolio_content").upsert({
      id: "published",
      content: savedContent,
      updated_at: new Date().toISOString()
    }, {onConflict: "id"});
    if (error) throw new Error(`Could not publish content: ${error.message}`);
    if (includeWebDraft) hasSavedWebRecord = true;
    setStatus("#content-backend-status", "Connected · Changes published");
  }
  async function uploadImage(file, folder) {
    if (!file || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      throw new Error("Choose a JPEG, PNG, WebP, or GIF image.");
    }
    if (file.size > MAX_IMAGE_BYTES) throw new Error("Images must be 8 MB or smaller.");
    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const {error} = await authClient.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false
    });
    if (error) throw new Error(`Could not upload image: ${error.message}`);
    const {data} = authClient.storage.from(BUCKET).getPublicUrl(path);
    return {path, url: data.publicUrl};
  }
  async function deleteUploadedImages(paths) {
    const uniquePaths = [...new Set(paths.filter(Boolean))];
    if (!uniquePaths.length) return;
    const {error} = await authClient.storage.from(BUCKET).remove(uniquePaths);
    if (error) throw new Error(`Published, but could not remove old media: ${error.message}`);
  }

  function renderHome() {
    $("#hero-title").value = content.siteCopy?.heroTitle || "";
    $("#hero-lead").value = content.siteCopy?.heroLead || "";
    $("#hero-image-url").value = content.heroImage || "";
    const preview = $("#hero-image-preview");
    preview.src = content.heroImage || "";
    preview.hidden = !content.heroImage;
  }
  $("#homepage-form").addEventListener("submit", async event => {
    event.preventDefault();
    const image = $("#hero-image-url").value.trim();
    if (image && !isWebUrl(image)) {
      setStatus("#homepage-status", "Enter a valid http(s) image URL.", true);
      return;
    }
    const previous = structuredClone(content);
    content.siteCopy = {
      ...(content.siteCopy || {}),
      heroTitle: $("#hero-title").value.trim(),
      heroLead: $("#hero-lead").value.trim()
    };
    content.heroImage = image;
    try {
      await publishContent();
      setStatus("#homepage-status", "Homepage changes published.");
      toast("Homepage published");
    } catch (error) {
      content = previous;
      setStatus("#homepage-status", error.message, true);
    }
  });
  $("#reset-homepage").addEventListener("click", () => {
    $("#hero-title").value = "";
    $("#hero-lead").value = "";
  });
  $("#clear-hero-image").addEventListener("click", () => {
    $("#hero-image-url").value = "";
    $("#hero-image-preview").hidden = true;
  });
  $("#hero-image-url").addEventListener("input", () => {
    const preview = $("#hero-image-preview");
    preview.src = $("#hero-image-url").value.trim();
    preview.hidden = !preview.src;
  });

  function projectDrafts() {
    return $$(".project-edit").map(row => ({
      id: row.dataset.projectId || "",
      title: $("[data-title]", row).value.trim(),
      description: $("[data-description]", row).value.trim(),
      meta: $("[data-meta]", row).value.trim(),
      tags: $("[data-tags]", row).value.split(",").map(tag => tag.trim()).filter(Boolean),
      url: $("[data-project-url]", row).value.trim(),
      image: $("[data-project-image]", row).value.trim(),
      imagePath: row.dataset.imagePath || "",
      kind: $("[data-kind]", row).value,
      visible: $("[data-visible]", row).checked
    }));
  }
  function renderProjects() {
    $("#project-editor-list").innerHTML = content.projects.map((project, index) => {
      const tags = Array.isArray(project.tags) ? project.tags.join(", ") : "";
      return `<article class="project-edit" data-project-id="${esc(project.id || "")}" data-image-path="${esc(project.imagePath || "")}">
        <div class="project-edit-head"><span>Project ${String(index + 1).padStart(2, "0")}</span><div class="card-order">
          <button type="button" class="order-card" data-move="-1" aria-label="Move ${esc(project.title)} up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="order-card" data-move="1" aria-label="Move ${esc(project.title)} down" ${index === content.projects.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="remove-card" data-remove-card aria-label="Remove ${esc(project.title)}">Remove ×</button>
        </div></div>
        <label for="project-title-${index}">Project title</label><input id="project-title-${index}" data-title maxlength="90" value="${esc(project.title)}" required>
        <label for="project-description-${index}">Summary</label><textarea id="project-description-${index}" data-description rows="3" maxlength="500" required>${esc(project.description)}</textarea>
        <label for="project-meta-${index}">Category</label><input id="project-meta-${index}" data-meta maxlength="80" value="${esc(project.meta || "")}">
        <label for="project-tags-${index}">Tags (comma-separated)</label><input id="project-tags-${index}" data-tags maxlength="180" value="${esc(tags)}">
        <label for="project-url-${index}">Destination URL</label><input id="project-url-${index}" data-project-url type="url" value="${esc(project.url || "")}" placeholder="https://example.com">
        <label for="project-image-${index}">Preview image URL</label><input id="project-image-${index}" data-project-image type="url" value="${esc(project.image || "")}" placeholder="https://example.com/preview.jpg">
        <img class="project-editor-preview" src="${esc(project.image || "")}" alt="${esc(project.title)} screenshot preview" ${project.image ? "" : "hidden"}>
        <label for="project-screenshot-${index}">Upload a project screenshot</label><input id="project-screenshot-${index}" data-screenshot type="file" accept="image/jpeg,image/png,image/webp,image/gif">
        <label class="visibility-control"><input data-visible type="checkbox" ${project.visible === false ? "" : "checked"}> Show this project on the homepage</label>
        <input data-kind type="hidden" value="${esc(project.kind || "custom")}">
      </article>`;
    }).join("");
    $("#project-count").textContent = String(content.projects.length).padStart(2, "0");
  }
  async function saveProjects(projects) {
    if (projects.some(project => !project.title || !project.description)) {
      setStatus("#projects-status", "Every project needs a title and summary.", true);
      return;
    }
    if (projects.some(project => project.url && !isWebUrl(project.url)) ||
        projects.some(project => project.image && !isWebUrl(project.image))) {
      setStatus("#projects-status", "Project links and preview images must use valid http(s) URLs.", true);
      return;
    }
    const previous = content.projects;
    const previousPaths = previous.map(project => project.imagePath).filter(Boolean);
    const previousWeb = content.web;
    const validIds = new Set(projects.map(projectReferenceId));
    content.projects = projects;
    content.web = {
      ...content.web,
      domains: content.web.domains.map(domain => ({
        ...domain,
        featuredProjectIds: (domain.featuredProjectIds || []).filter(id => validIds.has(id))
      }))
    };
    try {
      await publishContent();
      renderProjects();
      const currentPaths = new Set(projects.map(project => project.imagePath).filter(Boolean));
      const obsoletePaths = previousPaths.filter(path => !currentPaths.has(path));
      if (obsoletePaths.length) {
        try {
          await deleteUploadedImages(obsoletePaths);
        } catch (error) {
          setStatus("#projects-status", `Project changes published, but screenshot cleanup failed: ${error.message}`, true);
          return;
        }
      }
      setStatus("#projects-status", "Project changes published.");
      toast("Projects published");
    } catch (error) {
      content.projects = previous;
      content.web = previousWeb;
      setStatus("#projects-status", error.message, true);
    }
  }
  $("#save-projects").addEventListener("click", () => saveProjects(projectDrafts()));
  $("#add-project").addEventListener("click", () => {
    const projects = projectDrafts();
    projects.push({id: `project-${crypto.randomUUID()}`, title: "New project", description: "Add a short project summary.", meta: "PROJECT", tags: [], url: "", image: "", imagePath: "", kind: "custom", visible: true});
    renderProjectsWith(projects);
  });
  function renderProjectsWith(projects) {
    const previous = content.projects;
    content.projects = projects;
    renderProjects();
    content.projects = previous;
  }
  $("#project-editor-list").addEventListener("click", event => {
    const row = event.target.closest(".project-edit");
    if (!row) return;
    const projects = projectDrafts();
    const index = [...row.parentElement.children].indexOf(row);
    if (event.target.closest("[data-remove-card]")) projects.splice(index, 1);
    else if (event.target.closest("[data-move]")) {
      const next = index + Number(event.target.closest("[data-move]").dataset.move);
      if (next < 0 || next >= projects.length) return;
      [projects[index], projects[next]] = [projects[next], projects[index]];
    } else return;
    renderProjectsWith(projects);
  });
  $("#project-editor-list").addEventListener("change", async event => {
    const imageField = event.target.closest("[data-project-image]");
    if (imageField) {
      const preview = $(".project-editor-preview", imageField.closest(".project-edit"));
      preview.src = imageField.value;
      preview.hidden = !imageField.value;
      return;
    }
    const input = event.target.closest("[data-screenshot]");
    if (!input || !input.files?.[0]) return;
    const row = input.closest(".project-edit");
    const screenshotField = $("[data-project-image]", row);
    try {
      const uploaded = await uploadImage(input.files[0], "projects");
      screenshotField.value = uploaded.url;
      const preview = $(".project-editor-preview", row);
      preview.src = uploaded.url;
      preview.hidden = false;
      row.dataset.imagePath = uploaded.path;
      setStatus("#projects-status", "Screenshot uploaded. Publish project cards to apply it.");
    } catch (error) {
      setStatus("#projects-status", error.message, true);
    }
    input.value = "";
  });

  const projectReferenceId = (project, index) => project.id || `project-${slugify(project.title) || index + 1}`;
  const socialReferenceId = (link, index) => link.id || `social-${slugify(link.label) || index + 1}`;
  const selectedValues = select => [...select.selectedOptions].map(option => option.value);
  function renderDomains(domains) {
    if (!domains) {
      $("#web-enabled").checked = content.web.enabled !== false;
      $("#web-section-title").value = content.web.sectionTitle || "";
      $("#web-section-subtitle").value = content.web.sectionSubtitle || "";
      domains = content.web.domains || [];
    }
    $("#domain-editor-list").innerHTML = domains.map((domain, index) => {
      const position = domain.position || {x: 50, y: 50};
      const featuredProjectIds = Array.isArray(domain.featuredProjectIds) ? domain.featuredProjectIds : [];
      const socialLinkIds = Array.isArray(domain.socialLinkIds) ? domain.socialLinkIds : [];
      const projectOptions = content.projects.map((project, projectIndex) => {
        const id = projectReferenceId(project, projectIndex);
        return `<option value="${esc(id)}" ${featuredProjectIds.includes(id) ? "selected" : ""}>${esc(project.title)}</option>`;
      }).join("");
      const socialOptions = content.links.map((link, linkIndex) => {
        const id = socialReferenceId(link, linkIndex);
        return `<option value="${esc(id)}" ${socialLinkIds.includes(id) ? "selected" : ""}>${esc(link.label)}</option>`;
      }).join("");
      const themeOptions = themePresetDrafts.map(preset =>
        `<option value="${esc(preset.id)}" ${domain.themePresetId === preset.id ? "selected" : ""}>${esc(preset.name)}</option>`).join("");
      return `<article class="domain-edit" data-domain-id="${esc(domain.id)}">
        <header class="domain-edit-head"><div><span class="eyebrow">DOMAIN ${String(index + 1).padStart(2, "0")} / ${esc(domain.id)}</span><strong>${esc(domain.title || "Untitled domain")}</strong></div><div class="card-order">
          <button type="button" class="order-card" data-domain-move="-1" aria-label="Move ${esc(domain.title)} up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="order-card" data-domain-move="1" aria-label="Move ${esc(domain.title)} down" ${index === domains.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="button secondary" data-domain-duplicate>Duplicate</button>
          <button type="button" class="remove-card" data-domain-remove>Remove</button>
        </div></header>
        <div class="domain-fields">
          <label>Stable ID<input data-domain-id-value value="${esc(domain.id)}" readonly aria-readonly="true"></label>
          <label>URL slug<input data-domain-slug value="${esc(domain.slug)}" required></label>
          <label>Title<input data-domain-title value="${esc(domain.title)}" maxlength="50" required></label>
          <label>Icon<input data-domain-icon value="${esc(domain.icon || "code")}" maxlength="30" required></label>
          <label class="domain-field-wide">Description<textarea data-domain-description rows="2" maxlength="240" required>${esc(domain.description)}</textarea></label>
          <label class="domain-field-wide">Domain page content<textarea data-domain-page-content rows="4" maxlength="3000" placeholder="Optional additional text for this domain page.">${esc(domain.pageContent || "")}</textarea></label>
          <label class="domain-field-wide">Dedicated page path<input data-domain-path value="${esc(domain.pagePath || `/domains/${domain.slug}`)}" required></label>
          <label>External URL<input data-domain-url type="url" value="${esc(domain.url || "")}" placeholder="https://example.com"></label>
          <label>Theme preset<select data-domain-theme>${themeOptions}</select></label>
          <label>Display order<input data-domain-order type="number" min="1" step="1" value="${Number(domain.displayOrder) || index + 1}" required></label>
          <label>Position X (0-100)<input data-domain-x type="number" min="0" max="100" step="1" value="${Number(position.x)}" required></label>
          <label>Position Y (0-100)<input data-domain-y type="number" min="0" max="100" step="1" value="${Number(position.y)}" required></label>
          <label>Thread length (20-180)<input data-domain-thread type="number" min="20" max="180" step="1" value="${Number(domain.threadLength) || 65}" required></label>
          <label class="visibility-control"><input data-domain-published type="checkbox" ${domain.published === false ? "" : "checked"}> Published</label>
          <label class="visibility-control"><input data-domain-hidden type="checkbox" ${domain.hidden === true ? "checked" : ""}> Hide from public web</label>
          <label>Featured projects<select data-domain-projects multiple size="4">${projectOptions}</select></label>
          <label>Social links<select data-domain-social multiple size="4">${socialOptions}</select></label>
        </div>
        <div class="domain-previews"><span>Preview this domain</span><div><article data-preview-theme="dark"><b>Solar</b><strong>${esc(domain.title)}</strong><small>${esc(domain.description)}</small></article><article data-preview-theme="light"><b>Lunar</b><strong>${esc(domain.title)}</strong><small>${esc(domain.description)}</small></article></div></div>
      </article>`;
    }).join("");
    renderConnectionEditor(domains);
    renderThemePresets();
    updateDomainPreview(domains);
  }
  function readDomainDrafts() {
    return $$(".domain-edit").map(row => {
      const choose = selector => selectedValues($(selector, row));
      return {
        ...content.web.domains.find(domain => domain.id === row.dataset.domainId),
        id: $("[data-domain-id-value]", row).value.trim(),
        slug: $("[data-domain-slug]", row).value.trim().toLowerCase(),
        title: $("[data-domain-title]", row).value.trim(),
        description: $("[data-domain-description]", row).value.trim(),
        pageContent: $("[data-domain-page-content]", row).value.trim(),
        icon: $("[data-domain-icon]", row).value.trim(),
        pagePath: $("[data-domain-path]", row).value.trim(),
        url: $("[data-domain-url]", row).value.trim(),
        themePresetId: $("[data-domain-theme]", row).value,
        displayOrder: Number($("[data-domain-order]", row).value),
        position: {x: Number($("[data-domain-x]", row).value), y: Number($("[data-domain-y]", row).value)},
        threadLength: Number($("[data-domain-thread]", row).value),
        published: $("[data-domain-published]", row).checked,
        hidden: $("[data-domain-hidden]", row).checked,
        featuredProjectIds: choose("[data-domain-projects]"),
        socialLinkIds: choose("[data-domain-social]")
      };
    });
  }
  let selectedDomainId = "";
  function renderConnectionEditor(domains = readDomainDrafts()) {
    const options = domains.map(domain => `<option value="${esc(domain.id)}">${esc(domain.title || domain.id)}</option>`).join("");
    $("#connection-from").innerHTML = options;
    $("#connection-to").innerHTML = options;
    $("#connection-editor-list").innerHTML = webDraftConnections.map((edge, index) => {
      const from = domains.find(domain => domain.id === edge.from)?.title || edge.from;
      const to = domains.find(domain => domain.id === edge.to)?.title || edge.to;
      return `<article class="connection-edit" data-edge-index="${index}">
        <strong>${esc(from)} ↔ ${esc(to)}</strong>
        <label>Curvature<input data-edge-field="curvature" type="number" min="-180" max="180" step="1" value="${Number(edge.curvature) || 0}"></label>
        <label>Opacity<input data-edge-field="opacity" type="number" min="0" max="1" step="0.05" value="${Number(edge.opacity ?? 0.28)}"></label>
        <label>Width<input data-edge-field="width" type="number" min="0.4" max="4" step="0.1" value="${Number(edge.width) || 1}"></label>
        <label class="visibility-control"><input data-edge-field="visible" type="checkbox" ${edge.visible === false ? "" : "checked"}> Visible</label>
        <label class="visibility-control"><input data-edge-field="animated" type="checkbox" ${edge.animated === true ? "checked" : ""}> Animate</label>
        <button type="button" class="remove-card" data-edge-remove>Remove strand</button>
      </article>`;
    }).join("");
  }
  function renderThemePresets() {
    const fonts = ["Manrope", "DM Sans", "Georgia", "Arial", "system-ui"];
    $("#theme-preset-editor").innerHTML = themePresetDrafts.map((preset, index) =>
      `<article class="theme-preset-edit" data-preset-index="${index}">
        <header><strong>${esc(preset.name || "Untitled preset")}</strong><button type="button" class="remove-card" data-preset-remove>Remove preset</button></header>
        <div class="preset-fields">
          <label>Preset ID<input data-preset-field="id" value="${esc(preset.id)}" readonly></label>
          <label>Name<input data-preset-field="name" maxlength="50" value="${esc(preset.name || "")}" required></label>
          ${[["backgroundColor","Background"],["surfaceColor","Surface"],["textColor","Main text"],["mutedColor","Muted text"],["accentColor","Accent"],["borderColor","Border"]].map(([key,label]) =>
            `<label>${label}<input data-preset-field="${key}" type="color" value="${esc(preset[key] || "#777777")}"></label>`).join("")}
          <label>Heading font<select data-preset-field="headingFont">${fonts.map(font => `<option ${preset.headingFont === font ? "selected" : ""}>${font}</option>`).join("")}</select></label>
          <label>Body font<select data-preset-field="bodyFont">${fonts.map(font => `<option ${preset.bodyFont === font ? "selected" : ""}>${font}</option>`).join("")}</select></label>
          <label>Background motif<select data-preset-field="backgroundMotif">${["none","grain","grid","dots"].map(value => `<option ${preset.backgroundMotif === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
          <label>Card appearance<select data-preset-field="cardAppearance">${["solid","glass","outline"].map(value => `<option ${preset.cardAppearance === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
          <label>Transition style<select data-preset-field="transitionStyle">${["silk","fade","none"].map(value => `<option ${preset.transitionStyle === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
          <label>Hover behavior<select data-preset-field="hoverBehavior">${["lift","glow","none"].map(value => `<option ${preset.hoverBehavior === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
          <label class="domain-field-wide">Optional approved audio URL<input data-preset-field="audioTrack" type="url" value="${esc(preset.audioTrack || "")}" placeholder="https://example.com/approved-track.mp3"></label>
        </div>
      </article>`
    ).join("");
  }
  function updateDomainPreview(domains = readDomainDrafts()) {
    const stage = $("#domain-preview-theme");
    const canvas = $("#admin-organic-web-canvas");
    const previewDomains = domains.map(domain => ({...domain, published: true}));
    WebRenderer.render({
      canvas,
      svg: $("#admin-organic-web-threads"),
      cards: $("#admin-organic-web-domains"),
      list: $("#admin-domain-preview-list"),
      accessibleListId: "admin-domain-preview-list",
      web: {...content.web, connections: webDraftConnections, themePresets: themePresetDrafts},
      domains: previewDomains,
      includeUnpublished: true,
      pathForDomain: () => "#"
    });
    $$(".organic-domain-card", canvas).forEach(card => {
      card.classList.toggle("is-selected", card.dataset.domainId === selectedDomainId);
      card.setAttribute("aria-label", `${$("strong", card)?.textContent || "Domain"} draft preview; select to edit`);
    });
    stage.dataset.theme = stage.dataset.theme || "dark";
  }
  $("#domain-preview-theme").addEventListener("click", event => {
    const card = event.target.closest(".organic-domain-card");
    if (!card) return;
    event.preventDefault();
    selectedDomainId = card.dataset.domainId;
    $$(".domain-edit").forEach(row => row.classList.toggle("is-selected", row.dataset.domainId === selectedDomainId));
    updateDomainPreview();
    const selected = $(`.domain-edit[data-domain-id="${CSS.escape(selectedDomainId)}"]`);
    selected?.scrollIntoView({behavior: "smooth", block: "nearest"});
  });
  let draggedDomain = null;
  const previewCanvas = $("#admin-organic-web-canvas");
  previewCanvas.addEventListener("pointerdown", event => {
    const card = event.target.closest(".organic-domain-card");
    if (!card) return;
    event.preventDefault();
    selectedDomainId = card.dataset.domainId;
    const row = $(`.domain-edit[data-domain-id="${CSS.escape(selectedDomainId)}"]`);
    if (!row) return;
    draggedDomain = {
      id: selectedDomainId,
      startX: event.clientX,
      startY: event.clientY,
      x: Number($("[data-domain-x]", row).value),
      y: Number($("[data-domain-y]", row).value)
    };
    previewCanvas.setPointerCapture(event.pointerId);
  });
  previewCanvas.addEventListener("pointermove", event => {
    if (!draggedDomain) return;
    const row = $(`.domain-edit[data-domain-id="${CSS.escape(draggedDomain.id)}"]`);
    if (!row) return;
    const bounds = previewCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, draggedDomain.x + (event.clientX - draggedDomain.startX) / bounds.width * 100));
    const y = Math.max(0, Math.min(100, draggedDomain.y + (event.clientY - draggedDomain.startY) / bounds.height * 100));
    $("[data-domain-x]", row).value = String(Math.round(x));
    $("[data-domain-y]", row).value = String(Math.round(y));
    updateDomainPreview();
  });
  ["pointerup", "pointercancel"].forEach(name => previewCanvas.addEventListener(name, () => { draggedDomain = null; }));
  $$("[data-preview-layout]").forEach(button => button.addEventListener("click", () => {
    const stage = $("#domain-preview-theme");
    stage.classList.toggle("is-mobile-preview", button.dataset.previewLayout === "mobile");
    $$("[data-preview-layout]").forEach(item => item.classList.toggle("selected", item === button));
    updateDomainPreview();
  }));
  $$("[data-preview-theme]").forEach(button => button.addEventListener("click", () => {
    $("#domain-preview-theme").dataset.theme = button.dataset.previewTheme;
    $$("[data-preview-theme]").forEach(item => item.classList.toggle("selected", item === button));
  }));
  $("#add-connection").addEventListener("click", () => {
    const from = $("#connection-from").value;
    const to = $("#connection-to").value;
    if (!from || !to || from === to) {
      setStatus("#domain-preview-status", "Choose two different domains for a strand.", true);
      return;
    }
    if (webDraftConnections.some(edge => [edge.from, edge.to].sort().join(":") === [from, to].sort().join(":"))) {
      setStatus("#domain-preview-status", "That strand already exists.", true);
      return;
    }
    webDraftConnections.push({from, to, curvature: 0, opacity: 0.28, width: 1, visible: true, animated: false});
    renderConnectionEditor();
    updateDomainPreview();
    setStatus("#domain-preview-status", "Connection added to draft. Publish to make it public.");
  });
  $("#connection-editor-list").addEventListener("input", event => {
    const field = event.target.closest("[data-edge-field]");
    const row = event.target.closest("[data-edge-index]");
    if (!field || !row) return;
    const edge = webDraftConnections[Number(row.dataset.edgeIndex)];
    edge[field.dataset.edgeField] = field.type === "checkbox" ? field.checked : Number(field.value);
    updateDomainPreview();
  });
  $("#connection-editor-list").addEventListener("click", event => {
    const row = event.target.closest("[data-edge-index]");
    if (!row || !event.target.closest("[data-edge-remove]")) return;
    webDraftConnections.splice(Number(row.dataset.edgeIndex), 1);
    renderConnectionEditor();
    updateDomainPreview();
  });
  $("#theme-preset-editor").addEventListener("input", event => {
    const field = event.target.closest("[data-preset-field]");
    const row = event.target.closest("[data-preset-index]");
    if (!field || !row) return;
    themePresetDrafts[Number(row.dataset.presetIndex)][field.dataset.presetField] = field.value;
    const heading = $("header strong", row);
    if (field.dataset.presetField === "name" && heading) heading.textContent = field.value;
    updateDomainPreview();
  });
  $("#theme-preset-editor").addEventListener("change", event => {
    const field = event.target.closest("[data-preset-field]");
    const row = event.target.closest("[data-preset-index]");
    if (!field || !row) return;
    themePresetDrafts[Number(row.dataset.presetIndex)][field.dataset.presetField] = field.value;
    updateDomainPreview();
  });
  $("#theme-preset-editor").addEventListener("click", event => {
    const row = event.target.closest("[data-preset-index]");
    if (!row || !event.target.closest("[data-preset-remove]")) return;
    if (themePresetDrafts.length <= 1) {
      setStatus("#domain-publish-status", "Keep at least one theme preset.", true);
      return;
    }
    const removed = themePresetDrafts.splice(Number(row.dataset.presetIndex), 1)[0];
    const fallback = themePresetDrafts[0].id;
    const domains = readDomainDrafts().map(domain => ({
      ...domain, themePresetId: domain.themePresetId === removed.id ? fallback : domain.themePresetId
    }));
    renderDomains(domains);
    setStatus("#domain-publish-status", "Preset removed from draft; affected domains use the first remaining preset.");
  });
  $("#add-theme-preset").addEventListener("click", () => {
    const base = themePresetDrafts[0] || makeDefaultThemePresets()[0];
    themePresetDrafts.push({...base, id: `preset-${crypto.randomUUID()}`, name: "New preset"});
    renderThemePresets();
    const domains = readDomainDrafts();
    renderDomains(domains);
    setStatus("#domain-publish-status", "Theme preset draft added. Publish to save it.");
  });
  function validateDomainDrafts(domains, connections = webDraftConnections, presets = themePresetDrafts) {
    if (!domains.length) throw new Error("Keep at least one domain, or disable the organic web before publishing.");
    const ids = domains.map(domain => domain.id);
    const slugs = domains.map(domain => domain.slug);
    if (new Set(ids).size !== ids.length) throw new Error("Domain IDs must be unique.");
    if (new Set(slugs).size !== slugs.length) throw new Error("Domain slugs must be unique.");
    if (new Set(domains.map(domain => domain.displayOrder)).size !== domains.length) throw new Error("Every domain needs a unique display order.");
    const presetIds = presets.map(preset => preset.id);
    if (!presets.length || new Set(presetIds).size !== presetIds.length) throw new Error("Theme presets need unique IDs, and at least one preset must remain.");
    const validFonts = new Set(["Manrope", "DM Sans", "Georgia", "Arial", "system-ui"]);
    for (const preset of presets) {
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(preset.id) || !preset.name?.trim()) throw new Error("Every theme preset needs a valid ID and name.");
      for (const key of ["backgroundColor", "surfaceColor", "textColor", "mutedColor", "accentColor", "borderColor"]) {
        if (!/^#[0-9a-f]{6}$/i.test(preset[key] || "")) throw new Error(`${preset.name} needs a valid ${key.replace("Color", " color")}.`);
      }
      if (!validFonts.has(preset.headingFont) || !validFonts.has(preset.bodyFont)) throw new Error(`${preset.name} uses an unsupported font selection.`);
      if (!["none", "grain", "grid", "dots"].includes(preset.backgroundMotif) ||
          !["solid", "glass", "outline"].includes(preset.cardAppearance) ||
          !["silk", "fade", "none"].includes(preset.transitionStyle) ||
          !["lift", "glow", "none"].includes(preset.hoverBehavior)) {
        throw new Error(`${preset.name} has an unsupported visual setting.`);
      }
      if (preset.audioTrack && !isWebUrl(preset.audioTrack)) throw new Error(`${preset.name} audio track must use a valid http(s) URL.`);
    }
    const projectIds = new Set(content.projects.map(projectReferenceId));
    const socialIds = new Set(content.links.map(socialReferenceId));
    const domainIds = new Set(ids);
    for (const domain of domains) {
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(domain.id)) throw new Error(`Invalid stable ID: ${domain.id}`);
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(domain.slug)) throw new Error(`Invalid URL slug: ${domain.slug}`);
      if (!domain.title || !domain.description || !domain.icon || !domain.themePresetId) {
        throw new Error(`Domain ${domain.slug} needs a title, description, icon, and theme preset.`);
      }
      if (!presetIds.includes(domain.themePresetId)) throw new Error(`Theme preset for ${domain.title} is invalid.`);
      if (!Number.isInteger(domain.displayOrder) || domain.displayOrder < 1) throw new Error(`Invalid display order for ${domain.title}.`);
      if (!Number.isFinite(domain.position.x) || domain.position.x < 0 || domain.position.x > 100 ||
          !Number.isFinite(domain.position.y) || domain.position.y < 0 || domain.position.y > 100) {
        throw new Error(`Position for ${domain.title} must be between 0 and 100.`);
      }
      if (!Number.isFinite(domain.threadLength) || domain.threadLength < 20 || domain.threadLength > 180) {
        throw new Error(`Thread length for ${domain.title} must be between 20 and 180.`);
      }
      if (domain.pagePath !== `/domains/${domain.slug}`) throw new Error(`Page path for ${domain.title} must be /domains/${domain.slug}.`);
      if (domain.url && !isWebUrl(domain.url)) throw new Error(`External URL for ${domain.title} must use http(s).`);
      if (domain.featuredProjectIds.some(id => !projectIds.has(id))) throw new Error(`A featured project reference in ${domain.title} is invalid.`);
      if (domain.socialLinkIds.some(id => !socialIds.has(id))) throw new Error(`A social link reference in ${domain.title} is invalid.`);
    }
    const seenConnections = new Set();
    for (const edge of connections) {
      if (!domainIds.has(edge.from) || !domainIds.has(edge.to) || edge.from === edge.to) throw new Error("A strand connection references an invalid or identical domain.");
      const key = [edge.from, edge.to].sort().join("\u0000");
      if (seenConnections.has(key)) throw new Error("Strand connections must not be duplicated.");
      seenConnections.add(key);
      if (!Number.isFinite(edge.curvature) || edge.curvature < -180 || edge.curvature > 180 ||
          !Number.isFinite(edge.opacity) || edge.opacity < 0 || edge.opacity > 1 ||
          !Number.isFinite(edge.width) || edge.width < 0.4 || edge.width > 4 ||
          typeof edge.visible !== "boolean" || typeof edge.animated !== "boolean") {
        throw new Error("Strand curvature, opacity, width, and visibility settings are invalid.");
      }
    }
  }
  async function publishDomainDrafts(domains, message = "Domain configuration published.") {
    const previous = content.web;
    try {
      validateDomainDrafts(domains, webDraftConnections, themePresetDrafts);
      if (!$("#web-section-title").value.trim()) throw new Error("The organic web needs a section title.");
      const now = new Date().toISOString();
      const savedDomains = [...domains].sort((a, b) => a.displayOrder - b.displayOrder).map((domain, index) => ({
        ...domain,
        displayOrder: index + 1,
        pagePath: `/domains/${domain.slug}`,
        createdAt: domain.createdAt || now,
        updatedAt: now
      }));
      const connections = webDraftConnections.map(connection => ({...connection}));
      content.web = {
        ...previous,
        enabled: $("#web-enabled").checked,
        sectionTitle: $("#web-section-title").value.trim(),
        sectionSubtitle: $("#web-section-subtitle").value.trim(),
        domains: savedDomains,
        connections,
        themePresets: structuredClone(themePresetDrafts)
      };
      await publishContent(true);
      webDraftConnections = structuredClone(connections);
      renderDomains();
      setStatus("#domain-publish-status", message);
      toast("Web domains published");
    } catch (error) {
      content.web = previous;
      renderDomains(domains);
      setStatus("#domain-publish-status", error.message, true);
    }
  }
  $("#domain-settings-form").addEventListener("submit", event => {
    event.preventDefault();
    void publishDomainDrafts(readDomainDrafts(), "Web settings and domain changes published.");
  });
  $("#publish-domains").addEventListener("click", () => {
    void publishDomainDrafts(readDomainDrafts());
  });
  $("#discard-domain-drafts").addEventListener("click", () => {
    if (!window.confirm("Discard all unpublished domain, connection, and theme-preset changes?")) return;
    if (!hasSavedWebRecord) {
      content.web = {...makeDefaultWeb(false), domains: [], connections: []};
    }
    webDraftConnections = structuredClone(content.web.connections || []);
    themePresetDrafts = structuredClone(content.web.themePresets || makeDefaultThemePresets());
    renderDomains();
    setStatus("#domain-publish-status", "Unpublished web changes discarded.");
  });
  $("#domain-add-form").addEventListener("submit", event => {
    event.preventDefault();
    const domains = readDomainDrafts();
    const title = $("#new-domain-title").value.trim();
    const baseSlug = slugify(title);
    if (!baseSlug) {
      setStatus("#domain-publish-status", "Enter a title that can form a URL slug.", true);
      return;
    }
    let slug = baseSlug;
    let suffix = 2;
    while (domains.some(domain => domain.slug === slug)) slug = `${baseSlug}-${suffix++}`;
    const now = new Date().toISOString();
    domains.push({
      id: `domain-${crypto.randomUUID()}`, slug, title, description: $("#new-domain-description").value.trim(),
      icon: $("#new-domain-icon").value.trim() || "code", published: true, hidden: false,
      displayOrder: domains.length + 1, themePresetId: themePresetDrafts[0]?.id || "solar",
      position: {x: 50, y: 50}, threadLength: 65, pagePath: `/domains/${slug}`, pageContent: "", url: "",
      featuredProjectIds: [], socialLinkIds: [], articles: [], media: [], createdAt: now, updatedAt: now
    });
    renderDomains(domains);
    $("#new-domain-title").value = "";
    $("#new-domain-description").value = "";
    setStatus("#domain-publish-status", "Domain draft added. It will appear publicly only after you press Publish domains.");
  });
  $("#domain-editor-list").addEventListener("click", event => {
    const row = event.target.closest(".domain-edit");
    if (!row) return;
    const domains = readDomainDrafts();
    const index = [...row.parentElement.children].indexOf(row);
    if (event.target.closest("[data-domain-move]")) {
      const next = index + Number(event.target.closest("[data-domain-move]").dataset.domainMove);
      if (next < 0 || next >= domains.length) return;
      [domains[index], domains[next]] = [domains[next], domains[index]];
      domains.forEach((domain, domainIndex) => { domain.displayOrder = domainIndex + 1; });
      renderDomains(domains);
      setStatus("#domain-publish-status", "Order changed in draft. Publish to apply it.");
      return;
    }
    if (event.target.closest("[data-domain-duplicate]")) {
      const original = domains[index];
      let suffixText = "-copy";
      let slug = `${original.slug.slice(0, 60 - suffixText.length)}${suffixText}`;
      let suffix = 2;
      while (domains.some(domain => domain.slug === slug)) {
        suffixText = `-copy-${suffix++}`;
        slug = `${original.slug.slice(0, 60 - suffixText.length)}${suffixText}`;
      }
      const now = new Date().toISOString();
      domains.splice(index + 1, 0, {
        ...original, id: `domain-${crypto.randomUUID()}`, slug, title: `${original.title.slice(0, 45)} copy`,
        published: false, pagePath: `/domains/${slug}`, position: {...original.position},
        createdAt: now, updatedAt: now, displayOrder: index + 2
      });
      domains.forEach((domain, domainIndex) => { domain.displayOrder = domainIndex + 1; });
      renderDomains(domains);
      setStatus("#domain-publish-status", "Duplicate draft created. Publish to save it.");
      return;
    }
    if (event.target.closest("[data-domain-remove]")) {
      const target = domains[index];
      const referencedProjects = (target.featuredProjectIds || []).length;
      const referencedLinks = (target.socialLinkIds || []).length;
      const referencedMedia = (target.media || []).length;
      const strandPairs = new Set(webDraftConnections
        .filter(edge => edge.from === target.id || edge.to === target.id)
        .map(edge => [edge.from, edge.to].sort().join(":")));
      const details = `Remove ${target.title} from the draft?\n\nIts ${target.pagePath} page and custom page content will be removed when published. ${referencedProjects} featured-project references, ${referencedLinks} social-link references, ${referencedMedia} media references, and ${strandPairs.size} strand connections will be detached. The shared projects, links, and media themselves will not be deleted; unrelated content will be preserved.`;
      if (!window.confirm(details)) return;
      const updatedDomains = domains.filter(domain => domain.id !== target.id);
      updatedDomains.forEach((domain, domainIndex) => { domain.displayOrder = domainIndex + 1; });
      webDraftConnections = webDraftConnections.filter(edge => edge.from !== target.id && edge.to !== target.id);
      renderDomains(updatedDomains);
      setStatus("#domain-publish-status", `${target.title} removed from the draft. ${referencedProjects} project, ${referencedLinks} social, ${referencedMedia} media reference(s), and ${strandPairs.size} strand connection(s) detached. Publish domains to save this deletion.`);
    }
  });
  $("#domain-editor-list").addEventListener("input", event => {
    const row = event.target.closest(".domain-edit");
    if (!row) return;
    if (event.target.matches("[data-domain-slug]")) {
      const slug = event.target.value.trim().toLowerCase();
      $("[data-domain-path]", row).value = `/domains/${slug}`;
    }
    updateDomainPreview();
  });
  $("#domain-editor-list").addEventListener("change", () => updateDomainPreview());
  $("#restore-domain-defaults").addEventListener("click", () => {
    const currentCount = content.web.domains?.length || 0;
    if (!window.confirm(`Restore the initial eight-domain configuration as a draft? This replaces ${currentCount} current domain records and detaches their strand, featured-project, and social-link references. Shared projects, social links, media, and all unrelated content are preserved. Nothing will publish until you press Publish domains.`)) return;
    const defaults = makeDefaultWeb();
    webDraftConnections = [];
    themePresetDrafts = structuredClone(defaults.themePresets);
    $("#web-enabled").checked = defaults.enabled;
    $("#web-section-title").value = defaults.sectionTitle;
    $("#web-section-subtitle").value = defaults.sectionSubtitle;
    renderDomains(defaults.domains);
    setStatus("#domain-publish-status", "Initial eight domains restored to a previewable draft. Publish domains to save the defaults.");
  });

  function renderProfilePhotos() {
    $("#profile-photo-list").innerHTML = content.profilePhotos.map((photo, index) =>
      `<article class="media-item" data-media-path="${esc(photo.path || "")}">
        <img src="${esc(photo.url)}" alt="${esc(photo.alt || "Profile photo")}">
        <div class="media-item-controls"><span>Photo ${index + 1} of 6</span>
          <button type="button" class="order-card" data-photo-move="-1" aria-label="Move photo up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="order-card" data-photo-move="1" aria-label="Move photo down" ${index === content.profilePhotos.length - 1 ? "disabled" : ""}>↓</button>
          <label class="photo-alt-label">Alt text<input data-photo-alt maxlength="120" value="${esc(photo.alt || "")}" aria-label="Photo alternative text"></label>
          <label class="photo-theme-label">Show in theme<select data-photo-theme aria-label="Profile photo theme">
            <option value="both" ${!["dark", "light"].includes(photo.theme) ? "selected" : ""}>Both themes</option>
            <option value="dark" ${photo.theme === "dark" ? "selected" : ""}>Dark theme</option>
            <option value="light" ${photo.theme === "light" ? "selected" : ""}>Light theme</option>
          </select></label>
          <label class="visibility-control"><input data-photo-visible type="checkbox" ${photo.visible === false ? "" : "checked"}> Visible</label>
          <button type="button" class="remove-card" data-photo-remove>Remove</button>
        </div>
      </article>`).join("");
    $("#upload-profile-photos").disabled = content.profilePhotos.length >= 6;
  }
  $("#upload-profile-photos").addEventListener("click", async () => {
    const files = [...$("#profile-photo-files").files];
    if (!files.length) {
      setStatus("#media-status", "Choose one or more images first.", true);
      return;
    }
    if (content.profilePhotos.length + files.length > 6) {
      setStatus("#media-status", "The profile library can contain up to 6 photos.", true);
      return;
    }
    const uploads = [];
    try {
      for (const file of files) uploads.push({...await uploadImage(file, "profile"), alt: file.name.replace(/\.[^.]+$/, ""), visible: true, theme: "both"});
      const previous = content.profilePhotos;
      content.profilePhotos = [...previous, ...uploads];
      await publishContent();
      renderProfilePhotos();
      setStatus("#media-status", "Profile photos published to the media library.");
      toast("Profile photos published");
    } catch (error) {
      let message = error.message;
      if (uploads.length) {
        try { await deleteUploadedImages(uploads.map(upload => upload.path)); }
        catch (cleanupError) {
          message += ` Uploaded files also need cleanup: ${cleanupError.message}`;
        }
      }
      setStatus("#media-status", message, true);
    } finally {
      $("#profile-photo-files").value = "";
    }
  });
  $("#profile-photo-list").addEventListener("change", async event => {
    const input = event.target.closest("[data-photo-visible], [data-photo-alt], [data-photo-theme]");
    if (!input) return;
    const previous = structuredClone(content.profilePhotos);
    const index = [...input.closest(".media-item").parentElement.children].indexOf(input.closest(".media-item"));
    if (input.matches("[data-photo-visible]")) content.profilePhotos[index].visible = input.checked;
    else if (input.matches("[data-photo-theme]")) content.profilePhotos[index].theme = input.value;
    else content.profilePhotos[index].alt = input.value.trim();
    try {
      await publishContent();
      renderProfilePhotos();
      setStatus("#media-status", "Photo settings published.");
    } catch (error) {
      content.profilePhotos = previous;
      renderProfilePhotos();
      setStatus("#media-status", error.message, true);
    }
  });
  $("#profile-photo-list").addEventListener("click", async event => {
    const row = event.target.closest(".media-item");
    if (!row) return;
    const index = [...row.parentElement.children].indexOf(row);
    const previous = structuredClone(content.profilePhotos);
    const move = event.target.closest("[data-photo-move]");
    if (move) {
      const next = index + Number(move.dataset.photoMove);
      if (next < 0 || next >= content.profilePhotos.length) return;
      [content.profilePhotos[index], content.profilePhotos[next]] = [content.profilePhotos[next], content.profilePhotos[index]];
    } else if (event.target.closest("[data-photo-remove]")) {
      const [removed] = content.profilePhotos.splice(index, 1);
      try {
        await publishContent();
        renderProfilePhotos();
        if (removed.path) {
          try {
            await deleteUploadedImages([removed.path]);
          } catch (error) {
            setStatus("#media-status", `Photo removed from the portfolio, but storage cleanup failed: ${error.message}`, true);
            return;
          }
        }
        setStatus("#media-status", "Profile photo removed.");
      } catch (error) {
        content.profilePhotos = previous;
        renderProfilePhotos();
        setStatus("#media-status", error.message, true);
      }
      return;
    } else return;
    try {
      await publishContent();
      renderProfilePhotos();
      setStatus("#media-status", "Photo order published.");
    } catch (error) {
      content.profilePhotos = previous;
      renderProfilePhotos();
      setStatus("#media-status", error.message, true);
    }
  });

  function renderContact() {
    $("#contact-address").value = content.contact.email;
    $("#contact-whatsapp").value = content.contact.whatsapp || "";
    $("#contact-copy").value = content.contact.message;
  }
  $("#contact-form").addEventListener("submit", async event => {
    event.preventDefault();
    const previous = content.contact;
    content.contact = {
      ...previous,
      email: $("#contact-address").value.trim(),
      whatsapp: $("#contact-whatsapp").value.trim(),
      message: $("#contact-copy").value.trim()
    };
    try {
      await publishContent();
      setStatus("#contact-status", "Contact details published.");
    } catch (error) {
      content.contact = previous;
      renderContact();
      setStatus("#contact-status", error.message, true);
    }
  });
  function renderLinks() {
    $("#links-list").innerHTML = links.map((link, index) =>
      `<div class="link-row"><input aria-label="Link label" data-label="${index}" value="${esc(link.label)}" placeholder="Label" maxlength="40"><input aria-label="Link URL" data-url="${index}" type="url" value="${esc(link.url)}" placeholder="https://example.com"><select aria-label="Category" data-type="${index}">${["Social", "Code", "Video", "Writing", "Business", "Other"].map(type => `<option ${link.type === type ? "selected" : ""}>${type}</option>`).join("")}</select><button type="button" data-remove="${index}" aria-label="Remove link">×</button></div>`
    ).join("");
    $$("[data-remove]").forEach(button => button.addEventListener("click", () => {
      links.splice(Number(button.dataset.remove), 1);
      renderLinks();
    }));
  }
  $("#add-link").addEventListener("click", () => {
    links.push({label: "", url: "", type: "Other"});
    renderLinks();
  });
  $("#links-form").addEventListener("submit", async event => {
    event.preventDefault();
    const next = $$(".link-row").map((row, index) => ({
      id: links[index]?.id || `social-${crypto.randomUUID()}`,
      label: $(`[data-label="${index}"]`).value.trim(),
      url: $(`[data-url="${index}"]`).value.trim(),
      type: $(`[data-type="${index}"]`).value
    })).filter(link => link.label);
    if (next.some(link => link.url && !isWebUrl(link.url))) {
      setStatus("#links-status", "Use a full https:// or http:// URL.", true);
      return;
    }
    const previous = links;
    const previousWeb = content.web;
    links = next;
    content.links = links;
    const validIds = new Set(links.map(socialReferenceId));
    content.web = {
      ...content.web,
      domains: content.web.domains.map(domain => ({
        ...domain,
        socialLinkIds: (domain.socialLinkIds || []).filter(id => validIds.has(id))
      }))
    };
    try {
      await publishContent();
      setStatus("#links-status", "Social links published.");
    } catch (error) {
      links = previous;
      content.links = previous;
      content.web = previousWeb;
      renderLinks();
      setStatus("#links-status", error.message, true);
    }
  });

  function setTheme(theme) {
    const light = theme === "light";
    document.documentElement.dataset.adminTheme = light ? "light" : "dark";
    localStorage.setItem("bhawishya-theme", light ? "light" : "dark");
    const button = $("#admin-theme-toggle");
    button.textContent = light ? "☾ Switch to Solar" : "☼ Switch to Lunar";
    button.setAttribute("aria-label", light ? "Switch to Solar dark theme" : "Switch to Lunar light theme");
    $$(".theme-card").forEach(card => card.classList.toggle("selected", card.dataset.themeChoice === (light ? "light" : "dark")));
  }
  setTheme(localStorage.getItem("bhawishya-theme") === "light" ? "light" : "dark");
  $("#admin-theme-toggle").addEventListener("click", () => setTheme(document.documentElement.dataset.adminTheme === "dark" ? "light" : "dark"));
  $$(".theme-card").forEach(card => card.addEventListener("click", () => {
    setTheme(card.dataset.themeChoice);
    toast(`${card.dataset.themeChoice === "light" ? "Lunar" : "Solar"} theme selected`);
  }));
  renderHome();
  renderProjects();
  renderContact();
  renderLinks();
  renderProfilePhotos();

  const authGate = $("#auth-gate");
  const adminShell = $("#admin-shell");
  const authStatus = $("#auth-status");
  const signInButton = $("#google-sign-in");
  function showSignIn(message = "") {
    adminShell.hidden = true;
    authGate.hidden = false;
    authStatus.textContent = message;
  }
  function showAdmin(email) {
    authGate.hidden = true;
    adminShell.hidden = false;
    $("#owner-email").textContent = email;
    void loadPublishedContent().catch(error => console.error(error));
  }
  async function authorize(session) {
    const email = session?.user?.email?.trim().toLowerCase();
    if (email === ADMIN_EMAIL) {
      showAdmin(email);
      return;
    }
    showSignIn(session?.user ? "This Google account is not authorized for this admin page." : "");
    if (session?.user) {
      const {error} = await authClient.auth.signOut();
      if (error) showSignIn(`This account is not authorized. Could not clear its session: ${error.message}`);
      else showSignIn("This Google account is not authorized for this admin page.");
    }
  }
  async function initializeAuth() {
    if (!window.supabase?.createClient) {
      showSignIn("Could not load Supabase. Check your connection and reload.");
      signInButton.disabled = true;
      return;
    }
    authClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    let checkingInitialSession = true;
    signInButton.addEventListener("click", async () => {
      signInButton.disabled = true;
      authStatus.textContent = "Redirecting to Google…";
      try {
        const {error} = await authClient.auth.signInWithOAuth({provider: "google", options: {redirectTo: ADMIN_REDIRECT_URL}});
        if (error) throw error;
      } catch (error) {
        authStatus.textContent = `Google sign-in failed: ${error.message}`;
        signInButton.disabled = false;
      }
    });
    $("#sign-out").addEventListener("click", async () => {
      try {
        const {error} = await authClient.auth.signOut();
        if (error) throw error;
        showSignIn("Signed out.");
      } catch (error) {
        showSignIn(`Sign-out failed: ${error.message}`);
      }
    });
    authClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        showSignIn("Signed out.");
        return;
      }
      if (checkingInitialSession) return;
      setTimeout(() => {
        void authorize(session).catch(error => showSignIn(`Could not verify your session: ${error.message}`));
      }, 0);
    });
    const {data, error} = await authClient.auth.getSession();
    if (error) {
      showSignIn(`Could not check your session: ${error.message}`);
      return;
    }
    checkingInitialSession = false;
    await authorize(data.session);
  }
  void initializeAuth().catch(error => showSignIn(`Could not initialize sign-in: ${error.message}`));
})();
