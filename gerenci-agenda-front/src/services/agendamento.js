import api from "./api";

export async function listarAgendamentos() {
    const response = await api.get("agendar/read",);

    return response.data
}

export async function criarAgendamento() {
    
}

export async function atualizarAgendamento() {
    
}

export async function deletarAgendamento() {
    
}

export async function marcarAgtendido() {
    
}