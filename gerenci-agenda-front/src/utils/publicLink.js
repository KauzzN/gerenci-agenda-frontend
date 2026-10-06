export function construirLinkPublico(slug) {
    const normalizedSlug = String(slug || "").trim();
    if (!normalizedSlug) return "";
    return `${window.location.origin}/book/${encodeURIComponent(normalizedSlug)}`;
}
