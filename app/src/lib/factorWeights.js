// 실제 API의 factors[]에는 배점·획득점수 숫자가 없다 (factor/value/percentile 텍스트만 온다).
// DiagnosisScorer.java에 하드코딩된 지표별 배점을 그대로 옮겨와, 화면의 "산출 근거" 표를
// factor 이름 + percentile 텍스트만으로 재구성한다. 배점이 바뀌면 이 표도 같이 갱신해야 한다.
export const FACTOR_WEIGHTS = {
  '시장 규모(최근 4분기 매출)': 10,
  '5년 연평균 성장률(CAGR)': 15,
  '최근 모멘텀(최근1년-CAGR)': 5,
  '성별 쏠림': 7,
  '연령 쏠림': 7,
  '실수요 증가율(매출건수 CAGR)': 11,
  '소비패턴 안정성(주말비중)': 15,
  '지역 내 동종 업소 수': 15,
  '업종 5년 생존율': 15,
}

// 팀 피드백: "성별 쏠림", "최근 모멘텀" 같은 용어를 처음 보는 사람은 이해하기 어렵다는
// 지적 반영 — 리포트·산출 근거 화면에 한 줄 설명을 같이 보여준다.
export const FACTOR_EXPLAIN = {
  '시장 규모(최근 4분기 매출)': '최근 1년간 이 업종이 서울에서 올린 매출 규모입니다. 클수록 시장이 큽니다.',
  '5년 연평균 성장률(CAGR)': '최근 5년간 이 업종 시장이 매년 평균 얼마나 커졌는지를 나타냅니다.',
  '최근 모멘텀(최근1년-CAGR)': '최근 1년 성장세가 5년 평균보다 빨라졌는지 느려졌는지를 봅니다. 마이너스면 최근 들어 성장이 둔화된 것입니다.',
  '성별 쏠림': '고객이 특정 성별에 얼마나 쏠려 있는지입니다. 쏠림이 적을수록(수치가 낮을수록) 다양한 고객층이 이용한다는 뜻입니다.',
  '연령 쏠림': '고객이 특정 연령대에 얼마나 쏠려 있는지입니다. 쏠림이 적을수록 여러 연령대가 고르게 이용한다는 뜻입니다.',
  '실수요 증가율(매출건수 CAGR)': '매출 금액이 아니라 결제 "건수" 자체가 얼마나 늘고 있는지입니다. 실제로 이용하는 사람이 늘고 있는지를 봅니다.',
  '소비패턴 안정성(주말비중)': '평일과 주말 매출 비중이 얼마나 균형 잡혀 있는지입니다. 특정 요일에 쏠리지 않을수록 안정적이라고 봅니다.',
  '지역 내 동종 업소 수': '같은 업종 가게가 이 지역에 얼마나 있는지, 서울 평균과 비교한 값입니다. 적을수록 경쟁이 덜한 편입니다.',
  '업종 5년 생존율': '이 업종으로 창업한 가게 중 5년 뒤에도 살아남은 비율입니다. 높을수록 오래 버티기 유리한 업종입니다.',
}

// percentile 텍스트 "서울 상위 23%" → 23. LOW_SAMPLE인 "표본 적음(점포 12개)" 같은 텍스트는 매칭 안 됨(null).
export function parseUpperPercent(percentileText) {
  if (!percentileText) return null
  const match = percentileText.match(/상위\s*(\d+)%/)
  return match ? Number(match[1]) : null
}

// 획득점수 = 배점 × (1 - 상위%/100). LOW_SAMPLE 지표는 배점의 50%로 고정 (DiagnosisScorer.java와 동일).
export function computeEarned(factor) {
  const weight = FACTOR_WEIGHTS[factor.factor]
  if (weight === undefined) return null
  if (factor.confidenceStatus === 'LOW_SAMPLE') {
    return { weight, earned: Math.round(weight * 0.5 * 10) / 10, upperPercent: null }
  }
  const upperPercent = parseUpperPercent(factor.percentile)
  if (upperPercent === null) return { weight, earned: null, upperPercent: null }
  const earned = Math.round(weight * (1 - upperPercent / 100) * 10) / 10
  return { weight, earned, upperPercent }
}
