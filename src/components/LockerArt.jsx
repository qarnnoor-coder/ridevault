function Helmet() {
  return (
    <g className="helmet">
      <path
        d="M16 34c0-18 14-30 34-30s34 12 34 30v20c0 16-12 28-26 32H42C28 82 16 70 16 54V34z"
        fill="#f7f4ee"
        stroke="#1a1714"
        strokeWidth="3.5"
      />
      <path d="M24 42c2 12 14 20 26 20s24-8 26-20v5c-3 16-16 26-26 26S27 63 24 47v-5z" fill="#1a1714" />
      <path d="M30 24c8-6 20-8 30-3" fill="none" stroke="#c4622d" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export function LockerArt({
  number = 14,
  open = false,
  helmet = "none",
  light = false,
  className = "",
}) {
  const label = String(number).padStart(2, "0");
  const pos = helmet === "beside" ? "translate(262px, 72px) scale(0.78)" : "translate(168px, 58px) scale(0.7)";
  return (
    <svg
      viewBox="0 0 360 250"
      className={`locker-art ${open ? "is-open" : "is-shut"} ${light ? "on-light" : ""} ${className}`}
      role="img"
      aria-label={open ? `Locker ${label}, open` : `Locker ${label}, locked`}
    >
      <rect className="cavity" x="118" y="22" width="132" height="196" rx="16" />
      <g className="helmet-move" style={{ transform: pos, opacity: helmet === "none" ? 0 : 1 }}>
        <Helmet />
      </g>
      <g className="locker-door">
        <rect className="door-face" x="118" y="22" width="132" height="196" rx="16" />
        <g className="vents">
          <rect x="140" y="42" width="88" height="5" rx="2.5" />
          <rect x="140" y="54" width="88" height="5" rx="2.5" />
          <rect x="140" y="66" width="88" height="5" rx="2.5" />
        </g>
        <text x="184" y="126" textAnchor="middle">
          {label}
        </text>
        <g className="padlock" transform="translate(208, 148)">
          <path className="shackle-arm" d="M6 16V9a8 8 0 0 1 16 0v7" />
          <rect className="lock-body" x="2" y="16" width="24" height="20" rx="5" />
          <circle cx="14" cy="26" r="2.2" fill="#f4efe7" />
        </g>
      </g>
    </svg>
  );
}
