/* ==========================================================================
   VISIT MONTALEGRE — app
   Renders every section, handles i18n (pt/en/es), the illustrated map,
   filters, search, timeline and modal. Vanilla JS, no framework.
   ========================================================================== */
(function () {
  "use strict";
  const S = window.SITE;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- state ---------- */
  let lang = localStorage.getItem("mlg_lang") || "pt";
  if (!S.i18n[lang]) lang = "pt";
  const activeLayers = new Set(S.categories.map((c) => c.id));
  let season = "todo";
  let query = "";
  let mapStyle = "mapa";

  /* ---------- category identity colours (map legend) ---------- */
  const CAT = {
    alojamentos:  "#7c5cbf",
    restaurantes: "#c1572f",
    natureza:     "#4f8f5a",
    atracoes:     "#3f6ea8",
    interesse:    "#3f9d8a",
    noturna:      "#b6557f",
    compras:      "#3f9bb0",
    servicos:     "#b0473f",
    ecomuseus:    "#a06a2c"
  };
  const TRAIL_COLOR = "#c0532f";

  /* ---------- icons ---------- */
  const I = {
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"/><path d="M2 18h20M2 14V8M7 11V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></svg>',
    fork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v6a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3M6 11v10M18 3c-1.5 0-3 1.5-3 4s1 4 3 4v10"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 8-4 13-9 13Z"/><path d="M4 20c2-4 5-6 8-7"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.9 1-5.8L3.5 9.2l5.9-.9z"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>',
    landmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M4 10h16M5 10l7-6 7 6M6 10v11M10 10v11M14 10v11M18 10v11"/></svg>',
    wine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8M12 15v7M6 3h12l-1 6a5 5 0 0 1-10 0z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5zM9 7a3 3 0 0 1 6 0"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M15 9h3a2 2 0 0 1 2 2v10M8 7h3M8 11h3M8 15h3"/></svg>',
    castle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l3 2V6l3 2V5l3 2 3-2v3l3-2v4l3-2v13z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/></svg>',
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9Z"/></svg>',
    police: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
    civic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M4 21V10l8-5 8 5v11M9 21v-6h6v6"/></svg>',
    pharmacy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 4h6v3H9zM12 11v5M9.5 13.5h5"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h6"/></svg>',
    starFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.9 1-5.8L3.5 9.2l5.9-.9z"/></svg>',
    museum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M4 10h16M5 10l7-5 7 5M6 10v8M10 10v8M14 10v8M18 10v8"/></svg>',
    mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18L14.5 7l-3 5.5L9 9z"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4l5 2 4-2 5 2v9l-5-2-4 2-5-2"/></svg>'
  };
  const svcIcon = { health: I.health, fire: I.fire, police: I.police, civic: I.civic, pharmacy: I.pharmacy, info: I.info };

  /* ---------- expandable topic tabs (icon springs open to its label) ---------- */
  const NAV_TABS = [
    { id: "mapa",      icon: "pin",      key: "nav.map" },
    { id: "festas",    icon: "starFill", key: "nav.festas" },
    { sep: true },
    { id: "trilhos",   icon: "route",    key: "nav.trilhos" },
    { id: "ecomuseus", icon: "museum",   key: "nav.ecomuseus" },
    { id: "larouco",   icon: "mountain", key: "nav.larouco" },
    { id: "rally",     icon: "flag",     key: "nav.rally" },
    { sep: true },
    { id: "servicos",  icon: "building", key: "nav.servicos" },
    { id: "sobre",     icon: "info",     key: "nav.sobre" }
  ];
  let tabSpyUpdate = null;
  function renderTabs() {
    const host = document.getElementById("xtabs");
    if (!host) return;
    host.innerHTML = NAV_TABS.map((tb) => {
      if (tb.sep) return '<span class="xtab-sep" aria-hidden="true"></span>';
      return `<a class="xtab" href="#${tb.id}" data-tab="${tb.id}" aria-label="${t(tb.key)}">` +
        `${I[tb.icon]}<span class="xtab-label"><span>${t(tb.key)}</span></span></a>`;
    }).join("");
    if (tabSpyUpdate) tabSpyUpdate();
  }
  function initTabSpy() {
    const host = document.getElementById("xtabs");
    if (!host) return;
    tabSpyUpdate = () => {
      const tabs = Array.from(host.querySelectorAll(".xtab"));
      const y = window.scrollY + 130;
      let curId = null;
      tabs.forEach((a) => {
        const sec = document.getElementById(a.dataset.tab);
        if (sec && sec.offsetTop <= y) curId = a.dataset.tab;
      });
      tabs.forEach((a) => a.classList.toggle("active", a.dataset.tab === curId));
    };
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; tabSpyUpdate(); }); }
    }, { passive: true });
    tabSpyUpdate();
  }

  const t = (k) => (S.i18n[lang] && S.i18n[lang][k]) || S.i18n.pt[k] || k;
  const catName = (id) => t("cats." + id);

  /* ---------- POI source: real Google data (SITE_PLACES) per category,
     falling back to the hand-curated list in data.js for empty categories ---------- */
  let POIS = [];
  function normalizeLive(p, cat) {
    return {
      id: p.id, cat: cat, lat: p.lat, lng: p.lng,
      name: { pt: p.name, en: p.name, es: p.name },
      address: p.address || "", rating: p.rating, reviews: p.reviews,
      open: p.open, photo: p.photo, live: true
    };
  }
  function buildPoiList() {
    const live = window.SITE_PLACES || {};
    const out = [];
    S.categories.forEach((c) => {
      const arr = live[c.id];
      if (arr && arr.length) arr.forEach((p) => out.push(normalizeLive(p, c.id)));
      else S.pois.filter((p) => p.cat === c.id).forEach((p) => out.push(p));
    });
    // Always surface the two featured spotlights, even when their category
    // (e.g. atrações) is overridden by live Google data.
    (S.spotlights || []).forEach((s) => {
      if (!out.some((p) => p.id === s.id)) {
        out.push({
          id: s.id, cat: s.mapCat, lat: s.lat, lng: s.lng,
          name: { pt: s.kicker.pt, en: s.kicker.en, es: s.kicker.es },
          photo: s.photo, blurb: s.text
        });
      }
    });
    return out;
  }

  /* ===================================================================
     ILLUSTRATED MAP
     =================================================================== */
  function mapSVG() {
    return `
    <svg viewBox="0 0 100 72" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--map-land-2)"/>
          <stop offset="1" stop-color="var(--map-land)"/>
        </linearGradient>
      </defs>
      <!-- whole land mass -->
      <path d="M2,30 C6,16 16,9 28,7 C40,5 52,8 64,6 C78,4 92,10 98,22 C100,34 96,48 90,58 C82,69 66,71 52,69 C40,67 30,70 20,66 C8,61 0,46 2,30 Z"
            fill="var(--map-land)" stroke="var(--map-line)" stroke-width="0.5"/>
      <!-- western highlands (Gerês) -->
      <path d="M2,30 C6,16 16,9 28,7 C34,12 33,24 30,34 C27,46 24,58 20,66 C8,61 0,46 2,30 Z"
            fill="url(#hl)" opacity="0.65"/>
      <!-- contour rings -->
      <g fill="none" stroke="var(--map-line)" stroke-width="0.35" opacity="0.55">
        <path d="M14,30 C18,22 26,20 32,26 C36,33 30,42 22,42 C16,42 11,37 14,30 Z"/>
        <path d="M17,31 C20,26 26,25 29,29 C32,34 28,39 23,39 C19,39 15,36 17,31 Z"/>
        <path d="M62,44 C68,40 76,42 78,48 C80,55 73,60 66,58 C60,56 57,48 62,44 Z"/>
        <path d="M70,18 C76,15 82,18 82,23 C82,29 75,31 70,28 C66,26 66,21 70,18 Z"/>
      </g>
      <!-- reservoirs -->
      <path d="M28,40 C32,37 38,38 39,43 C40,48 35,51 31,49 C27,47 25,43 28,40 Z" fill="var(--map-water)" stroke="var(--map-line)" stroke-width="0.4"/>
      <path d="M46,56 C50,54 55,55 55,59 C55,63 50,64 47,62 C43,60 43,58 46,56 Z" fill="var(--map-water)" stroke="var(--map-line)" stroke-width="0.4"/>
      <!-- rivers -->
      <g fill="none" stroke="var(--map-water)" stroke-width="1.4" stroke-linecap="round" opacity="0.9">
        <path d="M39,43 C44,46 48,52 47,58 C46,63 50,67 56,68"/>
        <path d="M31,49 C36,54 40,58 48,60"/>
        <path d="M70,12 C66,20 60,28 58,38 C57,46 60,52 55,59"/>
      </g>
      <!-- northern border (raia / Galiza) -->
      <path d="M24,9 C40,5 56,7 72,5 C84,4 92,8 98,16" fill="none" stroke="var(--map-line)" stroke-width="0.6" stroke-dasharray="2 2.4" opacity="0.8"/>
      <!-- roads -->
      <g fill="none" stroke="var(--map-line)" stroke-width="0.5" opacity="0.6">
        <path d="M20,30 C32,34 44,40 60,42 C70,43 80,38 88,30"/>
        <path d="M49,40 C50,30 52,22 55,14"/>
      </g>
    </svg>`;
  }

  const mapTags = [
    { x: 14, y: 14, key: { pt: "GALIZA · RAIA", en: "GALICIA · BORDER", es: "GALICIA · RAYA" } },
    { x: 12, y: 50, key: { pt: "SERRA DO GERÊS", en: "GERÊS RANGE", es: "SIERRA DEL GERÊS" } },
    { x: 78, y: 55, key: { pt: "SERRA DO BARROSO", en: "BARROSO RANGE", es: "SIERRA DEL BARROSO" } },
    { x: 44, y: 64, key: { pt: "RIO CÁVADO", en: "CÁVADO RIVER", es: "RÍO CÁVADO" } }
  ];

  /* ---------- Leaflet map ---------- */
  let map = null;
  const markers = {};
  let curTile = null;
  const TILES = {
    mapa:     { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", attribution: "&copy; OpenStreetMap &copy; CARTO", sub: "abcd", max: 20 },
    claro:    { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", attribution: "&copy; OpenStreetMap &copy; CARTO", sub: "abcd", max: 20 },
    escuro:   { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attribution: "&copy; OpenStreetMap &copy; CARTO", sub: "abcd", max: 20 },
    satelite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "&copy; Esri, Maxar, Earthstar Geographics", sub: "", max: 19 }
  };

  function markerIcon(cat) {
    const ic = (S.categories.find((c) => c.id === cat) || {}).icon || "pin";
    return L.divIcon({
      className: "mlg-pin-wrap",
      html: `<span class="mlg-pin" style="--c:${CAT[cat]}">${I[ic]}</span>`,
      iconSize: [36, 46], iconAnchor: [18, 44], popupAnchor: [0, -42]
    });
  }
  function popupHTML(p) {
    const dest = p.lat + "," + p.lng;
    const nm = p.name[lang] || p.name.pt;
    const img = p.photo
      ? `<img class="mlg-pop-img" src="${p.photo}" alt="${nm}" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph mlg-pop-img'}))">`
      : `<div class="ph mlg-pop-img" data-label="${nm}"></div>`;
    const desc = p.address || (p.blurb && (p.blurb[lang] || p.blurb.pt)) || "";
    let meta = "";
    if (p.rating) {
      meta = `<div class="mlg-pop-meta"><span class="mlg-stars">${I.starFill}${p.rating.toFixed(1)}</span>` +
             (p.reviews ? `<span class="mlg-reviews">${p.reviews} ${t("place.reviews")}</span>` : "") +
             (p.open === true ? `<span class="mlg-open">${t("place.open")}</span>` : "") + `</div>`;
    }
    return `<div class="mlg-pop">
      ${img}
      <div class="mlg-pop-body">
        <span class="mlg-pop-cat" style="--c:${CAT[p.cat]}">${catName(p.cat)}</span>
        <h4>${nm}</h4>
        ${meta}
        <p>${desc}</p>
        <a class="mlg-pop-go" href="https://www.google.com/maps/dir/?api=1&destination=${dest}" target="_blank" rel="noopener">${I.route}<span>${t("map.directions")}</span></a>
      </div></div>`;
  }
  function setMapStyle(style) {
    mapStyle = TILES[style] ? style : "mapa";
    if (!map) return;
    const cfg = TILES[mapStyle];
    if (curTile) map.removeLayer(curTile);
    curTile = L.tileLayer(cfg.url, { attribution: cfg.attribution, subdomains: cfg.sub || "abc", maxZoom: cfg.max || 19 }).addTo(map);
    if (curTile.bringToBack) curTile.bringToBack();
  }
  window.MLG_setMapStyle = setMapStyle;

  function buildMap() {
    const stage = $("#map-stage");
    if (typeof L === "undefined") { stage.innerHTML = '<div class="map-fallback mono">Mapa indisponível</div>'; return; }
    POIS = buildPoiList();
    map = L.map(stage, { scrollWheelZoom: false, zoomControl: true }).setView(S.mapCenter, 11);
    map.attributionControl.setPrefix("");
    setMapStyle(mapStyle);
    POIS.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: markerIcon(p.cat), title: p.name[lang] || p.name.pt }).addTo(map);
      m.bindPopup(popupHTML(p), { maxWidth: 268, minWidth: 236, className: "mlg-popup", closeButton: true });
      markers[p.id] = m;
    });
    try { map.fitBounds(L.latLngBounds(POIS.map((p) => [p.lat, p.lng])), { padding: [44, 44], maxZoom: 12 }); } catch (e) {}
    const cnt = document.createElement("div");
    cnt.className = "map-count mono"; cnt.id = "map-count";
    stage.appendChild(cnt);
    const foot = document.createElement("div");
    foot.className = "map-foot"; foot.id = "map-foot";
    foot.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:var(--accent-2)"></span><span data-i18n="map.legend">${t("map.legend")}</span>`;
    stage.appendChild(foot);
    setTimeout(() => map.invalidateSize(), 250);
  }

  function applyMapFilter() {
    if (!map) return;
    let visible = 0;
    POIS.forEach((p) => {
      const m = markers[p.id]; if (!m) return;
      const name = (p.name[lang] || p.name.pt).toLowerCase();
      const ok = activeLayers.has(p.cat) && (!query || name.includes(query));
      if (ok) { if (!map.hasLayer(m)) m.addTo(map); visible++; }
      else if (map.hasLayer(m)) map.removeLayer(m);
    });
    const c = $("#map-count");
    if (c) c.textContent = visible + " " + t("map.results");
  }

  /* ---------- focus a point / draw a trail route on the Leaflet map ---------- */
  function scrollToMap() {
    const el = document.getElementById("mapa");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  function focusPoi(id) {
    scrollToMap();
    const m = markers[id];
    if (!map || !m) return;
    const p = POIS.find((x) => x.id === id);
    if (p && !activeLayers.has(p.cat)) {
      activeLayers.add(p.cat);
      const btn = $(`.layer[data-cat="${p.cat}"]`);
      if (btn) btn.setAttribute("aria-pressed", "true");
      applyMapFilter();
    }
    setTimeout(() => {
      map.invalidateSize();
      map.setView(m.getLatLng(), 14, { animate: true });
      m.openPopup();
    }, 480);
  }
  window.MLG_focusPoi = focusPoi;

  let trailLayer = null;
  function trailStartIcon(letter) {
    return L.divIcon({
      className: "mlg-trail-node-wrap",
      html: `<span class="mlg-trail-node" style="--c:${TRAIL_COLOR}">${letter || I.route}</span>`,
      iconSize: [30, 30], iconAnchor: [15, 15]
    });
  }
  function trailPopupHTML(tr) {
    const d = S.diffLabels[lang][tr.diff] || S.diffLabels.pt[tr.diff];
    const dest = tr.route[0][0] + "," + tr.route[0][1];
    return `<div class="mlg-pop"><div class="mlg-pop-body">
      <span class="mlg-pop-cat" style="--c:${TRAIL_COLOR}">${t("nav.trilhos")}</span>
      <h4>${tr.name[lang] || tr.name.pt}</h4>
      <div class="mlg-pop-meta"><span class="mlg-trailstat"><b>${tr.km}</b></span><span class="mlg-trailstat"><b>${tr.time}</b></span><span class="mlg-trailstat"><b>${d}</b></span></div>
      <p>${t("trilhos.start")}: ${tr.start}</p>
      <a class="mlg-pop-go" href="https://www.google.com/maps/dir/?api=1&destination=${dest}" target="_blank" rel="noopener">${I.route}<span>${t("map.directions")}</span></a>
    </div></div>`;
  }
  function showTrail(id) {
    const tr = S.trails.find((x) => x.id === id);
    scrollToMap();
    if (!map || !tr || !tr.route || !tr.route.length) return;
    if (trailLayer) { map.removeLayer(trailLayer); trailLayer = null; }
    const g = L.layerGroup();
    L.polyline(tr.route, { color: "#ffffff", weight: 8, opacity: 0.95, lineCap: "round", lineJoin: "round" }).addTo(g);
    L.polyline(tr.route, { color: TRAIL_COLOR, weight: 4.5, opacity: 1, lineCap: "round", lineJoin: "round", dashArray: "1 9" }).addTo(g);
    L.polyline(tr.route, { color: TRAIL_COLOR, weight: 4.5, opacity: 0.55, lineCap: "round", lineJoin: "round" }).addTo(g);
    const a = tr.route[0];
    const start = L.marker(a, { icon: trailStartIcon(I.route), zIndexOffset: 1000 }).addTo(g);
    start.bindPopup(trailPopupHTML(tr), { maxWidth: 268, minWidth: 236, className: "mlg-popup", closeButton: true });
    g.addTo(map);
    trailLayer = g;
    setTimeout(() => {
      map.invalidateSize();
      try { map.fitBounds(L.latLngBounds(tr.route), { padding: [70, 70], maxZoom: 14 }); } catch (e) {}
      start.openPopup();
    }, 480);
  }
  window.MLG_showTrail = showTrail;

  /* ---------- layers panel ---------- */
  function renderLayers() {
    const box = $("#layers");
    box.innerHTML = "";
    S.categories.forEach((c) => {
      const count = POIS.filter((p) => p.cat === c.id).length;
      const b = document.createElement("button");
      b.className = "layer"; b.setAttribute("aria-pressed", "true"); b.dataset.cat = c.id;
      b.innerHTML =
        `<span class="swatch" style="background:${CAT[c.id]}">${I[c.icon]}</span>` +
        `<span class="name">${catName(c.id)}</span>` +
        `<span class="count">${count}</span>` +
        `<span class="tick">${I.check}</span>`;
      b.addEventListener("click", () => {
        if (activeLayers.has(c.id)) activeLayers.delete(c.id); else activeLayers.add(c.id);
        b.setAttribute("aria-pressed", activeLayers.has(c.id));
        applyMapFilter();
      });
      box.appendChild(b);
    });
  }

  /* ===================================================================
     FESTIVIDADES
     =================================================================== */
  const monthLbl = {
    pt: ["", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"],
    en: ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    es: ["", "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
  };
  const seasons = [
    { id: "todo", lbl: { pt: "Ano inteiro", en: "Whole year", es: "Todo el año" } },
    { id: "inverno", lbl: { pt: "Inverno", en: "Winter", es: "Invierno" } },
    { id: "primavera", lbl: { pt: "Primavera", en: "Spring", es: "Primavera" } },
    { id: "verao", lbl: { pt: "Verão", en: "Summer", es: "Verano" } },
    { id: "outono", lbl: { pt: "Outono", en: "Autumn", es: "Otoño" } }
  ];
  function renderSeasonBar() {
    const bar = $("#season-bar"); bar.innerHTML = "";
    seasons.forEach((s) => {
      const b = document.createElement("button");
      b.className = "chip"; b.setAttribute("aria-pressed", season === s.id ? "true" : "false");
      b.textContent = s.lbl[lang] || s.lbl.pt;
      b.addEventListener("click", () => { season = s.id; renderSeasonBar(); renderEvents(); });
      bar.appendChild(b);
    });
  }
  function renderEvents() {
    const tl = $("#timeline"); tl.innerHTML = "";
    const list = S.events.filter((e) => season === "todo" || e.season === season || e.season === "todo");
    list.forEach((e) => {
      const row = document.createElement("article");
      row.className = "evt";
      const mo = e.month === 0 ? "13" : monthLbl[lang][e.month];
      row.innerHTML =
        `<div class="when">${mo}<br>${e.date[lang] || e.date.pt}</div>` +
        (e.photo
          ? `<img class="evt-thumb" src="${e.photo}" alt="${e.name[lang] || e.name.pt}" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph evt-thumb'}))">`
          : `<div class="ph evt-thumb" data-label="${(e.name[lang] || e.name.pt)}"></div>`) +
        `<div class="body"><span class="cat-tag">${t("evt." + e.cat)}</span>` +
        `<h3>${e.name[lang] || e.name.pt}</h3><p>${e.desc[lang] || e.desc.pt}</p></div>` +
        `<button class="go" aria-label="${t("festas.detail")}">${I.arrow}</button>`;
      row.addEventListener("click", () => openModal(e));
      tl.appendChild(row);
    });
  }

  /* ===================================================================
     TRILHOS
     =================================================================== */
  function renderTrails() {
    const g = $("#trail-grid"); g.innerHTML = "";
    S.trails.forEach((tr) => {
      const card = document.createElement("article");
      card.className = "trail";
      const d = S.diffLabels[lang][tr.diff] || S.diffLabels.pt[tr.diff];
      card.innerHTML =
        (tr.photo
          ? `<img class="trail-img" src="${tr.photo}" alt="${tr.name[lang] || tr.name.pt}" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph trail-img'}))">`
          : `<div class="ph trail-img" data-label="${tr.name[lang] || tr.name.pt}"></div>`) +
        `<div class="trail-body">` +
          `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">` +
            `<h3>${tr.name[lang] || tr.name.pt}</h3>` +
            `<span class="diff d${tr.diff}"><span class="bars"><i></i><i></i><i></i></span>${d}</span>` +
          `</div>` +
          `<p>${tr.desc[lang] || tr.desc.pt}</p>` +
          `<div class="trail-meta">` +
            `<div class="m"><b>${tr.km}</b><span>${t("trilhos.distance")}</span></div>` +
            `<div class="m"><b>${tr.time}</b><span>${t("trilhos.duration")}</span></div>` +
            `<div class="m"><b>${tr.start}</b><span>${t("trilhos.start")}</span></div>` +
            `<div class="m"><b>${d}</b><span>${t("trilhos.difficulty")}</span></div>` +
          `</div>` +
          `<button class="trail-route-btn" type="button">${I.route}<span>${t("trilhos.route")}</span></button>` +
        `</div>`;
      const btn = card.querySelector(".trail-route-btn");
      if (btn) btn.addEventListener("click", () => showTrail(tr.id));
      g.appendChild(card);
    });
  }

  /* ===================================================================
     ECOMUSEUS
     =================================================================== */
  function renderEcomuseus() {
    const g = $("#eco-grid");
    if (!g) return;
    g.innerHTML = "";
    S.ecomuseus.forEach((e) => {
      const card = document.createElement("article");
      card.className = "eco";
      const nm = e.name[lang] || e.name.pt;
      card.innerHTML =
        (e.photo
          ? `<img class="eco-img" src="${e.photo}" alt="${nm}" referrerpolicy="no-referrer" onerror="var d=document.createElement('div');d.className='ph eco-img';d.setAttribute('data-label',this.alt);this.replaceWith(d)">`
          : `<div class="ph eco-img" data-label="${nm}"></div>`) +
        `<span class="eco-loc mono">${I.pin}${e.village}</span>` +
        `<div class="eco-body">` +
          `<span class="eco-theme">${e.theme[lang] || e.theme.pt}</span>` +
          `<h3>${nm}</h3>` +
          `<p>${e.desc[lang] || e.desc.pt}</p>` +
          `<button class="eco-map-btn" type="button">${I.pin}<span>${t("trilhos.viewmap")}</span></button>` +
        `</div>`;
      const btn = card.querySelector(".eco-map-btn");
      if (btn) btn.addEventListener("click", () => focusPoi(e.id));
      g.appendChild(card);
    });
  }

  /* ===================================================================
     LAROUCO & RALLYCROSS (featured topics — one section each)
     =================================================================== */
  function renderSpotlights() {
    S.spotlights.forEach((s) => {
      const nm = s.kicker[lang] || s.kicker.pt;
      const head = document.getElementById("head-" + s.id);
      if (head) {
        head.innerHTML =
          `<span class="kicker">${catName(s.mapCat)} · ${nm}</span>` +
          `<h2 class="s-title">${s.title[lang] || s.title.pt}</h2>` +
          `<p class="s-lead">${s.text[lang] || s.text.pt}</p>`;
      }
      const feat = document.getElementById("feat-" + s.id);
      if (!feat) return;
      feat.className = "feature reveal in" + (s.reverse ? " feature-rev" : "");
      const media = s.slot
        ? `<image-slot id="${s.id}-photo" placeholder="${s.kicker.pt} — foto" shape="rounded" radius="18"></image-slot>`
        : `<img class="feature-img" src="${s.photo}" alt="${nm}" referrerpolicy="no-referrer" onerror="var d=document.createElement('div');d.className='ph feature-img';d.setAttribute('data-label',this.alt);this.replaceWith(d)">`;
      const acts = s.acts.map((a) =>
        `<li>${s.kind === "motor" ? I.flag : I.check}<span>${a[lang] || a.pt}</span></li>`).join("");
      feat.innerHTML =
        `<div class="feature-media">${media}<span class="feature-badge mono">${s.badge[lang] || s.badge.pt}</span></div>` +
        `<div class="feature-text">` +
          `<span class="feature-acts-label mono">${t("aventura.activities")}</span>` +
          `<ul class="feature-acts feature-acts-${s.kind}">${acts}</ul>` +
          `<button class="eco-map-btn" type="button">${I.pin}<span>${t("trilhos.viewmap")}</span></button>` +
        `</div>`;
      const btn = feat.querySelector(".eco-map-btn");
      if (btn) btn.addEventListener("click", () => focusPoi(s.id));
    });
  }

  /* ===================================================================
     SERVIÇOS
     =================================================================== */
  function renderServices() {
    const g = $("#svc-grid"); g.innerHTML = "";
    S.services.forEach((s) => {
      const row = document.createElement("div");
      row.className = "svc";
      row.innerHTML =
        `<div class="ic">${svcIcon[s.type] || I.info}</div>` +
        `<div class="info"><b>${s.name[lang] || s.name.pt}</b><span>${s.addr}</span></div>` +
        `<a class="call mono" href="tel:+351${s.phone.replace(/\s/g, "")}">${I.phone}${s.phone}</a>`;
      g.appendChild(row);
    });
  }

  /* ===================================================================
     SOBRE
     =================================================================== */
  function renderVillages() {
    const v = $("#villages"); v.innerHTML = "";
    S.villages.forEach((name) => {
      const s = document.createElement("span"); s.className = "village"; s.textContent = name;
      v.appendChild(s);
    });
  }
  function renderCurio() {
    const c = $("#curio"); c.innerHTML = "";
    (S.curiosities[lang] || S.curiosities.pt).forEach((txt, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>0${i + 1}</b><span>${txt}</span>`;
      c.appendChild(li);
    });
  }

  /* ===================================================================
     MODAL
     =================================================================== */
  function openModal(e) {
    const m = $("#modal-back");
    const nm = e.name[lang] || e.name.pt;
    $("#modal-when").textContent = (monthLbl[lang][e.month] || "") + " · " + (e.date[lang] || e.date.pt);
    $("#modal-title").textContent = nm;
    $("#modal-text").textContent = e.desc[lang] || e.desc.pt;
    const mi = $("#modal-img");
    if (e.photo) {
      mi.outerHTML = `<img class="modal-img" id="modal-img" src="${e.photo}" alt="${nm}" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph modal-img',id:'modal-img'}))">`;
    } else {
      mi.outerHTML = `<div class="ph modal-img" id="modal-img" data-label="${nm}"></div>`;
    }
    $("#modal-cat").textContent = t("evt." + e.cat);
    m.classList.add("open");
  }
  function closeModal() { $("#modal-back").classList.remove("open"); }

  /* ===================================================================
     I18N CHROME
     =================================================================== */
  function applyI18n() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$(".map-tag").forEach((el) => {
      try { const o = JSON.parse(el.dataset.tag); el.textContent = o[lang] || o.pt; } catch (_) {}
    });
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.l === lang ? "true" : "false"));
  }
  function setLang(l) {
    if (!S.i18n[l]) return;
    lang = l; localStorage.setItem("mlg_lang", l);
    applyI18n();
    // re-render dynamic, preserving filters
    Object.keys(markers).forEach((id) => {
      const p = POIS.find((x) => x.id === id);
      if (p) markers[id].setPopupContent(popupHTML(p));
    });
    renderLayers(); renderSeasonBar(); renderEvents(); renderTrails();
    renderEcomuseus(); renderServices(); renderVillages(); renderCurio(); applyMapFilter();
    renderSpotlights(); renderTabs();
    const foot = $("#map-foot span[data-i18n]"); if (foot) foot.textContent = t("map.legend");
    if (typeof window.MLG_onLang === "function") window.MLG_onLang();
  }
  window.MLG_setLang = setLang;

  /* ===================================================================
     REVEAL
     =================================================================== */
  function initReveal() {
    // Deep-link (or reduced motion): reveal everything immediately, no flash.
    if (location.hash || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("no-anim");
      $$(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
    // Immediate pass: reveal anything already within (or near) the viewport so
    // the first screen never stays blank if the IO callback is slow to fire.
    requestAnimationFrame(() => {
      $$(".reveal").forEach((el) => {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.classList.add("in"); io.unobserve(el);
        }
      });
    });
  }

  /* ===================================================================
     INIT
     =================================================================== */
  function init() {
    // Standalone-export: swap local image paths for inlined blob URLs when bundled
    // (window.__res is a no-op returning the path on the normal multi-file site).
    if (typeof window.__res === "function") {
      ["events", "trails", "ecomuseus", "spotlights", "pois"].forEach((k) => {
        (S[k] || []).forEach((o) => { if (o && typeof o.photo === "string") o.photo = window.__res(o.photo); });
      });
    }
    buildMap();
    renderLayers(); renderSeasonBar(); renderEvents(); renderTrails();
    renderEcomuseus(); renderServices(); renderVillages(); renderCurio();
    renderSpotlights(); renderTabs();
    applyI18n(); applyMapFilter(); initReveal(); initTabSpy();

    // language buttons
    $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.l)));
    // map search
    const si = $("#map-search");
    if (si) si.addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); applyMapFilter(); });
    // modal
    $("#modal-close").addEventListener("click", closeModal);
    $("#modal-back").addEventListener("click", (e) => { if (e.target.id === "modal-back") closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    // mobile drawer
    const drawer = $("#drawer");
    $("#burger").addEventListener("click", () => drawer.classList.add("open"));
    $("#drawer-close").addEventListener("click", () => drawer.classList.remove("open"));
    $$("#drawer a").forEach((a) => a.addEventListener("click", () => drawer.classList.remove("open")));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
