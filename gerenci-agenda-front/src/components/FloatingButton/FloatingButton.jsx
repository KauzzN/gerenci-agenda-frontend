import "./FloatingButton.css"
import toast from "react-hot-toast";

function FloatingButton({ onClick }) {
    return (
        <button className="floating-button"
            onClick={onClick}>
            +
        </button>
    );
}

export default FloatingButton