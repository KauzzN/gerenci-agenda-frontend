import { useState, useEffect } from "react";
import { listarAgendamentos } from "../services/agendamento";
import Header from "../components/Header/Header";
import AppointmentList from "../components/AppointmentList/AppointmentList";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import "./Dashboard_page.css"
import ModalAgendamento from "../components/ModalAgendamento/ModalAgendamento";
import { logout, me } from "../services/auth";
import DashboardStats from "../components/DashboardStats/DashboardStats";
import NextAppointment from "../components/NextAppointment/NextAppointment";

function Dashboard () {

    const [agendamentos, setAgendamentos] =  useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

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

    function handleEditar(agendamento) {
        setAgendamentoSelecionado(agendamento);
        setOpenModal(true)
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
            
            <Header onLogout={logout}/>

            <div className="dashboard-divider"/>

            <DashboardStats />


            <main className="dashboard-content">

                <div className="dashboard-main">
                    <AppointmentList 
                        agendamentos={agendamentos} 
                        onEdit={handleEditar}
                        />
                    
                </div>
                
                <aside className="dashboard-side">
                    <NextAppointment />
                </aside>

            </main>

            <FloatingButton onClick={() => {
                setAgendamentoSelecionado(null)
                setOpenModal(true)
            }}/>

            {openModal && (
                <ModalAgendamento
                    agendamento={agendamentoSelecionado}
                    onClose={() => {
                        setOpenModal(false);
                        setAgendamentoSelecionado(null);
                    }}
                    onCreated={carregarAgendamentos}
                />
            )}
        </div>
    );
}

export default Dashboard