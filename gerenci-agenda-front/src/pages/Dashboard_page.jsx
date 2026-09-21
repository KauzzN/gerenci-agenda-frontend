import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buscarDashboard, buscarProfile, listarAgendamentos } from "../services/agendamento";
import Header from "../components/Header/Header";
import AppointmentList from "../components/AppointmentList/AppointmentList";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import "./Dashboard_page.css"
import ModalAgendamento from "../components/ModalAgendamento/ModalAgendamento";
import { logout } from "../services/auth";
import DashboardStats from "../components/DashboardStats/DashboardStats";
import NextAppointment from "../components/NextAppointment/NextAppointment";
import { CopyIcon, Link } from "lucide-react";
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
    const [profileChecked, setProfileChecked] = useState(false);
    // Cada origem mantém seu próprio estado de erro para que o sucesso de
    // uma chamada não esconda a falha de outra chamada concorrente.
    const [statsErrorType, setStatsErrorType] = useState(null);
    const [agendamentosErrorType, setAgendamentosErrorType] = useState(null);
    const [profileErrorType, setProfileErrorType] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const link = profile?.public_slug
        ? `https://gerenci-agenda-frontend-cif7.vercel.app/book/${profile.public_slug}`
        : "";

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
            setStatsErrorType(null);

        } catch (err) {
            setStatsErrorType(err.response ? "api" : "network");
            console.log(err);

        }
    }


    // Função carregar Profile barbeiro
    async function carregarProfile() {
        try {
            const data = await buscarProfile();
            setProfile(data);
            setProfileErrorType(null);
        } catch (err) {
            // 404 significa apenas que o profissional ainda não configurou
            // o perfil/slug público, não é uma falha de carregamento.
            if (err.response?.status !== 404) {
                setProfileErrorType(err.response ? "api" : "network");
            } else {
                setProfileErrorType(null);
            }
            setProfile(null);
            console.log(err);
        } finally {
            setProfileChecked(true);
        }
    }


    // Função carregar Agendamentos barbeiro
    async function carregarAgendamentos() {
        if (loading) return;

        setLoading(true);
        
        try {
            const data = await listarAgendamentos();

            setAgendamentos(Array.isArray(data) ? data : []);
            setAgendamentosErrorType(null);

        } catch (err) {
            setAgendamentosErrorType(err.response ? "api" : "network");
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
    // Função editar agendamentos
    function handleEditar(agendamento) {
        setAgendamentoSelecionado(agendamento);
        setOpenModal(true)
    }

    useEffect(() => {

        async function carregarTudo() {
            await Promise.allSettled([
                carregarProfile(),
                carregarDashboard(),
                carregarAgendamentos()
            ]);
            setInitialLoading(false);
        }

        carregarTudo();

        const interval = setInterval(() => {
            carregarAgendamentos();
        }, 10000)

        return () => clearInterval(interval)
        
    }, []);

    const agendamentosHoje = useMemo(() => {
        const hoje = new Date();
        return agendamentos.filter((agendamento) => {
            const data = new Date(agendamento.horario_inicio);
            return data.getFullYear() === hoje.getFullYear()
                && data.getMonth() === hoje.getMonth()
                && data.getDate() === hoje.getDate();
        });
    }, [agendamentos]);

    const ordenados = [...agendamentosHoje].sort(
        (a, b) => new Date(a.horario_inicio) - new Date(b.horario_inicio)
    );

    const linkLabel = !profileChecked
        ? "Carregando link..."
        : (link || "Configure seu link público");

    const errosAtivos = [statsErrorType, agendamentosErrorType, profileErrorType].filter(Boolean);
    const dashboardErrorType = errosAtivos.includes("network")
        ? "network"
        : (errosAtivos.includes("api") ? "api" : null);

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
                        <span>{linkLabel}</span>
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

            {initialLoading && (
                <p>Carregando dashboard...</p>
            )}

            {!initialLoading && dashboardErrorType === "network" && (
                <p role="alert">Não foi possível conectar à API. Verifique sua conexão e tente novamente.</p>
            )}

            {!initialLoading && dashboardErrorType === "api" && (
                <p role="alert">Não foi possível carregar os dados do dashboard.</p>
            )}

            <DashboardStats stats={dashboardStats}/>


            <main className="dashboard-content">

                <div className="dashboard-main">
                    <AppointmentList 
                        agendamentos={ordenados}
                        onEdit={handleEditar}
                        loading={initialLoading}
                        />
                    
                </div>
                
                <aside className="dashboard-side">
                    <NextAppointment stats={dashboardStats} />
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