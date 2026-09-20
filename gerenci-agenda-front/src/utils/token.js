export function saveTokens(access_token, refresh_token){

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
}

export function getAccess(){
    return localStorage.getItem("access_token");
}

export function getRefresh(){
    return localStorage.getItem("refresh_token");
}

export function clearTokens(){
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
}

const CLIENT_ACCESS_TOKEN = "client_access_token";

export function saveClientToken(token) {
    localStorage.setItem(CLIENT_ACCESS_TOKEN, token);
}

export function getClientAccess() {
    return localStorage.getItem(CLIENT_ACCESS_TOKEN);
}

export function clearClientToken() {
    localStorage.removeItem(CLIENT_ACCESS_TOKEN);
}