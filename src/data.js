export const ATTENDED = "6:00 AM – 10:00 PM";
export const HOURLY_RATE = 25;
export const HOURLY_MAX = 4;
export const OVERTIME_RATE = 20;

export const SITES = [
  {
    id: "tip-qc",
    name: "TIP Quezon City",
    short: "TIP QC",
    area: "Cubao",
    detail: "Campus motorcycle parking",
    address: "938 Aurora Boulevard, Cubao, Quezon City",
    note: "Aurora Boulevard rider bays, Technological Institute of the Philippines – Quezon City.",
    lat: 14.62644,
    lng: 121.0616,
    aliases: ["tip", "technological institute", "aurora", "cubao", "campus", "quezon city"],
  },
  {
    id: "gateway",
    name: "Gateway Mall",
    short: "Gateway",
    area: "Cubao",
    detail: "Araneta City rider parking",
    address: "Gen. Aguinaldo Avenue, Araneta City, Cubao, Quezon City",
    note: "Rider parking at Gateway Mall, Araneta City.",
    lat: 14.62191,
    lng: 121.05299,
    aliases: ["gateway", "araneta", "cubao", "mall", "aguinaldo", "farmers"],
  },
  {
    id: "sm-north",
    name: "SM North EDSA",
    short: "SM North",
    area: "Bagong Pag-asa",
    detail: "Annex motorcycle parking",
    address: "North Avenue corner EDSA, Bagong Pag-asa, Quezon City",
    note: "Annex motorcycle parking, SM City North EDSA.",
    lat: 14.65703,
    lng: 121.03048,
    aliases: ["sm", "north edsa", "sm north", "edsa", "north avenue", "bagong pag-asa"],
  },
];

export const PLANS = [
  {
    id: "hourly",
    name: "Hourly",
    blurb: "A short stop",
    detail: "₱25 an hour, up to 4 hours",
  },
  {
    id: "shift",
    name: "Shift",
    blurb: "A work shift",
    detail: "9 hours",
  },
  {
    id: "day",
    name: "Day",
    blurb: "Leave it for the day",
    detail: "12 hours",
  },
];

export const METHODS = [
  { id: "gcash", name: "GCash", hint: "Approve the charge in the app" },
  { id: "maya", name: "Maya", hint: "Approve the charge in the app" },
  { id: "card", name: "Debit or credit card", hint: "Enter the card for this rental" },
];

export const REPORT_KINDS = [
  "Locker will not unlock",
  "Damaged compartment",
  "Cleanliness",
  "Something else",
];

export const RIDER_TYPES = ["Commuter", "Student", "Employee"];

const HELD = {
  "tip-qc": [2, 5, 7, 8, 13, 16, 19, 22],
  gateway: [1, 3, 4, 11, 12, 18, 20, 21, 24],
  "sm-north": [6, 9, 10, 15],
};

export const LEGACY_BAYS = {
  northbay: "tip-qc",
  westcourt: "gateway",
  midtown: "sm-north",
};

export function mapsLink(site) {
  const query = encodeURIComponent(`${site.name}, ${site.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function seedLockers(siteId) {
  const held = new Set(HELD[siteId] || []);
  return Array.from({ length: 24 }, (_, index) => {
    const number = index + 1;
    return {
      number,
      state: held.has(number) ? "held" : "open",
      rentalId: null,
    };
  });
}

export function quote(planId, hours) {
  if (planId === "shift") return { planId, name: "Shift", hours: 9, amount: 69 };
  if (planId === "day") return { planId, name: "Day", hours: 12, amount: 79 };
  const span = Math.min(HOURLY_MAX, Math.max(1, hours || 1));
  return { planId: "hourly", name: "Hourly", hours: span, amount: HOURLY_RATE * span };
}

export function siteById(id) {
  return SITES.find((site) => site.id === id) || SITES[0];
}
