import axios from "axios";
import {
    clearTokens,
    getAccess,
    getRefresh,
    saveTokens,
    getClientAccess,
    getClientRefresh,
    saveClientTokens,
    clearClientTokens
} from "../utils/token";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

const clientApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Evita disparar múltiplas requisições simultâneas de refresh quando
// vários pedidos falham com 401 ao mesmo tempo.
let professionalRefreshPromise = null;

clientApi.interceptors.request.use((config) => {
    const token = getClientAccess();
    if (token) config.headers.Authorization = "Bearer " + token;
    return config;
});

let clientRefreshPromise = null;

clientApi.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest?._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;
        const refresh = getClientRefresh();

        if (!refresh) {
            clearClientTokens();
            return Promise.reject(error);
        }

        try {
            if (!clientRefreshPromise) {
                clientRefreshPromise = refreshApi.post("/usr/refresh", {
                    refresh_token: refresh
                }).finally(() => {
                    clientRefreshPromise = null;
                });
            }

            const response = await clientRefreshPromise;
            const { access_token, refresh_token } = response.data;

            saveClientTokens(access_token, refresh_token);
            originalRequest.headers.Authorization = "Bearer " + access_token;

            return clientApi(originalRequest);
        } catch (refreshError) {
            clearClientTokens();
            return Promise.reject(refreshError);
        }
    }
);

export { publicApi, clientApi };

api.interceptors.request.use((config) => {

    const token = getAccess();

    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }

    return config;
});

api.interceptors.response.use(

    response => response,

    async error => {
        
        const originalRequest = error.config;

        if (
            error.response?.status ===401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            const refresh = getRefresh()

            if (!refresh) {
                clearTokens()
                window.dispatchEvent(new Event("auth:expired"));
                return Promise.reject(error);
            }

            try {

                if (!professionalRefreshPromise) {
                    professionalRefreshPromise = refreshApi.post(
                        "/usr/refresh", {
                            refresh_token: refresh
                        }
                    ).finally(() => {
                        professionalRefreshPromise = null;
                    });
                }

                const response = await professionalRefreshPromise;

                const { access_token, refresh_token} = response.data

                saveTokens(access_token, refresh_token)

                originalRequest.headers.Authorization = "Bearer " + access_token;

                api.defaults.headers.common.Authorization = "Bearer " + access_token;


                return api(originalRequest)
            } catch {

                clearTokens()
                window.dispatchEvent(new Event("auth:expired"));

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }


)

export default api;
