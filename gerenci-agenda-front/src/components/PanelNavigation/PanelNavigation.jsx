import { History, LayoutDashboard, LogOut, Settings, Users, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./PanelNavigation.css";

const links = [
    { to: "/dashboard", label: "Início", icon: LayoutDashboard },
    { to: "/clientes", label: "Clientes", icon: Users },
    { to: "/servicos", label: "Serviços", icon: Wrench },
    { to: "/historico", label: "Histórico", icon: History },
    { to: "/configuracoes", label: "Ajustes", icon: Settings }
];

function PanelNavigation({ onLogout }) {
    return (
        <nav className="panel-navigation" aria-label="Navegação do painel">
            {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}>
                    <Icon aria-hidden="true" size={20} />
                    <span>{label}</span>
                </NavLink>
            ))}
            {onLogout && <button type="button" className="panel-logout" onClick={onLogout}><LogOut aria-hidden="true" size={20} /><span>Sair</span></button>}
        </nav>
    );
}

export default PanelNavigation;
