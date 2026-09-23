import "./AppointmentCard.css"
import { formatarDataCard } from "../../utils/formatarHorario"
import StatusBadge from "../StatusBadge/StatusBadge"

function AppointmentCard({ agendamento, onEdit, onCancel, canceling }) {
    const dataFormatada = formatarDataCard(agendamento.horario_inicio)

    return (
        <div 
            className="card-container"
            onClick={() => {
                onEdit(agendamento)}}
                >
            

            <div className="card-box">

                <div className="card-time">
                    <h2>{dataFormatada.horario}</h2>
                    <p>{dataFormatada.dia}</p>
                    <small>até {formatarDataCard(agendamento.horario_fim).horario}</small>
                </div>

                <div className="card-name">
                    <h3>{agendamento.cliente}</h3>
                    <small>Cliente agendado</small>
                </div>
            </div>

            <div>
                <StatusBadge status={agendamento.status } />
            </div>

            {agendamento.status === "PENDENTE" && (
                <button
                    type="button"
                    className="cancel-appointment-button"
                    disabled={canceling}
                    onClick={(event) => {
                        event.stopPropagation();
                        onCancel(agendamento);
                    }}
                >
                    {canceling ? "Cancelando..." : "Cancelar agendamento"}
                </button>
            )}
        </div>
    )
}

export default AppointmentCard