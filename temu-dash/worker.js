const GD = "https://www.boomlings.com/database/";
const SECRET = "Wmfd2893gb7";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
async function gdPost(endpoint, params) {
  const body = new URLSearchParams({ ...params, secret: SECRET });
  const response = await fetch(GD + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": ""
    },
    body
  });
  if (!response.ok) throw new Error("El servidor de Geometry Dash respondió HTTP " + response.status);
  return (await response.text()).trim();
}
function parseLevels(raw) {
  if (!raw || raw === "-1") return [];
  const parts = raw.split("#");
  const fields = (parts[0] || "").split("|");
  const out = [];
  for (let i = 0; i + 1 < fields.length; i += 2) {
    const obj = {};
    const pairs = fields[i].split(":");
    for (let j = 0; j + 1 < pairs.length; j += 2) obj[pairs[j]] = pairs[j + 1];
    if (Object.keys(obj).length) out.push({
      id: obj[1] || "",
      name: obj[2] || "Nivel sin nombre",
      description: obj[3] || "",
      version: obj[5] || "",
      difficulty: obj[9] || "",
      downloads: obj[10] || "0",
      officialSongId: obj[12] || "0",
      gameVersion: obj[13] || "",
      creator: obj[creator] || "",
      raw: obj
    });
  }
  return out;
}
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "GET") return json({ error: "Usa GET." }, 405, origin);
    try {
      if (url.pathname.endsWith("/api/search")) {
        const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
        if (!q) return json({ levels: [], message: "Escribe el nombre de un nivel." }, 200, origin);
        const raw = await gdPost("getGJLevels21.php", {
          type: "0", str: q, page: "0", total: "0",
          gauntlet: "0", len: "-",
          diff: "-1", demonFilter: "-1", star: "0", featured: "0",
          original: "0", twoPlayer: "0", coins: "0", epic: "0",
          secret: SECRET
        });
        if (raw === "-1") return json({ levels: [], message: "No se encontraron niveles o el servidor rechazó la búsqueda." }, 200, origin);
        return json({ levels: parseLevels(raw), rawFormat: "Geometry Dash level search" }, 200, origin);
      }
      if (url.pathname.endsWith("/api/level")) {
        const id = (url.searchParams.get("id") || "").trim();
        if (!/^\d{1,12}$/.test(id)) return json({ error: "ID de nivel inválido." }, 400, origin);
        const raw = await gdPost("downloadGJLevel.php", { levelID: id, secret: SECRET });
        if (!raw || raw === "-1") return json({ error: "No se pudo descargar el nivel. Puede ser privado, eliminado o inaccesible." }, 404, origin);
        return json({ id, encodedLevel: raw, note: "Datos originales del servidor; todavía deben decodificarse para jugarlos." }, 200, origin);
      }
      return json({ service: "Temu Dash GD levels proxy", endpoints: ["/api/search?q=Stereo%20Madness", "/api/level?id=levelID"] }, 200, origin);
    } catch (error) {
      return json({ error: error && error.message ? error.message : "Error consultando Geometry Dash." }, 502, origin);
    }
  }
};