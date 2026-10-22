import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { LockerArt } from "./LockerArt";

const BEATS = [
  {
    kicker: "At the bay",
    caption: "You park, and the helmet is the thing you no longer want to carry.",
    open: false,
    helmet: "beside",
  },
  {
    kicker: "The compartment",
    caption: "Each locker holds one helmet. It has its own door, lock, and ventilation.",
    open: true,
    helmet: "beside",
  },
  {
    kicker: "Your number",
    caption: "You choose your time. RideVault assigns the next open locker and gives you the number.",
    open: true,
    helmet: "inside",
    stamp: true,
  },
  {
    kicker: "Lock",
    caption: "The helmet goes in. You close the door and tap Lock. Only your account can open it.",
    open: false,
    helmet: "inside",
    phone: "Lock",
  },
  {
    kicker: "Move freely",
    caption: "Leave it sealed while you are at school, at work, or in the mall.",
    open: false,
    helmet: "inside",
    quiet: true,
  },
  {
    kicker: "Return",
    caption: "Come back to the same bay. The same account taps Unlock and the helmet is yours again.",
    open: true,
    helmet: "beside",
    phone: "Unlock",
  },
  {
    kicker: "The key",
    caption: "There is no physical key to carry or lose.",
    open: false,
    helmet: "none",
    end: true,
  },
];

const BEAT_MS = 3600;

export function FilmPlayer({ layout = "inline", onClose }) {
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frame = BEATS[beat];

  useEffect(() => {
    if (!playing || beat >= BEATS.length - 1) return undefined;
    const timer = setTimeout(() => setBeat((current) => current + 1), BEAT_MS);
    return () => clearTimeout(timer);
  }, [beat, playing]);

  const replay = () => {
    setBeat(0);
    setPlaying(true);
  };

  return (
    <div className={`player ${layout === "full" ? "player-full" : ""}`}>
      <div className="stage" data-quiet={frame.quiet ? "true" : "false"}>
        {layout === "full" && (
          <button type="button" className="stage-close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        )}
        <p className="stage-kicker" key={`k-${beat}`}>
          {frame.kicker}
        </p>
        <div className="stage-art">
          <LockerArt number={14} open={frame.open} helmet={frame.helmet} />
          {frame.end && <p className="end-line">Your phone is the key.</p>}
          {frame.phone && (
            <div className="phone-chip" key={frame.phone}>
              <small>RideVault</small>
              <b>{frame.phone}</b>
            </div>
          )}
        </div>
        <p className="stage-caption" key={`c-${beat}`} aria-live="polite">
          {frame.caption}
        </p>
      </div>
      <div className="player-controls">
        <div className="beats" role="tablist" aria-label="Walkthrough scenes">
          {BEATS.map((item, index) => (
            <button
              key={item.kicker}
              type="button"
              role="tab"
              aria-selected={index === beat}
              aria-label={item.kicker}
              className={index === beat ? "on" : index < beat ? "done" : ""}
              onClick={() => {
                setBeat(index);
                setPlaying(true);
              }}
            />
          ))}
        </div>
        {beat === BEATS.length - 1 ? (
          <button type="button" className="control" onClick={replay}>
            <Icon name="play" size={16} />
            Replay
          </button>
        ) : (
          <button type="button" className="control" onClick={() => setPlaying((value) => !value)}>
            <Icon name={playing ? "pause" : "play"} size={16} />
            {playing ? "Pause" : "Play"}
          </button>
        )}
      </div>
    </div>
  );
}
