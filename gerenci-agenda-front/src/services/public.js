import publicApi from "./api";

export async function buscarProfilePublic(slug) {
    
    const response = await publicApi.get(
        `public/${slug}/barbearia`
    )

    return response.data;
}

export async function buscarHorarios(slug, data) {
    
    const response = await publicApi.get(
        `/public/${slug}/horarios`, {
            params: {
                data
            }
        }
    )

    return response.data;
}

export async function criarAgendamentoPublic(slug, dados) {
    const response = await publicApi.post(
        `/public/${slug}/agendar`, 
            dados

    )
    
    return response.data;
}