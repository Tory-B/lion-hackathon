# API 명세서

**Base URL**

- 개발: `http://localhost:8080`
- 배포: 추후 공유 (EC2)

**공통 사항**

- 모든 요청/응답 `Content-Type: application/json; charset=UTF-8`
- 로그인은 없지만 **익명 세션**을 쓴다 (2026-08-13 신규). 프론트가 최초 방문 시 UUID를 생성해 `X-Session-Id` 헤더로 매 요청에 실어 보낸다. 서버는 이 값으로 "내 아이템" 목록과 결제 크레딧 잔액을 구분한다. 헤더가 없으면 서버가 새로 발급해 응답 헤더로 내려준다 (회원가입 아님, 브라우저 단위 식별자)
- 날짜는 ISO-8601 형식
- 금액 단위는 원, 비율은 숫자(%)
- **서비스 대상 지역은 서울특별시 25개 자치구로 한정한다.** 서울 외 지역은 지원하지 않는다 (전국 데이터를 벤치마크로 대체하지 않기로 결정함 — 근거 없는 추정치를 실제 데이터처럼 보여주는 게 더 위험하다는 판단)
- **점수는 높을수록 안전(리스크 낮음)이다.** 반대로 해석하지 말 것
- **점수는 소수점이 나올 수 있다** (예: 22.3). 백분위 기반 산출이므로 정수가 아닐 수 있음 — 프론트는 반올림해서 표시하거나 소수점 한 자리까지 노출

---

# 공통 응답 형식

## 성공

```jsx
{
  "success": true,
  "data": { },
  "error": null
}
```

## 실패

```jsx
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "필수 입력값이 누락되었습니다.",
    "fields": {
      "itemName": "아이템명은 필수입니다."
    }
  }
}
```

## 에러 코드

| code | HTTP | 의미 |
| --- | --- | --- |
| VALIDATION_ERROR | 400 | 필수값 누락 또는 형식 오류 |
| NOT_FOUND | 404 | 해당 분석·질문지 없음 |
| ANALYSIS_NOT_COMPLETED | 409 | 진단이 아직 끝나지 않음 |
| NO_HYPOTHESIS | 409 | 생성할 미검증 가설이 없음 |
| LLM_ERROR | 502 | LLM 호출 실패 |
| REGION_NOT_SUPPORTED | 422 | 서울 25개 자치구 외 지역 코드로 요청 |
| INDUSTRY_NOT_SUPPORTED | 422 | 매핑된 96개 업종 밖의 industryCode로 요청 (방어용 — 정상 플로우에선 프론트가 0번 API로 받은 96개 안에서만 전송하므로 사실상 발생 안 함) |
| PAYMENT_REQUIRED | 402 | 결제(개별 또는 크레딧)가 필요한 자원에 미결제 상태로 접근 — 질문지 생성(6번)·리포트 열람에 적용 |
| INTERNAL_ERROR | 500 | 그 외 |

`LLM_ERROR`는 질문지 생성(6번) 실패뿐 아니라, `aiSummary`·`leadingQuestionCheck` 생성 실패에도 쓰인다. 단, 이 두 필드는 **부가 정보라 실패해도 진단·질문지 생성 자체는 계속 성공 처리**한다 — 필드만 `null`로 내려가고 200/201 응답은 그대로 나간다.

---

# 엔드포인트 요약

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | /api/industries | 지원 업종 목록 조회 (자동완성, 96개) |
| POST | /api/analyses | 분석 요청 생성 |
| GET | /api/analyses | 분석 목록 조회 |
| GET | /api/analyses/{id}/status | 처리 상태 조회 |
| GET | /api/analyses/{id}/diagnosis | 진단 결과 (3개 레이어) |
| GET | /api/analyses/{id}/evidence | 근거 + 미검증 가설 |
| POST | /api/analyses/{id}/questionnaires | 검증 질문지 생성 |
| GET | /api/analyses/{id}/questionnaires/{qid} | 질문지 조회 |
| POST | /api/analyses/{id}/payments | 결제 (목업, PG 연동 없음) — 신규 |
| GET | /api/credits | 내 세션의 잔여 크레딧 조회 — 신규 |

**서비스 범위는 질문지 생성까지다 (2026-08-12 확정).** 검증 결과 입력(`POST verification-results`)과 고객 점수 이력 조회(`GET customer-history`)는 만들지 않는다 — 사용자가 밖에서 인터뷰·설문을 한 뒤 그 결과를 우리 서비스에 다시 입력하는 화면·API는 범위 밖이다. 아래 8·9번 섹션은 참고용으로 남겨두되 "제외"로 표시했다.

---

# 0. 지원 업종 조회 (자동완성) — 신규 (2026-08-12)

`GET /api/industries?q={query}`

업종 검색 입력창에서 쓰는 자동완성 엔드포인트다. **서울 매출데이터와 매핑된 96개 업종만 반환한다.** 나머지 151개(전국사업체수 기준 28.3%, 주로 컨설팅·법무·설계 등 B2B)는 애초에 검색 결과에 노출하지 않는다 — 진단 결과가 반쪽만 나오는 경험 자체를 없애기 위한 결정.

## Query Parameter

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| q | String | ❌ | 검색어. 없으면 96개 전체를 대분류로 그룹핑해서 반환 |

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "groups": [
      {
        "largeCategory": "음식",
        "industries": [
          { "industryCode": "G30101", "industryName": "카페", "midCategory": "비알코올" },
          { "industryCode": "G30201", "industryName": "백반/한정식", "midCategory": "한식" }
        ]
      },
      {
        "largeCategory": "소매",
        "industries": [
          { "industryCode": "G21001", "industryName": "편의점", "midCategory": "종합 소매" }
        ]
      }
    ]
  },
  "error": null
}
```

`industryCode`를 그대로 `POST /api/analyses`의 `industryCode` 필드에 넘긴다.

---

# 1. 분석 요청 생성

`POST /api/analyses`

업종은 위 0번에서 선택한 코드를 그대로 받는다. 진단은 서버에서 동기로 처리하며 목표 응답 시간은 1분 이내다.

## Request

```jsx
{
  "itemName": "반려동물 셀프 목욕 카페",
  "industryCode": "G22001",
  "problem": "집에서 대형견 목욕시키기가 힘들다",
  "targetCustomer": "대형견을 키우는 1인 가구",
  "deliveryMethod": "오프라인 매장",
  "regionSggCode": "11260"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| itemName | String | ✅ | 아이템명. 1~200자. **업종 분류에는 쓰이지 않는다** — 결과 화면 라벨과 질문지 생성용 문맥으로만 사용 |
| industryCode | String | ✅ | 0번 API로 받은 96개 중 선택한 코드. 이 값이 업종 분류를 확정한다 (더 이상 itemName을 NLP로 유사 매칭하지 않음) |
| problem | String | ✅ | 해결하려는 문제 |
| targetCustomer | String | ✅ | 예상 고객 |
| deliveryMethod | String | ✅ | 제공 방식 (온라인/오프라인 등) |
| regionSggCode | String | ✅ | 서울 25개 자치구 코드만 허용 (예: 11260=중랑구). 서울 외 코드면 REGION_NOT_SUPPORTED 에러 |

## Response · 201 Created

```jsx
{
  "success": true,
  "data": {
    "analysisId": 12,
    "status": "COMPLETED",
    "matchedIndustry": {
      "code": "G22001",
      "name": "애완동물/애완용품 소매업",
      "matchAccuracy": "EXACT"
    },
    "diagnosisUrl": "/api/analyses/12/diagnosis",
    "createdAt": "2026-08-10T14:30:00"
  },
  "error": null
}
```

| 필드 | 타입 | 설명 |  |
| --- | --- | --- | --- |
| analysisId | Long | 이후 모든 요청에 사용 |  |
| status | String | PENDING / IN_PROGRESS / COMPLETED / FAILED |  |
| matchedIndustry.matchAccuracy | String | **항상 EXACT.** industryCode를 0번 API에서 직접 선택하므로 더 이상 근사 매칭이 필요 없음 (필드는 하위 호환을 위해 유지) |  |

---

# 2. 분석 목록 조회

`GET /api/analyses?page=0&size=20`

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "content": [
      {
        "analysisId": 12,
        "itemName": "반려동물 셀프 목욕 카페",
        "status": "COMPLETED",
        "totalScore": 66.5,
        "verdict": "경쟁 강도 보통 — 나머지는 양호",
        "createdAt": "2026-08-10T14:30:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  },
  "error": null
}
```

`status`가 COMPLETED가 아니면 `totalScore`와 `verdict`는 null이다.

---

# 3. 처리 상태 조회

`GET /api/analyses/{id}/status`

진단이 오래 걸릴 때 폴링용으로 쓴다.

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "analysisId": 12,
    "status": "IN_PROGRESS",
    "progressMessage": "경쟁 데이터를 조회하고 있습니다"
  },
  "error": null
}
```

---

# 4. 진단 결과 조회  핵심

`GET /api/analyses/{id}/diagnosis`

3개 레이어 점수와 근거를 반환한다. **화면의 메인이 되는 응답이다.**

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "analysisId": 12,
    "itemName": "반려동물 셀프 목욕 카페",
    "totalScore": 66.5,
    "verdict": "경쟁 강도 보통 — 나머지는 양호",
    "accessLevel": "PAID",
    "aiSummary": "시장은 5년간 꾸준히 커졌지만 최근 1년은 성장이 멈췄고, 중랑구는 점포당 유동인구가 서울 2위로 경쟁 부담이 적은 편입니다. 다만 업종 5년 생존율이 전산업 평균보다 낮아 경쟁 레이어가 상대적으로 가장 낮은 등급이고, 그게 종합 판정을 '보통'으로 끌어내린 주요 이유입니다.",
    "dataCoverage": "FULL",
    "layers": [
      {
        "layer": "MARKET",
        "layerName": "시장 규모·성장률",
        "score": 22.3,
        "maxScore": 30,
        "riskLevel": "LOW",
        "dataScope": "서울시 전체 집계 (자치구 단위 아님)",
        "summary": "시장은 성장했으나 최근 1년은 정체 국면입니다.",
        "factors": [
          {
            "factor": "시장 규모",
            "value": "연 2조 9,484억원",
            "percentile": "서울 63개 업종 중 상위 8%",
            "source": "서울시 상권분석서비스",
            "referenceDate": "2026년 1분기",
            "confidenceStatus": "CONFIRMED"
          },
          {
            "factor": "최근 5년 연평균 성장률",
            "value": "+4.0%",
            "percentile": "서울 상위 21%",
            "source": "서울시 상권분석서비스",
            "referenceDate": "2021~2026",
            "confidenceStatus": "CONFIRMED"
          }
        ]
      },
      {
        "layer": "CUSTOMER",
        "layerName": "고객(타겟)",
        "score": 32.0,
        "maxScore": 40,
        "riskLevel": "LOW",
        "dataScope": "서울 기준 업종 벤치마크",
        "summary": "성별·연령 쏠림이 적고, 실수요와 소비패턴도 안정적입니다.",
        "factors": [
          {
            "factor": "주 고객층",
            "value": "30대 25%, 여성 48%",
            "percentile": "서울 상위 30%",
            "source": "서울시 상권분석서비스",
            "referenceDate": "2026년 1분기",
            "confidenceStatus": "CONFIRMED"
          },
          {
            "factor": "건당 평균 결제액",
            "value": "8,177원",
            "source": "서울시 상권분석서비스",
            "referenceDate": "2026년 1분기",
            "confidenceStatus": "CONFIRMED"
          },
          {
            "factor": "실수요 증가율",
            "value": "5년간 +2.6%",
            "percentile": "서울 상위 22%",
            "source": "서울시 상권분석서비스",
            "referenceDate": "2021~2026",
            "confidenceStatus": "CONFIRMED"
          }
        ]
      },
      {
        "layer": "COMPETITION",
        "layerName": "경쟁",
        "score": 19,
        "maxScore": 30,
        "riskLevel": "MEDIUM",
        "dataScope": "해당 지역 실측",
        "summary": "경쟁 밀도는 낮은 편이나 업종 생존율이 낮습니다.",
        "factors": [
          {
            "factor": "점포당 유동인구",
            "value": "일평균 1,924명 (중랑구 카페 540개 기준)",
            "percentile": "서울 25개구 중 2위",
            "storeCount": 540,
            "source": "상가정보 + 서울시 상권분석서비스(길단위인구)",
            "referenceDate": "2026년 1분기",
            "confidenceStatus": "CONFIRMED"
          },
          {
            "factor": "업종 5년 생존율",
            "value": "27.2% (전산업 평균 36.4%)",
            "source": "국가데이터처 기업생멸행정통계",
            "referenceDate": "2023p",
            "confidenceStatus": "CONFIRMED"
          }
        ]
      }
    ],
    "createdAt": "2026-08-10T14:30:00"
  },
  "error": null
}
```

## 필드 설명

| 필드 | 값 | 프론트 처리 |
| --- | --- | --- |
| dataCoverage | FULL | 3개 레이어 모두 표시 |
|  | COMPETITION_ONLY | MARKET·CUSTOMER는 "데이터 없음" 안내 표시. **정상 플로우에선 발생하지 않는다** — industryCode를 0번 API가 반환하는 96개 안에서만 선택하게 했기 때문. 방어 로직으로만 남겨둠 |
| layers[].layer | MARKET / CUSTOMER / COMPETITION | 순서 고정 |
| layers[].score | Integer \ | **null** |
| layers[].riskLevel | LOW / MEDIUM / HIGH / UNKNOWN | 색상 구분용 |
| layers[].dataScope | String | 근거 범위. 그대로 노출 |
| factors[].value | String \ | **null** |
| factors[].confidenceStatus | CONFIRMED | 확인됨 |
|  | INSUFFICIENT_DATA | 데이터 없음 → 이게 질문지 재료가 됨 |
|  | APPROXIMATE | 근사치. 주의 표시 |
|  | LOW_SAMPLE | 표본(경쟁 밀도 계산에 쓰인 점포수 등)이 10개 미만이라 참고용. "표본이 적어 참고용" 안내 표시 |

> **중요**: `value`가 null이거나 `confidenceStatus`가 `INSUFFICIENT_DATA`인 항목은 숨기지 말고 **"이건 데이터로 알 수 없습니다"로 명시적으로 보여줘야 한다.** 이게 서비스 정체성이다.
> 

---

# 5. 근거와 미검증 가설 조회

`GET /api/analyses/{id}/evidence`

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "analysisId": 12,
    "confirmedEvidences": [
      {
        "layer": "COMPETITION",
        "factor": "지역 내 동종 업소 수",
        "value": "540개",
        "source": "소상공인시장진흥공단 상가정보",
        "referenceDate": "2026년 6월"
      }
    ],
    "unverifiedHypotheses": [
      {
        "hypothesisId": 31,
        "layer": "CUSTOMER",
        "description": "반려인이 집이 아닌 매장에서 씻길 이유가 있는가",
        "needsVerification": true
      },
      {
        "hypothesisId": 32,
        "layer": "CUSTOMER",
        "description": "회당 2만원을 낼 의사가 있는가",
        "needsVerification": true
      }
    ]
  },
  "error": null
}
```

`hypothesisId`는 질문지 생성할 때 넘겨야 한다.

---

# 6. 검증 질문지 생성

`POST /api/analyses/{id}/questionnaires`

## Request

```jsx
{
  "hypothesisIds": [31, 32],
  "type": "INTERVIEW"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| hypothesisIds | Long[] | ✅ | 5번 응답에서 받은 ID. 1개 이상 |
| type | String | ✅ | INTERVIEW / SURVEY |

## Response · 201 Created

```jsx
{
  "success": true,
  "data": {
    "questionnaireId": 7,
    "type": "INTERVIEW",
    "items": [
      {
        "itemId": 101,
        "order": 1,
        "questionText": "최근 3개월 안에 반려견을 어디서 씻기셨나요?",
        "purpose": "현재 해결 방식 확인"
      },
      {
        "itemId": 102,
        "order": 2,
        "questionText": "그때 가장 번거로웠던 순간은 언제였나요?",
        "purpose": "불편의 실체 확인"
      },
      {
        "itemId": 103,
        "order": 3,
        "questionText": "반려동물 관련해 최근 지출한 서비스와 금액을 알려주세요.",
        "purpose": "실제 지불 행동 확인"
      }
    ],
    "createdAt": "2026-08-10T14:35:00"
  },
  "error": null
}
```

질문은 **과거 경험·현재 해결 방식·발생 빈도·실제 지출**을 묻는 형태로만 생성된다. "이런 서비스가 있으면 쓰시겠습니까" 같은 유도질문은 나오지 않는다.

> **결제 게이트(신규, 2026-08-13)**: 해당 `analysisId`의 `payment_status`가 PAID가 아니면 이 엔드포인트는 `PAYMENT_REQUIRED`(402)를 내려준다. 결제 없이는 질문지를 만들 수 없다.
> 

### 유도질문 자가검증 (신규, 2026-08-12)

위 응답에 `leadingQuestionCheck` 필드가 함께 내려온다. 질문을 생성한 직후 같은 LLM 호출(또는 후속 호출)에서 **방금 만든 질문이 왜 유도질문이 아닌지를 스스로 설명**하게 한 결과다.

```jsx
"leadingQuestionCheck": {
  "passed": true,
  "summary": "'저희 카페가 생기면 오시겠어요?' 같은 미래 의향을 묻지 않고, 최근 3개월 실제 방문·지출 경험을 묻도록 구성했습니다."
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| leadingQuestionCheck.passed | Boolean | false면 자가검증 실패 — 1회 재생성 시도 후에도 false면 그대로 노출(숨기지 않음) |
| leadingQuestionCheck.summary | String | 생성된 질문 내용을 근거로 든 1~2문장. 고정 문구 아니고 질문지마다 달라짐 |

---

# 7. 질문지 조회

`GET /api/analyses/{id}/questionnaires/{questionnaireId}`

응답 형태는 6번과 동일하다.

---

# 8. (제외, 2026-08-12) ~~검증 결과 입력~~

`POST /api/analyses/{id}/verification-results` — **이번 서비스 범위에서 제외.** 서비스가 "질문지 생성까지"로 확정되면서 이 엔드포인트는 만들지 않는다. 아래 스펙은 이전 설계를 참고용으로만 남겨둔다.

~~사용자가 외부에서 인터뷰·설문한 결과를 입력하면 고객 레이어 점수가 갱신된다.~~

## Request

```jsx
{
  "questionnaireId": 7,
  "results": [
    {
      "itemId": 101,
      "responseSummary": "12명 중 10명이 집에서 씻긴다고 응답",
      "responseCount": 12,
      "keyObservation": "욕실이 좁아 불편하다는 응답이 반복됨"
    },
    {
      "itemId": 102,
      "responseSummary": "털 날림과 뒷정리를 가장 번거로워함",
      "responseCount": 12,
      "keyObservation": "목욕 자체보다 청소가 문제"
    }
  ]
}
```

| 필드 | 타입 | 필수 |
| --- | --- | --- |
| questionnaireId | Long | ✅ |
| results[].itemId | Long | ✅ |
| results[].responseSummary | String | ✅ |
| results[].responseCount | Integer | ✅ |
| results[].keyObservation | String | ❌ |

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "analysisId": 12,
    "customerScore": {
      "previous": 16,
      "updated": 27,
      "maxScore": 40
    },
    "totalScore": {
      "previous": 59,
      "updated": 70
    },
    "verdict": "검증 진행 중",
    "reason": "12명 응답으로 불편의 실체가 확인되어 고객 레이어 점수가 상승했습니다. 지불 의사는 아직 미검증 상태입니다.",
    "remainingHypotheses": [
      {
        "hypothesisId": 32,
        "description": "회당 2만원을 낼 의사가 있는가"
      }
    ]
  },
  "error": null
}
```

`previous`와 `updated`를 같이 주므로 화면에서 **변화량을 애니메이션으로 보여줄 수 있다.**

---

# 9. (제외, 2026-08-12) ~~고객 점수 갱신 이력~~

`GET /api/analyses/{id}/customer-history` — 8번과 함께 제외. 참고용으로만 남겨둔다.

## Response · 200 OK

```jsx
{
  "success": true,
  "data": [
    {
      "historyId": 3,
      "previousScore": 16,
      "updatedScore": 27,
      "reason": "12명 응답으로 불편의 실체 확인",
      "createdAt": "2026-08-10T15:00:00"
    },
    {
      "historyId": 1,
      "previousScore": null,
      "updatedScore": 16,
      "reason": "최초 진단",
      "createdAt": "2026-08-10T14:30:00"
    }
  ],
  "error": null
}
```

최신순 정렬. 전체 이력을 보존한다.

---

# 10. 결제 — 신규 (2026-08-13)

`POST /api/analyses/{id}/payments`

**요금제 — 구독 없음, 건별 결제 2종만**

| plan | 가격 | 내용 |
| --- | --- | --- |
| SINGLE | 9,900원 | 해당 analysisId 1건 즉시 해제 |
| PACK3 | 24,900원 (건당 8,300원) | 현재 건 즉시 해제 + 크레딧 2건 지급(6개월 유효), 다음 진단부터 자동 적용 |

월 구독(무제한) 옵션은 검토했다가 브다 (2026-08-13) — 정기결제·해지 로직까지 만들 여유가 없고, 건별 2종만으로도 데모엔 충분하다고 판단.

**중요: 실제 PG(카카오페이·토스페이 등) 연동은 없다.** `paymentMethod`는 UI용 목업 필드이고, 서버는 요청을 받으면 즉시 성공 처리한다.

## Request

```jsx
{
  "plan": "PACK3",
  "paymentMethod": "KAKAOPAY"
}
```

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| plan | String | ✅ | SINGLE / PACK3 |
| paymentMethod | String | ✅ | KAKAOPAY / TOSSPAY / CARD (목업, 실제 결제 없음) |

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "analysisId": 12,
    "unlocked": true,
    "plan": "PACK3",
    "amount": 24900,
    "remainingCredits": 2,
    "expiresAt": "2027-02-13T00:00:00"
  },
  "error": null
}
```

SINGLE이면 `remainingCredits`는 0, `expiresAt`은 null이다. 결제 성공 즉시 `analysis_requests.payment_status`가 PAID로 바뀌고, PACK3면 `payment_credits`에 크레딧 레코드가 생긴다.

---

# 11. 크레딧 조회 — 신규 (2026-08-13)

`GET /api/credits`

내 세션(`X-Session-Id`)의 잔여 크레딧과 만료일을 조회한다. 홈 화면 "내 아이템"에 노출해 사용자가 자기 크레딧을 인지하게 한다.

## Response · 200 OK

```jsx
{
  "success": true,
  "data": {
    "remainingCredits": 2,
    "expiresAt": "2027-02-13T00:00:00"
  },
  "error": null
}
```

크레딧이 없거나 만료되었으면 `remainingCredits: 0, expiresAt: null`.

**새 진단 생성 시 자동 차감**: `POST /api/analyses` 호출 시 세션에 유효 크레딧이 있으면 서버가 자동으로 1건 차감하고 해당 분석을 즉시 `payment_status=PAID`로 생성한다. 프론트가 따로 호출할 필요 없음.

---

# 프론트가 챙겨야 할 것 5가지

## 1. null을 숨기지 말 것

`score`나 `value`가 null인 건 **버그가 아니라 의도된 상태**다. "데이터로 확인 불가"로 명시해야 한다. 이게 서비스의 핵심 메시지다.

## 2. dataCoverage 분기

`COMPETITION_ONLY`면 시장·고객 레이어를 비우고 "이 업종은 서울 매출 데이터와 매핑되지 않아 시장·고객 데이터를 제공하지 않습니다" 안내를 띄운다. (서비스 전체가 서울 대상이므로 지역 사유로 COMPETITION_ONLY가 나오는 경우는 없다)

## 3. matchAccuracy 표시

`APPROXIMATE`면 `notice` 문구를 결과 상단에 노출한다. 어떤 업종 기준으로 조회했는지 사용자가 알아야 한다.

## 4. 점수는 진단 시점에 이미 최종값이다 (2026-08-13 v3, 구버전 헤딩말 아래 내용 전체 무효)

"검증하면 몇 점까지 오를 수 있는지"를 미리 계산만 해서 보여주는 값이다. 사용자가 실제로 질문지 응답을 입력해도 이 앱 안에서 점수가 오르는 일은 없다 — 질문지 생성까지가 서비스 범위이기 때문. 화면 문구도 "~까지 오를 수 있습니다"(가능성) 톤으로 쓰고, "입력하면 갱신됩니다"처럼 실제 동작을 약속하는 문구는 쓰지 않는다.

## 5. accessLevel 게이팅 (신규, 2026-08-13)

`accessLevel: "FREE"`면 화면에서 레이어 상세·근거·AI 종합진단을 블러·잠금 UI로 가려야 한다. 총점·판정은 FREE에서도 그대로 보여준다 — "점수는 나왔는데 이유를 모른다"가 블라인드 화면의 핵심 메시지이기 때문. 질문지 생성(6번)은 FREE 상태에서 호출하면 `PAYMENT_REQUIRED`(402)가 난다.

---

# 화면 흐름

```jsx
①  입력 폼
      POST /api/analyses
          ↓
②  진단 결과 화면
      GET /api/analyses/{id}/diagnosis
      GET /api/analyses/{id}/evidence
          ↓
③  "질문지 만들기" 클릭
      POST /api/analyses/{id}/questionnaires
          ↓
④  결제 화면 (레이어 상세·근거·질문지·리포트가 잠겨 있을 때만 거침 — 무료는 총점만 보고 바로 ④로 가도 됨)
      POST /api/analyses/{id}/payments   ← 신규, PG 연동 없는 목업
          ↓
⑤  질문지 생성
      POST /api/analyses/{id}/questionnaires
          ↓
⑥  질문지 화면 (복사·공유)
          ↓
      여기서 서비스 끝. 사용자는 이 질문지를 들고 나가서
      직접 인터뷰·설문을 진행한다 (서비스 범위 밖, 2026-08-12 확정)
```

**①~③는 무료로 도달한다** (총점·판정까지). 레이어 상세·근거·AI 종합진단·질문지·리포트는 **④에서 결제해야** 이어진다.

---

# 부록 · 점수와 등급 해석 (2026-08-11 확정)

프론트가 화면을 만들 때 반드시 알아야 하는 내용.

## 점수는 백분위 기반이다

각 지표를 **서울 전체 분포에서 몇 등인지(백분위)로 환산해서** 점수를 매긴다.

```
지표 점수 = (백분위 순위 / 100) × 지표 배점
```

이 때문에 **점수에 소수점이 나온다.** `22.3`, `56.8` 같은 값이 정상이다. 반올림해서 보여줘도 되고 소수점 한 자리까지 노출해도 되지만, **정수만 올 거라고 가정하고 파싱하면 안 된다.**

## riskLevel 경계값

2,395개 조합(매핑 가능 업종 × 25개 자치구)을 실제 계산해서 나온 분포의 3분위(P33/P67)를 경계로 쓴다.

| 레이어 | HIGH (위험) | MEDIUM (보통) | LOW (안전) |
| --- | --- | --- | --- |
| MARKET (30점) | < 15.6 | 15.6 ~ 21.6 | ≥ 21.6 |
| CUSTOMER (40점, 2026-08-13 v3) | < 18.9 | 18.9 ~ 24.9 | ≥ 24.9 |
| COMPETITION (30점) | < 9.2 | 9.2 ~ 14.5 | ≥ 14.5 |
| 총점 (100점 기준, 2026-08-13 v3) | < 48.0 | 48.0 ~ 57.9 | ≥ 57.9 |

**중요**: 이 등급은 **"서울 안에서의 상대적 위치"**다. LOW가 "절대적으로 안전한 사업"이라는 뜻이 아니라 "다른 업종·지역 조합과 비교했을 때 상위 1/3"이라는 의미다. **화면 문구도 이 뉘앙스로 써야 한다** — "안전합니다"가 아니라 "서울 평균보다 나은 편입니다" 쪽이 정확하다.

## CUSTOMER도 이제 40점 전부 데이터다 (2026-08-13 v3, 아래 구버전 내용 무효)

고객 레이어 40점 중 **12점은 검증 전용**이라 초기 진단에서는 0이다. 따라서:

- 초기 진단 직후 CUSTOMER 점수는 **아무리 좋아도 28을 못 넘는다**
- 이건 버그가 아니라 의도된 설계다. 화면에서 "고객 검증 부족"으로 안내해야 한다
- **이 12점을 실제로 채워주는 기능은 없다(2026-08-12 확정).** 서비스는 질문지 생성까지이고, 검증 결과를 다시 입력받아 점수를 갱신하는 화면·API는 만들지 않는다. 대신 `diagnosis` 응답의 `projectedCustomerScore`로 "검증하면 최대 몇 점까지 오를 수 있는지"만 미리 계산해서 보여준다

| 검증 상태 | 추가 점수 |
| --- | --- |
| 검증 없음 (초기) | 0 |
| 응답 10건 이상 + 가설 1개 검증 | 4 |
| 응답 30건 이상 + 가설 2개 검증 | 8 |
| 응답 50건 이상 + 전체 가설 검증 | 12 |

응답이 부정적이어도 점수는 오른다. 검증은 검증이기 때문. 부정적 결과는 `verdict` 문구로 전달된다.

> **(2026-08-13 v3) 위 표는 폐기되었다.** 기존 4개 데이터 지표(성별분산·연령분산·실수요증가율·소비패턴안정성)의 배점을 7/7/11/15(합계 40)로 비례 확대해서 CUSTOMER도 초기 진단에서 40점 전부 나온다. "검증 상태별 추가 점수" 개념 자체가 없고, `verdict`도 더 이상 "고객 검증 부족" 고정 문구가 아니라 세 레이어 중 가장 낮은 등급을 집어 설명하는 문구로 대체된다.
> 

## factors에 percentile 필드가 추가됐다

각 근거 항목에 실제값(`value`)과 함께 **백분위(`percentile`)**를 같이 준다.

```jsx
{
  "factor": "최근 5년 연평균 성장률",
  "value": "+4.0%",
  "percentile": "서울 상위 21%",
  "source": "서울시 상권분석서비스",
  "confidenceStatus": "CONFIRMED"
}
```

`value`만 보여주면 "+4.0%가 좋은 건가?"를 사용자가 판단 못 한다. **둘 다 같이 노출하는 걸 권장한다.**

## LOW_SAMPLE 처리 (신규)

`confidenceStatus`에 **`LOW_SAMPLE`** 값이 추가됐다.

전체 6,004개 (업종×자치구) 조합 중 **23.2%가 점포수 10개 미만**이다. 분모가 작으면 비율이 크게 튄다(3개→6개면 2배). 이 경우:

- `confidenceStatus: "LOW_SAMPLE"`로 내려간다
- 점수는 중앙값으로 보정해서 산출한다
- 화면에 **"해당 지역의 이 업종 점포가 N개뿐이라 참고용입니다"**를 반드시 표시해야 한다

`APPROXIMATE`(유사 업종으로 근사 매칭)와는 다른 의미다. 섞어서 처리하면 안 된다.

| 값 | 의미 | 화면 처리 |
| --- | --- | --- |
| `CONFIRMED` | 데이터로 확인됨 | 정상 표시 |
| `INSUFFICIENT_DATA` | 데이터로 확인 불가 | "확인 불가" 명시 (숨기지 말 것) |
| `APPROXIMATE` | 유사 업종 기준 근사치 | 어떤 업종 기준인지 안내 |
| `LOW_SAMPLE` | 표본(점포수)이 적어 불안정 | 실제 점포수와 함께 참고용임을 안내 |