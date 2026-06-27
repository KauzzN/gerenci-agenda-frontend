import "./Header.css"

function Header ({ onLogout}) {
    return (
        <header className="header">
            <div>
                <h1>
                    Gerenci <span>Agenda</span>
                </h1>

                <small>
                    Seus Agendamentos
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