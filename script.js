(function () {
  "use strict";

  const LS_CART = "tc_cart";
  const LS_ORDER = "tc_last_order";
  const SS_DONE = "tc_order_done";

  const PRODUCTS = [
    {
      id: 1,
      name: "Kit Inicial TouchClick",
      tag: "El kit completo",
      badge: "Más vendido",
      price: 8000,
      short: "Banda + switch mecánico + llavero + teclas base + tarjeta QR + sorpresa.",
      desc: "El kit que te da todo para empezar a clickear en calma. Una banda flexible de silicona que se ajusta a tu muñeca con un switch mecánico de teclas intercambiables, listo para acompañarte en tus sesiones de estudio, en la escuela o donde te duela el nerviosismo.",
      features: [
        "Banda flexible de silicona hipoalergénica",
        "Switch mecánico con click táctil preciso",
        "Llavero metálico incluido",
        "3 teclas base de arranque",
        "Tarjeta QR con contenido exclusivo",
        "Regalo sorpresa incluido"
      ],
      colors: [
        { name: "Azul noche", hex: "#1A73E8" },
        { name: "Blanco perla", hex: "#FFFFFF" },
        { name: "Gris mate", hex: "#AEB8C4" }
      ],
      keycaps: ["Tecla Base Gris", "Tecla Base Blanca", "Tecla Pixel Azul"],
      specs: [
        ["Material", "Silicona hipoalergénica flexible"],
        ["Switch", "Mecánico táctil con click audible"],
        ["Teclas", "Intercambiables, estándar TouchClick"],
        ["Peso", "Aproximadamente 45 g"],
        ["Incluye", "Llavero, tarjeta QR y sorpresa"]
      ]
    },
    {
      id: 2,
      name: "Pack Teclas Coleccionables — Sobres Sorpresa",
      tag: "Coleccioná diseños",
      badge: "Sorpresa",
      badgeAlt: true,
      price: 2500,
      short: "3 keycaps de diseño variado en sobre sorpresa.",
      desc: "Cada sobre trae 3 keycaps con diseños pensados para que tu TouchClick sea único. Sacás el sobre, abre la sorpresa y sumales color y personalidad a tu switch. Perfecto para coleccionar y canjear con tus compas.",
      features: [
        "3 keycaps sorpresa de diseño variado",
        "Diseños exclusivos de la colección",
        "Compatibles con el switch TouchClick",
        "Formato coleccionable"
      ],
      colors: null,
      keycaps: null,
      specs: [
        ["Formato", "Sobre sorpresa"],
        ["Contenido", "3 keycaps de diseño variado"],
        ["Compatibilidad", "Switch estándar TouchClick"]
      ]
    },
    {
      id: 3,
      name: "Pack Custom DIY",
      tag: "Personalizá todo",
      badge: "Creativo",
      badgeAlt: true,
      price: 2200,
      short: "3 keycaps lisas + stickers + marcador para personalizar.",
      desc: "Explotá tu creatividad: 3 keycaps lisas en blanco con stickers y marcador de tinta fina para que diseñes tus propias teclas. Convertí tu TouchClick en una pieza 100% tuya y mostrá tu estilo en cada click.",
      features: [
        "3 keycaps lisas en blanco",
        "Marcador permanente de tinta fina",
        "Stickers decorativos incluidos",
        "Ideal para regalar y personalizar"
      ],
      colors: null,
      keycaps: null,
      specs: [
        ["Contenido", "3 keycaps lisas + stickers + marcador"],
        ["Base", "Blanco liso para personalizar"],
        ["Compatibilidad", "Switch estándar TouchClick"]
      ]
    }
  ];

  const SHIPPING = {
    retiro: { label: "Retiro en puesto escolar / feria", hint: "Gratis", price: 0 },
    envio: { label: "Envío local — Isidro Casanova y alrededores", hint: "$1.500 ARS", price: 1500 }
  };

  const PAYMENTS = {
    efectivo: "Efectivo al retirar en feria / puesto escolar",
    transferencia: "Transferencia / Mercado Pago (simulado)"
  };

  const ALIAS = "touchclick.mp";
  const CBU = "0000003100012345678901";
  const WHATSAPP_NUMBER = "5491130000000";

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtARS(n) {
    return "$" + Number(n).toLocaleString("es-AR");
  }

  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const out = {};
    params.forEach(function (v, k) { out[k] = v; });
    return out;
  }

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_CART));
      if (raw && Array.isArray(raw.items)) {
        if (raw.shipping !== "retiro" && raw.shipping !== "envio") raw.shipping = "retiro";
        return raw;
      }
    } catch (e) {}
    return { items: [], shipping: "retiro" };
  }

  function saveCart(data) {
    localStorage.setItem(LS_CART, JSON.stringify(data));
  }

  const cart = {
    state: loadCart(),
    save: function () { saveCart(cart.state); },
    count: function () {
      return cart.state.items.reduce(function (sum, it) { return sum + it.qty; }, 0);
    },
    key: function (it) {
      return it.id + "|" + (it.colorHex || "x") + "|" + (it.keycap || "x");
    },
    add: function (item) {
      const k = cart.key(item);
      const found = cart.state.items.find(function (it) { return cart.key(it) === k; });
      if (found) {
        found.qty = Math.min(99, found.qty + item.qty);
      } else {
        cart.state.items.push({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          colorName: item.colorName || "",
          colorHex: item.colorHex || "",
          keycap: item.keycap || ""
        });
      }
      sessionStorage.setItem(SS_DONE, "0");
      cart.save();
      return cart.state.items.find(function (it) { return cart.key(it) === k; });
    },
    remove: function (k) {
      cart.state.items = cart.state.items.filter(function (it) { return cart.key(it) !== k; });
      cart.save();
    },
    setQty: function (k, qty) {
      const it = cart.state.items.find(function (i) { return cart.key(i) === k; });
      if (!it) return;
      it.qty = Math.max(1, Math.min(99, qty));
      cart.save();
    },
    setShipping: function (mode) {
      if (SHIPPING[mode]) {
        cart.state.shipping = mode;
        cart.save();
      }
    },
    totals: function () {
      const subtotal = cart.state.items.reduce(function (sum, it) { return sum + it.price * it.qty; }, 0);
      const ship = SHIPPING[cart.state.shipping];
      return {
        subtotal: subtotal,
        shipping: ship.price,
        total: subtotal + ship.price
      };
    }
  };

  let toastTimer = null;

  function showToast(message) {
    let toast = $("#toastRoot .toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.innerHTML =
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
        "<span></span>";
      $("#toastRoot").appendChild(toast);
    }
    toast.querySelector("span").textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  function buildDeviceHTML(bandHex) {
    return (
      '<div class="device" style="--band:' + (bandHex || "#AEB8C4") + '">' +
      '<span class="device__ring"></span>' +
      '<span class="device__keycap">TC</span>' +
      '<span class="device__tag"></span>' +
      "</div>"
    );
  }

  function updateBadge() {
    const badge = $("#cartBadge");
    if (!badge) return;
    const count = cart.count();
    badge.textContent = count;
    badge.hidden = count === 0;
  }

  function initHeader() {
    const toggle = $("#navToggle");
    const nav = $("#siteNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$("#siteNav a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
    const cartButton = $("#cartButton");
    if (cartButton) {
      cartButton.addEventListener("click", function () {
        cartUI.open();
      });
    }
  }

  const cartUI = {
    overlay: null,
    drawer: null,

    build: function () {
      const root = $("#drawerRoot");
      if (!root) return;

      const overlay = document.createElement("div");
      overlay.className = "drop-overlay";
      const drawer = document.createElement("aside");
      drawer.className = "drawer";
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-label", "Carrito de compras");
      drawer.innerHTML =
        '<div class="drawer__header">' +
        '<h3 class="drawer__title">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2 3h2.5l2.2 12.2a2 2 0 0 0 2 1.8h8.9a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
        "Tu carrito</h3>" +
        '<button class="drawer__close" type="button" aria-label="Cerrar carrito">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        "</button></div>" +
        '<div class="drawer__body"></div>' +
        '<div class="drawer__footer"></div>';

      root.appendChild(overlay);
      root.appendChild(drawer);

      cartUI.overlay = overlay;
      cartUI.drawer = drawer;

      overlay.addEventListener("click", function () { cartUI.close(); });
      $("#drawerRoot .drawer__close").addEventListener("click", function () { cartUI.close(); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") cartUI.close();
      });
    },

    open: function () {
      cartUI.render();
      cartUI.drawer.classList.add("open");
      cartUI.overlay.classList.add("show");
      document.body.classList.add("drawer-open");
    },

    close: function () {
      cartUI.drawer.classList.remove("open");
      cartUI.overlay.classList.remove("show");
      document.body.classList.remove("drawer-open");
    },

    render: function () {
      const body = $("#drawerRoot .drawer__body");
      const footer = $("#drawerRoot .drawer__footer");
      if (!body || !footer) return;

      const items = cart.state.items;
      if (!items.length) {
        body.innerHTML =
          '<div class="drawer__empty">' +
          '<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2 3h2.5l2.2 12.2a2 2 0 0 0 2 1.8h8.9a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
          "<h3>Tu carrito está vacío</h3>" +
          "<p>Agregá tus TouchClick favoritos y volvé para terminar la compra.</p>" +
          '<a class="btn btn--primary" href="index.html#catalogo">Ver catálogo</a>' +
          "</div>";
        footer.innerHTML = "";
        return;
      }

      body.innerHTML =
        '<ul class="drawer-items">' +
        items.map(cartUI.itemHTML).join("") +
        "</ul>" +
        cartUI.summaryHTML();

      const checkoutBtn = footer;
      checkoutBtn.innerHTML =
        '<button class="btn btn--primary btn--block" type="button" id="drawerCheckoutBtn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
        "Proceder al checkout</button>";

      $("#drawerCheckoutBtn").addEventListener("click", function () {
        window.location.href = "checkout.html";
      });

      $$("#drawerRoot .qty--minus").forEach(function (b) {
        b.addEventListener("click", function () {
          const it = cart.state.items.find(function (i) { return cart.key(i) === b.dataset.key; });
          if (it && it.qty > 1) {
            cart.setQty(b.dataset.key, it.qty - 1);
            cartUI.render();
          }
        });
      });
      $$("#drawerRoot .qty--plus").forEach(function (b) {
        b.addEventListener("click", function () {
          const it = cart.state.items.find(function (i) { return cart.key(i) === b.dataset.key; });
          if (it) {
            cart.setQty(b.dataset.key, it.qty + 1);
            cartUI.render();
          }
        });
      });
      $$("#drawerRoot .drawer-item__remove").forEach(function (b) {
        b.addEventListener("click", function () {
          cart.remove(b.dataset.key);
          updateBadge();
          cartUI.render();
        });
      });
      $$("#drawerRoot .radio-shipping").forEach(function (r) {
        r.addEventListener("change", function () {
          if (r.checked) {
            cart.setShipping(r.value);
            cartUI.render();
          }
        });
      });
      updateBadge();
    },

    itemHTML: function (it) {
      const k = cart.key(it);
      const variantParts = [];
      if (it.colorName) variantParts.push(it.colorName);
      if (it.keycap) variantParts.push(it.keycap);
      const variantLine = variantParts.length
        ? ' <span class="drawer-item__variant">' + esc(variantParts.join(" · ")) + "</span>"
        : "";
      return (
        '<li class="drawer-item">' +
        '<div class="thumb-box">' + buildDeviceHTML(it.colorHex) + "</div>" +
        '<div class="drawer-item__info">' +
        '<p class="drawer-item__name">' + esc(it.name) + "</p>" +
        variantLine +
        '<div class="drawer-item__row">' +
        '<div class="qty--mini" role="group" aria-label="Cantidad">' +
        '<button class="qty__btn qty--minus" type="button" data-key="' + k + '" aria-label="Disminuir cantidad">&minus;</button>' +
        '<span class="qty__num">' + it.qty + "</span>" +
        '<button class="qty__btn qty--plus" type="button" data-key="' + k + '" aria-label="Aumentar cantidad">+</button>' +
        "</div>" +
        '<span class="drawer-item__price">' + fmtARS(it.price * it.qty) + "</span>" +
        "</div>" +
        '<button class="drawer-item__remove" type="button" data-key="' + k + '">' +
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
        "Quitar</button>" +
        "</div>" +
        "</li>"
      );
    },

    summaryHTML: function () {
      const t = cart.totals();
      const radios = Object.keys(SHIPPING).map(function (k) {
        return (
          '<label class="radio-card">' +
          '<input class="radio-shipping" type="radio" name="drawerShipping" value="' + k + '"' + (cart.state.shipping === k ? " checked" : "") + ">" +
          '<span><span class="radio-card__label">' + esc(SHIPPING[k].label) + "</span>" +
          '<span class="radio-card__hint">' + esc(SHIPPING[k].hint) + (k === "envio" ? " · 2 a 4 días" : "") + "</span></span>" +
          "</label>"
        );
      }).join("");
      return (
        '<div class="drawer__summary">' +
        '<p class="drawer__summary-title">Método de entrega</p>' +
        radios +
        '<div class="sum-row"><span>Subtotal</span><span class="sum-row__value">' + fmtARS(t.subtotal) + "</span></div>" +
        '<div class="sum-row"><span>Envío</span><span class="sum-row__value">' + (t.shipping === 0 ? "Gratis" : fmtARS(t.shipping)) + "</span></div>" +
        '<div class="sum-row sum-row--total"><span>Total</span><span class="sum-row__value">' + fmtARS(t.total) + "</span></div>" +
        "</div>"
      );
    }
  };

  function initSwitchDemo() {
    const key = $("#demoKey");
    const countEl = $("#demoCount strong");
    if (!key || !countEl) return;
    let clicks = 0;

    key.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      key.classList.add("is-pressed");
      key.focus({ preventScroll: true });
      clicks += 1;
      countEl.textContent = clicks;
      playClickSound();
    });

    ["pointerup", "pointercancel", "pointerleave", "blur"].forEach(function (evt) {
      key.addEventListener(evt, function () {
        key.classList.remove("is-pressed");
      });
    });

    key.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!e.repeat) {
          key.classList.add("is-pressed");
          clicks += 1;
          countEl.textContent = clicks;
          playClickSound();
        }
      }
    });
    key.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") key.classList.remove("is-pressed");
    });
  }

  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playClickSound() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const t = ctx.currentTime;

    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "square";
    clickOsc.frequency.value = 2100;
    clickGain.gain.setValueAtTime(0.16, t);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(t);
    clickOsc.stop(t + 0.08);

    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = "triangle";
    thumpOsc.frequency.value = 300;
    thumpGain.gain.setValueAtTime(0.24, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thumpOsc.start(t);
    thumpOsc.stop(t + 0.13);
  }

  function cardHTML(p) {
    const colorHex = p.colors ? p.colors[0].hex : "#AEB8C4";
    return (
      '<article class="product-card">' +
      '<div class="product-card__media">' +
      '<span class="product-card__badge' + (p.badgeAlt ? " product-card__badge--alt" : "") + '">' + esc(p.badge) + "</span>" +
      buildDeviceHTML(colorHex) +
      "</div>" +
      '<div class="product-card__body">' +
      '<h3 class="product-card__name">' + esc(p.name) + "</h3>" +
      '<p class="product-card__desc">' + esc(p.short) + "</p>" +
      '<p class="product-card__price">' + fmtARS(p.price) + "<small>impuestos incluidos</small></p>" +
      '<div class="product-card__actions">' +
      '<a class="btn btn--ghost btn--sm" href="producto.html?id=' + p.id + '">Ver detalle</a>' +
      '<button class="btn btn--primary btn--sm js-add-card" type="button" data-id="' + p.id + '">Agregar al carrito</button>' +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function initHome() {
    const grid = $("#catalogGrid");
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(cardHTML).join("");

    $$(".js-add-card", grid).forEach(function (btn) {
      btn.addEventListener("click", function () {
        const p = PRODUCTS.find(function (x) { return x.id === Number(btn.dataset.id); });
        if (!p) return;
        cart.add({
          id: p.id,
          name: p.name,
          price: p.price,
          qty: 1,
          colorName: p.colors ? p.colors[0].name : "",
          colorHex: p.colors ? p.colors[0].hex : ""
        });
        updateBadge();
        showToast("Agregado al carrito");
      });
    });
  }

  function initProductPage() {
    const root = $("#productRoot");
    if (!root) return;
    const id = Number(getParams().id);
    const p = PRODUCTS.find(function (x) { return x.id === id; }) || PRODUCTS[0];
    const breadcrumb = $("#breadcrumbName");
    if (breadcrumb) breadcrumb.textContent = p.name;
    const backLink = $("#backLink");
    if (backLink) backLink.href = "index.html#catalogo";

    document.title = p.name + " | TouchClick";

    let colorIndex = 0;
    let keycap = p.keycaps ? p.keycaps[0] : "";
    let qty = 1;

    const state = { colorIndex: 0, qty: 1 };

    const swatchHTML = p.colors
      ? '<div class="swatches"><span class="swatches-label">Color de la banda</span>' +
        '<div class="swatch-row" role="radiogroup" aria-label="Color de la banda">' +
        p.colors.map(function (c, i) {
          return (
            '<button class="swatch' + (i === 0 ? " swatch--active" : "") + '" type="button" role="radio" aria-checked="' + (i === 0 ? "true" : "false") + '" data-index="' + i + '" style="--c:' + c.hex + '" data-name="' + esc(c.name) + '" title="' + esc(c.name) + '"></button>'
          );
        }).join("") +
        "</div>" +
        '<p class="swatch__name" id="swatchName">' + esc(p.colors[0].name) + "</p>" +
        "</div>"
      : "";

    const keycapHTML = p.keycaps
      ? '<div class="keycap-opt"><span class="opt-label">Tecla de inicio</span>' +
        '<div class="opt-row" role="radiogroup" aria-label="Tecla de inicio">' +
        p.keycaps.map(function (k, i) {
          return (
            '<button class="opt-chip' + (i === 0 ? " opt-chip--active" : "") + '" type="button" role="radio" aria-checked="' + (i === 0 ? "true" : "false") + '" data-index="' + i + '">' + esc(k) + "</button>"
          );
        }).join("") +
        "</div></div>"
      : "";

    const specsHTML =
      '<dl class="spec-list">' +
      p.specs.map(function (s) {
        return "<div><dt>" + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd></div>";
      }).join("") +
      "</dl>";

    root.innerHTML =
      '<section class="product__gallery">' +
      '<div class="gallery-device">' + buildDeviceHTML(p.colors ? p.colors[0].hex : "#AEB8C4") + "</div>" +
      swatchHTML +
      "</section>" +
      '<section class="product__info">' +
      (p.badge ? '<span class="product__badge">' + esc(p.badge) + "</span>" : "") +
      '<h1 class="product__name">' + esc(p.name) + "</h1>" +
      '<p class="product__price">' + fmtARS(p.price) + " <small>impuestos incluidos</small></p>" +
      '<p class="product__desc">' + esc(p.desc) + "</p>" +
      '<ul class="feature-list">' +
      p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") +
      "</ul>" +
      keycapHTML +
      (p.colors || p.keycaps ? "" : '<p class="info-note">El diseño es sorpresa: cada pack es único e ideal para sorprenderte. La banda de este pack tiene color gris mate.</p>') +
      '<div><span class="stepper-label">Cantidad</span>' +
      '<div class="stepper" role="group" aria-label="Cantidad">' +
      '<button class="qty__btn qty--minus" type="button" aria-label="Disminuir cantidad">&minus;</button>' +
      '<span class="qty__num">1</span>' +
      '<button class="qty__btn qty--plus" type="button" aria-label="Aumentar cantidad">+</button>' +
      "</div></div>" +
      '<div class="product__actions">' +
      '<button class="btn btn--primary js-add" type="button">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2 3h2.5l2.2 12.2a2 2 0 0 0 2 1.8h8.9a2 2 0 0 0 2-1.6L21 7H6"/></svg>' +
      "Agregar al carrito</button>" +
      '<button class="btn btn--ghost js-buy" type="button">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
      "Comprar ahora</button>" +
      "</div>" +
      '<p class="product__note">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>' +
      "Retiro en feria: gratis · Envío local a Isidro Casanova y alrededores: $1.500 ARS.</p>" +
      specsHTML +
      "</section>";

    function currentItem() {
      const color = p.colors ? p.colors[state.colorIndex] : null;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        qty: state.qty,
        colorName: color ? color.name : "",
        colorHex: color ? color.hex : "",
        keycap: keycap
      };
    }

    function updateGallery() {
      const device = $(".gallery-device .device", root);
      if (p.colors) {
        device.style.setProperty("--band", p.colors[state.colorIndex].hex);
        const name = $("#swatchName");
        if (name) name.textContent = p.colors[state.colorIndex].name;
      }
    }

    if (p.colors) {
      $$(".swatch", root).forEach(function (sw) {
        sw.addEventListener("click", function () {
          state.colorIndex = Number(sw.dataset.index);
          $$(".swatch", root).forEach(function (s) {
            s.classList.toggle("swatch--active", s === sw);
            s.setAttribute("aria-checked", s === sw ? "true" : "false");
          });
          updateGallery();
        });
      });
    }

    if (p.keycaps) {
      $$(".opt-chip", root).forEach(function (chip) {
        chip.addEventListener("click", function () {
          keycap = p.keycaps[Number(chip.dataset.index)];
          $$(".opt-chip", root).forEach(function (c) {
            c.classList.toggle("opt-chip--active", c === chip);
            c.setAttribute("aria-checked", c === chip ? "true" : "false");
          });
        });
      });
    }

    const numEl = $(".stepper .qty__num", root);
    $$(".stepper .qty__btn", root).forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("qty--minus")) state.qty = Math.max(1, state.qty - 1);
        else state.qty = Math.min(99, state.qty + 1);
        numEl.textContent = state.qty;
      });
    });

    $(".js-add", root).addEventListener("click", function () {
      cart.add(currentItem());
      updateBadge();
      showToast("Agregado al carrito");
    });

    $(".js-buy", root).addEventListener("click", function () {
      cart.add(currentItem());
      updateBadge();
      window.location.href = "checkout.html";
    });
  }

  function orderId() {
    return "TC-2026-" + String(Math.floor(1000 + Math.random() * 9000));
  }

  function initCheckout() {
    const wrap = $("#checkoutWrap");
    const success = $("#orderSuccess");
    if (!wrap || !success) return;

    renderCheckout();

    function renderCheckout() {
      const isDone = sessionStorage.getItem(SS_DONE) === "1";
      if (!cart.state.items.length) {
        if (isDone) {
          const last = loadLastOrder();
          if (last) {
            wrap.hidden = true;
            renderSuccess(last);
            return;
          }
        }
        wrap.innerHTML =
          '<div class="checkout__empty" style="text-align:center;padding:60px 20px;background:var(--gray-50);border-radius:20px;">' +
          "<h2>Tu carrito está vacío</h2>" +
          '<p style="color:var(--gray-600);">Agregá productos al carrito para poder continuar con el checkout.</p>' +
          '<a class="btn btn--primary" href="index.html#catalogo">Ver catálogo</a>' +
          "</div>";
        success.hidden = true;
        return;
      }
      sessionStorage.setItem(SS_DONE, "0");
      wrap.hidden = false;
      success.hidden = true;
      wrap.innerHTML = "";

      const sum = buildCheckoutHTML();
      wrap.appendChild(sum);
      bindCheckout();
    }

    function buildCheckoutHTML() {
      const form = document.createElement("form");
      form.className = "checkout__form";
      form.id = "checkoutForm";
      form.setAttribute("novalidate", "");
      const summary = document.createElement("aside");
      summary.className = "checkout__summary";

      const shipRadios = Object.keys(SHIPPING).map(function (k) {
        return (
          '<label class="radio-card">' +
          '<input class="radio-shipping-checkout" type="radio" name="shippingCheckout" value="' + k + '"' + (cart.state.shipping === k ? " checked" : "") + ">" +
          '<span><span class="radio-card__label">' + esc(SHIPPING[k].label) + "</span>" +
          '<span class="radio-card__hint">' + esc(SHIPPING[k].hint) + (k === "envio" ? " · 2 a 4 días" : "") + "</span></span>" +
          "</label>"
        );
      }).join("");

      form.innerHTML =
        '<h2>Finalizar compra</h2>' +
        '<div class="checkout__block">' +
        '<p class="checkout__block-title"><span class="step">1</span> Datos del comprador</p>' +
        '<div class="field"><label class="field__label" for="fName">Nombre y apellido <span>*</span></label>' +
        '<input class="input" type="text" id="fName" name="nombre" autocomplete="name" placeholder="Ej: Lucía Pérez">' +
        '<p class="field__error">Ingresá tu nombre y apellido.</p></div>' +
        '<div class="field-row">' +
        '<div class="field"><label class="field__label" for="fEmail">Email <span>*</span></label>' +
        '<input class="input" type="email" id="fEmail" name="email" autocomplete="email" placeholder="lucia@correo.com">' +
        '<p class="field__error">Ingresá un email con formato válido.</p></div>' +
        '<div class="field"><label class="field__label" for="fPhone">Teléfono <span>*</span></label>' +
        '<input class="input" type="tel" id="fPhone" name="telefono" autocomplete="tel" placeholder="11 2345 6789">' +
        '<p class="field__error">Ingresá un teléfono válido.</p></div>' +
        "</div>" +
        '<div class="field"><label class="field__label" for="fDestino" id="destLabel">Escuela / Curso (para retiro) <span>*</span></label>' +
        '<input class="input" type="text" id="fDestino" name="destino" placeholder="Ej: Escuela 13, 5to A">' +
        '<p class="field__error">Completá el destino de tu pedido.</p></div>' +
        "</div>" +
        '<div class="checkout__block">' +
        '<p class="checkout__block-title"><span class="step">2</span> Método de envío</p>' +
        shipRadios +
        "</div>" +
        '<div class="checkout__block">' +
        '<p class="checkout__block-title"><span class="step">3</span> Método de pago</p>' +
        '<label class="radio-card">' +
        '<input class="radio-payment" type="radio" name="payment" value="efectivo" checked>' +
        '<span class="radio-card__label">Efectivo al retirar en feria / puesto escolar</span></label>' +
        '<label class="radio-card">' +
        '<input class="radio-payment" type="radio" name="payment" value="transferencia">' +
        '<span class="radio-card__label">Transferencia / Mercado Pago <span class="radio-card__hint">simulado: mostramos el alias del emprendimiento</span></span></label>' +
        '<div class="pay-panel" id="payEfectivo">' +
        "<p class='pay-note'>Abonás en efectivo al momento de retirar tu pedido en la feria o puesto escolar. No necesitás adelantar nada.</p>" +
        "</div>" +
        '<div class="pay-panel" id="payTransfer" hidden>' +
        '<p class="pay-note">Transferí el total y adjuntá un comprobante (simulado) para confirmar tu pedido:</p>' +
        '<div class="alias-box">' +
        '<code>' + ALIAS + "</code>" +
        '<button class="alias-copy" type="button">Copiar alias</button>' +
        "</div>" +
        '<p class="pay-note">CBU: ' + CBU + "</p>" +
        '<label class="file-btn">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' +
        "Adjuntar comprobante" +
        '<input type="file" id="proof" accept=".png,.jpg,.jpeg,.pdf"></label>' +
        '<p class="file-name" id="proofName"></p>' +
        '<p class="field__error" id="proofError">Adjuntá un comprobante para el pago por transferencia.</p>' +
        "</div>" +
        "</div>" +
        '<button class="btn btn--primary btn--block checkout__submit" type="submit">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
        "Confirmar pedido</button>";

      const t = cart.totals();
      summary.innerHTML =
        "<h3>Resumen del pedido</h3>" +
        cart.state.items.map(function (it) {
          const variantParts = [];
          if (it.colorName) variantParts.push(it.colorName);
          if (it.keycap) variantParts.push(it.keycap);
          return (
            '<div class="summary-item">' +
            '<div class="thumb-box">' + buildDeviceHTML(it.colorHex) + "</div>" +
            '<div class="summary-item__info">' +
            '<span class="summary-item__name">' + esc(it.name) + "</span>" +
            (variantParts.length ? '<span class="summary-item__variant">' + esc(variantParts.join(" · ")) + "</span>" : "") +
            '<span class="summary-item__qty">Cantidad: ' + it.qty + "</span>" +
            "</div>" +
            '<span class="summary-item__price">' + fmtARS(it.price * it.qty) + "</span>" +
            "</div>"
          );
        }).join("") +
        '<div class="sum-row"><span>Subtotal</span><span class="sum-row__value">' + fmtARS(t.subtotal) + "</span></div>" +
        '<div class="sum-row" data-ship><span>Envío</span><span class="sum-row__value">' + (t.shipping === 0 ? "Gratis" : fmtARS(t.shipping)) + "</span></div>" +
        '<div class="sum-row sum-row--total" data-total><span>Total</span><span class="sum-row__value">' + fmtARS(t.total) + "</span></div>" +
        '<p class="sum-note">Prototipo escolar: los pagos y datos ingresados son simulados y no se procesan realmente.</p>';

      return form;
    }

    function bindCheckout() {
      const form = $("#checkoutForm");
      const summary = $(".checkout__summary");
      const destLabel = $("#destLabel");
      const payEfectivo = $("#payEfectivo");
      const payTransfer = $("#payTransfer");
      const proof = $("#proof");
      const proofName = $("#proofName");

      function updateDestLabel() {
        const mode = getCheckedShipping();
        const envio = mode === "envio";
        destLabel.textContent = envio ? "Dirección de entrega *" : "Escuela / Curso (para retiro) *";
        $("#fDestino").placeholder = envio ? "Ej: Av. Rivadavia 3450, Isidro Casanova" : "Ej: Escuela 13, 5to A";
      }

      function updateShippingSummary() {
        const mode = getCheckedShipping();
        const t = cart.totals();
        const shipRow = $(".checkout__summary .sum-row[data-ship]");
        const totalRow = $(".checkout__summary .sum-row[data-total]");
        if (shipRow) {
          shipRow.querySelector(".sum-row__value").textContent =
            SHIPPING[mode].price === 0 ? "Gratis" : fmtARS(SHIPPING[mode].price);
        }
        if (totalRow) {
          totalRow.querySelector(".sum-row__value").textContent = fmtARS(t.total);
        }
      }

      $$(".radio-shipping-checkout").forEach(function (r) {
        r.addEventListener("change", function () {
          if (r.checked) {
            cart.setShipping(r.value);
            updateDestLabel();
            updateShippingSummary();
          }
        });
      });

      updateDestLabel();

      $$(".radio-payment").forEach(function (r) {
        r.addEventListener("change", function () {
          const transfer = r.value === "transferencia";
          payTransfer.hidden = !transfer;
          payEfectivo.hidden = transfer;
        });
      });

      proof.addEventListener("change", function () {
        if (proof.files && proof.files.length) {
          proofName.textContent = "📎 " + proof.files[0].name;
          $("#proofError").classList.remove("show");
        } else {
          proofName.textContent = "";
        }
      });

      $(".alias-copy").addEventListener("click", function () {
        copyAlias();
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (validateCheckout()) {
          submitOrder();
        }
      });
    }

    function getCheckedShipping() {
      const checked = $('.radio-shipping-checkout:checked');
      return checked ? checked.value : cart.state.shipping;
    }

    function validateCheckout() {
      let ok = true;
      const fields = [
        { el: $("#fName"), ok: function (v) { return v.trim().length >= 3; }, msg: "Ingresá tu nombre y apellido." },
        { el: $("#fEmail"), ok: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, msg: "Ingresá un email con formato válido." },
        { el: $("#fPhone"), ok: function (v) { return v.replace(/\D/g, "").length >= 6; }, msg: "Ingresá un teléfono válido." },
        { el: $("#fDestino"), ok: function (v) { return v.trim().length >= 3; }, msg: "Completá el destino de tu pedido." }
      ];

      fields.forEach(function (f) {
        const err = f.el.parentElement.querySelector(".field__error");
        const valid = f.ok(f.el.value);
        f.el.classList.toggle("input--invalid", !valid);
        if (err) err.classList.toggle("show", !valid);
        if (!valid) ok = false;
      });

      const pay = $('.radio-payment:checked').value;
      if (pay === "transferencia" && (!$("#proof").files || !$("#proof").files.length)) {
        $("#proofError").classList.add("show");
        ok = false;
      }

      if (!ok) {
        showToast("Revisá los campos marcados");
        const firstInvalid = $(".input--invalid");
        if (firstInvalid) firstInvalid.focus();
      }
      return ok;
    }

    function submitOrder() {
      const t = cart.totals();
      const pay = $('.radio-payment:checked').value;
      const order = {
        id: orderId(),
        date: new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }),
        name: $("#fName").value.trim(),
        email: $("#fEmail").value.trim(),
        phone: $("#fPhone").value.trim(),
        destino: $("#fDestino").value.trim(),
        shipping: getCheckedShipping(),
        shippingLabel: SHIPPING[getCheckedShipping()].label,
        pay: PAYMENTS[pay],
        items: cart.state.items.map(function (it) {
          const parts = [];
          if (it.colorName) parts.push(it.colorName);
          if (it.keycap) parts.push(it.keycap);
          return { name: it.name, variant: parts.join(" · "), qty: it.qty, price: it.price };
        }),
        subtotal: t.subtotal,
        shippingPrice: t.shipping,
        total: t.total
      };

      localStorage.setItem(LS_ORDER, JSON.stringify(order));
      sessionStorage.setItem(SS_DONE, "1");
      cart.state.items = [];
      cart.save();
      updateBadge();
      renderSuccess(order);
      cartUI.close();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderSuccess(order) {
      const wrap = $("#checkoutWrap");
      wrap.hidden = true;
      const success = $("#orderSuccess");
      success.hidden = false;

      const waText = "¡Hola La Infalible! Realicé el pedido " + order.id + " de TouchClick y quiero coordinar la entrega. ¡Click, click!";

      success.innerHTML =
        '<div class="order-success__icon">' +
        '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
        "</div>" +
        "<h2>¡Gracias por tu compra!</h2>" +
        '<p class="order-success__sub">Tu pedido fue confirmado con éxito, ' + esc(order.name.split(" ")[0]) + ". Un click. Tu mente en calma.</p>" +
        '<div class="order-card">' +
        '<div class="order-card__number"><span>Número de orden</span><code>' + esc(order.id) + "</code></div>" +
        order.items.map(function (it) {
          return (
            '<div class="order-card__item">' +
            '<span class="lbl">' + esc(it.name) + (it.variant ? '<br><small>' + esc(it.variant) + "</small>" : "") + " × " + it.qty + "</span>" +
            '<span class="val">' + fmtARS(it.price * it.qty) + "</span>" +
            "</div>"
          );
        }).join("") +
        '<div class="order-card__item"><span class="lbl">Envío</span><span class="val">' + esc(order.shippingLabel) + (order.shippingPrice === 0 ? " (Gratis)" : " " + fmtARS(order.shippingPrice)) + "</span></div>" +
        '<div class="order-card__item"><span class="lbl">Pago</span><span class="val">' + esc(order.pay) + "</span></div>" +
        '<div class="order-card__item"><span class="lbl">Fecha</span><span class="val">' + esc(order.date) + "</span></div>" +
        '<div class="order-card__item"><span class="lbl" style="font-weight:800;">Total</span><span class="val" style="color:var(--primary-700);font-weight:800;">' + fmtARS(order.total) + "</span></div>" +
        "</div>" +
        '<p class="order-success__next">' +
        (order.shipping === "retiro"
          ? "Te esperamos en la feria del puesto escolar de <strong>La Infalible</strong>. Mostrá el número de orden al retirar tu pedido."
          : "Estamos coordinando la entrega local en <strong>" + esc(order.destino) + "</strong>. Te contactaremos al " + esc(order.phone) + " para confirmar el día.") +
        "</p>" +
        '<div class="order-success__actions">' +
        '<a class="btn whatsapp-btn" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(waText) + '">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4s.8 1.9.8 2c.1.1.1.3 0 .5l-.4.6c-.1.2-.3.4-.1.7.1.3.6 1 1.4 1.7 1 .8 1.8 1.1 2 1.2.3.1.4.1.6-.1l1-1.1c.2-.2.3-.3.6-.2s1.5.7 1.7.8c.2.1.4.2.4.3.1.1.1.6-.1 1.2z"/></svg>' +
        "Contactar por WhatsApp</a>" +
        '<a class="btn btn--ghost" href="index.html">Volver al inicio</a>' +
        "</div>";
    }
  }

  function loadLastOrder() {
    try {
      return JSON.parse(localStorage.getItem(LS_ORDER));
    } catch (e) {
      return null;
    }
  }

  function copyAlias() {
    const text = ALIAS;
    function done() {
      showToast("Alias copiado: " + text);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove();
      done();
    }
  }

  cartUI.build();
  updateBadge();
  initHeader();
  initSwitchDemo();

  const page = document.body.dataset.page;
  if (page === "home") {
    initHome();
  } else if (page === "product") {
    initProductPage();
  } else if (page === "checkout") {
    initCheckout();
  }
})();