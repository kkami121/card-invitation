/**
 * 서버 프로세스 내 인메모리 위치 정보 저장소.
 * 초대장 ID별로 접속자들의 최근 위치를 관리합니다.
 */

export type LocationEntry = {
  userId: string;
  userNum: number;
  name: string;
  lat: number;
  lng: number;
  lastSeen: number; // Unix ms
};

type InvitationLocations = {
  nextNum: number;
  users: Map<string, LocationEntry>;
};

// 모듈 레벨 싱글톤 — 같은 Node.js 프로세스 내에서 요청 간 유지됩니다.
const storeMap = new Map<string, InvitationLocations>();

export function upsertLocation(
  invId: string,
  userId: string,
  lat: number,
  lng: number,
  name = ""
): LocationEntry {
  if (!storeMap.has(invId)) {
    storeMap.set(invId, { nextNum: 1, users: new Map() });
  }
  const inv = storeMap.get(invId)!;

  let entry = inv.users.get(userId);
  if (!entry) {
    entry = {
      userId,
      userNum: inv.nextNum,
      name,
      lat,
      lng,
      lastSeen: Date.now(),
    };
    inv.nextNum++;
  } else {
    if (name) entry.name = name;
    entry.lat = lat;
    entry.lng = lng;
    entry.lastSeen = Date.now();
  }
  inv.users.set(userId, entry);
  return entry;
}

export function getLocations(invId: string): LocationEntry[] {
  const inv = storeMap.get(invId);
  if (!inv) return [];
  return Array.from(inv.users.values());
}
