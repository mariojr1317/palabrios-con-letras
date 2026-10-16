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
function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
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
  const raw = (await response.text()).trim();
  if (!response.ok) {
    throw new Error("Geometry Dash respondió HTTP " + response.status + (raw ? ": " + raw.slice(0, 120) : ""));
  }
  return raw;
}
function parseLevels(raw) {
  if (!raw || raw === "-1") return [];
  // The protocol returns levels#creators#songs#page-info#hash.
  const sections = raw.split("#");
  const objects = (sections[0] || "").split("|");
  const creators = {};
  for (const entry of (sections[1] || "").split("|")) {
    const [userId, username, accountId] = entry.split(":");
    if (userId) creators[userId] = { username: username || "", accountId: accountId || "" };
  }
  const out = [];
  for (const field of objects) {
    const pairs = field.split(":");
    const obj = {};
    for (let j = 0; j + 1 < pairs.length; j += 2) obj[pairs[j]] = pairs[j + 1];
    if (obj[1]) {
      const creator = creators[obj[6]] || {};
      out.push({
        id: obj[1],
        name: obj[2] || "Nivel sin nombre",
        description: obj[3] || "",
        version: obj[5] || "",
        creatorId: obj[6] || "",
        creator: creator.username || "",
        difficulty: obj[9] || obj[8] || "",
        downloads: obj[10] || "0",
        officialSongId: obj[12] || "0",
        gameVersion: obj[13] || ""
      });
    }
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
      if (url.pathname.endsWith("/api/health")) {
        // A tiny real request verifies the proxy can reach the official GD server.
        const raw = await gdPost("getGJLevels21.php", {
          type: "1", page: "0", total: "0", gameVersion: "22",
          binaryVersion: "47", gdw: "0", diff: "-", len: "-", star: "0"
        });
        if (raw === "-1") {
          return json({
            ok: false,
            service: "Temu Dash GD proxy",
            error: "El Worker respondió, pero Geometry Dash rechazó la solicitud (-1)."
          }, 502, origin);
        }
        return json({ ok: true, service: "Temu Dash GD proxy", gdServer: "respondió", sampleLevels: parseLevels(raw).length }, 200, origin);
      }
      if (url.pathname.endsWith("/api/search")) {
        const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
        if (!q) return json({ levels: [], message: "Escribe el nombre de un nivel." }, 200, origin);
        const raw = await gdPost("getGJLevels21.php", {
          type: "0", str: q, page: "0", total: "0",
          gameVersion: "22", binaryVersion: "47", gdw: "0",
          diff: "-", len: "-", demonFilter: "-1", star: "0",
          featured: "0", original: "0", twoPlayer: "0", coins: "0", epic: "0"
        });
        if (raw === "-1") {
          return json({
            levels: [],
            error: "Geometry Dash devolvió -1: rechazó la búsqueda. Intenta de nuevo más tarde o prueba otra consulta."
          }, 502, origin);
        }
        const levels = parseLevels(raw);
        if (!levels.length) {
          return json({ levels: [], message: "El servidor respondió, pero no devolvió niveles para esa búsqueda." }, 200, origin);
        }
        return json({ levels, rawFormat: "Geometry Dash level search" }, 200, origin);
      }
      if (url.pathname.endsWith("/api/level")) {
        const id = (url.searchParams.get("id") || "").trim();
        if (!/^\d{1,12}$/.test(id)) return json({ error: "ID de nivel inválido." }, 400, origin);
        const raw = await gdPost("downloadGJLevel.php", {
          levelID: id, gameVersion: "22", binaryVersion: "47", gdw: "0"
        });
        if (!raw || raw === "-1") {
          return json({ error: "Geometry Dash no entregó ese nivel. Puede ser privado, eliminado o inaccesible." }, 404, origin);
        }
        return json({ id, encodedLevel: raw, note: "Datos originales del servidor; todavía deben decodificarse para jugarlos." }, 200, origin);
      }
      return json({
        service: "Temu Dash GD levels proxy",
        instructions: "Prueba /api/health antes de buscar.",
        endpoints: ["/api/health", "/api/search?q=Stereo%20Madness", "/api/level?id=levelID"]
      }, 200, origin);
    } catch (error) {
      return json({
        error: error && error.message ? error.message : "Error consultando Geometry Dash.",
        hint: "Si aparece HTTP 1020, bloqueo o fallo de red, el servidor de Geometry Dash puede estar bloqueando la solicitud del Worker."
      }, 502, origin);
    }
  }
};