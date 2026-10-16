import { Search, X } from "lucide-react";
import { useId, useRef } from "react";
import "./ui.css";

function SearchField({ value, onChange, placeholder = "Buscar", label = "Buscar", id, ...props }) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const inputRef = useRef(null);

    return (
        <div className="ui-search-field" onClick={(event) => {
            if (event.target.closest("button")) return;
            inputRef.current?.focus();
        }}>
            <label className="ui-search-label" htmlFor={inputId}>{label}</label>
            <Search size={18} aria-hidden="true" />
            <input ref={inputRef} {...props} id={inputId} aria-label={props["aria-label"] || label} placeholder={placeholder} value={value} onChange={onChange} />
            {value && <button type="button" aria-label="Limpar busca" onClick={() => onChange({ target: { value: "" } })}><X size={16} /></button>}
        </div>
    );
}

export default SearchField;
