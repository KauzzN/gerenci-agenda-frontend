import { createContext, useContext, useState } from "react";
import { clearClientToken, getClientAccess } from "../utils/token";

export const ClientAuthContext = createContext(null);

export function ClientAuthProvider({ children }) {
    const [clientToken, setClientToken] = useState(getClientAccess);

    function setAuthenticated(token) {
        setClientToken(token);
    }

    function logoutClient() {
        clearClientToken();
        setClientToken(null);
    }

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
