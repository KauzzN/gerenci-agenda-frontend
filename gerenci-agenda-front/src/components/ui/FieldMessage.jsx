import "./ui.css";

function FieldMessage({ children, type = "helper" }) {
    if (!children) return null;
    return <span className={`ui-field-message ui-field-message-${type}`} role={type === "error" ? "alert" : undefined}>{children}</span>;
}

export default FieldMessage;
