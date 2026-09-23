import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import { atualizarProfile, buscarProfile } from "../services/agendamento";

const emptyProfile = {
    nome_negocio: "",
    public_slug: "",
    telefone: "",
    horario_inicio: "",
    horario_fim: "",
    inicio_almoco: "",
    fim_almoco: ""
};

function normalizarHorario(horario) {
    return horario ? horario.slice(0, 5) : "";
}

function SettingsPage() {
    const [profile, setProfile] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
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

    async function handleSubmit(event) {
        event.preventDefault();
        if (savingRef.current) return;

        try {
            savingRef.current = true;
            setSaving(true);
            setFieldErrors({});
            const payload = Object.fromEntries(
                Object.entries(profile).filter(([, value]) => value !== "")
            );
            const response = await atualizarProfile(payload);
            setProfile((current) => ({ ...current, ...response.profile }));
            toast.success("Configurações salvas.");
        } catch (error) {
            const message = error.response?.data?.error;
            if (message?.includes("slug")) {
                setFieldErrors({ public_slug: message });
            } else {
                toast.error(message || "Não foi possível salvar as configurações.");
            }
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

                    <h3>Horário de funcionamento</h3>
                    <input aria-label="Início do expediente" name="horario_inicio" type="time" value={profile.horario_inicio || ""} onChange={updateField} />
                    <input aria-label="Fim do expediente" name="horario_fim" type="time" value={profile.horario_fim || ""} onChange={updateField} />
                    <input aria-label="Início do almoço" name="inicio_almoco" type="time" value={profile.inicio_almoco || ""} onChange={updateField} />
                    <input aria-label="Fim do almoço" name="fim_almoco" type="time" value={profile.fim_almoco || ""} onChange={updateField} />

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
                    </div>
                </form>
            )}
        </PanelLayout>
    );
}

export default SettingsPage;
