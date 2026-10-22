export function Icon({ name, size = 22 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "home") {
    return (
      <svg {...props}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (name === "pin") {
    return (
      <svg {...props}>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.5l3 2" />
      </svg>
    );
  }
  if (name === "user") {
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 19.2c1.4-2.8 3.6-4.2 6.5-4.2s5.1 1.4 6.5 4.2" />
      </svg>
    );
  }
  if (name === "back") {
    return (
      <svg {...props}>
        <path d="M15 5 8 12l7 7" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg {...props}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    );
  }
  if (name === "play") {
    return (
      <svg {...props}>
        <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "pause") {
    return (
      <svg {...props}>
        <path d="M8 5v14M16 5v14" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...props}>
        <path d="M5 12.5 9.2 17 19 7" />
      </svg>
    );
  }
  if (name === "chevron") {
    return (
      <svg {...props}>
        <path d="m9 5 7 7-7 7" />
      </svg>
    );
  }
  return null;
}

export function LogoMark({ size = 56, light = false }) {
  const plate = light ? "#f4efe7" : "#1a1714";
  const ink = light ? "#1a1714" : "#f4efe7";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="10" width="48" height="46" rx="12" fill={plate} />
      <path d="M24 30V24a8 8 0 0 1 16 0v6" fill="none" stroke="#c4622d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="38" r="3.4" fill="#c4622d" />
      <path d="M18 20h7M39 20h7" stroke={ink} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}
