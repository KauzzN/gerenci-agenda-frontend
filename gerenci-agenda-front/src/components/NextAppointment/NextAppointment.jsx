import { useEffect, useState } from "react";
import { formatarHorario } from "../../utils/formatarHorario";
import { ClockIcon, User2Icon } from "lucide-react";

import "./NextAppointment.css"



function NextAppointment ({ stats }) {

    const [proximo, setProximo] = useState();

    useEffect(() => {
        setProximo(stats?.proximo || null);

    }, [stats]);

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