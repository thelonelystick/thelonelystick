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
  const makeDefaultWeb = () => ({
    enabled: true,
    sectionTitle: "Welcome to my web",
    sectionSubtitle: "Eight worlds. One mind. Explore what I create.",
    defaultExpanded: false,
    domains: DOMAIN_SEEDS.map(([id, title, description, icon, x, y, threadLength], index) => ({
      id, slug: id, title, description, icon, published: true, displayOrder: index + 1,
      themePresetId: id, position: {x, y}, threadLength, pagePath: `/domains/${id}`,
      featuredProjectIds: [], socialLinkIds: [], connections: [], createdAt: null, updatedAt: null
    })),
    connections: [],
    themePresets: []
  });
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
        web: saved.web && typeof saved.web === "object" ? saved.web : makeDefaultWeb()
      };
      links = content.links;
      contentLoaded = true;
      renderHome();
      renderProjects();
      renderContact();
      renderLinks();
      renderProfilePhotos();
      renderDomains();
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
  async function publishContent() {
    if (!contentLoaded) throw new Error("Published content is not loaded. Check the Supabase connection and retry.");
    const {error} = await authClient.from("portfolio_content").upsert({
      id: "published",
      content,
      updated_at: new Date().toISOString()
    }, {onConflict: "id"});
    if (error) throw new Error(`Could not publish content: ${error.message}`);
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
  function renderDomains(domains = content.web.domains || []) {
    $("#web-enabled").checked = content.web.enabled !== false;
    $("#web-section-title").value = content.web.sectionTitle || "";
    $("#web-section-subtitle").value = content.web.sectionSubtitle || "";
    $("#domain-editor-list").innerHTML = domains.map((domain, index) => {
      const position = domain.position || {x: 50, y: 50};
      const connections = Array.isArray(domain.connections) ? domain.connections : [];
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
      const connectionOptions = domains.filter(item => item.id !== domain.id)
        .map(item => `<option value="${esc(item.id)}" ${connections.includes(item.id) ? "selected" : ""}>${esc(item.title)}</option>`).join("");
      const themeOptions = ["tech", "art", "poet", "music", "vlog", "edu", "sport", "cyber"].map(theme =>
        `<option value="${theme}" ${domain.themePresetId === theme ? "selected" : ""}>${theme}</option>`).join("");
      return `<article class="domain-edit" data-domain-id="${esc(domain.id)}">
        <header class="domain-edit-head"><div><span class="eyebrow">DOMAIN ${String(index + 1).padStart(2, "0")} / ${esc(domain.id)}</span><strong>${esc(domain.title || "Untitled domain")}</strong></div><div class="card-order">
          <button type="button" class="order-card" data-domain-move="-1" aria-label="Move ${esc(domain.title)} up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="order-card" data-domain-move="1" aria-label="Move ${esc(domain.title)} down" ${index === domains.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="button secondary" data-domain-duplicate>Duplicate</button>
          <button type="button" class="remove-card" data-domain-remove>Remove</button>
        </div></header>
        <div class="domain-fields">
          <label>Stable ID<input data-domain-id-value value="${esc(domain.id)}" required></label>
          <label>URL slug<input data-domain-slug value="${esc(domain.slug)}" required></label>
          <label>Title<input data-domain-title value="${esc(domain.title)}" maxlength="50" required></label>
          <label>Icon<input data-domain-icon value="${esc(domain.icon || "code")}" maxlength="30" required></label>
          <label class="domain-field-wide">Description<textarea data-domain-description rows="2" maxlength="240" required>${esc(domain.description)}</textarea></label>
          <label class="domain-field-wide">Domain page content<textarea data-domain-page-content rows="4" maxlength="3000" placeholder="Optional additional text for this domain page.">${esc(domain.pageContent || "")}</textarea></label>
          <label class="domain-field-wide">Dedicated page path<input data-domain-path value="${esc(domain.pagePath || `/domains/${domain.slug}`)}" required></label>
          <label>External URL<input data-domain-url type="url" value="${esc(domain.url || "")}" placeholder="https://example.com"></label>
          <label>Visual theme<select data-domain-theme>${themeOptions}</select></label>
          <label>Display order<input data-domain-order type="number" min="1" step="1" value="${Number(domain.displayOrder) || index + 1}" required></label>
          <label>Position X (0-100)<input data-domain-x type="number" min="0" max="100" step="1" value="${Number(position.x)}" required></label>
          <label>Position Y (0-100)<input data-domain-y type="number" min="0" max="100" step="1" value="${Number(position.y)}" required></label>
          <label>Thread length (20-180)<input data-domain-thread type="number" min="20" max="180" step="1" value="${Number(domain.threadLength) || 65}" required></label>
          <label class="visibility-control"><input data-domain-published type="checkbox" ${domain.published === false ? "" : "checked"}> Published</label>
          <label class="visibility-control"><input data-domain-hidden type="checkbox" ${domain.hidden === true ? "checked" : ""}> Hide from public web</label>
          <label>Featured projects<select data-domain-projects multiple size="4">${projectOptions}</select></label>
          <label>Social links<select data-domain-social multiple size="4">${socialOptions}</select></label>
          <label class="domain-field-wide">Connect strands to<select data-domain-connections multiple size="4">${connectionOptions}</select><small>Choose other domains to draw silk connections between them.</small></label>
        </div>
        <div class="domain-previews"><span>Preview this domain</span><div><article data-preview-theme="dark"><b>Solar</b><strong>${esc(domain.title)}</strong><small>${esc(domain.description)}</small></article><article data-preview-theme="light"><b>Lunar</b><strong>${esc(domain.title)}</strong><small>${esc(domain.description)}</small></article></div></div>
      </article>`;
    }).join("");
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
        socialLinkIds: choose("[data-domain-social]"),
        connections: choose("[data-domain-connections]")
      };
    });
  }
  function validateDomainDrafts(domains) {
    if (!domains.length) throw new Error("Keep at least one domain, or disable the organic web before publishing.");
    const ids = domains.map(domain => domain.id);
    const slugs = domains.map(domain => domain.slug);
    if (new Set(ids).size !== ids.length) throw new Error("Domain IDs must be unique.");
    if (new Set(slugs).size !== slugs.length) throw new Error("Domain slugs must be unique.");
    const projectIds = new Set(content.projects.map(projectReferenceId));
    const socialIds = new Set(content.links.map(socialReferenceId));
    const domainIds = new Set(ids);
    for (const domain of domains) {
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(domain.id)) throw new Error(`Invalid stable ID: ${domain.id}`);
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(domain.slug)) throw new Error(`Invalid URL slug: ${domain.slug}`);
      if (!domain.title || !domain.description || !domain.icon || !domain.themePresetId) {
        throw new Error(`Domain ${domain.slug} needs a title, description, icon, and visual theme.`);
      }
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
      if (domain.connections.some(id => !domainIds.has(id) || id === domain.id)) throw new Error(`A strand connection in ${domain.title} references an invalid domain.`);
    }
  }
  async function publishDomainDrafts(domains, message = "Domain configuration published.") {
    const previous = content.web;
    try {
      validateDomainDrafts(domains);
      if (!$("#web-section-title").value.trim()) throw new Error("The organic web needs a section title.");
      const now = new Date().toISOString();
      const savedDomains = domains.map((domain, index) => ({
        ...domain,
        displayOrder: index + 1,
        pagePath: `/domains/${domain.slug}`,
        createdAt: domain.createdAt || now,
        updatedAt: now
      }));
      const connections = [];
      const seen = new Set();
      savedDomains.forEach(domain => domain.connections.forEach(otherId => {
        const [from, to] = [domain.id, otherId].sort();
        const key = `${from}:${to}`;
        if (!seen.has(key)) {
          seen.add(key);
          connections.push({from, to});
        }
      }));
      content.web = {
        ...previous,
        enabled: $("#web-enabled").checked,
        sectionTitle: $("#web-section-title").value.trim(),
        sectionSubtitle: $("#web-section-subtitle").value.trim(),
        domains: savedDomains,
        connections
      };
      await publishContent();
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
    domains.push({
      id: `domain-${crypto.randomUUID()}`, slug, title, description: $("#new-domain-description").value.trim(),
      icon: $("#new-domain-icon").value.trim() || "code", published: true, hidden: false,
      displayOrder: domains.length + 1, themePresetId: "tech",
      position: {x: 50, y: 50}, threadLength: 65, pagePath: `/domains/${slug}`,
      featuredProjectIds: [], socialLinkIds: [], connections: [], createdAt: null, updatedAt: null
    });
    renderDomains(domains);
    $("#new-domain-title").value = "";
    $("#new-domain-description").value = "";
    setStatus("#domain-publish-status", "Domain draft added. Review and publish to save it.");
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
      renderDomains(domains);
      setStatus("#domain-publish-status", "Order changed in draft. Publish to apply it.");
      return;
    }
    if (event.target.closest("[data-domain-duplicate]")) {
      const original = domains[index];
      let slug = `${original.slug}-copy`;
      let suffix = 2;
      while (domains.some(domain => domain.slug === slug)) slug = `${original.slug}-copy-${suffix++}`;
      domains.splice(index + 1, 0, {
        ...original, id: `domain-${crypto.randomUUID()}`, slug, title: `${original.title} copy`,
        pagePath: `/domains/${slug}`, position: {...original.position}, connections: [],
        createdAt: null, updatedAt: null
      });
      renderDomains(domains);
      setStatus("#domain-publish-status", "Duplicate draft created. Publish to save it.");
      return;
    }
    if (event.target.closest("[data-domain-remove]")) {
      const target = domains[index];
      const referencedProjects = (target.featuredProjectIds || []).length;
      const referencedLinks = (target.socialLinkIds || []).length;
      const strandPairs = new Set((content.web.connections || [])
        .filter(edge => edge.from === target.id || edge.to === target.id)
        .map(edge => [edge.from, edge.to].sort().join(":")));
      domains.forEach(domain => {
        if (domain.id !== target.id && (domain.connections || []).includes(target.id)) {
          strandPairs.add([domain.id, target.id].sort().join(":"));
        }
      });
      const details = `Remove ${target.title} permanently?\n\nIts ${target.pagePath} page and custom page content will be removed. ${referencedProjects} featured-project references and ${referencedLinks} social-link references will be detached, but those projects and links will not be deleted. ${strandPairs.size} strand connections will be removed. Shared projects, links, media, and all other page content will be preserved.`;
      if (!window.confirm(details)) return;
      const updatedDomains = domains.filter(domain => domain.id !== target.id).map(domain => ({
        ...domain, connections: domain.connections.filter(id => id !== target.id)
      }));
      renderDomains(updatedDomains);
      void publishDomainDrafts(updatedDomains, `${target.title} removed and configuration published.`);
    }
  });
  $("#domain-editor-list").addEventListener("change", event => {
    const row = event.target.closest(".domain-edit");
    if (!row || !event.target.matches("[data-domain-title],[data-domain-description]")) return;
    const title = $("[data-domain-title]", row).value;
    const description = $("[data-domain-description]", row).value;
    $$("[data-preview-theme]", row).forEach(preview => {
      $("strong", preview).textContent = title;
      $("small", preview).textContent = description;
    });
  });
  $("#domain-editor-list").addEventListener("input", event => {
    const row = event.target.closest(".domain-edit");
    if (row && event.target.matches("[data-domain-slug]")) {
      const slug = event.target.value.trim().toLowerCase();
      $("[data-domain-path]", row).value = `/domains/${slug}`;
    }
  });
  $("#restore-domain-defaults").addEventListener("click", () => {
    const currentCount = content.web.domains?.length || 0;
    if (!window.confirm(`Restore the initial eight-domain configuration? This replaces ${currentCount} current domain records and removes their connections and assignments. Projects, social links, media, and all other published content will be preserved.`)) return;
    const defaults = makeDefaultWeb();
    $("#web-enabled").checked = defaults.enabled;
    $("#web-section-title").value = defaults.sectionTitle;
    $("#web-section-subtitle").value = defaults.sectionSubtitle;
    renderDomains(defaults.domains);
    void publishDomainDrafts(defaults.domains, "Initial eight domains restored and published.");
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
