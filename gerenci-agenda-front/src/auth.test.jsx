/** @vitest-environment jsdom */

import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClientAuthProvider, useClientAuth } from "./contexts/ClientAuthContext";
import {
    clearClientTokens,
    getClientAccess,
    getClientRefresh,
    saveClientTokens
} from "./utils/token";

const axiosMocks = vi.hoisted(() => {
    const createInstance = () => {
        const instance = vi.fn();
        instance.interceptors = {
            request: { use: vi.fn() },
            response: {
                use: vi.fn((onFulfilled, onRejected) => {
                    instance.responseErrorHandler = onRejected;
                })
            }
        };
        instance.post = vi.fn();
        return instance;
    };

    const api = createInstance();
    const refreshApi = createInstance();
    const publicApi = createInstance();
    const clientApi = createInstance();

    return {
        api,
        refreshApi,
        publicApi,
        clientApi
    };
});

vi.mock("axios", () => ({
    default: {
        create: vi.fn()
            .mockReturnValueOnce(axiosMocks.api)
            .mockReturnValueOnce(axiosMocks.refreshApi)
            .mockReturnValueOnce(axiosMocks.publicApi)
            .mockReturnValueOnce(axiosMocks.clientApi)
    }
}));

function AuthState({ onChange }) {
    const auth = useClientAuth();
    onChange(auth);
    return null;
}

describe("autenticação do cliente", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("inicializa autenticado quando existe token e invalida o estado ao receber client-auth:expired", () => {
        saveClientTokens("access-valid", "refresh-valid");
        let authState;

        render(
            <ClientAuthProvider>
                <AuthState onChange={(value) => { authState = value; }} />
            </ClientAuthProvider>
        );

        expect(authState.isClientAuthenticated).toBe(true);

        act(() => {
            window.dispatchEvent(new Event("client-auth:expired"));
        });

        expect(authState.isClientAuthenticated).toBe(false);
        expect(getClientAccess()).toBeNull();
        expect(getClientRefresh()).toBeNull();
    });

    it("preserva os novos tokens quando o refresh retorna sucesso", async () => {
        const { clientApi } = await import("./services/api");
        const { refreshApi } = axiosMocks;
        const request = { url: "/public/teste", headers: {} };
        const retryResponse = { data: { ok: true } };

        saveClientTokens("access-expired", "refresh-valid");
        refreshApi.post.mockResolvedValueOnce({
            data: {
                access_token: "access-new",
                refresh_token: "refresh-new"
            }
        });
        clientApi.mockResolvedValueOnce(retryResponse);

        const errorHandler = clientApi.responseErrorHandler;
        const result = await errorHandler({
            config: request,
            response: { status: 401 }
        });

        expect(result).toBe(retryResponse);
        expect(refreshApi.post).toHaveBeenCalledWith("/usr/refresh", {
            refresh_token: "refresh-valid"
        });
        expect(getClientAccess()).toBe("access-new");
        expect(getClientRefresh()).toBe("refresh-new");
        expect(request.headers.Authorization).toBe("Bearer access-new");
    });

    it("remove os tokens e notifica a UI quando o refresh falha", async () => {
        const { clientApi } = await import("./services/api");
        const { refreshApi } = axiosMocks;
        const expiredListener = vi.fn();
        const request = { url: "/public/teste", headers: {} };

        saveClientTokens("access-expired", "refresh-invalid");
        window.addEventListener("client-auth:expired", expiredListener);
        refreshApi.post.mockRejectedValueOnce(new Error("refresh rejected"));

        const errorHandler = clientApi.responseErrorHandler;
        await expect(errorHandler({
            config: request,
            response: { status: 401 }
        })).rejects.toThrow("refresh rejected");

        expect(getClientAccess()).toBeNull();
        expect(getClientRefresh()).toBeNull();
        expect(expiredListener).toHaveBeenCalledTimes(1);
        window.removeEventListener("client-auth:expired", expiredListener);
    });

    it("remove os tokens e notifica a UI quando não existe refresh token", async () => {
        const { clientApi } = await import("./services/api");
        const expiredListener = vi.fn();
        const request = { url: "/public/teste", headers: {} };
        const originalError = {
            config: request,
            response: { status: 401 }
        };

        saveClientTokens("access-expired", "refresh-valid");
        clearClientTokens();
        window.addEventListener("client-auth:expired", expiredListener);

        const errorHandler = clientApi.responseErrorHandler;
        await expect(errorHandler(originalError)).rejects.toBe(originalError);

        expect(expiredListener).toHaveBeenCalledTimes(1);
        expect(getClientAccess()).toBeNull();
        expect(getClientRefresh()).toBeNull();
        window.removeEventListener("client-auth:expired", expiredListener);
    });
});
