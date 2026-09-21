import AppointmentCard from "../AppointmentCard/AppointmentCard";
import "./AppointmentList.css";

function AppointmentList({ agendamentos = [], onEdit, loading = false }) {
    
    function formatarDataAtual() {
        const data = new Date();

        return data.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    }


    return (

        <section className="appointment-list">
            <div className="appointment-list-header">
                <h2>Agendamentos Hoje</h2>
                <small>{formatarDataAtual()}</small>

            </div>

            <div className="appointment-card-box">
                {loading && <p>Carregando agendamentos...</p>}

                {!loading && agendamentos.length === 0 && (
                    <p>Nenhum agendamento para hoje.</p>
                )}

                {!loading && agendamentos.map((agendamento) => (
                    
                    <AppointmentCard
                    key={agendamento.id}
                    agendamento={agendamento}
                    onEdit={onEdit}
                    />
                ))}
            </div>

        </section>

    );

}

export default AppointmentList;