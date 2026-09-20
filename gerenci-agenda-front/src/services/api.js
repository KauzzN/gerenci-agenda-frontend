import axios from "axios";
import { clearTokens, getAccess, getRefresh, saveTokens, getClientAccess } from "../utils/token";

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
clientApi.interceptors.request.use((config) => {
    const token = getClientAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export { publicApi, clientApi };

api.interceptors.request.use((config) => {

    const token = getAccess();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
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
                return Promise.reject(error);
            }

            try {

                const response = await refreshApi.post(
                    "/usr/refresh", {
                        refresh_token: refresh
                    }
                );

                const { access_token, refresh_token} = response.data

                saveTokens(access_token, refresh_token)

                originalRequest.headers.Authorization = `Bearer ${access_token}`

                api.defaults.headers.common.Authorization = 
                    `Bearer ${access_token}`

                return api(originalRequest)
            } catch {

                clearTokens()

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }


)

export default api;