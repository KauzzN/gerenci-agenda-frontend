import AppointmentCard from "../AppointmentCard/AppointmentCard";

function AppointmentList({ agendamentos }) {

    return (

        <section className="appointment-list">

            {agendamentos.map((agendamento) => (

                <AppointmentCard
                    key={agendamento.id}
                    agendamento={agendamento}
                />

            ))}

        </section>

    );

}

export default AppointmentList;