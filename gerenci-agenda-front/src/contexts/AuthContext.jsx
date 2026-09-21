import { createContext, useEffect, useState } from "react";
import { saveTokens, clearTokens, getAccess } from "../utils/token";
import { me } from "../services/auth";

export const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("access_token");
    });

  const [user, setUser] = useState(null);

  // Enquanto existir um token salvo, a sessão precisa ser validada em
  // "/usr/me" antes de liberar as rotas privadas.
  const [authChecking, setAuthChecking] = useState(() => !!localStorage.getItem("access_token"));

  const isAuthenticated = !!accessToken

  async function login(access_token, refresh_token) {

    saveTokens(access_token, refresh_token)

    setAccessToken(access_token)
    setAuthChecking(false)
  }

  function logout() {
    
    clearTokens();

    setAccessToken(null);
    
    setUser(null);
    setAuthChecking(false);
  }

  useEffect(() => {

    async function carregarUsuario() {

        if (!accessToken) {
            setAuthChecking(false);
            return;
        }

        setAuthChecking(true);

        try {

            const usuario = await me();

            setUser(usuario);
            setAuthChecking(false);

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
        authChecking,
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}