const moedaBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

export function valorParaCentavos(value) {
    const normalized = String(value ?? "").trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

    const numericValue = Number(normalized);
    return Number.isSafeInteger(Math.round(numericValue * 100))
        ? Math.round(numericValue * 100)
        : null;
}

export function formatarMoeda(value) {
    const cents = valorParaCentavos(value);
    return cents === null ? "Preço não informado" : moedaBRL.format(cents / 100);
}

export function somarPrecos(servicos = []) {
    return servicos.reduce((total, servico) => {
        const cents = valorParaCentavos(servico?.preco_unitario ?? servico?.preco);
        return total + (cents ?? 0);
    }, 0);
}

export function formatarTotalCentavos(cents) {
    return moedaBRL.format(cents / 100);
}
