import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import { listarHistorico } from "../services/agendamento";
import "./HistoryPage.css";
import PageHeader from "../components/ui/PageHeader";
import SearchField from "../components/ui/SearchField";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

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
            <PageHeader eyebrow="Atendimentos anteriores" title="Histórico" description="Consulte o que aconteceu na sua agenda." count={items.length > 0 && <span className="history-count">{items.length} registros</span>} />
            <section className="panel-section">
                <SearchField label="Buscar cliente ou serviço" placeholder="Digite um nome ou serviço" value={query} onChange={(event) => setQuery(event.target.value)} />
                {loading ? <LoadingState label="Carregando histórico..." /> : loadError ? (
                    <ErrorState message={loadError} action={<Button onClick={loadHistory}>Tentar novamente</Button>} />
                ) : items.length === 0 ? (
                    <EmptyState title="Ainda não existem atendimentos no histórico." />
                ) : groups.length === 0 ? (
                    <EmptyState title="Nenhum registro corresponde à sua busca." />
                ) : (
                    groups.map(([key, group]) => (
                        <section className="history-group" key={key}>
                            <h3>{group.label}</h3>
                            <ul className="panel-list">
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        <div className="history-item-main">
                                            <strong>{formatTime(item.horario_inicio)} — {item.cliente || "Cliente não informado"}</strong>
                                            {Array.isArray(item.servicos) && item.servicos.length > 0 ? (
                                                <div className="history-services" aria-label={`Serviços: ${item.servicos.map((service) => service.nome || service).join(", ")}`}>
                                                    {item.servicos.map((service, index) => (
                                                        <span className="history-service" key={`${service.nome || service}-${index}`}>
                                                            <span
                                                                className="service-color-indicator"
                                                                aria-hidden="true"
                                                                style={{ "--service-color": /^#[0-9A-Fa-f]{3,8}$/.test(service?.cor || "") ? service.cor : "var(--color-border-strong)" }}
                                                            />
                                                            {service.nome || service}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : <p>Serviço não informado</p>}
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
