import "./ui.css";

function Surface({ children, className = "", as: Component = "section", ...props }) {
    return <Component {...props} className={`ui-surface ${className}`.trim()}>{children}</Component>;
}

export default Surface;
