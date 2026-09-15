// ============================================================
// CONFIG — troque aqui os dados reais de contato da Newmed.
// Isso atualiza automaticamente todos os botões de WhatsApp do site.
// ============================================================
const NEWMED = {
  whatsapp: "558181227330",
  whatsappLabel: "(81) 8122-7330",
  defaultMessage: "Olá! Vim pelo site e gostaria de solicitar um orçamento.",
  foundedYear: 2009,
  telefone: "(81) 3128-2222",
  email: "comercial@newmedequipamentos.com.br",
  endereco: "Rua Doutor Manoel de Almeida Belo, 700 — Bairro Novo, Olinda - PE, CEP 53030-030",
  horario: "08h às 17h",
  // Mesmas categorias/IDs usados nos .cat-block de produtos.html —
  // reaproveitado pela página produto-dinamico.html (produtos do painel admin).
  categorias: {
    "aparelhos-de-pressa-o-digital": "Aparelhos de Pressão Digital",
    "cardiotoco-grafos": "Cardiotocógrafos",
    "detectores-fetais": "Detectores Fetais",
    "eletrocardio-grafos": "Eletrocardiógrafos",
    "monitor-dopler-vascular": "Monitor Dopler Vascular",
    "monitores": "Monitores",
    "sensores-de-oximetria": "Sensores de Oximetria",
    "tensio-metros-e-estetosco-pios": "Tensiômetros e Estetoscópios",
    "cardioversores": "Cardioversores",
    "desfibrilador-externo-automa-tico": "Desfibrilador Externo Automático (DEA)",
    "desfibriladores": "Desfibriladores",
    "pa-s-adesivas": "Pás Adesivas",
    "material-de-resgate-aph": "Material de Resgate — APH",
    "aspiradores-cirurgicos": "Aspiradores Cirúrgicos",
    "inaladores-e-nebulizadores": "Inaladores e Nebulizadores",
    "oxigenac-a-o": "Oxigenação",
    "baterias": "Baterias",
    "brac-adeiras": "Braçadeiras",
    "cabos-de-ecg-05": "Cabos de ECG 05 Vias",
    "cabos-de-ecg-10-vias": "Cabos de ECG 10 Vias",
    "conectores-pni": "Conectores PNI",
    "conjunto-de-peras-e-cardioclips": "Conjunto de Peras e Cardioclips",
    "papeis-para-eletrocardio-grafo": "Papéis para Eletrocardiógrafo",
    "papeis-para-ultrassonografia": "Papéis para Ultrassonografia",
    "balancas": "Balanças",
    "carrinhos": "Carrinhos",
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
  wireConfigFields();
  await wireDynamicProducts();
  wireWhatsappLinks();
  wireHeaderScroll();
  wireMobileNav();
  wireActiveNavLink();
  wireScrollReveal();
  wireCategoryFilter();
  wireSearchFromQuery();
  wireHeaderSearch();
  wireContactForm();
  wireFooterYear();
  wirePhotoSlideshows();
  wireYearsSince();
  wireCookieBanner();
});

// "../" quando a página está uma pasta abaixo da raiz (produto/ ou admin/).
function pagePrefix() {
  return /\/(produto|admin)\//.test(location.pathname) ? "../" : "";
}

// Busca data/config.json e sobrescreve os valores padrão do NEWMED acima.
// Roda antes de tudo mais no DOMContentLoaded — se falhar, os valores
// padrão (os mesmos que já estavam no código) continuam valendo.
async function loadConfig() {
  const prefix = pagePrefix();
  try {
    const res = await fetch(`${prefix}data/config.json`, { cache: "no-store" });
    if (res.ok) Object.assign(NEWMED, await res.json());
  } catch (e) {}
}

// Preenche [data-config="campo"] com o valor de NEWMED[campo], e monta os
// links de telefone/e-mail em [data-config-href-tel]/[data-config-href-mail].
function wireConfigFields() {
  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (NEWMED[key] !== undefined) el.textContent = NEWMED[key];
  });
  document.querySelectorAll("[data-config-href-tel]").forEach((el) => {
    el.href = `tel:+55${NEWMED.telefone.replace(/\D/g, "")}`;
  });
  document.querySelectorAll("[data-config-href-mail]").forEach((el) => {
    el.href = `mailto:${NEWMED.email}`;
  });
}

// Preenche todo link com [data-wa] usando o número central acima.
// Aceita data-wa-msg para uma mensagem específica daquele botão.
function wireWhatsappLinks() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const msg = el.getAttribute("data-wa-msg") || NEWMED.defaultMessage;
    el.href = `https://wa.me/${NEWMED.whatsapp}?text=${encodeURIComponent(msg)}`;
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  document.querySelectorAll("[data-wa-label]").forEach((el) => {
    el.textContent = NEWMED.whatsappLabel;
  });
}

function wireHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function wireMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    })
  );
}

function wireActiveNavLink() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });
}

function wireScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
}

// Filtro por grupo + busca por texto na página de Produtos
function wireCategoryFilter() {
  const filterBar = document.querySelector(".cat-filter");
  const searchInput = document.querySelector("#produto-search");
  const groups = document.querySelectorAll(".cat-group");
  const emptyState = document.querySelector("#produtos-empty");
  if (!groups.length) return;

  const hasCatBlocks = !!document.querySelector(".cat-block");
  let activeFilter = "todos";

  function applyFilters() {
    const term = (searchInput?.value || "").trim().toLowerCase();
    let anyVisible = false;

    groups.forEach((group) => {
      const groupKey = group.getAttribute("data-group");
      const groupMatches = activeFilter === "todos" || activeFilter === groupKey;
      let groupHasVisible = false;

      if (hasCatBlocks) {
        group.querySelectorAll(".cat-block").forEach((block) => {
          const blockName = (block.getAttribute("data-name") || "").toLowerCase();
          const blockMatches = !term || blockName.includes(term);
          let blockHasVisibleCard = false;

          block.querySelectorAll(".product-card").forEach((card) => {
            const text = (card.getAttribute("data-name") || "").toLowerCase();
            const visible = groupMatches && (blockMatches || text.includes(term));
            card.style.display = visible ? "" : "none";
            if (visible) blockHasVisibleCard = true;
          });

          block.style.display = blockHasVisibleCard ? "" : "none";
          if (blockHasVisibleCard) groupHasVisible = true;
        });
      } else {
        group.querySelectorAll(".cat-card").forEach((card) => {
          const text = (card.getAttribute("data-name") || "").toLowerCase();
          const matchesTerm = !term || text.toLowerCase().includes(term);
          const visible = groupMatches && matchesTerm;
          card.style.display = visible ? "" : "none";
          if (visible) groupHasVisible = true;
        });
      }

      group.style.display = groupHasVisible ? "" : "none";
      if (groupHasVisible) anyVisible = true;
    });

    if (emptyState) emptyState.style.display = anyVisible ? "none" : "block";
  }

  filterBar?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    filterBar.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.getAttribute("data-filter");
    applyFilters();
  });

  searchInput?.addEventListener("input", applyFilters);
  applyFilters();
}

// Sem backend: monta um e-mail pré-preenchido com os dados do formulário.
function wireContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = data.get("nome") || "";
    const email = data.get("email") || "";
    const telefone = data.get("telefone") || "";
    const categoria = data.get("categoria") || "";
    const mensagem = data.get("mensagem") || "";

    const subject = `Contato pelo site — ${nome}`;
    const body =
      `Nome: ${nome}\n` +
      `E-mail: ${email}\n` +
      `Telefone: ${telefone}\n` +
      `Categoria de interesse: ${categoria}\n\n` +
      `Mensagem:\n${mensagem}`;

    window.location.href = `mailto:${NEWMED.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  });
}

function wireFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

// Calcula "anos de mercado" a partir do ano de fundação, pra nunca ficar desatualizado.
function wireYearsSince() {
  const years = new Date().getFullYear() - NEWMED.foundedYear;
  document.querySelectorAll("[data-years-since]").forEach((el) => {
    el.textContent = el.textContent.replace(/\d+/, years);
  });
}

// Alterna entre as fotos de um .photo-slideshow com fade, uma de cada vez.
function wirePhotoSlideshows() {
  document.querySelectorAll(".photo-slideshow").forEach((el) => {
    const imgs = el.querySelectorAll("img");
    if (imgs.length < 2) return;
    let i = 0;
    setInterval(() => {
      imgs[i].classList.remove("is-active");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("is-active");
    }, 3500);
  });
}

// Ícone de busca no cabeçalho: abre um campo e manda o termo pra página de produtos.
function wireHeaderSearch() {
  const toggle = document.querySelector(".header-search-toggle");
  const panel = document.querySelector(".header-search-panel");
  if (!toggle || !panel) return;
  const input = panel.querySelector("input");

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) setTimeout(() => input.focus(), 150);
  });

  panel.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    const base = `${pagePrefix()}produtos.html`;
    window.location.href = `${base}?q=${encodeURIComponent(q)}`;
  });
}

// Se produtos.html foi aberta com ?q=..., já preenche a busca e filtra.
function wireSearchFromQuery() {
  const input = document.querySelector("#produto-search");
  if (!input) return;
  const q = new URLSearchParams(location.search).get("q");
  if (q) {
    input.value = q;
    input.dispatchEvent(new Event("input"));
  }
}

const escapeHtml = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Cria o bloco .cat-block de uma categoria nova (criada pelo painel admin)
// dentro do .cat-group certo, do mesmo jeito que os 26 originais — só entra
// em ação se a categoria ainda não existir na página.
function ensureCategoryBlock(cat) {
  let block = document.querySelector(`.cat-block[id="${cat.id}"]`);
  if (block) return block;

  const group = document.querySelector(`.cat-group[data-group="${cat.grupo}"]`);
  if (!group) return null;

  block = document.createElement("div");
  block.className = "cat-block";
  block.id = cat.id;
  block.setAttribute("data-name", cat.nome);
  block.innerHTML =
    `<div class="cat-block-head">` +
    `<div class="cat-block-icon"><i class="${cat.icone || "fa-solid fa-box"}"></i></div>` +
    `<h3>${escapeHtml(cat.nome)}</h3>` +
    `<span class="cat-block-count">0 produtos</span>` +
    `</div>` +
    `<div class="product-grid"></div>`;
  group.appendChild(block);
  return block;
}

// Produtos cadastrados pelo painel admin (data/produtos-novos.json) entram
// no grid da categoria certa antes de tudo mais rodar, pra busca/filtro já
// enxergarem esses cards junto com os produtos estáticos. Categorias novas
// (data/categorias-novas.json) são criadas na hora, se ainda não existirem.
async function wireDynamicProducts() {
  if (!document.querySelector(".cat-block")) return;
  const prefix = pagePrefix();

  let produtos = [];
  let categorias = [];
  try {
    const [resP, resC] = await Promise.all([
      fetch(`${prefix}data/produtos-novos.json`, { cache: "no-store" }),
      fetch(`${prefix}data/categorias-novas.json`, { cache: "no-store" }),
    ]);
    if (resP.ok) produtos = await resP.json();
    if (resC.ok) categorias = await resC.json();
  } catch (e) {
    return;
  }
  if (!Array.isArray(produtos) || !produtos.length) return;

  const categoriasPorId = {};
  (Array.isArray(categorias) ? categorias : []).forEach((c) => {
    if (c && c.id) categoriasPorId[c.id] = c;
  });

  produtos.forEach((p, i) => {
    if (!p || !p.nome || !p.categoria) return;
    let block = document.querySelector(`.cat-block[id="${p.categoria}"]`);
    if (!block && categoriasPorId[p.categoria]) {
      block = ensureCategoryBlock(categoriasPorId[p.categoria]);
    }
    const grid = block?.querySelector(".product-grid");
    if (!grid) return;

    const nome = escapeHtml(p.nome);
    const foto = `${prefix}${String(p.foto || "").replace(/^\//, "")}`;

    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-name", p.nome);
    card.innerHTML =
      `<div class="product-card-img"><img src="${foto}" alt="${nome}" loading="lazy"></div>` +
      `<div class="product-card-body">` +
      `<h4>${nome}</h4>` +
      `<div class="product-card-actions">` +
      `<a href="${prefix}produto-dinamico.html?id=${encodeURIComponent(p.id || i)}" class="cat-card-link">Ver detalhes <i class="fa-solid fa-arrow-right"></i></a>` +
      `<a href="#" class="product-card-wa" data-wa data-wa-msg="Olá! Gostaria de solicitar um orçamento de: ${nome.toUpperCase()}" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` +
      `</div></div>`;
    grid.appendChild(card);

    const countEl = block.querySelector(".cat-block-count");
    if (countEl) {
      const current = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = `${current + 1} produtos`;
    }
  });
}

// Aviso de cookies simples: aparece uma vez, guarda a escolha no navegador.
function wireCookieBanner() {
  let alreadyAccepted = false;
  try {
    alreadyAccepted = !!localStorage.getItem("newmed-cookies-ok");
  } catch (e) {}
  if (alreadyAccepted) return;

  const prefix = pagePrefix();
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML =
    `<p>Usamos cookies apenas para lembrar que você já viu este aviso — não fazemos rastreamento de terceiros no momento. Saiba mais na nossa <a href="${prefix}privacidade.html">Política de Privacidade</a>.</p>` +
    `<div class="cookie-banner-actions"><button type="button" class="btn btn-primary btn-sm">Entendi</button></div>`;
  document.body.appendChild(banner);

  banner.querySelector("button").addEventListener("click", () => {
    try {
      localStorage.setItem("newmed-cookies-ok", "1");
    } catch (e) {}
    banner.remove();
  });
}
