import { useCallback, useEffect, useRef, useState } from "react";
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

    const hoje = new Date();
    const dataInicial = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    const [data, setData] = useState(dataInicial);
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
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [availabilityError, setAvailabilityError] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [bookingCompleted, setBookingCompleted] = useState(false);
    const bookingRef = useRef(false);
    const availabilityRequestRef = useRef(0);

    const carregarHorarios = useCallback(async () => {
        const requestId = availabilityRequestRef.current + 1;
        availabilityRequestRef.current = requestId;

        if (!isClientAuthenticated || servicosSelecionados.length === 0) {
            setHorarios([]);
            setAvailabilityError(null);
            setAvailabilityLoading(false);
            return;
        }

        try {
            setAvailabilityLoading(true);
            const response = await buscarHorarios(slug, data, servicosSelecionados);
            if (requestId === availabilityRequestRef.current) {
                setHorarios(response.horarios || []);
                setAvailabilityError(null);
            }
        } catch (error) {
            if (requestId === availabilityRequestRef.current) {
                setHorarios([]);
                setAvailabilityError(error.response?.data?.error || "Não foi possível carregar horários.");
            }
        } finally {
            if (requestId === availabilityRequestRef.current) {
                setAvailabilityLoading(false);
            }
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
        if (servicosSelecionados.length === 0) {
            toast.error("Selecione ao menos um serviço.");
            return;
        }

        if (!isClientAuthenticated) {
            await autenticar();
            return;
        }

        if(!horarioSelecionado.trim()) {
            toast.error("Selecione um horário.");
            return;
        }

        if (bookingRef.current) return;

        try{

            bookingRef.current = true;
            setLoading(true);
            await criarAgendamentoPublic(
                slug,
                { servicos: servicosSelecionados,
                  horario_inicio: `${data}T${horarioSelecionado}:00` }
            );

            toast.success("Horário agendado.");
            setHorarioSelecionado("");
            setBookingCompleted(true);

            await carregarHorarios();

        }catch(err){
            const status = err.response?.status;
            const message = err.response?.data?.error;

            if (status === 401) {
                toast.error("Sua sessão expirou. Informe seus dados novamente.");
            } else if (status === 409) {
                toast.error("Este horário acabou de ser reservado. Escolha outro.");
                setHorarioSelecionado("");
                await carregarHorarios();
            } else if (!err.response) {
                toast.error("Não foi possível conectar à API. Tente novamente.");
            } else {
                toast.error(message || "Não foi possível concluir o agendamento.");
            }

        }finally{

            bookingRef.current = false;
            setLoading(false);

        }

    }

    useEffect(() => {
        async function carregarProfile() {
            try {
                setProfileLoading(true);
                setProfileError(null);
                const response = await buscarProfilePublic(slug);
                setProfile(response);
                setServicos(response.servicos || []);
            } catch (error) {
                setProfile(null);
                setServicos([]);
                setProfileError(error.response?.status === 404
                    ? "Este negócio não foi encontrado."
                    : "Não foi possível carregar esta página.");
            } finally {
                setProfileLoading(false);
            }
        }

        carregarProfile();
    }, [slug]);

    useEffect(()=>{

        carregarHorarios();

    }, [carregarHorarios]);

    useEffect(() => {
        setHorarioSelecionado("");
        setBookingCompleted(false);
    }, [data, servicosSelecionados]);

    return (

        <main className="public-page">

            <div className="public-card">

                {profileLoading && <p>Carregando página pública...</p>}

                {!profileLoading && profileError && (
                    <p role="alert">{profileError}</p>
                )}

                {!profileLoading && !profileError && (
                    <>
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

                {servicos.length === 0 ? (
                    <p>Este negócio ainda não possui serviços disponíveis.</p>
                ) : (
                    <>
                        <label className="field-label">Serviços</label>
                        {servicos.map((servico) => {
                            const id = Number(servico.id);
                            return <label key={id}>
                                <input type="checkbox" checked={servicosSelecionados.includes(id)}
                                    onChange={() => {
                                        setServicosSelecionados((current) =>
                                            current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
                                        );
                                        setBookingCompleted(false);
                                    }} />
                                {servico.nome}
                            </label>;
                        })}

                        <label className="field-label">
                            <Calendar size={18}/> Escolha a data
                        </label>

                        <input type="date" value={data} onChange={(e)=>setData(e.target.value)} />

                        <h3> <Clock3 size={18}/> Horários disponíveis</h3>

                        <div className="time-grid">
                            {availabilityLoading && <div>Carregando horários...</div>}
                            {horarios.map(({ horario }) => (
                                <button key={horario}
                                    className={horarioSelecionado===horario ? "time-button selected" : "time-button"}
                                    onClick={()=>setHorarioSelecionado(horario)}>
                                    {horario}
                                </button>
                            ))}

                            {availabilityError && (
                                <div role="alert" className="empty-times">
                                    <p>{availabilityError}</p>
                                    <button type="button" className="time-button" onClick={carregarHorarios}>
                                        Tentar novamente
                                    </button>
                                </div>
                            )}

                            {!availabilityLoading && !availabilityError && horarios.length === 0 && servicosSelecionados.length > 0 && (
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

                {servicos.length > 0 && (
                    <button
                        className="schedule-button"
                        disabled={loading || authLoading || bookingCompleted}
                        onClick={handleAgendar}
                    >
                        {bookingCompleted
                            ? "Agendamento confirmado"
                            : loading
                            ? "Agendando..."
                            : (authLoading ? "Continuando..." : "Confirmar Agendamento")}
                    </button>
                )}
                    </>
                )}

            </div>

        </main>

        )

}

export default PublicPage;