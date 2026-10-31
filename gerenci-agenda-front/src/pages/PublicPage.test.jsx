/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PublicPage from "./Public_Page/Public_page";

const publicMocks = vi.hoisted(() => ({
    buscarProfilePublic: vi.fn(),
    buscarHorarios: vi.fn(),
    autenticarCliente: vi.fn(),
    criarAgendamentoPublic: vi.fn()
}));

vi.mock("../services/public", () => ({
    buscarProfilePublic: publicMocks.buscarProfilePublic,
    buscarHorarios: publicMocks.buscarHorarios,
    autenticarCliente: publicMocks.autenticarCliente,
    criarAgendamentoPublic: publicMocks.criarAgendamentoPublic
}));

vi.mock("../contexts/ClientAuthContext", () => ({
    useClientAuth: () => ({ isClientAuthenticated: true, setAuthenticated: vi.fn() })
}));

afterEach(cleanup);

describe("PublicPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayNames = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
        publicMocks.buscarProfilePublic.mockResolvedValue({
            nome: "Studio",
            dias_funcionando: [dayNames[tomorrow.getDay()]],
            servicos: [
                { id: 7, nome: "Corte", preco: "30.00", duracao: 30, descricao: "Corte tradicional" },
                { id: 8, nome: "Barba", preco: "22.50", duracao: 20 }
            ]
        });
        publicMocks.buscarHorarios.mockResolvedValue({ horarios: [] });
    });

    it("seleciona inicialmente uma data habilitada e a mantém representada nos chips", async () => {
        render(
            <MemoryRouter initialEntries={["/book/studio"]}>
                <Routes>
                    <Route path="/book/:slug" element={<PublicPage />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(await screen.findByRole("button", { name: "Continuar" }));
        fireEvent.click(screen.getByRole("checkbox", { name: "Corte" }));
        expect(screen.getAllByText("R$ 30,00")).toHaveLength(2);
        expect(screen.getByText("R$ 30,00", { selector: "strong" })).toBeTruthy();
        fireEvent.click(screen.getByRole("checkbox", { name: "Barba" }));
        expect(screen.getByText("R$ 52,50")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Escolher data e hora" }));

        const dateInput = await screen.findByLabelText("Data");
        expect(dateInput.value).not.toBe(dateInput.min);
        expect(document.querySelector(".date-chip.selected")).not.toBeNull();
    });
});
