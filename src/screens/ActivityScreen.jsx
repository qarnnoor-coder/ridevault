import { METHODS } from "../data";
import { siteById } from "../data";
import { formatWhen, padLocker, peso } from "../format";
import { TopBar } from "../components/Ui";
import { useStore } from "../store";

function methodName(id) {
  return METHODS.find((item) => item.id === id)?.name || "Payment";
}

export function ActivityScreen({ openReceipt }) {
  const { state, user } = useStore();
  const rentals = state.rentals.filter((rental) => rental.userId === user?.id);

  return (
    <section>
      <header className="page-head">
        <p className="eyebrow">Receipts</p>
        <h2>Activity</h2>
      </header>
      {rentals.length === 0 ? (
        <div className="empty">
          <p>Rentals you claim will be listed here, with the locker number and the receipt.</p>
        </div>
      ) : (
        <div className="stack">
          {rentals.map((rental) => (
            <button type="button" className="receipt-row" key={rental.id} onClick={() => openReceipt(rental.id)}>
              <span className="receipt-num">{padLocker(rental.lockerNumber)}</span>
              <span>
                <strong>{siteById(rental.siteId).name}</strong>
                <em>
                  {rental.planName} · {formatWhen(rental.start)}
                </em>
              </span>
              <b>{rental.status === "complete" ? "Ended" : "In progress"}</b>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function ReceiptScreen({ rentalId, back, goHome }) {
  const { state } = useStore();
  const rental = state.rentals.find((item) => item.id === rentalId);
  if (!rental) {
    return (
      <section>
        <TopBar title="Receipt" onBack={back} />
        <p className="lede">That receipt is no longer on this phone.</p>
      </section>
    );
  }
  const site = siteById(rental.siteId);
  const overtime = rental.overtimeFee || 0;
  const total = rental.amount + overtime;
  const done = rental.status === "complete";

  return (
    <section>
      <TopBar title="Receipt" onBack={back} />
      <article className="receipt">
        <p className="eyebrow">{done ? "Ended" : "In progress"}</p>
        <p className="locker-caption">Locker</p>
        <p className="locker-num">{padLocker(rental.lockerNumber)}</p>
        <p className="lede quiet">{site.name}</p>
        <p className="meta-line">
          {site.area} · {site.detail}
        </p>
        <ul className="summary">
          <li>
            <span>Reference</span>
            <strong>{rental.id}</strong>
          </li>
          <li>
            <span>Plan</span>
            <strong>
              {rental.planName} · {rental.hours} {rental.hours === 1 ? "hour" : "hours"}
            </strong>
          </li>
          <li>
            <span>Started</span>
            <strong>{formatWhen(rental.start)}</strong>
          </li>
          <li>
            <span>{done ? "Ended" : "Ends"}</span>
            <strong>{formatWhen(done ? rental.closedAt : rental.end)}</strong>
          </li>
          <li>
            <span>Storage</span>
            <strong>{peso(rental.amount)}</strong>
          </li>
          <li>
            <span>Overtime</span>
            <strong>{peso(overtime)}</strong>
          </li>
          <li>
            <span>Total</span>
            <strong>{peso(total)}</strong>
          </li>
          <li>
            <span>Paid with</span>
            <strong>{methodName(rental.method)}</strong>
          </li>
          <li>
            <span>Attendant code</span>
            <strong>{rental.releaseCode}</strong>
          </li>
        </ul>
      </article>
      {!done && (
        <button type="button" className="btn btn-primary" onClick={goHome}>
          Back to locker {padLocker(rental.lockerNumber)}
        </button>
      )}
      <p className="hint">Show the attendant code only if your phone cannot open the locker. Attended hours are 6:00 AM – 10:00 PM.</p>
    </section>
  );
}
