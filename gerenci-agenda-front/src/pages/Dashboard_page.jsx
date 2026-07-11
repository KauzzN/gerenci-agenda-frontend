import { useState, useEffect,  } from "react";
import { useNavigate } from "react-router-dom";
import { buscarProfile, listarAgendamentos } from "../services/agendamento";
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

    const navigate = useNavigate();

    const [agendamentos, setAgendamentos] =  useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openSlugModal, setOpenSlugModal] = useState(false);

    const [profile, setProfile] = useState(null);
    
    const link = `http://localhost:5173/book/public/${profile?.public_slug}/barbearia`

    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

    function copiarLink() {
        navigator.clipboard.writeText(link);
        toast.success("Link copiado")
    }


    async function carregarProfile() {
        const data = await buscarProfile()

        setProfile(data)
    }

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

    function logoff () {
        logout()
        navigate("/")
        
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
        async function carregarProfile() {
        const data = await buscarProfile()

        console.log(data)

        setProfile(data)

    }
    carregarProfile()
    }, []);

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