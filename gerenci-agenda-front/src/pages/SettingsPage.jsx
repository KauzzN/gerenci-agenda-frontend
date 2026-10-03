import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import { atualizarProfile, buscarProfile } from "../services/agendamento";
import "./SettingsPage.css";

const emptyProfile = {
    nome_negocio: "",
    public_slug: "",
    telefone: "",
    horario_inicio: "",
    horario_fim: "",
    inicio_almoco: "",
    fim_almoco: ""
};

const weekdays = [
    ["domingo", "Domingo"], ["segunda", "Segunda-feira"], ["terca", "Terça-feira"],
    ["quarta", "Quarta-feira"], ["quinta", "Quinta-feira"], ["sexta", "Sexta-feira"],
    ["sabado", "Sábado"]
];

function normalizarHorario(horario) {
    return horario ? horario.slice(0, 5) : "";
}

function SettingsPage() {
    const [profile, setProfile] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saveState, setSaveState] = useState(null);
    const savingRef = useRef(false);
    const publicLink = profile.public_slug
        ? `${window.location.origin}/book/${profile.public_slug}`
        : "";

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await buscarProfile();
                setProfile({
                    ...emptyProfile,
                    ...data,
                    dias_funcionando: Array.isArray(data.dias_funcionando) ? data.dias_funcionando : [],
                    horario_inicio: normalizarHorario(data.horario_inicio),
                    horario_fim: normalizarHorario(data.horario_fim),
                    inicio_almoco: normalizarHorario(data.inicio_almoco),
                    fim_almoco: normalizarHorario(data.fim_almoco)
                });
            } catch (error) {
                if (error.response?.status !== 404) {
                    toast.error("Não foi possível carregar as configurações.");
                }
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    function updateField(event) {
        setProfile((current) => ({
            ...current,
            [event.target.name]: event.target.value
        }));
        setFieldErrors((current) => ({ ...current, [event.target.name]: null }));
    }

    function toggleDay(day) {
        setProfile((current) => {
            const days = current.dias_funcionando || [];
            return { ...current, dias_funcionando: days.includes(day) ? days.filter((item) => item !== day) : [...days, day] };
        });
        setSaveState(null);
    }

    function validate() {
        const errors = {};
        const hasActiveDay = profile.dias_funcionando?.length > 0;
        if (profile.horario_inicio && profile.horario_fim && profile.horario_inicio >= profile.horario_fim) {
            errors.horario_fim = "O fim do expediente deve ser depois do início.";
        }
        if ((profile.inicio_almoco && !profile.fim_almoco) || (!profile.inicio_almoco && profile.fim_almoco)) {
            errors.inicio_almoco = "Informe início e fim do intervalo.";
            errors.fim_almoco = "Informe início e fim do intervalo.";
        } else if (profile.inicio_almoco && profile.fim_almoco && profile.inicio_almoco >= profile.fim_almoco) {
            errors.fim_almoco = "O fim do intervalo deve ser depois do início.";
        } else if (
            hasActiveDay
            && profile.horario_inicio
            && profile.horario_fim
            && profile.inicio_almoco
            && profile.fim_almoco
            && (
                profile.inicio_almoco < profile.horario_inicio
                || profile.fim_almoco > profile.horario_fim
            )
        ) {
            errors.inicio_almoco = "O intervalo precisa estar dentro do horário de atendimento.";
            errors.fim_almoco = "O intervalo precisa estar dentro do horário de atendimento.";
        }
        return errors;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (savingRef.current) return;
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setFieldErrors(validationErrors);
            setSaveState("error");
            return;
        }

        try {
            savingRef.current = true;
            setSaving(true);
            setFieldErrors({});
            setSaveState(null);
            const payload = Object.fromEntries(
                Object.entries(profile).filter(([, value]) => value !== "")
            );
            const response = await atualizarProfile(payload);
            setProfile((current) => ({ ...current, ...response.profile }));
            toast.success("Configurações salvas.");
            setSaveState("success");
        } catch (error) {
            const message = error.response?.data?.error;
            if (message?.includes("slug")) {
                setFieldErrors({ public_slug: message });
            } else {
                toast.error(message || "Não foi possível salvar as configurações.");
            }
            setSaveState("error");
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    return (
        <PanelLayout>
            <h2>Configurações</h2>
            {loading ? <p>Carregando configurações...</p> : (
                <form className="panel-section panel-form" onSubmit={handleSubmit}>
                    <h3>Perfil do negócio</h3>
                    <input name="nome_negocio" placeholder="Nome do negócio" value={profile.nome_negocio} onChange={updateField} />
                    <input aria-label="Slug público" name="public_slug" placeholder="Slug público" value={profile.public_slug || ""} onChange={updateField} />
                    {fieldErrors.public_slug && <p className="field-error" role="alert">{fieldErrors.public_slug}</p>}
                    <input name="telefone" placeholder="Telefone" value={profile.telefone || ""} onChange={updateField} />

                    <section className="settings-hours" aria-labelledby="hours-heading">
                        <h3 id="hours-heading">Dias de funcionamento</h3>
                        <p className="settings-hint">Selecione os dias em que você atende.</p>
                        <div className="weekday-grid">
                            {weekdays.map(([value, label]) => {
                                const checked = (profile.dias_funcionando || []).includes(value);
                                return <label className={`weekday-toggle ${checked ? "is-on" : ""}`} key={value}>
                                    <input type="checkbox" checked={checked} onChange={() => toggleDay(value)} />
                                    <span aria-hidden="true" className="toggle-track"><span /></span>
                                    <span>{label}</span><strong>{checked ? "ON" : "OFF"}</strong>
                                </label>;
                            })}
                        </div>
                        {profile.dias_funcionando?.length === 0 && <p className="settings-hint">Nenhum dia configurado.</p>}
                        <div className="time-grid">
                            <label>Início do expediente<input aria-label="Início do expediente" name="horario_inicio" type="time" disabled={!profile.dias_funcionando?.length} value={profile.horario_inicio || ""} onChange={updateField} /></label>
                            <label>Fim do expediente<input aria-label="Fim do expediente" name="horario_fim" type="time" disabled={!profile.dias_funcionando?.length} value={profile.horario_fim || ""} onChange={updateField} />{fieldErrors.horario_fim && <span className="field-error">{fieldErrors.horario_fim}</span>}</label>
                            <label>Início do intervalo<input aria-label="Início do almoço" name="inicio_almoco" type="time" disabled={!profile.dias_funcionando?.length} value={profile.inicio_almoco || ""} onChange={updateField} />{fieldErrors.inicio_almoco && <span className="field-error">{fieldErrors.inicio_almoco}</span>}</label>
                            <label>Fim do intervalo<input aria-label="Fim do almoço" name="fim_almoco" type="time" disabled={!profile.dias_funcionando?.length} value={profile.fim_almoco || ""} onChange={updateField} />{fieldErrors.fim_almoco && <span className="field-error">{fieldErrors.fim_almoco}</span>}</label>
                        </div>
                    </section>

                    {publicLink && (
                        <div>
                            <h3>Sua página pública</h3>
                            <p>{publicLink}</p>
                            <div className="panel-actions">
                                <a href={publicLink} target="_blank" rel="noreferrer">Abrir página</a>
                                <button type="button" onClick={() => navigator.clipboard.writeText(publicLink).then(() => toast.success("Link copiado."))}>Copiar link</button>
                            </div>
                        </div>
                    )}

                    <div className="panel-actions">
                        <button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</button>
                        {saveState === "success" && <span className="save-feedback success" role="status">Alterações salvas.</span>}
                        {saveState === "error" && <span className="save-feedback error" role="alert">Revise os campos destacados.</span>}
                    </div>
                </form>
            )}
        </PanelLayout>
    );
}

export default SettingsPage;
