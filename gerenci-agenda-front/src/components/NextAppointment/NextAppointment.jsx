import { useEffect, useState } from "react"
import { buscarDashboard } from "../../services/agendamento";
import { formatarHorario } from "../../utils/formatarHorario";

import "./NextAppointment.css"



function NextAppointment () {

    const [proximo, setProximo] = useState();

    useEffect(() => {
        async function carregarEstatisticas() {
            
            try {
                const data = await buscarDashboard();

                if (data.proximo) {
                    setProximo(data.proximo)
                }

            } catch (err) {
                console.log(err);
            }
        }

        carregarEstatisticas()
    }, []);

    return (
        <div className="next-container">

            <div className="next-header">
                <span>⏰</span>
                <small>Próximo atendimento</small>
            </div>

            {
                proximo ? (
                    <>
                        <h2>{proximo.nome}</h2>
                        <p> {formatarHorario(proximo.horario)}</p>
                    </>
                ) : (
                    <p>Nenhum atendimento restante 🎉</p>
                )
            }
        </div>
    )
}

export default NextAppointment