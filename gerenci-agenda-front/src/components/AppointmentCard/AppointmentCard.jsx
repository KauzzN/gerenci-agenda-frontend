import "./AppointmentCard.css"
import { formatarDataCard } from "../../utils/formatarHorario"
import StatusBadge from "../StatusBadge/StatusBadge"

function AppointmentCard({ agendamento }) {
    const dataFormatada = formatarDataCard(agendamento.horario)

    return (
        <div className="card-container">

            <div className="card-box">

                <div className="card-time">
                    <h2>{dataFormatada.horario}</h2>
                    <p>{dataFormatada.dia}</p>
                </div>

                <div className="card-name">
                    <h3>{agendamento.nome}</h3>
                    <small>Cliente agendado</small>
                </div>
            </div>

            <div>
                <StatusBadge status={agendamento.status } />
            </div>
        </div>
    )
}

export default AppointmentCard