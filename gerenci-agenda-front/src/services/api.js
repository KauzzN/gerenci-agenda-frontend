import axios from "axios";
import { clearTokens, getAccess, getRefresh, saveTokens } from "../utils/token";

const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json"
    }
});

const refreshApi = axios.create({
    baseURL: "/api"
})

const publicApi = axios.create({
    baseURL: "/api"
})

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

                console.log("Novo access:", access_token)
                console.log("Novo refresh:", refresh_token)

                saveTokens(access_token, refresh_token)

                console.log("Salvou access:", localStorage.getItem("access_token"))
                console.log("Salvou refresh:", localStorage.getItem("refresh_token"))

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