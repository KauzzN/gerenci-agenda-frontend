/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SearchField from "./SearchField";

afterEach(cleanup);

describe("SearchField", () => {
    it("mantém o botão de limpar separado do rótulo do campo", () => {
        const onChange = vi.fn();
        render(<SearchField label="Buscar clientes" value="Ana" onChange={onChange} />);

        const input = screen.getByRole("textbox", { name: "Buscar clientes" });
        const label = screen.getByText("Buscar clientes");

        expect(input.closest("label")).toBeNull();
        expect(label.getAttribute("for")).toBe(input.id);

        fireEvent.click(input.parentElement);
        expect(document.activeElement).toBe(input);

        fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
        expect(onChange).toHaveBeenCalledWith({ target: { value: "" } });
    });
});
