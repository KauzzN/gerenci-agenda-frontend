import { publicApi, clientApi } from "./api";
import { saveClientToken } from "../utils/token";

export async function autenticarCliente(slug, nome, telefone) {
    const response = await publicApi.post(`/cli/teste/${slug}`, { nome, telefone });
    const token = response.data?.access_token || response.data?.token ||
        response.data?.tokens?.access_token;
    if (token) saveClientToken(token);
    return response.data;
}

export async function buscarProfilePublic(slug) {
    const response = await clientApi.get(
        `public/${slug}/barbearia`
    )

    return response.data;
}

export async function buscarHorarios(slug, data, servicos = []) {
    
    const response = await clientApi.get(
        `/public/${slug}/horarios`, {
            params: { data, servicos },
            paramsSerializer: { indexes: null }
        }
    )

    return response.data;
}

export async function criarAgendamentoPublic(slug, dados) {
    const response = await clientApi.post(
        `/public/${slug}/agendar`, 
            dados

    )
    
    return response.data;
}