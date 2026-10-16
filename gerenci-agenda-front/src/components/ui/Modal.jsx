import { X } from "lucide-react";
import useModalAccessibility from "../../hooks/useModalAccessibility";
import "./ui.css";

function Modal({ title, children, onClose, labelledBy = "ui-modal-title", hasUnsavedChanges = false }) {
    const { dialogRef, requestClose } = useModalAccessibility({ onClose, hasUnsavedChanges });

    return (
        <div className="ui-modal-overlay" onMouseDown={(event) => {
            if (event.target === event.currentTarget) requestClose();
        }}>
            <section ref={dialogRef} tabIndex="-1" className="ui-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
                <header className="ui-modal-header"><h2 id={labelledBy}>{title}</h2><button type="button" className="ui-icon-button" aria-label="Fechar" onClick={requestClose}><X size={20} /></button></header>
                <div className="ui-modal-content">{children}</div>
            </section>
        </div>
    );
}

export default Modal;
