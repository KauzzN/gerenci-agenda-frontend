import { useEffect, useState } from "react"
import { buscarDashboard } from "../../services/agendamento";
import { formatarHorario } from "../../utils/formatarHorario";
import { ClockIcon, User2Icon } from "lucide-react";

import "./NextAppointment.css"



function NextAppointment () {

    const [proximo, setProximo] = useState();

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

    useEffect(() => {
        carregarEstatisticas()

        const interval = setInterval(() => {
            carregarEstatisticas()
        }, 10000)

        return () => clearInterval(interval)

    }, []);

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
                                <h2>{proximo.nome}</h2>
                            </>
                        ) : (
                            <p>Bom trabalho por hoje! 🎉</p>
                        )
                    }
                </div>
            </div>

            <div className="next-info-horario">

                {
                    proximo ? (
                        <>
                        <ClockIcon />
                            <p> Horario: {formatarHorario(proximo.horario)}</p>
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