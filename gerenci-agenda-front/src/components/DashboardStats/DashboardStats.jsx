import "./ DashboardStats.css"
import { useEffect } from "react";
import { buscarDashboard } from "../../services/agendamento"
import { useState } from "react";

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

            <div className="stat-card">
                <p>Clientes hoje</p>
                <h2>{total}</h2>
            </div>

            <div className="stat-card">
                <p>clientes atendidos</p>
                <h2>{atendidos}</h2>
            </div>

            <div className="stat-card">
                <p>clientes pendentes</p>
                <h2>{pendentes}</h2>
            </div>

            <div className="stat-card">
                <p>clientes faltantes</p>
                <h2>{faltaram}</h2>
            </div>
        </div>

    )
}

export default DashboardStats