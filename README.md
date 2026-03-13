# card-invitation

모바일에서 가볍게 만들고 바로 공유할 수 있는 장난스럽고 감성적인 초대장 웹앱입니다.  
사용자는 `/create`에서 카드 스타일 초대장을 만들고, 생성된 링크를 상대에게 보내고, 상대는 `/accept`에서 여러 가지 인터랙션을 거쳐 수락한 뒤 `/result`에서 완성된 초대장을 확인합니다.

이 프로젝트는 보기에는 가벼운 프론트엔드 앱처럼 보이지만, 실제로는 다음 요소가 함께 묶여 있습니다.

- Next.js App Router 기반 UI
- 서버 측 JSON 파일 저장소
- 업로드 이미지 최적화
- Docker 기반 배포
- Caddy 리버스 프록시
- DuckDNS 연동
- `roulette-physics` 프로젝트와의 동시 운영 고려

작은 개인 프로젝트나 이벤트성 서비스로 바로 운영할 수 있게 설계되어 있고, 데이터베이스 없이 파일 시스템만으로 돌아가는 것이 특징입니다.

## 1. 프로젝트가 하는 일

핵심 흐름은 단순합니다.

1. 초대장 작성자가 `/create`에서 테마, 문구, 날짜, 시간, 장소, 사진을 입력합니다.
2. 서버가 초대장을 저장하고 고유 ID를 발급합니다.
3. 작성자는 `/accept?invite={id}` 링크를 공유합니다.
4. 받는 사람은 수락 페이지에서 장난스러운 "아니요" 인터랙션을 경험합니다.
5. "네"를 누르면 수락 이벤트가 서버에 기록되고 `/result` 페이지로 이동합니다.
6. 결과 페이지에서 실제 초대장 카드 내용을 확인할 수 있습니다.

즉, 이 프로젝트의 핵심은 "초대장 생성" 그 자체보다도 "수락 과정의 재미"와 "공유 가능한 링크 흐름"에 있습니다.

## 2. 주요 기능

### 2.1 카드형 초대장 생성

- 다양한 테마를 좌우 스와이프 또는 버튼으로 전환할 수 있습니다.
- 테마별 기본 이모지, 제목, 포인트 컬러, 대표 이미지가 미리 정의되어 있습니다.
- 날짜/시간/장소를 직접 편집할 수 있습니다.
- 제목 길이에 맞춰 폰트 크기를 자동 조정합니다.

### 2.2 이미지 업로드와 최적화

- 사용자가 사진을 업로드하면 브라우저에서 1차 압축을 수행합니다.
- HEIC/HEIF 파일은 브라우저에서 JPEG로 변환을 시도합니다.
- 서버에서는 `sharp`로 다시 회전 보정과 리사이즈를 적용한 뒤 WebP로 저장합니다.
- 최종 저장 이미지는 `/api/uploads/{filename}` 경로로 제공됩니다.

### 2.3 장난스러운 수락 인터랙션

초대장 생성 시 "거절 버튼"의 동작 모드가 랜덤으로 하나 선택되어 저장됩니다.

- `accept1`: "아니요" 버튼이 도망다님
- `accept2`: "아니요" 버튼이 점점 작아짐
- `accept3`: 폭탄 카운트다운 시작
- `accept4`: 광고를 보면 거절할 수 있다고 유도

이 값은 초대장마다 서버에 저장되므로, 링크를 받은 사용자는 작성자가 만들던 시점에 결정된 모드를 그대로 보게 됩니다.

### 2.4 링크 기반 공유

- 초대장을 생성하면 서버가 ID를 발급합니다.
- 링크 형식은 `/accept?invite={uuid}` 입니다.
- 복사하기와 Web Share API 공유를 모두 지원합니다.

### 2.5 통계/광고 배너 자리

상단 배너는 실제 광고 이미지가 설정되지 않았을 때 "광고주님 자리입니다" 플레이스홀더로 동작합니다.  
이 플레이스홀더를 누르면 광고 문의 모달이 열리고, 서버가 기록한 누적 생성 수/수락 수를 확인할 수 있습니다.

## 3. 화면 흐름

### `/`

- 진입 즉시 `/create`로 리다이렉트됩니다.

### `/create`

- 실제 편집 화면입니다.
- 카드 미리보기를 직접 수정하는 형태로 UI가 구성되어 있습니다.
- 사진을 누르면 이미지 업로드가 열립니다.
- "초대장 보내기"를 누르면 `/api/invitations`에 저장 요청을 보냅니다.

### `/accept?invite={id}`

- 공유 링크를 통해 들어오는 수락 페이지입니다.
- 서버에서 초대장 데이터를 불러와 로컬 상태를 초기화합니다.
- 랜덤으로 저장된 `acceptMode`에 따라 "아니요" 버튼이 다르게 반응합니다.
- "네"를 누르면 수락 이벤트를 기록하고 결과 페이지로 이동합니다.

### `/result?invite={id}`

- 수락 이후 최종 카드 확인 페이지입니다.
- 서버에서 초대장 데이터를 다시 읽어 결과를 렌더링합니다.
- 새 초대장을 만들기 위한 버튼도 제공합니다.

## 4. 기술 스택

| 구분 | 사용 기술 | 설명 |
| --- | --- | --- |
| 프론트엔드 | Next.js 14 App Router | 페이지, API Route, 라우팅을 한 프로젝트에서 처리 |
| UI | React 18 + TypeScript | 클라이언트 인터랙션과 타입 안정성 |
| 스타일 | CSS Modules + 글로벌 CSS | 페이지별 스타일과 공통 스타일 혼합 사용 |
| 이미지 처리(클라이언트) | `heic2any`, Canvas API | HEIC 변환, 업로드 전 리사이즈/압축 |
| 이미지 처리(서버) | `sharp` | 업로드 이미지를 WebP로 최적화 |
| 저장소 | 로컬 파일 시스템(JSON) | DB 없이 `data/` 디렉터리에 저장 |
| 배포 | Docker, Docker Compose | 개발/운영 환경 컨테이너화 |
| 프록시/HTTPS | Caddy | 도메인 라우팅, HTTPS, 로컬 IP 프록시 |
| DNS 갱신 | DuckDNS 컨테이너 | DuckDNS 서브도메인 자동 갱신 |

추가로, 현재 Compose 구성은 이 프로젝트만 단독으로 올리는 구조가 아니라 같은 상위 디렉터리에 있는 `../roulette-physics` 프로젝트도 함께 띄우는 방향으로 작성되어 있습니다.

## 5. 폴더 구조

아래는 이해에 필요한 핵심 파일만 추린 구조입니다.

```text
card-invitation/
├─ app/
│  ├─ create/page.tsx                 # 초대장 작성 화면
│  ├─ accept/page.tsx                 # 초대 수락 화면
│  ├─ accept/layout.tsx               # OG/Twitter 메타데이터
│  ├─ result/page.tsx                 # 수락 후 결과 화면
│  ├─ api/invitations/route.ts        # 초대장 생성 API
│  ├─ api/invitations/[id]/route.ts   # 초대장 조회 API
│  ├─ api/invitations/[id]/accept/route.ts # 수락 기록 API
│  ├─ api/uploads/[filename]/route.ts # 업로드 이미지 제공 API
│  └─ api/stats/route.ts              # 누적 통계 API
├─ components/
│  ├─ InvitationCard.tsx              # 결과 카드 렌더링
│  └─ TopBannerAd.tsx                 # 상단 광고/문의 배너
├─ lib/
│  ├─ themes.ts                       # 초대장 테마 정의
│  ├─ acceptModes.ts                  # 거절 버튼 모드 정의
│  ├─ storage.ts                      # localStorage 저장
│  ├─ types.ts                        # 공통 타입
│  ├─ invite.ts                       # 토큰형 공유 유틸(현재 미사용)
│  └─ server/invitations.ts           # 파일 저장/정리/통계 핵심 로직
├─ public/
│  ├─ theme-images/                   # 기본 테마 이미지
│  └─ uploads/                        # 업로드 이미지 저장 위치
├─ data/                              # JSON 데이터 저장 위치
├─ Dockerfile                         # 프로덕션 이미지
├─ Dockerfile.dev                     # 개발용 이미지
├─ docker-compose.yml                 # 운영 기본 스택
├─ docker-compose.dev.yml             # 개발용 오버레이
├─ Caddyfile                          # 리버스 프록시 설정
└─ README.md
```

## 6. 데이터가 저장되는 방식

이 프로젝트는 별도 DB를 사용하지 않습니다. 대신 파일 시스템에 저장합니다.

### 서버 저장

- `data/invitations.json`
  - 초대장 본문 데이터
  - 생성 시각
  - 수락 시각
  - 수락 횟수
- `data/stats.json`
  - 누적 생성 수
  - 누적 수락 수
- `public/uploads/`
  - 서버 최적화 후 저장된 업로드 이미지

### 클라이언트 저장

- `localStorage`
  - 마지막 초대장 편집 상태
  - 수락 여부
  - 거절 시도 횟수

단, 큰 Base64 이미지를 그대로 `localStorage`에 넣으면 모바일 브라우저 저장 용량 문제를 일으킬 수 있기 때문에, `storage.ts`에서는 데이터 URL 이미지를 영구 저장하지 않고 기본 테마 이미지로 치환해 저장합니다.

## 7. 자동 정리 정책

서버의 `lib/server/invitations.ts`에는 만료 정리 로직이 들어 있습니다.

- 초대장의 `date`가 KST 기준 오늘보다 과거이면 정리 대상이 됩니다.
- 또는 생성 후 30일이 지나면 정리 대상이 됩니다.
- 정리 대상이 되면 관련 업로드 이미지도 함께 삭제를 시도합니다.

즉, 이 서비스는 장기 보관형 아카이브보다는 "이벤트성 초대 링크"에 더 적합합니다.

주의할 점도 있습니다.

- `stats.json`의 누적 통계는 정리 정책과 별개로 계속 누적됩니다.
- 같은 초대 링크에서 "네"를 여러 번 누르면 `acceptedCount`도 그만큼 증가합니다.
- 따라서 `acceptedCount`는 "고유 사용자 수"가 아니라 "수락 클릭 횟수"에 가깝습니다.

## 8. 개발자가 먼저 이해하면 좋은 포인트

### 8.1 테마 시스템

초대장 테마는 [`lib/themes.ts`](./lib/themes.ts)에서 정의합니다.

각 테마는 아래 요소를 가집니다.

- `key`
- `label`
- `title`
- `emojis`
- `titleClassName`
- `accent`
- `defaultImageUrl`

새 테마를 추가할 때는 보통 아래 순서로 작업하면 됩니다.

1. `public/theme-images/`에 기본 이미지를 추가
2. `lib/types.ts`의 `OccasionKey`에 키 추가
3. `lib/themes.ts`에 테마 정의 추가
4. 필요하면 `app/create/page.tsx`의 날짜 자동 계산 로직에 반영

### 8.2 수락 모드 시스템

수락 모드는 [`lib/acceptModes.ts`](./lib/acceptModes.ts)에서 관리합니다.

- 기본 모드 정의
- 표시용 라벨
- 랜덤 선택 함수
- 정규화 함수

새 모드를 추가하려면 단순히 enum 같은 타입만 늘리는 것으로 끝나지 않습니다.  
`app/accept/page.tsx` 내부 인터랙션 분기까지 함께 수정해야 합니다.

### 8.3 업로드 처리 흐름

이미지 업로드는 두 단계입니다.

1. 클라이언트
   - HEIC/HEIF면 변환
   - 긴 변을 1280px 기준으로 줄임
   - WebP 또는 JPEG Data URL 생성
2. 서버
   - MIME 확인
   - `sharp`로 회전 보정
   - 다시 1280px 이내로 리사이즈
   - WebP로 저장
   - `/api/uploads/{filename}` URL로 치환

브라우저와 서버 양쪽에서 최적화를 하는 이유는 모바일 업로드 경험을 부드럽게 유지하면서도, 최종 저장 포맷을 서버 기준으로 통일하기 위해서입니다.

### 8.4 광고 배너

상단 배너는 [`components/TopBannerAd.tsx`](./components/TopBannerAd.tsx)에서 처리합니다.

- `NEXT_PUBLIC_TOP_AD_IMAGE_URL`이 있으면 실제 배너 이미지 표시
- `NEXT_PUBLIC_TOP_AD_LINK_URL`이 있으면 클릭 시 외부 링크 이동
- 값이 없으면 광고 문의 모달형 플레이스홀더 표시

이 모달은 `/api/stats`를 호출해서 누적 생성/수락 수를 보여줍니다.

## 9. 로컬에서 개발하기

### 9.1 권장 환경

- Node.js 20 계열 권장
  - 이유: Dockerfile이 `node:20-alpine`을 사용하고 있음
- npm

### 9.2 설치

```bash
npm install
```

### 9.3 개발 서버 실행

```bash
npm run dev
```

기본적으로 Next.js 개발 서버가 `http://localhost:3000`에서 실행됩니다.

### 9.4 자주 쓰는 명령어

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### 9.5 로컬 개발 시 확인할 점

- `/create`에서 초대장 생성이 되는지
- 이미지 업로드가 잘 되는지
- 생성 후 링크 복사/공유가 되는지
- `/accept?invite=...`에서 수락 모드가 정상 동작하는지
- `/result?invite=...`에서 카드가 정상 렌더링되는지
- `data/`와 `public/uploads/`에 파일이 생기는지

## 10. Docker로 개발하기

이 프로젝트의 Compose 파일은 "운영 기본 스택"과 "개발용 오버레이" 두 층으로 나뉩니다.

- `docker-compose.yml`
  - 운영에 가까운 기본 설정
  - Caddy, DuckDNS, cardinvitation, roulette-physics 포함
- `docker-compose.dev.yml`
  - 개발 시 필요한 설정만 덮어씀
  - `cardinvitation`을 `next dev` 모드로 실행
  - `roulette-physics`도 개발 서버로 실행

### 10.1 가장 실용적인 개발 실행 방법

`card-invitation` 디렉터리에서 아래처럼 실행하면 됩니다.

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d caddy cardinvitation roulette-physics
```

이 명령은 보통 아래 상황에 적합합니다.

- Caddy를 통한 프록시까지 같이 보고 싶을 때
- `roulette-physics`와 함께 개발할 때
- 로컬 네트워크 IP로 접속 테스트를 할 때

### 10.2 카드 초대장 앱만 Docker로 띄우고 싶을 때

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d cardinvitation
```

이 경우 앱은 보통 `http://localhost:3010`으로 접근합니다.

### 10.3 개발용 서비스 동작 방식

- `cardinvitation`
  - `Dockerfile.dev` 사용
  - 소스 전체를 `/app`에 마운트
  - `npm run dev -- -H 0.0.0.0 -p 3000`
  - 호스트 포트 `3010`
- `roulette-physics`
  - 개발 서버를 `5173`으로 노출
- `caddy`
  - 로컬 IP 또는 도메인 접근을 프록시
  - 개발 오버레이에서 `ROULETTE_UPSTREAM=roulette-physics:5173`

## 11. Docker로 운영하기

운영 Compose는 대략 아래 서비스로 구성됩니다.

| 서비스 | 역할 |
| --- | --- |
| `duckdns` | DuckDNS 레코드 자동 갱신 |
| `caddy` | HTTPS, 도메인 라우팅, 리버스 프록시 |
| `cardinvitation` | Next.js 프로덕션 서버 |
| `roulette-physics` | 함께 운영되는 별도 프론트엔드 앱 |

### 11.1 운영 실행

```bash
docker compose up -d --build
```

또는 특정 서비스만 다시 빌드/재시작할 수도 있습니다.

```bash
docker compose up -d --build cardinvitation
docker compose restart caddy
```

### 11.2 운영 이미지 특징

`Dockerfile`은 멀티스테이지 빌드입니다.

- `deps`: 의존성 설치
- `builder`: `next build`
- `runner`: 빌드 결과만 복사해 실행

운영 컨테이너는 `npm run start`로 뜨며, Compose에서는 아래 볼륨을 마운트합니다.

- `./data:/app/data`
- `./public/uploads:/app/public/uploads`

이 두 볼륨이 중요합니다.  
이 마운트가 없으면 컨테이너를 다시 만들 때 초대장 데이터와 업로드 이미지가 사라집니다.

## 12. Caddy와 도메인 구성

`Caddyfile`을 보면 세 가지 흐름이 있습니다.

### 12.1 메인 초대장 도메인

- `{$DOMAIN}`
- HTTPS 응답
- `/api/*`는 `Cache-Control: no-store`
- 정적 자산 일부는 짧은 캐시 허용
- `cardinvitation:3000`으로 프록시

### 12.2 룰렛 프로젝트 도메인

- `{$ROULETTE_DOMAIN}`
- `{$ROULETTE_UPSTREAM}`으로 프록시
- 기본값은 `roulette-physics:80`
- 개발 오버레이에서는 `roulette-physics:5173`

### 12.3 로컬 IP/localhost 프록시

- `http://{$HOST_IP}`
- `http://localhost`
- 둘 다 `cardinvitation:3000`으로 프록시

### 12.4 대기실(임시 차단) 기능

`WAITING_ROOM_PATH`를 특정 경로로 설정하면 해당 경로 접근 시 503을 응답합니다.  
완전한 대기열 시스템은 아니고, 임시 점검/차단용의 간단한 스위치에 가깝습니다.

## 13. 환경 변수

프로젝트 안에는 `.env.example`이 있고, 실제 `.env` 파일도 존재합니다.  
아래는 현재 소스 기준으로 의미가 있는 주요 값들입니다.

| 변수명 | 사용 위치 | 설명 |
| --- | --- | --- |
| `DOMAIN` | `docker-compose.yml`, `Caddyfile` | 메인 도메인 |
| `ROULETTE_DOMAIN` | `docker-compose.yml`, `Caddyfile` | 룰렛 프로젝트 도메인 |
| `HOST_IP` | `docker-compose.yml`, `Caddyfile` | 로컬 IP 프록시 주소 |
| `DEV_HOST_IP` | `docker-compose.dev.yml` | 개발용 Caddy 프록시 IP |
| `ACME_EMAIL` | `docker-compose.yml` | Caddy 인증서 발급용 이메일 |
| `CADDY_HTTP_PORT` | `docker-compose.yml` | Caddy HTTP 포트 |
| `CADDY_HTTPS_PORT` | `docker-compose.yml` | Caddy HTTPS 포트 |
| `WAITING_ROOM_PATH` | `docker-compose.yml`, `Caddyfile` | 임시 503 응답 경로 |
| `DUCKDNS_SUBDOMAINS` | `docker-compose.yml` | DuckDNS 서브도메인 목록 |
| `DUCKDNS_TOKEN` | `docker-compose.yml` | DuckDNS 토큰 |
| `DUCKDNS_PUID` | `docker-compose.yml` | DuckDNS 컨테이너 사용자 ID |
| `DUCKDNS_PGID` | `docker-compose.yml` | DuckDNS 컨테이너 그룹 ID |
| `TZ` | `docker-compose.yml` | 컨테이너 시간대 |
| `NEXT_PUBLIC_TOP_AD_IMAGE_URL` | `TopBannerAd.tsx` | 상단 배너 이미지 URL |
| `NEXT_PUBLIC_TOP_AD_LINK_URL` | `TopBannerAd.tsx` | 상단 배너 클릭 링크 |
| `NEXT_PUBLIC_TOP_AD_ALT` | `TopBannerAd.tsx` | 배너 대체 텍스트 |
| `NEXT_PUBLIC_AD_CONTACT_EMAIL` | `TopBannerAd.tsx` | 광고 문의 이메일 |

### 참고

- 현재 `.env`에 있는 `SITE_URL`은 소스에서 직접 사용되지 않습니다.
- `NEXT_PUBLIC_*` 변수는 클라이언트 코드에 포함되므로, 프로덕션에서는 "빌드 시점" 값 반영 여부를 신경 써야 합니다.

## 14. 주요 API 정리

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `POST` | `/api/invitations` | 초대장 생성 |
| `GET` | `/api/invitations/{id}` | 초대장 조회 |
| `POST` | `/api/invitations/{id}/accept` | 수락 기록 |
| `GET` | `/api/uploads/{filename}` | 업로드 이미지 제공 |
| `GET` | `/api/stats` | 누적 생성/수락 통계 |

### API 응답 특성

- 업로드 이미지는 캐시가 거의 되지 않도록 `no-store` 헤더를 사용합니다.
- 통계 API도 `no-store`로 동작합니다.
- 생성 API는 이미지 포맷 오류나 이미지 최적화 실패를 구분해서 응답하려고 합니다.

## 15. OG 이미지와 공유 미리보기

`app/accept/layout.tsx`에는 수락 페이지 전용 Open Graph/Twitter 메타데이터가 들어 있습니다.  
현재 이미지는 `https://card-invitation.duckdns.org/accept-og-v4.jpg`로 하드코딩되어 있습니다.

즉, 도메인을 바꾸거나 다른 환경에 배포한다면 아래를 같이 점검해야 합니다.

- `DOMAIN`
- 실제 공개 도메인
- `app/accept/layout.tsx`의 OG 이미지 URL

## 16. 실제 개발 방법 추천

처음 이 프로젝트를 다룬다면 아래 순서가 가장 이해하기 쉽습니다.

### 1단계: 순수 Next.js 모드로 먼저 확인

```bash
npm install
npm run dev
```

이 상태에서 먼저 기능 흐름을 파악합니다.

- `/create`에서 생성
- `/accept`에서 수락
- `/result`에서 확인

### 2단계: 저장 구조 확인

- `data/invitations.json`
- `data/stats.json`
- `public/uploads/`

초대장 하나를 만들어 보면 저장 구조를 바로 이해할 수 있습니다.

### 3단계: 테마/수락 모드 확장

- 테마 수정: `lib/themes.ts`
- 수락 인터랙션 수정: `app/accept/page.tsx`
- 결과 카드 수정: `components/InvitationCard.tsx`

### 4단계: Docker/Caddy로 운영 흐름까지 확인

운영 목적이라면 그다음에 Compose와 Caddy를 보는 편이 좋습니다.  
처음부터 Docker부터 보면 이 프로젝트가 단독 앱이 아니라 `roulette-physics`까지 같이 고려된다는 점 때문에 구조가 더 복잡하게 느껴질 수 있습니다.

## 17. 운영 시 주의사항

### 파일 저장 기반 구조라는 점

이 앱은 데이터베이스 대신 JSON 파일을 사용합니다.  
단일 서버, 소규모 트래픽, 이벤트성 운영에는 간단하고 빠르지만, 아래 상황에는 한계가 있습니다.

- 다중 인스턴스 운영
- 강한 동시성 보장
- 정교한 검색/분석
- 사용자 인증/권한 관리

### 초대장 만료 정책이 있다는 점

초대장과 업로드 이미지는 영구 보관되지 않습니다.  
서비스 목적이 "추억 아카이브"라면 만료 정책을 조정해야 합니다.

### 광고 배너 환경 변수는 빌드 시점 영향이 있다는 점

`NEXT_PUBLIC_*` 값은 운영 빌드에서 런타임 주입처럼 동작하지 않을 수 있습니다.  
광고 배너를 실제로 운영할 계획이라면 Docker 빌드 시점 환경 변수 전략을 명확히 가져가는 것이 좋습니다.

### `roulette-physics` 의존성이 Compose에 들어 있다는 점

운영 Compose는 이 앱만 독립 배포하는 형태가 아닙니다.  
`../roulette-physics`가 없으면 기본 Compose는 바로 사용할 수 없습니다.

## 18. 개선 아이디어

현재 구조를 유지하면서 확장한다면 다음이 자연스러운 다음 단계입니다.

- `.env.example`에 광고 관련 `NEXT_PUBLIC_*` 항목 추가
- 프로덕션 빌드용 광고 배너 환경 변수 주입 방식 정리
- `invitations.json` 저장을 원자적으로 바꾸기
- 초대 링크 만료 여부를 명시적으로 사용자에게 보여주기
- 관리자용 간단한 통계 대시보드 추가
- 파일 기반 저장소를 SQLite/PostgreSQL로 교체
- OG 이미지도 초대장별 동적 생성으로 확장

## 19. 한 줄 요약

`card-invitation`은 "모바일 감성 초대장 생성 + 장난스러운 수락 경험 + 파일 기반 간단 운영"에 초점을 맞춘 Next.js 프로젝트입니다.  
빠르게 만들고 배포하기 좋고, 구조도 단순한 편이지만, 운영 범위를 넓히려면 저장소와 배포 전략을 조금 더 정교하게 다듬는 것이 다음 과제입니다.
