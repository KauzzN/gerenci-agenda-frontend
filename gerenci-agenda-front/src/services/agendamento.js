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

export async function atualizarAgendamento(id) {
    const response = await api.put(`/agendar/update/${id}`, {
        nome, 
        horario
    })
}

export async function deletarAgendamento(id) {
    const response = await api.delete(`/agendar/delete/${id}`)
}

export async function marcarAgtendido(id) {
    const response = await api.patch(`/agendar/atendido/${id}`)

    return response.data
}