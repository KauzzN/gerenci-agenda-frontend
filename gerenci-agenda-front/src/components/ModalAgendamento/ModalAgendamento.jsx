import { useState } from "react"
import { criarAgendamento } from "../../services/agendamento"
import "./ModalAgendamento.css"

function ModalAgendamento({onClose, onCreated}) {
    
    const [nome, setNome] = useState("");
    const [data, setData] = useState("");
    const [horario, setHorario] = useState("");

    const [loading, setLoading] = useState("");

    function gerarHorarios() {
        const horarios = [];

        for (let h = 0; h < 24; h++) {
            horarios.push(`${String(h).padStart(2, "0")}:00`);
            horarios.push(`${String(h).padStart(2, "0")}:30`);
        }

        return horarios;
    }

    const horariosDisponiveis = gerarHorarios();

    const horarioFinal = `${data} ${horario}:00`


    
    async function handleSubmit(e) {
        e.preventDefault();

        console.log("clicou no submit")

        if (!nome || !horario) return;

        try {
            setLoading(true);

            await criarAgendamento({
                nome, 
                horario: horarioFinal
            });

            setNome("");
            setHorario("");

            onCreated();
            onClose();
        } catch (err) {
            console.log("erro ao criar agendamento")
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            
            <div 
                className="modal-container"
                onClick={(e) => e.stopPropagation()}>
                    <h2>Novo Agendamento</h2>

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

                            <span className="arrow">⌄</span>
                        </div>

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
                                {loading ? "Salvando..." : "Salvar"}
                            </button>

                        </div>

                    </form>
            </div>
        </div>
    )
}

export default ModalAgendamento