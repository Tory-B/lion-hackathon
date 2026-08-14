# ERD 설계서

> ERDCloud에 그릴 때 보고 작업하는 문서. 테이블 **15개** (공공데이터 **6** + 서비스 9).
> 

> 
> 

> 2026-08-11 갱신: `population_by_sgg`(자치구별 인구) 테이블 추가됨.
> 

> 
> 

> 2026-08-13 갱신: `payment_credits`(결제 크레딧) 테이블 추가, `analysis_requests`에 `session_id`/`payment_status` 컬럼 추가. 구독(월무제한) 요금제는 검토 후 제외했고 1회(SINGLE)/3회(PACK3) 단건 결제만 지원한다.
> 

> 
> 

> **서비스 대상 지역은 서울특별시로 확정함.** L1/L2가 서울 데이터밖에 없어서 지역을 맞춤 것이며, 이에 맞춰 store_counts_by_sgg도 전국에서 서울만 남기고 축소함.
> 

---

# 전체 구조

```jsx
【공공데이터 구역】  — 읽기 전용, CSV로 1회 적재

  industry_codes (업종 마스터 247)
       │
       ├─◁ store_counts_by_sgg   (업종×자치구 점포수 6,004 · 서울만)
       └─◁ industry_code_mapping (서울매출↔상가업종 96)
                 │
                 ▽ (industry_name 로 연결, FK 아님)
       seoul_sales_quarterly (서울 분기매출 1,323)

  industry_survival_rates (생존율 11)
       ▽ (large_code 로 연결, FK 아님)

  population_by_sgg (자치구별 인구 525)
       ▽ (sgg_code 로 store_counts_by_sgg와 연결, FK 아님)

【서비스 구역】  — JPA 관리

  analysis_requests (분석 요청)
       │
       ├─◁ diagnosis_results (진단 결과)
       │        ├─◁ layer_evidences        (레이어별 근거)
       │        └─◁ unverified_hypotheses (미검증 가설)
       │                  │
       ├─◁ questionnaires (질문지) ◁──┘
       │        └─◁ questionnaire_items (질문 문항)
       │                  │
       │             verification_results (검증 결과)
       │
       └─◁ customer_score_history (고객 점수 이력)

  payment_credits (결제 크레딧)  ┄┄ session_id ┄┄ analysis_requests
```

---

# 1. 공공데이터 테이블 (5개)

앞으로 바뀌지 않는 참조 데이터. 서비스가 읽기만 한다.

## industry_codes · 업종 마스터

사용자가 "반려동물 카페"라고 입력하면 LLM이 이 테이블을 보고 업종코드를 찾는다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| small_code | VARCHAR(10) | **PK** · 소분류코드 (I21201) |
| small_name | VARCHAR(100) | 소분류명 (카페) |
| mid_code | VARCHAR(10) | 중분류코드 (I212) |
| mid_name | VARCHAR(100) | 중분류명 |
| large_code | VARCHAR(10) | 대분류코드 (I2) |
| large_name | VARCHAR(100) | 대분류명 |
| national_count | INTEGER | 전국 사업체 수 |

## store_counts_by_sgg · 업종×자치구 점포 수

L3 경쟁 레이어의 핵심. **서울특별시 25개 자치구** (서비스 타겟을 서울로 확정하면서 전국 55,807행에서 서울만 필터링함)

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| small_code | VARCHAR(10) | **FK → industry_codes** |
| small_name | VARCHAR(100) | 조회 편의용 중복 저장 |
| sido_code / sido_name | VARCHAR | 시도 |
| sgg_code / sgg_name | VARCHAR | 시군구 |
| store_count | INTEGER | 사업체 수 |

**유니크 제약**: (small_code, sgg_code)

## seoul_sales_quarterly · 서울 분기 매출

L1 시장 + L2 고객을 동시에 채운다. **63개 업종 × 21분기(2021–2026)**

| 컬럼 | 타입 | 쓰는 곳 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| industry_code | VARCHAR(20) | 서울시 서비스업종코드 |
| industry_name | VARCHAR(100) | 예: 커피-음료 |
| quarter | VARCHAR(6) | 20261 |
| sales_amount | BIGINT | **L1** 시장 규모·성장률 |
| sales_count | BIGINT | **L1/L2** 실제 결제 건수 |
| male_amount / female_amount | BIGINT | **L2** 성별 구성 |
| age10~age60_amount | BIGINT | **L2** 연령대 구성 (6개) |
| weekday / weekend_amount | BIGINT | **L2** 구매 패턴 |

**유니크 제약**: (industry_code, quarter)

## industry_code_mapping · 업종 연결표

서울매출(63개)과 상가정보(247개)는 코드 체계가 달라서 이름으로 연결했다. **1:N**

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| sales_industry_name | VARCHAR(100) | 한식음식점 |
| sales_industry_code | VARCHAR(20) | CS100001 |
| small_code | VARCHAR(10) | **FK → industry_codes** · 유니크 |
| small_name | VARCHAR(100) | 백반/한정식 |
| mid_name | VARCHAR(100) | 한식 |
| national_count | INTEGER | 전국 사업체 수 |

## industry_survival_rates · 생존율

대분류 단위 11행. L3 경쟁 레이어 보강.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| large_code | VARCHAR(10) | 상가업종 대분류 · 전산업행은 NULL |
| large_name | VARCHAR(100) | 음식 |
| stat_industry | VARCHAR(100) | 숙박·음식점업 |
| survival_1y / survival_5y | NUMERIC(4,1) | 1년·5년 생존율 (%) |
| closure_rate | NUMERIC(4,1) | 소멸률 (%) |
| base_year / source | VARCHAR | 2023p / 출처 |

## population_by_sgg · 자치구별 인구 (신규)

**서울 25개구 × 21분기 = 525행.** 출처: 서울시 상권분석서비스(길단위인구·상주인구·직장인구 행정동)를 자치구로 집계.

L3 경쟁 레이어의 **점포당 유동인구** 산출에 사용.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| sgg_code / sgg_name | VARCHAR | 자치구 (store_counts_by_sgg와 동일 체계) |
| quarter | VARCHAR(6) | 20211~20261 |
| flow_total | BIGINT | **L3** 유동인구 (분기 누적, 일평균은 ÷90) |
| flow_male / flow_female | BIGINT | 유동인구 성별 |
| flow_age10~age60 | BIGINT | 유동인구 연령대 (6개) |
| resident_total | BIGINT | 상주인구 · **연 1회만 갱신**되므로 성장률 계산 금지 |
| household_total / apt / nonapt | BIGINT | 가구수 (전체·아파트·비아파트) |
| worker_total | BIGINT | 직장인구 (오피스 상권 판별용) |

**유니크 제약**: (sgg_code, quarter)

**검증**: 2026년 1분기 상주인구 합계 9,360,421명 — 서울시 실제 인구와 일치

---

# 2. 서비스 테이블 (9개)

## analysis_requests · 분석 요청  ← 모든 것의 시작점

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| item_name | VARCHAR(200) | 아이템명 (필수) |
| problem | TEXT | 해결하려는 문제 |
| target_customer | TEXT | 예상 고객 |
| delivery_method | TEXT | 제공 방식 |
| region_sgg_code | VARCHAR(10) | **NOT NULL** · 서울 25개 자치구 코드만 허용 (CHECK 제약) |
| matched_code | VARCHAR(10) | LLM이 매핑한 업종코드 |
| match_accuracy | VARCHAR(20) | EXACT / APPROXIMATE |
| session_id | VARCHAR(64) | 신규(2026-08-13) · 비로그인 익명 세션 식별자 (브라우저 발급 UUID, X-Session-Id 헤더) · 내 아이템 목록·결제 크레딧 조회에 사용 |
| payment_status | VARCHAR(20) | 신규(2026-08-13) · FREE / PAID · PAID면 진단 결과 상세(factors/summary/aiSummary)와 질문지 생성이 열림 |
| status | VARCHAR(20) | PENDING / IN_PROGRESS / COMPLETED / FAILED |
| created_at | TIMESTAMP |  |

## diagnosis_results · 진단 결과

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| analysis_id | BIGINT | **FK → analysis_requests** (1:1) |
| total_score | INTEGER | 100점 만점 |
| market_score | INTEGER | L1 (30점) · 업종이 서울 매출데이터와 매핑 안 되면 **NULL** (247개 소분류 중 96개만 매핑, 커버리지 72%) |
| customer_score | INTEGER | L2 (40점) · 위와 동일한 사유로 **NULL** 가능 |
| competition_score | INTEGER | L3 (30점) · 서울 247개 소분류 전체 커버라 항상 존재 |
| verdict | VARCHAR(100) | 고객 검증 부족 |
| data_coverage | VARCHAR(50) | FULL / COMPETITION_ONLY |
| created_at | TIMESTAMP |  |

> `market_score`와 `customer_score`가 **NULL을 허용하는 게 핵심**이다. 서비스 전체가 서울로 통일되어 있으므로 지역 사유의 NULL은 없고, **업종이 서울 매출데이터(63개 업종)와 매핑되지 않을 때만** 이 두 레이어를 비워둔다.
> 

## layer_evidences · 레이어별 근거

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| diagnosis_id | BIGINT | **FK → diagnosis_results** |
| layer | VARCHAR(20) | MARKET / CUSTOMER / COMPETITION |
| factor | VARCHAR(200) | "최근 5년 연평균 성장률" |
| value | VARCHAR(200) | "+4.1%" |
| source | VARCHAR(200) | "서울시 상권분석서비스" |
| reference_date | VARCHAR(50) | "2026년 1분기" |
| confidence_status | VARCHAR(30) | CONFIRMED / INSUFFICIENT_DATA / APPROXIMATE |

## unverified_hypotheses · 미검증 가설

대부분 L2 고객 레이어에서 나온다. 이게 질문지의 재료가 된다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| diagnosis_id | BIGINT | **FK → diagnosis_results** |
| layer | VARCHAR(20) | 주로 CUSTOMER |
| description | TEXT | "주민이 무엇에 불편을 느끼는지" |
| needs_verification | BOOLEAN | 기본 TRUE |

## questionnaires · 질문지

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| analysis_id | BIGINT | **FK → analysis_requests** |
| hypothesis_id | BIGINT | **FK → unverified_hypotheses** (nullable) |
| type | VARCHAR(20) | INTERVIEW / SURVEY |
| leading_question_check_passed | BOOLEAN | **신규(2026-08-12)** · LLM이 생성된 질문을 스스로 검증한 결과 |
| leading_question_check_summary | TEXT | **신규(2026-08-12)** · 왜 유도질문이 아닌지에 대한 LLM의 1~2문장 자가설명 |
| created_at | TIMESTAMP |  |

## questionnaire_items · 질문 문항

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| questionnaire_id | BIGINT | **FK → questionnaires** |
| question_text | TEXT | 질문 내용 |
| purpose | TEXT | 이 질문이 검증하려는 것 |
| sort_order | INTEGER | 순서 |

## verification_results · 검증 결과 (설계만, API 미구현 — 2026-08-12)

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| questionnaire_id | BIGINT | **FK → questionnaires** |
| item_id | BIGINT | **FK → questionnaire_items** (nullable) |
| response_summary | TEXT | 응답 요약 |
| response_count | INTEGER | 응답 수 |
| key_observation | TEXT | 핵심 관찰 |
| created_at | TIMESTAMP |  |

## customer_score_history · 고객 점수 이력

전체 이력을 보존한다 (덮어쓰지 않음).

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| analysis_id | BIGINT | **FK → analysis_requests** |
| previous_score | INTEGER | 반영 전 |
| updated_score | INTEGER | 반영 후 |
| reason | TEXT | 어떤 응답이 변화를 만들었는지 |
| created_at | TIMESTAMP |  |

## payment_credits · 결제 크레딧 (신규, 2026-08-13)

구독(월무제한) 요금제는 검토 후 제외했다. 세션당 크레딧을 사서 진단 상세·질문지를 건별로 여는 구조.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | BIGSERIAL | **PK** |
| session_id | VARCHAR(64) | 익명 세션 식별자 · FK 아님, analysis_requests.session_id와 값으로 연결 |
| plan | VARCHAR(20) | SINGLE / PACK3 |
| amount | INTEGER | 결제 금액(원) · SINGLE 9,900 / PACK3 24,900 |
| credits_total | INTEGER | 구매 시 부여된 크레딧 수 · SINGLE 1 / PACK3 3 |
| credits_remaining | INTEGER | 남은 크레딧 수 · 진단 1건 열람 = 1 차감 |
| expires_at | TIMESTAMP | 유효기간 만료 시각 · 구매일 + 6개월 |
| created_at | TIMESTAMP |  |

---

# 3. 관계 정리 (ERDCloud에서 선 그을 때)

| 부모 | 자식 | 관계 | 삭제 규칙 |
| --- | --- | --- | --- |
| industry_codes | store_counts_by_sgg | 1:N | RESTRICT |
| industry_codes | industry_code_mapping | 1:1 | RESTRICT |
| analysis_requests | diagnosis_results | 1:1 | CASCADE |
| analysis_requests | questionnaires | 1:N | CASCADE |
| analysis_requests | customer_score_history | 1:N | CASCADE |
| diagnosis_results | layer_evidences | 1:N | CASCADE |
| diagnosis_results | unverified_hypotheses | 1:N | CASCADE |
| unverified_hypotheses | questionnaires | 1:N | SET NULL |
| questionnaires | questionnaire_items | 1:N | CASCADE |
| questionnaires | verification_results | 1:N | CASCADE |
| questionnaire_items | verification_results | 1:N | CASCADE |

## FK를 걸지 않는 연결 (점선으로 표시)

코드 체계가 다르거나 마스터 테이블이 없어 애플리케이션에서 조인한다.

- `industry_code_mapping.sales_industry_name` ↔ `seoul_sales_quarterly.industry_name`
- `industry_codes.large_code` ↔ `industry_survival_rates.large_code`
- `population_by_sgg.sgg_code` ↔ `store_counts_by_sgg.sgg_code` (자치구 마스터 테이블이 따로 없음. 점포당 유동인구 계산에 쓰임)
- `payment_credits.session_id` ↔ `analysis_requests.session_id` (여러 분석 요청이 같은 세션의 크레딧을 공유. FK 아님, 세션 기준 조회)

---

# 4. 인덱스

| 테이블 | 인덱스 | 왜 |
| --- | --- | --- |
| industry_codes | small_name, large_code | 업종명 검색, 생존율 조인 |
| store_counts_by_sgg | (small_code, sgg_code) UK | 업종+지역 단건 조회 |
| store_counts_by_sgg | small_code / sgg_code / sido_code | 집계 쿼리 |
| seoul_sales_quarterly | (industry_code, quarter) UK | 시계열 조회 |
| seoul_sales_quarterly | industry_name | 매핑표와 조인 |
| analysis_requests | created_at DESC | 목록 최신순 |
| diagnosis_results | analysis_id | 조인 |
| customer_score_history | (analysis_id, created_at DESC) | 이력 조회 |