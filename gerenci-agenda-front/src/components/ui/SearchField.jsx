import { Search, X } from "lucide-react";
import "./ui.css";

function SearchField({ value, onChange, placeholder = "Buscar", label = "Buscar", ...props }) {
    return (
        <label className="ui-search-field">
            <span className="ui-search-label">{label}</span>
            <Search size={18} aria-hidden="true" />
            <input {...props} aria-label={props["aria-label"] || label} placeholder={placeholder} value={value} onChange={onChange} />
            {value && <button type="button" aria-label="Limpar busca" onClick={() => onChange({ target: { value: "" } })}><X size={16} /></button>}
        </label>
    );
}

export default SearchField;
