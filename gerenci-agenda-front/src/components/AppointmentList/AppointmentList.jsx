import AppointmentCard from "../AppointmentCard/AppointmentCard";
import "./AppointmentList.css";

function AppointmentList({
    agendamentos = [],
    onEdit,
    onCancel,
    cancelingId = null,
    onRetry,
    loading = false,
    errorType = null,
    selectedDate,
    onSelectedDateChange
}) {
    
    function formatarDataSelecionada() {
        if (!selectedDate) return "";

        const [ano, mes, dia] = selectedDate.split("-").map(Number);
        return new Intl.DateTimeFormat("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date(ano, mes - 1, dia));
    }


    return (

        <section className="appointment-list">
            <div className="appointment-list-header">
                <h2>Agendamentos</h2>
                <small>{formatarDataSelecionada()}</small>
                <input
                    aria-label="Data da agenda"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                        if (event.target.value) {
                            onSelectedDateChange(event.target.value);
                        }
                    }}
                />

            </div>

            <div className="appointment-card-box">
                {loading && <p>Carregando agendamentos...</p>}

                {!loading && errorType && (
                    <div role="alert">
                        <p>
                            {errorType === "network"
                                ? "Não foi possível conectar para carregar os agendamentos."
                                : "Não foi possível carregar os agendamentos."}
                        </p>
                        <button type="button" onClick={onRetry}>Tentar novamente</button>
                    </div>
                )}

                {!loading && !errorType && agendamentos.length === 0 && (
                    <p>Nenhum agendamento para esta data.</p>
                )}

                {!loading && !errorType && agendamentos.map((agendamento) => (
                    
                    <AppointmentCard
                    key={agendamento.id}
                    agendamento={agendamento}
                    onEdit={onEdit}
                    onCancel={onCancel}
                    canceling={cancelingId === agendamento.id}
                    />
                ))}
            </div>

        </section>

    );

}

export default AppointmentList;