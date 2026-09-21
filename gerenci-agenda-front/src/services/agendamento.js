import api from "./api";

export async function listarAgendamentos() {
    const response = await api.get("/agendar/read",);
    const data = response.data;

    if (Array.isArray(data)) return data;
    return data?.agendamentos || data?.data?.agendamentos || [];
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
    return response.data?.servicos || response.data?.["serviços"] || [];
}

export async function listarClientes() {
    const response = await api.get("/cli/read/clients");
    return response.data?.clientes || response.data;
}

export async function buscarDashboard() {
    const response = await api.get("/agendar/dashboard")

    return response.data?.dashboard || response.data;
}

export async function buscarProfile() {
    const response = await api.get(`/usr/me/profile`)

    return response.data
}

export async function atualizarProfile({ nome_negocio, public_slug, telefone}) {
    const response = await api.patch("/usr/update", {
        nome_negocio,
        public_slug,
        telefone
    })

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

export async function deletarAgendamento() {
    
}

export async function marcarAgtendido() {
    
}