import { useState } from "react";
import AppointmentCard from "../AppointmentCard/AppointmentCard";
import "./AppointmentList.css"

function AppointmentList({ agendamentos }) {

    if (agendamentos.length === 0 ) {
        return (
            <div className="empty-state">
                <span className="empty-icon">📅</span>

                <h2>Agenda vazia</h2>
                
                <p>Nenhum cliente agendado.</p>
                <p>
                    Clique no botão <strong>+</strong> para criar um agendamento.
                </p>
            </div>
        )
    }

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