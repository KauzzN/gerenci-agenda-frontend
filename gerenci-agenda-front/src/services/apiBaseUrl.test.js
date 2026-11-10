import { describe, expect, it } from "vitest";
import axios from "axios";
import {
    assertProductionApiUrl,
    getApiOrigin,
    normalizeApiBaseUrl
} from "./apiBaseUrl";

describe("normalizeApiBaseUrl", () => {
    it.each([
        ["https://gerenci-agenda.onrender.com", "https://gerenci-agenda.onrender.com/api"],
        ["https://gerenci-agenda.onrender.com/", "https://gerenci-agenda.onrender.com/api"],
        ["https://gerenci-agenda.onrender.com/api", "https://gerenci-agenda.onrender.com/api"],
        ["https://gerenci-agenda.onrender.com/api/", "https://gerenci-agenda.onrender.com/api"],
        ["  http://127.0.0.1:8000/api  ", "http://127.0.0.1:8000/api"],
        ["http://127.0.0.1:8000", "http://127.0.0.1:8000/api"],
        [undefined, "/api"],
        ["", "/api"]
    ])("normaliza %s", (input, expected) => {
        expect(normalizeApiBaseUrl(input)).toBe(expected);
    });

    it("monta URLs finais corretas com axios para endpoints com e sem barra inicial", () => {
        const client = axios.create({
            baseURL: normalizeApiBaseUrl("https://gerenci-agenda.onrender.com")
        });

        expect(client.getUri({ url: "usr/login" })).toBe(
            "https://gerenci-agenda.onrender.com/api/usr/login"
        );
        expect(client.getUri({ url: "/usr/refresh" })).toBe(
            "https://gerenci-agenda.onrender.com/api/usr/refresh"
        );
    });
});

describe("getApiOrigin", () => {
    it("retorna apenas a origem da API", () => {
        expect(getApiOrigin("http://127.0.0.1:8000/api")).toBe("http://127.0.0.1:8000");
    });
});

describe("assertProductionApiUrl", () => {
    it("aceita uma API HTTPS pública", () => {
        expect(assertProductionApiUrl("https://gerenci-agenda.onrender.com")).toBe(
            "https://gerenci-agenda.onrender.com/api"
        );
    });

    it.each([
        "http://127.0.0.1:8000/api",
        "http://localhost:8000",
        "https://localhost/api",
        "http://gerenci-agenda.onrender.com",
        "gerenci-agenda.onrender.com",
        ""
    ])("rejeita %s", (input) => {
        expect(() => assertProductionApiUrl(input)).toThrow();
    });
});
