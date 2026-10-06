import "./ui.css";

function LoadingState({ label = "Carregando..." }) {
    return <div className="ui-state" role="status" aria-live="polite"><span className="ui-spinner" aria-hidden="true" />{label}</div>;
}

export default LoadingState;
