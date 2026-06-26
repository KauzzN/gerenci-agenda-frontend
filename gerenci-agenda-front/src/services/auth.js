import api from "./api";

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

export async function logout() {
    
}

export async function refresh() {
    
}