import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import { listarClientes } from "../services/agendamento";

function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listarClientes()
            .then((data) => setClients(Array.isArray(data) ? data : []))
            .catch(() => toast.error("Não foi possível carregar os clientes."))
            .finally(() => setLoading(false));
    }, []);

    const visibleClients = clients.filter((client) => (
        client.nome.toLowerCase().includes(query.toLowerCase())
    ));

    return (
        <PanelLayout>
            <h2>Clientes</h2>
            <section className="panel-section">
                <input aria-label="Buscar cliente" placeholder="Buscar cliente" value={query} onChange={(event) => setQuery(event.target.value)} />
                {loading ? <p>Carregando clientes...</p> : visibleClients.length === 0 ? (
                    <p>Nenhum cliente encontrado.</p>
                ) : (
                    <ul className="panel-list">
                        {visibleClients.map((client) => (
                            <li key={client.id}>
                                <strong>{client.nome}</strong>
                                <span>{client.telefone}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PanelLayout>
    );
}

export default ClientsPage;
