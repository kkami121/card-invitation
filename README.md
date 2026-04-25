# card-invitation

> 모바일에서 바로 만들고 공유하는 감성 초대장 웹앱

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript) ![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

초대장 작성 → 링크 공유 → 장난스러운 수락 과정 → 결과 확인의 흐름으로 동작하는 풀스택 Next.js 앱입니다.  
데이터베이스 없이 파일 시스템만으로 운영되며, Docker + Caddy 기반으로 배포됩니다.

---

## 목차

1. [프로젝트가 하는 일](#1-프로젝트가-하는-일)
2. [빠른 시작](#2-빠른-시작)
3. [주요 기능](#3-주요-기능)
4. [화면 흐름](#4-화면-흐름)
5. [기술 스택](#5-기술-스택)
6. [폴더 구조](#6-폴더-구조)
7. [데이터 저장 방식](#7-데이터-저장-방식)
8. [자동 정리 정책](#8-자동-정리-정책)
9. [다국어 지원 (i18n)](#9-다국어-지원-i18n)
10. [개발자가 먼저 이해하면 좋은 포인트](#10-개발자가-먼저-이해하면-좋은-포인트)
11. [로컬에서 개발하기](#11-로컬에서-개발하기)
12. [Docker로 개발하기](#12-docker로-개발하기)
13. [Docker로 운영하기](#13-docker로-운영하기)
14. [Caddy와 도메인 구성](#14-caddy와-도메인-구성)
15. [환경 변수](#15-환경-변수)
16. [주요 API](#16-주요-api)
17. [OG 이미지와 공유 미리보기](#17-og-이미지와-공유-미리보기)
18. [운영 시 주의사항](#18-운영-시-주의사항)
19. [개선 아이디어](#19-개선-아이디어)

---

## 1. 프로젝트가 하는 일

핵심 흐름은 단순합니다.

1. 초대장 작성자가 `/create`에서 테마, 문구, 날짜, 시간, 장소, 사진을 입력합니다.
2. 서버가 초대장을 저장하고 고유 ID를 발급합니다.
3. 작성자는 `/accept?invite={id}` 링크를 공유합니다.
4. 받는 사람은 수락 페이지에서 장난스러운 "아니요" 인터랙션을 경험합니다.
5. "네"를 누르면 수락 이벤트가 서버에 기록되고 `/result` 페이지로 이동합니다.
6. 결과 페이지에서 완성된 초대장 카드를 확인합니다.

이 프로젝트의 핵심은 "초대장 생성" 그 자체보다도 **"수락 과정의 재미"** 와 **"공유 가능한 링크 흐름"** 에 있습니다.

---

## 2. 빠른 시작

### 요구사항

- Node.js 20 이상
- npm

### 로컬 실행

```bash
git clone <repository-url>
cd card-invitation
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열고 `/create`로 이동하면 바로 시작할 수 있습니다.

> **초대장을 하나 만들어 보면** `data/invitations.json`과 `public/uploads/`에 파일이 생기며 전체 흐름을 빠르게 이해할 수 있습니다.

---

## 3. 주요 기능

### 3.1 카드형 초대장 생성

- 11가지 테마를 좌우 스와이프 또는 버튼으로 전환합니다.
- 테마별 기본 이모지, 제목, 포인트 컬러, 대표 이미지가 미리 정의되어 있습니다.
- 날짜·시간·장소를 직접 편집할 수 있습니다.
- 제목 길이에 맞춰 폰트 크기를 자동 조정합니다.

**지원 테마 목록**

| 키 | 라벨 |
| --- | --- |
| `promise` | 친구 약속 |
| `weekend-date` | 주말 데이트 |
| `birthday` | 생일 |
| `childrens-day` | 어린이날 |
| `samgyeopsal-day` | 삼겹살 데이 |
| `white-day` | 화이트 데이 |
| `valentine` | 발렌타인 데이 |
| `christmas` | 크리스마스 |
| `pepero` | 빼빼로 데이 |
| `lunar-new-year` | 설날 |
| `chuseok` | 추석 |

### 3.2 이미지 업로드와 최적화

이미지는 클라이언트와 서버 양 단계에서 최적화됩니다.

**클라이언트 (업로드 전)**
- HEIC/HEIF → JPEG 변환 (`heic2any`)
- 긴 변 기준 1280px 이하로 리사이즈
- Canvas WebP 인코딩 (quality 0.82)

**서버 (저장 시)**
- MIME 타입 검증
- EXIF 회전 보정
- 1280px 이하 리사이즈
- WebP 저장 (quality 0.78, `sharp`)
- `/api/uploads/{filename}` URL로 치환

### 3.3 장난스러운 수락 인터랙션

"아니요" 버튼의 동작 모드는 4가지가 정의되어 있습니다.

| 키 | 동작 |
| --- | --- |
| `accept1` | "아니요" 버튼이 도망다님 |
| `accept2` | "아니요" 버튼이 점점 작아짐 |
| `accept3` | 폭탄 카운트다운 |
| `accept4` | 광고를 보면 거절할 수 있다고 유도 |

> **현재 상태:** `pickRandomAcceptMode()`는 항상 `accept1`을 반환하도록 고정되어 있습니다.  
> 나머지 모드로 전환하려면 `lib/acceptModes.ts`의 주석 처리된 랜덤 로직을 활성화하고,  
> `app/accept/page.tsx`에서 각 모드별 인터랙션 분기가 완전히 구현되어 있는지 확인해야 합니다.

### 3.4 링크 기반 공유

- 생성 즉시 `/accept?invite={uuid}` 형식의 공유 링크가 발급됩니다.
- 링크 복사와 Web Share API를 모두 지원합니다.

### 3.5 광고 배너 / 통계

- `NEXT_PUBLIC_TOP_AD_IMAGE_URL`이 설정된 경우 실제 배너 이미지를 표시합니다.
- 설정이 없으면 광고 문의 모달이 있는 플레이스홀더로 동작합니다.
- 모달에서는 `/api/stats`를 통해 누적 생성 수·수락 수를 확인할 수 있습니다.

---

## 4. 화면 흐름

| 경로 | 설명 |
| --- | --- |
| `/` | `/create`로 즉시 리다이렉트 |
| `/create` | 초대장 작성 화면. 카드 미리보기를 직접 편집하는 구조 |
| `/accept?invite={id}` | 수락 페이지. `acceptMode`에 따라 "아니요" 버튼이 다르게 반응 |
| `/result?invite={id}` | 수락 후 최종 카드 확인 페이지. 새 초대장 만들기 버튼 포함 |

---

## 5. 기술 스택

| 구분 | 기술 | 설명 |
| --- | --- | --- |
| 프레임워크 | Next.js 14 App Router | 페이지, API Route, 미들웨어를 한 프로젝트에서 처리 |
| UI | React 18 + TypeScript 5.7 | 컴포넌트 기반 UI, 엄격한 타입 안전성 |
| 스타일 | CSS Modules + 전역 CSS | 페이지별 스코프 스타일 + 공통 스타일 |
| 이미지 (클라이언트) | `heic2any`, Canvas API | HEIC 변환, 업로드 전 리사이즈·압축 |
| 이미지 (서버) | `sharp` | EXIF 회전 보정, WebP 최적화 저장 |
| 다국어 | Context API + Middleware | 11개 언어, 브라우저·IP 기반 자동 감지 |
| 저장소 | 로컬 파일 시스템 (JSON) | DB 없이 `data/` 디렉터리에 저장 |
| 배포 | Docker, Docker Compose | 개발·운영 환경 컨테이너화 |
| 프록시 / HTTPS | Caddy | 도메인 라우팅, 자동 HTTPS, 압축(gzip·zstd) |
| DNS | DuckDNS 컨테이너 | 서브도메인 자동 갱신 |

---

## 6. 폴더 구조

이해에 필요한 핵심 파일만 추린 구조입니다.

```text
card-invitation/
├─ app/
│  ├─ create/page.tsx                      # 초대장 작성 화면
│  ├─ accept/page.tsx                      # 초대 수락 화면
│  ├─ accept/layout.tsx                    # OG / Twitter 메타데이터
│  ├─ result/page.tsx                      # 수락 후 결과 화면
│  ├─ api/
│  │  ├─ invitations/route.ts              # POST: 초대장 생성
│  │  ├─ invitations/[id]/route.ts         # GET: 초대장 조회
│  │  ├─ invitations/[id]/accept/route.ts  # POST: 수락 기록
│  │  ├─ uploads/[filename]/route.ts       # GET: 업로드 이미지 제공
│  │  └─ stats/route.ts                   # GET: 누적 통계
│  ├─ layout.tsx                           # 루트 레이아웃 (LocaleProvider)
│  └─ globals.css                          # 전역 스타일
├─ components/
│  ├─ InvitationCard.tsx                   # 결과 카드 렌더링
│  └─ TopBannerAd.tsx                      # 상단 광고 / 문의 배너
├─ lib/
│  ├─ types.ts                             # 공통 타입 정의
│  ├─ themes.ts                            # 11가지 초대장 테마 정의
│  ├─ acceptModes.ts                       # 거절 버튼 모드 정의
│  ├─ storage.ts                           # localStorage 래퍼
│  ├─ localeContext.tsx                    # i18n Context (useT, useLocale)
│  ├─ translations/index.ts               # 11개 언어 번역 데이터
│  └─ server/invitations.ts               # 파일 저장 / 정리 / 통계 핵심 로직
├─ middleware.ts                           # 언어 자동 감지 (Accept-Language → IP)
├─ public/
│  ├─ theme-images/                        # 기본 테마 이미지
│  └─ uploads/                            # 업로드 이미지 저장 위치
├─ data/                                  # JSON 데이터 저장 위치
├─ next.config.mjs                        # standalone 빌드 설정
├─ Dockerfile                             # 프로덕션 이미지 (멀티스테이지)
├─ Dockerfile.dev                         # 개발용 이미지
├─ docker-compose.yml                     # 운영 기본 스택
├─ docker-compose.dev.yml                 # 개발용 오버레이
├─ Caddyfile                              # 리버스 프록시 설정
└─ .env.example                           # 환경 변수 예시
```

---

## 7. 데이터 저장 방식

이 프로젝트는 별도 데이터베이스를 사용하지 않습니다.

### 서버 (파일 시스템)

| 경로 | 내용 |
| --- | --- |
| `data/invitations.json` | 초대장 본문, 생성/수락 시각, 수락 횟수 |
| `data/stats.json` | 누적 생성 수·수락 수 |
| `public/uploads/` | 서버 최적화 후 저장된 WebP 이미지 |

### 클라이언트 (localStorage)

| 키 | 내용 |
| --- | --- |
| 편집 상태 | 마지막 초대장 초안 |
| 수락 여부 | 링크 수락 상태 |
| 거절 횟수 | "아니요" 클릭 횟수 |

> **localStorage 용량 주의:** 모바일 브라우저의 저장 용량 한계를 고려해 `storage.ts`는  
> Base64 이미지 데이터를 직접 저장하지 않고 기본 테마 이미지 URL로 치환합니다.

---

## 8. 자동 정리 정책

`lib/server/invitations.ts`에는 만료된 초대장을 자동으로 삭제하는 로직이 있습니다.

- 초대장의 `date`가 KST 기준 오늘 이전이면 정리 대상
- 생성 후 30일이 경과하면 정리 대상
- 정리 시 관련 업로드 이미지도 함께 삭제

따라서 이 서비스는 **장기 아카이브보다 이벤트성 초대 링크**에 더 적합합니다.

**주의사항**

- `stats.json`의 누적 통계는 정리 정책과 무관하게 계속 누적됩니다.
- 같은 링크에서 "네"를 여러 번 누르면 `acceptedCount`도 그만큼 증가합니다.
- `acceptedCount`는 "고유 사용자 수"가 아닌 "수락 클릭 횟수"에 가깝습니다.

---

## 9. 다국어 지원 (i18n)

### 지원 언어

한국어, 영어, 일본어, 중국어, 인도네시아어, 스페인어, 아랍어, 프랑스어, 러시아어, 포르투갈어, 독일어 (11개)

### 언어 감지 흐름

```
요청 진입
  └─ NEXT_LOCALE 쿠키가 있으면 → 그대로 사용
  └─ 없으면 → Accept-Language 헤더로 감지
       └─ 판단 불가 → IP로 국가 조회 (api.country.is, 타임아웃 500ms)
            └─ 실패 → 기본값: 한국어(ko)
```

### 구현 구조

| 파일 | 역할 |
| --- | --- |
| `middleware.ts` | 모든 페이지 요청에서 언어 감지 후 `NEXT_LOCALE` 쿠키 설정 |
| `lib/translations/index.ts` | 11개 언어 번역 데이터 (`getTranslations(locale)`) |
| `lib/localeContext.tsx` | `LocaleProvider`, `useT()`, `useLocale()` 훅 제공 |
| `app/layout.tsx` | 쿠키에서 locale을 읽어 `LocaleProvider`에 주입 |

쿠키 유효기간은 **30일**이며, `httpOnly: false`로 설정되어 클라이언트에서도 읽을 수 있습니다.

---

## 10. 개발자가 먼저 이해하면 좋은 포인트

### 10.1 테마 시스템

테마는 [`lib/themes.ts`](./lib/themes.ts)에서 정의합니다. 각 테마는 아래 필드를 가집니다.

```ts
{
  key: OccasionKey;
  label: string;      // UI 표시명
  title: string;      // 카드 기본 제목
  emojis: string[];   // 선택 가능한 이모지 목록
  titleClassName: string;
  accent: string;     // 포인트 컬러 (HEX)
  defaultImageUrl: string;
}
```

**새 테마 추가 순서**

1. `public/theme-images/`에 기본 이미지 추가
2. `lib/types.ts`의 `OccasionKey`에 키 추가
3. `lib/themes.ts`에 테마 객체 추가
4. 필요하면 `app/create/page.tsx`의 날짜 자동 계산 로직에 반영

### 10.2 수락 모드 시스템

모드는 [`lib/acceptModes.ts`](./lib/acceptModes.ts)에서 관리합니다.

> **현재 `pickRandomAcceptMode()`는 항상 `"accept1"`을 반환합니다.**  
> 다른 모드를 활성화하려면 주석 처리된 랜덤 로직을 해제하고,  
> `app/accept/page.tsx` 내부의 모드별 인터랙션 분기가 완전히 구현되어 있는지 확인해야 합니다.

**새 모드 추가 시 수정 필요 파일**

- `lib/types.ts` — `AcceptModeKey` 타입
- `lib/acceptModes.ts` — 라벨, 랜덤 선택, 정규화 함수
- `app/accept/page.tsx` — 실제 인터랙션 분기 로직

### 10.3 이미지 업로드 처리 흐름

```
[클라이언트]
  1. HEIC/HEIF → JPEG 변환 (heic2any)
  2. Canvas로 1280px 리사이즈 + WebP 인코딩
  3. Data URL → POST /api/invitations 에 포함

[서버]
  1. MIME 타입 검증
  2. sharp로 EXIF 회전 보정
  3. 1280px 이하 리사이즈
  4. WebP 저장 → public/uploads/
  5. imageUrl을 /api/uploads/{filename} URL로 치환
```

### 10.4 Next.js Standalone 빌드

`next.config.mjs`에 `output: 'standalone'`이 설정되어 있습니다.  
이로 인해 Dockerfile의 최종 실행 이미지는 `npm run start`가 아닌 `node server.js`로 구동됩니다.  
`node_modules` 전체를 복사하지 않아 Docker 이미지 크기가 대폭 줄어듭니다.

### 10.5 광고 배너

[`components/TopBannerAd.tsx`](./components/TopBannerAd.tsx)에서 처리합니다.

- `NEXT_PUBLIC_TOP_AD_IMAGE_URL` 있음 → 실제 배너 이미지
- `NEXT_PUBLIC_TOP_AD_LINK_URL` 있음 → 클릭 시 외부 링크
- 값 없음 → 광고 문의 모달 플레이스홀더

> `NEXT_PUBLIC_*` 변수는 **빌드 시점**에 번들에 포함됩니다.  
> 런타임 환경 변수처럼 동작하지 않으므로, 광고를 실제로 운영할 계획이라면 Docker 빌드 시점에 값을 주입해야 합니다.

---

## 11. 로컬에서 개발하기

### 11.1 설치 및 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

### 11.2 자주 쓰는 명령어

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 (빌드 후)
npm run lint       # ESLint 검사
```

### 11.3 로컬 개발 체크리스트

- [ ] `/create`에서 초대장 생성이 되는지
- [ ] 이미지 업로드 및 최적화가 동작하는지
- [ ] 생성 후 링크 복사/공유가 되는지
- [ ] `/accept?invite=...`에서 수락 모드가 정상 동작하는지
- [ ] `/result?invite=...`에서 카드가 정상 렌더링되는지
- [ ] `data/`와 `public/uploads/`에 파일이 생기는지

---

## 12. Docker로 개발하기

Compose 파일은 **운영 기본 스택**과 **개발용 오버레이** 두 층으로 나뉩니다.

| 파일 | 설명 |
| --- | --- |
| `docker-compose.yml` | 운영에 가까운 기본 설정 (Caddy, DuckDNS, 앱 3개) |
| `docker-compose.dev.yml` | 개발 서버 실행, 소스 볼륨 마운트, 핫리로드 |

### 12.1 개발 서버 실행 (권장)

```bash
# 전체 스택 (Caddy 프록시 포함)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d caddy cardinvitation roulette-physics pic-moment

# card-invitation만 띄울 때
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d cardinvitation
```

`cardinvitation`은 기본적으로 `http://localhost:3010`에서 접근합니다.

### 12.2 개발 환경 서비스 구성

| 서비스 | 이미지 | 설명 |
| --- | --- | --- |
| `cardinvitation` | `Dockerfile.dev` | 소스 전체 마운트, `npm run dev`, 포트 3010 |
| `roulette-physics` | `Dockerfile` (dev) | Vite 개발 서버, 포트 5173 |
| `pic-moment` | `Dockerfile.dev` | Next.js 개발 서버, 포트 3020 |
| `caddy` | `caddy:2-alpine` | `ROULETTE_UPSTREAM=roulette-physics:5173`으로 오버라이드 |

---

## 13. Docker로 운영하기

### 13.1 운영 서비스 구성

| 서비스 | 역할 |
| --- | --- |
| `duckdns` | DuckDNS 서브도메인 자동 갱신 |
| `caddy` | HTTPS, 도메인 라우팅, gzip/zstd 압축, 리버스 프록시 |
| `cardinvitation` | Next.js 프로덕션 서버 (standalone) |
| `roulette-physics` | 함께 운영되는 별도 프론트엔드 앱 |
| `pic-moment` | 함께 운영되는 별도 Next.js 앱 |

> `roulette-physics`는 `../roulette-physics`, `pic-moment`는 `../pic-moment`에서 빌드합니다.  
> 두 프로젝트가 없으면 `docker compose up`이 실패합니다.

### 13.2 운영 실행

```bash
# 전체 스택 빌드 후 실행
docker compose up -d --build

# 특정 서비스만 재빌드
docker compose up -d --build cardinvitation

# Caddy 재시작
docker compose restart caddy
```

### 13.3 운영 이미지 특징

`Dockerfile`은 3단계 멀티스테이지 빌드입니다.

| 스테이지 | 역할 |
| --- | --- |
| `deps` | 의존성 설치 (`npm ci`) |
| `builder` | `next build` 실행 |
| `runner` | standalone 결과물만 복사 → `node server.js` 실행 |

### 13.4 필수 볼륨 마운트

운영 컨테이너에는 아래 두 볼륨이 반드시 마운트되어야 합니다.  
마운트가 없으면 컨테이너를 재생성할 때 **초대장 데이터와 업로드 이미지가 모두 삭제**됩니다.

```yaml
volumes:
  - ./data:/app/data
  - ./public/uploads:/app/public/uploads
```

---

## 14. Caddy와 도메인 구성

`Caddyfile`은 세 가지 도메인 흐름을 처리합니다.

### 14.1 메인 초대장 도메인 (`{$DOMAIN}`)

- HTTPS 자동 발급
- `/api/*` → `Cache-Control: no-store`
- `/_next/static/*` → `Cache-Control: public, max-age=31536000, immutable`
- `/theme-images/*` → `Cache-Control: public, max-age=2592000`
- `cardinvitation:3000`으로 리버스 프록시

### 14.2 룰렛 도메인 (`{$ROULETTE_DOMAIN}`)

- `{$ROULETTE_UPSTREAM:roulette-physics:80}`으로 프록시
- 개발 오버레이에서는 `roulette-physics:5173`으로 오버라이드

### 14.3 Pic Moment 도메인 (`{$PIC_MOMENT_DOMAIN}`)

- `pic-moment:3000`으로 리버스 프록시

### 14.4 로컬 접근

- `http://{$HOST_IP}` 및 `http://localhost` → `cardinvitation:3000`으로 프록시

### 14.5 대기실 (임시 차단)

`WAITING_ROOM_PATH`를 특정 경로로 설정하면 해당 경로 접근 시 503을 반환합니다.  
완전한 대기열이 아닌 **임시 점검용 간단한 스위치**입니다.  
기본값 `/__waiting_disabled__`는 실질적으로 비활성화 상태입니다.

---

## 15. 환경 변수

`.env.example`을 복사해 `.env`로 사용하세요.

```bash
cp .env.example .env
```

### 15.1 도메인 / 네트워크

| 변수명 | 기본값 | 설명 |
| --- | --- | --- |
| `DOMAIN` | `card-invitation.duckdns.org` | 메인 초대장 도메인 |
| `ROULETTE_DOMAIN` | `spin-roulette.duckdns.org` | 룰렛 프로젝트 도메인 |
| `PIC_MOMENT_DOMAIN` | `pic-moment.duckdns.org` | Pic Moment 프로젝트 도메인 |
| `HOST_IP` | `127.0.0.1` | 로컬 IP 프록시 주소 |
| `ACME_EMAIL` | (필수) | Caddy HTTPS 인증서 발급용 이메일 |

### 15.2 Caddy 포트

| 변수명 | 기본값 | 설명 |
| --- | --- | --- |
| `CADDY_HTTP_PORT` | `80` | Caddy HTTP 포트 |
| `CADDY_HTTPS_PORT` | `443` | Caddy HTTPS 포트 |
| `WAITING_ROOM_PATH` | `/__waiting_disabled__` | 임시 503 응답 경로 |

### 15.3 직접 접근 포트

| 변수명 | 기본값 | 설명 |
| --- | --- | --- |
| `CARDINVITATION_DIRECT_PORT` | `3010` | cardinvitation 직접 접근 포트 |
| `ROULETTE_DIRECT_PORT` | `5173` | roulette-physics 직접 접근 포트 |
| `PIC_MOMENT_DIRECT_PORT` | `3020` | pic-moment 직접 접근 포트 |

### 15.4 DuckDNS

| 변수명 | 기본값 | 설명 |
| --- | --- | --- |
| `DUCKDNS_SUBDOMAINS` | `card-invitation,spin-roulette,pic-moment` | 갱신할 서브도메인 목록 |
| `DUCKDNS_TOKEN` | (필수) | DuckDNS 인증 토큰 |
| `DUCKDNS_PUID` | `1000` | 컨테이너 사용자 ID |
| `DUCKDNS_PGID` | `1000` | 컨테이너 그룹 ID |
| `TZ` | `Asia/Seoul` | 컨테이너 시간대 |

### 15.5 클라이언트 공개 변수 (NEXT_PUBLIC)

| 변수명 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_TOP_AD_IMAGE_URL` | 상단 배너 이미지 URL |
| `NEXT_PUBLIC_TOP_AD_LINK_URL` | 배너 클릭 시 이동할 링크 |
| `NEXT_PUBLIC_TOP_AD_ALT` | 배너 대체 텍스트 |
| `NEXT_PUBLIC_AD_CONTACT_EMAIL` | 광고 문의 이메일 |

> `NEXT_PUBLIC_*` 변수는 **빌드 시점에 번들에 포함**됩니다.  
> Docker 환경에서는 `docker compose up --build` 시 `.env` 값이 반영됩니다.

---

## 16. 주요 API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `POST` | `/api/invitations` | 초대장 생성 (이미지 포함 JSON) |
| `GET` | `/api/invitations/{id}` | 초대장 조회 |
| `POST` | `/api/invitations/{id}/accept` | 수락 이벤트 기록 |
| `GET` | `/api/uploads/{filename}` | 업로드 이미지 제공 |
| `GET` | `/api/stats` | 누적 생성·수락 통계 |

**캐시 정책**

- `/api/*` 전체 → `Cache-Control: no-store` (Caddy 레벨)
- `/api/uploads/{filename}` → 이미지 파일은 변경 시 파일명이 달라지므로 사실상 캐시 무효화

---

## 17. OG 이미지와 공유 미리보기

`app/accept/layout.tsx`에 수락 페이지 전용 Open Graph / Twitter 메타데이터가 설정되어 있습니다.

> **주의:** OG 이미지 URL이 `https://card-invitation.duckdns.org/accept-og-v4.jpg`로 **하드코딩**되어 있습니다.  
> 도메인을 변경하거나 다른 환경에 배포할 경우 반드시 이 파일을 함께 수정해야 합니다.

**배포 시 점검 목록**

- `.env`의 `DOMAIN` 값
- `app/accept/layout.tsx`의 OG 이미지 URL
- `public/accept-og-v4.jpg` 파일 존재 여부

---

## 18. 운영 시 주의사항

### 파일 저장 기반 구조

JSON 파일 저장소는 단일 서버·소규모 트래픽·이벤트성 운영에 적합합니다.  
아래 상황에서는 한계가 있습니다.

- 다중 인스턴스 동시 운영 (파일 동시 쓰기 충돌)
- 강한 동시성 보장이 필요한 경우
- 정교한 검색·분석·집계
- 사용자 인증·권한 관리

### 데이터 영속성

- **운영 볼륨(`./data`, `./public/uploads`)** 이 마운트되어 있지 않으면 컨테이너 재생성 시 데이터가 사라집니다.
- 정기적인 백업을 권장합니다.

### 초대장 만료 정책

초대장과 업로드 이미지는 영구 보관되지 않습니다.  
"추억 아카이브" 용도라면 `lib/server/invitations.ts`의 만료 정책을 조정해야 합니다.

### 동반 프로젝트 의존성

기본 `docker-compose.yml`은 `../roulette-physics`와 `../pic-moment` 프로젝트가 존재해야 빌드됩니다.  
`card-invitation`만 독립 배포하려면 Compose 파일에서 해당 서비스와 `caddy`의 `depends_on`을 제거해야 합니다.

---

## 19. 개선 아이디어

현재 구조를 유지하면서 자연스럽게 이어갈 수 있는 다음 단계들입니다.

| 우선순위 | 항목 | 설명 |
| --- | --- | --- |
| 높음 | OG 이미지 URL 환경 변수화 | `app/accept/layout.tsx`의 하드코딩 제거 |
| 높음 | 수락 모드 랜덤 활성화 | `accept2`, `accept3`, `accept4` 인터랙션 완성 후 랜덤 선택 |
| 높음 | `lib/invite.ts` 제거 또는 활성화 | 현재 미사용 dead code — 용도를 확정하거나 삭제 |
| 중간 | `invitations.json` 원자적 쓰기 | 동시 요청 시 파일 손상 방지 |
| 중간 | 만료 안내 UI | 링크 만료 여부를 사용자에게 명시적으로 표시 |
| 중간 | `NEXT_PUBLIC_*` 빌드 전략 문서화 | 광고 배너 실운영을 위한 환경 변수 주입 가이드 |
| 낮음 | 관리자 통계 대시보드 | 간단한 생성·수락 현황 확인 UI |
| 낮음 | SQLite 또는 PostgreSQL 전환 | 파일 저장소 대체, 동시성 문제 해결 |
| 낮음 | 초대장별 동적 OG 이미지 생성 | `next/og`를 활용한 카드 미리보기 이미지 자동 생성 |
| 낮음 | card-invitation 단독 Compose 파일 | 동반 프로젝트 없이도 독립 배포 가능하도록 |

---

## 한 줄 요약

`card-invitation`은 **모바일 감성 초대장 생성 + 장난스러운 수락 경험 + 파일 기반 간단 운영**에 초점을 맞춘 Next.js 풀스택 프로젝트입니다.  
빠르게 만들고 배포하기 좋으며, 운영 범위를 넓히려면 저장소 전략과 OG 이미지 관리를 우선적으로 다듬는 것이 다음 과제입니다.
