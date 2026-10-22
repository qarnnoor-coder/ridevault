import { useEffect, useMemo, useRef, useState } from "react";
import { ATTENDED, SITES, mapsLink } from "../data";
import { BayMap } from "../components/BayMap";
import { TopBar } from "../components/Ui";
import { useStore } from "../store";
import { openCount, padLocker } from "../format";

function kmBetween(a, b) {
  const earth = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}

function formatKm(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

function matchesSite(site, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const hay = [site.name, site.short, site.area, site.detail, site.address, site.note, ...site.aliases]
    .join(" ")
    .toLowerCase();
  return words.every((word) => hay.includes(word));
}

export function BaysScreen({ openBay }) {
  const { state, bay, activeRental } = useStore();
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [searching, setSearching] = useState(false);
  const [place, setPlace] = useState(null);
  const [focus, setFocus] = useState(null);
  const skipLookup = useRef(false);

  const counts = useMemo(() => {
    return Object.fromEntries(SITES.map((site) => [site.id, openCount(state.lockers[site.id] || [])]));
  }, [state.lockers]);

  const stationHits = SITES.filter((site) => matchesSite(site, query));
  const ranked = place
    ? [...SITES].sort((a, b) => kmBetween(place, a) - kmBetween(place, b))
    : query.trim() && stationHits.length > 0
      ? stationHits
      : SITES;

  useEffect(() => {
    const text = query.trim();
    if (skipLookup.current) {
      skipLookup.current = false;
      return undefined;
    }
    if (text.length < 3 || stationHits.length > 0) {
      setPlaces([]);
      setSearching(false);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(`${text} Quezon City`)}&lat=14.63&lon=121.05&limit=5`,
          { signal: controller.signal },
        );
        const data = await response.json();
        const seen = new Set();
        const next = (data.features || [])
          .map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            const props = feature.properties || {};
            return {
              id: `${lat},${lng}`,
              name: props.name || text,
              detail: [props.street, props.district || props.city, props.state].filter(Boolean).join(", "),
              lat,
              lng,
            };
          })
          .filter((item) => item.lat > 14.5 && item.lat < 14.8 && item.lng > 120.95 && item.lng < 121.15)
          .filter((item) => {
            const key = item.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 4);
        setPlaces(next);
      } catch {
        setPlaces([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, stationHits.length]);

  const chooseStation = (site) => {
    setPlace(null);
    setPlaces([]);
    setQuery("");
    setFocus({ lat: site.lat, lng: site.lng, zoom: 16, token: site.id });
  };

  const choosePlace = (item) => {
    skipLookup.current = true;
    setPlace(item);
    setQuery(item.name);
    setPlaces([]);
    setFocus({ kind: "place", lat: item.lat, lng: item.lng, zoom: 15, token: item.id });
  };

  const clearSearch = () => {
    setQuery("");
    setPlace(null);
    setPlaces([]);
    setFocus(null);
  };

  return (
    <section>
      <header className="page-head">
        <p className="eyebrow">Stations</p>
        <h2>Bays</h2>
        <p className="lede">Lockers beside motorcycle parking.</p>
      </header>
      <div className="finder">
        <label>
          Search a place
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPlace(null);
            }}
            placeholder="TIP, Gateway, SM North"
          />
        </label>
        {(query.trim() || place || focus) && (
          <button type="button" className="text-btn finder-clear" onClick={clearSearch}>
            Show all stations
          </button>
        )}
        {(stationHits.length > 0 && query.trim()) || places.length > 0 || searching ? (
          <div className="finder-results">
            {query.trim() &&
              stationHits.map((site) => (
                <button type="button" key={site.id} onClick={() => chooseStation(site)}>
                  <strong>{site.name}</strong>
                  <span>{counts[site.id]} open · {site.address}</span>
                </button>
              ))}
            {searching && <p>Looking up that place…</p>}
            {places.map((item) => (
              <button type="button" key={item.id} onClick={() => choosePlace(item)}>
                <strong>{item.name}</strong>
                <span>{item.detail || "Quezon City"}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <BayMap sites={SITES} counts={counts} yoursId={activeRental?.siteId} focus={focus} onOpen={openBay} />
      <p className="hint">The number on each pin is the lockers open at that station.</p>
      <div className="stack">
        {ranked.map((site) => {
          const selected = site.id === bay.id;
          const distance = place ? formatKm(kmBetween(place, site)) : null;
          return (
            <button
              type="button"
              className={`bay-card ${selected ? "is-selected" : ""}`}
              key={site.id}
              onClick={() => openBay(site.id)}
            >
              <div>
                <strong>{site.name}</strong>
                <span>{site.address}</span>
                <em>
                  {counts[site.id]} open
                  {distance ? ` · ${distance} away` : ""} · Attended {ATTENDED}
                </em>
              </div>
              {activeRental?.siteId === site.id ? (
                <b>Yours</b>
              ) : place && ranked[0]?.id === site.id ? (
                <b>Nearest</b>
              ) : !activeRental && selected ? (
                <b>Selected</b>
              ) : null}
            </button>
          );
        })}
        {ranked.length === 0 && <p className="hint">No station matches that search. Try a street or a landmark.</p>}
      </div>
    </section>
  );
}

export function BayScreen({ siteId, back }) {
  const store = useStore();
  const site = SITES.find((item) => item.id === siteId) || store.bay;
  const lockers = store.state.lockers[site.id] || [];
  const selected = store.bay.id === site.id;
  const blocked = Boolean(store.activeRental);
  const counts = { [site.id]: openCount(lockers) };

  return (
    <section>
      <TopBar title={site.name} onBack={back} />
      <p className="lede">{site.address}</p>
      <p className="meta-line">{site.note}</p>
      <BayMap
        sites={[site]}
        counts={counts}
        yoursId={store.activeRental?.siteId}
        focus={{ lat: site.lat, lng: site.lng, zoom: 17, token: site.id }}
        onOpen={() => {}}
      />
      <a className="map-link" href={mapsLink(site)} target="_blank" rel="noreferrer">
        Open this location in Maps
      </a>
      <p className="meta-line">Attended {ATTENDED}. The app locks and unlocks at any hour.</p>
      <div className="legend">
        <span><i className="swatch open" /> Open</span>
        <span><i className="swatch held" /> In use</span>
        <span><i className="swatch yours" /> Yours</span>
      </div>
      <div className="locker-grid">
        {lockers.map((locker) => {
          const yours = store.activeRental?.lockerNumber === locker.number && store.activeRental.siteId === site.id;
          const tone = yours ? "yours" : locker.state === "open" ? "open" : "held";
          return (
            <div key={locker.number} className={`cell ${tone}`}>
              {padLocker(locker.number)}
            </div>
          );
        })}
      </div>
      <p className="hint">You don’t choose a door. RideVault assigns the next open number.</p>
      <button
        type="button"
        className="btn btn-primary"
        disabled={selected || blocked}
        onClick={() => {
          const result = store.setBay(site.id);
          if (result.ok) back();
        }}
      >
        {blocked ? "Finish your rental first" : selected ? "This is your bay" : "Use this bay"}
      </button>
    </section>
  );
}
