import { useEffect, useState } from "react";
import { atualizarAgendamento, criarAgendamento, listarClientes, listarServicos } from "../../services/agendamento";
import "./ModalAgendamento.css";

function ModalAgendamento({ onClose, onCreated, agendamento = null }) {
    const [clienteId, setClienteId] = useState(agendamento?.cliente_id || "");
    const [servicos, setServicos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [selecionados, setSelecionados] = useState(agendamento?.servicos || []);
    const originalHorario = agendamento?.horario_inicio;
    const [data, setData] = useState(originalHorario?.slice(0, 10) || "");
    const [horario, setHorario] = useState(originalHorario?.slice(11, 16) || "");
    const [status, setStatus] = useState(agendamento?.status || "PENDENTE");
    const [loading, setLoading] = useState(false);
    const editando = Boolean(agendamento);

    useEffect(() => {
        Promise.all([listarServicos(), listarClientes()])
            .then(([serviceData, clientData]) => {
                setServicos(serviceData || []);
                setClientes(clientData || []);
            }).catch(console.log);
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!clienteId || !data || !horario || !selecionados.length) return;
        const horario_inicio = `${data}T${horario}:00`;
        setLoading(true);
        try {
            if (editando) {
                await atualizarAgendamento(agendamento.id, {
                    cliente_id: Number(clienteId), servicos: selecionados, horario_inicio, status
                });
            } else {
                await criarAgendamento({ cliente_id: Number(clienteId), servicos: selecionados, horario_inicio });
            }
            onCreated();
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
                <h2>{editando ? "Editar Agendamento" : "Novo Agendamento"}</h2>
                <p>Informe o cliente, serviço e horário do atendimento.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <select value={clienteId} onChange={(event) => setClienteId(event.target.value)}>
                    <option value="">Selecione o cliente</option>
                    {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                    </option>)}
                </select>
                <fieldset>
                    <legend>Serviços</legend>
                    {servicos.map((servico) => {
                        const id = servico.id || servico.id_servico;
                        return <label key={id}><input type="checkbox"
                            checked={selecionados.includes(id)}
                            onChange={() => setSelecionados((current) => current.includes(id)
                                ? current.filter((value) => value !== id) : [...current, id])} />
                            {servico.nome}</label>;
                    })}
                </fieldset>
                <input type="date" value={data} onChange={(event) => setData(event.target.value)} />
                <input type="time" value={horario} onChange={(event) => setHorario(event.target.value)} />
                {editando && <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="PENDENTE">Pendente</option><option value="ATENDIDO">Atendido</option>
                    <option value="FALTOU">Faltou</option><option value="CANCELADO">Cancelado</option>
                </select>}
                <div className="modal-actions">
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
                </div>
            </form>
        </div>
    </div>;
}

export default ModalAgendamento;
