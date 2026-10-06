import "./ui.css";

function ErrorState({ title = "Não foi possível carregar os dados.", message, action }) {
    return <div className="ui-state ui-state-error" role="alert"><strong>{title}</strong>{message && <p>{message}</p>}{action}</div>;
}

export default ErrorState;
