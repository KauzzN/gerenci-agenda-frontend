import FieldMessage from "./FieldMessage";
import "./ui.css";

function Field({ label, error, helper, id, children, ...props }) {
    return (
        <label className="ui-field" htmlFor={id}>
            <span>{label}</span>
            {children || <input id={id} {...props} />}
            <FieldMessage type={error ? "error" : "helper"}>{error || helper}</FieldMessage>
        </label>
    );
}

export default Field;
