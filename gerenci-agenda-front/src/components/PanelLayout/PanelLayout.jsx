import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import PanelNavigation from "../PanelNavigation/PanelNavigation";
import { logout } from "../../services/auth";
import "./PanelLayout.css";

function PanelLayout({ children }) {
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="panel-page">
            <Header onLogout={handleLogout} />
            <PanelNavigation />
            <main className="panel-content">{children}</main>
        </div>
    );
}

export default PanelLayout;
