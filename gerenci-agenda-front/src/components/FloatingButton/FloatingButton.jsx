import "./FloatingButton.css"
import { Plus } from "lucide-react";

function FloatingButton({ onClick }) {
    return (
        <button className="floating-button"
            onClick={onClick}>
                Agendar cliente
            <Plus size={25}/>
        </button>
    );
}

export default FloatingButton