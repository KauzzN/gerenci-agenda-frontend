import { describe, expect, it } from "vitest";
import { getUpcomingWorkingDates, isConfiguredWorkingDate } from "./bookingDates";

describe("datas de atendimento públicas", () => {
    it("inicia na próxima segunda quando hoje é um dia desabilitado", () => {
        const dates = getUpcomingWorkingDates("2026-10-16", ["segunda"], 1);

        expect(dates).toEqual(["2026-10-19"]);
        expect(isConfiguredWorkingDate(dates[0], ["segunda"])).toBe(true);
    });

    it("inclui domingo somente quando estiver habilitado", () => {
        expect(isConfiguredWorkingDate("2026-10-18", ["segunda"])).toBe(false);
        expect(getUpcomingWorkingDates("2026-10-16", ["domingo"], 1)).toEqual(["2026-10-18"]);
    });

    it("não autoriza datas quando a configuração está vazia", () => {
        expect(isConfiguredWorkingDate("2026-10-18", [])).toBe(false);
        expect(getUpcomingWorkingDates("2026-10-16", [], 5)).toEqual([]);
    });
});
