/* ==========================================================================
   ALIADO FOOD — Lógica da aplicação
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Estado
     --------------------------------------------------------------------- */
  const STORAGE_KEY = "aliado_cart_v1";
  const ORDERS_KEY = "aliado_orders_v1";

  let cart = loadCart();
  let activeCategory = "refeicoes";
  let deliveryMode = null; // "pickup" | "delivery"
  let selectedMunicipio = null;
  let currentStep = 1;

  /* ---------------------------------------------------------------------
     Utilitários
     --------------------------------------------------------------------- */
  function formatKz(valor) {
    return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(valor) + " " + ALIADO_CONFIG.moeda;
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function cartLines() {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = ALIADO_MENU.find((m) => m.id === id);
        return item ? { ...item, qty } : null;
      })
      .filter(Boolean);
  }

  function cartSubtotal() {
    return cartLines().reduce((sum, l) => sum + l.preco * l.qty, 0);
  }

  function cartCount() {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }

  function gerarReferencia() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AF-${y}${m}${d}-${rand}`;
  }

  function calcularTaxaEntrega(municipioId) {
    const mun = ALIADO_MUNICIPIOS.find((m) => m.id === municipioId);
    if (!mun) return null;
    if (mun.sobConsulta || mun.distanciaKm == null) return { sobConsulta: true };
    const kmExtra = Math.max(0, mun.distanciaKm - ALIADO_CONFIG.kmIncluidos);
    let valor = ALIADO_CONFIG.taxaBaseKz + kmExtra * ALIADO_CONFIG.precoPorKmExtraKz;
    const passo = ALIADO_CONFIG.arredondarParaKz;
    valor = Math.round(valor / passo) * passo;
    return { valor };
  }

  /* ---------------------------------------------------------------------
     Render: cardápio
     --------------------------------------------------------------------- */
  const menuGrid = document.getElementById("menuGrid");

  function iconForQty(id) {
    const qty = cart[id] || 0;
    if (qty === 0) {
      return `<button class="add-btn" data-add="${id}">Adicionar</button>`;
    }
    return `
      <div class="qty-stepper">
        <button data-dec="${id}" aria-label="Diminuir quantidade">−</button>
        <span>${qty}</span>
        <button data-inc="${id}" aria-label="Aumentar quantidade">+</button>
      </div>`;
  }

  function renderMenu() {
    const items = ALIADO_MENU.filter((m) => m.category === activeCategory);
    menuGrid.innerHTML = items
      .map(
        (item) => `
      <article class="menu-card">
        ${item.tag ? `<span class="menu-card__tag">${item.tag}</span>` : ""}
        <div class="menu-card__top">
          <h3>${item.nome}</h3>
        </div>
        <p>${item.desc}</p>
        <div class="menu-card__footer">
          <span class="menu-card__price">${formatKz(item.preco)}</span>
          <div data-qty-holder="${item.id}">${iconForQty(item.id)}</div>
        </div>
      </article>`
      )
      .join("");
  }

  menuGrid.addEventListener("click", (e) => {
    const addId = e.target.closest("[data-add]")?.dataset.add;
    const incId = e.target.closest("[data-inc]")?.dataset.inc;
    const decId = e.target.closest("[data-dec]")?.dataset.dec;
    const id = addId || incId || decId;
    if (!id) return;

    if (addId || incId) cart[id] = (cart[id] || 0) + 1;
    if (decId) {
      cart[id] = (cart[id] || 0) - 1;
      if (cart[id] <= 0) delete cart[id];
    }
    saveCart();
    const holder = menuGrid.querySelector(`[data-qty-holder="${id}"]`);
    if (holder) holder.innerHTML = iconForQty(id);
    updateCartUI();
  });

  document.querySelectorAll(".menu-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".menu-tab").forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      activeCategory = tab.dataset.category;
      renderMenu();
    });
  });

  /* ---------------------------------------------------------------------
     Render: parceiros e actividades
     --------------------------------------------------------------------- */
  document.getElementById("partnersGrid").innerHTML = ALIADO_PARCEIROS.map(
    (p) => `
    <div class="partner-card">
      <div class="partner-card__mark">${p.iniciais}</div>
      <h4>${p.nome}</h4>
      <p>${p.desc}</p>
    </div>`
  ).join("");

  document.getElementById("activitiesGrid").innerHTML = ALIADO_ACTIVIDADES.map(
    (a) => `
    <div class="activity-card">
      <span class="activity-card__date">${a.data}</span>
      <h3>${a.titulo}</h3>
      <p>${a.desc}</p>
    </div>`
  ).join("");

  /* ---------------------------------------------------------------------
     Carrinho: drawer
     --------------------------------------------------------------------- */
  const cartDrawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  const cartItemsEl = document.getElementById("cartItems");
  const cartCountEl = document.getElementById("cartCount");
  const cartSubtotalEl = document.getElementById("cartSubtotal");

  function openCart() {
    cartDrawer.classList.add("is-open");
    overlay.classList.add("is-open");
  }
  function closeCart() {
    cartDrawer.classList.remove("is-open");
    if (!document.getElementById("checkoutModal").classList.contains("is-open")) {
      overlay.classList.remove("is-open");
    }
  }

  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", () => {
    closeCart();
    closeCheckout();
  });

  function updateCartUI() {
    const lines = cartLines();
    cartCountEl.textContent = cartCount();
    cartSubtotalEl.textContent = formatKz(cartSubtotal());

    if (lines.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <p>O seu carrinho está vazio.<br>Explore o cardápio e adicione os seus favoritos.</p>
        </div>`;
      document.getElementById("checkoutBtn").disabled = true;
    } else {
      cartItemsEl.innerHTML = lines
        .map(
          (l) => `
        <div class="cart-item">
          <div class="cart-item__info">
            <h4>${l.nome}</h4>
            <span>${l.qty} × ${formatKz(l.preco)}</span>
            <button class="cart-item__remove" data-remove="${l.id}">Remover</button>
          </div>
          <strong>${formatKz(l.preco * l.qty)}</strong>
        </div>`
        )
        .join("");
      document.getElementById("checkoutBtn").disabled = false;
    }
  }

  cartItemsEl.addEventListener("click", (e) => {
    const id = e.target.closest("[data-remove]")?.dataset.remove;
    if (!id) return;
    delete cart[id];
    saveCart();
    updateCartUI();
    renderMenu();
  });

  /* ---------------------------------------------------------------------
     Checkout: modal e passos
     --------------------------------------------------------------------- */
  const checkoutModal = document.getElementById("checkoutModal");
  const municipioSelect = document.getElementById("municipioSelect");

  municipioSelect.innerHTML =
    `<option value="">Seleccione o seu município</option>` +
    ALIADO_MUNICIPIOS.map((m) => `<option value="${m.id}">${m.nome}</option>`).join("");

  function openCheckout() {
    if (cartCount() === 0) return;
    checkoutModal.classList.add("is-open");
    overlay.classList.add("is-open");
    goToStep(1);
  }
  function closeCheckout() {
    checkoutModal.classList.remove("is-open");
    if (!cartDrawer.classList.contains("is-open")) {
      overlay.classList.remove("is-open");
    }
  }

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    closeCart();
    openCheckout();
  });
  document.getElementById("checkoutClose").addEventListener("click", closeCheckout);
  document.getElementById("checkoutBackdrop").addEventListener("click", closeCheckout);

  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll(".checkout-step").forEach((el) => {
      el.classList.toggle("is-active", Number(el.dataset.step) === step);
    });
    document.querySelectorAll(".checkout-progress span").forEach((el) => {
      el.classList.toggle("is-active", Number(el.dataset.step) <= step);
    });
    if (step === 4) renderOrderSummary();
  }

  // Passo 1 — modo de entrega
  const optPickup = document.getElementById("optPickup");
  const optDelivery = document.getElementById("optDelivery");
  const toStep2Btn = document.getElementById("toStep2");

  function selectMode(mode) {
    deliveryMode = mode;
    optPickup.setAttribute("aria-pressed", String(mode === "pickup"));
    optDelivery.setAttribute("aria-pressed", String(mode === "delivery"));
    toStep2Btn.disabled = false;
  }
  optPickup.addEventListener("click", () => selectMode("pickup"));
  optDelivery.addEventListener("click", () => selectMode("delivery"));
  toStep2Btn.addEventListener("click", () => {
    syncAddressStepVisibility();
    goToStep(2);
  });

  // Passo 2 — morada / município
  const addressFields = document.getElementById("addressFields");
  const pickupNote = document.getElementById("pickupNote");
  const deliveryFeeBox = document.getElementById("deliveryFeeBox");
  const deliveryFeeValue = document.getElementById("deliveryFeeValue");
  const municipioError = document.getElementById("municipioError");

  document.getElementById("backStep1").addEventListener("click", () => goToStep(1));

  municipioSelect.addEventListener("change", () => {
    selectedMunicipio = municipioSelect.value || null;
    municipioSelect.parentElement.classList.remove("has-error");
    municipioError.classList.remove("is-visible");
    if (!selectedMunicipio) {
      deliveryFeeBox.classList.remove("is-visible");
      return;
    }
    const taxa = calcularTaxaEntrega(selectedMunicipio);
    deliveryFeeBox.classList.add("is-visible");
    if (taxa.sobConsulta) {
      deliveryFeeValue.textContent = "Sob consulta via WhatsApp";
    } else {
      deliveryFeeValue.textContent = formatKz(taxa.valor);
    }
  });

  document.getElementById("toStep3").addEventListener("click", () => {
    if (deliveryMode === "delivery") {
      if (!selectedMunicipio) {
        municipioSelect.parentElement.classList.add("has-error");
        municipioError.classList.add("is-visible");
        return;
      }
    }
    goToStep(3);
  });

  function syncAddressStepVisibility() {
    const isDelivery = deliveryMode === "delivery";
    addressFields.style.display = isDelivery ? "block" : "none";
    pickupNote.style.display = isDelivery ? "none" : "block";
  }

  // Passo 3 — dados do cliente
  document.getElementById("backStep2").addEventListener("click", () => {
    syncAddressStepVisibility();
    goToStep(2);
  });

  const clienteNome = document.getElementById("clienteNome");
  const clienteTelefone = document.getElementById("clienteTelefone");

  document.getElementById("toStep4").addEventListener("click", () => {
    let ok = true;
    [clienteNome, clienteTelefone].forEach((input) => {
      const field = input.closest(".form-field");
      const isEmpty = input.value.trim() === "";
      field.classList.toggle("has-error", isEmpty);
      field.querySelector(".field-error")?.classList.toggle("is-visible", isEmpty);
      if (isEmpty) ok = false;
    });
    if (!ok) return;
    syncAddressStepVisibility();
    goToStep(4);
  });

  document.getElementById("backStep3").addEventListener("click", () => goToStep(3));

  // Passo 4 — resumo
  function renderOrderSummary() {
    const lines = cartLines();
    const subtotal = cartSubtotal();
    const taxa = deliveryMode === "delivery" ? calcularTaxaEntrega(selectedMunicipio) : { valor: 0 };
    const taxaValor = taxa && !taxa.sobConsulta ? taxa.valor : 0;
    const total = subtotal + taxaValor;

    document.getElementById("orderSummary").innerHTML = `
      <div class="form-field"><strong>${deliveryMode === "pickup" ? "Levantamento no ponto de venda" : "Entrega ao domicílio"}</strong></div>
      ${
        deliveryMode === "delivery"
          ? `<p style="margin:0 0 12px;color:var(--ink-soft);font-size:0.9rem;">
              ${ALIADO_MUNICIPIOS.find((m) => m.id === selectedMunicipio)?.nome || ""}
              ${document.getElementById("bairroInput").value ? " · " + document.getElementById("bairroInput").value : ""}
              ${document.getElementById("ruaInput").value ? " · " + document.getElementById("ruaInput").value : ""}
            </p>`
          : ""
      }
      <p style="margin:0;font-size:0.9rem;color:var(--ink-soft);">
        ${clienteNome.value} · ${clienteTelefone.value}
      </p>
      ${lines
        .map((l) => `<div class="cart-summary-row"><span>${l.qty}× ${l.nome}</span><span>${formatKz(l.preco * l.qty)}</span></div>`)
        .join("")}
    `;

    document.getElementById("summarySubtotal").textContent = formatKz(subtotal);
    document.getElementById("summaryDelivery").textContent =
      taxa && taxa.sobConsulta ? "Sob consulta" : formatKz(taxaValor);
    document.getElementById("summaryTotal").textContent = formatKz(total);
  }

  // Passo 5 — confirmação
  document.getElementById("confirmOrder").addEventListener("click", () => {
    const referencia = gerarReferencia();
    const lines = cartLines();
    const subtotal = cartSubtotal();
    const taxa = deliveryMode === "delivery" ? calcularTaxaEntrega(selectedMunicipio) : { valor: 0 };
    const taxaValor = taxa && !taxa.sobConsulta ? taxa.valor : 0;
    const total = subtotal + taxaValor;

    const pedido = {
      referencia,
      data: new Date().toISOString(),
      modo: deliveryMode,
      municipio: deliveryMode === "delivery" ? ALIADO_MUNICIPIOS.find((m) => m.id === selectedMunicipio)?.nome : null,
      bairro: document.getElementById("bairroInput").value || null,
      rua: document.getElementById("ruaInput").value || null,
      cliente: {
        nome: clienteNome.value,
        telefone: clienteTelefone.value,
        email: document.getElementById("clienteEmail").value || null,
        obs: document.getElementById("clienteObs").value || null,
      },
      itens: lines.map((l) => ({ nome: l.nome, qty: l.qty, preco: l.preco })),
      subtotal,
      taxaEntrega: taxa && taxa.sobConsulta ? "sob consulta" : taxaValor,
      total: taxa && taxa.sobConsulta ? subtotal : total,
      estafeta: null,
      estado: "Pendente",
    };

    saveOrder(pedido);
    buildWhatsappLink(pedido);
    document.getElementById("confirmationRef").textContent = referencia;
    goToStep(5);

    // limpar carrinho
    cart = {};
    saveCart();
    updateCartUI();
    renderMenu();
  });

  function buildWhatsappLink(pedido) {
    const itensTxt = pedido.itens.map((i) => `• ${i.qty}x ${i.nome} — ${formatKz(i.preco * i.qty)}`).join("%0A");
    const enderecoTxt =
      pedido.modo === "delivery"
        ? `%0A*Entrega para:* ${pedido.municipio}${pedido.bairro ? ", " + pedido.bairro : ""}${pedido.rua ? ", " + pedido.rua : ""}`
        : `%0A*Levantamento no ponto de venda Aliado Food*`;

    const texto =
      `*Novo pedido Aliado Food*%0A` +
      `*Referência:* ${pedido.referencia}%0A` +
      `*Cliente:* ${pedido.cliente.nome} (${pedido.cliente.telefone})%0A` +
      enderecoTxt +
      `%0A%0A*Itens:*%0A${itensTxt}` +
      `%0A%0A*Subtotal:* ${formatKz(pedido.subtotal)}` +
      `%0A*Taxa de entrega:* ${typeof pedido.taxaEntrega === "number" ? formatKz(pedido.taxaEntrega) : "sob consulta"}` +
      `%0A*Total:* ${formatKz(pedido.total)}` +
      (pedido.cliente.obs ? `%0A%0A*Observações:* ${pedido.cliente.obs}` : "");

    document.getElementById("whatsappOrderBtn").href = `https://wa.me/${ALIADO_CONFIG.whatsapp}?text=${texto}`;
  }

  function saveOrder(pedido) {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];
      orders.unshift(pedido);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn("Não foi possível guardar o pedido localmente.", e);
    }
  }

  document.getElementById("closeConfirmation").addEventListener("click", () => {
    closeCheckout();
    // reset do fluxo para o próximo pedido
    deliveryMode = null;
    selectedMunicipio = null;
    optPickup.setAttribute("aria-pressed", "false");
    optDelivery.setAttribute("aria-pressed", "false");
    toStep2Btn.disabled = true;
    municipioSelect.value = "";
    document.getElementById("bairroInput").value = "";
    document.getElementById("ruaInput").value = "";
    deliveryFeeBox.classList.remove("is-visible");
    clienteNome.value = "";
    clienteTelefone.value = "";
    document.getElementById("clienteEmail").value = "";
    document.getElementById("clienteObs").value = "";
  });

  /* ---------------------------------------------------------------------
     Formulário "Trabalhe Connosco" — feedback de envio (FormSubmit)
     --------------------------------------------------------------------- */
  const workForm = document.getElementById("workForm");
  if (workForm) {
    const params = new URLSearchParams(location.search);
    if (params.get("candidatura") === "enviada") {
      document.getElementById("workFormSuccess").classList.add("is-visible");
      // limpa o parâmetro do URL sem recarregar a página
      history.replaceState(null, "", location.pathname + location.hash);
    }
  }

  /* ---------------------------------------------------------------------
     Navegação mobile
     --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------------------------------------------------------------------
     Inicialização
     --------------------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  renderMenu();
  updateCartUI();
})();
