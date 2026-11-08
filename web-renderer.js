(() => {
  "use strict";
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[character]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : 50));
  const safeColor = value => /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : "";
  const safeFont = value => ["Manrope", "DM Sans", "Georgia", "Arial", "system-ui"].includes(value) ? value : "";
  const publishedAndVisible = domain => domain && domain.published !== false && domain.hidden !== true;
  function canonicalConnections(web) {
    const legacy = (Array.isArray(web?.domains) ? web.domains : []).flatMap(domain =>
      (Array.isArray(domain?.connections) ? domain.connections : []).map(connection => ({
        from: domain?.id,
        to: typeof connection === "string" ? connection : connection?.to,
        ...(connection && typeof connection === "object" ? connection : {})
      }))
    );
    const seen = new Set();
    return [...(Array.isArray(web?.connections) ? web.connections : []), ...legacy].filter(connection => {
      const from = String(connection?.from || "");
      const to = String(connection?.to || "");
      if (!from || !to || from === to) return false;
      const key = [from, to].sort().join("\u0000");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(connection => ({
      ...connection,
      from: String(connection.from),
      to: String(connection.to),
      curvature: Number.isFinite(Number(connection.curvature)) ? Number(connection.curvature) : 0,
      opacity: Number.isFinite(Number(connection.opacity)) ? Number(connection.opacity) : 0.28,
      width: Number.isFinite(Number(connection.width)) ? Number(connection.width) : 1,
      visible: connection.visible !== false,
      animated: connection.animated === true
    }));
  }

  function anchorPosition(domain, width, height, index, count) {
    const mobile = width <= 800;
    const x = mobile ? 55 : clamp(domain.position?.x, 12, 88);
    const y = mobile
      ? 8 + ((index + 1) / (count + 1)) * 84
      : clamp(domain.position?.y, 8, 90);
    return {x: width * x / 100, y: height * y / 100};
  }

  function pathForThread(anchor, domain) {
    const length = clamp(domain.threadLength, 20, 180);
    const seed = Array.from(String(domain.id || domain.slug || "")).reduce(
      (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 7
    );
    const direction = seed % 2 ? 1 : -1;
    const sway = Math.min(46, length * 0.24) * direction;
    const smallBend = ((seed >>> 3) % 17) - 8;
    const middleY = anchor.y * (0.48 + ((seed >>> 8) % 13) / 100);
    const middleX = anchor.x + sway * 0.55 + smallBend;
    return `M${anchor.x.toFixed(1)} 0 C${(anchor.x + smallBend * 0.25).toFixed(1)} ${(anchor.y * 0.2).toFixed(1)} ${(anchor.x + sway * 0.9).toFixed(1)} ${(anchor.y * 0.36).toFixed(1)} ${middleX.toFixed(1)} ${middleY.toFixed(1)} C${(middleX + sway * 0.28).toFixed(1)} ${(middleY + (anchor.y - middleY) * 0.3).toFixed(1)} ${(anchor.x - sway * 0.16).toFixed(1)} ${(anchor.y * 0.82).toFixed(1)} ${anchor.x.toFixed(1)} ${anchor.y.toFixed(1)}`;
  }

  function render({canvas, svg, cards, list, web, domains, pathForDomain, iconForDomain, includeUnpublished = false, accessibleListId = "domain-accessible-list"}) {
    const navigation = list?.closest("nav[aria-label]");
    if (!canvas || !svg || !cards || !list || !list.matches("ol") ||
        list.id !== accessibleListId || !navigation || !navigation.querySelector("h3") ||
        (accessibleListId === "domain-accessible-list" && navigation.id !== "domain-accessible-nav")) {
      throw new Error("The organic web needs its labelled navigation landmark and ordered list.");
    }
    const visibleDomains = (Array.isArray(domains) ? domains : Array.isArray(web?.domains) ? web.domains : [])
      .filter(domain => domain && domain.hidden !== true && (includeUnpublished || domain.published !== false))
      .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
    const ids = new Set(visibleDomains.map(domain => domain.id));
    const uniqueDomains = visibleDomains.filter((domain, index) =>
      domain && typeof domain.id === "string" && ids.has(domain.id) &&
      visibleDomains.findIndex(candidate => candidate.id === domain.id) === index);
    const domainById = new Map(uniqueDomains.map(domain => [domain.id, domain]));
    const presets = new Map((Array.isArray(web?.themePresets) ? web.themePresets : [])
      .filter(preset => preset && typeof preset.id === "string")
      .map(preset => [preset.id, preset]));
    const connections = canonicalConnections(web);
    const route = pathForDomain || (domain => `/domains/${encodeURIComponent(domain.slug)}`);
    const icon = iconForDomain || (() => "✳");
    cards.innerHTML = uniqueDomains.map(domain => {
      const preset = presets.get(domain.themePresetId) || {};
      const style = [
        ["--domain-background", safeColor(preset.backgroundColor)],
        ["--domain-surface", safeColor(preset.surfaceColor)],
        ["--domain-text", safeColor(preset.textColor)],
        ["--domain-muted", safeColor(preset.mutedColor)],
        ["--domain-accent", safeColor(preset.accentColor)],
        ["--domain-border", safeColor(preset.borderColor)],
        ["--domain-heading-font", safeFont(preset.headingFont)],
        ["--domain-body-font", safeFont(preset.bodyFont)]
      ].filter(([, value]) => value).map(([name, value]) => `${name}:${value}`).join(";");
      const appearance = ["solid", "glass", "outline"].includes(preset.cardAppearance) ? ` preset-${preset.cardAppearance}` : "";
      const transition = ["silk", "fade", "none"].includes(preset.transitionStyle) ? ` preset-transition-${preset.transitionStyle}` : "";
      const hover = ["lift", "glow", "none"].includes(preset.hoverBehavior) ? ` preset-hover-${preset.hoverBehavior}` : "";
      const motif = ["none", "grain", "grid", "dots"].includes(preset.backgroundMotif) ? ` preset-motif-${preset.backgroundMotif}` : "";
      return `<a class="organic-domain-card${appearance}${transition}${hover}${motif}" data-domain-id="${escapeHTML(domain.id)}" href="${escapeHTML(route(domain))}" style="${style}" aria-label="Explore ${escapeHTML(domain.title)}: ${escapeHTML(domain.description)}"><span class="domain-attachment" aria-hidden="true"></span><span class="domain-icon" aria-hidden="true">${icon(domain.icon)}</span><strong>${escapeHTML(domain.title)}</strong><span class="domain-description">${escapeHTML(domain.description)}</span><span class="domain-open" aria-hidden="true">Explore ↗</span></a>`;
    }).join("");
    list.innerHTML = uniqueDomains.map(domain =>
      `<li><a href="${escapeHTML(route(domain))}"><strong>${escapeHTML(domain.title)}</strong><span>${escapeHTML(domain.description)}</span></a></li>`
    ).join("");

    function drawThreads() {
      const {width, height} = canvas.getBoundingClientRect();
      if (!width || !height) return;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const anchors = new Map();
      uniqueDomains.forEach((domain, index) => {
        const anchor = anchorPosition(domain, width, height, index, uniqueDomains.length);
        anchors.set(domain.id, anchor);
        const card = [...cards.children].find(element => element.dataset.domainId === domain.id);
        if (card) {
          card.style.left = `${anchor.x}px`;
          card.style.top = `${anchor.y}px`;
        }
      });
      const paths = uniqueDomains.map(domain => {
        const anchor = anchors.get(domain.id);
        return `<path class="domain-thread" d="${pathForThread(anchor, domain)}"/>`;
      });
      const seen = new Set();
      connections.forEach(connection => {
        const from = domainById.get(connection?.from);
        const to = domainById.get(connection?.to);
        if (!from || !to || from.id === to.id || connection.visible === false) return;
        const pair = [from.id, to.id].sort();
        const key = pair.join("\u0000");
        if (seen.has(key)) return;
        seen.add(key);
        const a = anchors.get(from.id);
        const b = anchors.get(to.id);
        const curve = clamp(connection.curvature, -180, 180);
        const middleX = (a.x + b.x) / 2;
        const middleY = (a.y + b.y) / 2;
        const controlX = middleX + (b.y - a.y) * 0.12 + curve;
        const controlY = middleY - Math.min(90, Math.abs(b.x - a.x) * 0.16);
        const opacity = clamp(connection.opacity ?? 0.28, 0, 1);
        const strokeWidth = clamp(connection.width ?? 1, 0.4, 4);
        const animated = connection.animated === true ? " is-animated" : "";
        paths.push(`<path class="domain-connection${animated}" d="M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${controlX.toFixed(1)} ${(controlY - curve * 0.25).toFixed(1)} ${(controlX - curve * 0.2).toFixed(1)} ${(controlY + curve * 0.25).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}" style="opacity:${opacity};stroke-width:${strokeWidth}px"/>`);
      });
      svg.innerHTML = paths.join("");
    }

    canvas.style.setProperty("--domain-count", uniqueDomains.length);
    drawThreads();
    if (canvas._webResizeObserver) canvas._webResizeObserver.disconnect();
    if ("ResizeObserver" in window) {
      canvas._webResizeObserver = new ResizeObserver(drawThreads);
      canvas._webResizeObserver.observe(canvas);
    } else {
      if (canvas._webResizeHandler) window.removeEventListener("resize", canvas._webResizeHandler);
      canvas._webResizeHandler = drawThreads;
      window.addEventListener("resize", drawThreads, {passive: true});
    }
    return uniqueDomains;
  }

  window.WebRenderer = {render, anchorPosition, publishedAndVisible};
})();
