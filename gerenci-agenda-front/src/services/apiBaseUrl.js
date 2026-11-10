const API_PREFIX = "/api";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

// Aceita VITE_API_URL com ou sem o prefixo /api e com ou sem barra final,
// garantindo que todos os endpoints (ex.: /usr/login) resolvam para /api/usr/login.
export function normalizeApiBaseUrl(rawUrl) {
    const trimmed = String(rawUrl ?? "").trim().replace(/\/+$/, "");

    if (!trimmed) {
        return API_PREFIX;
    }

    return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}${API_PREFIX}`;
}

export function getApiOrigin(rawUrl) {
    return new URL(normalizeApiBaseUrl(rawUrl)).origin;
}

// Usado no build de produção para impedir que um bundle público seja gerado
// apontando para localhost ou para HTTP (bloqueado como mixed content em HTTPS).
export function assertProductionApiUrl(rawUrl) {
    const baseUrl = normalizeApiBaseUrl(rawUrl);
    let parsed;

    try {
        parsed = new URL(baseUrl);
    } catch {
        throw new Error(
            "VITE_API_URL must be an absolute URL (for example https://your-api.onrender.com) in production builds."
        );
    }

    if (LOOPBACK_HOSTS.has(parsed.hostname)) {
        throw new Error(
            "VITE_API_URL must not point to localhost/127.0.0.1 in production builds."
        );
    }

    if (parsed.protocol !== "https:") {
        throw new Error("VITE_API_URL must use https:// in production builds.");
    }

    return baseUrl;
}
