const BASES = [
  'https://www.boomlings.com/database/',
  'https://gdproxy.net/database/'
];
const SECRET = 'Wmfd2893gb7';
const MAX_ID_LENGTH = 12;
const RATE_WINDOW = 60_000;
const RATE_MAX = 30;
const rates = globalThis.__temuDashRateBuckets || (globalThis.__temuDashRateBuckets = new Map());

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}
function sendError(res, code, message) {
  return res.status(code).json({ error: message });
}
function isRateLimited(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = String(Array.isArray(forwarded) ? forwarded[0] : (forwarded || req.socket?.remoteAddress || 'anonymous')).split(',')[0].trim();
  const now = Date.now();
  const recent = (rates.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (recent.length >= RATE_MAX) {
    rates.set(ip, recent);
    return true;
  }
  recent.push(now);
  rates.set(ip, recent);
  if (rates.size > 1500) {
    for (const [key, values] of rates) {
      if (!values.length || now - values[values.length - 1] > RATE_WINDOW) rates.delete(key);
    }
  }
  return false;
}
function parsePairs(value, separator) {
  const parts = String(value || '').split(separator || ':');
  const result = {};
  for (let i = 0; i + 1 < parts.length; i += 2) result[parts[i]] = parts[i + 1];
  return result;
}
function difficulty(info) {
  const rating = { '0': 'Unrated', '10': 'Easy', '20': 'Normal', '30': 'Hard', '40': 'Harder', '50': 'Insane' };
  if (Number(info[17]) > 0) {
    const demon = { '3': 'Easy Demon', '4': 'Medium Demon', '5': 'Insane Demon', '6': 'Extreme Demon' };
    return demon[info[43]] || 'Demon';
  }
  if (Number(info[25]) > 0) return 'Auto';
  return rating[info[9]] || 'Unrated';
}
function parseLevels(raw) {
  if (!raw || raw.trim() === '-1') return [];
  const sections = raw.trim().split('#');
  const creators = {};
  for (const entry of (sections[1] || '').split('|')) {
    const parts = entry.split(':');
    if (parts[0]) creators[parts[0]] = parts[1] || 'Unknown';
  }
  return (sections[0] || '').split('|').map(entry => {
    const info = parsePairs(entry, ':');
    if (!info[1]) return null;
    return {
      id: String(info[1]),
      name: info[2] || 'Nivel sin nombre',
      author: creators[info[6]] || 'Desconocido',
      downloads: Number(info[10]) || 0,
      likes: Number(info[14]) || 0,
      stars: Number(info[18]) || 0,
      difficulty: difficulty(info)
    };
  }).filter(Boolean);
}
async function postToServers(endpoint, parameters) {
  const failures = [];
  for (const base of BASES) {
    try {
      const response = await fetch(base + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': ''
        },
        body: new URLSearchParams(parameters).toString(),
        signal: AbortSignal.timeout(9000)
      });
      const text = (await response.text()).trim();
      if (!response.ok) {
        failures.push(base + ' HTTP ' + response.status);
        continue;
      }
      if (!text || text.startsWith('<') || text.toLowerCase().startsWith('error')) {
        failures.push(base + ' devolvió una respuesta inesperada');
        continue;
      }
      if (text === '-1') {
        failures.push(base + ' devolvió -1');
        continue;
      }
      return { text, server: base };
    } catch (error) {
      failures.push(base + ' (' + (error && error.name === 'TimeoutError' ? 'tiempo agotado' : 'sin respuesta') + ')');
    }
  }
  const error = new Error('Los servidores de Geometry Dash no aceptaron la solicitud. ' + failures.join('; '));
  error.statusCode = 502;
  throw error;
}
function commonParams(extra) {
  return Object.assign({
    secret: SECRET,
    gameVersion: '22',
    binaryVersion: '47',
    gdw: '0'
  }, extra || {});
}
module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return sendError(res, 405, 'Usa una petición GET.');
  if (isRateLimited(req)) return sendError(res, 429, 'Límite alcanzado: espera un minuto antes de volver a buscar.');
  const mode = String(req.query.mode || 'search');
  try {
    if (mode === 'test') {
      const result = await postToServers('getGJLevels21.php', commonParams({
        type: '1', page: '0', total: '0', star: '0'
      }));
      const count = parseLevels(result.text).length;
      return res.status(200).json({
        ok: true,
        message: 'La conexión al servidor de Geometry Dash respondió.',
        server: result.server,
        sampleCount: count
      });
    }
    if (mode === 'search') {
      const query = String(req.query.q || '').trim();
      if (!query || query.length > 60 || /[\u0000-\u001f]/.test(query)) {
        return sendError(res, 400, 'Escribe un nombre de nivel de hasta 60 caracteres.');
      }
      const result = await postToServers('getGJLevels21.php', commonParams({
        type: '0',
        str: query,
        page: '0',
        total: '0',
        diff: '-',
        len: '-',
        demonFilter: '-1',
        star: '0',
        featured: '0',
        original: '0',
        twoPlayer: '0',
        coins: '0'
      }));
      return res.status(200).json(parseLevels(result.text));
    }
    if (mode === 'download') {
      const id = String(req.query.id || '').trim();
      if (!/^\d+$/.test(id) || id.length > MAX_ID_LENGTH) {
        return sendError(res, 400, 'El ID del nivel debe contener solo números.');
      }
      const result = await postToServers('downloadGJLevel22.php', commonParams({ levelID: id }));
      return res.status(200).json({
        id,
        encodedLevel: result.text,
        source: result.server
      });
    }
    return sendError(res, 400, 'Modo no reconocido. Usa test, search o download.');
  } catch (error) {
    return sendError(res, error.statusCode || 502, error.message || 'No se pudo contactar con los servidores.');
  }
};
