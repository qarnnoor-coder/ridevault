import { useEffect, useState } from "react";
import { Icon } from "./components/Icons";
import { StoreProvider, useStore } from "./store";
import { AccountScreen, ReportScreen } from "./screens/AccountScreens";
import { ActivityScreen, ReceiptScreen } from "./screens/ActivityScreen";
import { Register, SignIn, Splash, Welcome } from "./screens/AuthScreens";
import { BayScreen, BaysScreen } from "./screens/BayScreens";
import { AssignScreen, PayScreen, PlansScreen } from "./screens/ClaimScreens";
import { HomeScreen } from "./screens/HomeScreen";
import { HowScreen } from "./screens/HowScreen";

const TABS = [
  ["home", "Home", "home"],
  ["bays", "Bays", "pin"],
  ["activity", "Activity", "clock"],
  ["account", "Account", "user"],
];

function Shell() {
  const { user } = useStore();
  const [stack, setStack] = useState(() => {
    if (sessionStorage.getItem("rv-splash") === "1") return [user ? "home" : "welcome"];
    return ["splash"];
  });
  const [draft, setDraft] = useState(null);
  const [bayFocus, setBayFocus] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const screen = stack[stack.length - 1];

  useEffect(() => {
    if (screen !== "splash") return undefined;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("rv-splash", "1");
      setStack([user ? "home" : "welcome"]);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [screen, user]);

  const go = (name) => setStack((items) => [...items, name]);
  const back = () => setStack((items) => (items.length > 1 ? items.slice(0, -1) : items));
  const tab = (name) => setStack([name]);
  const swap = (name) => setStack((items) => [...items.slice(0, -1), name]);
  const reset = (name) => setStack([name]);

  const showNav = ["home", "bays", "activity", "account"].includes(screen) && user;
  const flush = ["splash", "welcome", "assign"].includes(screen);

  let content = null;
  if (screen === "splash") content = <Splash />;
  else if (screen === "welcome") content = <Welcome go={go} />;
  else if (screen === "signin") content = <SignIn go={swap} back={back} onDone={() => reset("home")} />;
  else if (screen === "register") content = <Register go={swap} back={back} onDone={() => reset("home")} />;
  else if (screen === "how") content = <HowScreen back={back} />;
  else if (!user) content = <Welcome go={go} />;
  else if (screen === "home") content = <HomeScreen go={go} />;
  else if (screen === "bays") content = <BaysScreen openBay={(id) => { setBayFocus(id); go("bay"); }} />;
  else if (screen === "bay") content = <BayScreen siteId={bayFocus} back={back} />;
  else if (screen === "plans") content = (
    <PlansScreen
      back={back}
      onContinue={(next) => {
        setDraft(next);
        go("pay");
      }}
    />
  );
  else if (screen === "pay" && draft) content = (
    <PayScreen
      draft={draft}
      back={back}
      onPaid={(method) => {
        setDraft((current) => ({ ...current, method }));
        go("assign");
      }}
    />
  );
  else if (screen === "assign" && draft) content = (
    <AssignScreen
      draft={draft}
      onDone={() => reset("home")}
      onBays={() => reset("bays")}
    />
  );
  else if (screen === "activity") content = (
    <ActivityScreen openReceipt={(id) => { setReceiptId(id); go("receipt"); }} />
  );
  else if (screen === "receipt") content = (
    <ReceiptScreen rentalId={receiptId} back={back} goHome={() => reset("home")} />
  );
  else if (screen === "account") content = <AccountScreen go={go} onSignedOut={() => reset("welcome")} />;
  else if (screen === "report") content = <ReportScreen back={back} />;
  else content = <HomeScreen go={go} />;

  return (
    <div className="app">
      <div key={screen} className={`screen ${flush ? "flush" : ""} ${showNav ? "with-nav" : ""}`}>
        {content}
      </div>
      {showNav && (
        <nav className="tabbar">
          {TABS.map(([id, label, icon]) => (
            <button key={id} type="button" className={screen === id ? "on" : ""} onClick={() => tab(id)}>
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
