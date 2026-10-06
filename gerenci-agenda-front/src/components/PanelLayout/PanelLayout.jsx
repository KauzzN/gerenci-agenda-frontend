import Header from "../Header/Header";
import PanelNavigation from "../PanelNavigation/PanelNavigation";
import "./PanelLayout.css";

function PanelLayout({ children }) {
    return (
        <div className="panel-page">
            <Header />
            <PanelNavigation />
            <main className="panel-content">{children}</main>
        </div>
    );
}

export default PanelLayout;
