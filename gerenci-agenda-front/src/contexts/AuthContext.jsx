import { createContext, useEffect, useState } from "react";
import { saveTokens, clearTokens, getAccess } from "../utils/token";
import { me } from "../services/auth";

export const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("access_token");
    });

  const [user, setUser] = useState(null);

  const isAuthenticated = !!accessToken

  async function login(access_token, refresh_token) {

    saveTokens(access_token, refresh_token)

    setAccessToken(access_token)
  }

  function logout() {
    
    clearTokens();

    setAccessToken(null);
    
    setUser(null);
  }

  useEffect(() => {

    async function carregarUsuario() {

        if (!accessToken) return;

        try {

            const usuario = await me();

            setUser(usuario);

        } catch {

            logout();

        }

    }

    carregarUsuario();

  }, [accessToken]);

  useEffect(() => {
    function handleExpiredSession() {
      logout();
    }

    window.addEventListener("auth:expired", handleExpiredSession);
    return () => window.removeEventListener("auth:expired", handleExpiredSession);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated,
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}