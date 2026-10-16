/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DashboardStats from "./DashboardStats";

afterEach(cleanup);

describe("DashboardStats", () => {
    it("identifica o total como agendamentos do dia", () => {
        render(<DashboardStats stats={{ total: 3, atendidos: 1, pendentes: 2, faltaram: 0 }} />);

        expect(screen.getByText("Agendamentos hoje")).toBeTruthy();
        expect(screen.queryByText("Clientes hoje")).toBeNull();
        expect(screen.getByText("Total do dia")).toBeTruthy();
    });
});
