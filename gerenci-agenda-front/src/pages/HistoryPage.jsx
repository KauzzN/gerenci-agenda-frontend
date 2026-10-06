import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import { listarHistorico } from "../services/agendamento";
import "./HistoryPage.css";

const historyTimeZone = "America/Fortaleza";

function dateParts(value) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: historyTimeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date(value)).reduce((parts, part) => {
        if (part.type !== "literal") parts[part.type] = part.value;
        return parts;
    }, {});
}

function formatDate(value) {
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: historyTimeZone,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(value));
}

function formatTime(value) {
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: historyTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(new Date(value));
}

function HistoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [query, setQuery] = useState("");

    async function loadHistory() {
        try {
            setLoading(true);
            setLoadError("");
            setItems(await listarHistorico());
        } catch {
            setLoadError("Não foi possível carregar o histórico. Tente novamente.");
            toast.error("Não foi possível carregar o histórico.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHistory();
    }, []);

    const groupedItems = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const filtered = items.filter((item) => {
            const searchable = [
                item.cliente,
                ...(Array.isArray(item.servicos) ? item.servicos.map((service) => service.nome) : [])
            ].filter(Boolean).join(" ").toLocaleLowerCase();
            return searchable.includes(normalizedQuery);
        });

        return filtered.reduce((groups, item) => {
            const parts = dateParts(item.horario_inicio);
            const key = `${parts.year}-${parts.month}-${parts.day}`;
            if (!groups[key]) groups[key] = { label: formatDate(item.horario_inicio), items: [] };
            groups[key].items.push(item);
            return groups;
        }, {});
    }, [items, query]);

    const groups = Object.entries(groupedItems).sort(([first], [second]) => second.localeCompare(first));

    return (
        <PanelLayout>
            <header className="history-heading">
                <div>
                    <p className="eyebrow">Atendimentos anteriores</p>
                    <h2>Histórico</h2>
                    <p>Consulte o que aconteceu na sua agenda.</p>
                </div>
                {items.length > 0 && <span className="history-count">{items.length} registros</span>}
            </header>
            <section className="panel-section">
                <label className="history-search">
                    Buscar cliente ou serviço
                    <input aria-label="Buscar no histórico" placeholder="Digite um nome ou serviço" value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                {loading ? <p className="history-state">Carregando histórico...</p> : loadError ? (
                    <div className="history-state"><p>{loadError}</p><button type="button" onClick={loadHistory}>Tentar novamente</button></div>
                ) : items.length === 0 ? (
                    <p className="history-state">Ainda não existem atendimentos no histórico.</p>
                ) : groups.length === 0 ? (
                    <p className="history-state">Nenhum registro corresponde à sua busca.</p>
                ) : (
                    groups.map(([key, group]) => (
                        <section className="history-group" key={key}>
                            <h3>{group.label}</h3>
                            <ul className="panel-list">
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        <div className="history-item-main">
                                            <strong>{formatTime(item.horario_inicio)} — {item.cliente || "Cliente não informado"}</strong>
                                            <p>{Array.isArray(item.servicos) && item.servicos.length > 0
                                                ? item.servicos.map((service) => service.nome || service).join(" + ")
                                                : "Serviço não informado"}</p>
                                            {item.horario_fim && <small>Até {formatTime(item.horario_fim)}</small>}
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))
                )}
            </section>
        </PanelLayout>
    );
}

export default HistoryPage;
