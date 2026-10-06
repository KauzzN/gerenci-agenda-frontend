import "./AppointmentCard.css"
import { formatarDataCard } from "../../utils/formatarHorario"
import StatusBadge from "../StatusBadge/StatusBadge"

function AppointmentCard({ agendamento, onEdit, onCancel, canceling }) {
    const dataFormatada = formatarDataCard(agendamento.horario_inicio)
    const services = Array.isArray(agendamento.servicos) ? agendamento.servicos : []
    const serviceNames = services.map((service) => typeof service === "string" ? service : service.nome).filter(Boolean)
    const visibleServices = services.slice(0, 3)
    const serviceColor = services.find((service) => /^#[0-9A-Fa-f]{3,8}$/.test(service?.cor || ""))?.cor

    return (
        <div 
            className="card-container"
            style={{ "--service-color": serviceColor || "var(--color-border-strong)" }}
            role="button"
            tabIndex="0"
            onClick={() => {
                onEdit(agendamento)}}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onEdit(agendamento)
                }
            }}
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
                    <div className="card-services" aria-label={serviceNames.length > 0 ? `Serviços: ${serviceNames.join(", ")}` : "Serviço não informado"}>
                        {serviceNames.length > 0 ? (
                            <>
                                <span className="card-service-names">{serviceNames.join(" + ")}</span>
                                <span className="service-color-indicators" aria-hidden="true">
                                    {visibleServices.map((service, index) => (
                                        <span
                                            className="service-color-indicator"
                                            key={`${typeof service === "string" ? service : service.nome}-${index}`}
                                            style={{ "--service-color": /^#[0-9A-Fa-f]{3,8}$/.test(service?.cor || "") ? service.cor : "var(--color-border-strong)" }}
                                        />
                                    ))}
                                    {services.length > 3 && <span className="service-color-more">+{services.length - 3}</span>}
                                </span>
                            </>
                        ) : "Serviço não informado"}
                    </div>
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