import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import PanelLayout from "../components/PanelLayout/PanelLayout";
import { atualizarServico, criarServico, listarServicos } from "../services/agendamento";
import "./ServicesPage.css";

const emptyService = {
    nome: "",
    preco: "",
    duracao: "",
    descricao: "",
    cor: "#000000",
    ativo: true
};

function ServicesPage() {
    const [services, setServices] = useState([]);
    const [service, setService] = useState(emptyService);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [query, setQuery] = useState("");
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const savingRef = useRef(false);

    async function loadServices() {
        try {
            setLoading(true);
            setLoadError("");
            setServices(await listarServicos());
        } catch {
            setLoadError("Não foi possível carregar os serviços. Tente novamente.");
            toast.error("Não foi possível carregar os serviços.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadServices();
    }, []);

    function updateField(event) {
        const { name, value, type, checked } = event.target;
        setService((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value
        }));
        setFieldErrors((current) => ({ ...current, [name]: null }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (savingRef.current) return;

        const payload = {
            ...service,
            nome: service.nome.trim(),
            duracao: Number(service.duracao)
        };
        const nextFieldErrors = {};

        if (!payload.nome) nextFieldErrors.nome = "Informe o nome do serviço.";
        if (payload.descricao.length > 200) nextFieldErrors.descricao = "A descrição deve ter no máximo 200 caracteres.";
        if (!/^#[0-9A-Fa-f]{3,6}$/.test(payload.cor)) nextFieldErrors.cor = "Informe uma cor hexadecimal válida.";
        if (!Number.isFinite(Number(service.preco)) || Number(service.preco) < 0) {
            nextFieldErrors.preco = "Informe um preço válido.";
        }
        if (!Number.isInteger(payload.duracao) || payload.duracao <= 0) {
            nextFieldErrors.duracao = "Informe uma duração maior que zero.";
        }
        if (Object.keys(nextFieldErrors).length) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        try {
            savingRef.current = true;
            setSaving(true);
            setFieldErrors({});
            if (editingId) {
                const updated = await atualizarServico(editingId, payload);
                setServices((current) => current.map((item) => (
                    item.id === editingId ? (updated || { ...item, ...payload }) : item
                )));
                toast.success("Serviço atualizado.");
            } else {
                const created = await criarServico(payload);
                setServices((current) => [...current, created]);
                toast.success("Serviço cadastrado.");
            }
            setService(emptyService);
            setEditingId(null);
        } catch (error) {
            const message = error.response?.data?.error;
            const apiFieldErrors = {};
            if (message?.includes("nome do serviço")) apiFieldErrors.nome = message;
            if (message?.includes("preço")) apiFieldErrors.preco = message;
            if (message?.includes("duração")) apiFieldErrors.duracao = message;

            if (Object.keys(apiFieldErrors).length) {
                setFieldErrors(apiFieldErrors);
            } else {
                toast.error(message || "Não foi possível salvar o serviço.");
            }
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    function editService(item) {
        setEditingId(item.id);
        setFieldErrors({});
        setService({
            nome: item.nome,
            preco: item.preco,
            duracao: String(item.duracao),
            descricao: item.descricao || "",
            cor: item.cor || "#000000",
            ativo: item.ativo
        });
    }

    const visibleServices = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        return services.filter((item) => item.nome?.toLocaleLowerCase().includes(normalizedQuery));
    }, [services, query]);

    return (
        <PanelLayout>
            <header className="services-heading">
                <div><p className="eyebrow">Catálogo</p><h2>Serviços</h2><p>Gerencie o que seus clientes podem agendar.</p></div>
                <span className="service-count">{services.length} {services.length === 1 ? "serviço" : "serviços"}</span>
            </header>
            <section className="panel-section">
                <h3>{editingId ? "Editar serviço" : "Novo serviço"}</h3>
                <form className="panel-form service-form" onSubmit={handleSubmit} noValidate>
                    <input aria-label="Nome" name="nome" placeholder="Nome" value={service.nome} onChange={updateField} />
                    {fieldErrors.nome && <p className="field-error" role="alert">{fieldErrors.nome}</p>}
                    <input aria-label="Preço" name="preco" placeholder="Preço" inputMode="decimal" value={service.preco} onChange={updateField} />
                    {fieldErrors.preco && <p className="field-error" role="alert">{fieldErrors.preco}</p>}
                    <input aria-label="Duração em minutos" name="duracao" placeholder="Duração em minutos" inputMode="numeric" value={service.duracao} onChange={updateField} />
                    {fieldErrors.duracao && <p className="field-error" role="alert">{fieldErrors.duracao}</p>}
                    <label className="service-wide">Descrição (opcional)<textarea name="descricao" placeholder="Adicione detalhes para sua equipe." value={service.descricao} onChange={updateField} /></label>
                    {fieldErrors.descricao && <p className="field-error" role="alert">{fieldErrors.descricao}</p>}
                    <input aria-label="Cor do serviço" name="cor" type="color" value={service.cor} onChange={updateField} />
                    {fieldErrors.cor && <p className="field-error" role="alert">{fieldErrors.cor}</p>}
                    {editingId && typeof service.ativo === "boolean" && <label><input name="ativo" type="checkbox" checked={service.ativo} onChange={updateField} /> Serviço ativo</label>}
                    <div className="panel-actions">
                        {editingId && <button type="button" onClick={() => { setEditingId(null); setService(emptyService); }}>Cancelar edição</button>}
                        <button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar serviço"}</button>
                    </div>
                </form>
            </section>
            <section className="panel-section">
                <h3>Serviços cadastrados</h3>
                <label className="search-field">Buscar serviço<input aria-label="Buscar serviço" placeholder="Buscar por nome" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
                {loading ? <p className="state-message">Carregando serviços...</p> : loadError ? (
                    <div className="state-message"><p>{loadError}</p><button type="button" onClick={loadServices}>Tentar novamente</button></div>
                ) : services.length === 0 ? (
                    <p>Você ainda não possui serviços cadastrados.</p>
                ) : visibleServices.length === 0 ? (
                    <p className="state-message">Nenhum serviço corresponde à sua busca.</p>
                ) : (
                    <ul className="panel-list">
                        {visibleServices.map((item) => (
                            <li key={item.id}>
                                <div>
                                    <strong>{item.nome}</strong>
                                    <p>R$ {Number(item.preco).toFixed(2).replace(".", ",")} • {item.duracao} min {typeof item.ativo === "boolean" && `• ${item.ativo ? "Ativo" : "Inativo"}`}</p>
                                </div>
                                <button type="button" onClick={() => editService(item)}>Editar</button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PanelLayout>
    );
}

export default ServicesPage;
