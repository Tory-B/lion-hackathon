# suyo · 프론트엔드

창업 아이템을 입력하면 서울 25개 자치구 공공데이터 기반 백분위 점수로 시장·고객·경쟁 3개 레이어를 진단하고, 데이터로 확인 안 되는 부분은 검증 질문지로 만들어주는 서비스의 프론트엔드입니다.

React 19 + Vite + Tailwind CSS v4. 백엔드는 아직 데이터/서버가 완전히 준비되지 않아, 실제 API 응답과 동일한 형태로 만든 **mock API 레이어** 위에서 동작합니다.

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

## 지금 상태

- **로그인 없음** — 실제 백엔드처럼 `X-Session-Id`를 브라우저에 UUID로 발급해 흉내만 냅니다 (`src/lib/session.js`).
- **데이터는 전부 mock** — 실제 서울 공공데이터가 아니라 시드 기반 랜덤값입니다. 새로고침해도 같은 입력이면 같은 결과가 나오지만, 실제 서울시 상권분석서비스 값은 아닙니다.
- **결제는 실제로 이루어지지 않습니다** — 버튼을 누르면 바로 성공 처리되는 목업입니다.
- 화면·데이터 구조는 [`suyo_BE`](https://github.com/mooyoung2/suyo_BE) 백엔드 레포의 실제 API 응답 형태(DTO, 에러 코드, 접근 레벨 게이팅 등)를 그대로 따라 만들었습니다. 자세한 내용은 아래 "실제 백엔드로 교체하기" 참고.

## 화면 흐름

```
랜딩(/) → 온보딩 모달(업종·지역·문제 입력)
  → 진단 중(/analyze/:id/progress)
  → 진단 결과(/analyze/:id/result)  ─ FREE: 총점만 / PAID: 레이어 상세
       ├─ 결제(/analyze/:id/payment)
       ├─ 질문지 만들기(/analyze/:id/questionnaire)
       └─ 리포트(/analyze/:id/report)
대시보드(/home) — 내가 진단한 아이템 목록
```

검증 결과를 다시 입력해서 점수를 갱신하는 화면은 없습니다 — 실제 서비스 범위가 "질문지 생성까지"로 확정되어 있기 때문입니다 (백엔드 팀 API 명세서 기준).

## 디렉터리 구조

```
src/
  api/mockApi.js        실제 API 엔드포인트와 1:1 대응하는 mock 함수들
  lib/
    diagnosisEngine.js   진단 점수 mock 생성 (실제 DiagnosisScorer.java 배점 그대로)
    riskGrader.js        점수 → LOW/MEDIUM/HIGH 등급 (실제 RiskGrader.java 임계값 그대로)
    factorWeights.js     factor 이름 → 배점 매핑 (API에 없는 값이라 화면용으로 하드코딩)
    localMeta.js         지역·업종명·결제상태를 브라우저에만 저장 (API 응답에 없어서)
    questionnaireEngine.js  질문지 문항 mock 생성
    session.js            X-Session-Id 발급/보관
  data/                  업종·자치구 mock 목록
  context/AppContext.jsx  화면에서 쓰는 API 훅
  components/            공통 UI, 레이아웃, 온보딩 모달
  pages/                  화면별 컴포넌트
```

## 실제 백엔드로 교체하기

`src/api/mockApi.js`의 각 함수(`getIndustries`, `createAnalysis`, `getDiagnosis` 등)를 실제 `fetch` 호출로 바꾸면 됩니다. 함수 시그니처와 반환 형태를 실제 API 응답 DTO와 동일하게 맞춰뒀기 때문에, 호출하는 쪽(`AppContext.jsx`, 각 페이지)은 수정할 필요가 거의 없습니다.

주의할 점:
- 백엔드 CORS 기본 설정에 `http://localhost:5173`이 이미 포함되어 있어 별도 설정 없이 붙습니다.
- 모든 요청에 `X-Session-Id` 헤더를 실어 보내야 합니다 (`src/lib/session.js`의 값 사용).
- 진단 응답에는 지역·업종명이 없습니다 (`itemName`만 옵니다). `localMeta.js`로 프론트에서 보충하고 있으니, 실제 연동 후에도 이 부분은 그대로 두거나 백엔드에 필드 추가를 요청해야 합니다.
- `factors[]`에 배점·획득점수 숫자가 없어서 `factorWeights.js`의 하드코딩된 매핑으로 화면의 "산출 근거" 표를 재구성합니다. 백엔드가 factor 이름을 바꾸면 이 매핑도 같이 갱신해야 합니다.

## 알려진 미완성 부분

- 사이드바의 "아이템 비교(BETA)" — 아직 기능 없음
- 잘못된 URL(존재하지 않는 analysisId 등) 접근 시 에러 화면 없음
- 모바일 좁은 화면 실제 점검 미완료
