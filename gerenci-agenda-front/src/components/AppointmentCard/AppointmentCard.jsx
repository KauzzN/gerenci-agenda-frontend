import "./AppointmentCard.css"
import { formatarHorario } from "../../utils/formatarHorario"

function AppointmentCard({ agendamento }) {
    return (
        <div className="card">
            <div>

                <h3>{agendamento.nome}</h3>
                <p>{formatarHorario(agendamento.horario)}</p>
            </div>

            <div>
                {
                    agendamento.atendido

                    ? <span className="done">✔ Atendido</span>
                    : <span className="pending">⏳ Pendente</span>
                }
            </div>
        </div>
    )
}

export default AppointmentCard