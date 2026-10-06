import "./ui.css";

function EmptyState({ icon, title, description, action }) {
    return <div className="ui-state" role="status">{icon && <div className="ui-state-icon">{icon}</div>}<strong>{title}</strong>{description && <p>{description}</p>}{action}</div>;
}

export default EmptyState;
