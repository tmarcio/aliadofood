/* ==========================================================================
   ALIADO FOOD — Painel da equipa
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Acesso simples (protecção de conveniência, não é segurança real).
     Muda a palavra-passe abaixo. Para controlo de acessos real, liga
     este painel a um backend com autenticação (ex: Supabase Auth).
     --------------------------------------------------------------------- */
  const ADMIN_PASSWORD = "aliado2026";
  const SESSION_KEY = "aliado_admin_session";

  const ORDERS_KEY = "aliado_orders_v1";
  const COURIERS_KEY = "aliado_couriers_v1";

  const adminLogin = document.getElementById("adminLogin");
  const adminApp = document.getElementById("adminApp");

  function showApp() {
    adminLogin.style.display = "none";
    adminApp.style.display = "block";
    renderOrders();
    renderCouriers();
  }

  if (sessionStorage.getItem(SESSION_KEY) === "1") {
    showApp();
  }

  document.getElementById("adminLoginBtn").addEventListener("click", attemptLogin);
  document.getElementById("adminPass").addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
  });

  function attemptLogin() {
    const val = document.getElementById("adminPass").value;
    if (val === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      showApp();
    } else {
      document.getElementById("adminLoginError").style.display = "block";
    }
  }

  document.getElementById("adminLogout").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  /* ---------------------------------------------------------------------
     Separadores
     --------------------------------------------------------------------- */
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("is-active"));
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById("panel-" + tab.dataset.tab).classList.add("is-active");
    });
  });

  /* ---------------------------------------------------------------------
     Pedidos
     --------------------------------------------------------------------- */
  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function formatKz(v) {
    if (typeof v !== "number") return v;
    return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(v) + " Kz";
  }

  function renderOrders() {
    const orders = getOrders();
    document.getElementById("ordersCount").textContent = `${orders.length} pedido${orders.length === 1 ? "" : "s"}`;
    const list = document.getElementById("ordersList");

    if (orders.length === 0) {
      list.innerHTML = `<div class="empty-state">Ainda não há pedidos registados neste navegador.</div>`;
      return;
    }

    list.innerHTML = orders
      .map(
        (o, idx) => `
      <div class="order-card">
        <div class="order-card__head">
          <span class="order-card__ref">${o.referencia}</span>
          <span class="order-status" data-state="${o.estado}">${o.estado}${o.estafeta ? " · " + o.estafeta.nome : ""}</span>
        </div>
        <div class="order-meta">
          ${new Date(o.data).toLocaleString("pt-PT")} ·
          ${o.modo === "delivery" ? `Entrega — ${o.municipio || ""}${o.bairro ? ", " + o.bairro : ""}${o.rua ? ", " + o.rua : ""}` : "Levantamento no ponto de venda"}
          <br>${o.cliente.nome} · <a href="tel:${o.cliente.telefone}">${o.cliente.telefone}</a>
          ${o.cliente.obs ? `<br><em>Obs: ${o.cliente.obs}</em>` : ""}
        </div>
        <div class="order-items">
          ${o.itens.map((i) => `<div><span>${i.qty}× ${i.nome}</span><span>${formatKz(i.preco * i.qty)}</span></div>`).join("")}
        </div>
        <div class="order-card__footer">
          <span class="order-total">Total: ${formatKz(o.total)}</span>
          <div class="order-actions">
            ${o.modo === "delivery" ? `<button class="btn btn--secondary btn--sm" data-assign="${idx}">Atribuir estafeta</button>` : ""}
            <button class="btn btn--outline-dark btn--sm" data-deliver="${idx}" ${o.estado === "Entregue" ? "disabled" : ""}>Marcar entregue</button>
          </div>
        </div>
      </div>`
      )
      .join("");
  }

  document.getElementById("ordersList").addEventListener("click", (e) => {
    const assignIdx = e.target.closest("[data-assign]")?.dataset.assign;
    const deliverIdx = e.target.closest("[data-deliver]")?.dataset.deliver;

    if (assignIdx !== undefined) openAssignModal(Number(assignIdx));
    if (deliverIdx !== undefined) {
      const orders = getOrders();
      orders[Number(deliverIdx)].estado = "Entregue";
      saveOrders(orders);
      renderOrders();
    }
  });

  /* ---------------------------------------------------------------------
     Estafetas
     --------------------------------------------------------------------- */
  function getCouriers() {
    try {
      return JSON.parse(localStorage.getItem(COURIERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveCouriers(couriers) {
    localStorage.setItem(COURIERS_KEY, JSON.stringify(couriers));
  }

  function renderCouriers() {
    const couriers = getCouriers();
    const list = document.getElementById("couriersList");
    if (couriers.length === 0) {
      list.innerHTML = `<div class="empty-state">Ainda não há estafetas cadastrados. Clique em "+ Novo estafeta".</div>`;
      return;
    }
    list.innerHTML = couriers
      .map(
        (c, idx) => `
      <div class="courier-card">
        <div class="courier-card__top">
          <div>
            <h4>${c.nome}</h4>
            <span class="zona">${c.zona || "Zona não definida"}</span>
          </div>
        </div>
        <span>${c.telefone}</span>
        <button class="availability-toggle" data-toggle="${idx}" data-available="${c.disponivel}">
          ${c.disponivel ? "● Disponível" : "○ Ocupado"}
        </button>
        <div class="courier-card__actions">
          <a class="btn btn--whatsapp btn--sm" href="https://wa.me/${c.telefone.replace(/\D/g, "")}" target="_blank" rel="noopener">WhatsApp</a>
          <button class="btn btn--outline-dark btn--sm" data-remove-courier="${idx}">Remover</button>
        </div>
      </div>`
      )
      .join("");
  }

  document.getElementById("couriersList").addEventListener("click", (e) => {
    const toggleIdx = e.target.closest("[data-toggle]")?.dataset.toggle;
    const removeIdx = e.target.closest("[data-remove-courier]")?.dataset.removeCourier;
    const couriers = getCouriers();

    if (toggleIdx !== undefined) {
      couriers[Number(toggleIdx)].disponivel = !couriers[Number(toggleIdx)].disponivel;
      saveCouriers(couriers);
      renderCouriers();
    }
    if (removeIdx !== undefined) {
      couriers.splice(Number(removeIdx), 1);
      saveCouriers(couriers);
      renderCouriers();
    }
  });

  // Modal novo estafeta
  const courierModal = document.getElementById("courierModal");
  document.getElementById("addCourierBtn").addEventListener("click", () => {
    document.getElementById("courierNome").value = "";
    document.getElementById("courierTelefone").value = "";
    document.getElementById("courierZona").value = "";
    courierModal.classList.add("is-open");
  });
  document.getElementById("courierClose").addEventListener("click", () => courierModal.classList.remove("is-open"));
  document.getElementById("courierBackdrop").addEventListener("click", () => courierModal.classList.remove("is-open"));

  document.getElementById("courierSaveBtn").addEventListener("click", () => {
    const nome = document.getElementById("courierNome").value.trim();
    const telefone = document.getElementById("courierTelefone").value.trim();
    const zona = document.getElementById("courierZona").value.trim();
    if (!nome || !telefone) return;

    const couriers = getCouriers();
    couriers.push({ nome, telefone, zona, disponivel: true });
    saveCouriers(couriers);
    renderCouriers();
    courierModal.classList.remove("is-open");
  });

  /* ---------------------------------------------------------------------
     Atribuir estafeta a um pedido
     --------------------------------------------------------------------- */
  const assignModal = document.getElementById("assignModal");
  let assignOrderIdx = null;

  function openAssignModal(orderIdx) {
    assignOrderIdx = orderIdx;
    const couriers = getCouriers().filter((c) => c.disponivel);
    const list = document.getElementById("assignCourierList");

    if (couriers.length === 0) {
      list.innerHTML = `<div class="empty-state">Não há estafetas disponíveis de momento. Marca alguém como "Disponível" na aba Estafetas.</div>`;
    } else {
      list.innerHTML = couriers
        .map(
          (c) => `
        <div class="assign-courier-row">
          <div>
            <strong>${c.nome}</strong>
            <span>${c.zona || ""} · ${c.telefone}</span>
          </div>
          <button class="btn btn--primary btn--sm" data-pick-courier="${c.telefone}">Atribuir</button>
        </div>`
        )
        .join("");
    }
    assignModal.classList.add("is-open");
  }

  document.getElementById("assignClose").addEventListener("click", () => assignModal.classList.remove("is-open"));
  document.getElementById("assignBackdrop").addEventListener("click", () => assignModal.classList.remove("is-open"));

  document.getElementById("assignCourierList").addEventListener("click", (e) => {
    const phone = e.target.closest("[data-pick-courier]")?.dataset.pickCourier;
    if (!phone) return;
    const courier = getCouriers().find((c) => c.telefone === phone);
    const orders = getOrders();
    const order = orders[assignOrderIdx];
    order.estafeta = { nome: courier.nome, telefone: courier.telefone };
    order.estado = "Atribuído";
    saveOrders(orders);
    renderOrders();
    assignModal.classList.remove("is-open");

    // Abre o WhatsApp com os detalhes da entrega prontos para o estafeta
    const itensTxt = order.itens.map((i) => `${i.qty}x ${i.nome}`).join(", ");
    const texto =
      `Olá ${courier.nome}, tens uma nova entrega Aliado Food.%0A` +
      `*Referência:* ${order.referencia}%0A` +
      `*Cliente:* ${order.cliente.nome} (${order.cliente.telefone})%0A` +
      `*Destino:* ${order.municipio || ""}${order.bairro ? ", " + order.bairro : ""}${order.rua ? ", " + order.rua : ""}%0A` +
      `*Itens:* ${itensTxt}%0A` +
      `*Total a cobrar:* ${formatKz(order.total)}`;
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${texto}`, "_blank");
  });
})();
