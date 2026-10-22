import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { LEGACY_BAYS, seedLockers, siteById, SITES } from "./data";
import { addHours, normalizeMobile, overtimeFee, validMobile } from "./format";

const KEY = "ridevault.v1";

function freshState() {
  return {
    users: [],
    userId: null,
    bayId: "tip-qc",
    introSeen: false,
    rentals: [],
    reports: [],
    lockers: Object.fromEntries(SITES.map((site) => [site.id, seedLockers(site.id)])),
  };
}

function remapBay(id) {
  return LEGACY_BAYS[id] || id;
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed.lockers || !Array.isArray(parsed.users) || !Array.isArray(parsed.rentals)) {
      return freshState();
    }
    const base = freshState();
    const lockers = { ...base.lockers };
    for (const [key, value] of Object.entries(parsed.lockers)) {
      const id = remapBay(key);
      if (lockers[id] && Array.isArray(value)) lockers[id] = value;
    }
    const bayId = remapBay(parsed.bayId);
    return {
      ...base,
      ...parsed,
      bayId: lockers[bayId] ? bayId : base.bayId,
      lockers,
      rentals: parsed.rentals.map((rental) => ({ ...rental, siteId: remapBay(rental.siteId) })),
      reports: (parsed.reports || []).map((report) => ({ ...report, siteId: remapBay(report.siteId) })),
    };
  } catch {
    return freshState();
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "register":
      return {
        ...state,
        users: [...state.users, action.user],
        userId: action.user.id,
      };
    case "login":
      return { ...state, userId: action.userId };
    case "logout":
      return { ...state, userId: null };
    case "setBay":
      return { ...state, bayId: action.bayId };
    case "introSeen":
      if (state.introSeen) return state;
      return { ...state, introSeen: true };
    case "assign": {
      const lockers = {
        ...state.lockers,
        [action.bayId]: state.lockers[action.bayId].map((locker) =>
          locker.number === action.rental.lockerNumber
            ? { ...locker, state: "rented", rentalId: action.rental.id }
            : locker,
        ),
      };
      return { ...state, rentals: [action.rental, ...state.rentals], lockers };
    }
    case "lock":
      return {
        ...state,
        rentals: state.rentals.map((rental) =>
          rental.id === action.id ? { ...rental, status: "locked" } : rental,
        ),
      };
    case "unlock":
      return {
        ...state,
        rentals: state.rentals.map((rental) =>
          rental.id === action.id ? { ...rental, status: "open" } : rental,
        ),
      };
    case "end": {
      const rentals = state.rentals.map((rental) =>
        rental.id === action.id
          ? {
              ...rental,
              status: "complete",
              closedAt: action.closedAt,
              overtimeFee: action.overtimeFee,
            }
          : rental,
      );
      const lockers = {
        ...state.lockers,
        [action.bayId]: state.lockers[action.bayId].map((locker) =>
          locker.number === action.number ? { ...locker, state: "open", rentalId: null } : locker,
        ),
      };
      return { ...state, rentals, lockers };
    }
    case "report":
      return { ...state, reports: [action.report, ...state.reports] };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => {
    const user = state.users.find((item) => item.id === state.userId) || null;
    const bay = siteById(state.bayId);
    const activeRental =
      state.rentals.find((rental) => rental.userId === state.userId && rental.status !== "complete") ||
      null;

    return {
      state,
      user,
      bay,
      activeRental,
      register(input) {
        const name = input.name.trim();
        const mobile = normalizeMobile(input.mobile);
        if (name.length < 2) return { ok: false, error: "Enter your full name." };
        if (!validMobile(mobile)) {
          return { ok: false, error: "Enter a mobile number, for example 09171234567." };
        }
        if (!input.riderType) return { ok: false, error: "Choose how you ride." };
        if (input.password.length < 6) return { ok: false, error: "Use at least 6 characters." };
        if (state.users.some((item) => item.mobile === mobile)) {
          return { ok: false, error: "That mobile number already has an account. Sign in instead." };
        }
        const account = {
          id: crypto.randomUUID(),
          name,
          mobile,
          riderType: input.riderType,
          password: input.password,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "register", user: account });
        return { ok: true };
      },
      login(input) {
        const mobile = normalizeMobile(input.mobile);
        const account = state.users.find((item) => item.mobile === mobile);
        if (!account || account.password !== input.password) {
          return { ok: false, error: "That mobile number and password do not match." };
        }
        dispatch({ type: "login", userId: account.id });
        return { ok: true };
      },
      logout() {
        dispatch({ type: "logout" });
      },
      setBay(bayId) {
        if (activeRental) {
          return { ok: false, error: "Finish your rental before changing bays." };
        }
        dispatch({ type: "setBay", bayId });
        return { ok: true };
      },
      dismissIntro() {
        dispatch({ type: "introSeen" });
      },
      assign(draft) {
        if (activeRental) return { ok: true, rental: activeRental };
        const locker = state.lockers[state.bayId].find((item) => item.state === "open");
        if (!locker) return { ok: false, error: "This bay is full. Choose another bay." };
        const start = Date.now();
        const rental = {
          id: `RV-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: state.userId,
          siteId: state.bayId,
          lockerNumber: locker.number,
          planId: draft.planId,
          planName: draft.name,
          hours: draft.hours,
          amount: draft.amount,
          method: draft.method || "gcash",
          start: new Date(start).toISOString(),
          end: addHours(start, draft.hours),
          status: "open",
          releaseCode: String(Math.floor(1000 + Math.random() * 9000)),
          overtimeFee: 0,
          closedAt: null,
        };
        dispatch({ type: "assign", bayId: state.bayId, rental });
        return { ok: true, rental };
      },
      lock() {
        if (!activeRental) return { ok: false, error: "Claim a locker first." };
        dispatch({ type: "lock", id: activeRental.id });
        return { ok: true };
      },
      unlock() {
        if (!activeRental) return { ok: false, error: "There is no locker to unlock." };
        dispatch({ type: "unlock", id: activeRental.id });
        return { ok: true };
      },
      endRental() {
        if (!activeRental) return { ok: false, error: "There is no rental to end." };
        if (activeRental.status === "locked") {
          return { ok: false, error: "Unlock the locker and take your helmet first." };
        }
        const now = Date.now();
        const fee = overtimeFee(activeRental, now);
        dispatch({
          type: "end",
          id: activeRental.id,
          bayId: activeRental.siteId,
          number: activeRental.lockerNumber,
          overtimeFee: fee,
          closedAt: new Date(now).toISOString(),
        });
        return { ok: true, fee };
      },
      fileReport(input) {
        const note = input.note.trim();
        if (!input.kind) return { ok: false, error: "Choose what happened." };
        if (note.length < 4) return { ok: false, error: "Describe what happened." };
        const report = {
          id: crypto.randomUUID(),
          userId: state.userId,
          rentalId: activeRental?.id || null,
          lockerNumber: activeRental?.lockerNumber || null,
          siteId: activeRental?.siteId || state.bayId,
          kind: input.kind,
          note,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "report", report });
        return { ok: true, report };
      },
    };
  }, [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store missing");
  return value;
}
