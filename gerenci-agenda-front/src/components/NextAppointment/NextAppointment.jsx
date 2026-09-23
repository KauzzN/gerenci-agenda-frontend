import { formatarHorario } from "../../utils/formatarHorario";
import { ClockIcon, User2Icon } from "lucide-react";

import "./NextAppointment.css"



function NextAppointment ({ stats }) {
    const candidate = stats?.proximo;
    const hasValidNextAppointment = Boolean(
        candidate
        && typeof candidate.cliente === "string"
        && candidate.cliente
        && typeof candidate.horario_inicio === "string"
        && !Number.isNaN(new Date(candidate.horario_inicio).getTime())
    );
    const proximo = hasValidNextAppointment ? candidate : null;

    return (
        <div className="next-container">

            <div className="next-header">
                <small>Próximo atendimento</small>
                <ClockIcon size={24}/>
            </div>

            <div className="next-divider"/>

            <div className="next-container-infos">

                <div className="user-avatar">
                    <User2Icon />
                </div>

                <div className="next-infos">

                    {
                        proximo ? (
                            <>
                                <h2>{proximo.cliente}</h2>
                            </>
                        ) : (
                            <p>Nenhum próximo atendimento.</p>
                        )
                    }
                </div>
            </div>

            <div className="next-info-horario">

                {
                    proximo ? (
                        <>
                        <ClockIcon />
                            <p> Horario: {formatarHorario(proximo.horario_inicio)}</p>
                        </>
                    ) : (
                        <p></p>
                    )
                }
            </div>
        </div>
    )
}

export default NextAppointment