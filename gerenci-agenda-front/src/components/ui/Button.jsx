import "./ui.css";

function Button({
    children,
    variant = "primary",
    loading = false,
    disabled = false,
    type = "button",
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={`ui-button ui-button-${variant} ${props.className || ""}`.trim()}
            disabled={disabled || loading}
        >
            {loading ? "Carregando..." : children}
        </button>
    );
}

export default Button;
