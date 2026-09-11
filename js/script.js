// ============================================================
// CONFIG — troque aqui os dados reais de contato da Newmed.
// Isso atualiza automaticamente todos os botões de WhatsApp do site.
// ============================================================
const NEWMED = {
  whatsapp: "558181227330",
  whatsappLabel: "(81) 8122-7330",
  defaultMessage: "Olá! Vim pelo site e gostaria de solicitar um orçamento.",
  foundedYear: 2009,
};

document.addEventListener("DOMContentLoaded", () => {
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

    window.location.href = `mailto:comercial@newmedequipamentos.com.br?subject=${encodeURIComponent(
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
    const base = location.pathname.includes("/produto/") ? "../produtos.html" : "produtos.html";
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

// Aviso de cookies simples: aparece uma vez, guarda a escolha no navegador.
function wireCookieBanner() {
  let alreadyAccepted = false;
  try {
    alreadyAccepted = !!localStorage.getItem("newmed-cookies-ok");
  } catch (e) {}
  if (alreadyAccepted) return;

  const prefix = location.pathname.includes("/produto/") ? "../" : "";
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
