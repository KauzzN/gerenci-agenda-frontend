import "./AppointmentCard.css"
import { formatarDataCard } from "../../utils/formatarHorario"
import StatusBadge from "../StatusBadge/StatusBadge"

function AppointmentCard({ agendamento, onEdit }) {
    const dataFormatada = formatarDataCard(agendamento.horario_inicio)

    return (
        <div 
            className="card-container"
            onClick={() => {
                console.log("clicou")
                console.log(agendamento)
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
        </div>
    )
}

export default AppointmentCard