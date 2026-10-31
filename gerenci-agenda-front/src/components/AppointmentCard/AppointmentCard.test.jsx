/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppointmentCard from "./AppointmentCard";

afterEach(cleanup);

const appointment = {
    id: 42,
    cliente: "Ana Silva",
    horario_inicio: "2026-10-16T15:00:00Z",
    horario_fim: "2026-10-16T16:00:00Z",
    status: "PENDENTE",
    servicos: [{ id: 7, nome: "Corte", preco_unitario: "30.00" }],
    valor_total: "30.00"
};

describe("AppointmentCard", () => {
    it("mantém a ação de cancelar separada da ação de editar no teclado", () => {
        const onEdit = vi.fn();
        const onCancel = vi.fn();
        render(<AppointmentCard agendamento={appointment} onEdit={onEdit} onCancel={onCancel} />);

        const cancelButton = screen.getByRole("button", { name: "Cancelar agendamento" });
        fireEvent.keyDown(cancelButton, { key: "Enter" });

        expect(onEdit).not.toHaveBeenCalled();
        fireEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalledWith(appointment);
        expect(screen.getByText("Total: R$ 30,00")).toBeTruthy();
    });

    it("expõe um botão de edição próprio para teclado e tecnologias assistivas", () => {
        const onEdit = vi.fn();
        render(<AppointmentCard agendamento={appointment} onEdit={onEdit} onCancel={vi.fn()} />);

        fireEvent.click(screen.getByRole("button", { name: /Editar agendamento de Ana Silva/ }));

        expect(onEdit).toHaveBeenCalledWith(appointment);
    });
});
