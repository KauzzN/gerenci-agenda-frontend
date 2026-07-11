import api from "./api";

export async function listarAgendamentos() {
    const response = await api.get("/agendar/read",);

    return response.data
}

export async function criarAgendamento({ nome, horario}) {
    const response = await api.post("/agendar/create", {
        nome,
        horario
    })

    return response.data
}

export async function buscarDashboard() {
    const response = await api.get("/agendar/dashboard")

    return response.data
}

export async function buscarProfile(slug) {
    const response = await api.get(`/usr/me/profile`)

    return response.data
}

export async function atualizarProfile({ nome_negocio, public_slug, telefone}) {
    const response = await api.patch("/usr/update", {
        nome_negocio,
        public_slug,
        telefone
    })
}

export async function atualizarAgendamento(id_agenda, {nome, horario, status}) {
    const response = await api.put(`/agendar/update/${id_agenda}`, {
        nome, 
        horario, 
        status
    })

    return response.data
}

export async function deletarAgendamento() {
    
}

export async function marcarAgtendido() {
    
}