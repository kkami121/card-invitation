"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/localeContext";

export type LiveLocation = {
  userId: string;
  userNum: number;
  name: string;
  lat: number;
  lng: number;
  lastSeen: number;
  isActive: boolean;
};

type Props = {
  invitationId: string;
  myUserId: string;
  creatorUserId?: string;
  eventDateTime: Date | null;
  /** 카드가 뒤집혀 지도가 보이는 상태 */
  visible: boolean;
};

const MARKER_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12",
  "#9b59b6", "#1abc9c", "#e67e22", "#e91e63",
];
function markerColor(n: number) {
  return MARKER_COLORS[(n - 1) % MARKER_COLORS.length];
}

function loadLeaflet(): Promise<typeof window.L> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.L) {
      resolve(window.L);
      return;
    }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(window.L);
      document.head.appendChild(script);
    } else {
      const wait = setInterval(() => {
        if (window.L) { clearInterval(wait); resolve(window.L); }
      }, 50);
    }
  });
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

export default function MapView({ invitationId, myUserId, creatorUserId, eventDateTime, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  const [withinWindow, setWithinWindow] = useState<boolean | null>(null);
  const [msUntilOpen, setMsUntilOpen] = useState<number>(0);
  const [hasGeo, setHasGeo] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const myLatLngRef = useRef<[number, number] | null>(null);
  const nameRef = useRef("");
  const t = useT();

  /* ── localStorage에서 이름 로드 ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`loc-name-${invitationId}`);
      if (saved !== null) {
        setDisplayName(saved);
        nameRef.current = saved;
      }
    } catch {}
  }, [invitationId]);

  function confirmName() {
    const name = nameInput.trim();
    try { localStorage.setItem(`loc-name-${invitationId}`, name); } catch {}
    nameRef.current = name;
    setDisplayName(name);
  }

  /* ── 시간 게이트 (10초마다 갱신) ── */
  useEffect(() => {
    function check() {
      if (!eventDateTime) { setWithinWindow(true); return; }
      const remaining = (eventDateTime.getTime() - 60 * 60 * 1000) - Date.now();
      if (remaining <= 0) { setWithinWindow(true); setMsUntilOpen(0); }
      else { setWithinWindow(false); setMsUntilOpen(remaining); }
    }
    check();
    const t = setInterval(check, 10_000);
    return () => clearInterval(t);
  }, [eventDateTime]);

  /* ── Leaflet 지도 초기화 (컴포넌트 마운트 시 1회) ── */
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    loadLeaflet().then((L) => {
      if (destroyed || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
      map.setView([37.5665, 126.978], 9);
      mapRef.current = map;
    });

    return () => {
      destroyed = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 카드가 뒤집혀 보일 때 크기 재계산 ── */
  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => mapRef.current?.invalidateSize(), 360);
    const t2 = setTimeout(() => mapRef.current?.invalidateSize(), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  /* ── withinWindow가 열릴 때도 크기 재계산 ── */
  useEffect(() => {
    if (withinWindow) {
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, [withinWindow]);

  /* ── 내 위치 → 서버 전송 ── */
  useEffect(() => {
    if (!withinWindow) return;
    if (!navigator.geolocation) { setHasGeo(false); return; }

    function sendLocation(lat: number, lng: number) {
      myLatLngRef.current = [lat, lng];
      fetch(`/api/invitations/${invitationId}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: myUserId, lat, lng, name: nameRef.current }),
      }).catch(() => {});
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      () => setHasGeo(false),
      { enableHighAccuracy: true, maximumAge: 10_000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [withinWindow, invitationId, myUserId]);

  /* ── SSE 수신 → 마커 업데이트 ── */
  useEffect(() => {
    if (!withinWindow) return;
    const es = new EventSource(`/api/invitations/${invitationId}/location-stream`);

    es.onmessage = (event: MessageEvent) => {
      const L = window.L;
      if (!L || !mapRef.current) return;
      const locations: LiveLocation[] = JSON.parse(event.data as string);
      const map = mapRef.current;
      const newIds = new Set(locations.map((l) => l.userId));
      // 마커 추가 전에 체크해야 정확한 "첫 수신" 판단 가능
      const isFirstData = markersRef.current.size === 0 && locations.length > 0;

      locations.forEach((loc) => {
        const isMe = loc.userId === myUserId;
        const isCreator = creatorUserId ? loc.userId === creatorUserId : false;
        const color = markerColor(loc.userNum);
        const opacity = loc.isActive ? 1 : 0.45;
        const ring = isMe ? `outline:3px solid ${color};outline-offset:2px;` : "";
        const label = isCreator ? "★" : String(loc.userNum);

        const icon = L.divIcon({
          className: "",
          html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;opacity:${opacity};box-shadow:0 2px 8px rgba(0,0,0,0.3);${ring}">${label}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const popupText = isMe ? t.mapMarkerMe : (loc.name || `${t.mapGuest} ${loc.userNum}`);
        const existing = markersRef.current.get(loc.userId);
        if (existing) {
          existing.setLatLng([loc.lat, loc.lng]);
          existing.setIcon(icon);
          existing.setPopupContent(popupText);
        } else {
          const m = L.marker([loc.lat, loc.lng], { icon })
            .bindPopup(popupText)
            .addTo(map);
          markersRef.current.set(loc.userId, m);
        }
      });

      Array.from(markersRef.current.entries()).forEach(([id, m]) => {
        if (!newIds.has(id)) { m.remove(); markersRef.current.delete(id); }
      });

      if (isFirstData) {
        const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14, animate: true });
      }
    };

    return () => es.close();
  }, [withinWindow, invitationId, myUserId]);

  /* ── 렌더 ──
     map-container는 항상 DOM에 있어야 Leaflet이 올바르게 초기화됩니다.
     잠금/로딩 상태는 absolute overlay로 덮습니다.
  */
  const totalMin = Math.round(msUntilOpen / 60_000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const countdown = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="map-wrapper">
      {/* 지도 컨테이너 — 항상 렌더 */}
      <div ref={containerRef} className="map-container" />

      {/* 내 위치로 이동 버튼 */}
      {withinWindow && hasGeo && (
        <button
          className="map-my-location-btn"
          onClick={() => {
            if (myLatLngRef.current && mapRef.current) {
              mapRef.current.setView(myLatLngRef.current, 14, { animate: true });
            }
          }}
          aria-label="내 위치로 이동"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" fill="#3a3a3a" stroke="none"/>
            <circle cx="12" cy="12" r="8" stroke="#3a3a3a" />
            <line x1="12" y1="2"  x2="12" y2="4"  stroke="#3a3a3a" />
            <line x1="12" y1="20" x2="12" y2="22" stroke="#3a3a3a" />
            <line x1="2"  y1="12" x2="4"  y2="12" stroke="#3a3a3a" />
            <line x1="20" y1="12" x2="22" y2="12" stroke="#3a3a3a" />
          </svg>
        </button>
      )}

      {/* 위치권한 없음 경고 */}
      {!hasGeo && withinWindow && (
        <div className="map-geo-warn">{t.mapGeoWarn}</div>
      )}

      {/* 로딩 오버레이 */}
      {withinWindow === null && (
        <div className="map-overlay map-loading">
          <span>{t.mapLoading}</span>
        </div>
      )}

      {/* 이름 입력 오버레이 */}
      {withinWindow === true && displayName === null && (
        <div className="map-overlay map-name-prompt" onClick={(e) => e.stopPropagation()}>
          <p className="map-name-title">{t.mapNameTitle}</p>
          <input
            className="map-name-field"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={t.mapNamePlaceholder}
            maxLength={20}
            onKeyDown={(e) => { if (e.key === "Enter") confirmName(); }}
            autoFocus
          />
          <button className="map-name-confirm" onClick={confirmName}>
            {t.mapNameConfirm}
          </button>
        </div>
      )}

      {/* 시간 잠금 오버레이 */}
      {withinWindow === false && (
        <div className="map-overlay map-locked">
          <div className="map-locked-icon">📍</div>
          <p className="map-locked-title">{t.mapLockedTitle}</p>
          <p className="map-locked-sub">{countdown}</p>
        </div>
      )}
    </div>
  );
}
