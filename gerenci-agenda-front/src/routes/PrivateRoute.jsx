import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function PrivateRoute ({children}) {

    const { isAuthenticated, authChecking } = useContext(AuthContext)

    if (authChecking) {
        return <p>Verificando sessão...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace/>
    }

    return children
}

export default PrivateRoute