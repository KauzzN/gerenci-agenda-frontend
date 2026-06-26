import { useState, useEffect } from "react";
import { listarAgendamentos } from "../services/agendamento";

function Dashboard () {

    const [agendamentos, setAgendamentos] =  useState([]);

    async function carregarAgendamentos() {
        
        try {
            const data = await listarAgendamentos();

            setAgendamentos(data.agendamentos);

        } catch (err) {
            console.log(err)
        }

    }

    useEffect(() => {

        carregarAgendamentos();
    }, []);

    return (
        <div>

            <h1>Dashboard</h1>

            <h2>Agendamentos</h2>

            {
                agendamentos.map((agendamento)=>(

                    <div key={agendamento.id}>

                        <h3>{agendamento.nome}</h3>

                        <p>{agendamento.horario}</p>

                        <p>

                            {agendamento.atendido
                                ? "✔ Atendido"
                                : "❌ Não atendido"}

                        </p>

                    </div>

                ))
            }

        </div>
    );
}

export default Dashboard