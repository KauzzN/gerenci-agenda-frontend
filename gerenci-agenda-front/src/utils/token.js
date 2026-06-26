export function saveTokens(access, refresh){

    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
}

export function getAccess(){
    return localStorage.getItem("access");
}

export function getRefresh(){
    return localStorage.getItem("refresh");
}

export function clearTokens(){
    localStorage.clear();
}