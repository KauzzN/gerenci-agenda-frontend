import { useState, useEffect,  } from "react";
import { useNavigate } from "react-router-dom";
import { buscarDashboard, buscarProfile, listarAgendamentos } from "../services/agendamento";
import Header from "../components/Header/Header";
import AppointmentList from "../components/AppointmentList/AppointmentList";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import "./Dashboard_page.css"
import ModalAgendamento from "../components/ModalAgendamento/ModalAgendamento";
import { logout, me } from "../services/auth";
import DashboardStats from "../components/DashboardStats/DashboardStats";
import NextAppointment from "../components/NextAppointment/NextAppointment";
import { Check, CopyIcon, Link } from "lucide-react";
import toast from "react-hot-toast";
import ModalSlug from "../components/ModalSlug/ModalSlug";


function Dashboard () {

    // Variaveis
    const navigate = useNavigate();

    const [agendamentos, setAgendamentos] =  useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openSlugModal, setOpenSlugModal] = useState(false);

    const [dashboardStats, setDashboardStats] = useState(null);

    const [profile, setProfile] = useState(null);
    
    const link = `https://gerenci-agenda-frontend-cif7.vercel.app/book/${profile?.public_slug}`

    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

    // Função copiar link
    function copiarLink() {
        navigator.clipboard.writeText(link);

        toast.success("Link copiado")
    }

    // Função buscar estatisticas díaris
    async function carregarDashboard() {

        try {

            const data = await buscarDashboard();

            setDashboardStats(data)

        } catch (err) {
            
            console.log(err);

        }
    }


    // Função carregar Profile barbeiro
    async function carregarProfile() {
        const data = await buscarProfile()

        setProfile(data)
    }


    // Função carregar Agendamentos barbeiro
    async function carregarAgendamentos() {
        if (loading) return;

        setLoading(true);
        
        try {
            const data = await listarAgendamentos();

            setAgendamentos(data.agendamentos);

        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false);
        }

    }


    // Função fazer logout
    function logoff () {
        logout()
        navigate("/")
        
    }


    // Função agrupar agendamentos por dia
    function agruparPorDia(lista) {
    return lista.reduce((acc, item) => {
        const data = new Date(item.horario);
        const chave = `${data.getDate()}/${data.getMonth() + 1}`;

        if (!acc[chave]) acc[chave] = [];
        acc[chave].push(item);

        return acc;
        }, {});
    }

    // Função editar agendamentos
    function handleEditar(agendamento) {
        setAgendamentoSelecionado(agendamento);
        setOpenModal(true)
    }

    useEffect(() => {
        async function carregarProfile() {
        const data = await buscarProfile()

        console.log(data)

        setProfile(data)

    }
    carregarProfile()
    }, []);

    useEffect(() => {

        carregarDashboard()
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
            
            <Header onLogout={logoff}/>

            <div className="dashboard-divider"/>

            <div className="public-link-box">
                <div className="public-link-header">

                    <Link />
                    <small>Seu link público</small>

                </div>

                <div className="public-link-button">
                    <button onClick={copiarLink}
                    >
                        <span>{link}</span>
                        <CopyIcon />
                    </button>

                    <button 
                        onClick={() => setOpenSlugModal(true)}>
                        Editar
                    </button>
                </div>
            </div>

            {
                openSlugModal && (
                    <ModalSlug 
                        profile={profile}
                        onClose={() => setOpenSlugModal(false)}
                        onUpdated={carregarProfile}
                    />

                )
            }

            <DashboardStats stats={dashboardStats}/>


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
                    onCreated={() => {
                        carregarAgendamentos(),
                        carregarDashboard()
                    }}
                />
            )}
        </div>
    );
}

export default Dashboard