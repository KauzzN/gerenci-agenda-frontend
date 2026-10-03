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
import { Calendar, ClipboardList, Clock3, User, ChevronDown, CheckCircle2, X } from "lucide-react";

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
    const [confirmedBooking, setConfirmedBooking] = useState(null);
    const [profileExpanded, setProfileExpanded] = useState(false);
    const [step, setStep] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({});
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
        const nomeNormalizado = nome.trim();
        const telefoneNormalizado = telefone.replace(/[()\-\s]/g, "");
        const errors = {};
        if (!nomeNormalizado) errors.nome = "Informe seu nome.";
        else if (nomeNormalizado.length > 100) errors.nome = "O nome deve ter no máximo 100 caracteres.";
        if (!/^\d{10,11}$/.test(telefoneNormalizado)) {
            errors.telefone = "Informe um telefone válido com 10 ou 11 dígitos.";
        } else if (/^(\d)\1+$/.test(telefoneNormalizado)) {
            errors.telefone = "Informe um telefone válido.";
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length) {
            return false;
        }

        try {
            setAuthLoading(true);
            const response = await autenticarCliente(slug, nomeNormalizado, telefoneNormalizado);
            const token = response?.tokens?.access_token;
            if (!token) {
                throw new Error("A API não retornou o token do cliente.");
            }
            setAuthenticated(token);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || "Não foi possível identificar o cliente.");
            return false;
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleAgendar(){
        if (servicosSelecionados.length === 0) {
            setFieldErrors({ servicos: "Selecione ao menos um serviço." });
            return;
        }

        if (!isClientAuthenticated) {
            await autenticar();
            return;
        }

        if(!horarioSelecionado.trim()) {
            setFieldErrors({ horario: "Selecione um horário." });
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
            setConfirmedBooking({ data, horario: horarioSelecionado, nome });
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

    const steps = ["Cliente", "Serviços", "Data e hora", "Revisão"];
    const groupedHorarios = {
        morning: horarios.filter(({ horario }) => Number(horario?.slice(0, 2)) < 12),
        afternoon: horarios.filter(({ horario }) => Number(horario?.slice(0, 2)) >= 12)
    };
    const shortDates = Array.from({ length: 5 }, (_, index) => {
        const date = new Date(`${dataInicial}T12:00:00`);
        date.setDate(date.getDate() + index);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });
    const profileDetails = ["endereco", "telefone", "descricao"].filter((key) => profile?.[key]);

    return (
        <main className="public-page"><div className="public-card">
            {profileLoading && <p className="state-message">Carregando página pública...</p>}
            {!profileLoading && profileError && <p role="alert" className="state-message">{profileError}</p>}
            {!profileLoading && !profileError && <>
                <header className="wizard-header"><span className="eyebrow">Agendamento online</span><h1>{profile?.nome || profile?.barbearia}</h1><p>Agende seu horário em poucos segundos.</p><button type="button" className="profile-toggle" onClick={() => setProfileExpanded((value) => !value)} aria-expanded={profileExpanded}>Ver informações <ChevronDown size={16} /></button>{profileExpanded && profileDetails.length > 0 && <div className="profile-details">{profileDetails.map((key) => <p key={key}><strong>{key === "endereco" ? "Endereço" : key === "telefone" ? "Telefone" : "Sobre"}</strong>{profile[key]}</p>)}</div>}</header>
                <nav className="stepper" aria-label="Etapas do agendamento">{steps.map((label, index) => <button type="button" key={label} disabled={index > step} className={step === index ? "step active" : step > index ? "step complete" : "step"} onClick={() => index <= step && setStep(index)}><span>{index + 1}</span><strong>{label}</strong></button>)}</nav>
                {bookingCompleted ? <section className="success-card" role="status" aria-live="polite"><div className="success-icon" aria-hidden="true"><CheckCircle2 size={36}/></div><h2>Agendamento confirmado!</h2><p>Seu horário foi reservado com sucesso.</p><div className="summary"><div className="summary-item"><span>Data</span><strong>{confirmedBooking?.data}</strong></div><div className="summary-item"><span>Horário</span><strong>{confirmedBooking?.horario}</strong></div><div className="summary-item"><span>Cliente</span><strong>{confirmedBooking?.nome}</strong></div></div><div className="success-actions"><button type="button" className="schedule-button" onClick={() => { setBookingCompleted(false); setStep(0); }}>Novo agendamento</button><button type="button" className="text-button" onClick={() => setBookingCompleted(false)}><X size={16}/> Fechar</button></div></section> : <section className="wizard-stage">
                    {step === 0 && <div className="stage"><h2><User size={20}/> Seus dados</h2><p className="hint">Usaremos estas informações para identificar seu agendamento.</p><label className="field-label" htmlFor="client-name">Nome</label><input id="client-name" placeholder="Seu nome" value={nome} onChange={(e) => { setNome(e.target.value); setFieldErrors((current) => ({ ...current, nome: null })); }}/>{fieldErrors.nome && <p className="field-error" role="alert">{fieldErrors.nome}</p>}<label className="field-label" htmlFor="client-phone">Telefone</label><input id="client-phone" placeholder="Seu telefone" value={telefone} onChange={(e) => { setTelefone(e.target.value); setFieldErrors((current) => ({ ...current, telefone: null })); }}/>{fieldErrors.telefone && <p className="field-error" role="alert">{fieldErrors.telefone}</p>}<button type="button" className="schedule-button" onClick={async () => { if (isClientAuthenticated || await autenticar()) setStep(1); }} disabled={authLoading}>{authLoading ? "Identificando..." : "Continuar"}</button></div>}
                    {step === 1 && <div className="stage"><button type="button" className="back-button" onClick={() => setStep(0)} aria-label="Voltar para seus dados">← Voltar</button><h2><ClipboardList size={20}/> Escolha os serviços</h2>{servicos.length === 0 ? <p className="empty-times">Este negócio ainda não possui serviços disponíveis.</p> : <div className="service-list">{servicos.map((servico) => { const id = Number(servico.id); return <label className={servicosSelecionados.includes(id) ? "service-option selected" : "service-option"} key={id}><input type="checkbox" checked={servicosSelecionados.includes(id)} onChange={() => { setServicosSelecionados((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]); setFieldErrors((current) => ({ ...current, servicos: null })); setBookingCompleted(false); }}/><span>{servico.nome}</span></label>; })}</div>}{fieldErrors.servicos && <p className="field-error" role="alert">{fieldErrors.servicos}</p>}<button type="button" className="schedule-button" onClick={() => { if (!servicosSelecionados.length) { setFieldErrors({ servicos: "Selecione ao menos um serviço." }); return; } setStep(2); }} disabled={!servicos.length}>Escolher data e hora</button></div>}
                    {step === 2 && <div className="stage"><button type="button" className="back-button" onClick={() => setStep(1)} aria-label="Voltar para escolha de serviços">← Voltar</button><h2><Calendar size={20}/> Data e horário</h2><label className="field-label" htmlFor="booking-date">Data</label><div className="date-strip" aria-label="Datas próximas">{shortDates.map((date) => <button type="button" key={date} className={date === data ? "date-chip selected" : "date-chip"} onClick={() => setData(date)}>{new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })}</button>)}</div>                    <input id="booking-date" type="date" value={data} min={dataInicial} onChange={(e) => setData(e.target.value)}/><h3 className="section-title"><Clock3 size={18}/> Horários disponíveis</h3><div className="time-groups">{availabilityLoading && <p className="hint">Carregando horários...</p>}{!availabilityLoading && !availabilityError && groupedHorarios.morning.length > 0 && <><h4>Manhã</h4><div className="time-grid">{groupedHorarios.morning.map(({ horario }) => <button type="button" key={horario} className={horarioSelecionado === horario ? "time-button selected" : "time-button"} onClick={() => setHorarioSelecionado(horario)}>{horario}</button>)}</div></>}{!availabilityLoading && !availabilityError && groupedHorarios.afternoon.length > 0 && <><h4>Tarde</h4><div className="time-grid">{groupedHorarios.afternoon.map(({ horario }) => <button type="button" key={horario} className={horarioSelecionado === horario ? "time-button selected" : "time-button"} onClick={() => setHorarioSelecionado(horario)}>{horario}</button>)}</div></>}{availabilityError && <div role="alert" className="empty-times"><p>{availabilityError}</p><button type="button" className="time-button" onClick={carregarHorarios}>Tentar novamente</button></div>}{!availabilityLoading && !availabilityError && horarios.length === 0 && servicosSelecionados.length > 0 && <div className="empty-times">Nenhum horário disponível para esta data.</div>}</div><button type="button" className="schedule-button" onClick={() => setStep(3)} disabled={!horarioSelecionado}>Revisar agendamento</button></div>}
                    {step === 3 && <div className="stage"><button type="button" className="back-button" onClick={() => setStep(2)} aria-label="Voltar para data e horário">← Voltar</button><h2><ClipboardList size={20}/> Revise seu agendamento</h2><div className="summary"><div className="summary-item"><span>Serviços</span><strong>{servicosSelecionados.length} selecionado(s)</strong></div><div className="summary-item"><span>Data</span><strong>{data}</strong></div><div className="summary-item"><span>Horário</span><strong>{horarioSelecionado || "--:--"}</strong></div><div className="summary-item"><span>Cliente</span><strong>{nome || "..."}</strong></div></div><button type="button" className="schedule-button" disabled={loading || authLoading || bookingCompleted} onClick={handleAgendar}>{bookingCompleted ? "Agendamento confirmado" : loading ? "Agendando..." : "Confirmar agendamento"}</button></div>}
                </section>}
            </>}
        </div></main>
    )
}

export default PublicPage;
