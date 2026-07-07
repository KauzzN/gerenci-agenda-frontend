import { useEffect } from "react";
import { buscarDashboard } from "../../services/agendamento"
import { useState } from "react";

function DashboardStats () {
    
    const [total, setTotal] = useState(0);

    useEffect(() => {

        async function carregarEstatisticas() {
            
            try {
                const data = await buscarDashboard();

                setTotal(data.total);

            } catch (err) {
                console.log(err);
            }

        }

        carregarEstatisticas()
    }, []);


    return (
        <div>
            <h2>{total}</h2>
            <p>Clientes hoje</p>
        </div>
    )
}

export default DashboardStats