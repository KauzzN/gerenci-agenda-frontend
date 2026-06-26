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
    localStorage.clear();
}