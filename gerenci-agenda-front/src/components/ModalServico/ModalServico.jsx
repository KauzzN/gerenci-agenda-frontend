import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { criarServico, listarServicos } from "../../services/agendamento";
import "../ModalAgendamento/ModalAgendamento.css";

function ModalServico({ onClose }) {
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [duracao, setDuracao] = useState("");
    const [descricao, setDescricao] = useState("");
    const [cor, setCor] = useState("#000000");
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(false);

    async function carregarServicos() {
        try {
            setServicos(await listarServicos());
        } catch (error) {
            toast.error(error.response?.data?.error || "Não foi possível carregar os serviços.");
        }
    }

    useEffect(() => {
        carregarServicos();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            const servico = await criarServico({
                nome: nome.trim(),
                preco,
                duracao: Number(duracao),
                descricao: descricao.trim(),
                cor
            });

            setServicos((current) => [...current, servico]);
            setNome("");
            setPreco("");
            setDuracao("");
            setDescricao("");
            setCor("#000000");
            toast.success("Serviço cadastrado com sucesso.");
        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data?.error;

            if (status === 400) {
                toast.error(message || "Revise os dados do serviço.");
            } else if (status === 401) {
                toast.error("Sua sessão expirou. Entre novamente para continuar.");
            } else if (status === 409) {
                toast.error(message || "Já existe um serviço com esses dados.");
            } else if (!error.response) {
                toast.error("Não foi possível conectar à API. Tente novamente.");
            } else {
                toast.error(message || "Não foi possível cadastrar o serviço.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h2>Serviços</h2>
                    <p>Cadastre os serviços disponíveis para seus clientes.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        placeholder="Nome do serviço"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                    />
                    <input
                        placeholder="Preço"
                        inputMode="decimal"
                        value={preco}
                        onChange={(event) => setPreco(event.target.value)}
                    />
                    <input
                        placeholder="Duração em minutos"
                        inputMode="numeric"
                        value={duracao}
                        onChange={(event) => setDuracao(event.target.value)}
                    />
                    <input
                        placeholder="Descrição (opcional)"
                        value={descricao}
                        onChange={(event) => setDescricao(event.target.value)}
                    />
                    <input
                        aria-label="Cor do serviço"
                        type="color"
                        value={cor}
                        onChange={(event) => setCor(event.target.value)}
                    />

                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Fechar</button>
                        <button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Cadastrar serviço"}
                        </button>
                    </div>
                </form>

                <div>
                    <h3>Serviços cadastrados</h3>
                    {servicos.length === 0 ? (
                        <p>Nenhum serviço cadastrado.</p>
                    ) : (
                        <ul>
                            {servicos.map((servico) => (
                                <li key={servico.id}>
                                    {servico.nome} — R$ {servico.preco}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ModalServico;
