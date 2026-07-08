import "./StatusBadge.css";
import {
    CheckCircle,
    Clock4,
    UserRoundX,
    Ban
} from "lucide-react";

function StatusBadge({ status }) {

    const badges = {
        PENDENTE: {
            texto: "Pendente",
            classe: "pending",
            icone: <Clock4 size={16}/>
        },

        ATENDIDO: {
            texto: "Atendido",
            classe: "success",
            icone: <CheckCircle size={16}/>
        },

        FALTOU: {
            texto: "Faltou",
            classe: "missed",
            icone: <UserRoundX size={16}/>
        },

        CANCELADO: {
            texto: "Cancelado",
            classe: "cancelled",
            icone: <Ban size={16}/>
        }
    };

    const badge = badges[status];

    if (!badge) return null;

    return (
        <span className={`status-badge ${badge.classe}`}>
            {badge.icone}
            {badge.texto}
        </span>
    );
}

export default StatusBadge;