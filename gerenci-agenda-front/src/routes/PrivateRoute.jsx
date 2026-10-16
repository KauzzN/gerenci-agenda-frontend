import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import LoadingState from "../components/ui/LoadingState";

function PrivateRoute ({children}) {

    const { isAuthenticated, authChecking } = useContext(AuthContext)

    if (authChecking) {
        return <LoadingState label="Verificando sessão..." />
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace/>
    }

    return children
}

export default PrivateRoute