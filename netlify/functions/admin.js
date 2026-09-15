const OWNER = "pauloh1987";
const REPO = "sitenewmed";
const BRANCH = "main";
const PRODUCTS_PATH = "data/produtos-novos.json";
const CATEGORIES_PATH = "data/categorias-novas.json";
const CONFIG_PATH = "data/config.json";
const EDITS_PATH = "data/produtos-editados.json";
const HIDDEN_PATH = "data/produtos-ocultos.json";
const MEDIA_DIR = "img/produtos-novos";

function slugify(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function githubRequest(path, options = {}) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function readJson(path) {
  const res = await githubRequest(`${path}?ref=${BRANCH}`);
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new Error(`Falha ao ler ${path} (${res.status}).`);
  const json = await res.json();
  return { data: JSON.parse(Buffer.from(json.content, "base64").toString("utf-8")), sha: json.sha };
}

async function writeJson(path, data, sha, message) {
  const content = Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString("base64");
  const res = await githubRequest(path, {
    method: "PUT",
    body: JSON.stringify({ message, content, sha: sha || undefined, branch: BRANCH }),
  });
  if (!res.ok) throw new Error(`Falha ao salvar ${path} (${res.status}).`);
}

async function uploadPhoto(nome, fotoBase64, fotoNome) {
  if (!fotoBase64 || !fotoNome) return "";
  const ext = (fotoNome.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${MEDIA_DIR}/${slugify(nome)}-${Date.now()}.${ext}`;
  const res = await githubRequest(path, {
    method: "PUT",
    body: JSON.stringify({ message: `Admin: foto de ${nome}`, content: fotoBase64, branch: BRANCH }),
  });
  if (!res.ok) throw new Error(`Falha ao enviar a foto (${res.status}).`);
  return path;
}

async function addProduct({ nome, categoria, descricao, fotoBase64, fotoNome }) {
  if (!nome || !categoria) throw new Error("Nome e categoria são obrigatórios.");
  const { data: current, sha } = await readJson(PRODUCTS_PATH);
  const list = current || [];
  const fotoPath = await uploadPhoto(nome, fotoBase64, fotoNome);
  const id = `${slugify(nome)}-${Date.now().toString(36)}`;
  list.push({ id, nome: nome.trim(), categoria, descricao: descricao ? descricao.trim() : "", foto: fotoPath });
  await writeJson(PRODUCTS_PATH, list, sha, `Admin: adiciona produto "${nome}"`);
  return ok({ id });
}

async function updateProduct({ id, nome, categoria, descricao, fotoBase64, fotoNome }) {
  const { data: current, sha } = await readJson(PRODUCTS_PATH);
  const list = current || [];
  const i = list.findIndex((p) => p.id === id);
  if (i === -1) throw new Error("Produto não encontrado.");
  const fotoPath = fotoBase64 ? await uploadPhoto(nome || list[i].nome, fotoBase64, fotoNome) : list[i].foto;
  list[i] = {
    id,
    nome: nome ? nome.trim() : list[i].nome,
    categoria: categoria || list[i].categoria,
    descricao: descricao !== undefined ? String(descricao).trim() : list[i].descricao,
    foto: fotoPath,
  };
  await writeJson(PRODUCTS_PATH, list, sha, `Admin: edita produto "${list[i].nome}"`);
  return ok({});
}

async function deleteProduct({ id }) {
  const { data: current, sha } = await readJson(PRODUCTS_PATH);
  const list = current || [];
  const i = list.findIndex((p) => p.id === id);
  if (i === -1) throw new Error("Produto não encontrado.");
  const [removed] = list.splice(i, 1);
  await writeJson(PRODUCTS_PATH, list, sha, `Admin: remove produto "${removed?.nome || ""}"`);
  return ok({});
}

async function addCategory({ nome, grupo, icone }) {
  if (!nome || !grupo) throw new Error("Nome e grupo são obrigatórios.");
  const { data: current, sha } = await readJson(CATEGORIES_PATH);
  const list = current || [];
  const id = slugify(nome);
  if (list.some((c) => c.id === id)) throw new Error("Já existe uma categoria com esse nome.");
  list.push({ id, nome: nome.trim(), grupo, icone: icone || "fa-solid fa-box" });
  await writeJson(CATEGORIES_PATH, list, sha, `Admin: cria categoria "${nome}"`);
  return ok({ id });
}

async function updateOriginal({ slug, nome, categoria, descricao, fotoBase64, fotoNome }) {
  if (!slug) throw new Error("Produto não encontrado.");
  const { data: current, sha } = await readJson(EDITS_PATH);
  const edits = current || {};
  const fotoPath = fotoBase64 ? await uploadPhoto(nome || slug, fotoBase64, fotoNome) : undefined;
  edits[slug] = {
    ...(edits[slug] || {}),
    ...(nome !== undefined && nome !== "" ? { nome: nome.trim() } : {}),
    ...(categoria !== undefined && categoria !== "" ? { categoria } : {}),
    ...(descricao !== undefined ? { descricao: String(descricao).trim() } : {}),
    ...(fotoPath ? { foto: fotoPath } : {}),
  };
  await writeJson(EDITS_PATH, edits, sha, `Admin: edita produto original "${slug}"`);
  return ok({});
}

async function setHidden({ slug, hidden }) {
  if (!slug) throw new Error("Produto não encontrado.");
  const { data: current, sha } = await readJson(HIDDEN_PATH);
  const list = current || [];
  const has = list.includes(slug);
  let next = list;
  if (hidden && !has) next = [...list, slug];
  if (!hidden && has) next = list.filter((s) => s !== slug);
  await writeJson(HIDDEN_PATH, next, sha, `Admin: ${hidden ? "oculta" : "reexibe"} produto "${slug}"`);
  return ok({});
}

async function saveConfig(body) {
  const { whatsapp, whatsappLabel, defaultMessage, telefone, email, endereco, horario } = body;
  const { data: current, sha } = await readJson(CONFIG_PATH);
  const cfg = {
    ...(current || {}),
    ...(whatsapp !== undefined ? { whatsapp } : {}),
    ...(whatsappLabel !== undefined ? { whatsappLabel } : {}),
    ...(defaultMessage !== undefined ? { defaultMessage } : {}),
    ...(telefone !== undefined ? { telefone } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(endereco !== undefined ? { endereco } : {}),
    ...(horario !== undefined ? { horario } : {}),
  };
  await writeJson(CONFIG_PATH, cfg, sha, "Admin: atualiza dados de contato");
  return ok({});
}

function ok(data) {
  return { statusCode: 200, body: JSON.stringify({ ok: true, ...data }) };
}
function fail(statusCode, error) {
  return { statusCode, body: JSON.stringify({ error }) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return fail(405, "Método não permitido.");

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return fail(400, "Dados inválidos.");
  }

  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return fail(401, "Senha incorreta.");
  }
  if (!process.env.GITHUB_TOKEN) {
    return fail(500, "Servidor não configurado (falta GITHUB_TOKEN).");
  }

  try {
    switch (body.action) {
      case "add-product":
        return await addProduct(body);
      case "update-product":
        return await updateProduct(body);
      case "delete-product":
        return await deleteProduct(body);
      case "add-category":
        return await addCategory(body);
      case "save-config":
        return await saveConfig(body);
      case "update-original":
        return await updateOriginal(body);
      case "set-hidden":
        return await setHidden(body);
      default:
        return fail(400, "Ação inválida.");
    }
  } catch (e) {
    return fail(500, e.message || "Erro inesperado.");
  }
};
