import { useState, useEffect } from "react";
import { listarAgendamentos } from "../services/agendamento";
import Header from "../components/Header/Header";
import AppointmentList from "../components/AppointmentList/AppointmentList";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import "./Dashboard_page.css"
import ModalAgendamento from "../components/ModalAgendamento/ModalAgendamento";

function Dashboard () {

    const [agendamentos, setAgendamentos] =  useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    async function carregarAgendamentos() {
        if (loading) return;

        setLoading(true);
        
        try {
            const data = await listarAgendamentos();

            console.log("API:", data)

            setAgendamentos(data.agendamentos);

        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false);
        }

    }

    function agruparPorDia(lista) {
    return lista.reduce((acc, item) => {
        const data = new Date(item.horario);
        const chave = `${data.getDate()}/${data.getMonth() + 1}`;

        if (!acc[chave]) acc[chave] = [];
        acc[chave].push(item);

        return acc;
    }, {});
}

    useEffect(() => {

        carregarAgendamentos();

        const interval = setInterval(() => {
            carregarAgendamentos();
        }, 10000)

        return () => clearInterval(interval)
        
    }, []);

    const ordenados = [...agendamentos].sort(
        (a, b) => new Date(a.horario) - new Date(b.horario)
    );

    const agrupados = agruparPorDia(ordenados)

    return (
        <div className="dashboard">
            
            <Header />

            <main className="dashboard-content">

                <AppointmentList 
                    agendamentos={agendamentos} 
                    />
            </main>

            <FloatingButton onClick={() => setOpenModal(true)}/>

            {openModal && (
                <ModalAgendamento
                    onClose={() => setOpenModal(false)}
                    onCreated={carregarAgendamentos}
                />
            )}
        </div>
    );
}

export default Dashboard