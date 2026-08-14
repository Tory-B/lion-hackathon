# suyo · 프론트엔드

창업 아이템을 입력하면 서울 25개 자치구 공공데이터 기반 백분위 점수로 시장·고객·경쟁 3개 레이어를 진단하고, 데이터로 확인 안 되는 부분은 검증 질문지로 만들어주는 서비스의 프론트엔드입니다.

React 19 + Vite + Tailwind CSS v4.

## 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

```bash
npm run build    # 프로덕션 빌드
npm run lint      # oxlint
```

## Mock ↔ 실제 백엔드 전환

기본은 **mock**입니다. 실제 배포 서버(`https://api.suyo-deploy.shop`)로 붙이려면:

```bash
cp .env.example .env.local   # 없다면
```

`.env.local`에서 `VITE_USE_REAL_API=true`로 바꾸고 `npm run dev`를 재시작하세요.

- 배포 서버는 로컬 개발 origin(`localhost:5173`)을 CORS로 허용하지 않아서, `vite.config.js`의 개발서버 프록시(`/api` → `https://api.suyo-deploy.shop`, Origin 헤더 제거)를 거쳐 호출합니다. **`npm run dev` 로컬 개발 환경 전용**이며, 실제 배포 시에는 배포 서버 CORS 설정에 프론트 도메인을 추가하거나 별도 프록시가 필요합니다.
- 로그인은 없고 `X-Session-Id`를 브라우저에 UUID로 발급해 세션을 구분합니다 (`src/lib/session.js`).
- 실제 연동은 2026-08-14에 curl과 Playwright로 전체 플로우(업종 검색·진단 생성·결제·질문지 생성까지) 검증 완료했습니다. 문제없이 동작합니다.

## 지금 상태 (mock일 때)

- 데이터는 시드 기반 랜덤값입니다. 새로고침해도 같은 입력이면 같은 결과가 나오지만 실제 서울시 데이터는 아닙니다.
- 결제는 실제로 이루어지지 않는 목업입니다.
- mock의 화면·데이터 구조는 [`suyo_BE`](https://github.com/mooyoung2/suyo_BE) 백엔드 레포의 실제 API 응답 형태(DTO, 에러 코드, 접근 레벨 게이팅, 점수 계산식)를 그대로 따라 만들었습니다.

## 화면 흐름

```
랜딩(/) → 온보딩 모달(업종·지역·문제 입력)
  → 진단 중(/analyze/:id/progress)
  → 진단 결과(/analyze/:id/result)  ─ FREE: 총점만 / PAID: 레이어 상세
       ├─ 결제(/analyze/:id/payment)
       ├─ 질문지 만들기(/analyze/:id/questionnaire)
       └─ 리포트(/analyze/:id/report)
대시보드(/home) — 내가 진단한 아이템 목록
설문지 목록(/questionnaires) · 리포트 목록(/reports) · 아이템 비교(/compare, BETA)
```

검증 결과를 다시 입력해서 점수를 갱신하는 화면은 없습니다 — 실제 서비스 범위가 "질문지 생성까지"로 확정되어 있기 때문입니다 (백엔드 팀 API 명세서 기준).

## 디렉터리 구조

```
src/
  api/
    index.js            VITE_USE_REAL_API에 따라 mockApi/realApi 중 골라 내보냄
    mockApi.js           mock 구현 (실제 API 엔드포인트와 1:1 대응)
    realApi.js            실제 fetch 구현
  lib/
    diagnosisEngine.js   진단 점수 mock 생성 (실제 DiagnosisScorer.java 배점 그대로)
    riskGrader.js        점수 → LOW/MEDIUM/HIGH 등급 (실제 RiskGrader.java 임계값 그대로)
    factorWeights.js     factor 이름 → 배점 매핑 (API에 없는 값이라 화면용으로 하드코딩)
    localMeta.js         지역·업종명·결제상태·질문지 색인을 브라우저에만 저장 (API에 없는 것들)
    questionnaireEngine.js  질문지 문항 mock 생성 (mock 전용)
    session.js            X-Session-Id 발급/보관
  data/                  업종·자치구 목록 (mock용 + 자치구 드롭다운 공용)
  context/AppContext.jsx  화면에서 쓰는 API 훅
  components/            공통 UI, 레이아웃(모바일 햄버거 메뉴 포함), 온보딩 모달, 에러 상태
  pages/                  화면별 컴포넌트
```

## 알아둘 점 (실제 API 기준)

- 진단·목록 응답에는 지역·업종명, 결제 상태, 종합 리스크 등급 필드가 없습니다 (`itemName`/`totalScore`/`verdict`만). `localMeta.js`가 분석 생성·결제 시점에 이 값들을 브라우저에 따로 저장해뒀다가 화면에서 조합합니다. 새로고침해도 남지만(localStorage) 다른 브라우저/기기에서는 안 보입니다.
- `factors[]`에 배점·획득점수 숫자가 없어서(`factor/value/percentile/source` 텍스트만) `factorWeights.js`의 하드코딩된 매핑으로 "산출 근거" 표를 재구성합니다. 백엔드가 factor 이름을 바꾸면 이 매핑도 같이 갱신해야 합니다.
- "세션이 만든 질문지 전체 목록" 엔드포인트가 없어서, 질문지를 생성할 때마다 `localMeta.js`에 직접 색인해서 사이드바 "설문지" 메뉴에 씁니다.
- "아이템 비교" 화면도 마찬가지로 전용 엔드포인트가 없어, 아이템별 `getDiagnosis` 호출을 프론트에서 조합해 만든 기능입니다.

## Vercel 배포

`vercel.json`에 두 가지가 설정되어 있습니다.

1. `/api/*` → `https://api.suyo-deploy.shop/api/*` 리라이트. 로컬 개발할 때 쓰는 Vite 프록시와
   같은 역할로, 배포 후에도 `realApi.js`가 상대경로(`/api/...`)로 호출하기만 하면 Vercel이
   서버 쪽에서 대신 백엔드로 넘겨줍니다. 이론상 이것으로 CORS 문제 없이 실제 API를 바로 쓸 수
   있어야 하는데, **Vercel의 리라이트가 브라우저의 `Origin` 헤더를 그대로 넘기는지는 아직
   실제 배포해서 확인하지 못했습니다.** 로컬에서는 Origin 헤더 때문에 막혀서 Vite 프록시에서
   직접 헤더를 제거해야 했는데, Vercel 리라이트는 그런 훅을 걸 수 있는 구조가 아닙니다. 만약
   배포 후에도 403이 뜨면, 백엔드 팀에 배포된 Vercel 도메인을 CORS 허용 목록에 추가해달라고
   요청해야 합니다.
2. 나머지 모든 경로 → `/index.html`. React Router로 클라이언트 사이드 라우팅을 하기 때문에,
   이 설정이 없으면 `/analyze/3/result` 같은 하위 경로를 새로고침했을 때 Vercel이 404를 냅니다.

**Vercel 프로젝트 설정 시:**
- Root Directory를 `app`으로 지정 (모노레포처럼 이 폴더만 프론트엔드 프로젝트)
- Framework Preset: Vite (자동 인식됨, Build Command `npm run build`, Output Directory `dist`)
- 배포된 사이트에서 실제 API를 기본값으로 쓰려면 Vercel 프로젝트의 Environment Variables에
  `VITE_USE_REAL_API=true` 추가 (안 하면 mock으로 배포됨 — 그것도 유효한 선택지입니다, 팀원들이
  화면 구조만 빠르게 훑어보기엔 mock이 오히려 안정적입니다)

## 알려진 미완성 부분

- 사이드바의 "아이템 비교"는 BETA 표기 그대로 — 실제 백엔드 지원 없이 프론트에서만 조합한 기능이라 정식 기능은 아닙니다.
- 실제 백엔드로 붙였을 때 결제/질문지 색인은 브라우저 localStorage 기준이라, 다른 브라우저에서 접속하면 "내 아이템" 목록엔 뜨지만 지역·업종명·결제 배지가 비어 보일 수 있습니다 (실제 점수·잠금 상태 자체는 서버 기준이라 정확합니다).
