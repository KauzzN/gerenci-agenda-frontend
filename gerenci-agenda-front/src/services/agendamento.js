import api from "./api";

export async function listarAgendamentos(selectedDate) {
    const response = await api.get("/agendar/read", {
        params: selectedDate ? { data: selectedDate } : undefined
    });
    const data = response.data;

    if (!Array.isArray(data?.agendamentos)) {
        const error = new Error("Resposta inválida para a lista de agendamentos.");
        error.isContractError = true;
        throw error;
    }

    return data.agendamentos;
}

export async function criarAgendamento({ cliente_id, servicos, horario_inicio }) {
    const response = await api.post("/agendar/create", {
        cliente_id,
        servicos,
        horario_inicio
    })

    return response.data
}

export async function listarServicos() {
    const response = await api.get("/serv/read");
    return response.data?.servicos || [];
}

export async function criarServico({ nome, preco, duracao, descricao, cor }) {
    const response = await api.post("/serv/create", {
        nome,
        preco,
        duracao,
        descricao,
        cor
    });

    return response.data?.servico;
}

export async function listarClientes() {
    const response = await api.get("/cli/read/clients");
    return response.data?.clientes || [];
}

export async function listarHistorico() {
    const response = await api.get("/agendar/historico");
    if (!Array.isArray(response.data?.historico)) {
        throw new Error("Resposta inválida para o histórico de agendamentos.");
    }
    return response.data.historico;
}

export async function buscarDashboard() {
    const response = await api.get("/agendar/dashboard")

    return response.data;
}

export async function buscarProfile() {
    const response = await api.get(`/usr/me/profile`)

    return response.data
}

export async function atualizarProfile(profile) {
    const response = await api.patch("/usr/update", profile);

    return response.data;
}

export async function atualizarAgendamento(id_agenda, { cliente_id, servicos, horario_inicio, status }) {
    const response = await api.put(`/agendar/update/${id_agenda}`, {
        cliente_id,
        servicos,
        horario_inicio,
        status
    })

    return response.data
}

export async function atualizarStatusAgendamento(id_agenda, status) {
    const response = await api.patch(`/agendar/status/${id_agenda}`, { status });
    return response.data;
}

export async function cancelarAgendamento(id_agenda) {
    return atualizarStatusAgendamento(id_agenda, "CANCELADO");
}

export async function marcarAgtendido() {
    
}