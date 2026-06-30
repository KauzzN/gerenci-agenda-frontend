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