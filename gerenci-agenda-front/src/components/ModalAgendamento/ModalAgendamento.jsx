import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    atualizarAgendamento,
    atualizarStatusAgendamento,
    criarAgendamento,
    listarClientes,
    listarServicos
} from "../../services/agendamento";
import "./ModalAgendamento.css";

function separarHorarioLocal(dataISO) {
    if (!dataISO) return { data: "", horario: "" };

    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Fortaleza",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date(dataISO)).reduce((resultado, parte) => {
        resultado[parte.type] = parte.value;
        return resultado;
    }, {});

    return {
        data: `${partes.year}-${partes.month}-${partes.day}`,
        horario: `${partes.hour}:${partes.minute}`
    };
}

function ModalAgendamento({ onClose, onCreated, agendamento = null, dataInicial }) {
    const initialServiceIds = (agendamento?.servicos || []).map((servico) => (
        typeof servico === "object" ? servico.id : servico
    ));
    const [clienteId, setClienteId] = useState(agendamento?.cliente_id || "");
    const [servicos, setServicos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [selecionados, setSelecionados] = useState(initialServiceIds);
    const originalHorario = agendamento?.horario_inicio;
    const horarioLocal = separarHorarioLocal(originalHorario);
    const [data, setData] = useState(horarioLocal.data || dataInicial || "");
    const [horario, setHorario] = useState(horarioLocal.horario);
    const [status, setStatus] = useState(agendamento?.status || "PENDENTE");
    const [loading, setLoading] = useState(false);
    const [preparing, setPreparing] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const submittingRef = useRef(false);
    const editando = Boolean(agendamento);

    async function loadFormData() {
        setPreparing(true);
        setLoadError(null);
        try {
            const [serviceData, clientData] = await Promise.all([listarServicos(), listarClientes()]);
            setServicos(serviceData || []);
            setClientes(clientData || []);
        } catch (error) {
            setLoadError(error.response
                ? "Não foi possível carregar os dados do agendamento."
                : "Não foi possível conectar para preparar o agendamento.");
        } finally {
            setPreparing(false);
        }
    }

    useEffect(() => {
        loadFormData();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        const nextFieldErrors = {};

        if (!clienteId) {
            nextFieldErrors.clienteId = "Selecione um cliente.";
        }

        if (!selecionados.length) {
            nextFieldErrors.servicos = "Selecione ao menos um serviço.";
        }

        if (!data || !horario || Number.isNaN(new Date(`${data}T${horario}:00`).getTime())) {
            nextFieldErrors.horario = "Informe uma data e horário válidos.";
        }

        if (Object.keys(nextFieldErrors).length) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        if (submittingRef.current) return;

        const horario_inicio = `${data}T${horario}:00`;
        submittingRef.current = true;
        setLoading(true);
        setFieldErrors({});
        try {
            if (editando) {
                const detailsChanged = (
                    Number(clienteId) !== agendamento.cliente_id
                    || horario_inicio !== `${horarioLocal.data}T${horarioLocal.horario}:00`
                    || selecionados.length !== initialServiceIds.length
                    || selecionados.some((id) => !initialServiceIds.includes(id))
                );

                if (!detailsChanged) {
                    if (status === agendamento.status) {
                        toast.error("Nenhuma alteração foi realizada.");
                        return;
                    }

                    await atualizarStatusAgendamento(agendamento.id, status);
                } else {
                    await atualizarAgendamento(agendamento.id, {
                        cliente_id: Number(clienteId),
                        servicos: selecionados,
                        horario_inicio,
                        status
                    });
                }
            } else {
                await criarAgendamento({ cliente_id: Number(clienteId), servicos: selecionados, horario_inicio });
            }

            toast.success(editando ? "Status do agendamento atualizado." : "Agendamento criado.");
            onCreated();
            onClose();
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.error;

            if (statusCode === 400) {
                toast.error(message || "Revise os dados do agendamento.");
            } else if (statusCode === 401) {
                toast.error("Sua sessão expirou. Entre novamente para continuar.");
            } else if (statusCode === 403) {
                toast.error(message || "Você não tem permissão para este agendamento.");
            } else if (statusCode === 409) {
                toast.error("Este horário já está ocupado. Escolha outro horário.");
            } else if (!error.response) {
                toast.error("Não foi possível conectar à API. Tente novamente.");
            } else if (statusCode >= 500) {
                toast.error("Não foi possível criar o agendamento. Tente novamente.");
            } else {
                toast.error(message || "Não foi possível criar o agendamento.");
            }
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    }

    return <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
                <h2>{editando ? "Editar Agendamento" : "Novo Agendamento"}</h2>
                <p>Informe o cliente, serviço e horário do atendimento.</p>
            </div>
            {preparing ? <p>Carregando dados do agendamento...</p> : loadError ? (
                <div role="alert">
                    <p>{loadError}</p>
                    <button type="button" onClick={loadFormData}>Tentar novamente</button>
                </div>
            ) : <form onSubmit={handleSubmit}>
                <select
                    aria-label="Cliente"
                    value={clienteId}
                    onChange={(event) => {
                        setClienteId(event.target.value);
                        setFieldErrors((current) => ({ ...current, clienteId: null }));
                    }}
                >
                    <option value="">Selecione o cliente</option>
                    {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                    </option>)}
                </select>
                {fieldErrors.clienteId && <p className="field-error" role="alert">{fieldErrors.clienteId}</p>}
                <fieldset>
                    <legend>Serviços</legend>
                    {servicos.map((servico) => {
                        const id = servico.id;
                        return <label key={id}><input type="checkbox"
                            aria-label={servico.nome}
                            checked={selecionados.includes(id)}
                            onChange={() => {
                                setSelecionados((current) => current.includes(id)
                                    ? current.filter((value) => value !== id) : [...current, id]);
                                setFieldErrors((current) => ({ ...current, servicos: null }));
                            }} />
                            {servico.nome}</label>;
                    })}
                </fieldset>
                {fieldErrors.servicos && <p className="field-error" role="alert">{fieldErrors.servicos}</p>}
                <input
                    aria-label="Data"
                    type="date"
                    value={data}
                    onChange={(event) => {
                        setData(event.target.value);
                        setFieldErrors((current) => ({ ...current, horario: null }));
                    }}
                />
                <input
                    aria-label="Horário"
                    type="time"
                    value={horario}
                    onChange={(event) => {
                        setHorario(event.target.value);
                        setFieldErrors((current) => ({ ...current, horario: null }));
                    }}
                />
                {fieldErrors.horario && <p className="field-error" role="alert">{fieldErrors.horario}</p>}
                {editando && <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="PENDENTE">Pendente</option><option value="ATENDIDO">Atendido</option>
                    <option value="FALTOU">Faltou</option>
                </select>}
                <div className="modal-actions">
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
                </div>
            </form>}
        </div>
    </div>;
}

export default ModalAgendamento;
