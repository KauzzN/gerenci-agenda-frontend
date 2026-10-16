import { createContext, useEffect, useRef, useState } from "react";
import { saveTokens, clearTokens } from "../utils/token";
import { me } from "../services/auth";

export const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("access_token");
    });

  const [user, setUser] = useState(null);
  const requestIdRef = useRef(0);

  // Enquanto existir um token salvo, a sessão precisa ser validada em
  // "/usr/me" antes de liberar as rotas privadas.
  const [authChecking, setAuthChecking] = useState(() => !!localStorage.getItem("access_token"));

  const isAuthenticated = !!accessToken

  async function login(access_token, refresh_token) {

    saveTokens(access_token, refresh_token)

    setUser(null)
    setAccessToken(access_token)
    setAuthChecking(true)
  }

  function logout() {
    
    clearTokens();

    setAccessToken(null);
    
    setUser(null);
    setAuthChecking(false);
  }

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function carregarUsuario() {

        if (!accessToken) {
            setUser(null);
            setAuthChecking(false);
            return;
        }

        setAuthChecking(true);

        try {

            const usuario = await me();

            if (requestId === requestIdRef.current) {
              setUser(usuario);
              setAuthChecking(false);
            }

        } catch {

            if (requestId === requestIdRef.current) {
              clearTokens();
              setAccessToken(null);
              setUser(null);
              setAuthChecking(false);
            }

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