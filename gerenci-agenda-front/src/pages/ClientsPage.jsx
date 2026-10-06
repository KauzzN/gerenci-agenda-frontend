import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import { listarClientes } from "../services/agendamento";
import "./ClientsPage.css";

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
            <header className="clients-heading">
                <div>
                    <p className="eyebrow">Relacionamento</p>
                    <h2>Clientes</h2>
                    <p>Consulte os clientes relacionados à sua agenda.</p>
                </div>
                <span className="client-count">{clients.length} {clients.length === 1 ? "cliente" : "clientes"}</span>
            </header>
            <section className="panel-section">
                <label className="search-field">
                    Buscar cliente
                    <input aria-label="Buscar cliente" placeholder="Buscar por nome ou telefone" value={query} onChange={(event) => setQuery(event.target.value)} />
                </label>
                {loading ? <p className="state-message">Carregando clientes...</p> : loadError ? (
                    <div className="state-message"><p>{loadError}</p><button type="button" onClick={loadClients}>Tentar novamente</button></div>
                ) : clients.length === 0 ? (
                    <p className="state-message">Nenhum cliente relacionado foi encontrado.</p>
                ) : visibleClients.length === 0 ? (
                    <p className="state-message">Nenhum cliente corresponde à sua busca.</p>
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
