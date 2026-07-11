import api from "./api";
import { clearTokens } from "../utils/token";

export async function login(username, password) {
    const response = await api.post("usr/login", {
        username,
        password
    });

    return response.data
}

export async function register(username, email, password) {
    const response = await api.post("usr/register", {
        username,
        email,
        password
    });

    return response.data
}

export async function me() {
    const response = await api.get("usr/me")

    return response.data
}

export async function logout() {
    clearTokens()
}

export async function refresh() {
    
}