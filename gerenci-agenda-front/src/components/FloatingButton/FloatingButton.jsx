import "./FloatingButton.css"

function FloatingButton({ onClick }) {
    return (
        <button className="floating-button"
            onClick={onClick}>
            +
        </button>
    );
}

export default FloatingButton