import "./ui.css";

function PageHeader({ eyebrow, title, description, action, count }) {
    return (
        <header className="ui-page-header">
            <div>
                {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            {action || count}
        </header>
    );
}

export default PageHeader;
