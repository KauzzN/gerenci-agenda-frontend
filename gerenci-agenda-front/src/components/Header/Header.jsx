import "./Header.css"
import { useAuth } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";
import { ExternalLink, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { buscarProfile } from "../../services/agendamento";
import { construirLinkPublico } from "../../utils/publicLink";

function Header () {
    const {user} = useAuth();
    const [publicLink, setPublicLink] = useState("");

    function saudacao() {
        const hora = new Date().getHours()

        if (hora < 12) return "Bom dia";
        if (hora < 18) return "Boa tarde";

        return "Boa noite"
    }

    useEffect(() => {
        buscarProfile()
            .then((profile) => {
                if (profile?.public_slug) {
                    setPublicLink(construirLinkPublico(profile.public_slug));
                }
            })
            .catch(() => setPublicLink(""));
    }, []);

    function abrirPerfilPublico() {
        if (!publicLink) {
            toast.error("Configure seu link público em Ajustes.");
            return;
        }
        window.open(publicLink, "_blank", "noopener,noreferrer");
    }

    return (
        <header className="header">
            <div className="header-container">
                <h1>
                    <LayoutDashboard size={24}/> {saudacao()} <span>{user?.username}</span> 
                </h1>

                <small>Aqui está o resumo do seu dia.</small>
            </div>
            <button type="button" className="public-profile-link" onClick={abrirPerfilPublico}>
                <ExternalLink size={17} aria-hidden="true" />
                Ver perfil público
            </button>
        </header>
    );
}

export default Header;