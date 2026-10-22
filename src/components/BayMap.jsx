import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function pinHtml(site, count, yours) {
  return `<div class="map-pin ${yours ? "yours" : ""}">
    <strong>${count}</strong>
    <span>open</span>
    <em>${site.short}</em>
  </div>`;
}

export function BayMap({ sites, counts, yoursId, focus, onOpen }) {
  const node = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const placeRef = useRef(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const siteKey = sites.map((site) => site.id).join("|");
  const countKey = sites.map((site) => `${site.id}:${counts[site.id] ?? 0}:${site.id === yoursId ? "y" : "n"}`).join("|");

  useEffect(() => {
    if (!node.current || mapRef.current) return undefined;
    const map = L.map(node.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    });
    L.control.zoom({ position: "topleft" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = group;
    const bounds = L.latLngBounds(sites.map((site) => [site.lat, site.lng]));
    map.fitBounds(bounds, { paddingTopLeft: [24, 72], paddingBottomRight: [24, 24], maxZoom: 14 });
    const timer = window.setTimeout(() => map.invalidateSize(), 250);
    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;
    group.clearLayers();
    sites.forEach((site) => {
      const yours = site.id === yoursId;
      const icon = L.divIcon({
        className: "map-pin-wrap",
        html: pinHtml(site, counts[site.id] ?? 0, yours),
        iconSize: [76, 58],
        iconAnchor: [38, 58],
      });
      const marker = L.marker([site.lat, site.lng], { icon, keyboard: false });
      marker.on("click", () => onOpenRef.current(site.id));
      marker.addTo(group);
    });
    if (placeRef.current) placeRef.current.addTo(group);
  }, [countKey, siteKey]);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;
    if (placeRef.current) {
      placeRef.current.remove();
      placeRef.current = null;
    }
    if (!focus) {
      const bounds = L.latLngBounds(sites.map((site) => [site.lat, site.lng]));
      map.fitBounds(bounds, { paddingTopLeft: [24, 72], paddingBottomRight: [24, 24], maxZoom: 14 });
      return;
    }
    if (focus.kind === "place") {
      const icon = L.divIcon({
        className: "map-pin-wrap",
        html: `<div class="map-search-pin"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      placeRef.current = L.marker([focus.lat, focus.lng], { icon, interactive: false }).addTo(group);
    }
    map.flyTo([focus.lat, focus.lng], focus.zoom || 16, { duration: 0.7 });
  }, [focus?.kind, focus?.lat, focus?.lng, focus?.zoom, siteKey]);

  return <div ref={node} className="bay-map" role="application" aria-label="Station map of Quezon City" />;
}
