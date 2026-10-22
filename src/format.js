import { OVERTIME_RATE } from "./data";

export function peso(amount) {
  return `₱${amount}`;
}

export function padLocker(number) {
  return String(number).padStart(2, "0");
}

export function normalizeMobile(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}

export function validMobile(value) {
  return /^09\d{9}$/.test(normalizeMobile(value));
}

export function formatMobile(value) {
  const digits = normalizeMobile(value);
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "Rider";
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatClock(value) {
  return new Date(value).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatWhen(value) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function addHours(from, hours) {
  return new Date(from + hours * 60 * 60 * 1000).toISOString();
}

export function overtimeFee(rental, now) {
  const end = new Date(rental.end).getTime();
  if (now <= end) return 0;
  const blocks = Math.ceil((now - end) / (60 * 60 * 1000));
  return blocks * OVERTIME_RATE;
}

export function formatRemaining(ms) {
  const overtime = ms < 0;
  const abs = Math.abs(ms);
  const hours = Math.floor(abs / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  const body =
    hours > 0
      ? `${hours}h ${String(minutes).padStart(2, "0")}m`
      : `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return overtime ? `${body} overtime` : `${body} left`;
}

export function openCount(lockers) {
  return lockers.filter((locker) => locker.state === "open").length;
}
