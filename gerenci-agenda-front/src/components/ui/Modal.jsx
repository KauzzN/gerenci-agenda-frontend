import { X } from "lucide-react";
import { useEffect } from "react";
import "./ui.css";

function Modal({ title, children, onClose, labelledBy = "ui-modal-title" }) {
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="ui-modal-overlay" onMouseDown={onClose}>
            <section className="ui-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} onMouseDown={(event) => event.stopPropagation()}>
                <header className="ui-modal-header"><h2 id={labelledBy}>{title}</h2><button type="button" className="ui-icon-button" aria-label="Fechar" onClick={onClose}><X size={20} /></button></header>
                <div className="ui-modal-content">{children}</div>
            </section>
        </div>
    );
}

export default Modal;
