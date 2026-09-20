import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./Public_page.css";

import {
    buscarHorarios,
    buscarProfilePublic,
    criarAgendamentoPublic
    ,autenticarCliente
} from "../../services/public";
import { useClientAuth } from "../../contexts/ClientAuthContext";
import toast from "react-hot-toast";
import { Calendar, ClipboardList, Clock3, User } from "lucide-react";

function PublicPage() {

    const { slug } = useParams();

    const hoje = new Date().toISOString().slice(0,10);

    const [data, setData] = useState(hoje);
    const [profile, setProfile] = useState(null);

    const [horarios, setHorarios] = useState([]);

    const [horarioSelecionado, setHorarioSelecionado] = useState("");

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [servicos, setServicos] = useState([]);
    const [servicosSelecionados, setServicosSelecionados] = useState([]);
    const { isClientAuthenticated, setAuthenticated } = useClientAuth();

    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    const carregarHorarios = useCallback(async () => {
        if (!isClientAuthenticated || servicosSelecionados.length === 0) {
            setHorarios([]);
            return;
        }

        try {
            const response = await buscarHorarios(slug, data, servicosSelecionados);
            setHorarios(response.horarios || response);
        } catch (error) {
            console.log(error);
        }
    }, [data, isClientAuthenticated, servicosSelecionados, slug]);

    async function autenticar() {
        if (!nome.trim() || !telefone.trim()) {
            toast.error("Informe seu nome e telefone.");
            return;
        }

        try {
            setAuthLoading(true);
            const response = await autenticarCliente(slug, nome.trim(), telefone.trim());
            const token = response?.tokens?.access_token;
            if (!token) {
                throw new Error("A API não retornou o token do cliente.");
            }
            setAuthenticated(token);
        } catch (error) {
            toast.error(error.response?.data?.error || "Não foi possível identificar o cliente.");
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleAgendar(){
        if (!isClientAuthenticated) {
            await autenticar();
            return;
        }

        if (servicosSelecionados.length === 0) {
            toast.error("Selecione ao menos um serviço.");
            return;
        }

        if(!horarioSelecionado.trim()) {
            toast.error("Selecione um horário.");
            return;
        }


        try{

            setLoading(true);
            await criarAgendamentoPublic(
                slug,
                { servicos: servicosSelecionados,
                  horario_inicio: `${data}T${horarioSelecionado}:00` }
            );

            toast.success("Horário agendado")

            setNome("");
            setTelefone("");

            setHorarioSelecionado("");

            await carregarHorarios();

        }catch(err){

            console.log(err.response?.data || err);

        }finally{

            setLoading(false);

        }

    }

    useEffect(()=>{

        if (!isClientAuthenticated) {
            setProfile(null);
            setServicos([]);
            return;
        }

        async function carregarProfile() {
            try {
                const response = await buscarProfilePublic(slug);
                setProfile(response);
                setServicos(response.servicos || response.services || []);
            } catch (error) {
                toast.error(error.response?.data?.error || "Não foi possível carregar a barbearia.");
            }
        }

        carregarProfile();
    }, [slug, isClientAuthenticated]);

    useEffect(()=>{

        carregarHorarios();

    }, [carregarHorarios]);

    return (

        <main className="public-page">

            <div className="public-card">

                <h1>{profile?.nome || profile?.barbearia}</h1>

                <p>
                    Agende seu horário em poucos segundos.
                </p>

                <label className="field-label">
                    <User size={18}/> Seu nome
                </label>

                <input
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e)=>setNome(e.target.value)}
                />

                <label className="field-label">Telefone</label>
                <input placeholder="Seu telefone" value={telefone}
                    onChange={(e)=>setTelefone(e.target.value)} />

                {!isClientAuthenticated ? (
                    <button className="schedule-button" disabled={authLoading} onClick={autenticar}>
                        {authLoading ? "Continuando..." : "Continuar"}
                    </button>
                ) : (
                    <>
                        {servicos.length > 0 && <label className="field-label">Serviços</label>}
                        {servicos.map((servico) => {
                            const id = Number(servico.id);
                            return <label key={id}>
                                <input type="checkbox" checked={servicosSelecionados.includes(id)}
                                    onChange={() => setServicosSelecionados((current) =>
                                        current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
                                    )} />
                                {servico.nome}
                            </label>;
                        })}

                        <label className="field-label">
                            <Calendar size={18}/> Escolha a data
                        </label>

                        <input type="date" value={data} onChange={(e)=>setData(e.target.value)} />

                        <h3> <Clock3 size={18}/> Horários disponíveis</h3>

                        <div className="time-grid">
                            {horarios.map(({ horario }) => (
                                <button key={horario}
                                    className={horarioSelecionado===horario ? "time-button selected" : "time-button"}
                                    onClick={()=>setHorarioSelecionado(horario)}>
                                    {horario}
                                </button>
                            ))}

                            {horarios.length === 0 && (
                                <div className="empty-times">Nenhum horário disponível para esta data.</div>
                            )}
                        </div>
                    </>
                )}

                <div className="summary">

                    <h3> <ClipboardList size={18}/> Resumo do agendamento</h3>

                    <div className="summary-item">
                        <span>Data</span>
                        <strong>{data}</strong>
                    </div>

                    <div className="summary-item">
                        <span>Horário</span>
                        <strong>{horarioSelecionado || "--:--"}</strong>
                    </div>

                    <div className="summary-item">
                        <span>Cliente</span>
                        <strong>{nome || "..."}</strong>
                    </div>

                </div>

                {isClientAuthenticated && <button

                    className="schedule-button"

                    disabled={loading}

                    onClick={handleAgendar}

                >

                    {
                        loading
                        ? "Agendando..."
                        : "Confirmar Agendamento"
                    }

                </button>}


            </div>

        </main>

        )

}

export default PublicPage;