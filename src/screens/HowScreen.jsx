import { useEffect, useState } from "react";
import { FilmPlayer } from "../components/FilmPlayer";
import { TopBar } from "../components/Ui";
import { ATTENDED, OVERTIME_RATE } from "../data";
import { useStore } from "../store";

const STEPS = [
  {
    title: "Register once",
    body: "Your account is the key. The same sign-in locks and unlocks the compartment.",
  },
  {
    title: "Choose the bay and the time",
    body: "Hourly, a shift, or a day. You pay for that period before a locker is assigned.",
  },
  {
    title: "Get your number",
    body: "RideVault gives you the next open locker. You don’t pick a door, and you don’t take a physical key.",
  },
  {
    title: "Store, then lock",
    body: "One helmet goes inside. Close the door and tap Lock. Only your account can open that number.",
  },
  {
    title: "Return and unlock",
    body: "Come back to the same bay, tap Unlock, take the helmet, and end the rental. You can lock it again until the time ends.",
  },
];

export function HowScreen({ back }) {
  const { dismissIntro } = useStore();
  const [full, setFull] = useState(false);

  useEffect(() => {
    dismissIntro();
  }, [dismissIntro]);

  const openFull = () => {
    dismissIntro();
    setFull(true);
  };

  return (
    <section className="how">
      <TopBar title="How it works" onBack={back} />
      <p className="lede">
        RideVault is helmet storage beside motorcycle parking. The film below is the whole rental, from the bay to the ride home.
      </p>
      <FilmPlayer />
      <button type="button" className="btn btn-secondary film-expand" onClick={openFull}>
        Play full screen
      </button>
      <ol className="steps">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="policy">
        <h3>Good to know</h3>
        <ul>
          <li>One helmet per locker. Bags stay with you.</li>
          <li>Ending early does not refund unused time.</li>
          <li>After the end time, overtime is ₱{OVERTIME_RATE} an hour. You can still unlock.</li>
          <li>The app locks and unlocks at any hour.</li>
          <li>Attendants are at the bay {ATTENDED}. If your phone is unavailable, show them the release code on your receipt.</li>
        </ul>
      </div>
      {full && (
        <div className="film-full">
          <FilmPlayer layout="full" onClose={() => setFull(false)} />
        </div>
      )}
    </section>
  );
}
