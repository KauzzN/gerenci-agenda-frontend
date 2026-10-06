import FieldMessage from "./FieldMessage";
import "./ui.css";

function Textarea({ label, error, helper, id, ...props }) {
    return (
        <label className="ui-field" htmlFor={id}>
            <span>{label}</span>
            <textarea id={id} {...props} />
            <FieldMessage type={error ? "error" : "helper"}>{error || helper}</FieldMessage>
        </label>
    );
}

export default Textarea;
