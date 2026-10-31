import { formatarHorario } from "../../utils/formatarHorario";
import { ClockIcon, Phone, User2Icon } from "lucide-react";
import { formatarMoeda } from "../../utils/formatarMoeda";

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
    const services = Array.isArray(proximo?.servicos) ? proximo.servicos : [];

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
                                {proximo.telefone && <p className="next-phone"><Phone size={14} /> {proximo.telefone}</p>}
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
                            <p>Horário: {formatarHorario(proximo.horario_inicio)}</p>
                            {proximo.horario_fim && <span>até {formatarHorario(proximo.horario_fim)}</span>}
                        </>
                    ) : (
                        <p></p>
                    )
                }
            </div>
            {proximo && (
                <div className="next-details">
                    <div className="next-services">
                        <span className="next-detail-label">Serviços</span>
                        {services.length > 0 ? (
                            <ul>
                                {services.map((service, index) => (
                                    <li key={`${service.id || service.nome || service}-${index}`}>
                                        {typeof service === "string" ? service : service.nome}
                                        {typeof service === "object" && service.duracao ? <small>{service.duracao} min</small> : null}
                                    </li>
                                ))}
                            </ul>
                        ) : <span className="next-muted">Não informado</span>}
                    </div>
                    {proximo.valor_total !== undefined && (
                        <div className="next-total">
                            <span className="next-detail-label">Valor a cobrar</span>
                            <strong>{formatarMoeda(proximo.valor_total)}</strong>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NextAppointment