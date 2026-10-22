import { useState } from "react";
import { RIDER_TYPES } from "../data";
import { LogoMark } from "../components/Icons";
import { TopBar } from "../components/Ui";
import { useStore } from "../store";

export function Splash() {
  return (
    <section className="splash">
      <div className="splash-mark">
        <LogoMark size={72} light />
      </div>
      <h1>RideVault</h1>
      <p>Store your helmet. Move freely.</p>
    </section>
  );
}

export function Welcome({ go }) {
  return (
    <section className="welcome">
      <div className="welcome-hero">
        <LogoMark size={64} light />
        <p className="eyebrow light">Helmet storage</p>
        <h1>Store your helmet. Move freely.</h1>
        <ul className="fact-row">
          <li>Numbered locker</li>
          <li>Phone is the key</li>
          <li>One helmet</li>
        </ul>
      </div>
      <div className="welcome-panel">
        <button type="button" className="btn btn-primary" onClick={() => go("register")}>
          Create account
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => go("signin")}>
          Sign in
        </button>
        <button type="button" className="text-btn" onClick={() => go("how")}>
          How it works
        </button>
      </div>
    </section>
  );
}

export function SignIn({ go, back, onDone }) {
  const { login } = useStore();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const result = login({ mobile, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone();
  };

  return (
    <section className="form-screen">
      <TopBar title="Sign in" onBack={back} />
      <h2>Welcome back.</h2>
      <p className="lede">Use the mobile number on your RideVault account.</p>
      <form onSubmit={submit} className="stack">
        <label>
          Mobile number
          <input
            inputMode="numeric"
            autoComplete="username"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="09171234567"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Sign in
        </button>
      </form>
      <button type="button" className="text-btn" onClick={() => go("register")}>
        Create an account
      </button>
    </section>
  );
}

export function Register({ go, back, onDone }) {
  const { register } = useStore();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [riderType, setRiderType] = useState("Commuter");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const result = register({ name, mobile, password, riderType });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone();
  };

  return (
    <section className="form-screen">
      <TopBar title="Create account" onBack={back} />
      <h2>Register to claim a locker.</h2>
      <p className="lede">Your account is what locks and unlocks the compartment.</p>
      <form onSubmit={submit} className="stack">
        <label>
          Full name
          <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Mobile number
          <input
            inputMode="numeric"
            autoComplete="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="09171234567"
          />
        </label>
        <fieldset className="segment">
          <legend>I usually ride as</legend>
          <div className="segment-row">
            {RIDER_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                aria-pressed={riderType === type}
                className={riderType === type ? "on" : ""}
                onClick={() => setRiderType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Create account
        </button>
      </form>
      <button type="button" className="text-btn" onClick={() => go("signin")}>
        I already have an account
      </button>
    </section>
  );
}
