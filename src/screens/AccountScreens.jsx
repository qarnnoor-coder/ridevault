import { useState } from "react";
import { REPORT_KINDS } from "../data";
import { formatMobile } from "../format";
import { Icon } from "../components/Icons";
import { Sheet, TopBar } from "../components/Ui";
import { useStore } from "../store";

export function AccountScreen({ go, onSignedOut }) {
  const { user, logout } = useStore();
  const [confirm, setConfirm] = useState(false);

  return (
    <section>
      <header className="page-head">
        <p className="eyebrow">{user.riderType}</p>
        <h2>{user.name}</h2>
        <p className="lede">{formatMobile(user.mobile)}</p>
      </header>
      <div className="menu">
        <button type="button" onClick={() => go("how")}>
          <span>How it works</span>
          <Icon name="chevron" />
        </button>
        <button type="button" onClick={() => go("report")}>
          <span>Report a problem</span>
          <Icon name="chevron" />
        </button>
        <button type="button" onClick={() => setConfirm(true)}>
          <span>Sign out</span>
          <Icon name="chevron" />
        </button>
      </div>
      <p className="hint">RideVault · helmet storage for riders</p>
      {confirm && (
        <Sheet
          title="Sign out"
          body="Your locker stays tied to this account. Sign in again with the same mobile number to unlock it."
          confirm="Sign out"
          tone="alert"
          onConfirm={() => {
            setConfirm(false);
            logout();
            onSignedOut();
          }}
          onClose={() => setConfirm(false)}
        />
      )}
    </section>
  );
}

export function ReportScreen({ back }) {
  const { fileReport, activeRental } = useStore();
  const [kind, setKind] = useState(REPORT_KINDS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const result = fileReport({ kind, note });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <section>
        <TopBar title="Report" onBack={back} />
        <h2>Report received.</h2>
        <p className="lede">
          {activeRental
            ? `If locker ${String(activeRental.lockerNumber).padStart(2, "0")} must be opened by staff, show attendant code ${activeRental.releaseCode}.`
            : "The bay team will follow up from the note you sent."}
        </p>
        <button type="button" className="btn btn-primary" onClick={back}>
          Done
        </button>
      </section>
    );
  }

  return (
    <section>
      <TopBar title="Report a problem" onBack={back} />
      <p className="lede">Tell us what happened at the bay. If a locker will not open, keep your attendant code ready.</p>
      <form onSubmit={submit} className="stack">
        <fieldset className="methods">
          <legend>What happened</legend>
          {REPORT_KINDS.map((item) => (
            <label key={item} className={kind === item ? "on" : ""}>
              <input type="radio" name="kind" checked={kind === item} onChange={() => setKind(item)} />
              <span>
                <strong>{item}</strong>
              </span>
            </label>
          ))}
        </fieldset>
        <label>
          What should we know
          <textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Send report
        </button>
      </form>
    </section>
  );
}
