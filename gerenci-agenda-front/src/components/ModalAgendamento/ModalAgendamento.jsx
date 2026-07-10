import { useEffect, useState } from "react"
import { atualizarAgendamento, criarAgendamento } from "../../services/agendamento"
import "./ModalAgendamento.css"
import { LucideSquareArrowDown, Save } from "lucide-react";
import { formatarHorarioInput } from "../../utils/formatarHorario";

function ModalAgendamento({
    onClose, 
    onCreated,
    agendamento = null
}) {
    
    const [nome, setNome] = useState(
        agendamento?.nome || ""
    );

    const [data, setData] = useState(
        agendamento
            ? agendamento.horario.slice(0,10)
            : ""
        );

    const [horario, setHorario] = useState(
        agendamento
            ? agendamento.horario.slice(11,16)
            : ""
    );

    const [status, setStatus] = useState(
        agendamento?.status || "PENDENTE"
    )
    const [loading, setLoading] = useState(false);

    const editando = agendamento !== null;

    function gerarHorarios() {
        const horarios = [];

        for (let h = 0; h < 24; h++) {
            horarios.push(`${String(h).padStart(2, "0")}:00`);
            horarios.push(`${String(h).padStart(2, "0")}:30`);
        }

        return horarios;
    }

    const horariosDisponiveis = gerarHorarios();


    function formatarHorarioInput(dataISO) {
        const data = new Date(dataISO)

        return data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "America/Fortaleza"

        })
    }

    function formatarDataInput(dataISO) {
        const data = new Date(dataISO)

        return data.toLocaleDateString("sv-SE", {
            timeZone: "America/Fortaleza"
        })
    }
    
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!nome || !horario || !data) 
            return;
        
        const horarioFinal = `${data} ${horario}:00`

        try {
            setLoading(true);

            if (editando) {

                await atualizarAgendamento(
                    agendamento.id,
                    {
                        nome, 
                        horario: horarioFinal,
                        status
                    }
                );
            } else {

                await criarAgendamento({
                    nome,
                    horario: horarioFinal
                });
            }

            onCreated();

            onClose();


        } catch (err) {

            console.log(err)

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        if (!agendamento) return;

        setNome(agendamento.nome)

        setData(formatarDataInput(agendamento.horario))

        setHorario(formatarHorarioInput(agendamento.horario))

        setStatus(agendamento.status)
    }, [agendamento])
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            
            <div 
                className="modal-container"
                onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>
                            {
                                editando
                                    ? "Editar Agendamento"
                                    : "Novo Agendamento"
                            }
                        </h2>
                        <p>
                            {
                                editando
                                    ? "Atualize as informações do atendimento"
                                    : "Cadastre um novo cliente."
                            }
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                    
                        <input 
                            type="text"
                            placeholder="Nome do cliente"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            />

                        <input
                            type="date"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            />

                        <div className="select-wrapper">

                            <select
                                value={horario}
                                onChange={(e) => setHorario(e.target.value)}
                                >
                                <option value="">Selecione o horário</option>

                                {horariosDisponiveis.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>

                            <span className="arrow"><LucideSquareArrowDown /></span>
                        </div>

                        {
                            editando &&  (
                                <div className="select-wrapper">

                                    <select 
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}>

                                            <option value="PENDENTE">
                                                Pendente
                                            </option>

                                            <option value="ATENDIDO">
                                                Atendido
                                            </option>

                                            <option value="FALTOU">
                                                Faltou
                                            </option>

                                            <option value="CANCELADO">
                                                Cancelado
                                            </option>
                                            
                                        </select>
                                </div>
                            )
                        }

                        <div className="modal-actions">

                            <button 
                                type="button"
                                onClick={onClose}
                                >
                                    Cancelar
                            </button>

                            <button 
                                type="submit"
                                disabled={loading}
                            >
                                {
                                    loading
                                        ? "Salvando..."
                                        : editando
                                            ? "Salvar alterações"
                                            : "Criar agendamento"
                                }
                            </button>

                        </div>

                    </form>
            </div>
        </div>
    )
}

export default ModalAgendamento