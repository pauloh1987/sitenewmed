const OWNER = "pauloh1987";
const REPO = "sitenewmed";
const BRANCH = "main";
const DATA_PATH = "data/produtos-novos.json";
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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método não permitido." }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Dados inválidos." }) };
  }

  const { password, nome, categoria, descricao, fotoBase64, fotoNome } = body;

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "Senha incorreta." }) };
  }
  if (!process.env.GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Servidor não configurado (falta GITHUB_TOKEN)." }) };
  }
  if (!nome || !categoria) {
    return { statusCode: 400, body: JSON.stringify({ error: "Nome e categoria são obrigatórios." }) };
  }

  try {
    const getRes = await githubRequest(`${DATA_PATH}?ref=${BRANCH}`);
    if (!getRes.ok) throw new Error(`Falha ao ler o catálogo atual (${getRes.status}).`);
    const getData = await getRes.json();
    const current = JSON.parse(Buffer.from(getData.content, "base64").toString("utf-8"));

    let fotoPath = "";
    if (fotoBase64 && fotoNome) {
      const ext = (fotoNome.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      fotoPath = `${MEDIA_DIR}/${slugify(nome)}-${Date.now()}.${ext}`;
      const putPhotoRes = await githubRequest(fotoPath, {
        method: "PUT",
        body: JSON.stringify({
          message: `Admin: adiciona foto de ${nome}`,
          content: fotoBase64,
          branch: BRANCH,
        }),
      });
      if (!putPhotoRes.ok) {
        throw new Error(`Falha ao enviar a foto (${putPhotoRes.status}).`);
      }
    }

    const updated = [
      ...current,
      {
        nome: String(nome).trim(),
        categoria: String(categoria).trim(),
        descricao: descricao ? String(descricao).trim() : "",
        foto: fotoPath,
      },
    ];
    const newContent = Buffer.from(JSON.stringify(updated, null, 2), "utf-8").toString("base64");

    const putDataRes = await githubRequest(DATA_PATH, {
      method: "PUT",
      body: JSON.stringify({
        message: `Admin: adiciona produto "${nome}"`,
        content: newContent,
        sha: getData.sha,
        branch: BRANCH,
      }),
    });
    if (!putDataRes.ok) {
      throw new Error(`Falha ao salvar o produto (${putDataRes.status}).`);
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Erro inesperado." }) };
  }
};
