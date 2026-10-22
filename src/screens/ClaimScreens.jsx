import { useEffect, useRef, useState } from "react";
import { HOURLY_MAX, METHODS, quote, siteById } from "../data";
import { formatClock, padLocker, peso } from "../format";
import { LogoMark } from "../components/Icons";
import { TopBar } from "../components/Ui";
import { useStore } from "../store";

export function PlansScreen({ back, onContinue }) {
  const { bay, state } = useStore();
  const [planId, setPlanId] = useState("hourly");
  const [hours, setHours] = useState(1);
  const quoteNow = quote(planId, hours);
  const open = state.lockers[bay.id].filter((locker) => locker.state === "open").length;

  return (
    <section>
      <TopBar title="Choose time" onBack={back} />
      <p className="eyebrow">{bay.name}</p>
      <h2>How long do you need it?</h2>
      <p className="lede">Pay for a set period. The next open locker is assigned after payment.</p>
      <div className="plan-list">
        {[
          ["hourly", "Hourly", "A short stop", `₱25 / hour`],
          ["shift", "Shift", "Nine hours", peso(69)],
          ["day", "Day", "Twelve hours", peso(79)],
        ].map(([id, name, blurb, price]) => (
          <button
            type="button"
            key={id}
            className={`plan ${planId === id ? "on" : ""}`}
            aria-pressed={planId === id}
            onClick={() => setPlanId(id)}
          >
            <span>
              <strong>{name}</strong>
              <em>{blurb}</em>
            </span>
            <b>{price}</b>
          </button>
        ))}
      </div>
      {planId === "hourly" && (
        <div className="stepper">
          <button type="button" onClick={() => setHours((value) => Math.max(1, value - 1))} disabled={hours <= 1} aria-label="Fewer hours">
            −
          </button>
          <span>
            {hours} {hours === 1 ? "hour" : "hours"}
          </span>
          <button type="button" onClick={() => setHours((value) => Math.min(HOURLY_MAX, value + 1))} disabled={hours >= HOURLY_MAX} aria-label="More hours">
            +
          </button>
        </div>
      )}
      <p className="hint">
        One helmet per locker. If you pass the end time, overtime is ₱20 an hour, added when you end. You can still unlock.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        disabled={open === 0}
        onClick={() => onContinue(quoteNow)}
      >
        {open === 0 ? "This bay is full" : `Continue · ${peso(quoteNow.amount)}`}
      </button>
    </section>
  );
}

export function PayScreen({ draft, back, onPaid }) {
  const { bay, state } = useStore();
  const [method, setMethod] = useState("gcash");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("form");
  const ends = new Date(Date.now() + draft.hours * 60 * 60 * 1000);

  const submit = (event) => {
    event.preventDefault();
    if (state.lockers[bay.id].every((locker) => locker.state !== "open")) {
      setError("This bay filled up. Choose another bay. You have not been charged.");
      return;
    }
    if (method === "card") {
      const number = card.number.replace(/\s/g, "");
      if (card.name.trim().length < 2) return setError("Enter the name on the card.");
      if (!/^\d{16}$/.test(number)) return setError("Enter the 16-digit card number.");
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return setError("Enter the expiry as MM/YY.");
      if (!/^\d{3}$/.test(card.cvc)) return setError("Enter the 3-digit security code.");
    }
    setError("");
    setPhase("processing");
    window.setTimeout(() => onPaid(method), 900);
  };

  return (
    <section>
      <TopBar title="Payment" onBack={phase === "form" ? back : undefined} />
      <p className="eyebrow">{bay.name}</p>
      <h2>{peso(draft.amount)}</h2>
      <ul className="summary">
        <li>
          <span>Plan</span>
          <strong>
            {draft.name} · {draft.hours} {draft.hours === 1 ? "hour" : "hours"}
          </strong>
        </li>
        <li>
          <span>Ends about</span>
          <strong>{formatClock(ends)}</strong>
        </li>
        <li>
          <span>Locker</span>
          <strong>Assigned next</strong>
        </li>
      </ul>
      <form onSubmit={submit} className="stack">
        <fieldset className="methods">
          <legend>Pay with</legend>
          {METHODS.map((item) => (
            <label key={item.id} className={method === item.id ? "on" : ""}>
              <input
                type="radio"
                name="method"
                value={item.id}
                checked={method === item.id}
                onChange={() => setMethod(item.id)}
              />
              <span>
                <strong>{item.name}</strong>
                <em>{item.hint}</em>
              </span>
            </label>
          ))}
        </fieldset>
        {method === "card" && (
          <div className="stack card-fields">
            <label>
              Name on card
              <input value={card.name} autoComplete="cc-name" onChange={(event) => setCard({ ...card, name: event.target.value })} />
            </label>
            <label>
              Card number
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="ACCT-000015"
                value={card.number}
                onChange={(event) => setCard({ ...card, number: event.target.value })}
              />
            </label>
            <div className="split">
              <label>
                Expiry
                <input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(event) => setCard({ ...card, expiry: event.target.value })}
                />
              </label>
              <label>
                CVC
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={card.cvc}
                  onChange={(event) => setCard({ ...card, cvc: event.target.value })}
                />
              </label>
            </div>
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={phase !== "form"}>
          {phase === "form" ? `Pay ${peso(draft.amount)}` : "Confirming payment…"}
        </button>
      </form>
      <p className="hint">Ending early does not refund unused time. Overtime is ₱20 an hour.</p>
    </section>
  );
}

export function AssignScreen({ draft, onDone, onBays }) {
  const { assign } = useStore();
  const assignRef = useRef(assign);
  assignRef.current = assign;
  const [result, setResult] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setResult(assignRef.current(draft)), 1400);
    return () => window.clearTimeout(timer);
  }, [draft]);

  if (!result) {
    return (
      <section className="reveal">
        <LogoMark size={64} light />
        <p className="eyebrow light">Assigning</p>
        <h2>Finding an open locker</h2>
      </section>
    );
  }

  if (!result.ok) {
    return (
      <section className="reveal">
        <h2>No locker opened</h2>
        <p className="lede light">{result.error} You were not charged.</p>
        <button type="button" className="btn btn-light" onClick={onBays}>
          Choose another bay
        </button>
      </section>
    );
  }

  const rental = result.rental;
  const site = siteById(rental.siteId);
  return (
    <section className="reveal">
      <p className="eyebrow light">Your locker</p>
      <p className="reveal-num">{padLocker(rental.lockerNumber)}</p>
      <h2>This number is yours.</h2>
      <p className="lede light">
        {site.name}, until {formatClock(rental.end)}. Put the helmet in, close the door, then lock it.
      </p>
      <button type="button" className="btn btn-light" onClick={onDone}>
        Store and lock
      </button>
    </section>
  );
}
