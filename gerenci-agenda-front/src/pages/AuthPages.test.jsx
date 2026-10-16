/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login_Page";
import Register from "./Register_page";

const authMocks = vi.hoisted(() => ({
    login: vi.fn(),
    register: vi.fn(),
    authenticate: vi.fn(),
    navigate: vi.fn()
}));

vi.mock("../services/auth", () => ({
    login: authMocks.login,
    register: authMocks.register
}));

vi.mock("../hooks/useAuth", () => ({
    useAuth: () => ({ login: authMocks.authenticate })
}));

vi.mock("react-router-dom", async (importOriginal) => {
    const router = await importOriginal();
    return {
        ...router,
        useNavigate: () => authMocks.navigate
    };
});

afterEach(cleanup);

describe("formulários de autenticação", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("associa labels persistentes e autocomplete corretos no login", () => {
        render(<MemoryRouter><Login /></MemoryRouter>);

        expect(screen.getByRole("textbox", { name: "Usuário" }).getAttribute("autocomplete")).toBe("username");
        expect(screen.getByLabelText("Senha").getAttribute("autocomplete")).toBe("current-password");
    });

    it("mostra erros da API na página e encerra o estado de envio", async () => {
        authMocks.login.mockRejectedValueOnce({ response: { data: { error: "Credenciais inválidas." } } });
        render(<MemoryRouter><Login /></MemoryRouter>);

        fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form"));

        expect((await screen.findByRole("alert")).textContent).toContain("Credenciais inválidas.");
        expect(screen.getByRole("button", { name: "Entrar" }).disabled).toBe(false);
    });

    it("usa o autocomplete de nome de usuário e senha nova no cadastro", () => {
        render(<MemoryRouter><Register /></MemoryRouter>);

        expect(screen.getByRole("textbox", { name: "Nome de usuário" }).getAttribute("autocomplete")).toBe("username");
        expect(screen.getByLabelText("Senha").getAttribute("autocomplete")).toBe("new-password");
    });
});
