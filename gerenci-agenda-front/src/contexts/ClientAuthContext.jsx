import { createContext, useContext, useEffect, useState } from "react";
import { clearClientTokens, getClientAccess } from "../utils/token";

export const ClientAuthContext = createContext(null);

export function ClientAuthProvider({ children }) {
    const [clientToken, setClientToken] = useState(getClientAccess);

    function setAuthenticated(token) {
        setClientToken(token);
    }

    function logoutClient() {
        clearClientTokens();
        setClientToken(null);
    }

    useEffect(() => {
        window.addEventListener("client-auth:expired", logoutClient);
        return () => window.removeEventListener("client-auth:expired", logoutClient);
    }, []);

    return (
        <ClientAuthContext.Provider value={{
            clientToken,
            isClientAuthenticated: Boolean(clientToken),
            setAuthenticated,
            logoutClient
        }}>
            {children}
        </ClientAuthContext.Provider>
    );
}

export function useClientAuth() {
    return useContext(ClientAuthContext);
}
