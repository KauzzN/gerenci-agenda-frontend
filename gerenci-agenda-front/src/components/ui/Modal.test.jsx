/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Modal from "./Modal";

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("Modal", () => {
    it("mantém a tabulação dentro do diálogo", () => {
        render(
            <Modal title="Editar" onClose={vi.fn()}>
                <button type="button">Salvar</button>
            </Modal>
        );

        const closeButton = screen.getByRole("button", { name: "Fechar" });
        const saveButton = screen.getByRole("button", { name: "Salvar" });
        expect(document.activeElement).toBe(closeButton);

        fireEvent.keyDown(saveButton, { key: "Tab" });
        expect(document.activeElement).toBe(closeButton);

        fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
        expect(document.activeElement).toBe(saveButton);
    });

    it("restaura o foco ao elemento que abriu o diálogo", () => {
        const trigger = document.createElement("button");
        document.body.appendChild(trigger);
        trigger.focus();
        const { unmount } = render(<Modal title="Editar" onClose={vi.fn()} />);

        unmount();

        expect(document.activeElement).toBe(trigger);
        trigger.remove();
    });

    it("confirma o descarte antes de fechar com Escape quando há alterações", () => {
        const onClose = vi.fn();
        const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
        render(<Modal title="Editar" onClose={onClose} hasUnsavedChanges />);

        fireEvent.keyDown(document, { key: "Escape" });
        expect(confirm).toHaveBeenCalledWith("Descartar as alterações não salvas?");
        expect(onClose).not.toHaveBeenCalled();

        confirm.mockReturnValue(true);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
