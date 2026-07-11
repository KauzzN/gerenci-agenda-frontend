import "./Header.css"
import { useAuth } from "../../hooks/useAuth.js";
import { useState } from "react";
import toast from "react-hot-toast";
import { 
    CalendarDays, Home, LogOut, LayoutDashboard,
    Copy,
    CopyIcon
} from "lucide-react";
import { useEffect } from "react";

function Header ({ onLogout }) {


    const {user} = useAuth();

    function saudacao() {
        const hora = new Date().getHours()

        if (hora < 12) return "Bom dia";
        if (hora < 18) return "Boa tarde";

        return "Boa noite"
    }

    function formatarDataAtual() {
        const data = new Date();

        return data.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    }

    return (
        <header className="header">
            <div className="header-container">
                <h1>
                    <LayoutDashboard size={24}/> {saudacao()} <span>{user?.username}</span> 
                </h1>

                <small>Aqui está o resumo do seu dia.</small>

            </div>

            <div className="header-second-container">

                <CalendarDays size={18}/><span>{formatarDataAtual()}</span>

                <div className="header-divider"/>

                <button 
                    className="logout-button"
                    onClick={onLogout}    
                    >
                    <LogOut size={18}/> 
                    Sair
                </button>
            </div>
        </header>
    );
}

export default Header;