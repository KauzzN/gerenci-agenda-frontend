import "./Header.css"
import { useAuth } from "../../hooks/useAuh";

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
            <div>
                <h1>
                    {saudacao()}, <span>{user?.username}👋</span>
                </h1>
                <p>{formatarDataAtual()}</p>

                <small>
                    Seus Agendamentos de hoje
                </small>
            </div>

            <button 
                className="logout-btn"
                onClick={onLogout}    
            >
                Sair
            </button>
        </header>
    );
}

export default Header;