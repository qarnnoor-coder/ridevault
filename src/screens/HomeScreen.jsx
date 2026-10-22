import { useState } from "react";
import { LockerArt } from "../components/LockerArt";
import { Sheet } from "../components/Ui";
import { useStore } from "../store";
import { useNow } from "../useNow";
import { formatClock, formatRemaining, greeting, firstName, padLocker, peso, overtimeFee } from "../format";
import { siteById } from "../data";

export function HomeScreen({ go }) {
  const store = useStore();
  const { user, bay, activeRental, introSeen, dismissIntro } = store;
  const now = useNow(1000);
  const [sheet, setSheet] = useState(null);

  const openCount = store.state.lockers[bay.id].filter((locker) => locker.state === "open").length;

  const confirmLock = () => {
    store.lock();
    setSheet(null);
  };
  const confirmUnlock = () => {
    store.unlock();
    setSheet(null);
  };
  const confirmEnd = () => {
    if (activeRental?.status === "locked") {
      store.unlock();
      setSheet(null);
      return;
    }
    store.endRental();
    setSheet(null);
  };

  return (
    <section className="home">
      <header className="home-bar">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h2>{firstName(user?.name)}</h2>
        </div>
        <button
          type="button"
          className="bay-pill"
          onClick={() => go("bays")}
          disabled={Boolean(activeRental)}
        >
          {activeRental ? siteById(activeRental.siteId).name : bay.name}
        </button>
      </header>

      {activeRental ? (
        <RentalPanel rental={activeRental} now={now} onSheet={setSheet} />
      ) : (
        <>
          {!introSeen && (
            <div className="intro-card">
              <button type="button" className="intro-copy" onClick={() => go("how")}>
                <span className="eyebrow">How it works</span>
                <strong>Watch a locker get claimed, locked, and opened.</strong>
              </button>
              <button type="button" className="intro-dismiss" onClick={dismissIntro} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}
          <div className="claim-hero">
            <p className="eyebrow">At this bay</p>
            <h3>Store your helmet.</h3>
            <p className="lede">{availabilityCopy(openCount)}</p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={openCount === 0}
              onClick={() => go("plans")}
            >
              {openCount === 0 ? "This bay is full" : "Claim a locker"}
            </button>
            <button type="button" className="text-btn" onClick={() => go("how")}>
              How it works
            </button>
          </div>
        </>
      )}

      {sheet === "lock" && (
        <Sheet
          title={`Lock locker ${padLocker(activeRental.lockerNumber)}`}
          body="The helmet should be fully inside, and the door closed. Only this account will be able to open it."
          confirm="Lock now"
          tone="copper"
          onConfirm={confirmLock}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "unlock" && (
        <Sheet
          title={`Unlock locker ${padLocker(activeRental.lockerNumber)}`}
          body="Open it when you are at the bay. You can lock the same locker again until your time ends."
          confirm="Unlock"
          onConfirm={confirmUnlock}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "end" && (
        <Sheet
          title={activeRental.status === "locked" ? "Take your helmet first" : "End this rental"}
          body={
            activeRental.status === "locked"
              ? "Unlock the locker and remove your helmet before the compartment is released."
              : endCopy(activeRental, now)
          }
          confirm={activeRental.status === "locked" ? "Unlock instead" : "End rental"}
          tone={activeRental.status === "locked" ? "ink" : "alert"}
          onConfirm={confirmEnd}
          onClose={() => setSheet(null)}
        />
      )}
    </section>
  );
}

function availabilityCopy(count) {
  if (count === 0) return "No lockers are available at this bay.";
  const line = count === 1 ? "1 locker is available" : `${count} lockers are available`;
  return `${line}. RideVault assigns the next number. Your phone is the key.`;
}

function endCopy(rental, now) {
  const fee = overtimeFee(rental, now);
  const base = "The locker will be released for the next rider. Unused time is not refunded.";
  if (!fee) return base;
  return `${base} Overtime due now: ${peso(fee)}.`;
}

function RentalPanel({ rental, now, onSheet }) {
  const site = siteById(rental.siteId);
  const left = new Date(rental.end).getTime() - now;
  const locked = rental.status === "locked";
  const label = padLocker(rental.lockerNumber);

  return (
    <div className="rental">
      <p className="eyebrow">{site.name}</p>
      <p className={`status ${locked ? "is-locked" : "is-open"}`}>{locked ? "Locked" : "Open"}</p>
      <div className="rental-art">
        <LockerArt number={rental.lockerNumber} open={!locked} helmet={locked ? "inside" : "beside"} light />
      </div>
      <p className="locker-caption">Locker</p>
      <p className="locker-num">{label}</p>
      <p className={`remain ${left < 0 ? "is-over" : ""}`}>{formatRemaining(left)}</p>
      <p className="lede quiet">
        {rental.planName} · until {formatClock(rental.end)}
        {left < 0 ? ` · overtime ${peso(overtimeFee(rental, now))}` : ""}
      </p>
      {locked ? (
        <button type="button" className="btn btn-primary" onClick={() => onSheet("unlock")}>
          Unlock locker {label}
        </button>
      ) : (
        <button type="button" className="btn btn-copper" onClick={() => onSheet("lock")}>
          Lock locker {label}
        </button>
      )}
      {!locked && (
        <p className="hint">Place the helmet inside and close the door, then lock it here.</p>
      )}
      <button type="button" className="text-btn" onClick={() => onSheet("end")}>
        End rental
      </button>
      <p className="release">
        Attendant code <strong>{rental.releaseCode}</strong>
      </p>
    </div>
  );
}
