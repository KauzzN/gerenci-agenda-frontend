import "./AppointmentCard.css"
import { formatarHorario } from "../../utils/formatarHorario"

import { marcarAgtendido } from "../../services/agendamento"
import toast from "react-hot-toast";
import { useState } from "react";

function AppointmentCard({ agendamento }) {

    const [loading, setLoading] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false)

    async function handleAtendido() {
        
        setLoading(true)
        
        try {
            await marcarAgtendido(agendamento.id);
            toast.success("Agendamento atendido")
        } catch (err) {
            toast.error(`${err}`)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="card">
            <div className="menu-infos">

                <h3>{agendamento.nome}</h3>
                <p>{formatarHorario(agendamento.horario)}</p>

            </div>

            <div className="menu-atendido">
                <button className={
                    agendamento.atendido

                    ? "status-btn done"

                    : "status-btn pending"
                }
                onClick={handleAtendido}
                >
                    {
                        agendamento.atendido

                        ? "✔ Atendido"

                        : "⏳ Pendente"
                    }
                </button>
            </div>

            <div className="menu">
                <button className="menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    >
                    &#8942;
                </button>

                {
                            menuOpen && (
                                <div className="menu-dropdown">
                                    <button>
                                        ✏ Editar
                                    </button>

                                    <button>
                                        🗑 Excluir
                                    </button>
                                </div>
                            )
                        }
            </div>

            
        </div> 
    )
}

export default AppointmentCard