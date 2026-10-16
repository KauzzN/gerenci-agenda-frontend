/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(() => {
    cleanup();
    window.history.replaceState({}, "", "/");
});

describe("roteamento da aplicação", () => {
    it("apresenta uma orientação em caminhos inexistentes", () => {
        window.history.replaceState({}, "", "/rota-inexistente");
        render(<App />);

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Voltar para o início" }).getAttribute("href")).toBe("/");
    });
});
