import { Icon } from "./Icons";

export function TopBar({ title, onBack, right }) {
  return (
    <header className="topbar">
      {onBack ? (
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" />
        </button>
      ) : (
        <span className="icon-spacer" />
      )}
      <h1>{title}</h1>
      <div className="topbar-side">{right || <span className="icon-spacer" />}</div>
    </header>
  );
}

export function Sheet({ title, body, confirm, onConfirm, onClose, tone = "ink" }) {
  return (
    <div className="sheet-layer" role="presentation" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="sheet-title">{title}</h2>
        <p>{body}</p>
        <button type="button" className={`btn btn-${tone}`} onClick={onConfirm}>
          {confirm}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onClose}>
          Not now
        </button>
      </div>
    </div>
  );
}
