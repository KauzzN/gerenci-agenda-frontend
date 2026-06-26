import { createContext, useState } from "react";
import { saveTokens, clearTokens, getAccess } from "../utils/token";

export const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getIem("access_token");
    });

  const isAuthenticated = !!token

  function login(access_token, refresh_token) {

    console.log(data)
    saveTokens(data.tokens.access_token, data.tokens.refresh_token)


    setAccessToken(access_token)
  }

  function logout() {
    
    clearTokens();

    setAccessToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}