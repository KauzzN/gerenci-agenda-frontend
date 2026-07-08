import "./ DashboardStats.css"
import { useEffect } from "react";
import { buscarDashboard } from "../../services/agendamento"
import { useState } from "react";
import { UsersIcon, CheckCircle, Clock4Icon, UserRoundXIcon } from "lucide-react";


function DashboardStats () {
    
    const [total, setTotal] = useState(0);
    const [pendentes, setPendentes] = useState(0);
    const [atendidos, setAtendidos] = useState(0);
    const [faltaram, setFaltaram] = useState(0);

    useEffect(() => {

        async function carregarEstatisticas() {
            
            try {
                const data = await buscarDashboard();

                setTotal(data.total);
                setAtendidos(data.atendidos);
                setPendentes(data.pendentes);
                setFaltaram(data.faltaram);

            } catch (err) {
                console.log(err);
            }

        }

        carregarEstatisticas()
    }, []);


    return (
        <div className="stats-container">

            <div className="stat-card stat-card-overall">
                <div className="stat-card-info">
                    <p>Clientes hoje</p>
                </div>

                <div className="stat-icons">
                    <h2>{total}</h2>
                    <UsersIcon 
                    className="icon-users"
                    size={24}/>
                </div>
                <p>Agendamentos</p>
            </div>

            <div className="stat-card stat-card-success">
                <div className="stat-card-info">
                    <p>Atendidos</p>
                </div>

                <div className="stat-icons">
                    <h2>{atendidos}</h2>
                    <CheckCircle 
                    className="icon-success"
                    size={24}/>
                </div>

                <p>Concluidos</p>
            </div>

            <div className="stat-card stat-card-pending">
                <div className="stat-card-info">
                    <p>Pendentes</p>
                </div>

                <div className="stat-icons">
                    <h2>{pendentes}</h2>
                    <Clock4Icon 
                    className="icon-pending"
                    size={24}/>
                </div>
                <p>Aguardando</p>
            </div>

            <div className="stat-card stat-card-missed">
                <div className="stat-card-info">
                    <p>Faltaram</p>
                </div>

                <div className="stat-icons">
                    <h2>{faltaram}</h2>
                    <UserRoundXIcon 
                    className="icon-missed"
                    size={24}/>
                </div>
                <p>Ausências</p>
            </div>
        </div>

    )
}

export default DashboardStats