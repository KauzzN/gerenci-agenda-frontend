const dayNames = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

export function isConfiguredWorkingDate(date, configuredDays) {
    if (!Array.isArray(configuredDays) || configuredDays.length === 0) return false;

    const weekday = new Date(`${date}T12:00:00`).getDay();
    if (Number.isNaN(weekday)) return false;

    return configuredDays.some((configuredDay) => {
        if (typeof configuredDay === "number") {
            return configuredDay === (weekday === 0 ? 6 : weekday - 1);
        }
        if (typeof configuredDay !== "string") return false;

        const normalized = configuredDay.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalized === dayNames[weekday] || normalized === `${dayNames[weekday]}-feira`;
    });
}

export function getUpcomingWorkingDates(startDate, configuredDays, count = 5) {
    if (!Array.isArray(configuredDays) || configuredDays.length === 0 || count <= 0) return [];

    const candidate = new Date(`${startDate}T12:00:00`);
    if (Number.isNaN(candidate.getTime())) return [];

    const dates = [];
    for (let offset = 0; offset < count * 7 && dates.length < count; offset += 1) {
        const date = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, "0")}-${String(candidate.getDate()).padStart(2, "0")}`;
        if (isConfiguredWorkingDate(date, configuredDays)) dates.push(date);
        candidate.setDate(candidate.getDate() + 1);
    }

    return dates;
}
