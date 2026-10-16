/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPage from "./SettingsPage";

const settingsMocks = vi.hoisted(() => ({
    buscarProfile: vi.fn(),
    atualizarProfile: vi.fn()
}));

vi.mock("../services/agendamento", () => ({
    buscarProfile: settingsMocks.buscarProfile,
    atualizarProfile: settingsMocks.atualizarProfile
}));

vi.mock("../hooks/useAuth", () => ({
    useAuth: () => ({ logout: vi.fn() })
}));

vi.mock("../components/PanelLayout/PanelLayout", () => ({
    default: ({ children }) => <div>{children}</div>
}));

afterEach(cleanup);

describe("SettingsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        settingsMocks.buscarProfile.mockResolvedValue({
            nome_negocio: "Studio",
            public_slug: "studio",
            dias_funcionando: [],
            horario_inicio: null,
            horario_fim: null,
            inicio_almoco: null,
            fim_almoco: null
        });
    });

    it("impede salvar dias ativos sem início e fim do expediente", async () => {
        render(
            <MemoryRouter>
                <SettingsPage />
            </MemoryRouter>
        );

        fireEvent.click(await screen.findByRole("checkbox", { name: /domingo/i }));
        fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

        expect(await screen.findByText("Informe o início do expediente.")).toBeTruthy();
        expect(screen.getByText("Informe o fim do expediente.")).toBeTruthy();
        expect(settingsMocks.atualizarProfile).not.toHaveBeenCalled();
    });

    it("permite salvar expediente completo", async () => {
        settingsMocks.atualizarProfile.mockResolvedValueOnce({ profile: { horario_inicio: "09:00", horario_fim: "17:00" } });

        render(
            <MemoryRouter>
                <SettingsPage />
            </MemoryRouter>
        );

        fireEvent.click(await screen.findByRole("checkbox", { name: /domingo/i }));
        fireEvent.change(screen.getByLabelText("Início do expediente"), { target: { value: "09:00" } });
        fireEvent.change(screen.getByLabelText("Fim do expediente"), { target: { value: "17:00" } });
        fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

        await waitFor(() => expect(settingsMocks.atualizarProfile).toHaveBeenCalledTimes(1));
    });
});
