export function formatarHorario(dataISO) {

    console.log(dataISO)
    console.log(new Date(dataISO));
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Fortaleza",
    }).format(new Date(dataISO));
}

export function formatarDataCard(data) {
    const horario = new Date(data).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const dia = new Date(data).toLocaleDateString("pt-BR", {
        weekday: "short"
    });

    return {
        horario,
        dia: dia.replace(".", "").toUpperCase()
    };
}