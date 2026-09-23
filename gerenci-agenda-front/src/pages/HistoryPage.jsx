import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import { listarHistorico } from "../services/agendamento";
import { formatarHorario } from "../utils/formatarHorario";

function HistoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listarHistorico()
            .then(setItems)
            .catch(() => toast.error("Não foi possível carregar o histórico."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <PanelLayout>
            <h2>Histórico</h2>
            <section className="panel-section">
                {loading ? <p>Carregando histórico...</p> : items.length === 0 ? (
                    <p>Nenhum agendamento concluído, faltado ou cancelado.</p>
                ) : (
                    <ul className="panel-list">
                        {items.map((item) => (
                            <li key={item.id}>
                                <div>
                                    <strong>{item.cliente}</strong>
                                    <p>{formatarHorario(item.horario_inicio)}</p>
                                </div>
                                <StatusBadge status={item.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PanelLayout>
    );
}

export default HistoryPage;
