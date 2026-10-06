import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import { listarClientes } from "../services/agendamento";
import "./ClientsPage.css";
import PageHeader from "../components/ui/PageHeader";
import SearchField from "../components/ui/SearchField";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    async function loadClients() {
        try {
            setLoading(true);
            setLoadError("");
            const data = await listarClientes();
            setClients(Array.isArray(data) ? data : []);
        } catch {
            setLoadError("Não foi possível carregar os clientes. Tente novamente.");
            toast.error("Não foi possível carregar os clientes.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadClients();
    }, []);

    const visibleClients = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const digitsQuery = query.replace(/\D/g, "");

        return clients.filter((client) => {
            const name = String(client.nome || "").toLocaleLowerCase();
            const phone = String(client.telefone || "");
            const digitsPhone = phone.replace(/\D/g, "");
            return name.includes(normalizedQuery)
                || (digitsQuery.length > 0 && digitsPhone.includes(digitsQuery));
        });
    }, [clients, query]);

    return (
        <PanelLayout>
            <PageHeader eyebrow="Relacionamento" title="Clientes" description="Consulte os clientes relacionados à sua agenda." count={<span className="client-count">{clients.length} {clients.length === 1 ? "cliente" : "clientes"}</span>} />
            <section className="panel-section">
                <SearchField label="Buscar cliente" placeholder="Buscar por nome ou telefone" value={query} onChange={(event) => setQuery(event.target.value)} />
                {loading ? <LoadingState label="Carregando clientes..." /> : loadError ? (
                    <ErrorState message={loadError} action={<Button onClick={loadClients}>Tentar novamente</Button>} />
                ) : clients.length === 0 ? (
                    <EmptyState title="Nenhum cliente relacionado foi encontrado." />
                ) : visibleClients.length === 0 ? (
                    <EmptyState title="Nenhum cliente corresponde à sua busca." />
                ) : (
                    <ul className="panel-list">
                        {visibleClients.map((client) => (
                            <li key={client.id}>
                                <div>
                                    <strong>{client.nome || "Cliente sem nome"}</strong>
                                    <span>{client.telefone || "Telefone não informado"}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PanelLayout>
    );
}

export default ClientsPage;
